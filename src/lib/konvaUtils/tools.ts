import { get, writable, type Unsubscriber } from "svelte/store";
import { type Stage } from "konva/lib/Stage.js";
import { Line } from "konva/lib/shapes/Line.js";
import type { Layer } from "konva/lib/Layer.js";
import type { Vector2d } from "konva/lib/types.js";
import { Arrow } from "konva/lib/shapes/Arrow.js";
import { Text } from "konva/lib/shapes/Text.js";
import { Rect } from "konva/lib/shapes/Rect.js";
import { Ellipse } from "konva/lib/shapes/Ellipse.js";
import { Star } from "konva/lib/shapes/Star.js";
import { RegularPolygon } from "konva/lib/shapes/RegularPolygon.js";
import { Shape } from "konva/lib/Shape.js";
import { Transformer } from "konva/lib/shapes/Transformer.js";
import type { Node, NodeConfig } from "konva/lib/Node.js";
import { Util } from "konva/lib/Util.js";

const STROKE_WIDTH = 5;

type Tool =
    | "select"
    | "pen"
    | "eraser"
    | "arrow"
    | "text"
    | "image"
    | "line"
    | "box"
    | "circle"
    | "triangle"
    | "diamond"
    | "hexagon"
    | "star"
    | "heart";

export let selectedTool = writable<Tool>("select");
export let selectedColor = writable<string>("#000000");

let colorSubscription: Unsubscriber;

const resetStage = (stage: Stage, selectTool: "select" | null = null) => {
    stage.off();
    document.body.style.cursor = "default";
    // registerDefaultEvents(canvas);
    if (selectTool) {
        selectedTool.set(selectTool);
    }
}

export const selectTool = (stage: Stage, layer: Layer, tool: Tool) => {
    resetStage(stage);
    selectedTool.set(tool);
    enableDraggable(layer, tool === "select")
    // if (colorSubscription) colorSubscription();
    // colorSubscription = selectedColor.subscribe((color) => {
    //     const selectedObjects = canvas.getActiveObjects();
    //     selectedObjects.forEach((obj) => {
    //         obj.set({ stroke: color });
    //         canvas.renderAll();
    //     });
    //     if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.color = color;
    //     canvas.requestRenderAll();
    // });
    switch (tool) {
        case "select":
            activateSelect(stage, layer)
            break;
        case "pen":
            activateFreeDrawing(stage, layer, "brush")
            break;
        case "eraser":
            activateFreeDrawing(stage, layer, "eraser")
            break;
        case "arrow":
            activateArrow(stage, layer)
            break;
        case "text":
            activateText(stage, layer)
            break;
        case "image":
            break;
        case "line":
            activateLine(stage, layer);
            break;
        case "box":
            activateRect(stage, layer);
            break;
        case "circle":
            activateCircle(stage, layer);
            break;
        case "triangle":
            activatePolygon(stage, layer, 3)
            break;
        case "diamond":
            activatePolygon(stage, layer, 4)
            break;
        case "hexagon":
            activatePolygon(stage, layer, 6)
            break;
        case "star":
            activateStar(stage, layer);
            break;
        case "heart":
            activateHeart(stage, layer)
            break;
        default:
            break;
    }
}

function activateSelect(stage: Stage, layer: Layer) {
    let x1: number | undefined, y1: number | undefined, x2: number | undefined, y2: number | undefined;
    let selecting = false;
    const selectionRectangle = new Rect({
        fill: 'rgba(0,0,255,0.5)',
        visible: false,
        listening: false,
    });
    layer.add(selectionRectangle)

    // Drag selection
    stage.on('mousedown touchstart', (e) => {
        // do nothing if we mousedown on any shape
        if (e.target !== stage) {
            return;
        }
        e.evt.preventDefault();
        x1 = stage.getPointerPosition()?.x;
        y1 = stage.getPointerPosition()?.y;
        x2 = stage.getPointerPosition()?.x;
        y2 = stage.getPointerPosition()?.y;

        selectionRectangle.width(0);
        selectionRectangle.height(0);
        selecting = true;
    });
    stage.on('mousemove touchmove', (e) => {
        // do nothing if we didn't start selection
        if (!selecting) {
            return;
        }
        e.evt.preventDefault();
        x2 = stage.getPointerPosition()?.x;
        y2 = stage.getPointerPosition()?.y;
        if (!x1) return;
        if (!x2) return;
        if (!y1) return;
        if (!y2) return;
        selectionRectangle.setAttrs({
            visible: true,
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
        });
    });
    stage.on('mouseup touchend', (e) => {
        // do nothing if we didn't start selection
        selecting = false;
        if (!selectionRectangle.visible()) {
            return;
        }
        e.evt.preventDefault();
        // update visibility in timeout, so we can check it in click event
        selectionRectangle.visible(false);
        var shapes = stage.find('.shape');
        var box = selectionRectangle.getClientRect();
        var selected = shapes.filter((shape) =>
            Util.haveIntersection(box, shape.getClientRect())
        );
        selectNodes(layer, selected)
    });

    // Click selection deselection
    stage.on('click tap', (e) => {
        if (selectionRectangle.visible()) {
            return;
        }
        const clickedTarget = e.target;
        if (clickedTarget === stage) {
            deselectEverything(layer)
            return;
        }
        if (clickedTarget.getParent()?.className === 'Transformer') {
            return;
        }
        selectNodes(layer, [clickedTarget])
    });
}

function activateFreeDrawing(stage: Stage, layer: Layer, mode: "brush" | "eraser") {
    if (mode === "eraser") deselectEverything(layer)
    document.body.style.cursor = "crosshair";
    let isPaint = false;
    let lastLine: Line;
    stage.on('mousedown touchstart', function (e) {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        const pos = stage.getPointerPosition();
        if (!pos) return
        lastLine = new Line({
            name: 'shape',
            stroke: get(selectedColor),
            strokeWidth: mode === 'brush' ? 5 : 30,
            globalCompositeOperation: mode === 'brush' ? 'source-over' : 'destination-out',
            lineCap: 'round',
            lineJoin: 'round',
            points: [pos.x, pos.y, pos.x, pos.y],
        });
        layer.add(lastLine);
    })
    stage.on('mouseup touchend', function () {
        if (!isPaint) return;
        isPaint = false;
        if (mode == "brush") {
            selectNodes(layer, [lastLine])
        }
    });
    stage.on('mousemove touchmove', function (e) {
        if (!isPaint) return;
        // prevent scrolling on touch devices
        e.evt.preventDefault();
        const pos = stage.getPointerPosition();
        if (!pos) return
        const newPoints = lastLine.points().concat([pos.x, pos.y]);
        lastLine.points(newPoints);
    });
}

function activateArrow(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: Arrow;

    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        previewShape = new Arrow({
            points: [startPos.x, startPos.y],
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        const pos = stage.getPointerPosition();
        if (!pos) return
        if (!startPos) return
        previewShape.points([startPos.x, startPos.y, pos.x, pos.y]);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        previewShape.destroy();
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return

        const arrow = new Arrow({
            name: 'shape',
            points: [startPos.x, startPos.y, endPos.x, endPos.y],
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(arrow);
        selectNodes(layer, [arrow])
    })
}

function activateLine(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: Line;

    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        previewShape = new Line({
            points: [startPos.x, startPos.y],
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        const pos = stage.getPointerPosition();
        if (!pos) return
        if (!startPos) return
        previewShape.points([startPos.x, startPos.y, pos.x, pos.y]);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        previewShape.destroy();
        endPos = stage.getPointerPosition();
        if (!startPos) return;
        if (!endPos) return;
        const line = new Line({
            name: 'shape',
            points: [startPos.x, startPos.y, endPos.x, endPos.y],
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(line);
        selectNodes(layer, [line])
    })
}

function activateText(stage: Stage, layer: Layer) {
    stage.on("pointerclick", (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        const pos = stage.getPointerPosition();
        const textNode = new Text({
            name: 'shape',
            text: 'Some text here',
            x: pos?.x,
            y: pos?.y,
            fontSize: 30,
            // stroke: get(selectedColor),
            fontFamily: `"Chewy", serif`,
            fill: get(selectedColor),
        });
        layer.add(textNode);
        textNode.on('dblclick dbltap', () => {
            textNode.hide();
            const textPosition = textNode.absolutePosition();
            const areaPosition = {
                x: stage.container().offsetLeft + textPosition.x,
                y: stage.container().offsetTop + textPosition.y,
            };
            const textarea = document.createElement('textarea');
            document.body.appendChild(textarea);
            textarea.value = textNode.text();
            textarea.style.position = 'absolute';
            textarea.style.top = areaPosition.y + 'px';
            textarea.style.left = areaPosition.x + 'px';
            textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
            textarea.style.height =
                textNode.height() - textNode.padding() * 2 + 5 + 'px';
            textarea.style.fontSize = textNode.fontSize() + 'px';
            textarea.style.border = 'none';
            textarea.style.padding = '0px';
            textarea.style.margin = '0px';
            textarea.style.overflow = 'hidden';
            textarea.style.background = 'none';
            textarea.style.outline = 'none';
            textarea.style.resize = 'none';
            textarea.style.lineHeight = textNode.lineHeight().toString();
            textarea.style.fontFamily = textNode.fontFamily();
            textarea.style.transformOrigin = 'left top';
            textarea.style.textAlign = textNode.align();
            textarea.style.color = textNode.fill().toString();
            const rotation = textNode.rotation();
            let transform = '';
            if (rotation) {
                transform += 'rotateZ(' + rotation + 'deg)';
            }

            var px = 0;
            // also we need to slightly move textarea on firefox
            // because it jumps a bit
            var isFirefox =
                navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
            if (isFirefox) {
                px += 2 + Math.round(textNode.fontSize() / 20);
            }
            transform += 'translateY(-' + px + 'px)';

            textarea.style.transform = transform;

            // reset height
            textarea.style.height = 'auto';
            // after browsers resized it we can set actual value
            textarea.style.height = textarea.scrollHeight + 3 + 'px';

            textarea.focus();

            function removeTextarea() {
                if (!textarea.parentNode) return;
                textarea.parentNode.removeChild(textarea);
                window.removeEventListener('click', handleOutsideClick);
                textNode.show();
            }

            function setTextareaWidth(newWidth: number) {
                if (!newWidth) {
                    //@ts-ignore
                    newWidth = textNode.placeholder.length * textNode.fontSize();
                }
                // some extra fixes on different browsers
                const isSafari = /^((?!chrome|android).)*safari/i.test(
                    navigator.userAgent
                );
                const isFirefox =
                    navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                if (isSafari || isFirefox) {
                    newWidth = Math.ceil(newWidth);
                }

                //@ts-ignore
                const isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
                if (isEdge) {
                    newWidth += 1;
                }
                textarea.style.width = newWidth + 'px';
            }

            textarea.addEventListener('keydown', function (e) {
                // hide on enter
                // but don't hide on shift + enter
                if (e.key === "Enter" && !e.shiftKey) {
                    textNode.text(textarea.value);
                    removeTextarea();
                }
                // on esc do not set value back to node
                if (e.key === "Escape") {
                    removeTextarea();
                }
            });

            textarea.addEventListener('keydown', function (e) {
                const scale = textNode.getAbsoluteScale().x;
                setTextareaWidth(textNode.width() * scale);
                textarea.style.height = 'auto';
                textarea.style.height =
                    textarea.scrollHeight + textNode.fontSize() + 'px';
            });

            function handleOutsideClick(e: any) {
                if (e.target !== textarea) {
                    textNode.text(textarea.value);
                    removeTextarea();
                }
            }
            setTimeout(() => {
                window.addEventListener('click', handleOutsideClick);
            });
        });
        selectNodes(layer, [textNode])
        resetStage(stage, "select")
    })
}

function activateRect(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: Rect;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        previewShape = new Rect({
            x: startPos.x,
            y: startPos.y,
            width: 0,
            height: 0,
            fill: "transparent",
            cornerRadius: 5,
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        if (startPos.x > endPos.x) {
            let temp = startPos.x;
            startPos.x = endPos.x;
            endPos.x = temp;
        }
        if (startPos.y > endPos.y) {
            let temp = startPos.y;
            startPos.y = endPos.y;
            endPos.y = temp;
        }

        const { x, y } = startPos;
        const width = Math.abs(endPos.x - x);
        const height = Math.abs(endPos.y - y);
        previewShape.setAttr("width", width);
        previewShape.setAttr("height", height);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        previewShape.destroy();
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        if (startPos.x > endPos.x) {
            let temp = startPos.x;
            startPos.x = endPos.x;
            endPos.x = temp;
        }
        if (startPos.y > endPos.y) {
            let temp = startPos.y;
            startPos.y = endPos.y;
            endPos.y = temp;
        }

        const { x, y } = startPos;
        const width = Math.abs(endPos.x - x);
        const height = Math.abs(endPos.y - y);
        const rect = new Rect({
            name: 'shape',
            x,
            y,
            width,
            height,
            cornerRadius: 5,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(rect);
        selectNodes(layer, [rect])
    })
}

function activateCircle(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: Ellipse;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        previewShape = new Ellipse({
            x: startPos.x,
            y: startPos.y,
            radiusX: 1, // Initial radius
            radiusY: 1,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });

        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        previewShape.radiusX(Math.abs(startPos.x - endPos.x));
        previewShape.radiusY(Math.abs(startPos.y - endPos.y));
        layer.batchDraw(); // Refresh the layer to see the changes
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false
        endPos = stage.getPointerPosition();
        previewShape.destroy();
        if (!startPos) return
        if (!endPos) return
        const oval = new Ellipse({
            name: 'shape',
            x: startPos.x,
            y: startPos.y,
            radiusX: Math.abs(startPos.x - endPos.x),
            radiusY: Math.abs(startPos.y - endPos.y),
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(oval);
        selectNodes(layer, [oval])
    })
}

function activateStar(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: Star;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        previewShape = new Star({
            x: startPos.x,
            y: startPos.y,
            numPoints: 5,
            innerRadius: 1,
            outerRadius: 2,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });

        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const outerRadius = Math.sqrt(
            Math.pow(endPos.x - startPos.x, 2) +
            Math.pow(endPos.y - startPos.y, 2)
        );
        const innerRadius = outerRadius * 0.5;
        previewShape.outerRadius(outerRadius);
        previewShape.innerRadius(innerRadius);
        layer.batchDraw(); // Refresh the layer to see the changes
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false
        endPos = stage.getPointerPosition();
        previewShape.destroy();
        if (!startPos) return
        if (!endPos) return
        const outerRadius = Math.sqrt(
            Math.pow(endPos.x - startPos.x, 2) +
            Math.pow(endPos.y - startPos.y, 2)
        );
        const innerRadius = outerRadius * 0.5;
        const star = new Star({
            name: 'shape',
            x: startPos.x,
            y: startPos.y,
            numPoints: 5,
            innerRadius,
            outerRadius,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(star);
        selectNodes(layer, [star])
    })
}

function activatePolygon(stage: Stage, layer: Layer, sides: number) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: RegularPolygon;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        previewShape = new RegularPolygon({
            x: startPos.x,
            y: startPos.y,
            sides,
            radius: 1, // Initial radius
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });

        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        previewShape.radius(Math.abs(startPos.x - endPos.x));
        layer.batchDraw(); // Refresh the layer to see the changes
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false
        endPos = stage.getPointerPosition();
        previewShape.destroy();
        if (!startPos) return
        if (!endPos) return
        const polygon = new RegularPolygon({
            name: 'shape',
            x: startPos.x,
            y: startPos.y,
            sides,
            radius: Math.abs(startPos.x - endPos.x),
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
        });
        layer.add(polygon);
        selectNodes(layer, [polygon])
    })
}

function activateHeart(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: Shape;

    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        previewShape = new Shape({
            x: startPos.x,
            y: startPos.y,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            sceneFunc: function (context, shape) {
                const width = shape.width();
                const height = shape.height();

                context.beginPath();
                context.moveTo(width / 2, height / 4);

                // Left curve
                context.bezierCurveTo(
                    width / 6, 0,  // Control point 1
                    0, height / 2,  // Control point 2
                    width / 2, height  // End point
                );

                // Right curve
                context.bezierCurveTo(
                    width, height / 2,  // Control point 1
                    width * 5 / 6, 0,  // Control point 2
                    width / 2, height / 4  // End point
                );

                context.closePath();

                // Konva specific method to apply fill and stroke
                context.fillStrokeShape(shape);
            },
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        if (startPos.x > endPos.x) {
            let temp = startPos.x;
            startPos.x = endPos.x;
            endPos.x = temp;
        }
        if (startPos.y > endPos.y) {
            let temp = startPos.y;
            startPos.y = endPos.y;
            endPos.y = temp;
        }

        const { x, y } = startPos;
        const width = Math.abs(endPos.x - x);
        const height = Math.abs(endPos.y - y);
        previewShape.setAttr("width", width);
        previewShape.setAttr("height", height);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        previewShape.destroy();
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        if (startPos.x > endPos.x) {
            let temp = startPos.x;
            startPos.x = endPos.x;
            endPos.x = temp;
        }
        if (startPos.y > endPos.y) {
            let temp = startPos.y;
            startPos.y = endPos.y;
            endPos.y = temp;
        }

        const { x, y } = startPos;
        const width = Math.abs(endPos.x - x);
        const height = Math.abs(endPos.y - y);

        const heart = new Shape({
            name: 'shape',
            x,
            y,
            width,
            height,
            cornerRadius: 5,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            sceneFunc: function (context, shape) {
                const width = shape.width();
                const height = shape.height();

                context.beginPath();
                context.moveTo(width / 2, height / 4);

                // Left curve
                context.bezierCurveTo(
                    width / 6, 0,  // Control point 1
                    0, height / 2,  // Control point 2
                    width / 2, height  // End point
                );

                // Right curve
                context.bezierCurveTo(
                    width, height / 2,  // Control point 1
                    width * 5 / 6, 0,  // Control point 2
                    width / 2, height / 4  // End point
                );

                context.closePath();

                // Konva specific method to apply fill and stroke
                context.fillStrokeShape(shape);
            },
        });

        layer.add(heart);

        selectNodes(layer, [heart])
    })
}

function selectNodes(layer: Layer, nodes: Node<NodeConfig>[]) {
    // check if tr exists
    let tr: Transformer = <Transformer>layer.getChildren().find((child) => child.id() == "global-selector")
    if (!tr) {
        tr = new Transformer({
            id: 'global-selector',
        })
        tr.on('transformstart', (evt) => {
            evt.cancelBubble = true;
        });
        tr.on('dragstart', (evt) => {
            evt.cancelBubble = true;
        });
        tr.nodes(nodes)
        layer.add(tr)
    } else {
        tr.nodes(nodes)
    }
}

function deselectEverything(layer: Layer) {
    let tr: Transformer = <Transformer>layer.getChildren().find((child) => child.id() == "global-selector")
    if (!tr) return
    tr.nodes([])
}

function enableDraggable(layer: Layer, draggable: boolean) {
    const children = layer.getChildren()
    children.forEach((child) => {
        child.draggable(draggable)
    })
}
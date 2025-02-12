import { get, writable, type Unsubscriber } from "svelte/store";
import { type Stage } from "konva/lib/Stage.js";
import { Line } from "konva/lib/shapes/Line.js";
import type { Layer } from "konva/lib/Layer.js";
import type { Vector2d } from "konva/lib/types.js";
import { Arrow } from "konva/lib/shapes/Arrow.js";
import { Text } from "konva/lib/shapes/Text.js";
import { Rect } from "konva/lib/shapes/Rect.js";
import { Shape } from "konva/lib/Shape.js";
import { Transformer } from "konva/lib/shapes/Transformer.js";
import type { Node, NodeConfig } from "konva/lib/Node.js";
import { Util } from "konva/lib/Util.js";
import { registerDefaultEvents } from "./utils.js";
import { Group } from "konva/lib/Group.js";
import { theme } from "$lib/theme.js";
import { Image as KonvaImage } from "konva/lib/shapes/Image.js";
import { RoughCircle } from "$lib/shapes/RoughCircle.js";
import { RoughRect } from "$lib/shapes/RoughRect.js";
import { RoughPolygon } from "$lib/shapes/RoughPolygon.js";
import { RoughLine } from "$lib/shapes/RoughLine.js";
import { RoughStar } from "$lib/shapes/RoughStar.js";
import { RoughHeart } from "$lib/shapes/RoughHeart.js";
import { RoughBoxX } from "$lib/shapes/RoughBoxX.js";
import { RoughBoxCheck } from "$lib/shapes/RoughBoxCheck.js";

const STROKE_WIDTH = 5;

type Tool =
    | "select"
    | "hand"
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
    | "heart"
    | "boxX"
    | "boxCheck"
    | "fatArrow";

export let selectedTool = writable<Tool>("select");
export let selectedColor = writable<string>(get(theme) === "light" ? "#000000" : "#ffffff");
export let opacity = writable<number>(1)
export let strokeStyle = writable<"solid" | "dash" | "dot">("solid")
export let editingText = writable<boolean>(false)

let colorSubscription: Unsubscriber;
let opacitySubscription: Unsubscriber;
let strokeStyleSubscription: Unsubscriber;
let themeSubscription: Unsubscriber;

export const resetStage = (stage: Stage, layer: Layer, select: "select" | null = null) => {
    stage.off();
    stage.draggable(false)
    document.body.style.cursor = "default";
    registerDefaultEvents(stage);
    if (select) {
        selectedTool.set(select);
        selectTool(stage, layer, "select")
    }
}

export const selectTool = (stage: Stage, layer: Layer, tool: Tool) => {
    resetStage(stage, layer);
    selectedTool.set(tool);
    enableDraggable(layer, tool === "select")
    if (colorSubscription) colorSubscription();
    colorSubscription = selectedColor.subscribe((color) => {
        let tr: Transformer = <Transformer>layer.getChildren().find((child) => child.id() == "global-selector")
        if (!tr) return
        const selectedObjects = tr.getNodes();
        selectedObjects.forEach((obj) => {
            if (obj instanceof Text) {
                obj.fill(color)
                return;
            }
            if (obj instanceof Shape) obj.stroke(color)
            if (obj instanceof Group) {
                obj.getChildren().forEach(child => {
                    if (child instanceof Shape) child.stroke(color)
                })
            }
        });
        layer.batchDraw();
    });
    if (opacitySubscription) opacitySubscription();
    opacitySubscription = opacity.subscribe((val) => {
        let tr: Transformer = <Transformer>layer.getChildren().find((child) => child.id() == "global-selector")
        if (!tr) return
        const selectedObjects = tr.getNodes();
        selectedObjects.forEach((obj) => {
            if (obj instanceof Shape) obj.opacity(val);
            if (obj instanceof Group) {
                obj.getChildren().forEach(child => {
                    if (child instanceof Shape) child.opacity(val)
                })
            }
        });
        layer.batchDraw();
    });
    if (strokeStyleSubscription) strokeStyleSubscription();
    strokeStyleSubscription = strokeStyle.subscribe((val) => {
        let tr: Transformer = <Transformer>layer.getChildren().find((child) => child.id() == "global-selector")
        if (!tr) return
        const selectedObjects = tr.getNodes();
        selectedObjects.forEach((obj) => {
            if (obj instanceof Shape) {
                switch (val) {
                    case "solid":
                        obj.dash([])
                        break;
                    case "dash":
                        obj.dash([33, 10])
                        break;
                    case "dot":
                        obj.dash([5, 5])
                        break;
                    default:
                        break;
                }
            }
            if (obj instanceof Group) {
                obj.getChildren().forEach(child => {
                    if (child instanceof Shape) {
                        switch (val) {
                            case "solid":
                                child.dash([])
                                break;
                            case "dash":
                                child.dash([33, 10])
                                break;
                            case "dot":
                                child.dash([5, 5])
                                break;
                            default:
                                break;
                        }
                    }
                })
            }
        });
        layer.batchDraw();
    });
    if (themeSubscription) themeSubscription();
    themeSubscription = theme.subscribe((val) => {
        if (get(selectedColor) === "#000000" || get(selectedColor) === "#ffffff") {
            selectedColor.set(val === "light" ? "#000000" : "#ffffff")
        }
        const shapes = layer.getChildren()
        shapes.forEach(shape => {
            if (shape instanceof Text) {
                if (val === "dark" && shape.fill() === "#000000") {
                    shape.fill("#ffffff")
                    return;
                }
                if (val === "light" && shape.fill() === "#ffffff") {
                    shape.fill("#000000")
                    return;
                }
            }
            if (shape instanceof Shape) {
                changeStrokeColor(shape)
            }
            if (shape instanceof Group) {
                const subChildren = shape.getChildren()
                subChildren.forEach(child => {
                    if (child instanceof Shape) {
                        changeStrokeColor(child)
                    }
                })
            }
        })
        function changeStrokeColor(shape: Shape) {
            if (shape instanceof Shape && val === "dark" && shape.stroke() === "#000000") {
                shape.stroke("#ffffff")
                return;
            }
            if (shape instanceof Shape && val === "light" && shape.stroke() === "#ffffff") {
                shape.stroke("#000000")
                return;
            }
        }
    })
    switch (tool) {
        case "select":
            activateSelect(stage, layer)
            break;
        case "hand":
            document.body.style.cursor = "move";
            stage.draggable(true)
            break;
        case "pen":
            activateFreeDrawing(stage, layer, "brush")
            break;
        case "eraser":
            // activateFreeDrawing(stage, layer, "eraser")
            activateEraser(stage, layer)
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
            // activateRect(stage, layer);
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
        case "boxX":
            activateBoxX(stage, layer)
            break;
        case "boxCheck":
            activateBoxWithCheck(stage, layer)
            break;
        case "fatArrow":
            activateFatArrow(stage, layer)
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
        const pos = stage.getPointerPosition();
        if (!pos) return
        const transformedPos = transformPoints(stage, pos)
        x1 = transformedPos.x;
        y1 = transformedPos.y;
        x2 = transformedPos.x;
        y2 = transformedPos.y;

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
        const pos = stage.getPointerPosition();
        if (!pos) return
        const transformedPos = transformPoints(stage, pos)
        x2 = transformedPos.x;
        y2 = transformedPos.y;
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
        const transformedPos = transformPoints(stage, pos)
        lastLine = new Line({
            name: 'shape',
            dash: getStrokeStyle(),
            stroke: get(selectedColor),
            strokeWidth: mode === 'brush' ? 5 : 30,
            globalCompositeOperation: mode === 'brush' ? 'source-over' : 'destination-out',
            lineCap: 'round',
            lineJoin: 'round',
            points: [transformedPos.x, transformedPos.y, transformedPos.x, transformedPos.y],
        });
        layer.add(lastLine);
    })
    stage.on('mousemove touchmove', function (e) {
        if (!isPaint) return;
        // prevent scrolling on touch devices
        e.evt.preventDefault();
        const pos = stage.getPointerPosition();
        if (!pos) return
        const transformedPos = transformPoints(stage, pos)
        const newPoints = lastLine.points().concat([transformedPos.x, transformedPos.y]);
        lastLine.points(newPoints);
    });
    stage.on('mouseup touchend', function () {
        if (!isPaint) return;
        isPaint = false;
        if (mode == "brush") {
            selectNodes(layer, [lastLine])
            stage.fire('object:added', { target: lastLine })
        }
    });

}

function activateArrow(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let previewShape: Arrow;

    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new Arrow({
            name: 'shape',
            dash: getStrokeStyle(),
            points: [transformedStartPos.x, transformedStartPos.y],
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
        const transformedPos = transformPoints(stage, pos)
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape.points([transformedStartPos.x, transformedStartPos.y, transformedPos.x, transformedPos.y]);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activateLine(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let previewShape: RoughLine;

    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughLine({
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fill: "transparent",
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
            name: 'shape',
            points: [transformedStartPos.x, transformedStartPos.y],
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        const pos = stage.getPointerPosition();
        if (!pos) return
        if (!startPos) return
        const transformedPos = transformPoints(stage, pos)
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape.points([transformedStartPos.x, transformedStartPos.y, transformedPos.x, transformedPos.y]);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activateText(stage: Stage, layer: Layer) {
    stage.on("click tap", (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        const pos = stage.getPointerPosition();
        if (!pos) return
        const transformedPos = transformPoints(stage, pos)
        addTextNode(stage, layer, transformedPos)
    })
}

function activateRect(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: RoughRect;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughRect({
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fill: "transparent",
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
            name: 'shape',
            x: transformedStartPos.x,
            y: transformedStartPos.y,
            width: 0,
            height: 0,
            cornerRadius: 5
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const transformedStartPos = transformPoints(stage, startPos)
        const transformedEndPos = transformPoints(stage, endPos)
        if (transformedStartPos.x > transformedEndPos.x) {
            let temp = transformedStartPos.x;
            transformedStartPos.x = transformedEndPos.x;
            transformedEndPos.x = temp;
        }
        if (transformedStartPos.y > transformedEndPos.y) {
            let temp = transformedStartPos.y;
            transformedStartPos.y = transformedEndPos.y;
            transformedEndPos.y = temp;
        }

        const { x, y } = transformedStartPos;
        const width = Math.abs(transformedEndPos.x - x);
        const height = Math.abs(transformedEndPos.y - y);
        previewShape.setAttr("width", width);
        previewShape.setAttr("height", height);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activateCircle(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: RoughCircle;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughCircle({
            x: transformedStartPos.x,
            y: transformedStartPos.y,
            radius: 1, // Initial radius
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fill: "transparent",
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
            name: 'shape',
        });

        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const transformedStartPos = transformPoints(stage, startPos)
        const transformedEndPos = transformPoints(stage, endPos)
        previewShape.radius(Math.abs(transformedStartPos.x - transformedEndPos.x));
        layer.batchDraw(); // Refresh the layer to see the changes
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activateStar(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: RoughStar;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughStar({
            name: 'shape',
            x: transformedStartPos.x,
            y: transformedStartPos.y,
            numPoints: 5,
            innerRadius: 1,
            outerRadius: 2,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
        });

        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const transformedStartPos = transformPoints(stage, startPos)
        const transformedEndPos = transformPoints(stage, endPos)
        const outerRadius = Math.sqrt(
            Math.pow(transformedEndPos.x - transformedStartPos.x, 2) +
            Math.pow(transformedEndPos.y - transformedStartPos.y, 2)
        );
        const innerRadius = outerRadius * 0.5;
        previewShape.outerRadius(outerRadius);
        previewShape.innerRadius(innerRadius);
        layer.batchDraw(); // Refresh the layer to see the changes
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activatePolygon(stage: Stage, layer: Layer, sides: number) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: RoughPolygon;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughPolygon({
            x: transformedStartPos.x,
            y: transformedStartPos.y,
            sides,
            radius: 1, // Initial radius
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fill: "transparent",
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
            name: 'shape',
        });

        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const transformedStartPos = transformPoints(stage, startPos)
        const transformedEndPos = transformPoints(stage, endPos)
        previewShape.radius(Math.abs(transformedStartPos.x - transformedEndPos.x));
        layer.batchDraw(); // Refresh the layer to see the changes
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
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
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughHeart({
            name: 'shape',
            dash: getStrokeStyle(),
            x: transformedStartPos.x,
            y: transformedStartPos.y,
            width: 0,
            height: 0,
            fill: "transparent",
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const transformedStartPos = transformPoints(stage, startPos)
        const transformedEndPos = transformPoints(stage, endPos)
        if (transformedStartPos.x > transformedEndPos.x) {
            let temp = transformedStartPos.x;
            transformedStartPos.x = transformedEndPos.x;
            transformedEndPos.x = temp;
        }
        if (transformedStartPos.y > transformedEndPos.y) {
            let temp = transformedStartPos.y;
            transformedStartPos.y = transformedEndPos.y;
            transformedEndPos.y = temp;
        }

        const { x, y } = transformedStartPos;
        const width = Math.abs(transformedEndPos.x - x);
        const height = Math.abs(transformedEndPos.y - y);
        previewShape.setAttr("width", width);
        previewShape.setAttr("height", height);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activateBoxX(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: RoughBoxX;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughBoxX({
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fill: "transparent",
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
            name: 'shape',
            x: transformedStartPos.x,
            y: transformedStartPos.y,
            width: 0,
            height: 0,
            cornerRadius: 5
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const transformedStartPos = transformPoints(stage, startPos)
        const transformedEndPos = transformPoints(stage, endPos)
        if (transformedStartPos.x > transformedEndPos.x) {
            let temp = transformedStartPos.x;
            transformedStartPos.x = transformedEndPos.x;
            transformedEndPos.x = temp;
        }
        if (transformedStartPos.y > transformedEndPos.y) {
            let temp = transformedStartPos.y;
            transformedStartPos.y = transformedEndPos.y;
            transformedEndPos.y = temp;
        }

        const { x, y } = transformedStartPos;
        const width = Math.abs(transformedEndPos.x - x);
        const height = Math.abs(transformedEndPos.y - y);
        previewShape.setAttr("width", width);
        previewShape.setAttr("height", height);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activateBoxWithCheck(stage: Stage, layer: Layer) {
    let isPaint = false
    document.body.style.cursor = "crosshair";
    let startPos: Vector2d | null = null;
    let endPos: Vector2d | null = null;
    let previewShape: RoughBoxCheck;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        startPos = stage.getPointerPosition();
        if (!startPos) return;
        const transformedStartPos = transformPoints(stage, startPos)
        previewShape = new RoughBoxCheck({
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            fill: "transparent",
            fillStyle: 'cross-hatch',
            fillWeight: 1,
            hachureGap: 5,
            rough: true,
            seed: generateRandomSeed(),
            name: 'shape',
            x: transformedStartPos.x,
            y: transformedStartPos.y,
            width: 0,
            height: 0,
            cornerRadius: 5
        });
        layer.add(previewShape);
    })
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        endPos = stage.getPointerPosition();
        if (!startPos) return
        if (!endPos) return
        const transformedStartPos = transformPoints(stage, startPos)
        const transformedEndPos = transformPoints(stage, endPos)
        if (transformedStartPos.x > transformedEndPos.x) {
            let temp = transformedStartPos.x;
            transformedStartPos.x = transformedEndPos.x;
            transformedEndPos.x = temp;
        }
        if (transformedStartPos.y > transformedEndPos.y) {
            let temp = transformedStartPos.y;
            transformedStartPos.y = transformedEndPos.y;
            transformedEndPos.y = temp;
        }

        const { x, y } = transformedStartPos;
        const width = Math.abs(transformedEndPos.x - x);
        const height = Math.abs(transformedEndPos.y - y);
        previewShape.setAttr("width", width);
        previewShape.setAttr("height", height);
        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        selectNodes(layer, [previewShape])
        stage.fire('object:added', { target: previewShape })
        resetStage(stage, layer, "select")
    })
}

function activateFatArrow(stage: Stage, layer: Layer) {
    let isPaint = false;
    document.body.style.cursor = "crosshair";
    let startX: number, startY: number, fatArrow: Line;
    stage.on('mousedown touchstart', (e) => {
        if (e.target !== stage) {
            e.cancelBubble = true;
            return;
        }
        isPaint = true;
        const pos = stage.getPointerPosition();
        if (!pos) return
        const transformedPos = transformPoints(stage, pos)
        startX = transformedPos.x;
        startY = transformedPos.y;
        fatArrow = new Line({
            dash: getStrokeStyle(),
            name: "shape",
            points: [startX, startY, startX, startY],
            stroke: get(selectedColor),
            strokeWidth: STROKE_WIDTH,
            closed: true,
        });

        layer.add(fatArrow);
    });
    stage.on('mousemove touchmove', (e) => {
        if (!isPaint) return;
        const pos = stage.getPointerPosition();
        if (!pos) return
        const transformedPos = transformPoints(stage, pos)
        const width = transformedPos.x - startX;
        const height = transformedPos.y - startY;

        const arrowHeadHeight = height * 0.4;

        const points = [
            startX, startY + height,
            startX + width, startY + height,
            startX + width, startY + arrowHeadHeight,
            startX + width + width * 0.4, startY + arrowHeadHeight,
            startX + width / 2, startY,
            startX - width * 0.4, startY + arrowHeadHeight,
            startX, startY + arrowHeadHeight
        ];

        fatArrow.points(points);

        layer.batchDraw();
    })
    stage.on('mouseup touchend', (e) => {
        if (!isPaint) return;
        isPaint = false;
        selectNodes(layer, [fatArrow])
        stage.fire('object:added', { target: fatArrow })
        resetStage(stage, layer, "select")
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

function transformPoints(stage: Stage, pos: Vector2d) {
    const transform = stage.getAbsoluteTransform().copy()
    transform.invert()
    return transform.point(pos)
}

function getStrokeStyle() {
    let dash: number[] = []
    switch (get(strokeStyle)) {
        case "dash":
            dash = [33, 10]
            break;
        case "dot":
            dash = [5, 5]
            break;
        default:
            break;
    }
    return dash
}

function activateEraser(stage: Stage, layer: Layer) {
    deselectEverything(layer)
    let isDrawing = false;
    let drawingPoints: number[] = [];
    let eraserLine: Line | null = null;
    let highlightedObjects = new Set<Node>();

    stage.on('mousedown', () => {
        isDrawing = true;
        drawingPoints = [];
        eraserLine = new Line({
            stroke: 'rgba(255, 0, 0, 1)',
            strokeWidth: 1,
            lineCap: 'round',
            lineJoin: 'round',
            points: [],
        });
        layer.add(eraserLine);
    });

    stage.on('mousemove', (event) => {
        if (!isDrawing || !eraserLine) return;

        const pos = stage.getPointerPosition();
        if (pos) {
            const transformedPos = transformPoints(stage, pos)
            drawingPoints.push(transformedPos.x, transformedPos.y);
            eraserLine.points(drawingPoints);
            layer.batchDraw();

            // Highlight objects that intersect with the eraser line
            layer.getChildren().forEach(obj => {
                if (obj === eraserLine) return;
                if (obj instanceof Shape || obj instanceof Group) {
                    if (Util.haveIntersection(eraserLine!.getClientRect(), obj.getClientRect()) && !highlightedObjects.has(obj)) {
                        obj.opacity(0.3);
                        highlightedObjects.add(obj);
                    } else if (!Util.haveIntersection(eraserLine!.getClientRect(), obj.getClientRect()) && highlightedObjects.has(obj)) {
                        obj.opacity(1);
                        highlightedObjects.delete(obj);
                    }
                }
            });
        }
    });

    stage.on('mouseup', () => {
        isDrawing = false;

        // Remove objects that intersect with the final eraser path
        if (eraserLine) {
            layer.getChildren().forEach(obj => {
                if (obj === eraserLine) return;
                if (obj instanceof Shape || obj instanceof Group) {
                    if (Util.haveIntersection(eraserLine!.getClientRect(), obj.getClientRect())) {
                        obj.destroy();
                    }
                }
            });
            fadeOutTrail(eraserLine, layer);
        }
    });
}

function fadeOutTrail(line: Line, layer: Layer, duration = 500) {
    line.to({
        opacity: 0,
        duration: duration / 1000,
        onFinish: () => {
            line.destroy();
            layer.batchDraw();
        }
    });
}

export const addTextNode = (stage: Stage, layer: Layer, pos: Vector2d, text: string | null = null) => {
    const textNode = new Text({
        name: 'shape',
        text: text ? text : 'Some text here',
        x: pos.x,
        y: pos.y,
        fontSize: 30,
        fontFamily: `"Chewy", serif`,
        fill: get(selectedColor),
        draggable: true
    });
    layer.add(textNode);
    textNode.on('dblclick dbltap', () => {
        editingText.set(true)
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
            editingText.set(false)
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
    stage.fire('object:added', { target: textNode })
    resetStage(stage, layer, "select")
}

export const addImage = (stage: Stage, layer: Layer, img: HTMLImageElement) => {
    const stageWidth = stage.width();
    const stageHeight = stage.height();
    const scale = stage.scaleX();
    const stageX = stage.x();
    const stageY = stage.y();
    const viewportCenterX = (-stageX + (stageWidth / 2)) / scale;
    const viewportCenterY = (-stageY + (stageHeight / 2)) / scale;
    const konvaImage = new KonvaImage({
        name: 'shape',
        x: viewportCenterX - 300,
        y: viewportCenterY - 300,
        image: img,
        width: img.width,
        height: img.height,
        draggable: true,
    });
    layer.add(konvaImage);
    layer.batchDraw()
    deselectEverything(layer)
    selectNodes(layer, [konvaImage])
    resetStage(stage, layer, "select")
    stage.fire('object:added', { target: konvaImage })
}

function generateRandomSeed(): number {
    // Using `crypto.getRandomValues()` for cryptographically secure randomness
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0];
    }

    // Fallback to `Math.random()` if crypto API is not available
    return Math.floor(Math.random() * 1000000);
}
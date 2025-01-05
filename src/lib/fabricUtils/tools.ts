import { Circle, IText, Line, Path, PencilBrush, Rect, Triangle, type Canvas } from "fabric";
import { get, writable, type Unsubscriber } from "svelte/store";
import { registerDefaultEvents } from "./utils.js";
import { Diamond } from "./shapes/Diamond.js";
import { Hexagon } from "./shapes/Hexagon.js";
import { Heart } from "./shapes/Heart.js";

const STROKE_WIDTH = 5;

type Tool =
    | "select"
    | "pen"
    | "eraser"
    | "arrow"
    | "text"
    | "notes"
    | "image"
    | "line"
    | "box"
    | "circle"
    | "triangle"
    | "diamond"
    | "hexagon"
    | "heart";

export let selectedTool = writable<Tool>("select");
export let selectedColor = writable<string>("#000000");

let colorSubscription: Unsubscriber;

const resetCanvas = (canvas: Canvas, selectTool: "select" | null = null) => {
    canvas.off();
    canvas.isDrawingMode = false;
    canvas.defaultCursor = 'default';
    registerDefaultEvents(canvas);
    if (selectTool) {
        selectedTool.set(selectTool);
    }
}

export const selectTool = (canvas: Canvas, tool: Tool) => {
    resetCanvas(canvas);
    selectedTool.set(tool);
    if (colorSubscription) colorSubscription();
    colorSubscription = selectedColor.subscribe((color) => {
        const selectedObjects = canvas.getActiveObjects();
        selectedObjects.forEach((obj) => {
            obj.set({ stroke: color });
            canvas.renderAll();
        });
        if (canvas.freeDrawingBrush) canvas.freeDrawingBrush.color = color;
        canvas.requestRenderAll();
    });
    switch (tool) {
        case "select":
            canvas.isDrawingMode = false;
            break;
        case "pen":
            canvas.isDrawingMode = true;
            canvas.freeDrawingBrush = new PencilBrush(canvas);
            canvas.freeDrawingBrush.width = STROKE_WIDTH;
            canvas.freeDrawingBrush.color = get(selectedColor);
            break;
        case "eraser":
            activateEraser(canvas);
            break;
        case "arrow":
            drawLine(canvas);
            break;
        case "text":
            canvas.on('mouse:down', (event) => {
                const pointer = canvas.getScenePoint(event.e);
                const text = new IText("Type here", {
                    left: pointer.x,
                    top: pointer.y,
                    fontSize: 20,
                    fill: get(selectedColor),
                });
                colorSubscription = selectedColor.subscribe((color) => {
                    text.set({ fill: color });
                    canvas.requestRenderAll();
                });
                canvas.add(text);
                resetCanvas(canvas, "select");
            })
            break;
        case "notes":
            break;
        case "image":
            break;
        case "line":
            drawLine(canvas);
            break;
        case "box":
            drawRect(canvas);
            break;
        case "circle":
            drawCircle(canvas);
            break;
        case "triangle":
            drawTriangle(canvas);
            break;
        case "diamond":
            drawDiamond(canvas);
            break;
        case "hexagon":
            drawHexagon(canvas);
            break;
        case "heart":
            drawHeart(canvas);
            break;
        default:
            break;
    }
}
function fadeOutTrail(canvas: Canvas, path: any, duration: number = 500) {
    let startTime = Date.now();

    (function fade() {
        let elapsed = Date.now() - startTime;
        let progress = elapsed / duration;

        if (progress >= 1) {
            canvas.remove(path);  // Remove when fully faded
            return;
        }

        path.set({
            opacity: 1 - progress
        });

        canvas.renderAll();
        requestAnimationFrame(fade);
    })();
}

function activateEraser(canvas: Canvas) {
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = 'rgba(255, 0, 0, 1)';
    canvas.freeDrawingBrush.width = 1;
    canvas.isDrawingMode = true;
    let isDrawing = false;
    let highlightedObjects = new Set();
    let drawingPoints = [];
    canvas.on('mouse:down', () => {
        isDrawing = true;
    });
    canvas.on('mouse:up', () => {
        isDrawing = false;
    });
    canvas.on('mouse:move', (event) => {
        if (isDrawing) {
            const pointer = canvas.getScenePoint(event.e);
            drawingPoints.push({ x: pointer.x, y: pointer.y });
            if (drawingPoints.length > 2 && canvas.freeDrawingBrush) {
                const pathData = drawingPoints.map(p => `${p.x},${p.y}`).join(' L ');
                const tempPath = new Path(`M ${pathData}`, {
                    strokeWidth: canvas.freeDrawingBrush.width,
                    stroke: 'rgba(0,0,0,0)',
                    fill: '',
                    selectable: false,
                    evented: false,
                });

                canvas.forEachObject(obj => {
                    if (obj.intersectsWithObject(tempPath) && !highlightedObjects.has(obj)) {
                        obj.set({
                            opacity: 0.3,
                        });
                        highlightedObjects.add(obj);
                    } else if (!obj.intersectsWithObject(tempPath) && highlightedObjects.has(obj)) {
                        obj.set({
                            opacity: 1,
                            stroke: null
                        });
                        highlightedObjects.delete(obj);
                    }
                });
                canvas.requestRenderAll();
            }
        }
    })
    canvas.on('path:created', (event) => {
        const eraserPath = event.path;
        canvas.forEachObject(obj => {
            if (obj.intersectsWithObject(eraserPath)) {
                canvas.remove(obj);
            }
        });
        canvas.add(eraserPath);
        fadeOutTrail(canvas, eraserPath, 500);
    });
}

function drawLine(canvas: Canvas) {
    canvas.defaultCursor = "crosshair";
    let isDrawing = false;

    let line: Line;
    canvas.on("mouse:down", (options) => {
        isDrawing = true;
        let pointer = canvas.getScenePoint(options.e);
        line = new Line([pointer.x, pointer.y, pointer.x, pointer.y], {
            strokeWidth: STROKE_WIDTH,
            stroke: get(selectedColor),
        });
        canvas.add(line);
        canvas.renderAll();
    });
    canvas.on("mouse:move", (options) => {
        if (!isDrawing) return;
        let pointer = canvas.getScenePoint(options.e);
        line.set({ x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
    });
    canvas.on("mouse:up", () => {
        isDrawing = false;
        selectTool(canvas, "select");
    });
}

function drawRect(canvas: Canvas) {
    canvas.defaultCursor = "crosshair";
    let isDrawing = false;
    let rectangle: Rect;
    canvas.on("mouse:down", function (o) {
        isDrawing = true;
        let pointer = canvas.getScenePoint(o.e);
        let startPoint = { x: pointer.x, y: pointer.y };
        let endPoint = { x: pointer.x, y: pointer.y };
        rectangle = new Rect({
            left: startPoint.x,
            top: startPoint.y,
            width: endPoint.x - startPoint.x,
            height: endPoint.y - startPoint.y,
            strokeWidth: STROKE_WIDTH,
            stroke: get(selectedColor),
            fill: "transparent",
        });
        canvas.add(rectangle);
        canvas.renderAll();
    });
    canvas.on("mouse:move", function (o) {
        if (!isDrawing) return;
        let pointer = canvas.getScenePoint(o.e);
        if (rectangle && rectangle.left && rectangle.top) {
            rectangle.set({
                width: pointer.x - rectangle.left,
                height: pointer.y - rectangle.top,
            });
            canvas.renderAll();
        }
    });
    canvas.on("mouse:up", function () {
        isDrawing = false;
        selectTool(canvas, "select");
    });

};

function drawCircle(canvas: Canvas) {
    canvas.defaultCursor = "crosshair";
    let isDrawing = false;
    let circle: Circle;
    canvas.on("mouse:down", function (o) {
        isDrawing = true;
        let pointer = canvas.getScenePoint(o.e);
        let startPoint = { x: pointer.x, y: pointer.y };
        let endPoint = { x: pointer.x, y: pointer.y };
        let radius = Math.abs((endPoint.x - startPoint.x) / 2);
        circle = new Circle({
            left: startPoint.x - radius,
            top: startPoint.y - radius,
            radius: radius,
            strokeWidth: STROKE_WIDTH,
            stroke: get(selectedColor),
            fill: "transparent",
        });
        canvas.add(circle);
        canvas.renderAll();
    });
    canvas.on("mouse:move", function (o) {
        if (!isDrawing) return;
        let pointer = canvas.getScenePoint(o.e);
        if (circle && circle.left) {
            let radius = Math.abs((pointer.x - circle.left) / 2);
            circle.set({
                radius: radius,
            });
            canvas.renderAll();
        }
    });
    canvas.on("mouse:up", function () {
        isDrawing = false;
        selectTool(canvas, "select");
    });

};

function drawTriangle(canvas: Canvas) {
    canvas.defaultCursor = "crosshair";
    let isDrawing = false;
    let triangle: Triangle;
    let startPoint = { x: 0, y: 0 };
    canvas.on("mouse:down", function (o) {
        isDrawing = true;
        let pointer = canvas.getScenePoint(o.e);
        startPoint = { x: pointer.x, y: pointer.y };
        triangle = new Triangle({
            left: startPoint.x,
            top: startPoint.y,
            width: 0,
            height: 0,
            strokeWidth: STROKE_WIDTH,
            stroke: get(selectedColor),
            fill: "transparent",
        });
        canvas.add(triangle);
        canvas.renderAll();
    });
    canvas.on("mouse:move", function (o) {
        if (!isDrawing) return;
        let pointer = canvas.getScenePoint(o.e);
        if (triangle && triangle.left) {
            let width = pointer.x - startPoint.x;
            let height = pointer.y - startPoint.y;

            triangle.set({
                width: Math.abs(width),
                height: Math.abs(height),
                left: width > 0 ? startPoint.x : startPoint.x + width,
                top: height > 0 ? startPoint.y : startPoint.y + height
            });
            canvas.renderAll();
        }
    });
    canvas.on("mouse:up", function () {
        isDrawing = false;
        selectTool(canvas, "select");
    });

};

function drawDiamond(canvas: Canvas) {
    canvas.defaultCursor = "crosshair";
    let isDrawing = false;
    let diamond: Diamond;

    canvas.on("mouse:down", function (o) {
        isDrawing = true;
        let pointer = canvas.getScenePoint(o.e);
        let startPoint = { x: pointer.x, y: pointer.y };
        let endPoint = { x: pointer.x, y: pointer.y };
        diamond = new Diamond({
            left: startPoint.x,
            top: startPoint.y,
            width: endPoint.x - startPoint.x,
            height: endPoint.y - startPoint.y,
            strokeWidth: STROKE_WIDTH,
            stroke: get(selectedColor),
            fill: "transparent",
        })
        canvas.add(diamond);
        canvas.renderAll();
    });
    canvas.on("mouse:move", function (o) {
        if (!isDrawing) return;
        let pointer = canvas.getScenePoint(o.e);
        if (diamond && diamond.left) {
            diamond.set({
                width: pointer.x - diamond.left,
                height: pointer.y - diamond.top,
            });

            canvas.renderAll();
        }
    });
    canvas.on("mouse:up", function () {
        isDrawing = false;
        selectTool(canvas, "select");
    });
}

function drawHexagon(canvas: Canvas) {
    canvas.defaultCursor = "crosshair";
    let isDrawing = false;
    let hexagon: Hexagon;

    canvas.on("mouse:down", function (o) {
        isDrawing = true;
        let pointer = canvas.getScenePoint(o.e);
        let startPoint = { x: pointer.x, y: pointer.y };
        let endPoint = { x: pointer.x, y: pointer.y };
        hexagon = new Hexagon({
            left: startPoint.x,
            top: startPoint.y,
            width: endPoint.x - startPoint.x,
            height: endPoint.y - startPoint.y,
            strokeWidth: STROKE_WIDTH,
            stroke: get(selectedColor),
            fill: "transparent",
        })
        canvas.add(hexagon);
        canvas.renderAll();
    });
    canvas.on("mouse:move", function (o) {
        if (!isDrawing) return;
        let pointer = canvas.getScenePoint(o.e);
        if (hexagon && hexagon.left) {
            hexagon.set({
                width: pointer.x - hexagon.left,
                height: pointer.y - hexagon.top,
            });

            canvas.renderAll();
        }
    });
    canvas.on("mouse:up", function () {
        isDrawing = false;
        selectTool(canvas, "select");
    });
}

function drawHeart(canvas: Canvas) {
    canvas.defaultCursor = "crosshair";
    let isDrawing = false;
    let heart: Heart;

    canvas.on("mouse:down", function (o) {
        isDrawing = true;
        let pointer = canvas.getScenePoint(o.e);
        let startPoint = { x: pointer.x, y: pointer.y };
        let endPoint = { x: pointer.x, y: pointer.y };
        heart = new Heart({
            left: startPoint.x,
            top: startPoint.y,
            width: endPoint.x - startPoint.x,
            height: endPoint.y - startPoint.y,
            strokeWidth: STROKE_WIDTH,
            stroke: get(selectedColor),
            fill: "transparent",
        })
        canvas.add(heart);
        canvas.renderAll();
    });
    canvas.on("mouse:move", function (o) {
        if (!isDrawing) return;
        let pointer = canvas.getScenePoint(o.e);
        if (heart && heart.left) {
            heart.set({
                width: pointer.x - heart.left,
                height: pointer.y - heart.top,
            });

            canvas.renderAll();
        }
    });
    canvas.on("mouse:up", function () {
        isDrawing = false;
        selectTool(canvas, "select");
    });
}
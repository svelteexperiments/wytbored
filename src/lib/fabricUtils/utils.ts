import { Canvas, Point } from "fabric";

export const initFabric = (): Canvas => {
    const canvas = new Canvas("canvas", { imageSmoothingEnabled: false, backgroundColor: '#f9fafb', isDrawingMode: false });
    canvas.setDimensions({ width: window.innerWidth, height: window.innerHeight });
    registerDefaultEvents(canvas)

    // Start Test

    // End Test

    return canvas
}

export const registerDefaultEvents = (canvas: Canvas) => {
    const ZOOM_MIN = 0.2;
    const ZOOM_MAX = 10;
    let isDragging: boolean = false;
    let lastPosX: number;
    let lastPosY: number;
    // Add Behavior
    canvas.on('mouse:wheel', (opt) => {
        const { deltaY, offsetX, offsetY } = opt.e
        let zoom = canvas.getZoom()
        zoom *= 1.01 ** deltaY
        if (zoom > ZOOM_MAX) zoom = ZOOM_MAX
        if (zoom < ZOOM_MIN) zoom = ZOOM_MIN
        const zoom_point = new Point({ x: offsetX, y: offsetY })
        canvas.zoomToPoint(zoom_point, zoom)
    })

    canvas.on('mouse:down', (opt) => {
        const evt = opt.e;
        if (evt.altKey === true) {
            isDragging = true;
            canvas.selection = false;
            if ('clientX' in evt) {
                lastPosX = evt.clientX;
                lastPosY = evt.clientY;
            } else if ('touches' in evt) {
                lastPosX = evt.touches[0].clientX;
                lastPosY = evt.touches[0].clientY;
            } else {
                return;
            }
        }
    });

    canvas.on('mouse:move', (opt) => {
        if (isDragging) {
            const evt = opt.e;
            const vpt = canvas.viewportTransform;
            let currentX: number;
            let currentY: number;
            if ('clientX' in evt) {
                currentX = evt.clientX;
                currentY = evt.clientY;
            } else if ('touches' in evt) {
                currentX = evt.touches[0].clientX;
                currentY = evt.touches[0].clientY;
            } else {
                return;
            }
            vpt[4] += currentX - lastPosX;
            vpt[5] += currentY - lastPosY;
            canvas.requestRenderAll();
            lastPosX = currentX;
            lastPosY = currentY;
        }
    });

    canvas.on('mouse:up', () => {
        isDragging = false;
        canvas.selection = true;
    });

    window.addEventListener('resize', () => {
        canvas.setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        });
    });
}


import type { Context } from "konva/lib/Context.js";
import { Shape } from "konva/lib/Shape.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";

export class RoughBoxCheck extends Shape {
    _sceneFunc(context: Context) {
        const { width, height, stroke, strokeWidth, fill, roughness, bowing, seed } = this.attrs;

        // Create rough.js canvas
        // @ts-ignore
        const rc = new RoughCanvas(context.canvas);

        // Draw rough rectangle (box)
        rc.rectangle(0, 0, width, height, {
            stroke: stroke || "black",
            strokeWidth: strokeWidth || 1,
            fill: fill || "transparent",
            roughness: roughness ?? 2,
            bowing: bowing ?? 2,
            seed: seed,
        });

        // Define checkmark points relative to width and height
        const checkStartX = width * 0.16;  // 32.6344 / 201
        const checkStartY = height * 0.57; // 113.927 / 201
        const checkMidX = width * 0.47;    // 95.3573 / 201
        const checkMidY = height * 0.77;   // 155.029 / 201
        const checkEndX = width * 0.84;    // 168.469 / 201
        const checkEndY = height * 0.31;   // 62.2749 / 201

        // Draw rough checkmark
        rc.line(checkStartX, checkStartY, checkMidX, checkMidY, {
            stroke: stroke || "black",
            strokeWidth: strokeWidth || 2,
            roughness: roughness ?? 2,
            bowing: bowing ?? 2,
            seed: seed,
        });

        rc.line(checkMidX, checkMidY, checkEndX, checkEndY, {
            stroke: stroke || "black",
            strokeWidth: strokeWidth || 2,
            roughness: roughness ?? 2,
            bowing: bowing ?? 2,
            seed: seed,
        });

        context.fillStrokeShape(this);
    }

    _hitFunc(context: Context) {
        const { width, height } = this.attrs;

        context.beginPath();
        // Draw hit region for rectangle
        context.moveTo(0, 0);
        context.lineTo(width, 0);
        context.lineTo(width, height);
        context.lineTo(0, height);
        context.closePath();

        // Draw hit region for checkmark
        context.moveTo(width * 0.16, height * 0.57);
        context.lineTo(width * 0.47, height * 0.77);
        context.lineTo(width * 0.84, height * 0.31);

        context.fillStrokeShape(this); // Ensures Konva detects interactivity
    }
}
RoughBoxCheck.prototype.className = "RoughBoxCheck"
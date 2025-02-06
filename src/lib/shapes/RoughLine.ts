import type { Context } from "konva/lib/Context.js";
import { Line } from "konva/lib/shapes/Line.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";

export class RoughLine extends Line {
    _sceneFunc(context: Context) {
        if (!this.attrs.rough) {
            // Default line rendering if rough is not enabled
            return super._sceneFunc(context);
        }

        // Create rough canvas with a fixed seed
        // @ts-ignore
        const rc = new RoughCanvas(context.canvas, {
            seed: this.attrs.seed || 1 // Use provided seed or default to 1
        });

        // Extract the line points
        const points = this.points();

        // Loop through pairs of points and draw rough line segments
        for (let i = 0; i < points.length - 2; i += 2) {
            const x1 = points[i];
            const y1 = points[i + 1];
            const x2 = points[i + 2];
            const y2 = points[i + 3];

            // Create rough line segment between two points
            rc.line(x1, y1, x2, y2, {
                seed: this.attrs.seed || 1,
                stroke: this.stroke() as string,
                strokeWidth: this.strokeWidth(),
                fill: this.fill() as string,
                fillStyle: this.attrs.fillStyle || 'cross-hatch',
                fillWeight: this.attrs.fillWeight || 1,
                hachureGap: this.attrs.hachureGap || 5,
                roughness: this.attrs.roughness || 2
            });
        }
    }

    _hitFunc(context: Context) {
        context.beginPath();
        const points = this.points();
        context.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += 2) {
            context.lineTo(points[i], points[i + 1]);
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
}

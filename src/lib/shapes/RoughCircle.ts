import type { Context } from "konva/lib/Context.js";
import { Circle } from "konva/lib/shapes/Circle.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";
export class RoughCircle extends Circle {
    _sceneFunc(context: Context) {
        if (!this.attrs.rough) {
            // Default circle rendering if rough is not enabled
            return super._sceneFunc(context);
        }

        // Create rough canvas with a fixed seed
        // @ts-ignore
        const rc = new RoughCanvas(context.canvas, {
            seed: this.attrs.seed || 1 // Use provided seed or default to 1
        });

        // Calculate position relative to shape's position
        const x = this.radius();
        const y = this.radius();

        // Create rough circle with specified properties
        const roughCircle = rc.circle(x - this.radius(), y - this.radius(), this.radius() * 2, {
            seed: this.attrs.seed || 1, // Use same seed for the shape
            stroke: this.stroke() as string,
            strokeWidth: this.strokeWidth(),
            fill: this.fill() as string,
            fillStyle: this.attrs.fillStyle || 'cross-hatch',
            fillWeight: this.attrs.fillWeight || 1,
            hachureGap: this.attrs.hachureGap || 5,
            roughness: 2
        });

        // Draw the rough circle
        rc.draw(roughCircle);
    }
    _hitFunc(context: Context) {
        // Draw a standard circle hit region
        context.beginPath();
        // assuming the circle’s center is at (0, 0) after applying offset
        context.arc(0, 0, this.radius(), 0, Math.PI * 2, false);
        context.closePath();
        // Konva specific method to apply fill and stroke styles to hit region
        context.fillStrokeShape(this);
    }
}
RoughCircle.prototype.className = "RoughCircle"
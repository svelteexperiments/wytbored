import type { Context } from "konva/lib/Context.js";
import { Rect } from "konva/lib/shapes/Rect.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";
export class RoughRect extends Rect {
    _sceneFunc(context: Context) {
        if (!this.attrs.rough) {
            // Default rect rendering if rough is not enabled
            return super._sceneFunc(context);
        }

        // Create rough canvas with a fixed seed
        // @ts-ignore
        const rc = new RoughCanvas(context.canvas, {
            seed: this.attrs.seed || 1 // Use provided seed or default to 1
        });

        // Create rough rect with specified properties
        const roughRect = rc.rectangle(0, 0, this.width(), this.height(), {
            seed: this.attrs.seed || 1, // Use same seed for the shape
            stroke: this.stroke() as string,
            strokeWidth: this.strokeWidth(),
            fill: this.fill() as string,
            fillStyle: this.attrs.fillStyle || 'cross-hatch',
            fillWeight: this.attrs.fillWeight || 1,
            hachureGap: this.attrs.hachureGap || 5,
            roughness: 2
        });

        // Draw the rough rect
        rc.draw(roughRect);
    }
    _hitFunc(context: Context) {
        // Draw a standard rect hit region
        context.beginPath();
        // assuming the rect’s center is at (0, 0) after applying offset
        context.rect(0, 0, this.width(), this.height());
        context.closePath();
        // Konva specific method to apply fill and stroke styles to hit region
        context.fillStrokeShape(this);
    }
}
RoughRect.prototype.className = "RoughRect"
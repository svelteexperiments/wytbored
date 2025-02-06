import type { Context } from "konva/lib/Context.js";
import { RegularPolygon } from "konva/lib/shapes/RegularPolygon.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";

export class RoughPolygon extends RegularPolygon {
    _sceneFunc(context: Context) {
        if (!this.attrs.rough) {
            return super._sceneFunc(context);
        }

        // @ts-ignore
        const rc = new RoughCanvas(context.canvas, {
            seed: this.attrs.seed || 1
        });

        const sides = this.sides();
        const radius = this.radius();
        const angleStep = (Math.PI * 2) / sides;

        // Generate polygon points
        const points: [number, number][] = [];
        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep - Math.PI / 2;
            points.push([Math.cos(angle) * radius, Math.sin(angle) * radius]);
        }


        // Create a rough polygon
        const roughPolygon = rc.polygon(points, {
            seed: this.attrs.seed || 1,
            stroke: this.stroke() as string,
            strokeWidth: this.strokeWidth(),
            fill: this.fill() as string,
            fillStyle: this.attrs.fillStyle || 'cross-hatch',
            fillWeight: this.attrs.fillWeight || 1,
            hachureGap: this.attrs.hachureGap || 5,
            roughness: 2
        });

        // Draw the rough polygon
        rc.draw(roughPolygon);
    }

    _hitFunc(context: Context) {
        context.beginPath();
        const sides = this.sides();
        const radius = this.radius();
        const angleStep = (Math.PI * 2) / sides;

        for (let i = 0; i < sides; i++) {
            const angle = i * angleStep;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
}

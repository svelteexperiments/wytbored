import type { Context } from "konva/lib/Context.js";
import { Star } from "konva/lib/shapes/Star.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";
import type { Point } from "roughjs/bin/geometry.js";

export class RoughStar extends Star {
    _sceneFunc(context: Context) {
        const { innerRadius, outerRadius, stroke, strokeWidth, fill } = this.attrs;

        // Create a roughjs generator
        // @ts-ignore
        const rc = new RoughCanvas(context.canvas);

        // Generate the rough path for a star
        const pathData = this._generateStarPath(innerRadius, outerRadius);

        // Use Rough.js to create a sketchy version of the path
        rc.path(pathData, {
            stroke: stroke || 'black',
            strokeWidth: strokeWidth || 1,
            fill: fill || 'transparent',
            roughness: 2, // Adjust the roughness to your preference
            bowing: 2,
            seed: this.attrs.seed
        });

        context.fillStrokeShape(this);
    }

    // Method to generate the star path
    _generateStarPath(innerRadius: number, outerRadius: number) {
        const numberOfPoints = 5; // Typical 5-point star
        let path = '';

        for (let i = 0; i < numberOfPoints * 2; i++) {
            const angle = (i * Math.PI) / numberOfPoints - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;

            const xOffset = Math.cos(angle) * radius;
            const yOffset = Math.sin(angle) * radius;

            if (i === 0) {
                path += `M ${xOffset} ${yOffset}`;
            } else {
                path += ` L ${xOffset} ${yOffset}`;
            }
        }

        path += ' Z'; // Close the path
        return path;
    }

    _hitFunc(context: Context) {
        // Draw a standard star hit region
        context.beginPath();
        const points = this.getPoints();
        context.moveTo(points[0] as unknown as number, points[1] as unknown as number);
        for (let i = 2; i < points.length; i += 2) {
            context.lineTo(points[i] as unknown as number, points[i + 1] as unknown as number);
        }
        context.closePath();
        // Konva specific method to apply fill and stroke styles to hit region
        context.fillStrokeShape(this);
    }

    getPoints(): Point[] {
        const numPoints = this.numPoints();
        const innerRadius = this.innerRadius();
        const outerRadius = this.outerRadius();
        const angle = Math.PI / numPoints;
        const points: number[] = [];

        for (let i = 0; i < 2 * numPoints; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = radius * Math.cos(i * angle);
            const y = radius * Math.sin(i * angle);
            points.push(x, y);
        }

        return points as unknown as Point[];
    }
}
RoughStar.prototype.className = "RoughStar"
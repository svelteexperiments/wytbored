import type { Context } from "konva/lib/Context.js";
import { Shape } from "konva/lib/Shape.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";

export class RoughBoxX extends Shape {
    _sceneFunc(context: Context) {
        const { width, height, stroke, strokeWidth, fill, roughness, bowing, seed } = this.attrs;

        // Create a rough.js generator
        // @ts-ignore
        const rc = new RoughCanvas(context.canvas);

        // Generate rough paths for the box and X
        const boxPath = this._generateBoxPath(width, height);
        const xPath = this._generateXPath(width, height);

        // Draw box
        rc.path(boxPath, {
            stroke: stroke || "black",
            strokeWidth: strokeWidth || 1,
            fill: fill || "transparent",
            roughness: roughness ?? 2,
            bowing: bowing ?? 2,
            seed: seed,
        });

        // Draw X
        rc.path(xPath, {
            stroke: stroke || "black",
            strokeWidth: strokeWidth || 1,
            roughness: roughness ?? 2,
            bowing: bowing ?? 2,
            seed: seed,
        });

        context.fillStrokeShape(this);
    }

    _generateBoxPath(width: number, height: number): string {
        return `
      M 0 0
      L ${width} 0
      L ${width} ${height}
      L 0 ${height}
      Z
    `;
    }

    _generateXPath(width: number, height: number): string {
        return `
      M 0 0
      L ${width} ${height}
      
      M ${width} 0
      L 0 ${height}
    `;
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

        // Draw hit region for X
        context.moveTo(0, 0);
        context.lineTo(width, height);
        context.moveTo(width, 0);
        context.lineTo(0, height);

        context.fillStrokeShape(this); // Ensures Konva detects it as an interactive shape
    }
}

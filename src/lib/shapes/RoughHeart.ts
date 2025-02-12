import type { Context } from "konva/lib/Context.js";
import { Shape } from "konva/lib/Shape.js";
import { RoughCanvas } from "roughjs/bin/canvas.js";

export class RoughHeart extends Shape {
  _sceneFunc(context: Context) {
    const { width, height, stroke, strokeWidth, fill, roughness, bowing, seed } = this.attrs;

    // Create a rough.js generator
    // @ts-ignore
    const rc = new RoughCanvas(context.canvas);

    // Generate rough path for the heart
    const pathData = this._generateHeartPath(width, height);

    // Use Rough.js to draw the sketchy heart
    rc.path(pathData, {
      stroke: stroke || "black",
      strokeWidth: strokeWidth || 1,
      fill: fill || "transparent",
      roughness: roughness ?? 2, // Controls sketchiness
      bowing: bowing ?? 2, // Controls waviness
      seed: seed,
    });

    context.fillStrokeShape(this);
  }

  // Generates a scalable heart path
  _generateHeartPath(width: number, height: number): string {
    const scaleX = width / 200;
    const scaleY = height / 180;

    return `
      M ${100.535 * scaleX} ${58.2275 * scaleY}
      C ${100.184 * scaleX} ${-17.8524 * scaleY} ${-2.54953 * scaleX} ${-16.4691 * scaleY} 
        ${0.60615 * scaleX} ${55.4614 * scaleY}
      C ${3.76183 * scaleX} ${127.392 * scaleY} ${100.535 * scaleX} ${123.703 * scaleY} 
        ${100.535 * scaleX} ${181.339 * scaleY}
      
      M ${100.535 * scaleX} ${58.2275 * scaleY}
      C ${100.886 * scaleX} ${-17.8524 * scaleY} ${203.619 * scaleX} ${-16.4691 * scaleY} 
        ${200.464 * scaleX} ${55.4614 * scaleY}
      C ${197.308 * scaleX} ${127.392 * scaleY} ${100.535 * scaleX} ${123.703 * scaleY} 
        ${100.535 * scaleX} ${181.339 * scaleY}
    `;
  }

  _hitFunc(context: Context) {
    const { width, height } = this.attrs;

    context.beginPath();
    const scaleX = width / 200;
    const scaleY = height / 180;

    // Approximate the heart's bounding box for hit detection
    context.moveTo(100.535 * scaleX, 58.2275 * scaleY);
    context.bezierCurveTo(
      100.184 * scaleX, -17.8524 * scaleY,
      -2.54953 * scaleX, -16.4691 * scaleY,
      0.60615 * scaleX, 55.4614 * scaleY
    );
    context.bezierCurveTo(
      3.76183 * scaleX, 127.392 * scaleY,
      100.535 * scaleX, 123.703 * scaleY,
      100.535 * scaleX, 181.339 * scaleY
    );

    context.moveTo(100.535 * scaleX, 58.2275 * scaleY);
    context.bezierCurveTo(
      100.886 * scaleX, -17.8524 * scaleY,
      203.619 * scaleX, -16.4691 * scaleY,
      200.464 * scaleX, 55.4614 * scaleY
    );
    context.bezierCurveTo(
      197.308 * scaleX, 127.392 * scaleY,
      100.535 * scaleX, 123.703 * scaleY,
      100.535 * scaleX, 181.339 * scaleY
    );

    context.closePath();
    context.fillStrokeShape(this);
  }

}

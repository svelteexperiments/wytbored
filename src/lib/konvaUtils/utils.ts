import { Layer } from "konva/lib/Layer.js";
import { Shape } from "konva/lib/Shape.js";
import { Transformer } from "konva/lib/shapes/Transformer.js";
import { Stage } from "konva/lib/Stage.js";

export const initKonva = (containerDiv: HTMLDivElement, stageWidth: number, stageHeight: number) => {
    let stage = new Stage({
        container: containerDiv,
        width: stageWidth,
        height: stageHeight
    });

    // Add layer
    let layer = new Layer();
    // Add a transform objected
    const tr = new Transformer({
        id: 'global-selector'
    })
    tr.on('transformstart', (evt) => {
        evt.cancelBubble = true;
    });
    tr.on('dragstart', (evt) => {
        evt.cancelBubble = true;
    });

    layer.add(tr)
    stage.add(layer);

    // registerDefaultEvents(stage)

    return { stage, layer }
}

// export const registerDefaultEvents = (stage: Stage) => {
//     let scale = 1
//     // Scale limits
//     const MIN_SCALE = 0.5; // 50%
//     const MAX_SCALE = 4; // 400%
//     // Handle zoom with mouse wheel
//     stage.on("wheel", (e) => {
//         e.evt.preventDefault();
//         if (!stage) return;

//         const oldScale = stage.scaleX();
//         const pointer = stage.getPointerPosition();
//         if (!pointer) return;
//         const mousePointTo = {
//             x: (pointer.x - stage.x()) / oldScale,
//             y: (pointer.y - stage.y()) / oldScale,
//         };

//         let newScale = oldScale * (e.evt.deltaY > 0 ? 0.9 : 1.1);
//         newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));
//         scale = newScale;

//         stage.scale({ x: newScale, y: newScale });

//         const newPos = {
//             x: pointer.x - mousePointTo.x * newScale,
//             y: pointer.y - mousePointTo.y * newScale,
//         };

//         stage.position(newPos);
//         stage.batchDraw();
//     });
// }


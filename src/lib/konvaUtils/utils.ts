import { Layer } from "konva/lib/Layer.js";
import { Shape } from "konva/lib/Shape.js";
import { Transformer } from "konva/lib/shapes/Transformer.js";
import { Stage } from "konva/lib/Stage.js";
import { addImage, addTextNode, editingText, selectTool } from "./tools.js";
import { get, writable } from "svelte/store";
import { Group } from "konva/lib/Group.js";

export const isHelpModalOpen = writable<boolean>(false)
export const isToastOpen = writable<boolean>(false);

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
    tr.on('transformend', (evt) => {
        stage.fire("object:modified", { target: evt.target })
    });

    layer.add(tr)
    stage.add(layer);

    registerDefaultEvents(stage)
    editingText.subscribe((val) => {
        if (!val) {
            document.addEventListener('keydown', keyEvents);
        } else {
            document.removeEventListener('keydown', keyEvents)
        }
    })

    async function keyEvents(event: KeyboardEvent) {
        event.preventDefault()
        const tr: Transformer = <Transformer>layer.getChildren().find((child) => child.id() == "global-selector")
        if (event.key === 'Escape' && !get(isHelpModalOpen)) {
            selectTool(stage, layer, "select")
        }
        if (event.key === "Delete") {
            if (!tr) return;
            tr.getNodes().forEach(node => {
                node.destroy()
                stage.fire('object:removed', { target: node })
            })
            tr.nodes([])
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
            if (!tr) return;
            tr.getNodes().forEach(node => {
                if (node instanceof Shape || node instanceof Group) {
                    const clonedNode = node.clone({
                        // Offset the cloned node to avoid overlap
                        x: node.x() + 20,
                        y: node.y() + 20,
                    });
                    layer.add(clonedNode)
                    stage.fire('object:added', { target: clonedNode })
                    tr.nodes([clonedNode])
                }
            })
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
            const allNodes = layer.find(".shape");
            if (allNodes.length === 0) return;
            tr.nodes(allNodes);
            layer.batchDraw();
        }
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const selectedNodes = tr.nodes();
            if (selectedNodes.length === 0) return;
            const moveStep = 10;
            selectedNodes.forEach(node => {
                // Move the node based on the arrow key pressed
                switch (event.key) {
                    case 'ArrowUp':
                        node.move({ x: 0, y: -moveStep });
                        break;
                    case 'ArrowDown':
                        node.move({ x: 0, y: moveStep });
                        break;
                    case 'ArrowLeft':
                        node.move({ x: -moveStep, y: 0 });
                        break;
                    case 'ArrowRight':
                        node.move({ x: moveStep, y: 0 });
                        break;
                }
                stage.fire('object:modified', { target: node })
            });
        }
        if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
            try {
                const pos = stage.getPointerPosition()
                if (!pos) return
                const transformedPos = stage.getAbsoluteTransform().copy().invert().point(pos)
                const clipboardItems = await navigator.clipboard.read();
                if (clipboardItems.length == 0) return;
                const mostRecentItem = clipboardItems[0];
                if (mostRecentItem.types.includes('text/plain')) {
                    const text = await mostRecentItem.getType('text/plain');
                    const textData = await text.text();

                    addTextNode(stage, layer, transformedPos, textData)
                    return;
                }
                if (mostRecentItem.types.includes('image/png')) {
                    const imageBlob = await mostRecentItem.getType('image/png');
                    const imageUrl = URL.createObjectURL(imageBlob);
                    const img = new Image();
                    img.src = imageUrl;
                    img.onload = () => {
                        addImage(stage, layer, pos, img)
                    }
                    img.onerror = (error) => {
                        console.error('Failed to load image:', error);
                    };
                    return;
                }
            } catch (error) {
                console.error('Failed to read clipboard contents:', error);
            }
        }
    }


    return { stage, layer }
}

export const registerDefaultEvents = (stage: Stage) => {
    // Scale limits
    const MIN_SCALE = 0.5; // 50%
    const MAX_SCALE = 4; // 400%

    // Handle zoom with mouse wheel
    stage.on("wheel", (e) => {
        e.evt.preventDefault();
        if (!stage) return;

        const oldScale = stage.scaleX();
        const pointer = stage.getPointerPosition();
        if (!pointer) return;
        const mousePointTo = {
            x: (pointer.x - stage.x()) / oldScale,
            y: (pointer.y - stage.y()) / oldScale,
        };

        let newScale = oldScale * (e.evt.deltaY > 0 ? 0.9 : 1.1);
        newScale = Math.max(MIN_SCALE, Math.min(newScale, MAX_SCALE));

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.position(newPos);
        stage.batchDraw();
    });

    stage.on("dragend", (e) => {
        if (e.target instanceof Stage) return;
        stage.fire("object:modified", { target: e.target })
    })
}


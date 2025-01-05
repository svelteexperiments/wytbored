import { classRegistry, FabricObject, type FabricObjectProps, type ObjectEvents, type SerializedObjectProps, type TClassProperties, type TOptions } from "fabric";

export interface SerializedHeartProps extends SerializedObjectProps {
    // Remove size from serialized props since we'll use width/height
}

export const heartDefaultValues: Partial<TClassProperties<Heart>> = {
    width: 100,
    height: 100,
};

export class Heart<
    Props extends TOptions<FabricObjectProps> = Partial<FabricObjectProps>,
    SProps extends SerializedHeartProps = SerializedHeartProps,
    EventSpec extends ObjectEvents = ObjectEvents
> extends FabricObject<Props, SProps, EventSpec> {
    static type = 'Heart';
    static ownDefaults = heartDefaultValues;

    static getDefaults(): Record<string, any> {
        return {
            ...super.getDefaults(),
            ...Heart.ownDefaults,
        };
    }

    constructor(options: Props = {} as Props) {
        super();
        this.initialize(options);
    }

    initialize(options: Props = {} as Props) {
        Object.assign(this, Heart.ownDefaults);
        this.setOptions(options);
    }

    _render(ctx: CanvasRenderingContext2D) {
        const width = this.width!;
        const height = this.height!;

        // Calculate scale factors based on width and height
        const scaleX = width / 100;
        const scaleY = height / 100;

        // Center the heart
        ctx.translate(-width / 2, -height / 2);
        ctx.scale(scaleX, scaleY);

        ctx.beginPath();
        ctx.moveTo(50, 70);  // Start at the tip of the heart

        // Left lobe with deeper top dip
        ctx.bezierCurveTo(
            10, 50,     // Pulls more inward (closer horizontally)
            25, 5,      // Sharper, deeper dip at the top
            50, 35      // End point - emphasizes dip further down
        );

        // Right lobe - Mirrored for symmetry
        ctx.bezierCurveTo(
            75, 5,      // Mirror of (25, 5)
            90, 50,     // Mirror of (10, 50)
            50, 70      // Back to the tip of the heart
        );

        ctx.closePath();
        this._renderPaintInOrder(ctx);
    }

    toObject<
        T extends Omit<Props & TClassProperties<this>, keyof SProps>,
        K extends keyof T = never
    >(propertiesToInclude: K[] = []): Pick<T, K> & SProps {
        return {
            ...super.toObject(propertiesToInclude),
        };
    }

    static fromObject<T extends TOptions<SerializedHeartProps>>(object: T) {
        return this._fromObject<Heart>(object);
    }
}

classRegistry.setClass(Heart);
classRegistry.setSVGClass(Heart);
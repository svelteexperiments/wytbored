import { classRegistry, FabricObject, type FabricObjectProps, type ObjectEvents, type SerializedObjectProps, type TClassProperties, type TOptions } from "fabric";

export interface SerializedDiamondProps extends SerializedObjectProps {
    width: number;
    height: number;
}

export const diamondDefaultValues: Partial<TClassProperties<Diamond>> = {
    width: 100,
    height: 100,
};

export class Diamond<
    Props extends TOptions<FabricObjectProps> = Partial<FabricObjectProps>,
    SProps extends SerializedDiamondProps = SerializedDiamondProps,
    EventSpec extends ObjectEvents = ObjectEvents
> extends FabricObject<Props, SProps, EventSpec> {
    declare width: number;
    declare height: number;
    static type = 'Diamond';
    static ownDefaults = diamondDefaultValues;

    static getDefaults(): Record<string, any> {
        return {
            ...super.getDefaults(),
            ...Diamond.ownDefaults,
        };
    }

    constructor(options: Props = {} as Props) {
        super();
        this.initialize(options);
    }

    initialize(options: Props = {} as Props) {
        Object.assign(this, Diamond.ownDefaults);
        this.setOptions(options);
        this._updateDimensions();
    }

    _updateDimensions() {
        this.width = this.width || diamondDefaultValues.width!;
        this.height = this.height || diamondDefaultValues.height!;

        // Center origin
        this.originX = 'center';
        this.originY = 'center';
    }

    _render(ctx: CanvasRenderingContext2D) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        ctx.beginPath();
        ctx.moveTo(0, -halfHeight); // Top point
        ctx.lineTo(halfWidth, 0);   // Right point
        ctx.lineTo(0, halfHeight);  // Bottom point
        ctx.lineTo(-halfWidth, 0);  // Left point
        ctx.closePath();
        this._renderPaintInOrder(ctx);
    }

    set(key: Partial<Props> | string, value?: any) {
        const ret = super.set(key, value);

        if (typeof key === 'object') {
            if (key.hasOwnProperty('width') || key.hasOwnProperty('height')) {
                this._updateDimensions();
            }
        } else if (key === 'width' || key === 'height') {
            this._updateDimensions();
        }

        return ret;
    }

    toObject<
        T extends Omit<Props & TClassProperties<this>, keyof SProps>,
        K extends keyof T = never
    >(propertiesToInclude: K[] = []): Pick<T, K> & SProps {
        return {
            ...super.toObject(propertiesToInclude),
            width: this.width,
            height: this.height,
        };
    }

    _toSVG() {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const points = [
            `0,${-halfHeight}`, // Top
            `${halfWidth},0`,   // Right
            `0,${halfHeight}`,  // Bottom
            `${-halfWidth},0`   // Left
        ];
        return [
            `<polygon points="${points.join(' ')}" />`
        ];
    }

    static fromObject<T extends TOptions<SerializedDiamondProps>>(object: T) {
        return this._fromObject<Diamond>(object);
    }
}

classRegistry.setClass(Diamond);
classRegistry.setSVGClass(Diamond);

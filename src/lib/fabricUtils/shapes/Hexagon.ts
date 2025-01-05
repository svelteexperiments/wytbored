import { classRegistry, FabricObject, type FabricObjectProps, type ObjectEvents, type SerializedObjectProps, type TClassProperties, type TOptions } from "fabric";

export interface SerializedHexagonProps extends SerializedObjectProps {
    width: number;
    height: number;
}

export const hexagonDefaultValues: Partial<TClassProperties<Hexagon>> = {
    width: 100,
    height: 100,
};

export class Hexagon<
    Props extends TOptions<FabricObjectProps> = Partial<FabricObjectProps>,
    SProps extends SerializedHexagonProps = SerializedHexagonProps,
    EventSpec extends ObjectEvents = ObjectEvents
> extends FabricObject<Props, SProps, EventSpec> {
    declare width: number;
    declare height: number;
    static type = 'Hexagon';
    static ownDefaults = hexagonDefaultValues;

    static getDefaults(): Record<string, any> {
        return {
            ...super.getDefaults(),
            ...Hexagon.ownDefaults,
        };
    }

    constructor(options: Props = {} as Props) {
        super();
        this.initialize(options);
    }

    initialize(options: Props = {} as Props) {
        Object.assign(this, Hexagon.ownDefaults);
        this.setOptions(options);
        this._updateDimensions();
    }

    _updateDimensions() {
        this.width = this.width || hexagonDefaultValues.width!;
        this.height = this.height || hexagonDefaultValues.height!;

        // Center origin
        this.originX = 'center';
        this.originY = 'center';
    }

    _render(ctx: CanvasRenderingContext2D) {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;
        const angle = Math.PI / 3; // 60 degrees, angle between each vertex

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const x = halfWidth * Math.cos(angle * i);
            const y = halfHeight * Math.sin(angle * i);
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
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
        const angle = Math.PI / 3; // 60 degrees, angle between each vertex
        const points = [];
        for (let i = 0; i < 6; i++) {
            const x = halfWidth * Math.cos(angle * i);
            const y = halfHeight * Math.sin(angle * i);
            points.push(`${x},${y}`);
        }
        return [
            `<polygon points="${points.join(' ')}" />`
        ];
    }

    static fromObject<T extends TOptions<SerializedHexagonProps>>(object: T) {
        return this._fromObject<Hexagon>(object);
    }
}

classRegistry.setClass(Hexagon);
classRegistry.setSVGClass(Hexagon);

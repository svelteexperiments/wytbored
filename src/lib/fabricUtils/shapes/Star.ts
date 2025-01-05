import { classRegistry, FabricObject, type FabricObjectProps, type ObjectEvents, type SerializedObjectProps, type TClassProperties, type TOptions } from "fabric";


export interface SerializedStarProps extends SerializedObjectProps {
    points: number;
    innerRadius: number;
    outerRadius: number;
}

export const starDefaultValues: Partial<TClassProperties<Star>> = {
    points: 5,
    innerRadius: 50,
    outerRadius: 100,
};

export class Star<
    Props extends TOptions<FabricObjectProps> = Partial<FabricObjectProps>,
    SProps extends SerializedStarProps = SerializedStarProps,
    EventSpec extends ObjectEvents = ObjectEvents
> extends FabricObject<Props, SProps, EventSpec> {
    declare points: number;
    declare innerRadius: number;
    declare outerRadius: number;

    static type = 'Star';
    static ownDefaults = starDefaultValues;

    static getDefaults(): Record<string, any> {
        return {
            ...super.getDefaults(),
            ...Star.ownDefaults,
        };
    }

    constructor(options: Props = {} as Props) {
        super();
        this.initialize(options);
    }

    initialize(options: Props = {} as Props) {
        Object.assign(this, Star.ownDefaults);
        this.setOptions(options);
        this._updateDimensions();
    }

    _updateDimensions() {
        // Calculate dimensions based on outer radius
        const diameter = this.outerRadius * 2;
        this.width = diameter;
        this.height = diameter;

        // Set the origin to center
        this.originX = 'center';
        this.originY = 'center';
    }

    _render(ctx: CanvasRenderingContext2D) {
        if (!this.points || this.points < 2) return;

        const step = (Math.PI * 2) / this.points;
        const halfStep = step / 2;
        const start = -Math.PI / 2; // Start at top

        ctx.beginPath();

        for (let i = 0; i < this.points; i++) {
            // Outer point
            const angle = start + i * step;
            const x = Math.cos(angle) * this.outerRadius;
            const y = Math.sin(angle) * this.outerRadius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }

            // Inner point
            const innerAngle = angle + halfStep;
            const innerX = Math.cos(innerAngle) * this.innerRadius;
            const innerY = Math.sin(innerAngle) * this.innerRadius;
            ctx.lineTo(innerX, innerY);
        }

        ctx.closePath();
        this._renderPaintInOrder(ctx);
    }

    set(key: Partial<Props> | string, value?: any) {
        const ret = super.set(key, value);

        // Update dimensions if radius changes
        if (typeof key === 'object') {
            if (key.hasOwnProperty('outerRadius') || key.hasOwnProperty('innerRadius')) {
                this._updateDimensions();
            }
        } else if (key === 'outerRadius' || key === 'innerRadius') {
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
            points: this.points,
            innerRadius: this.innerRadius,
            outerRadius: this.outerRadius,
        };
    }

    _toSVG() {
        const points: string[] = [];
        const step = (Math.PI * 2) / this.points;
        const halfStep = step / 2;
        const start = -Math.PI / 2;

        for (let i = 0; i < this.points; i++) {
            // Outer point
            const angle = start + i * step;
            const x = Math.cos(angle) * this.outerRadius;
            const y = Math.sin(angle) * this.outerRadius;
            points.push(`${x},${y}`);

            // Inner point
            const innerAngle = angle + halfStep;
            const innerX = Math.cos(innerAngle) * this.innerRadius;
            const innerY = Math.sin(innerAngle) * this.innerRadius;
            points.push(`${innerX},${innerY}`);
        }

        return [
            '<polygon ',
            'COMMON_PARTS',
            `points="${points.join(' ')}" />\n`,
        ];
    }

    static fromObject<T extends TOptions<SerializedStarProps>>(object: T) {
        return this._fromObject<Star>(object);
    }
}

classRegistry.setClass(Star);

classRegistry.setSVGClass(Star)

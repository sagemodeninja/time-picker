import { LitElement, css, html } from "lit";
import { customElement, eventOptions, property, state } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { DropdownSide } from "../enums";
import { TimePicker } from "./time-picker";

@customElement('time-picker-dropdown')
export class TimePickerDropDown extends LitElement {
    static styles = css`
        :host {
            background-color: white;
            border-radius: 3px;
            box-shadow:
                0 0 2px rgba(0, 0, 0, 0.2),
                0 calc(32 * 0.5px) calc(32 * 1px) rgba(0, 0, 0, 0.24);
            display: none;
            position: fixed;
        }
    `;

    private canvasRef : Ref<HTMLCanvasElement> = createRef();

    constructor () {
        super();

        this.style.width = this.width + 'px';
        this.style.height = this.height + 'px';
    }

    @property()
    anchor: string;

    @property()
    width: number = 100;

    @property()
    height: number = 100;

    @state()
    private _hourScroll: number = 0;

    @state()
    private _minuteScroll: number = 0;

    show(anchor: TimePicker) {
        const rect = anchor.getBoundingClientRect();

        this.style.top = `${rect.bottom + 2}px`;
        this.style.left = `${rect.left}px`;
        this.style.display = 'inline-block';
    }

    hide() {
        this.style.top = null;
        this.style.left = null;
        this.style.display = 'none';
    }

    protected render() {
        return html`
            <canvas
                @wheel="${this.handleWheelEvent}"
                width="100" 
                height="100"
                ${ref(this.canvasRef)}>
            </canvas>
        `;
    }

    protected firstUpdated() {
        this.renderCanvas();
    }
    
    @eventOptions({passive: true})
    private handleWheelEvent(event: WheelEvent) {
        const canvas = this.canvasRef.value;
        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const rightX = rect.width / 2;

        const speed = 18 / 4;
        const step = event.deltaY > 0 ? 1 : -1;
        const scroll = speed * step;

        if (x > rightX)
            this._minuteScroll += scroll;
        else
            this._hourScroll += scroll;
            
        this.renderCanvas();
    }

    private renderCanvas() {
        const canvas = this.canvasRef.value;
        const context = canvas.getContext('2d');

        this.scaleCanvas(context);

        const textSize = 13;

        context.font = `${textSize}px monospace`;
        context.textBaseline = 'top';
        context.textAlign = 'center';

        this.renderValues(context, DropdownSide.Left, 1, TimePicker.MAXIMUMS.hour);
        this.renderValues(context, DropdownSide.Right, 0, TimePicker.MAXIMUMS.minute);
    }

    private scaleCanvas (context: CanvasRenderingContext2D)  {
        const ratio = window.devicePixelRatio;
        const canvas = context.canvas;

        canvas.width = this.width * ratio;
        canvas.height = this.height * ratio;
        canvas.style.width = this.width + 'px';
        canvas.style.height = this.height + 'px';

        context.scale(ratio, ratio);
    }

    private renderValues (context: CanvasRenderingContext2D, side: DropdownSide, min: number, max: number) {
        const textSize = 13;
        const lineHeight = 18;

        const maskedLength = Math.ceil(this.height / lineHeight);
        const bufferedLength = maskedLength + 2;

        const x = this.getTextX(this.width, side);
        const padding = (lineHeight - textSize) / 2;

        const scroll = side === DropdownSide.Left ? this._hourScroll : this._minuteScroll;

        for (var index = -1; index < bufferedLength; index++) {
            const offset = Math.floor(scroll / lineHeight);
            let value = offset + index + min;

            value = this.overflowValue(value, min, max);

            const text = value.toString().padStart(2, '0');
            const yOffset = Math.floor(scroll % lineHeight);

            // TODO: Refactor.
            let y = (lineHeight * index) + padding - yOffset;

            if (yOffset < 0)
                y -= lineHeight;

            context.fillText(text, x, y);
        }
    }

    private getTextX(origin: number, position: DropdownSide): number {
        const x = position === DropdownSide.Left ? 1 : 3;
        return (origin / 4) * x;
    }

    // TODO: Make into separate module.
    private overflowValue(value: number, minimum: number, maximum: number) : number {
        const range = maximum - minimum + 1;
        const distance = value - minimum;

        return (distance % range + range) % range + minimum;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "time-picker-dropdown": TimePickerDropDown;
    }
}
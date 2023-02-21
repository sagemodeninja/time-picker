import { LitElement, css, html } from "lit";
import { customElement, eventOptions, property } from "lit/decorators.js";
import { createRef, ref, Ref } from "lit/directives/ref.js";
import { DropdownSide } from "../enums";
import { TimePicker } from "./time-picker";

@customElement('time-picker-dropdown')
export class TimePickerDropDown extends LitElement {
    static styles = css`
        :host {
            background-color: white;
            border-radius: 3px;
            border-top-left-radius: 0;
            box-shadow:
                0 0 2px rgba(0, 0, 0, 0.2),
                0 calc(32 * 0.5px) calc(32 * 1px) rgba(0, 0, 0, 0.24);
            display: none;
            height: 100px;
            left: 0;
            position: fixed;
            top: 0;
            width: 100px;
        }
    `;

    private canvasRef : Ref<HTMLCanvasElement> = createRef();

    @property()
    anchor: string;

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
                ${ref(this.canvasRef)}></canvas>
        `;
    }

    protected firstUpdated() {
        const canvas = this.canvasRef.value;
        const context = canvas.getContext('2d');

        // Virtual canvas padding for all sides.
        const canvasPadding = 5;
        const clientHeight = canvas.height - canvasPadding * 2;

        // Text
        const textSize = 13;
        const lineHeight = 18;
        const maskLength = Math.ceil(clientHeight / lineHeight);

        context.font = `${textSize}px monospace`;
        context.textBaseline = 'top';
        context.textAlign = 'center';

        for(var index = 0; index < maskLength; index++) {
            const text = (index + 1).toString().padStart(2, '0');

            const padding = (lineHeight - textSize) / 2;
            const x = this.getTextX(canvas.width, DropdownSide.Left);
            const y = (lineHeight * index) + padding + canvasPadding;

            context.fillText(text, x, y);
        }

        for(var index = 0; index < maskLength; index++) {
            const text = (index + 1).toString().padStart(2, '0');

            const padding = (lineHeight - textSize) / 2;
            const x = this.getTextX(canvas.width, DropdownSide.Right);
            const y = (lineHeight * index) + padding + canvasPadding;

            context.fillText(text, x, y);
        }
    }
    
    @eventOptions({passive: true})
    private handleWheelEvent(event: WheelEvent) {
        const canvas = this.canvasRef.value;
        const rect = canvas.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        console.log(x, y);
    }

    private getTextX(origin: number, position: DropdownSide): number {
        // TODO: Refactor
        const x = position === DropdownSide.Left ? 1 : 3;

        // const offset = Math.max(3 * position, 1);
        
        return (origin / 4) * x;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "time-picker-dropdown": TimePickerDropDown;
    }
}
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
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

    @property()
    anchor: string;

    protected render() {
        return html`
            <span>Hello World!</span>
        `;
    }

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
}

declare global {
    interface HTMLElementTagNameMap {
        "time-picker-dropdown": TimePickerDropDown;
    }
}
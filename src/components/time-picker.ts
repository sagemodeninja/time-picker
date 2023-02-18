import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { TimeFormat } from '../enums';

@customElement('time-picker')
export class TimePicker extends LitElement {
    static styles = css`
        :host {
            display: inline-block;
        }

        .picker {
            border: solid 1px #000;
            border-radius: 3px;
            padding: 2px 5px;
        }

        span {
            font-size: 15px;
            line-height: 1;
        }

        span:focus {
            background-color: rgb(0 0 255 / 50%);
            outline: none;
        }
    `;

    @property({type: String})
    format = TimeFormat.StandardTime

    @state()
    private _hour : number = 0;

    @state()
    private _minute : number = 0;

    @state()
    private _isAM: boolean = true;

    private renderFormat() {
        if (this.format == TimeFormat.InternationalTime)
            return;

        return html`
        <span @keydown="${this.toggleAM}" tabindex="0">
        ${this._isAM ? "AM" : "PM"}
        </span>
        `;
    }

    protected render() {
        return html`
        <div class="picker">
            <span @keydown="${this.handleKeyDown}" data-input="_hour" tabindex="0">
                ${this._hour.toString().padStart(2, '0')}
            </span>
            <span>:</span>
            <span @keydown="${this.handleKeyDown}" data-input="_minute" tabindex="0">
                ${this._minute.toString().padStart(2, '0')}
            </span>
            ${this.renderFormat()}
        </div>
        `;
    }

    private handleKeyDown(event: KeyboardEvent) {
        const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
        const key = event.key;
        const target = event.target;

        if (!allowedKeys.includes(key) || !(target instanceof HTMLSpanElement)) {
            return;
        }
        
        const input = target.dataset['input'];
        const increment = this[input] + (39 - event.which);
        const maximum = input === '_hour' ? 24 : 60;

        this[input] = this.overflowValue(increment, 0, maximum);
    }

    private toggleAM(event: KeyboardEvent) {
        const allowedKeys = ['ArrowUp', 'ArrowDown'];

        if (!allowedKeys.includes(event.key))
            return;

        this._isAM = !this._isAM;
    }

    private overflowValue(value: number, minimum: number, maximum: number) : number {
        const range = maximum - minimum;
        const distance = value - minimum;

        return (distance % range + range) % range + minimum;
    }
}
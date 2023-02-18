import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { KeyboardArrowKey, TimeFormat } from '../enums';

@customElement('time-picker')
export class TimePicker extends LitElement {
    static readonly MAXIMUMS = {
        hour: 24,
        minute: 60,
        isAM: 2
    };

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
        <span @keydown="${this.handleKeyDown}" data-input="isAM" tabindex="3">
        ${this._isAM ? "AM" : "PM"}
        </span>
        `;
    }

    protected render() {
        // TODO: Handle standard time or 12 hour format.
        return html`
        <div class="picker">
            <span @keydown="${this.handleKeyDown}" data-input="hour" tabindex="1">
                ${this._hour.toString().padStart(2, '0')}
            </span>
            <span>:</span>
            <span @keydown="${this.handleKeyDown}" data-input="minute" tabindex="2">
                ${this._minute.toString().padStart(2, '0')}
            </span>
            ${this.renderFormat()}
        </div>
        `;
    }

    private handleKeyDown(event: KeyboardEvent) {
        if (event.key.includes('Arrow'))
            this.handleArrowInputs(event);

        if (event.key.match(/[0-9]/))
            this.handleNumericInputs(event);
    }

    private handleArrowInputs(event: KeyboardEvent) {
        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
                this.handleIncrement(event);
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                this.handleFocus(event);
                break;
        }
    }

    private handleIncrement(event: KeyboardEvent) {
        const target = event.target;

        if (!(target instanceof HTMLSpanElement))
            return;

        const input = target.dataset['input'];
        const inputKey = `_${input}`;
        const increment = this.incrementValue(this[inputKey], event.key, 39);
        const maximum = TimePicker.MAXIMUMS[input];

        this[inputKey] = this.overflowValue(increment, 0, maximum);

        // TODO: Handle increment for hour when minutes overflow.
    }

    private handleFocus(event: KeyboardEvent) {
        const currentElement = this.shadowRoot.activeElement as HTMLElement;
        const currentIndex = parseInt(currentElement.getAttribute('tabIndex'));
        const increment = this.incrementValue(currentIndex, event.key, 38);
        const nextIndex = this.overflowValue(increment, 1, 4);
        const nextElement = this.shadowRoot.querySelector(`[tabIndex="${nextIndex}"]`) as HTMLElement;

        if (nextElement)
            nextElement.focus();
    }

    private handleNumericInputs(event: KeyboardEvent) {
        // TODO: Implement numeric inputs.
        console.log('handleNumericInputs()', event);
    }

    private incrementValue(base: number, key: string, reference: number) : number {
        return base + (KeyboardArrowKey[key] - reference);
    }

    private overflowValue(value: number, minimum: number, maximum: number) : number {
        const range = maximum - minimum;
        const distance = value - minimum;

        return (distance % range + range) % range + minimum;
    }
}
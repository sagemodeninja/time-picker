import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { KeyboardArrowKey } from '../enums';

@customElement('time-picker')
export class TimePicker extends LitElement {
    static readonly MAXIMUMS = {
        hour: 12,
        minute: 59,
        isAM: 1
    };

    static styles = css`
        :host {
            display: inline-block;
        }

        .picker {
            border: solid 1px rgb(136 136 136);
            border-radius: 3px;
        }

        span {
            font-size: 15px;
            line-height: 1;
        }

        span:focus {
            background-color: rgb(181 213 255);
            outline: none;
        }
    `;

    @state()
    private _inputBuffer: string;

    @property()
    hour : number = 0;

    @property()
    minute : number = 0;

    @property()
    isAM: boolean = true;

    set value(val: string) {
        const pattern = /(\d{2}):(\d{2}) (AM|PM)/;
        const match = val.match(pattern);

        if (match) {
            const oldValue = this.value;

            this.hour = parseInt(match[1]);
            this.minute = parseInt(match[2]);
            this.isAM = match[3] === 'AM';
        
            this.requestUpdate('value', oldValue);
        }
    }

    @property()
    get value() : string {
        const hour = this.hour.toString().padStart(2, '0');
        const minute = this.minute.toString().padStart(2, '0');
        const period = this.isAM ? 'AM' : 'PM';

        return `${hour}:${minute} ${period}`;
    }

    protected render() {
        return html`
        <div class="picker">
            <span @keydown="${this.handleKeyDownEvent}"
                @focus="${this.handleFocusEvent}"
                @focusout="${this.handleFocusOutEvent}"
                data-input="hour"
                tabindex="1">
                ${this.hour.toString().padStart(2, '0')}
            </span>
            <span>:</span>
            <span @keydown="${this.handleKeyDownEvent}"
                @focus="${this.handleFocusEvent}"
                @focusout="${this.handleFocusOutEvent}"
                data-input="minute"
                tabindex="2">
                ${this.minute.toString().padStart(2, '0')}
            </span>
            <span @keydown="${this.handleKeyDownEvent}"
                data-input="isAM"
                tabindex="3">
                ${this.isAM ? "AM" : "PM"}
            </span>
        </div>
        `;
    }

    private handleKeyDownEvent(event: KeyboardEvent) {
        if (event.code.includes('Arrow'))
            this.handleArrowInputs(event);

        if (event.key.match(/[0-9]/))
            this.handleNumericInputs(event);
    }

    private handleFocusEvent() {
        this._inputBuffer = '';
    }

    private handleFocusOutEvent(event: FocusEvent) {
        const target = event.target as HTMLElement;
        const input = target.dataset['input'];
        
        const value = this[input];
        const minimum = +(input === 'hour');
        const maximum = TimePicker.MAXIMUMS[input];

        this[input] = Math.max(Math.min(value, maximum), minimum);
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

    private handleNumericInputs(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        const input = target.dataset['input'];

        if (input === 'isAM')
            return;

        this._inputBuffer += event.key;

        const value = parseInt(this._inputBuffer);
        const maximum = TimePicker.MAXIMUMS[input];

        this[input] = value;
        this.dispatchEvent(new CustomEvent('change'));

        if ((value * 10) > maximum)
            this.focusNextInput(target, 1);
    }

    private handleIncrement(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        const input = target.dataset['input'];
        const increment = this[input] + (39 - KeyboardArrowKey[event.key]);

        const minimum = +(input === 'hour');
        const maximum = TimePicker.MAXIMUMS[input];

        this[input] = this.overflowValue(increment, minimum, maximum);
        this.dispatchEvent(new CustomEvent('change'));
    }

    private handleFocus(event: KeyboardEvent) {
        const element = this.shadowRoot.activeElement as HTMLElement;
        const increment = KeyboardArrowKey[event.key] - 38;
        
        this.focusNextInput(element, increment);
    }

    private focusNextInput(currentInput: HTMLElement, increment: number) {
        const currentIndex = parseInt(currentInput.getAttribute('tabIndex'));
        const index = currentIndex + increment;
        const element = this.shadowRoot.querySelector(`[tabIndex="${index}"]`) as HTMLElement;

        element?.focus();
    }

    private overflowValue(value: number, minimum: number, maximum: number) : number {
        const range = maximum - minimum + 1;
        const distance = value - minimum;

        return (distance % range + range) % range + minimum;
    }
}
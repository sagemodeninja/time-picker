import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js'
import { KeyboardArrowKey } from '../enums';

@customElement('time-picker')
export class TimePicker extends LitElement {
    static readonly MAXIMUMS = {
        hour: 13,
        minute: 60,
        isAM: 2
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

    @property()
    hour : number = 0;

    @property()
    minute : number = 0;

    @property()
    isAM: boolean = true;

    @state()
    private _inputBuffer: number[];

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

        if (event.code.includes('Digit'))
            this.handleNumericInputs(event);
    }

    private handleFocusEvent(event: FocusEvent) {
        this._inputBuffer = [];
    }

    private handleFocusOutEvent(event: FocusEvent) {
        const target = event.target as HTMLElement;
        const input = target.dataset['input'];
        
        const value = this[input];
        const minimum = input === 'hour' ? 1 : 0;
        const maximum = input === 'hour' ? 12 : 59;

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
        const index = this._inputBuffer.length;

        if (input === 'isAM')
            return;

        this._inputBuffer[index] = parseInt(event.key);
        this[input] = parseInt(this._inputBuffer.join(''));

        if (index === 1)
            this.focusNextInput(target, 1);
    }

    private handleIncrement(event: KeyboardEvent) {
        const target = event.target as HTMLElement;
        const input = target.dataset['input'];
        const increment = this[input] + (KeyboardArrowKey[event.key] - 39);

        const minimum = input === 'hour' ? 1 : 0;
        const maximum = TimePicker.MAXIMUMS[input];

        this[input] = this.overflowValue(increment, minimum, maximum);
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

        if (element)
            element.focus();
    }

    private overflowValue(value: number, minimum: number, maximum: number) : number {
        const range = maximum - minimum;
        const distance = value - minimum;

        return (distance % range + range) % range + minimum;
    }
}
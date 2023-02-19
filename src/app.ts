import { TimePicker } from "./components/time-picker";

document.addEventListener('DOMContentLoaded', () => {
    const timePicker = document.querySelector('#time-picker') as TimePicker;
    const debug = document.querySelector('#debug') as HTMLElement;

    timePicker.addEventListener('change', () => {
        const value = timePicker.value;
        debug.innerText = `Value: ${value}`;
    });
});
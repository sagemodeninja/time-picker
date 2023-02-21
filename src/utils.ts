export function overflowValue(value: number, minimum: number, maximum: number) : number {
    const range = maximum - minimum + 1;
    const distance = value - minimum;

    return (distance % range + range) % range + minimum;
}

export function snapValue(value: number, snap: number, direction: number) {
    const remainder = value % snap;
    const boundary = 25 / 2;

    const up = direction ? value - remainder : value + (snap - remainder);
    const down = direction ? value + (snap - remainder) : value - remainder;

    return remainder > boundary ? up : down;
}

export function tween(from: number, to: number, duration: number, onStep: (arg0: number) => void) {
    const start = performance.now();

    function step(timestamp: number) {
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        const value = from + (to - from) * progress;

        onStep(value);

        if (progress < 1)
            window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
}
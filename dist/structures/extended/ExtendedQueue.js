import { RainlinkQueue } from 'rainlink';
export class ExtendedQueue extends RainlinkQueue {
    constructor() {
        super(...arguments);
        this.previousState = [];
    }
    restore() {
        this.length = 0;
        this.push(...this.previousState);
        return this;
    }
    splice(start, deleteCount) {
        super.splice(start, deleteCount);
        this.previousState.splice(start, deleteCount);
        return this;
    }
    push(...items) {
        super.push(...items);
        this.previousState.push(...items);
        return items.length;
    }
    unshift(...items) {
        super.unshift(...items);
        this.previousState.unshift(...items);
        super.shift();
        return items.length;
    }
    shift() {
        this.previousState.shift();
        return super.shift();
    }
}

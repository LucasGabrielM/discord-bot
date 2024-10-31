var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { RainlinkEvents, RainlinkLoopMode, RainlinkPlayer } from 'rainlink';
import { ExtendedQueue } from './ExtendedQueue.js';
export class ExtendedPlayer extends RainlinkPlayer {
    constructor() {
        super(...arguments);
        this.queue = new ExtendedQueue(this.manager, this);
    }
    clear(emitEmpty) {
        var _a;
        this.loop = RainlinkLoopMode.NONE;
        this.queue.clear();
        this.queue.current = undefined;
        this.queue.previous.length = 0;
        this.volume = (_a = this.manager.rainlinkOptions.options.defaultVolume) !== null && _a !== void 0 ? _a : 100;
        this.paused = true;
        this.playing = false;
        this.track = null;
        if (!this.data.get('sudo-destroy'))
            this.data.clear();
        this.position = 0;
        if (emitEmpty)
            this.manager.emit(RainlinkEvents.QueueEmpty, this, this.queue);
        return;
    }
    stop(destroy) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDestroyed();
            if (destroy) {
                yield this.destroy();
                return this;
            }
            this.clear(false);
            this.node.rest.updatePlayer({
                guildId: this.guildId,
                playerOptions: {
                    track: {
                        encoded: null,
                    },
                },
            });
            this.manager.emit(RainlinkEvents.TrackEnd, this, this.queue.current);
            this.manager.emit('playerStop', this);
            return this;
        });
    }
}

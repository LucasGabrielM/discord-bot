import { ChannelHandler } from '../setup/ChannelHandler.js';
import { ChannelUpdater } from '../setup/ChannelUpdater.js';
export class PlayerLoader {
    constructor(client) {
        new ChannelHandler(client);
        new ChannelUpdater(client);
    }
}

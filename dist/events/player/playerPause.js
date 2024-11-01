var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { filterSelect, playerRowOneEdited, playerRowTwo, } from '../../utilities/PlayerControlButton.js';
export default class {
    execute(client, player) {
        return __awaiter(this, void 0, void 0, function* () {
            if (player.voiceId == null)
                return;
            const nowPlaying = client.nplayingMsg.get(`${player.guildId}`);
            if (nowPlaying) {
                nowPlaying.msg
                    .edit({
                    components: [
                        filterSelect(client, false),
                        playerRowOneEdited(client, false),
                        playerRowTwo(client, false),
                    ],
                })
                    .catch(() => null);
            }
            const setup = yield client.db.setup.get(`${player.guildId}`);
            client.emit('playerPause', player);
            if (setup && setup.playmsg) {
                const channel = yield client.channels.fetch(setup.channel).catch(() => undefined);
                if (!channel)
                    return;
                if (!channel.isTextBased)
                    return;
                if (player.data.get('pause-from-button'))
                    return player.data.delete('pause-from-button');
                const msg = yield channel.messages
                    .fetch(setup.playmsg)
                    .catch(() => undefined);
                if (!msg)
                    return;
                msg
                    .edit({
                    components: [
                        filterSelect(client, false),
                        playerRowOneEdited(client, false),
                        playerRowTwo(client, false),
                    ],
                })
                    .catch(() => null);
            }
        });
    }
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export default class {
    execute(client, player) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const song = player.queue.current;
            const requesterQueue = song && song.requester ? song.requester : null;
            const currentData = song
                ? {
                    title: song.title,
                    uri: song.uri,
                    length: song.duration,
                    thumbnail: song.artworkUrl,
                    author: song.author,
                    requester: requesterQueue
                        ? {
                            id: requesterQueue.id,
                            username: requesterQueue.username,
                            globalName: requesterQueue.globalName,
                            defaultAvatarURL: (_a = requesterQueue.defaultAvatarURL) !== null && _a !== void 0 ? _a : null,
                        }
                        : null,
                }
                : null;
            (_b = client.wsl.get(player.guildId)) === null || _b === void 0 ? void 0 : _b.send({
                op: 'trackStart',
                guild: player.guildId,
                data: currentData,
            });
        });
    }
}

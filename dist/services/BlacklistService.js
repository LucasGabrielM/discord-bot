var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export class BlacklistService {
    constructor(client) {
        this.client = client;
    }
    checkGuild(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.db.blacklist.get(`guild_${id}`);
        });
    }
    checkUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.db.blacklist.get(`user_${id}`);
        });
    }
    fullCheck(guildId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const isUserBlacklist = yield this.client.db.blacklist.get(`user_${userId}`);
            if (isUserBlacklist)
                return [true, 'user'];
            const isGuildBlacklist = yield this.client.db.blacklist.get(`guild_${userId}`);
            if (isGuildBlacklist)
                return [true, 'user'];
            return [false, true];
        });
    }
}

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
export default class {
    constructor() {
        this.name = ['pm', 'guild', 'profile'];
        this.description = 'View your guild premium profile!';
        this.category = 'Premium';
        this.accessableby = [Accessableby.GuildPremium];
        this.usage = '';
        this.aliases = ['pmgp'];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            yield handler.deferReply();
            const PremiumPlan = yield client.db.preGuild.get(`${(_a = handler.guild) === null || _a === void 0 ? void 0 : _a.id}`);
            if (!PremiumPlan) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(handler.language, 'error', 'no_premium_author')}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                    .setDescription(`${client.i18n.get(handler.language, 'error', 'no_guild_premium_desc')}`)
                    .setColor(client.color)
                    .setTimestamp();
                return handler.editReply({
                    content: ' ',
                    embeds: [embed],
                });
            }
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.i18n.get(handler.language, 'command.premium', 'guild_profile_author')}`,
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'guild_profile_desc', {
                guild: String((_b = handler.guild) === null || _b === void 0 ? void 0 : _b.name),
                plan: PremiumPlan.plan,
                expires: PremiumPlan.expiresAt == 'lifetime'
                    ? 'lifetime'
                    : `<t:${(PremiumPlan.expiresAt / 1000).toFixed()}:F>`,
            })}`)
                .setColor(client.color)
                .setTimestamp();
            return handler.editReply({ embeds: [embed] });
        });
    }
}

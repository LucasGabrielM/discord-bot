var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
import { ParseMentionEnum } from '../../structures/CommandHandler.js';
export default class {
    constructor() {
        this.name = ['pm', 'profile'];
        this.description = 'View your premium profile!';
        this.category = 'Premium';
        this.accessableby = [Accessableby.Member];
        this.usage = '';
        this.aliases = [];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: 'user',
                description: 'Type your user here',
                type: ApplicationCommandOptionType.User,
                required: false,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            yield handler.deferReply();
            let user = handler.user;
            const data = handler.args[0];
            const getData = yield handler.parseMentions(data);
            if (data && getData && getData.type == ParseMentionEnum.USER)
                user = getData.data;
            if ((user === null || user === void 0 ? void 0 : user.id) == client.owner)
                return this.owner(client, handler);
            if (client.config.bot.ADMIN.includes((_a = user === null || user === void 0 ? void 0 : user.id) !== null && _a !== void 0 ? _a : 'null'))
                return this.admin(client, handler);
            const PremiumPlan = (yield client.db.premium.get(`${(_b = handler.user) === null || _b === void 0 ? void 0 : _b.id}`));
            if (!PremiumPlan) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(handler.language, 'command.premium', 'profile_author')}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                    .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'profile_error_desc', { user: String(user === null || user === void 0 ? void 0 : user.username) })}`)
                    .setColor(client.color)
                    .setTimestamp();
                return handler.editReply({
                    content: ' ',
                    embeds: [embed],
                });
            }
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.i18n.get(handler.language, 'command.premium', 'profile_author')}`,
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'profile_desc', {
                user: String((_c = handler.user) === null || _c === void 0 ? void 0 : _c.tag),
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
    owner(client, handler) {
        var _a;
        const embed = new EmbedBuilder()
            .setAuthor({
            name: `${client.i18n.get(handler.language, 'command.premium', 'profile_author')}`,
            iconURL: client.user.displayAvatarURL(),
        })
            .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'profile_desc', {
            user: String((_a = handler.user) === null || _a === void 0 ? void 0 : _a.tag),
            plan: 'dreamvast@owner',
            expires: 'lifetime',
        })}`)
            .setColor(client.color)
            .setTimestamp();
        return handler.editReply({ embeds: [embed] });
    }
    admin(client, handler) {
        var _a;
        const embed = new EmbedBuilder()
            .setAuthor({
            name: `${client.i18n.get(handler.language, 'command.premium', 'profile_author')}`,
            iconURL: client.user.displayAvatarURL(),
        })
            .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'profile_desc', {
            user: String((_a = handler.user) === null || _a === void 0 ? void 0 : _a.tag),
            plan: 'dreamvast@admin',
            expires: 'lifetime',
        })}`)
            .setColor(client.color)
            .setTimestamp();
        return handler.editReply({ embeds: [embed] });
    }
}

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
export default class {
    constructor() {
        this.name = ['pm', 'redeem'];
        this.description = 'Redeem your premium!';
        this.category = 'Premium';
        this.accessableby = [Accessableby.Member];
        this.usage = '<type> <input>';
        this.aliases = [];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: 'type',
                description: 'Which type you want to redeem?',
                required: true,
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'User',
                        value: 'user',
                    },
                    {
                        name: 'Guild',
                        value: 'guild',
                    },
                ],
            },
            {
                name: 'code',
                description: 'The code you want to redeem',
                required: true,
                type: ApplicationCommandOptionType.String,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
            yield handler.deferReply();
            const avaliableMode = this.options[0].choices.map((data) => data.value);
            const type = handler.args[0];
            const input = handler.args[1];
            if (!type || !avaliableMode.includes(type))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'redeem_invalid_mode')}`),
                    ],
                });
            if (!input)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(client.color)
                            .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'redeem_invalid')}`),
                    ],
                });
            let preData = yield client.db.premium.get(`${(_a = handler.user) === null || _a === void 0 ? void 0 : _a.id}`);
            if (type == 'guild')
                preData = yield client.db.preGuild.get(`${(_b = handler.guild) === null || _b === void 0 ? void 0 : _b.id}`);
            if (preData && preData.isPremium) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(handler.language, 'command.premium', type == 'guild' ? 'redeem_already_guild' : 'redeem_already')}`);
                return handler.editReply({ embeds: [embed] });
            }
            const premium = yield client.db.code.get(`${input.toUpperCase()}`);
            if (!premium) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'redeem_invalid')}`);
                return handler.editReply({ embeds: [embed] });
            }
            if (premium.expiresAt !== 'lifetime' && premium.expiresAt < Date.now()) {
                const embed = new EmbedBuilder()
                    .setColor(client.color)
                    .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'redeem_invalid')}`);
                return handler.editReply({ embeds: [embed] });
            }
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.i18n.get(handler.language, 'command.premium', 'redeem_title')}`,
                iconURL: client.user.displayAvatarURL(),
            })
                .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'redeem_desc', {
                expires: premium.expiresAt !== 'lifetime'
                    ? `<t:${(premium.expiresAt / 1000).toFixed()}:F>`
                    : 'lifetime',
                plan: premium.plan,
            })}`)
                .setColor(client.color)
                .setTimestamp();
            yield client.db.code.delete(`${input.toUpperCase()}`);
            if (type == 'guild') {
                const newPreGuild = yield client.db.preGuild.set(`${(_c = handler.guild) === null || _c === void 0 ? void 0 : _c.id}`, {
                    id: String((_d = handler.guild) === null || _d === void 0 ? void 0 : _d.id),
                    isPremium: true,
                    redeemedBy: {
                        id: String((_e = handler.guild) === null || _e === void 0 ? void 0 : _e.id),
                        name: String((_f = handler.guild) === null || _f === void 0 ? void 0 : _f.name),
                        createdAt: Number((_g = handler.guild) === null || _g === void 0 ? void 0 : _g.createdAt.getTime()),
                        ownerId: String((_h = handler.guild) === null || _h === void 0 ? void 0 : _h.ownerId),
                    },
                    redeemedAt: Date.now(),
                    expiresAt: premium.expiresAt,
                    plan: premium.plan,
                });
                yield handler.editReply({ embeds: [embed] });
                yield this.sendRedeemLog(client, handler, null, newPreGuild);
                return;
            }
            const newPreUser = yield client.db.premium.set(`${(_j = handler.user) === null || _j === void 0 ? void 0 : _j.id}`, {
                id: String((_k = handler.user) === null || _k === void 0 ? void 0 : _k.id),
                isPremium: true,
                redeemedBy: {
                    id: String((_l = handler.user) === null || _l === void 0 ? void 0 : _l.id),
                    username: String((_m = handler.user) === null || _m === void 0 ? void 0 : _m.username),
                    displayName: String((_o = handler.user) === null || _o === void 0 ? void 0 : _o.displayName),
                    avatarURL: (_q = (_p = handler.user) === null || _p === void 0 ? void 0 : _p.avatarURL()) !== null && _q !== void 0 ? _q : null,
                    createdAt: Number((_r = handler.user) === null || _r === void 0 ? void 0 : _r.createdAt.getTime()),
                    mention: `<@${(_s = handler.user) === null || _s === void 0 ? void 0 : _s.id}>`,
                },
                redeemedAt: Date.now(),
                expiresAt: premium.expiresAt,
                plan: premium.plan,
            });
            yield handler.editReply({ embeds: [embed] });
            yield this.sendRedeemLog(client, handler, newPreUser, null);
            return;
        });
    }
    sendRedeemLog(client, handler, premium, guildPremium) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            if (!client.config.utilities.PREMIUM_LOG_CHANNEL)
                return;
            const language = client.config.bot.LANGUAGE;
            const createdAt = ((premium ? (_a = handler.user) === null || _a === void 0 ? void 0 : _a.createdAt.getTime() : (_b = handler.guild) === null || _b === void 0 ? void 0 : _b.createdAt.getTime()) / 1000).toFixed();
            const redeemedAt = ((premium ? premium.redeemedAt : guildPremium ? guildPremium.redeemedAt : 0) / 1000).toFixed();
            const expiresAt = premium ? premium.expiresAt : guildPremium ? guildPremium.expiresAt : 0;
            const plan = premium ? premium.plan : guildPremium ? guildPremium.plan : 'dreamvast@error';
            const embedField = [
                {
                    name: `${client.i18n.get(language, 'event.premium', 'display_name')}`,
                    value: `${premium ? (_c = handler.user) === null || _c === void 0 ? void 0 : _c.displayName : (_d = handler.guild) === null || _d === void 0 ? void 0 : _d.name}`,
                },
                {
                    name: 'ID',
                    value: `${premium ? (_e = handler.user) === null || _e === void 0 ? void 0 : _e.id : (_f = handler.guild) === null || _f === void 0 ? void 0 : _f.id}`,
                },
                {
                    name: `${client.i18n.get(language, 'event.premium', 'createdAt')}`,
                    value: ` <t:${createdAt}:F>`,
                },
                {
                    name: `${client.i18n.get(language, 'event.premium', 'redeemedAt')}`,
                    value: `<t:${redeemedAt}:F>`,
                },
                {
                    name: `${client.i18n.get(language, 'event.premium', 'expiresAt')}`,
                    value: `${expiresAt == 'lifetime' ? 'lifetime' : `<t:${(expiresAt / 1000).toFixed()}:F>`}`,
                },
                {
                    name: `${client.i18n.get(language, 'event.premium', 'plan')}`,
                    value: `${plan}`,
                },
            ];
            if (premium)
                embedField.unshift({
                    name: `${client.i18n.get(language, 'event.premium', 'username')}`,
                    value: `${(_g = handler.user) === null || _g === void 0 ? void 0 : _g.username}`,
                });
            const embed = new EmbedBuilder()
                .setAuthor({
                name: `${client.i18n.get(language, 'event.premium', premium ? 'title' : 'guild_title')}`,
            })
                .addFields(embedField)
                .setTimestamp()
                .setColor(client.color);
            try {
                const channel = yield client.channels
                    .fetch(client.config.utilities.PREMIUM_LOG_CHANNEL)
                    .catch(() => undefined);
                if (!channel || (channel && !channel.isTextBased()))
                    return;
                channel.messages.channel.send({ embeds: [embed] });
            }
            catch (_h) { }
            return;
        });
    }
}

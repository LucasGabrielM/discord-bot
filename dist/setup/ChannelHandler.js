var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EmbedBuilder, } from 'discord.js';
import { RateLimitManager } from '@sapphire/ratelimits';
import { convertTime } from '../utilities/ConvertTime.js';
import { getTitle } from '../utilities/GetTitle.js';
import { BlacklistService } from '../services/BlacklistService.js';
const rateLimitManager = new RateLimitManager(2000);
/**
 * @param {Client} client
 */
export class ChannelHandler {
    constructor(client) {
        this.client = client;
        this.register();
    }
    register() {
        try {
            this.client.on('interactionCreate', (interaction) => this.interaction(interaction));
            this.client.on('messageCreate', (message) => this.message(message));
        }
        catch (err) {
            this.client.logger.error(ChannelHandler.name, err);
        }
    }
    interaction(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild || interaction.user.bot)
                return;
            if (interaction.isStringSelectMenu()) {
                return this.filterSelect(interaction);
            }
            if (!interaction.isButton())
                return;
            const { customId } = interaction;
            let player = this.client.rainlink.players.get(interaction.guild.id);
            if (!player)
                return;
            const playChannel = yield this.client.channels.fetch(player.textId).catch(() => undefined);
            if (!playChannel)
                return;
            let guildModel = yield this.client.db.language.get(`${player.guildId}`);
            if (!guildModel) {
                guildModel = yield this.client.db.language.set(`${player.guildId}`, this.client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            //////////////////////////////// Blacklist check start ////////////////////////////////
            const blacklistService = new BlacklistService(this.client);
            const checkResult = yield blacklistService.fullCheck(interaction.user.id, interaction.guildId);
            if (checkResult[0] && checkResult[1] == 'user') {
                const blocked = new EmbedBuilder()
                    .setDescription(this.client.i18n.get(guildModel, 'error', 'bl_user', { bot: this.client.user.id }))
                    .setColor(this.client.color);
                yield interaction.reply({
                    embeds: [blocked],
                });
                return;
            }
            if (checkResult[0] && checkResult[1] == 'guild') {
                const blocked = new EmbedBuilder()
                    .setDescription(this.client.i18n.get(guildModel, 'error', 'bl_guild', { bot: this.client.user.id }))
                    .setColor(this.client.color);
                yield interaction.reply({
                    embeds: [blocked],
                });
                return;
            }
            //////////////////////////////// Blacklist check end ////////////////////////////////
            const button = this.client.plButton.get(customId);
            let data = yield this.client.db.setup.get(`${player.guildId}`);
            if (!data)
                return;
            if (data.enable === false)
                return;
            const getChannel = yield this.client.channels.fetch(data.channel).catch(() => undefined);
            if (!getChannel)
                return;
            let playMsg = yield getChannel.messages
                .fetch(data.playmsg)
                .catch(() => undefined);
            if (!playMsg)
                return;
            if (button) {
                try {
                    yield button.run(this.client, interaction, String(language), player, playMsg);
                }
                catch (err) {
                    this.client.logger.error('ButtonError', err);
                }
            }
        });
    }
    filterSelect(interaction) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!interaction.guild || interaction.user.bot)
                return;
            let player = this.client.rainlink.players.get(interaction.guild.id);
            if (!player)
                return;
            const playChannel = yield this.client.channels.fetch(player.textId).catch(() => undefined);
            if (!playChannel)
                return;
            let guildModel = yield this.client.db.language.get(`${player.guildId}`);
            if (!guildModel) {
                guildModel = yield this.client.db.language.set(`${player.guildId}`, this.client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            const filterMode = interaction.values[0];
            if (player.data.get('filter-mode') == filterMode) {
                const embed = new EmbedBuilder()
                    .setDescription(`${this.client.i18n.get(language, 'button.music', 'filter_already', { name: filterMode })}`)
                    .setColor(this.client.color);
                yield interaction
                    .reply({
                    embeds: [embed],
                })
                    .catch(() => { });
                return;
            }
            if (filterMode == 'clear' && !player.data.get('filter-mode')) {
                const embed = new EmbedBuilder()
                    .setDescription(`${this.client.i18n.get(language, 'button.music', 'reset_already')}`)
                    .setColor(this.client.color);
                yield interaction
                    .reply({
                    embeds: [embed],
                })
                    .catch(() => { });
                return;
            }
            filterMode == 'clear'
                ? player.data.delete('filter-mode')
                : player.data.set('filter-mode', filterMode);
            filterMode == 'clear' ? yield player.filter.clear() : yield player.filter.set(filterMode);
            const embed = new EmbedBuilder()
                .setDescription(filterMode == 'clear'
                ? `${this.client.i18n.get(language, 'button.music', 'reset_on')}`
                : `${this.client.i18n.get(language, 'button.music', 'filter_on', { name: filterMode })}`)
                .setColor(this.client.color);
            yield interaction
                .reply({
                embeds: [embed],
            })
                .catch(() => { });
        });
    }
    message(message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!message.guild || !message.guild.available || !message.channel.isTextBased())
                return;
            let database = yield this.client.db.setup.get(`${message.guild.id}`);
            let player = this.client.rainlink.players.get(`${message.guild.id}`);
            if (!database)
                return;
            if (!database.enable)
                return;
            let channel = (yield message.guild.channels
                .fetch(database.channel)
                .catch(() => undefined));
            if (!channel)
                return;
            if (database.channel != message.channel.id)
                return;
            let guildModel = yield this.client.db.language.get(`${message.guild.id}`);
            if (!guildModel) {
                guildModel = yield this.client.db.language.set(`${message.guild.id}`, this.client.config.bot.LANGUAGE);
            }
            const language = guildModel;
            if (message.id !== database.playmsg) {
                const preInterval = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                    const fetchedMessage = yield message.channel.messages
                        .fetch({ limit: 50 })
                        .catch(() => undefined);
                    if (!fetchedMessage) {
                        clearInterval(preInterval);
                        return;
                    }
                    const final = fetchedMessage.filter((msg) => msg.id !== (database === null || database === void 0 ? void 0 : database.playmsg));
                    if (final.size > 0)
                        message.channel.bulkDelete(final).catch(() => { });
                    else
                        clearInterval(preInterval);
                }), this.client.config.utilities.DELETE_MSG_TIMEOUT);
            }
            if (message.author.bot)
                return;
            const song = message.cleanContent;
            if (!song)
                return;
            const ratelimit = rateLimitManager.acquire(message.author.id);
            if (ratelimit.limited)
                return;
            ratelimit.consume();
            const blacklistService = new BlacklistService(this.client);
            const checkResult = yield blacklistService.fullCheck(message.author.id, message.guildId);
            if (checkResult[0] && checkResult[1] == 'user') {
                yield message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(this.client.i18n.get(guildModel, 'error', 'bl_user', { bot: this.client.user.id }))
                            .setColor(this.client.color),
                    ],
                });
                return false;
            }
            if (checkResult[0] && checkResult[1] == 'guild') {
                yield message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(this.client.i18n.get(guildModel, 'error', 'bl_guild', { bot: this.client.user.id }))
                            .setColor(this.client.color),
                    ],
                });
                return false;
            }
            let voiceChannel = message.member.voice.channel;
            if (!voiceChannel)
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.i18n.get(language, 'error', 'no_in_voice')}`)
                            .setColor(this.client.color),
                    ],
                });
            let msg = yield message.channel.messages.fetch(database.playmsg).catch(() => undefined);
            const emotes = (str) => str.match(/<a?:.+?:\d{18}>|\p{Extended_Pictographic}/gu);
            if (emotes(song) !== null) {
                msg === null || msg === void 0 ? void 0 : msg.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${this.client.i18n.get(language, 'event.setup', 'play_emoji')}`)
                            .setColor(this.client.color),
                    ],
                });
                return;
            }
            if (!player)
                player = yield this.client.rainlink.create({
                    guildId: message.guild.id,
                    voiceId: message.member.voice.channel.id,
                    textId: message.channel.id,
                    shardId: message.guild.shardId,
                    deaf: true,
                    volume: this.client.config.player.DEFAULT_VOLUME,
                });
            else {
                if (message.member.voice.channel !== message.guild.members.me.voice.channel) {
                    msg === null || msg === void 0 ? void 0 : msg.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${this.client.i18n.get(language, 'error', 'no_same_voice')}`)
                                .setColor(this.client.color),
                        ],
                    });
                    return;
                }
            }
            const maxLength = yield this.client.db.maxlength.get(message.author.id);
            const result = yield player.search(song, { requester: message.author });
            const tracks = result.tracks.filter((e) => (maxLength ? e.duration > maxLength : e));
            if (!result.tracks.length) {
                msg === null || msg === void 0 ? void 0 : msg.edit({
                    content: `${this.client.i18n.get(language, 'event.setup', 'setup_content')}\n${`${this.client.i18n.get(language, 'event.setup', 'setup_content_empty')}`}`,
                }).catch(() => null);
                return;
            }
            if (result.type === 'PLAYLIST')
                for (let track of tracks)
                    player.queue.add(track);
            else if (player.playing && result.type === 'SEARCH')
                player.queue.add(tracks[0]);
            else if (player.playing && result.type !== 'SEARCH')
                for (let track of tracks)
                    player.queue.add(track);
            else
                player.queue.add(tracks[0]);
            const TotalDuration = player.queue.duration;
            if (!player.playing)
                player.play();
            if (result.type === 'PLAYLIST') {
                const embed = new EmbedBuilder()
                    .setDescription(`${this.client.i18n.get(language, 'event.setup', 'play_playlist', {
                    title: getTitle(this.client, result.tracks[0]),
                    duration: convertTime(TotalDuration),
                    songs: `${result.tracks.length}`,
                    request: `${result.tracks[0].requester}`,
                })}`)
                    .setColor(this.client.color);
                msg === null || msg === void 0 ? void 0 : msg.reply({ content: ' ', embeds: [embed] });
            }
            else if (result.type === 'TRACK') {
                const embed = new EmbedBuilder()
                    .setDescription(`${this.client.i18n.get(language, 'event.setup', 'play_track', {
                    title: getTitle(this.client, result.tracks[0]),
                    duration: convertTime(result.tracks[0].duration),
                    request: `${result.tracks[0].requester}`,
                })}`)
                    .setColor(this.client.color);
                msg === null || msg === void 0 ? void 0 : msg.reply({ content: ' ', embeds: [embed] });
            }
            else if (result.type === 'SEARCH') {
                const embed = new EmbedBuilder().setColor(this.client.color).setDescription(`${this.client.i18n.get(language, 'event.setup', 'play_result', {
                    title: getTitle(this.client, result.tracks[0]),
                    duration: convertTime(result.tracks[0].duration),
                    request: `${result.tracks[0].requester}`,
                })}`);
                msg === null || msg === void 0 ? void 0 : msg.reply({ content: ' ', embeds: [embed] });
            }
            yield this.client.UpdateQueueMsg(player);
        });
    }
}

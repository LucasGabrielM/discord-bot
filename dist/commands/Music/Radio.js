var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ApplicationCommandOptionType, ComponentType, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
import { RadioStationNewInterface, RadioStationArray } from '../../utilities/RadioStations.js';
// Main code
export default class {
    constructor() {
        this.name = ['radio'];
        this.description = 'Play radio in voice channel';
        this.category = 'Music';
        this.accessableby = [Accessableby.Member];
        this.usage = '<radio_number>';
        this.aliases = ['ra'];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: 'number',
                description: 'The number of radio to choose the radio station',
                type: ApplicationCommandOptionType.Number,
                required: false,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let player = client.rainlink.players.get(handler.guild.id);
            const radioList = RadioStationNewInterface();
            const radioArrayList = RadioStationArray();
            const radioListKeys = Object.keys(radioList);
            yield handler.deferReply();
            const getNum = handler.args[0] ? Number(handler.args[0]) : undefined;
            if (!getNum)
                return this.sendHelp(client, handler, radioList, radioListKeys);
            const radioData = radioArrayList[getNum - 1];
            if (!radioData)
                return this.sendHelp(client, handler, radioList, radioListKeys);
            const { channel } = handler.member.voice;
            if (!channel)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'error', 'no_in_voice')}`)
                            .setColor(client.color),
                    ],
                });
            if (!player)
                player = yield client.rainlink.create({
                    guildId: handler.guild.id,
                    voiceId: handler.member.voice.channel.id,
                    textId: handler.channel.id,
                    shardId: (_b = (_a = handler.guild) === null || _a === void 0 ? void 0 : _a.shardId) !== null && _b !== void 0 ? _b : 0,
                    deaf: true,
                    volume: client.config.player.DEFAULT_VOLUME,
                });
            else if (player && !this.checkSameVoice(client, handler, handler.language)) {
                return;
            }
            player.textId = handler.channel.id;
            const result = yield player.search(radioData.link, { requester: handler.user });
            if (!result.tracks.length)
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.music', 'play_match')}`)
                            .setColor(client.color),
                    ],
                });
            if (result.type === 'PLAYLIST')
                for (let track of result.tracks)
                    player.queue.add(track);
            else if (player.playing && result.type === 'SEARCH')
                player.queue.add(result.tracks[0]);
            else if (player.playing && result.type !== 'SEARCH')
                for (let track of result.tracks)
                    player.queue.add(track);
            else
                player.queue.add(result.tracks[0]);
            if (handler.message)
                yield handler.message.delete().catch(() => null);
            if (!player.playing)
                player.play();
            const embed = new EmbedBuilder().setColor(client.color).setDescription(client.i18n.get(handler.language, 'command.music', 'radio_accept', {
                radio_no: String(radioData.no),
                radio_name: radioData.name,
                radio_link: radioData.link,
            }));
            handler.editReply({ content: ' ', embeds: [embed] });
        });
    }
    sendHelp(client, handler, radioList, radioListKeys) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const pages = [];
            for (let i = 0; i < radioListKeys.length; i++) {
                const radioListKey = radioListKeys[i];
                const stringArray = radioList[radioListKey];
                const converted = this.stringConverter(stringArray);
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: client.i18n.get(handler.language, 'command.music', 'radio_list_author', {
                        host: radioListKey,
                    }),
                    iconURL: (_a = handler.user) === null || _a === void 0 ? void 0 : _a.displayAvatarURL(),
                })
                    .setColor(client.color)
                    .addFields(converted);
                pages.push(embed);
            }
            const providerSelector = (disable) => new ActionRowBuilder().addComponents(new StringSelectMenuBuilder()
                .setCustomId('provider')
                .setPlaceholder(client.i18n.get(handler.language, 'command.music', 'radio_list_placeholder'))
                .addOptions(this.getOptionBuilder(radioListKeys))
                .setDisabled(disable));
            const msg = yield handler.editReply({
                embeds: [pages[0]],
                components: [providerSelector(false)],
            });
            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.StringSelect,
                time: 45000,
            });
            collector.on('collect', (message) => __awaiter(this, void 0, void 0, function* () {
                const providerId = Number(message.values[0]);
                const providerName = radioListKeys[providerId];
                const getEmbed = pages[providerId];
                yield msg.edit({ embeds: [getEmbed] });
                const replyEmbed = new EmbedBuilder().setColor(client.color).setDescription(client.i18n.get(handler.language, 'command.music', 'radio_list_move', {
                    providerName,
                }));
                const msgReply = yield message
                    .reply({
                    embeds: [replyEmbed],
                    ephemeral: true,
                })
                    .catch(() => { });
                if (msgReply)
                    setTimeout(() => msgReply.delete().catch(() => { }), client.config.utilities.DELETE_MSG_TIMEOUT);
            }));
            collector.on('end', () => __awaiter(this, void 0, void 0, function* () {
                // @ts-ignore
                collector.removeAllListeners();
                yield msg.edit({
                    components: [providerSelector(true)],
                });
            }));
        });
    }
    getOptionBuilder(radioListKeys) {
        const result = [];
        for (let i = 0; i < radioListKeys.length; i++) {
            const key = radioListKeys[i];
            result.push(new StringSelectMenuOptionBuilder().setLabel(key).setValue(String(i)));
        }
        return result;
    }
    stringConverter(array) {
        const radioStrings = [];
        for (let i = 0; i < array.length; i++) {
            const radio = array[i];
            radioStrings.push({
                name: `**${String(radio.no).padEnd(3)}** ${radio.name}`,
                value: ' ',
                inline: true,
            });
        }
        return radioStrings;
    }
    checkSameVoice(client, handler, language) {
        if (handler.member.voice.channel !== handler.guild.members.me.voice.channel) {
            handler.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`${client.i18n.get(handler.language, 'error', 'no_same_voice')}`)
                        .setColor(client.color),
                ],
            });
            return false;
        }
        return true;
    }
    getTitle(client, type, tracks, value) {
        if (client.config.player.AVOID_SUSPEND)
            return tracks[0].title;
        else {
            if (type === 'PLAYLIST') {
                return `[${tracks[0].title}](${value})`;
            }
            else {
                return `[${tracks[0].title}](${tracks[0].uri})`;
            }
        }
    }
}

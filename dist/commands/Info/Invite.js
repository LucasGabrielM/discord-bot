var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
export default class {
    constructor() {
        this.name = ['invite'];
        this.description = 'Shows the invite information of the Bot';
        this.category = 'Info';
        this.accessableby = [Accessableby.Member];
        this.usage = '';
        this.aliases = [];
        this.lavalink = false;
        this.options = [];
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const invite = new EmbedBuilder()
                .setTitle(`${client.i18n.get(handler.language, 'command.info', 'inv_title', {
                username: client.user.username,
            })}`)
                .setDescription(`${client.i18n.get(handler.language, 'command.info', 'inv_desc', {
                username: client.user.username,
            })}`)
                .addFields([
                {
                    name: 'ByteBlaze',
                    value: 'https://github.com/RainyXeon/ByteBlaze',
                    inline: false,
                },
            ])
                .setTimestamp()
                .setColor(client.color);
            const row2 = new ActionRowBuilder().addComponents(new ButtonBuilder()
                .setLabel('Invite Me')
                .setStyle(ButtonStyle.Link)
                .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`));
            yield handler.editReply({ embeds: [invite], components: [row2] });
        });
    }
}

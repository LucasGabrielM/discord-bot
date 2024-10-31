var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ButtonStyle } from 'discord.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { Accessableby } from '../../structures/Command.js';
export default class {
    constructor() {
        this.name = ['developer'];
        this.description = 'Shows the developer information of the Bot (Credit)';
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
            const xeondex = new EmbedBuilder()
                .setTitle(`${client.i18n.get(handler.language, 'command.info', 'dev_title')}`)
                .setDescription(`${client.i18n.get(handler.language, 'command.info', 'dev_desc')}`)
                .setFooter({
                text: `${client.i18n.get(handler.language, 'command.info', 'dev_foot')}`,
            })
                .setColor(client.color);
            const row1 = new ActionRowBuilder()
                .addComponents(new ButtonBuilder()
                .setLabel('Github (RainyXeon)')
                .setStyle(ButtonStyle.Link)
                .setURL('https://github.com/RainyXeon'))
                .addComponents(new ButtonBuilder()
                .setLabel('Support Server')
                .setStyle(ButtonStyle.Link)
                .setURL('https://discord.gg/xff4e2WvVy'));
            yield handler.editReply({ embeds: [xeondex], components: [row1] });
        });
    }
}

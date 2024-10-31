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
import { Page } from '../../structures/Page.js';
export default class {
    constructor() {
        this.name = ['pm', 'list'];
        this.description = 'View all existing premium user!';
        this.category = 'Premium';
        this.accessableby = [Accessableby.Admin];
        this.usage = '';
        this.aliases = ['pml'];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: 'page',
                description: 'Page number to show.',
                type: ApplicationCommandOptionType.Number,
                required: false,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const value = handler.args[0];
            if (value && isNaN(+value))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'error', 'number_invalid')}`)
                            .setColor(client.color),
                    ],
                });
            const users = Array.from(yield client.db.premium.all()).map((data) => data.value);
            let pagesNum = Math.ceil(users.length / 10);
            if (pagesNum === 0)
                pagesNum = 1;
            const userStrings = [];
            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                userStrings.push(`\`${i + 1}. ${user.redeemedBy.username}/${user.id} - ${user.plan}\``);
            }
            const pages = [];
            for (let i = 0; i < pagesNum; i++) {
                const str = userStrings.slice(i * 10, i * 10 + 10).join('\n');
                const embed = new EmbedBuilder()
                    .setAuthor({
                    name: `${client.i18n.get(handler.language, 'command.premium', 'list_title')}`,
                })
                    .setColor(client.color)
                    .setDescription(str == '' ? '  Nothing' : '\n' + str)
                    .setFooter({
                    text: `${String(i + 1)}/${String(pagesNum)}`,
                });
                pages.push(embed);
            }
            if (!value) {
                if (pages.length == pagesNum && users.length > 10) {
                    if (handler.message) {
                        yield new Page(client, pages, 60000, handler.language).prefixPage(handler.message);
                    }
                    else if (handler.interaction) {
                        yield new Page(client, pages, 60000, handler.language).slashPage(handler.interaction);
                    }
                    else
                        return;
                }
                else
                    return handler.editReply({ embeds: [pages[0]] });
            }
            else {
                if (isNaN(+value))
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'list_notnumber')}`)
                                .setColor(client.color),
                        ],
                    });
                if (Number(value) > pagesNum)
                    return handler.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(`${client.i18n.get(handler.language, 'command.premium', 'list_page_notfound', {
                                page: String(pagesNum),
                            })}`)
                                .setColor(client.color),
                        ],
                    });
                const pageNum = Number(value) == 0 ? 1 : Number(value) - 1;
                return handler.editReply({ embeds: [pages[pageNum]] });
            }
        });
    }
}

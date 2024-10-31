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
        this.name = ['blacklist'];
        this.description = 'Shuts down the client!';
        this.category = 'Owner';
        this.accessableby = [Accessableby.Owner];
        this.usage = '< id > < add / remmove > < user/ guild >';
        this.aliases = [];
        this.lavalink = false;
        this.usingInteraction = true;
        this.playerCheck = false;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: 'id',
                description: 'Action for this user or guild',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
            {
                name: 'action',
                description: 'Action for this user or guild',
                type: ApplicationCommandOptionType.String,
                required: true,
                choices: [
                    {
                        name: 'Add',
                        value: 'add',
                    },
                    {
                        name: 'Remove',
                        value: 'remove',
                    },
                ],
            },
            {
                name: 'type',
                description: 'User or Guild',
                type: ApplicationCommandOptionType.String,
                required: true,
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
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            const id = handler.args[0];
            const mode = handler.args[1];
            const type = handler.args[2];
            if (!this.options[1].choices.find((e) => e.value == mode))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_invalid_mode'))
                            .setColor(client.color),
                    ],
                });
            if (!this.options[2].choices.find((e) => e.value == type))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_invalid_type'))
                            .setColor(client.color),
                    ],
                });
            if (mode == 'remove')
                return this.removeData(client, handler, id, type);
            yield client.db.blacklist.set(`${type}_${id}`, true);
            const restart = new EmbedBuilder()
                .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_add', { id }))
                .setColor(client.color);
            yield handler.editReply({ embeds: [restart] });
        });
    }
    removeData(client, handler, id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            yield client.db.blacklist.delete(`${type}_${id}`);
            const remove = new EmbedBuilder()
                .setDescription(client.i18n.get(handler.language, 'command.utils', 'bl_remove', { id }))
                .setColor(client.color);
            yield handler.editReply({ embeds: [remove] });
        });
    }
}

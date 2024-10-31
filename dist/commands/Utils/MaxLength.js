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
const time_regex = /(^[0-9][\d]{0,3}):(0[0-9]{1}$|[1-5]{1}[0-9])/;
// Main code
export default class {
    constructor() {
        this.name = ['max-length'];
        this.description = 'Set the max length of the song allowed';
        this.category = 'Music';
        this.accessableby = [Accessableby.Member];
        this.usage = '<time_format. Ex: 999:59>';
        this.aliases = [];
        this.lavalink = false;
        this.playerCheck = false;
        this.usingInteraction = true;
        this.sameVoiceCheck = false;
        this.permissions = [];
        this.options = [
            {
                name: 'time',
                description: 'Set the max length or none. Example: 0:10 or 120:10',
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ];
    }
    execute(client, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            yield handler.deferReply();
            let value;
            const time = handler.args[0];
            if (time == 'none' || time == '0:00') {
                yield client.db.maxlength.delete(handler.user.id);
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.utils', 'ml_remove')}`)
                            .setColor(client.color),
                    ],
                });
            }
            if (!time_regex.test(time))
                return handler.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${client.i18n.get(handler.language, 'command.utils', 'ml_invalid')}`)
                            .setColor(client.color),
                    ],
                });
            else {
                const [m, s] = time.split(/:/);
                const min = Number(m) * 60;
                const sec = Number(s);
                value = min + sec;
            }
            const player = client.rainlink.players.get(handler.guild.id);
            if (player && player.queue.length !== 0)
                player.queue.forEach((track, trackIndex) => {
                    if (track.duration >= value)
                        player.queue.remove(trackIndex);
                });
            yield client.db.maxlength.set(handler.user.id, value);
            const embed = new EmbedBuilder()
                .setDescription(client.i18n.get(handler.language, 'command.utils', 'ml_set', { time }))
                .setColor(client.color);
            return handler.editReply({ embeds: [embed] });
        });
    }
}

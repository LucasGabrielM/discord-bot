import { Client, GatewayIntentBits, Collection as DJSCollection, StringSelectMenuOptionBuilder, } from 'discord.js';
import { DatabaseService } from './database/index.js';
import { resolve } from 'path';
import { LoggerService } from './services/LoggerService.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { WebServer } from './web/server.js';
import { ManifestService } from './services/ManifestService.js';
import { config } from 'dotenv';
import { initHandler } from './handlers/index.js';
import { DeployService } from './services/DeployService.js';
import { RainlinkInit } from './structures/Rainlink.js';
import { RainlinkFilterData } from 'rainlink';
import { Collection } from './structures/Collection.js';
import { Localization } from './structures/Localization.js';
import cluster from 'node:cluster';
config();
function getShard(clusterManager) {
    const shardListData = clusterManager.getShard(cluster.worker.id);
    return {
        shards: shardListData,
        shardCount: clusterManager.totalShards,
    };
}
export class Manager extends Client {
    constructor(config, isMsgEnable, clusterManager) {
        super({
            shards: clusterManager ? getShard(clusterManager).shards : 'auto',
            shardCount: clusterManager ? getShard(clusterManager).shardCount : 1,
            allowedMentions: {
                parse: ['roles', 'users', 'everyone'],
                repliedUser: false,
            },
            intents: isMsgEnable
                ? [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                ]
                : [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMessages,
                ],
        });
        this.config = config;
        this.clusterManager = clusterManager;
        this.selectMenuOptions = [];
        // Initial basic bot config
        const __dirname = dirname(fileURLToPath(import.meta.url));
        this.cluster = {
            data: clusterManager ? cluster : null,
            id: clusterManager ? cluster.worker.id : 0,
        };
        this.logger = new LoggerService(this, this.cluster.id);
        this.manifest = new ManifestService().data;
        this.owner = this.config.bot.OWNER_ID;
        this.color = (this.config.bot.EMBED_COLOR || '#2b2d31');
        this.i18n = new Localization({
            defaultLocale: this.config.bot.LANGUAGE || 'en',
            directory: resolve(join(__dirname, '..', 'languages')),
        });
        this.prefix = this.config.utilities.MESSAGE_CONTENT.commands.prefix || 'd!';
        this.REGEX = [
            /(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[-a-zA-Z0-9_]{11,}(?!\S))\/)|(?:\S*v=|v\/)))([-a-zA-Z0-9_]{11,})/,
            /^.*(youtu.be\/|list=)([^#\&\?]*).*/,
            /^(?:spotify:|https:\/\/[a-z]+\.spotify\.com\/(track\/|user\/(.*)\/playlist\/|playlist\/))(.*)$/,
            /^https?:\/\/(?:www\.)?deezer\.com\/[a-z]+\/(track|album|playlist)\/(\d+)$/,
            /^(?:(https?):\/\/)?(?:(?:www|m)\.)?(soundcloud\.com|snd\.sc)\/(.*)$/,
            /(?:https:\/\/music\.apple\.com\/)(?:.+)?(artist|album|music-video|playlist)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)\/([\w\-\.]+(\/)+[\w\-\.]+|[^&]+)/,
            /^https?:\/\/(?:www\.|secure\.|sp\.)?nicovideo\.jp\/watch\/([a-z]{2}[0-9]+)/,
            /(?:https:\/\/spotify\.link)\/([A-Za-z0-9]+)/,
            /^https:\/\/deezer\.page\.link\/[a-zA-Z0-9]{12}$/,
        ];
        // Initial autofix lavalink varibles
        this.lavalinkList = [];
        this.lavalinkUsing = [];
        this.lavalinkUsed = [];
        // Collections
        this.commands = new DJSCollection();
        this.interval = new Collection();
        this.sentQueue = new Collection();
        this.aliases = new Collection();
        this.nplayingMsg = new Collection();
        this.plButton = new Collection();
        this.leaveDelay = new Collection();
        this.nowPlaying = new Collection();
        this.wsl = new Collection();
        this.isDatabaseConnected = false;
        // Icons setup
        this.icons = this.config.emojis;
        this.rainlink = new RainlinkInit(this).init;
        for (const key of Object.keys(RainlinkFilterData)) {
            const firstUpperCase = key.charAt(0).toUpperCase() + key.slice(1);
            this.selectMenuOptions.push(new StringSelectMenuOptionBuilder()
                .setLabel(firstUpperCase)
                .setDescription(key == 'clear'
                ? 'Reset all current filter'
                : `${firstUpperCase} filter for better audio experience!`)
                .setValue(key));
        }
    }
    start() {
        this.logger.info('ClientManager', `Booting byteblaze...`);
        this.logger.info('ClientManager', `├── Version: ${this.manifest.metadata.bot.version}`);
        this.logger.info('ClientManager', `├── Codename: ${this.manifest.metadata.bot.codename}`);
        this.logger.info('ClientManager', `├── Autofix Version: ${this.manifest.metadata.autofix.version}`);
        this.logger.info('ClientManager', `├── Autofix Codename: ${this.manifest.metadata.autofix.codename}`);
        this.logger.info('ClientManager', `├── Rainlink: ${this.manifest.package.rainlink}`);
        this.logger.info('ClientManager', `├── discord.js: ${this.manifest.package.discordjs}`);
        this.logger.info('ClientManager', `└── Total package: ${this.manifest.package.totalAmount}`);
        if (!this.config.player.AVOID_SUSPEND)
            this.logger.warn('ClientManager', 'You just disabled AVOID_SUSPEND feature. Enable this on app.yml to avoid discord suspend your bot!');
        if (this.config.utilities.WEB_SERVER.enable)
            new WebServer(this);
        new DeployService(this);
        new initHandler(this);
        new DatabaseService(this);
        super.login(this.config.bot.TOKEN);
    }
}

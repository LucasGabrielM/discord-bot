var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import cluster from 'node:cluster';
import process from 'node:process';
import { config } from 'dotenv';
import { bootBot } from './bot.js';
import pidusage from 'pidusage';
import { Collection } from '../structures/Collection.js';
import readdirRecursive from 'recursive-readdir';
import { resolve } from 'path';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
config();
export class ClusterManager {
    constructor(options) {
        this.options = options;
        this.workerPID = new Collection();
        this.commands = new Collection();
        this.clusterShardList = {};
        this.totalShards = 0;
        this.totalShards = this.options.totalClusters * this.options.shardsPerClusters;
        const shardArrayID = this.arrayRange(0, this.totalShards - 1, 1);
        this.arrayChunk(shardArrayID, this.options.shardsPerClusters).map((value, index) => {
            this.clusterShardList[String(index + 1)] = value;
        });
        console.log(this.options.totalClusters);
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (cluster.isPrimary) {
                this.log('INFO', `Primary process ${process.pid} is running`);
                yield this.commandLoader();
                cluster.on('exit', (worker) => {
                    this.log('WARN', `worker ${worker.process.pid} / ${worker.id} died x.x`);
                });
                cluster.on('message', (worker, message) => __awaiter(this, void 0, void 0, function* () {
                    const jsonMsg = JSON.parse(message);
                    const command = this.commands.get(jsonMsg.cmd);
                    if (!command)
                        return worker.send(JSON.stringify({ error: { code: 404, message: 'Command not found!' } }));
                    const getRes = yield command.execute(this, worker, message);
                    worker.send(JSON.stringify(getRes));
                }));
                for (let i = 0; i < this.options.totalClusters; i++) {
                    cluster.fork();
                }
                cluster.on('exit', (worker) => {
                    this.log('WARN', `worker ${worker.process.pid} / ${worker.id} died`);
                });
            }
            else {
                bootBot(this);
                this.log('INFO', `Worker ${process.pid} / ${cluster.worker.id} started`);
            }
        });
    }
    getWorkerInfo(clusterId) {
        return this.workerPID.get(String(clusterId));
    }
    getWorkerStatus(clusterId) {
        return __awaiter(this, void 0, void 0, function* () {
            const workerData = this.workerPID.get(String(clusterId));
            if (!workerData)
                return null;
            return new Promise((resolve, reject) => pidusage(workerData.process.pid, function (err, stats) {
                if (err)
                    reject(null);
                resolve(stats);
            }));
        });
    }
    getShard(clusterId) {
        return this.clusterShardList[String(clusterId)];
    }
    sendMaster(cmd_1) {
        return __awaiter(this, arguments, void 0, function* (cmd, args = {}) {
            return new Promise((resolve, reject) => {
                const fullData = { cmd, args };
                cluster.worker.on('message', (message) => {
                    const jsonMsg = JSON.parse(message);
                    if (jsonMsg.err)
                        return reject(null);
                    resolve(message);
                });
                cluster.worker.on('error', () => {
                    return reject(null);
                });
                cluster.worker.send(JSON.stringify(fullData));
            });
        });
    }
    arrayRange(start, stop, step) {
        return Array.from({ length: (stop - start) / step + 1 }, (_, index) => start + index * step);
    }
    arrayChunk(array, chunkSize) {
        return [].concat.apply([], array.map(function (_, i) {
            return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
        }));
    }
    log(level, msg, pad = 9) {
        const date = new Date(Date.now()).toISOString();
        const prettyLevel = level.toUpperCase().padEnd(pad);
        const prettyClass = 'ClusterManager'.padEnd(28);
        console.log(`${date} - ${prettyLevel} - ${prettyClass} - ${msg}`);
    }
    commandLoader() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            let eventsPath = resolve(join(__dirname, 'commands'));
            let eventsFile = yield readdirRecursive(eventsPath);
            try {
                for (var _d = true, eventsFile_1 = __asyncValues(eventsFile), eventsFile_1_1; eventsFile_1_1 = yield eventsFile_1.next(), _a = eventsFile_1_1.done, !_a; _d = true) {
                    _c = eventsFile_1_1.value;
                    _d = false;
                    const path = _c;
                    yield this.registerCommand(path);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = eventsFile_1.return)) yield _b.call(eventsFile_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            yield new Promise((res, rej) => eventsFile.forEach((path, index) => __awaiter(this, void 0, void 0, function* () {
                yield this.registerCommand(path);
                if (index == eventsFile.length - 1)
                    return res(true);
            })));
            this.log('INFO', `Cluster command loaded successfully`);
        });
    }
    registerCommand(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new (yield import(pathToFileURL(path).toString())).default();
            if (!command.execute)
                return this.log('WARN', `Clister command [${command.name}] doesn't have exeture function on the class, Skipping...`);
            this.commands.set(command.name, command);
        });
    }
}

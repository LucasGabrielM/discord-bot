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
import readdirRecursive from 'recursive-readdir';
import { resolve } from 'path';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
export class PlayerEventLoader {
    constructor(client) {
        this.counter = 0;
        this.client = client;
        this.loader();
    }
    loader() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const path of ['player', 'track', 'node']) {
                let eventsPath = resolve(join(__dirname, '..', 'events', path));
                let eventsFile = yield readdirRecursive(eventsPath);
                yield this.registerPath(eventsFile);
            }
            this.client.logger.info(PlayerEventLoader.name, `${this.counter} Events Loaded!`);
        });
    }
    registerPath(eventsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, eventsPath_1, eventsPath_1_1;
            var _b, e_1, _c, _d;
            try {
                for (_a = true, eventsPath_1 = __asyncValues(eventsPath); eventsPath_1_1 = yield eventsPath_1.next(), _b = eventsPath_1_1.done, !_b; _a = true) {
                    _d = eventsPath_1_1.value;
                    _a = false;
                    const path = _d;
                    yield this.registerEvents(path);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_a && !_b && (_c = eventsPath_1.return)) yield _c.call(eventsPath_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    registerEvents(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const events = new (yield import(pathToFileURL(path).toString())).default();
            var splitPath = function (str) {
                return str.split('\\').pop().split('/').pop().split('.')[0];
            };
            const eName = splitPath(path);
            if (!events.execute)
                return this.client.logger.warn(PlayerEventLoader.name, `Event [${eName}] doesn't have exeture function on the class, Skipping...`);
            this.client.rainlink.on(eName, (...args) => events.execute(this.client, ...args));
            this.counter = this.counter + 1;
        });
    }
}

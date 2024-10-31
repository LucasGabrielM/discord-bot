var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ClusterCommand } from '../../@types/Cluster.js';
export default class extends ClusterCommand {
    get name() {
        return 'all_worker_pid';
    }
    execute(manager, worker, message) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                response: manager.workerPID.full.map((value) => value[1].process.pid),
            };
        });
    }
}
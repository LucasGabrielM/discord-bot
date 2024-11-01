import { MongoDriver } from 'dreamvast.quick.db/MongoDriver';
import { TableSetup } from '../table.js';
import { keyChecker } from '../keyChecker.js';
export class MongoConnectDriver {
    constructor(client, dbConfig) {
        this.client = client;
        this.dbConfig = dbConfig;
        this.connect();
    }
    connect() {
        const sampleConfig = {
            uri: 'mongodb://127.0.0.1:27017/dreamvast',
        };
        new keyChecker(this.client, this.dbConfig.config, sampleConfig, 'mongodb');
        const mongoDriver = new MongoDriver(this.dbConfig.config.uri);
        new TableSetup(this.client, mongoDriver, 'MongoDB');
    }
}

import CovenantSQLProxy from 'covenantsql-proxy-js';

import store from '../../store';
import Provider from './common/Provider';

export default new Provider({
  id: 'covenantsql',
  name: 'Covenantsql',
  getToken() {
    return store.getters['data/covenantsqlTokensBySub'].cql;
  },
  getConfig() {
    // use token field as config to be compatible with other accounts
    // which `cql` is hard-coded sub
    const { endpoint, dbid } = store.getters['data/covenantsqlTokensBySub'].cql;
    return { endpoint, dbid };
  },
  async connect() {
    const { endpoint, dbid } = this.getConfig();
    const connection = await CovenantSQLProxy.createConnection({ endpoint, dbid });
    return connection;
  },
  async createTableIfNotExists() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS stackedit (\
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
      );
    `;
    const conn = await this.connect();
    const result = conn.exec(createTableSQL);
    return result;
  },
  async checkFile(name) {
    const selectSQL = 'SELECT * FROM stackedit WHERE name = ? LIMIT 1;';
    const conn = await this.connect();
    const result = await conn.query(selectSQL, [name]);
    return result.length > 0;
  },
  async storeFile(name) {
    console.log(name);
  },
  async downloadContent(token, syncLocation) {
    const name = syncLocation.path;

    const selectSQL = 'SELECT * FROM stackedit WHERE name = ? ORDER BY `updated_at` DESC LIMIT 1;';
    const conn = await this.connect();
    const result = await conn.query(selectSQL, [name]);
    // result[0][2] indicates the 3rd column is content
    const content = result && result[0] && result[0][2];
    const parsed = Provider.parseContent(content, `${syncLocation.fileId}/content`);
    console.log(parsed);

    return 0;
  },
  async uploadContent(token, content, syncLocation) {
    const writeSQL = 'INSERT INTO stackedit (name, content, created_at, updated_at) VALUES (?, ?, ?, ?);';
    const name = syncLocation.path;
    const serializedContent = Provider.serializeContent(content);
    const now = (new Date()).toISOString();

    const conn = await this.connect();
    console.log('/// uploading', serializedContent);
    try {
      await conn.exec(writeSQL, [name, serializedContent, now, now]);
    } catch (e) {
      console.error(e);
      store.dispatch('notification/error', e);
    }

    return {
      ...syncLocation,
    };
  },
  getLocationUrl() {
    const { dbid } = this.getConfig();
    return `http://192.168.2.100:11149/?covenantsql=cql_adminer_adapter&username=&db=${dbid}&select=stackedit`;
  },
  getLocationDescription({ path, fileId }) {
    return fileId || path;
  },
  // async publish(token, html, metadata, publishLocation) {
  //   const dropboxFile = await covenantsqlHelper.uploadFile({
  //     token,
  //     path: publishLocation.path,
  //     content: html,
  //     fileId: publishLocation.dropboxFileId,
  //   });
  //   return {
  //     ...publishLocation,
  //     path: makePathAbsolute(token, dropboxFile.path_display),
  //     dropboxFileId: dropboxFile.id,
  //   };
  // },
  makeLocation(path) {
    return {
      fileId: path,
      path,
      providerId: 'covenantsql',
      sub: 'cql',
    };
  },
});

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
    try {
      const connection = await CovenantSQLProxy.createConnection({ endpoint, dbid });
      return connection;
    } catch (e) {
      store.dispatch('notification/error', `Connect CovenantSQL ${e}`);
      throw e;
    }
  },
  async createTableIfNotExists() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS stackedit (\
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      fileId TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
      );
    `;
    const conn = await this.connect();
    const result = conn.exec(createTableSQL);
    return result;
  },
  async checkFile(username, fileId) {
    const selectSQL = 'SELECT * FROM stackedit WHERE username = ? AND fileId = ? LIMIT 1;';
    const conn = await this.connect();
    const result = await conn.query(selectSQL, [username, fileId]);
    return result.length > 0;
  },
  async storeFile(fileId) {
    console.log(fileId);
  },
  async downloadContent(token, syncLocation) {
    const username = localStorage.getItem('username');
    const fileId = syncLocation.path;

    const selectSQL = 'SELECT * FROM stackedit WHERE username = ? AND fileId = ? ORDER BY `updated_at` DESC LIMIT 1;';
    const conn = await this.connect();
    const result = await conn.query(selectSQL, [username, fileId]);
    // result[0][2] indicates the 3rd column is content
    const content = result && result[0] && result[0][2];
    const parsed = Provider.parseContent(content, `${syncLocation.fileId}/content`);
    console.log(parsed);

    return 0;
  },
  async uploadContent(token, content, syncLocation) {
    const writeSQL = 'INSERT INTO stackedit (username, fileId, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?);';
    const username = localStorage.getItem('username');
    const fileId = syncLocation.path;
    const serializedContent = Provider.serializeContent(content);
    const now = (new Date()).toISOString();

    const conn = await this.connect();
    console.log('/// uploading', serializedContent);
    try {
      await conn.exec(writeSQL, [username, fileId, serializedContent, now, now]);
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
    return `https://web.covenantsql.io/?covenantsql=cql_adminer_adapter&username=&db=${dbid}&select=stackedit&columns[0][fun]=&columns[0][col]=&where[0][col]=&where[0][op]==&where[0][val]=&order[0]=created_at&desc[0]=1&order[01]=&limit=10&text_length=100`;
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

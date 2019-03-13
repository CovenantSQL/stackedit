import CovenantSQLProxy from 'covenantsql-proxy-js';

import store from '../../store';
// import covenantsqlHelper from './helpers/covenantsqlHelper';
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
      fileId TEXT NOT NULL PRIMARY KEY,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
      );
    `;
    const conn = await this.connect();
    const result = conn.exec(createTableSQL);
    return result;
  },
  async checkFile(fileId) {
    console.log(fileId);
  },
  async storeFile(fileId) {
    console.log(fileId);
  },
  // async downloadContent(token, syncLocation) {
  //   const { content } = await covenantsqlHelper.downloadFile({
  //     token,
  //     path: makePathRelative(token, syncLocation.path),
  //     fileId: syncLocation.dropboxFileId,
  //   });
  //   return Provider.parseContent(content, `${syncLocation.fileId}/content`);
  // },
  // async uploadContent(token, content, syncLocation) {
  //   const dropboxFile = await covenantsqlHelper.uploadFile({
  //     token,
  //     path: makePathRelative(token, syncLocation.path),
  //     content: Provider.serializeContent(content),
  //     fileId: syncLocation.dropboxFileId,
  //   });
  //   return {
  //     ...syncLocation,
  //     path: makePathAbsolute(token, dropboxFile.path_display),
  //     dropboxFileId: dropboxFile.id,
  //   };
  // },
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
  // makeLocation(token, path) {
  //   return {
  //     providerId: this.id,
  //     sub: token.sub,
  //     path,
  //   };
  // },
});

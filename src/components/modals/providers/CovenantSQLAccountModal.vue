<template>
  <modal-inner aria-label="CovenantSQL account">
    <div class="modal__content">
      <div class="modal__image">
        <icon-provider provider-id="covenantsql"></icon-provider>
      </div>
      <p>Link <b>CovenantSQL</b> to <b>StackEdit</b>.</p>
      <form-entry label="CovenantSQL Endpoint" error="endpoint">
        <!-- <input v-if="config.forceServerUrl" slot="field" class="textfield" type="text" disabled="disabled" v-model="config.forceServerUrl"> -->
        <input slot="field" class="textfield" type="text" v-model.trim="endpoint" @keydown.enter="resolve()">
        <div class="form-entry__info">
          <b>Local Proxy Example:</b> <pre style="display: inline">127.0.0.1:8888</pre><br />
          <b>Current TestNet Public Proxy is</b> <pre style="display: inline">api00.cn.gridb.io:7784</pre>
        </div>
      </form-entry>
      <form-entry label="Database ID" error="dbid">
        <input slot="field" class="textfield" type="text" v-model.trim="dbid" @keydown.enter="resolve()">
        <div class="form-entry__info">
          <b>Current TestNet Public DB:</b> <pre class="dbid">16c421128eeb8bb6c35eb633a16d206edbd653ce52c52dcda0abb767d2bb9ed0</pre>
        </div>
        <div class="form-entry__actions">
          <a href="https://developers.covenantsql.io/docs/quickstart/" target="_blank">How to setup your own database?</a>
        </div>
      </form-entry>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="config.reject()">Cancel</button>
      <button class="button button--resolve" @click="this.resolve">Ok</button>
    </div>
  </modal-inner>
</template>

<script>
import modalTemplate from '../common/modalTemplate';
import covenantsqlHelper from '../../../services/providers/helpers/covenantsqlHelper';
import covenantsqlProivder from '../../../services/providers/covenantsqlProvider';

export default modalTemplate({
  data: () => ({
    endpoint: 'api00.cn.gridb.io:7784',
    dbid: '16c421128eeb8bb6c35eb633a16d206edbd653ce52c52dcda0abb767d2bb9ed0',
  }),
  // computedLocalSettings: {
  //   endpoint: 'covenantsqlEndpoint',
  //   dbid: 'covenantsqlDBID',
  // },
  methods: {
    resolve() {
      if (!this.endpoint) {
        this.setError('endpoint');
      }
      if (!this.dbid) {
        this.setError('dbid');
      }
      if (this.endpoint && this.dbid) {
        const token = {
          sub: 'cql',
          endpoint: this.endpoint,
          dbid: this.dbid,
        };
        covenantsqlHelper.setToken(token);

        covenantsqlProivder.connect().then((connection) => {
          console.log('// CovenantSQL connected', connection);
          // create stackedit table if not exists
          covenantsqlProivder.createTableIfNotExists();
          this.config.resolve(token);
        });
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.dbid {
  font-size: 8px;
  display: inline;
}
</style>

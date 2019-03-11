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
          <b>Example:</b> <pre style="display: inline">127.0.0.1:6000</pre> (without `http://`)
        </div>
      </form-entry>
      <form-entry label="Database ID" error="dbid">
        <input slot="field" class="textfield" type="text" v-model.trim="dbid" @keydown.enter="resolve()">
        <div class="form-entry__info">
          <b>Example:</b> <pre style="display: inline">16c421128eeb8bb6c35eb633a16d206edbd653ce52c52dcda0abb767d2bb9ed0</pre>
        </div>
        <div class="form-entry__actions">
          <a href="https://docs.gitlab.com/ee/integration/oauth_provider.html" target="_blank">More info</a>
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

export default modalTemplate({
  data: () => ({}),
  computedLocalSettings: {
    endpoint: 'covenantsqlEndpoint',
    dbid: 'covenantsqlDBID',
  },
  methods: {
    resolve() {
      if (!this.endpoint) {
        this.setError('endpoint');
      }
      if (!this.dbid) {
        this.setError('dbid');
      }
      if (this.endpoint && this.dbid) {
        this.config.resolve({
          endpoint: this.endpoint,
          dbid: this.dbid,
        });

        alert('Call covenantsql connect, if return true then contine to load file and write file');
      }
    },
  },
});
</script>

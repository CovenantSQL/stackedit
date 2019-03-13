<template>
  <modal-inner aria-label="Synchronize with Dropbox">
    <div class="modal__content">
      <div class="modal__image">
        <icon-provider provider-id="covenantsql"></icon-provider>
      </div>
      <p>Save <b>{{currentFileName}}</b> to <b>CovenantSQL</b> and keep it synced.</p>
      <form-entry label="File ID" error="fileId">
        <input slot="field" class="textfield" type="text" v-model.trim="fileId" @keydown.enter="resolve()">
        <div class="form-entry__info">
          <b>Example:</b> use the filename <pre style="display: inline">{{fileId}}</pre> as file id in database. <br />
          If the file exists, it will be overwritten.
        </div>
      </form-entry>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="config.reject()">Cancel</button>
      <button class="button button--resolve" @click="resolve()">Ok</button>
    </div>
  </modal-inner>
</template>

<script>
import covenantsqlProvider from '../../../services/providers/covenantsqlProvider';
import modalTemplate from '../common/modalTemplate';

export default modalTemplate({
  data: () => ({
    fileId: '',
  }),
  created() {
    this.fileId = `${this.currentFileName}.md`;
  },
  methods: {
    resolve() {
      if (!covenantsqlProvider.checkFile(this.fileId)) {
        this.setError('fileId');
      } else {
        // Return new location
        const location = covenantsqlProvider.storeFile(this.config.token, this.fileId);
        this.config.resolve(location);
      }
    },
  },
});
</script>

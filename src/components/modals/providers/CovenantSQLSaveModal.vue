<template>
  <modal-inner aria-label="Synchronize with Dropbox">
    <div class="modal__content">
      <div class="modal__image">
        <icon-provider provider-id="covenantsql"></icon-provider>
      </div>
      <p>Save <b>{{currentFileName}}</b> to <b>CovenantSQL</b> and keep it synced.</p>
      <form-entry label="Username" error="username">
        <input slot="field" class="textfield" type="text" v-model.trim="username" @keydown.enter="resolve()">
        <div class="form-entry__info">
          <b>Your username will be the namespace.</b><br />
          If you use public databse, your file could be overwirtten by others while using the same name and fileId.
        </div>
      </form-entry>
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
import store from '../../../store';

export default modalTemplate({
  data: () => ({
    username: localStorage.getItem('username') || '',
    fileId: '',
  }),
  created() {
    this.fileId = `${this.currentFileName}`;
  },
  methods: {
    resolve() {
      if (!this.username) {
        this.setError('username');
        return;
      }
      localStorage.setItem('username', this.username);
      if (!this.fileId) {
        this.setError('fileId');
        return;
      }
      if (covenantsqlProvider.checkFile(this.username, this.fileId)) {
        store.dispatch('notification/info', `There is no ${this.username}'s file call ${this.fileId} in CovenantSQL, will be saved as a new file`);
      } else {
        store.dispatch('notification/info', 'already has file');
      }
      console.log('this file will be saved on CovenantSQL as', this.fileId, this.username);
      const location = covenantsqlProvider.makeLocation(this.fileId);
      this.config.resolve(location);
    },
  },
});
</script>

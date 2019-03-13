import store from '../../../store';

export default {
  setToken(token) {
    store.dispatch('data/addCovenantsqlToken', token);
    return token;
  },
};

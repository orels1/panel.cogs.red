import Auth0Lock from 'auth0-lock';

const AUTH0_CID = 'kzKXKzSJyqlWAmbNEeOrYSgShTGjd6de';
const AUTH0_DOMAIN = 'cogs.auth0.com';

export default {
  state: {
    lock: new Auth0Lock(AUTH0_CID, AUTH0_DOMAIN, {
      autoclose: true,
      auth: {
        responseType: 'token id_token',
      },
    }),
  },
  getters: {
    lock: state => state.lock,
  },
};

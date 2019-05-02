<template lang="pug">
  v-container(fluid)
    v-slide-y-transition(mode="out-in")
      v-layout
        v-flex(xs12 offset-sm4 sm4)
          v-layout(column)
            h3.headline Log in or Log out
            br
            v-card
              v-card-title
                v-layout(column)
                  .text-xs-center(v-if="authenticated && profile.nickname")
                    |Welcome, {{profile.nickname}}!
                    v-btn(to="/" flat) Go back to mainpage.
                    br
                    br
                    v-divider
                    br
                  v-btn(
                    color="primary"
                    @click="loginClick"
                    v-if="!authenticated"
                    :loading="token && !authenticated"
                  ) Log in
                  v-btn(color="error" @click="logoutClick" v-if="authenticated") Log out
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import Auth0Lock from 'auth0-lock';
import { mapGetters, mapActions } from 'vuex';

const AUTH0_CID = 'kzKXKzSJyqlWAmbNEeOrYSgShTGjd6de';
const AUTH0_DOMAIN = 'cogs.auth0.com';

@Component({
  methods: {
    ...mapActions(['login', 'logout', 'getUserMeta', 'setProfile', 'authenticate']),
  },
  computed: {
    ...mapGetters(['token', 'authenticated', 'profile']),
  },
})
export default class Auth extends Vue {
  lock = new Auth0Lock(AUTH0_CID, AUTH0_DOMAIN, {
    autoclose: true,
    auth: {
      responseType: 'token id_token',
    },
  });

  loginClick() {
    console.log('showing lock');
    this.lock.show();
  }

  logoutClick() {
    this.logout();
    document.location.reload();
  }

  mounted() {
    Vue.nextTick(() => {
      if (this.authenticated) return;
      this.lock.on('authenticated', (authResult) => {
        const expireMs = authResult.expiresIn * 1000;
        this.login({ token: authResult.idToken, expire: Date.now() + expireMs });
        this.lock.getUserInfo(authResult.accessToken, async (err, profile) => {
          this.setProfile(profile);
          await this.getUserMeta();
          this.authenticate();
        });
      });
      this.lock.on('authorization_error', (error) => {
        if (error.error === 'invalid_token') {
          window.location.reload();
        }
        console.log(error);
      });
    });
  }
}
</script>

<style scoped>
</style>

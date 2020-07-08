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
                  .text-xs-center(v-if="$auth.isAuthenticated && profile.nickname")
                    |Welcome, {{profile.nickname}}!
                    v-btn(to="/" flat) Go back to mainpage.
                    br
                    br
                    v-divider
                    br
                  v-btn(
                    color="primary"
                    @click="loginClick"
                    v-if="!$auth.isAuthenticated"
                    :loading="$auth.loading && !$auth.isAuthenticated"
                  ) Log in
                  v-btn(color="error" @click="logoutClick" v-if="$auth.isAuthenticated") Log out
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapGetters, mapActions } from 'vuex';

const AUTH0_CID = 'kzKXKzSJyqlWAmbNEeOrYSgShTGjd6de';
const AUTH0_DOMAIN = 'cogs.auth0.com';

@Component({
  computed: {
    ...mapGetters(['profile']),
  },
})
export default class Auth extends Vue {
  loginClick() {
    this.$auth.loginWithRedirect();
  }

  logoutClick() {
    this.$auth.logout({
      returnTo: window.location.origin
    });
  }

  mounted() {
  }
}
</script>

<style scoped>
</style>

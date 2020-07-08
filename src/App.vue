<template lang="pug">
  v-app(:dark="darkTheme")
    v-navigation-drawer(
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      :width="200"
      mobile-break-point="640"
      enable-resize-watcher
      fixed
      app
    )
      v-list
        v-list-tile(
          value="true"
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          v-if="item.private ? (item.qa ? isQA || isAdmin : $auth.isAuthenticated) : true"
        )
          v-list-tile-action
            v-icon(v-html="item.icon")
          v-list-tile-content
            v-list-tile-title(v-text="item.title")
    v-toolbar(app :clipped-left="clipped" dark :color="topbarColor")
      v-btn(icon @click.stop="miniVariant = !miniVariant")
        v-icon(v-html="miniVariant ? 'chevron_right' : 'chevron_left'")
      v-toolbar-title(v-text="title")
      v-spacer
      v-badge.role-badge(right overlap :color="isAdmin ? 'orange' : 'purple'")
        v-icon(v-if="isAdmin" slot="badge" dark small) flag
        span.font-weight-bold(
          v-if="isQA"
          class="font-weight-bold"
          slot="badge"
        ) QA
        v-btn(v-if="$auth.isAuthenticated" to="/auth" round)
          v-avatar(size="20")
            img(:src="profile.picture")
          .ml-2 {{profile.nickname}}
      v-btn(to="/auth" v-show="!$auth.isAuthenticated") Log in
      v-btn(icon)
        v-icon(v-if="!darkTheme" @click="setDarkTheme(true)") brightness_2
        v-icon(v-if="darkTheme" @click="setDarkTheme(false)") brightness_5
    v-content
      v-layout.authOverlay(
        v-if="(!$auth.isAuthenticated && $auth.loading) || showOverlay"
        row
        align-center
        justify-center
      )
        v-flex.text-xs-right.mr-5(xs4)
          v-progress-circular(size="50" width="5" indeterminate color="red")
        v-flex(xs8)
          h3.headline Hang tight, we're logging you in
      v-snackbar(
        :value="notification.shown"
        :color="notification.color"
        v-if="notification.shown"
        right
        bottom
      ) {{notification.message}}
      router-view
    v-footer.pa-3(text-xs-right height="auto")
      v-layout(row justify-end align-center)
        div Found an issue?
        v-btn(href="https://github.com/orels1/panel.cogs.red/issues/new" target="_blank" depressed) File an issue!
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import colors from 'vuetify/es5/util/colors';
import { mapGetters, mapActions } from 'vuex';

@Component({
  computed: {
    ...mapGetters(['darkTheme', 'profile', 'notification', 'meta', 'isAdmin', 'isQA']),
  },
  methods: {
    ...mapActions(['setDarkTheme', 'clearProfile', 'logout', 'getUserMeta', 'setProfile', 'authenticate']),
  },
})
export default class App extends Vue {
  clipped = false;
  drawer = true;
  fixed = false;
  showOverlay = false;
  items = [
    {
      icon: 'home',
      title: 'Home',
      to: '/',
    },
    {
      icon: 'dashboard',
      title: 'Dashboard',
      to: '/dashboard',
      private: true,
    },
    {
      icon: 'error',
      title: 'Report Feed',
      to: '/reportFeed',
      private: true,
      qa: true,
    },
    {
      icon: 'add_box',
      title: 'Add Repo',
      to: '/addRepo',
      private: true,
    },
  ];
  miniVariant = true;
  right = true;
  rightDrawer = false;
  title = 'COGS.RED Panel';
  topbarColor = colors.red.darken2;

  async mounted() {
    this.$watch(
      () => {
        return this.$auth.loading;
      },
      // getting tokens on app init
      async (loading) => {
        if (!loading) {
          const authed = this.$auth.isAuthenticated;
          if (authed) {
            const token = await this.$auth.getTokenSilently();
            const claims = await this.$auth.getIdTokenClaims();
            this.setProfile(this.$auth.user);
            this.getUserMeta();
            this.authenticate();
          }
          if (!authed) {
            this.showOverlay = true;
            this.clearProfile(this.$auth.user);
            this.logout();
            this.$auth.loginWithRedirect({ appState: { targetUrl: window.location } });
          }
        }
      }
    );
  }
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}

.authOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.4);
}
</style>

<style>
.v-badge--overlap.role-badge .v-badge__badge {
  top: 0;
  right: 1px;
}
</style>


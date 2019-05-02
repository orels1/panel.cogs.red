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
          v-if="item.private ? authenticated : true"
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
        v-btn(v-if="authenticated" to="/auth" round)
          v-avatar(size="20")
            img(:src="profile.picture")
          .ml-2 {{profile.nickname}}
      v-btn(to="/auth" v-show="!authenticated") Log in
      v-btn(icon)
        v-icon(v-if="!darkTheme" @click="setDarkTheme(true)") brightness_2
        v-icon(v-if="darkTheme" @click="setDarkTheme(false)") brightness_5
    v-content
      v-snackbar(
        :value="notification.shown"
        :color="notification.color"
        v-if="notification.shown"
        right
        bottom
        absolute
      ) {{notification.message}}
      router-view
    v-footer.pa-3(text-xs-right height="auto")
      v-layout(row justify-end align-center)
        div Found an issue?
        v-btn(href="https://github.com" target="_blank" depressed) File an issue!
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import colors from 'vuetify/es5/util/colors';
import { mapGetters, mapActions } from 'vuex';

@Component({
  computed: {
    ...mapGetters(['darkTheme', 'authenticated', 'profile', 'notification', 'meta', 'isAdmin', 'isQA']),
  },
  methods: {
    ...mapActions(['setDarkTheme']),
  },
})
export default class App extends Vue {
  clipped = false;
  drawer = true;
  fixed = false;
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
}
</script>

<style scoped>
.clickable {
  cursor: pointer;
}
</style>

<style>
.v-badge--overlap.role-badge .v-badge__badge {
  top: 0;
  right: 1px;
}
</style>


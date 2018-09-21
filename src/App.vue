<template>
  <v-app :dark="darkTheme">
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      :clipped="clipped"
      v-model="drawer"
      :width="200"
      enable-resize-watcher
      fixed
      app
      mobile-break-point="640"
    >
      <v-list>
          <v-list-tile
            value="true"
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            v-if="item.private ? authenticated : true"
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
      </v-list>
    </v-navigation-drawer>
    <v-toolbar
      app
      :clipped-left="clipped"
      dark
      :color="topbarColor"
    >
      <v-btn icon @click.stop="miniVariant = !miniVariant">
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-toolbar-title v-text="title"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="authenticated" to="/auth" round>
        <v-avatar size="20"><img :src="profile.picture" /></v-avatar>
        <div class="ml-2">{{profile.nickname}}</div>
      </v-btn>
      <v-btn to="/auth" v-show="!authenticated">Log in</v-btn>
      <v-btn icon>
        <v-icon v-if="!darkTheme" @click="setDarkTheme(true)">brightness_2</v-icon>
        <v-icon v-if="darkTheme" @click="setDarkTheme(false)">brightness_5</v-icon>
      </v-btn>
    </v-toolbar>
    <v-content>
      <router-view/>
    </v-content>
  </v-app>
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import colors from 'vuetify/es5/util/colors';
import { mapGetters, mapActions } from 'vuex';

@Component({
  computed: {
    ...mapGetters(['darkTheme', 'authenticated', 'profile']),
  },
  methods: {
    ...mapActions(['setDarkTheme']),
  },
})
export default class App extends Vue {
  clipped = false;
  drawer = true;
  fixed = false;
  items = [{
    icon: 'dashboard',
    title: 'Dashboard',
    to: '/',
  },
  {
    icon: 'add_box',
    title: 'Add Repo',
    to: '/addRepo',
    private: true,
  }];
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


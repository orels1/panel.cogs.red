<template lang="pug">
  v-container(fluid)
    v-slide-y-transition(mode="out-in")
      v-layout
        v-flex(xs12)
          v-card
            v-card-title(primary-title)
              div
                h3.headline.mb-0 New site, who dis?
                v-layout(column)
                  div.
                    Yes yes! Welcome to cogs.red panel! This place is built for Cog-Creators,
                     Admins, QA and other Staff interaction with cogs.red backend and other
                     community-related things.
                  br
                  v-divider
                  br
                  h4.title Stuff to do
                  v-list(two-line)
                    v-subheader Useful
                    v-list-tile(v-show="!authenticated")
                      v-list-tile-content
                        v-list-tile-title Log in!
                        v-list-tile-sub-title
                          router-link(to="/auth").
                            First of all - log into your profile to use this whole thing.
                    v-list-tile
                      v-list-tile-content
                        v-list-tile-title Submit a repo
                        v-list-tile-sub-title.
                          Click the plus on the left panel to submit a new repo to cogs.red!
                    v-subheader Fluff
                    v-list-tile
                      v-list-tile-content
                        v-list-tile-title Go darkside!
                        v-list-tile-sub-title Click on the moon icon in the top-right of the page 😎

</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapGetters } from 'vuex';

@Component({
  computed: {
    ...mapGetters(['authenticated']),
  },
})
export default class Home extends Vue {

}
</script>

<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>

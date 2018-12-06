<template lang="pug">
  v-container(fluid grid-list-md)
    v-slide-y-transition(mode="out-in")
      div
        v-layout(row wrap)
          v-flex(d-flex xs12 md4)
            v-card(color="red darken-4")
              v-card-title
                v-layout(row justify-space-between)
                  v-icon.icon(large) view_agenda
                  v-layout(column align-end)
                    h3.display-1.font-weight-bold {{repos.length}} Repos
                    div Submitted
          v-flex(d-flex xs12 md4 v-for="item in [1, 2]" :key="item")
            v-card()
              v-card-title
                v-layout(row justify-space-between)
                  v-icon.icon(large) all_inclusive
                  v-layout(column align-end)
                    h3.display-1.font-weight-bold Not Yet
                    div Implemented
        v-layout
          v-flex(d-flex xs12 md8)
            v-card
              v-card-title.headline.grey.darken-4
                span Repos List
                v-spacer
                v-btn(
                  icon
                  small
                  @click="loadDashboardRepos"
                  :disabled="reposLoading"
                  :loading="reposLoading"
                )
                  v-icon refresh
              v-card-text.pa-0
                v-data-table(
                  :headers="reposHeaders"
                  :items="repos"
                  :loading="reposLoading"
                  hide-actions
                )
                  template(slot="items" slot-scope="props")
                    td {{props.item.name}}
                    td.text-xs-right {{props.item.author.username}}
                    td.text-xs-right {{props.item.type}}
                    td.text-xs-right {{props.item.hidden.toString()}}
                    td.text-xs-center
                      v-btn(
                        icon
                        :href="`http://dev.v3.cogs.red${props.item.links.self}`"
                        target="_blank"
                      )
                        v-icon link
                    td.text-xs-center(v-if="meta.admin")
                      v-layout(row)
                        v-tooltip(left)
                          v-btn(icon color="blue" small slot="activator")
                            v-icon(small) visibility_off
                          span Hide
                        v-tooltip(right)
                          v-btn(icon color="red" small slot="activator")
                            v-icon(small) delete
                          span Delete

</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapActions, mapGetters, mapState } from 'vuex';

@Component({
  computed: {
    ...mapGetters('dashboard', ['repos']),
    ...mapState('dashboard', {
      reposLoading: state => state.repos.loading,
    }),
    ...mapGetters(['meta']),
  },
  methods: {
    ...mapActions('dashboard', ['loadRepos', 'loadAllrepos']),
    ...mapActions(['notify']),
  },
})
export default class Dashboard extends Vue {
  get reposHeaders() {
    const headers = [
      { text: 'Name', value: 'name' },
      { text: 'Author', align: 'right', value: 'author' },
      { text: 'Type', align: 'right', value: 'type' },
      { text: 'Hidden?', align: 'right', value: 'hidden' },
      {
        text: 'Link', align: 'center', value: 'link', sortable: false,
      },
    ];
    if (this.meta.admin) {
      headers.push({
        text: 'Actions',
        align: 'center',
        value: 'actions',
        sortable: false,
      });
    }
    return headers;
  }

  async loadDashboardRepos() {
    if (this.meta.admin) {
      const err = await this.loadAllrepos();
      if (err) {
        this.notify({
          color: 'error',
          message: err,
        });
      }
      return null;
    }
    const err = await this.loadRepos();
    if (err) {
      this.notify({
        color: 'error',
        message: err,
      });
    }
    return null;
  }

  async mounted() {
    if (!this.repos.length) {
      await this.loadDashboardRepos();
    }
  }
}
</script>

<style scoped>
.icon {
  padding: 10px 10.5px;
  border-radius: 50%;
  background: hsla(0, 0%, 0%, 30%);
}
</style>

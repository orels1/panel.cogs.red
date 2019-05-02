<template lang="pug">
  v-container(fluid grid-list-md)
    v-slide-y-transition(mode="out-in")
      v-layout(column)
        v-flex(d-flex)
          v-card(max-width="100%")
            v-card-title.headline.grey(:class="[darkTheme ? 'darken-4' : 'lighten-2']")
              span Repos List
              v-spacer
              v-text-field.mt-0.pt-0(
                v-model="search"
                append-icon="search"
                label="Search"
                single-line
                hide-details
              )
              v-btn(
                icon
                small
                @click="fetchRepos"
                :disabled="isLoading"
                :loading="isLoading"
              )
                v-icon refresh
            v-card-text.pa-0
              v-data-table(
                :headers="reposHeaders"
                :items="repos"
                :loading="isLoading"
                item-key="path"
                :search="search"
              )
                template(slot="items" scope="props")
                  tr(@click="expandRepo(props.item.path, props, $event)")
                    td
                      |{{props.item.name}}
                      v-tooltip(right v-if="reports[props.item.name]")
                        v-icon.ml-2(
                          small
                          slot="activator"
                          :color="getReportsColor(reports[props.item.name])"
                        ) error_outline
                        span Reports: {{reports[props.item.name]}}

                    td.text-xs-right {{props.item.branch}}
                    td.text-xs-right {{props.item.author.username}}
                    td.text-xs-center {{updateTime(props.item.updated, props.item.created)}}
                    td.text.xs-center
                      v-layout(row justify-center align-center)
                        div {{props.item.version}}
                    td.text-xs-center(v-if="actionAccess")
                      v-layout(row justify-center)
                        v-tooltip(left)
                          v-btn(
                            icon
                            color="blue"
                            small
                            slot="activator"
                            @click="hideRepoStart(props.item)"
                          )
                            v-icon.hideIcon(small)
                              |{{props.item.hidden ? 'visibility_on' : 'visibility_off'}}
                          span {{props.item.hidden ? 'Show' : 'Hide' }}
                        v-tooltip(left)
                          v-btn(
                            icon
                            color="red"
                            small
                            slot="activator"
                            @click="deleteRepo(props.item)"
                          )
                            v-icon(small) delete
                          span Delete
                        v-tooltip(left v-if="props.item.type === 'unapproved'")
                          v-btn(
                            icon
                            color="green"
                            small
                            slot="activator"
                            @click="approveRepoStart(props.item)"
                          )
                            v-icon(small) check
                          span Approve
                        v-tooltip(left v-if="props.item.type === 'approved'")
                          v-btn(
                            icon
                            color="red"
                            small
                            slot="activator"
                            @click="approveRepoStart(props.item)"
                          )
                            v-icon(small) close
                          span Unapprove
                template(slot="expand" scope="props" v-if="repos.length")
                  v-card(flat)
                    v-card-text
                      v-layout(row wrap justify-start)
                        v-list.pt-0.reports-list
                          v-list-group(
                            v-for="cog in cogs[props.item.path]"
                            :key="cog.path"
                            v-model="cog.expanded"
                            :prepend-icon="cog.reports.length ? 'error' : 'done'"
                            no-action
                          )
                            template(v-slot:activator)
                              v-list-tile
                                v-list-tile-content
                                  v-list-tile-title {{cog.name}}
                            v-list-tile.pb-1(
                              v-for="report in cog.reports"
                              :key="report.timestamp"
                            )
                              v-list-tile-content
                                v-list-tile-title {{getReportLabel(report.type)}}
                                v-list-tile-sub-title(v-if="report.comment") {{report.comment}}
                              v-list-tile-action
                                v-list-tile-action-text {{getFormattedTimestamp(report.timestamp)}}
        v-flex(d-flex)
          v-card(max-width="100%" v-if="isAdmin")
            v-card-title.headline.grey(:class="[darkTheme ? 'darken-4' : 'lighten-2']")
              span Users List
              v-spacer
              v-btn(
                icon
                small
                @click="loadUsers"
                :disabled="isUsersLoading"
                :loading="isUsersLoading"
              )
                v-icon refresh
            v-card-text.pa-0
              v-data-table(
                :headers="[{ text: 'Name', value: 'name', width: '30%' }, { text: 'Roles', value: 'Roles' }]"
                :items="users"
                :loading="isUsersLoading"
                item-key="node_id"
                hide-actions
              )
                template(slot="items" scope="props")
                  tr
                    td
                      span(:class="props.item.app_metadata.admin && 'yellow--text text--darken-1'") {{props.item.name}}
                      span.pl-2(v-if="props.item.app_metadata.admin" class="grey--text text--lighten-3") [admin]
                    td
                      v-edit-dialog(
                        :return-value.sync="props.item.name"
                        lazy
                        @close="updateRoles(props.item)"
                        @open="saveOldRoles(props.item)"
                      ) 
                        v-chip(v-for="role in props.item.app_metadata.roles" :key="role") {{role}}
                        template(slot="input")
                          div(style="min-height: 200px;")
                            v-select(
                              v-model="props.item.app_metadata.roles"
                              :items="['staff', 'qa', 'user']"
                              attach
                              chips
                              multiple
                            )
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapActions, mapGetters } from 'vuex';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime);

@Component({
  computed: {
    ...mapGetters(
      'dashboard',
      [
        'repos',
        'cogs',
        'reports',
        'isLoading',
        'shouldFetchRepos',
        'users',
        'isUsersLoading',
      ]
    ),
    ...mapGetters(['isAdmin', 'isQA', 'darkTheme']),
  },
  methods: {
    ...mapActions(
      'dashboard',
      [
        'loadRepos',
        'loadAllRepos',
        'loadReports',
        'removeRepo',
        'hideRepo',
        'approveRepo',
        'loadCogs',
        'loadUsers',
        'updateUser'
      ]
    ),
    ...mapActions(['notify']),
  },
})
export default class Dashboard extends Vue {
  search = '';
  reportLabelMapping = {
    'api_abuse': 'Api abuse',
    'malware': 'Malware',
    'license': 'License infringement'
  }

  oldRoles = [];

  get reposHeaders() {
    const headers = [
      { text: 'Name', value: 'name' },
      { text: 'Branch', align: 'right', value: 'branch' },
      { text: 'Author', align: 'right', value: 'author' },
      {
        text: 'Updated', align: 'center', value: 'updated', sortable: false,
      },
      {
        text: 'Version', align: 'center', value: 'version',
      },
    ];
    if (this.actionAccess) {
      headers.push({
        text: 'Actions',
        align: 'center',
        value: 'actions',
        sortable: false,
      });
    }
    return headers;
  }

  get actionAccess() {
    return this.isAdmin || this.isQA;
  }

  /* eslint-disable class-methods-use-this */
  updateTime(updated, created) {
    return dayjs(updated || created).format('DD MMM');
  }

  getFormattedTimestamp(timestamp) {
    return dayjs(timestamp).fromNow();
  }

  getReportLabel(value) {
    return this.reportLabelMapping[value];
  }

  getReportsColor(amount) {
    if (amount < 5) {
      return 'hsl(0, 0%, 80%)';
    }
    if (amount >= 5 && amount < 10) {
      return 'yellow darken-1';
    }
    if (amount >= 10) {
      return 'error';
    }
  }
  /* eslint-enable class-methods-use-this */

  async fetchRepos() {
    let err = await (this.actionAccess ? this.loadAllRepos() : this.loadRepos());
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    if (this.actionAccess) {
      err = await this.loadReports();
      if (err) {
        return this.notify({
          color: 'error',
          message: err,
        });
      }
    }
    return null;
  }

  async expandRepo(path, props, event) {
    if (event.path.find(i => i.nodeName === 'BUTTON')) {
      return;
    }
    if (!props.expanded) {
      const err = await this.loadCogs(path);
      if (err) {
        return this.notify({
          color: 'error',
          message: err,
        });
      }
    }
    props.expanded = !props.expanded; /* eslint-disable-line no-param-reassign */
    return null;
  }

  async deleteRepo(repo) {
    const err = await this.removeRepo({
      repo: repo.name,
      username: repo.author.username,
      branch: repo.branch,
    });
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    await this.fetchRepos();
    return null;
  }

  async hideRepoStart(repo) {
    const err = await this.hideRepo({
      repo: repo.name,
      username: repo.author.username,
      branch: repo.branch,
      hidden: !repo.hidden,
    });
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    await this.fetchRepos();
    return null;
  }

  saveOldRoles(item) {
    this.oldRoles = item.app_metadata.roles;
  }

  async updateRoles(item) {
    if (isEqual(this.oldRoles, item.app_metadata.roles)) {
      this.oldRoles = [];
      return;
    }
    const data = {
      app_metadata: {
        roles: item.app_metadata.roles
      }
    }
    const err = await this.updateUser({ id: item.user_id, data });
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    await this.loadUsers();
    return null;
  }

  async approveRepoStart(repo) {
    await this.approveRepo(repo);
    await this.fetchRepos();
  }

  async mounted() {
    if (this.shouldFetchRepos) {
      await this.fetchRepos();
    }
    if (this.isAdmin) {
      await this.loadUsers();
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

/* Hide icon weird fix */
.hideIcon {
  width: 16px;
  display: block;
}

.reports-list {
  width: 100%;
}
</style>
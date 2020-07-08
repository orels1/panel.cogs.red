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
                      v-tooltip(right v-if="props.item.reports.length")
                        v-icon.ml-2(
                          small
                          slot="activator"
                          :color="getReportsColor(props.item.reports.length)"
                        ) error_outline
                        span Reports: {{props.item.reports.length}}

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
                        v-tooltip(left v-if="isAdmin")
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
                        v-flex(xs12)
                          v-list.pt-0
                            v-list-group(
                              v-for="cog in cogs[props.item.path]"
                              :key="cog.path"
                              :value="cogExpandedStates[cog.path]"
                              @change="expandCog(cog.path)"
                              :prepend-icon="cog.reports.length ? 'error' : 'done'"
                              :disabled="!cog.reports.length"
                              :append-icon="cog.reports.length ? 'keyboard_arrow_down' : ''"
                              no-action
                            )
                              template(v-slot:activator)
                                v-list-tile
                                  v-list-tile-content
                                    v-list-tile-title {{cog.name}}
                              reports-list(
                                :reports="cog.reports"
                                :onSeenClick="seeReport"
                                :onUnSeenClick="unSeeReport"
                                :onDismissClick="dismissReport"
                                :onUnDismissClick="restoreReport"
                                :actionAccess="actionAccess"
                              )
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
                      span(
                        :class="getUserAdminFlag(props.item) && 'yellow--text text--darken-1'") {{props.item.nickname}}
                      span.pl-2(v-if="getUserAdminFlag(props.item)" class="grey--text text--lighten-3") [admin]
                    td
                      v-edit-dialog(
                        :return-value.sync="props.item.name"
                        lazy
                        @close="updateRoles(props.item)"
                        @open="saveOldRoles(props.item)"
                      ) 
                        v-chip(
                          v-for="role in (props.item.app_metadata ? props.item.app_metadata.roles : [])"
                          :key="role"
                        ) {{role}}
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
import ReportsList from '@/components/ReportsList.vue';
import dayjs from 'dayjs';
import { isEqual } from 'lodash';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

@Component({
  components: {
    'reports-list': ReportsList,
  },
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
        'updateUser',
        'markReport',
      ]
    ),
    ...mapActions(['notify']),
  },
})
export default class Dashboard extends Vue {
  search = '';

  oldRoles = [];
  cogExpandedStates = {};

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

  getUserAdminFlag(user) {
    if (!user.app_metadata) {
      return false;
    }
    return user.app_metadata.admin;
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
    err = await this.loadReports(this.actionAccess);
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
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

  expandCog(path) {
    if (Object.keys(cogExpandedStates).includes(path)) {
      cogExpandedStates[path] = !cogExpandedStates[path];
      return;
    }
    cogExpandedStates[path] = true;
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

  async reportAction(type, value, id) {
    const err = await this.markReport({
      type,
      value,
      id,
    });
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    return null;
  }
  /* eslint-disable class-methods-use-this */
  async seeReport(report) {
    await this.reportAction('seen', true, report.id);
  }

  async unSeeReport(report) {
    await this.reportAction('seen', false, report.id);
  }

  async dismissReport(report) {
    await this.reportAction('stale', true, report.id);
  }

  async restoreReport(report) {
    await this.reportAction('stale', false, report.id);
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
<style>
.tile-normal .v-list__tile {
  height: 48px;
}

.tile-large .v-list__tile {
  height: 88px;
}

.v-list__group__items--no-action .v-list__tile {
  padding-left: 16px;
}
</style>
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

.tile-large {
  height: 88px;
}

.tile-normal {
  height: 48px;
}
</style>
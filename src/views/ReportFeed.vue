<template lang="pug">
v-container(fluid grid-list-md)
    v-slide-y-transition(mode="out-in")
      v-layout(column)
        v-flex(d-flex)
          v-card(max-width="100%")
            v-card-title.headline.grey(:class="[darkTheme ? 'darken-4' : 'lighten-2']")
              span Reports Feed
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
                @click="fetchReports"
                :disabled="isLoading"
                :loading="isLoading"
              )
                v-icon refresh
            v-card-text
              reports-list(
                :reports="filteredReports"
                :onSeenClick="seeReport"
                :onUnSeenClick="unSeeReport"
                :onDismissClick="dismissReport"
                :onUnDismissClick="restoreReport"
                :actionAccess="actionAccess"
                showCogPath
              )
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import { mapActions, mapGetters } from 'vuex';
import ReportsList from '@/components/ReportsList.vue';

export default @Component({
  components: {
    'reports-list': ReportsList,
  },
  computed: {
    ...mapGetters(
      'dashboard',
      [
        'reports',
        'isLoading',
      ],
    ),
    ...mapGetters(['isAdmin', 'isQA', 'darkTheme']),
  },
  methods: {
    ...mapActions(
      'dashboard',
      [
        'loadReports',
        'markReport',
      ],
    ),
    ...mapActions(['notify']),
  },
})
class ReportFeed extends Vue {
  search = '';

  get filteredReports() {
    return this.reports.filter(i => i.path.includes(this.search));
  }
  get actionAccess() {
    return this.isAdmin || this.isQA;
  }

  async fetchReports() {
    const err = await this.loadReports(this.actionAccess);
    if (err) {
      return this.notify({
        color: 'error',
        message: err,
      });
    }
    return null;
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
    await this.fetchReports();
  }
}
</script>

<style scoped>
</style>

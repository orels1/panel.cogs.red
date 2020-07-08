<template lang="pug">
v-layout.my-2.reportsList(column)
  v-layout.mx-1.mb-2(
    v-for="report in reports"
    :key="report.created"
    row
    justify-space-between
    elevation-1
  )
    v-flex.pl-2(xs1)
      v-tooltip(left v-if="actionAccess")
        v-btn(
          icon
          :color="report.seen ? 'grey' : 'blue'"
          small
          slot="activator"
          @click="report.seen ? onUnSeenClick(report) : onSeenClick(report)"
        )
          v-icon.hideIcon(small)
            |{{report.seen ? 'visibility_off' : 'visibility_on'}}
        span {{report.seen ? 'Mark as unseen' : 'Mark as seen' }}
    v-layout.mt-1(d-flex column)
      v-layout.text-xs-left(
        align-center
        justify-start
        row
        xs12
      )
        v-flex(style="flex-grow: 0;" v-if="showCogPath")
          v-chip(label) {{report.path}}
        v-flex(style="flex-grow: 0;")
          v-chip(label) {{getReportLabel(report.type)}}
        v-flex.text-xs-left.caption.grey--text Submitted {{getFormattedTimestamp(report.created)}}
      v-flex(v-if="report.comment" xs12)
        v-flex {{report.comment}}
      v-flex(v-if="report.updated && report.seen && !report.stale" xs12)
        v-flex.caption.grey--text
          |Seen {{getFormattedTimestamp(report.updated)}} by {{report.seenBy}}
      v-flex(v-if="report.updated && report.stale" xs12)
        v-flex.caption.grey--text
          |Dismissed {{getFormattedTimestamp(report.updated)}} by {{report.dismissedBy}}
    v-flex(
      d-flex
      xs1
      align-center
    )
    v-flex.pl-2(xs1)
      v-tooltip(left v-if="actionAccess")
        v-btn(
          icon
          :color="report.stale ? 'grey' : 'red'"
          small
          slot="activator"
          @click="report.stale ? onUnDismissClick(report) : onDismissClick(report)"
        )
          v-icon(small)
            |{{report.stale ? 'remove_circle_outline' : 'remove_circle'}}
        span {{report.stale ? 'Mark as relevant' : 'Dismiss' }}
</template>

<script>
import Vue from 'vue';
import Component from 'vue-class-component';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export default @Component({
  props: {
    reports: Array,
    onSeenClick: Function,
    onUnSeenClick: Function,
    onDismissClick: Function,
    onUnDismissClick: Function,
    showCogPath: { type: Boolean, default: false },
    actionAccess: { type: Boolean, default: false },
  },
})
class ReportsList extends Vue {
  reportLabelMapping = {
    api_abuse: 'Api abuse',
    malware: 'Malware',
    license: 'License infringement',
  }

  /* eslint-disable class-methods-use-this */
  getFormattedTimestamp(timestamp) {
    return dayjs(timestamp).fromNow();
  }

  getReportLabel(value) {
    return this.reportLabelMapping[value];
  }
}
</script>

<style scoped>
.hideIcon {
  width: 16px;
  display: block;
}
</style>

<template lang="pug">
  md-dialog(:md-active.sync="shared.dialogs.summary")
    md-dialog-title
      h1.md-title Additional summary

    md-dialog-content
      md-list
        md-list-item(v-for="(value, key) of additionals", :key="key")
          span.md-list-item-text {{ key }}
          span {{ value }}

    md-dialog-actions
      md-button(@click="shared.dialogs.summary = false") Close
</template>

<script>
import state from "../state";
export default {
  name: "EventSummary",
  data: () => ({ shared: state }),
  computed: {
    eventAttendance() {
      return this.shared.attendance.filter(
        a => a.event.id == this.$route.params.id
      );
    },
    additionals() {
      let result = {};
      for (let att of this.eventAttendance) {
        let additional = att.additional;
        if (additional) {
          result[additional] = (result[additional] || 0) + 1;
        }
      }
      return result;
    },
  },
};
</script>

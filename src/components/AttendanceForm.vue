<template lang="pug">
md-card
    form(@submit.prevent="changeAttendance")
        md-card-header
            h1.md-title Attendance
            h2.md-subheading(v-if="shared.selectedMember")
                span {{member.firstName}} {{member.lastName}}
                span(v-show="member.access") &nbsp;— {{member.access}}
                md-icon(v-show="!member.registered") person_outline

                p.error(v-show="error") {{error}}

        md-card-content(v-show="shared.selectedMember")
                md-checkbox#food-checkbox(v-model="attendance.primary")
                    md-icon local_pizza
                    | Food
                md-field
                    md-icon local_drink
                    label Drinks
                    md-input(v-model.number="attendance.secondary", type="number", min="0")
                    md-button.md-icon-button(@click="incrementDrink", tabindex=-1) +

                md-field
                    md-icon description
                    label Additional
                    md-input(v-model="attendance.additional")

                md-checkbox(v-model="attendance.paidByCard")
                    md-icon credit_card
                    | Card payment

        md-card-actions(v-show="shared.selectedMember")
            md-progress-spinner(v-show="loading", md-mode="indeterminate", :md-diameter=24, :md-stroke=3)
            md-button(v-bind:disabled="loading", type="submit") Submit
</template>

<script>
import $http from '../http';
import state from '../state'

export default {
    name: 'AttendanceForm',
    data () {
        return {
            shared: state,
            loading: false,
            error: "",
            attendance: {
                primary: false,
                secondary: 0,
                additional: "",
                paidByCard: false,
            }
        }
    },
    computed: {
        member () {
            return this.shared.members.find(m => m.id == this.shared.selectedMember)
        },
        selectedMember() {
            return this.shared.selectedMember;
        }
    },
    watch: {
        selectedMember(newMember) {
            let att = this.shared.attendance.find(a => a.memberId == newMember && a.eventId == this.$route.params.id);

            // reset data to default before trying to set stuff
            Object.assign(this.$data, this.$options.data())

            if (!att) {
                this.attendance = {
                    primary: false,
                    secondary: 0,
                    additional: "",
                    paidByCard: false,
                }
            }
            else {
                this.attendance = {
                    primary: att.primary,
                    secondary: att.secondary,
                    additional: att.additional,
                    paidByCard: att.paidByCard,
                }
            }

            let checkbox = document.getElementById("food-checkbox");
            checkbox.focus();
        }
    },
    methods: {
        async changeAttendance() {

            this.loading = true

            let resp;
            try {
                if (!this.attendance.primary && !this.attendance.secondary && !this.attendance.additional) {
                    resp = await $http.deleteAttendance(this.$route.params.id, this.shared.selectedMember);
                }
                else {
                    resp = await $http.addAttendance(this.$route.params.id, this.shared.selectedMember, this.attendance);
                }
            } catch (ex) {
                this.error = ex;
                return;
            } finally {
                this.loading = false;
            }

            if (resp != null) {
                state.selectMember(null);
                this.error = null;
                let input = document.getElementById("search-member");
                input.select();
                input.focus();
            }
            else
                this.error = "Something went wrong"

        },
        incrementDrink() {
            this.attendance.secondary++;
        },
    }
}
</script>


<template lang="pug">
md-card
	form(@submit.prevent="submitForm")
		md-card-header
			h1.md-title New Attendee

		md-card-content
			md-field
				label First Name
				md-input#new-att-fname(v-model="firstName", required)

			md-field
				label Last Name
				md-input(v-model="lastName", required)

			md-field
				label USU membership number
				md-input(v-model.number="access", type="number")

		md-card-actions
			md-progress-spinner(v-show="loading", md-mode="indeterminate", :md-diameter=24, :md-stroke=3)
			md-button(type="submit") Submit

</template>

<script>
import http from '../http';
import state from '../state';

export default {
	name: 'NewAttendeeForm',
	data () {
		return {
			firstName: null,
			lastName: null,
			access: null,
			shared: state,
			loading: false,
		}
	},
	methods: {
		async submitForm() {
			this.loading = true;
			let id;
			try {
				id = await http.addUnregMember({
					firstName: this.firstName,
					lastName: this.lastName,
					access: this.access || undefined,
				});
			} catch (ex) {
				return;
			} finally {
				this.loading = false;
			}

			if (id != null) {
				this.shared.selectMember(id);
			}

			this.firstName = null;
			this.lastName = null;
			this.access = null;
		},
		setAID(aid) {
			this.access = aid;
			let input = document.getElementById("new-att-fname");
			input.focus();
		},
	}
}
</script>

<template lang="pug">
md-card
	md-card-header
		h1.md-title Report
		h2.md-subheading {{event.title}} - {{eventDate}}
	
	md-card-content
		md-list#report-list.md-double-line
			md-list-item(v-for="a of attendance", :key="a.id", @click="shared.selectedMember = a.member.id")
				div.md-list-item-text
					span {{a.member.firstName}} {{a.member.lastName}}
					span(v-if="a.additional") {{a.additional}}
				div
					md-icon(v-if="a.member.access && !a.member.email") person_outline
					md-icon(v-if="!a.member.access") attach_money
					md-icon(v-if="a.secondary") local_drink
					md-icon(v-if="a.primary") local_pizza
	
		md-field
			label Access
			md-input(v-model.number="accessPrice", type="number")

		md-field
			label Non-Access
			md-input(v-model.number="nonAccessPrice", type="number")

		md-field
			label Drink
			md-input(v-model.number="drinkPrice", type="number")

	md-card-actions
		div.summary
			md-icon.people-icon people
			label {{attendance.length}}

		div.summary
			md-icon.people-icon attach_money
			label {{revenue}}

		md-button.md-icon-button(@click.stop="downloadAttendees")
			md-icon file_download


</template>

<script>
import state from '../state'
import moment from 'moment'
export default {
	name: 'event-report',
	data () {
		return {
			accessPrice: 2,
			nonAccessPrice: 6,
			drinkPrice: 1,
			shared: state
		}
	},
	computed: {
		event () {
			return this.shared.events.find(e => e.id == this.$route.params.id)
		},
		eventAttendance () {
			return this.shared.attendance.filter(a => a.event.id == this.$route.params.id)
		},
		attendance() {
			return this.eventAttendance.map(a => Object.assign({}, a, {
				member: this.shared.members.find(m => m.id == a.member.id),
			}));
		},
		revenue() {
			let result = 0;
			for (let att of this.attendance) {
				if (att.primary) 
					result += att.member.access ? this.accessPrice : this.nonAccessPrice;
				
				if (att.secondary)
					result += this.drinkPrice;

			}
			return result;
		},
		eventDate() {
			return moment(this.event.time).format("Do MMM YYYY");
		},
	},
	methods: {
		downloadAttendees() {
			let output = ["firstName,lastName,access,bbq,drink,additional\n"];
			/*
			let numAccess = 0;
			let numAccessFood = 0;
			let numNonAccessFood = 0;
			let numDrinks = 0;
			*/
			for (let att of this.attendance.slice().reverse()) {
				let m = att.member;
				output.push([m.firstName, m.lastName, m.access, att.primary, att.secondary, att.additional].join(','));
				output.push('\n');
				/*
				if (m.access) {
					numAccess += 1;
					if (att.primary) numAccessFood += 1;
				} else if (att.primary) {
					numNonAccessFood += 1;
				}
				if (att.secondary) numDrinks += 1;
				*/
			}

			output.push('\n\nTotal attendees:,' + this.eventAttendance.length);
			output.push('\nTotal revenue:,' + this.revenue);

			output.push('\nAccess attendees:,' + this.attendance.filter(a => a.member.access).length);
			output.push('\nNon-access attendees:,' + this.attendance.filter(a => !a.member.access).length);

			output.push('\nAccess foods:,' + this.attendance.filter(a => a.primary && !a.member.access).length);
			output.push('\nNon-Access foods:,' + this.attendance.filter(a => a.primary && a.member.access).length);

			output.push('\nDrinks:,' + this.eventAttendance.filter(a => a.secondary).length + '\n');

			let outputBlob = new Blob(output, {type:'text/csv'});

			let downloadLink = document.createElement('a');
			document.body.appendChild(downloadLink);
			downloadLink.style = 'display: none;';
			let dataUrl = window.URL.createObjectURL(outputBlob);
			downloadLink.href = dataUrl;
			downloadLink.download = this.event.title+'-attendance.csv';
			downloadLink.click();
			downloadLink.remove();

		}
	}
}
</script>

<style lang="sass">

.summary
	margin-right: auto
	margin-left: 8px

.people-icon
	margin-right: 3px

#report-list
	max-height: 60vh
	overflow-y: auto

.error
	color: #ff1744!important

</style>

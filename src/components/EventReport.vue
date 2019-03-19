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
					md-icon(v-if="a.member.access && !a.member.registered") person_outline
					md-icon(v-if="!a.member.access") money_off
					md-icon(v-if="a.secondary") local_drink
					md-icon(v-if="a.primary") local_pizza

		md-field
			md-icon attach_money
			label Food
			md-input(v-model.number="price", type="number")

		md-field
			md-icon local_drink
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
			price: 2,
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
					result += this.price;

				if (att.secondary)
					result += att.secondary * this.drinkPrice;

			}
			return result;
		},
		eventDate() {
			return moment(this.event.time).format("Do MMM YYYY");
		},
	},
	methods: {
		downloadAttendees() {
			let output = ["AID,First Name,Last Name,food,drink,additional\n"];
			const numAccess = this.attendance.filter(a => a.primary && a.member.access).length;
			const numNonAccess = this.attendance.filter(a => a.primary && !a.member.access).length;
			const numDrinks = this.attendance.reduce((acc, a) => acc + a.secondary, 0);

			for (let att of this.attendance.slice().reverse()) {
				let m = att.member;
				output.push([m.access, m.firstName, m.lastName, att.primary, att.secondary, att.additional].join(','));
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

			const accessRevenue = numAccess * this.price;
			const nonAccessRevenue = numNonAccess * this.price;
			const drinksRevenue = numDrinks * this.drinkPrice;

			output.push('\n,Amount,Price,Total');
			output.push(['\nUSU', numAccess, this.price, accessRevenue].join(','));
			output.push(['\nNon-USU', numNonAccess, "", nonAccessRevenue].join(','));
			output.push(['\nDrinks', numDrinks, this.drinkPrice, drinksRevenue].join(','));
			output.push(['\nTOTAL', numAccess + numNonAccess, '', this.revenue])

			const outputBlob = new Blob(output, {type:'text/csv'});
			const dataUrl = window.URL.createObjectURL(outputBlob);

			let downloadLink = document.createElement('a');
			downloadLink.style.display = 'none';
			downloadLink.href = dataUrl;
			downloadLink.download = this.event.title+'-attendance.csv';
			document.body.appendChild(downloadLink);
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

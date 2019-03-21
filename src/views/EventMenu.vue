<template lang="pug">
div#event-menu
	md-button#new-event-btn.md-fab.md-accent.md-raised(@click="shared.dialogs.newEvent = true")
			md-icon add
			md-tooltip(direction="bottom") Add Event
	add-event-dialog(ref="add-event-dialog")
	event-list

</template>

<script>
import EventList from '../components/EventList.vue'
import state from '../state'

export default {
	name: "EventMenu",
	components: {
		'event-list': EventList,
		'add-event-dialog': function(resolve) {
			require(['../components/AddEventDialog.vue'], resolve)
		}
	},
	data () {
		return {
			shared: state
		}
	}


}

</script>

<style lang="sass">
#new-event-btn
	position: absolute
	right: 16px
	top: 29px
	z-index: 99

</style>

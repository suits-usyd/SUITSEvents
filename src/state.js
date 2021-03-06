let state = {
    members: [],
    events: [],
	attendance: [],
	apiURL: 'https://api.suits.org.au',
	token: sessionStorage.getItem('token'),
	dialogs: {
		newEvent: false,
		deleteEvent: {
			isOpen: false,
      selectedEvent: null,
      open(eventId) {
        this.isOpen = true;
        this.selectedEvent = eventId;
      },
      close() {
        this.isOpen = false;
      },
		},
		summary: false,
	},
	selectedMember: null,
	selectMember(memberId) {
		this.selectedMember = memberId;
	},
};

export function updateState(data) {
  switch(data.resource) {
		case "Member":
			updateResource("members", data.action, data.data);
			break;

		case "Event":
			updateResource("events", data.action, data.data);
			break;

		case "Attendance":
			updateResource("attendance", data.action, data.data);
			break;
	}
}

function updateResource(resource, action, data) {
  console.log(resource, action, data);
  let i;
  switch (action) {
		case "INSERT":
			state[resource] = [data, ...state[resource]]
			break;

		case "UPDATE":
			i = state[resource].findIndex(r => r.id == data.id)
			state[resource].splice(i, 1, data)
			break;

		case "DELETE":
			i = state[resource].findIndex(r => r.id == data.id)
			state[resource].splice(i, 1)
			break;
	}
	if (resource == "events") {
		state[resource].sort((a,b) => b.time - a.time)
	}
}

export default state;

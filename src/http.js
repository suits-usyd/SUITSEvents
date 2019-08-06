import axios from 'axios';
import router from './routes';
import state from './state'

let $http = axios.create({
    baseURL: state.apiURL
});

export function addAuthHeader() {
    $http.defaults.headers.common['Authorization'] = "Bearer " + state.token;
}

let response = async function(req) {
    //given an $http.<action>(blah) do all the boilerplate
    try {
        return (await req);
    }
    catch (e) {
        console.error(e);
        if (e.response && e.response.status == 401) {
            // invalid token
            state.token = null;
            router.push("/login");
            return;
        }
        throw e;
    }
}

if (state.token)
    addAuthHeader();

export default {
    async auth(data) {
        let resp = await $http.post('/token', data);
        return resp;
    },
    async addEvent(data) {
        return await response($http.post('/events', data));
    },
    async getEventList() {
        let resp = await response($http.get('/events'));
        if (resp == null)
            return null;
        return resp.data
    },
    async getEvent(id) {
        let resp = await response($http.get(`/events/${id}`));
        if (resp == null)
            return null;
        return resp.data.sort((a,b) => b.time - a.time);
    },
    async getMembers() {
        let resp = await response($http.get('/members'));
        if (resp == null)
            return null;
        return resp.data.reverse();
    },
    async getEventAttendance(eventId) {
        /* attendance is normalised by providing a memberId instead of member data
            Use the keyed members object to provide references to member data. */

        let params = new URLSearchParams();
        params.append('event', eventId);
        let resp = await response($http.get('/attendance?'+params.toString()));
        if (resp == null)
            return null;
        return resp.data.reverse();
    },
    async addAttendance(eventId, memberId, data) {
        let att = state.attendance.find(a => a.memberId == memberId && a.eventId == eventId);
        if (!att) {
            let params = new URLSearchParams();
            params.append('event', eventId);
            params.append('member', memberId);
            return await response($http.post('/attendance?'+params.toString(), data));
        }
        else
            return await response($http.put(att.ref, data))

    },

    async addUnregMember(data) {
        let resp = await response($http.post('/members', data));
        if (resp == null)
            return null
        return resp.data.id;
    },

    async deleteAttendance(eventId, memId) {
        let att = state.attendance.find(a => a.memberId == memId && a.eventId == eventId);
        if (!att)
            return 1; // hacky. the only check is != null so this will be fine
        let resp = await response($http.delete(att.ref));
        return resp;
    },

    async deleteEvent(eventId) {
        let resp = await response($http.delete('/events/'+eventId));
        return resp;
    }

};


import { TypeKeys, Action } from './types';
import ActionStatus from '../ActionStatus';
import { Event } from 'services/models';

const startGetEvents = () :Action => ({
    type: TypeKeys.GET_EVENTS,
    status: ActionStatus.START,
    events: [],
    error: ""
})

const setEvents = (events: Event[]) :Action => ({
    type: TypeKeys.GET_EVENTS,
    status: ActionStatus.SUCCESS,
    events,
    error: ""
})
 
const setError = (error: string) :Action => ({
    type: TypeKeys.GET_EVENTS,
    status: ActionStatus.FAIL,
    events: [],
    error
})

export default {
    startGetEvents,
    setEvents,
    setError
}

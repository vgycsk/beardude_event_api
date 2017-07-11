/* global fetch */

// types
const ADD_GROUP = 'event/ADD_GROUP'
const GET_GROUP = 'event/GET_GROUP'
const CANCEL_ADD_GROUP = 'event/CANCEL_ADD_GROUP'
const DELETE_GROUP = 'event/DELETE_GROUP'

const ADD_RACE = 'event/ADD_RACE'
const CANCEL_ADD_RACE = 'event/CANCEL_ADD_RACE'
const DELETE_RACE = 'event/DELETE_RACE'

const GET_EVENTS = 'event/GET_EVENTS'
const GET_SELECTED_EVENT = 'event/GET_SELECTED_EVENT'
const SUBMIT_EVENT = 'event/SUBMIT_EVENT'
const SUBMIT_GROUP = 'event/SUBMIT_GROUP'
const SUBMIT_RACE = 'event/SUBMIT_RACE'
const EVENT_ERR = 'event/EVENT_ERR'

const returnSubmitObj = (obj) => {
  return {
    method: 'post',
    credentials: 'same-origin',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  }
}
// actions
export const actionCreators = {
  addGroup: (successCallback) => (dispatch) => {
    dispatch({type: ADD_GROUP})
    return successCallback()
  },
  addRace: (groupIndex, successCallback) => (dispatch) => {
    dispatch({type: ADD_RACE, payload: {groupIndex: groupIndex}})
    return successCallback()
  },
  cancelAddGroup: (successCallback) => (dispatch) => {
    dispatch({type: CANCEL_ADD_GROUP})
    return successCallback()
  },
  cancelAddRace: (groupIndex, successCallback) => (dispatch) => {
    dispatch({type: CANCEL_ADD_RACE, payload: {groupIndex: groupIndex}})
    return successCallback()
  },
  deleteGroup: (groupIndex, id, successCallback) => async (dispatch) => {
    try {
      const response = await fetch('/api/group/delete/' + id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: DELETE_GROUP, payload: {groupIndex: groupIndex}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: e}})
    }
  },
  deleteRace: (groupIndex, raceIndex, id, successCallback) => async (dispatch) => {
    try {
      const response = await fetch('/api/race/delete/' + id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: DELETE_RACE, payload: {groupIndex: groupIndex, raceIndex: raceIndex}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: e}})
    }
  },
  getEvents: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/api/event/getEvents', {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: GET_EVENTS, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '取得活動內容失敗'}})
    }
  },
  getGroup: (id, index, successCallback) => async (dispatch) => {
    try {
      const response = await fetch('/api/group/mgmtInfo/' + id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: GET_GROUP, payload: {...res, index: index}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: e}})
    }
  },
  getSelectedEvent: (id) => async (dispatch, getState) => {
    if (id === 'new') {
      return dispatch({type: GET_SELECTED_EVENT, payload: { event: { groups: [] } }})
    }
    try {
      const response = await fetch('/api/event/mgmtInfo/' + id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: GET_SELECTED_EVENT, payload: {...res}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '取得活動內容失敗'}})
    }
  },
  submitEvent: (obj, successCallback) => async (dispatch) => {
    try {
      const response = await fetch((obj.id) ? '/api/event/update' : '/api/event/create', returnSubmitObj(obj))
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: SUBMIT_EVENT, payload: {...res}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: e}})
    }
  },
  submitGroup: (obj, index, successCallback) => async (dispatch) => {
    try {
      const response = await fetch((obj.id) ? '/api/group/update' : '/api/group/create', returnSubmitObj(obj))
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: SUBMIT_GROUP, payload: {...res, index: index}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: e}})
    }
  },
  submitRace: (obj, groupIndex, raceIndex, successCallback) => async (dispatch) => {
    try {
      const response = await fetch((obj.id) ? '/api/race/update' : '/api/race/create', returnSubmitObj(obj))
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: SUBMIT_RACE, payload: {...res, groupIndex: groupIndex, raceIndex: raceIndex}})
        return successCallback()
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  selectedEvent: undefined,
  events: []
}
export const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    case ADD_GROUP: {
      let nextState = {...state}
      nextState.selectedEvent.groups.push({})
      return nextState
    }
    case ADD_RACE: {
      let nextState = {...state}
      nextState.selectedEvent.groups[payload.groupIndex].races.push({})
      return nextState
    }
    case CANCEL_ADD_GROUP: {
      let nextState = {...state}
      if (!nextState.selectedEvent.groups[nextState.selectedEvent.groups.length - 1].id) {
        nextState.selectedEvent.groups.pop()
      }
      return nextState
    }
    case CANCEL_ADD_RACE: {
      let nextState = {...state}
      const group = nextState.selectedEvent.groups[payload.groupIndex]
      if (!group.races[group.races.length - 1].id) {
        group.races.pop()
      }
      return nextState
    }
    case DELETE_GROUP: {
      let nextState = {...state}
      nextState.selectedEvent.groups.splice(payload.groupIndex, 1)
      return nextState
    }
    case DELETE_RACE: {
      let nextState = {...state}
      nextState.selectedEvent.groups[payload.groupIndex].races.splice(payload.raceIndex, 1)
      return nextState
    }
    case GET_EVENTS: {
      return {...state, events: payload.events}
    }
    case GET_GROUP: {
      let nextState = {...state}
      nextState.selectedEvent.groups[payload.index] = payload.group
      return nextState
    }
    case GET_SELECTED_EVENT: {
      return {...state, selectedEvent: payload.event}
    }
    case SUBMIT_EVENT: {
      return {...state, selectedEvent: {...payload.event, upToDate: true}}
    }
    case SUBMIT_GROUP: {
      let nextState = {...state}
      nextState.selectedEvent.groups[payload.index] = payload.group
      return nextState
    }
    case SUBMIT_RACE: {
      let nextState = {...state}
      console.log('nextState.selectedEvent.groups[payload.groupIndex]: ', nextState.selectedEvent.groups[payload.groupIndex])
      nextState.selectedEvent.groups[payload.groupIndex].races[payload.raceIndex] = payload.race
      console.log('nextState.selectedEvent.groups[payload.groupIndex]: after', nextState.selectedEvent.groups[payload.groupIndex])
      return nextState
    }
    case EVENT_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer

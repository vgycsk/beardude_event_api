// types
const ADD_GROUP = 'event/ADD_GROUP'
const CANCEL_ADD_GROUP = 'event/CANCEL_ADD_GROUP'
const GET_EVENTS = 'event/GET_EVENTS'
const GET_SELECTED_EVENT = 'event/GET_SELECTED_EVENT'
const SUBMIT_EVENT = 'event/SUBMIT_EVENT'
const SUBMIT_GROUP = 'event/SUBMIT_GROUP'
const EVENT_ERR = 'event/EVENT_ERR'

const returnSubmitObj = (obj) => { return {
  method: 'post',
  credentials: 'same-origin',
  headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
  body: JSON.stringify(obj)
}}
// actions
export const actionCreators = {
  addGroup: (successCallback) => (dispatch) => {
    dispatch({type: ADD_GROUP})
    return successCallback()
  },
  cancelAddGroup: (successCallback) => (dispatch) => {
    dispatch({type: CANCEL_ADD_GROUP})
    return successCallback()
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
  getSelectedEvent: (id) => async (dispatch, getState) => {
    const store = getState().event.selectedEvent

    if (id === 'new') {
        return dispatch({type: GET_SELECTED_EVENT, payload: { event: { groups: [] } }})
    }
    try {
      const response = await fetch('/api/event/info/' + id, {credentials: 'same-origin'})
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
  }
}

// reducers
const initialState = {
  selectedEvent: undefined,
  events: []
}
export const reducer = (state = initialState, action) => {
  const {type, payload, error} = action

  switch (type) {
    case ADD_GROUP: {
      let nextState = {...state}
      nextState.selectedEvent.groups.push({})
      return nextState
    }
    case CANCEL_ADD_GROUP: {
      let nextState = {...state}
      if (!nextState.selectedEvent.groups[nextState.selectedEvent.groups.length -1].id) {
        nextState.selectedEvent.groups.pop()
      }
      return nextState
    }
    case GET_EVENTS: {
      return {...state, events: payload.events}
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
    case EVENT_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer

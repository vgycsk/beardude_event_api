// types
const GET_EVENTS = 'event/GET_EVENTS'
const GET_SELECTED_EVENT = 'event/GET_SELECTED_EVENT'
const SUBMIT_EVENT = 'event/SUBMIT'

const EVENT_ERR = 'event/EVENT_ERR'

// actions
export const actionCreators = {
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
  submit: (obj, successCallback) => async (dispatch) => {
    try {
      const response = await fetch((obj.id) ? '/api/event/update' : '/api/event/create', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      })
      const res = await response.json()
      if (response.status === 200) {
        dispatch({type: SUBMIT_EVENT, payload: {...res}})
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
    case GET_EVENTS: {
      return {...state, events: payload.events}
    }
    case GET_SELECTED_EVENT: {
      return {...state, selectedEvent: payload.event}
    }
    case SUBMIT_EVENT: {
      return {...state, selectedEvent: {...payload.event, upToDate: true}}
    }
    case EVENT_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer

import { browserHistory } from 'react-router'

// types
const GET_EVENTS = 'event/GET_EVENTS'
const EVENT_ERR = 'event/EVENT_ERR'

// actions
export const actionCreators = {
  getEvents: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/event/getEvents', {credentials: 'same-origin'})
      const res = await response.json()

      dispatch({type: GET_EVENTS, payload: res})
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '取得活動內容失敗'}})
    }
  }
}

// reducers
const initialState = {
  selectedEvent: {},
  events: []
}
export const reducer = (state = initialState, action) => {
  let nextState = {...state}

  switch (action.type) {
    case GET_EVENTS: {
      nextState.events = action.payload.events
    }
    case EVENT_ERR: {
      nextState.error = action.payload.error
    }
  }
  return nextState
}

export default reducer

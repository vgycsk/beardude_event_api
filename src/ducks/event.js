// types
const GET_EVENTS = 'event/GET_EVENTS'
const GET_SELECTED_EVENT = 'event/GET_SELECTED_EVENT'
const EVENT_ERR = 'event/EVENT_ERR'

// actions
export const actionCreators = {
  getEvents: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/event/getEvents', {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: GET_EVENTS, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: EVENT_ERR, payload: {error: '取得活動內容失敗'}})
    }
  },
  getSelectedEvent: (id) => {
    console.log(id)
    return id === 'new'
    ? {
      type: GET_SELECTED_EVENT,
      payload: {
        selectedEvent: {
          title: 'new event',
          regDate: '2017-6-30',
          startDate: '2017-6-30',
          endDate: '2017-6-30',
          group: [
            {
              id: 'event-group-random',
              title: '公路車男子',
              maxCount: 180,
              count: 160,
              subGroup: [
                {
                  id: '12321434',
                  title: '資格賽-1',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '資格賽-2',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '排位賽',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '決賽',
                  maxCount: 80,
                  count: 60
                }
              ]
            },
            {
              id: 'event-group-random',
              title: '公路車女子',
              maxCount: 180,
              count: 160,
              subGroup: [
                {
                  id: '12321434',
                  title: '資格賽-1',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '資格賽-2',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '排位賽',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '決賽',
                  maxCount: 80,
                  count: 60
                }
              ]
            },
            {
              id: 'event-group-random',
              title: '場地車',
              maxCount: 180,
              count: 160,
              subGroup: [
                {
                  id: '12321434',
                  title: '資格賽-1',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '資格賽-2',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '排位賽',
                  maxCount: 80,
                  count: 60
                },
                {
                  id: '12321434',
                  title: '決賽',
                  maxCount: 80,
                  count: 60
                }
              ]
            }
          ]
        }
      }
    }
    : {}
  }

}

// reducers
const initialState = {
  selectedEvent: {},
  events: []
}
export const reducer = (state = initialState, action) => {
  const {type, payload, error} = action

  switch (type) {
    case GET_EVENTS: {
      return {...state, events: payload.events}
    }
    case GET_SELECTED_EVENT: {
      return {...state, selectedEvent: payload.selectedEvent, error: payload.error}
    }
    case EVENT_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer

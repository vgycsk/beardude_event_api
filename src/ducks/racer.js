// types
const GET_RACERS = 'racer/GET_RACERS'
const SELECT_RACERS = 'racer/SELECT_RACERS'
const RACER_ERR = 'racer/RACER_ERR'

// actions
export const actionCreators = {
  getRacers: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/racer/getRacers', {credentials: 'same-origin'})
      const res = await response.json()

      if (response.status === 200) {
        return dispatch({type: GET_RACERS, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: RACER_ERR, payload: {error: e}})
    }
  },
  selectRacer: (id) => async (dispatch, getState) => {
    let racers = getState().racer.racers
    const racerIndex = racers.findIndex(racer => racer.id === id)

    if (racers[racerIndex].upToDate) {
      return dispatch({type: SELECT_RACERS, payload: {selectedRacerIndex: racerIndex}})
    }
    try {
      const response = await fetch('/racer/mgmtInfo/' + id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SELECT_RACERS, payload: {...res, selectedRacerIndex: racerIndex}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: RACER_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  selectedRacerIndex: undefined,
  updatedRacer: undefined, // keep new and modified racer info
  racers: []
}
const reducer = (state = initialState, action) => {
  const {type, payload, error} = action

  switch (type) {
    case GET_RACERS: {
      return {...state, racers: payload.racers}
    }
    case SELECT_RACERS: {
      let nextState = {...state, selectedRacerIndex: payload.selectedRacerIndex}
      if (payload.racer) {
        nextState.racers[payload.selectedRacerIndex] = {...payload.racer, upToDate: true}
      }
      delete nextState.updatedRacer
      return nextState
    }
    case RACER_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer

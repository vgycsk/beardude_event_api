// types
const GET_RACERS = 'racer/GET_RACERS'
const EDIT_RACER = 'racer/EDIT_RACER'
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
  input: (field, value) => (dispatch) => {
    dispatch({type: EDIT_RACER, payload: {field, value}})  
  },
  selectRacer: (id) => async (dispatch, getState) => {
    let racerStore = getState().racer
    const racerIndex = (id === -1) ? undefined : racerStore.racers.findIndex(racer => racer.id === id)

    if (racerStore.selectedRacerIndex === racerIndex) { return }
    if (id === -1 || racerStore.racers[racerIndex].upToDate) {
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
  racerInEdit: undefined, // keep new and modified racer info
  racers: []
}
const reducer = (state = initialState, action) => {
  const {type, payload, error} = action

  switch (type) {
    case EDIT_RACER: {
      let nextState = {...state}
      nextState.racerInEdit[payload.field] = payload.value
      return nextState
    }
    case GET_RACERS: {
      return {...state, racers: payload.racers}
    }
    case SELECT_RACERS: {
      let nextState = {...state, selectedRacerIndex: payload.selectedRacerIndex, racerInEdit: undefined}
      if (payload.racer) {
        nextState.racers[payload.selectedRacerIndex] = {...payload.racer, upToDate: true}
      }
      return nextState
    }
    case RACER_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer

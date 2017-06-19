// types
const CREATE_RACER = 'racer/CREATE_RACER'
const GET_RACERS = 'racer/GET_RACERS'
const EDIT_RACER = 'racer/EDIT_RACER'
const SELECT_RACERS = 'racer/SELECT_RACERS'
const RACER_ERR = 'racer/RACER_ERR'
const SUBMIT_RACER = 'racer/SUBMIT_RACER'

// actions
export const actionCreators = {
  create: () => (dispatch) => {
    dispatch({type: CREATE_RACER})
  },
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
  selectRacer: (index) => async (dispatch, getState) => {
    let racerStore = getState().racer

    if (racerStore.racers[index].upToDate) {
      return dispatch({type: SELECT_RACERS, payload: {selectedRacerIndex: index}})
    }
    try {
      const response = await fetch('/racer/mgmtInfo/' + racerStore.racers[index].id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SELECT_RACERS, payload: {...res, selectedRacerIndex: index}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: RACER_ERR, payload: {error: e}})
    }
  },
  submit: () => async (dispatch, getState) => {
    const store = getState().racer
    const racerId = store.racers[store.selectedRacerIndex].id
    try {
      const response = await fetch((racerId) ? '/racer/update' : '/racer/create', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...store.racerInEdit, id: racerId})
      })
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SUBMIT_RACER, payload: {...res, selectedRacerIndex: store.selectedRacerIndex}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: RACER_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  selectedRacerIndex: -1,
  racerInEdit: undefined, // keep new and modified racer info
  racers: []
}
const reducer = (state = initialState, action) => {
  const {type, payload, error} = action

  switch (type) {
    case CREATE_RACER: {
      let nextState = {...state}
      nextState.selectedRacerIndex = nextState.racers.length
      nextState.racers.push({})
      return nextState
    }
    case EDIT_RACER: {
      let nextState = {...state, racerInEdit: state.racerInEdit || {}}
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
    case SUBMIT_RACER: {
      let nextState = {...state, racerInEdit: undefined}
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

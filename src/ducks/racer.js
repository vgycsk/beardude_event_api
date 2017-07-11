/* global fetch */

// types
const CANCEL_EDIT = 'racer/CANCEL_EDIT'
const CREATE_RACER = 'racer/CREATE_RACER'
const GET_RACERS = 'racer/GET_RACERS'
const EDIT_RACER = 'racer/EDIT_RACER'
const SELECT_RACERS = 'racer/SELECT_RACERS'
const RACER_ERR = 'racer/RACER_ERR'
const SUBMIT_RACER = 'racer/SUBMIT_RACER'

// actions
export const actionCreators = {
  cancelEdit: () => (dispatch) => {
    dispatch({type: CANCEL_EDIT})
  },
  create: () => (dispatch) => {
    dispatch({type: CREATE_RACER})
  },
  getRacers: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/api/racer/getRacers', {credentials: 'same-origin'})
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
      return dispatch({type: SELECT_RACERS, payload: {selectedIndex: index}})
    }
    try {
      const response = await fetch('/api/racer/mgmtInfo/' + racerStore.racers[index].id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SELECT_RACERS, payload: {...res, selectedIndex: index}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: RACER_ERR, payload: {error: e}})
    }
  },
  submit: () => async (dispatch, getState) => {
    const store = getState().racer
    const racerId = store.racers[store.selectedIndex].id
    try {
      const response = await fetch((racerId) ? '/api/racer/update' : '/api/racer/create', {
        method: 'post',
        credentials: 'same-origin',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...store.inEdit, id: racerId })
      })
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SUBMIT_RACER, payload: {...res, selectedIndex: store.selectedIndex}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: RACER_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  selectedIndex: -1,
  inEdit: undefined, // keep new and modified racer info
  racers: undefined
}
const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    case CANCEL_EDIT: {
      let nextState = {...state, inEdit: undefined}
      if (!nextState.racers[nextState.racers.length - 1].id) {
        nextState.selectedIndex = -1
        nextState.racers.pop()
      }
      return nextState
    }
    case CREATE_RACER: {
      let nextState = {...state, selectedIndex: state.racers.length}
      nextState.racers.push({})
      return nextState
    }
    case EDIT_RACER: {
      let nextState = {...state, inEdit: state.inEdit || {}}
      nextState.inEdit[payload.field] = payload.value
      return nextState
    }
    case GET_RACERS: {
      return {...state, racers: payload.racers}
    }
    case SELECT_RACERS: {
      let nextState = {...state, selectedIndex: payload.selectedIndex, inEdit: undefined}
      if (payload.racer) {
        nextState.racers[payload.selectedIndex] = {...payload.racer, upToDate: true}
      }
      return nextState
    }
    case SUBMIT_RACER: {
      let nextState = {...state, inEdit: undefined}
      if (payload.racer) {
        nextState.racers[payload.selectedIndex] = {...payload.racer, upToDate: true}
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

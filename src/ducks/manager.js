/* global fetch */

// types
const CANCEL_EDIT = 'manager/CANCEL_EDIT'
const CREATE_MANAGER = 'manager/CREATE_MANAGER'
const GET_MANAGERS = 'manager/GET_MANAGERS'
const EDIT_MANAGER = 'manager/EDIT_MANAGER'
const SELECT_MANAGER = 'manager/SELECT_MANAGERS'
const MANAGER_ERR = 'manager/MANAGER_ERR'
const SUBMIT_MANAGER = 'manager/SUBMIT_MANAGER'

// actions
export const actionCreators = {
  cancelEdit: () => (dispatch) => {
    dispatch({type: CANCEL_EDIT})
  },
  create: () => (dispatch) => {
    dispatch({type: CREATE_MANAGER})
  },
  getManagers: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/api/manager/getManagers', {credentials: 'same-origin'})
      const res = await response.json()

      if (response.status === 200) {
        return dispatch({type: GET_MANAGERS, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: MANAGER_ERR, payload: {error: e}})
    }
  },
  input: (field, value) => (dispatch) => {
    dispatch({type: EDIT_MANAGER, payload: {field, value}})
  },
  selectManager: (index) => async (dispatch, getState) => {
    let managerStore = getState().manager

    if (managerStore.managers[index].upToDate) {
      return dispatch({type: SELECT_MANAGER, payload: {selectedIndex: index}})
    }
    try {
      const response = await fetch('/api/manager/mgmtInfo/' + managerStore.managers[index].id, {credentials: 'same-origin'})
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SELECT_MANAGER, payload: {...res, selectedIndex: index}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: MANAGER_ERR, payload: {error: e}})
    }
  },
  submit: () => async (dispatch, getState) => {
    const store = getState().manager
    const managerId = store.managers[store.selectedIndex].id
    try {
      const response = await fetch((managerId) ? '/api/manager/update' : '/api/manager/create', {
        method: 'post',
        credentials: 'same-origin',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...store.inEdit, id: managerId })
      })
      const res = await response.json()
      if (response.status === 200) {
        return dispatch({type: SUBMIT_MANAGER, payload: {...res, selectedIndex: store.selectedIndex}})
      }
      throw res.message
    } catch (e) {
      dispatch({type: MANAGER_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  selectedIndex: -1,
  inEdit: undefined, // keep new and modified manager info
  managers: undefined
}
const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    case CANCEL_EDIT: {
      let nextState = {...state, inEdit: undefined}
      if (!nextState.managers[nextState.managers.length - 1].id) {
        nextState.selectedIndex = -1
        nextState.managers.pop()
      }
      return nextState
    }
    case CREATE_MANAGER: {
      let nextState = {...state, selectedIndex: state.managers.length}
      nextState.managers.push({})
      return nextState
    }
    case EDIT_MANAGER: {
      let nextState = {...state, inEdit: state.inEdit || {}}
      nextState.inEdit[payload.field] = payload.value
      return nextState
    }
    case GET_MANAGERS: {
      return {...state, managers: payload.managers}
    }
    case SELECT_MANAGER: {
      let nextState = {...state, selectedIndex: payload.selectedIndex, inEdit: undefined}
      if (payload.manager) {
        nextState.managers[payload.selectedIndex] = {...payload.manager, upToDate: true}
      }
      return nextState
    }
    case SUBMIT_MANAGER: {
      let nextState = {...state, inEdit: undefined}
      if (payload.manager) {
        nextState.managers[payload.selectedIndex] = {...payload.manager, upToDate: true}
      }
      return nextState
    }
    case MANAGER_ERR: {
      return {...state, error: payload.error}
    }
  }
  return state
}

export default reducer

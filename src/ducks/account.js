/* global fetch */

// types
const LOGIN = 'manager/LOGIN'
const LOGOUT = 'manager/LOGOUT'
const ACCOUNT_INFO = 'manager/ACCOUNT_INFO'
const ENTER_CREDENTIALS = 'manager/ENTER_CREDENTIALS'
const LOGIN_ERR = 'manager/LOGIN_ERR'

// actions
export const actionCreators = {
  accountInfo: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/api/manager/account', {credentials: 'same-origin'})
      const res = await response.json()

      if (response.status === 200) {
        return dispatch({type: ACCOUNT_INFO, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: LOGIN_ERR, payload: {error: e}})
    }
  },
  input: (field, value) => (dispatch) => {
    dispatch({type: ENTER_CREDENTIALS, payload: {field, value}})
  },
  login: () => async (dispatch, getState) => {
    let credentials = getState().account.credentials
    let fetchObject = {
      method: 'post',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    delete credentials.error
    fetchObject.body = JSON.stringify(credentials)
    try {
      const response = await fetch('/api/manager/login', fetchObject)
      const res = await response.json()

      if (response.status === 200) {
        return dispatch({type: LOGIN, payload: res})
      }
      throw res.message
    } catch (e) {
      dispatch({type: LOGIN_ERR, payload: {error: e}})
    }
  },
  logout: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/api/manager/logout', {credentials: 'same-origin'})
      const res = await response.json()

      if (response.status === 200) {
        return dispatch({type: LOGOUT})
      }
      throw res.message
    } catch (e) {
      dispatch({type: LOGIN_ERR, payload: {error: e}})
    }
  }
}

// reducers
const initialState = {
  credentials: {
    email: '',
    password: '',
    error: ''
  }
}
const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    case ACCOUNT_INFO: {
      return (payload.manager) ? {...state, manager: payload.manager, isAuthenticated: true} : {...state, isAuthenticated: false}
    }
    case LOGIN: {
      return {...state, manager: payload.manager, isAuthenticated: 1}
    }
    case LOGOUT: {
      return {...state, isAuthenticated: false, manager: undefined}
    }
    case LOGIN_ERR: {
      let nextState = {...state}
      nextState.credentials.error = payload.error
      return nextState
    }
    case ENTER_CREDENTIALS: {
      let nextState = {...state}
      nextState.credentials[payload.field] = payload.value
      return nextState
    }
  }
  return state
}

export default reducer

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
      const response = await fetch('/manager/account', {credentials: 'same-origin'})
      const res = await response.json()
      dispatch({type: ACCOUNT_INFO, payload: res})
    } catch (e) {
      dispatch({type: LOGIN_ERR, payload: {error: '取得帳號狀態失敗'}})
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
      const response = await fetch('/manager/login', fetchObject)
      const res = await response.json()

      dispatch({type: LOGIN, payload: res})
    } catch (e) {
      dispatch({type: LOGIN_ERR, payload: {error: '登入失敗'}})
    }
  },
  logout: () => async (dispatch, getState) => {
    try {
      const response = await fetch('/manager/logout', {credentials: 'same-origin'})
      const manager = await response.json()

      dispatch({type: LOGOUT})
    } catch (e) {
      dispatch({type: LOGIN_ERR, payload: {error: '登出失敗'}})
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
  const {type, payload, error} = action
  let nextState = {...state}

  switch (action.type) {
    case ACCOUNT_INFO: {
      if (payload.manager) {
        nextState.manager = payload.manager
        nextState.isAuthenticated = true
      }
      nextState.isChecked = true
      break
    }
    case LOGIN: {
      nextState.manager = payload.manager
      nextState.isChecked = true
      nextState.isAuthenticated = true
      break
    }
    case LOGOUT: {
      delete nextState.manager
      nextState.isAuthenticated = false
      break
    }
    case LOGIN_ERR: {
      nextState.credentials.error = payload.error
      break
    }
    case ENTER_CREDENTIALS: {
      nextState.credentials[payload.field] = payload.value
      break
    }
  }
  return nextState
}

export default reducer

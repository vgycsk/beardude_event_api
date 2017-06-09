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

      dispatch({type: ACCOUNT_INFO, payload: res.manager})
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

      dispatch({type: LOGIN, payload: res.manager})
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
export const reducer = (state = initialState, action) => {
  let nextState = {...state}

  switch (action.type) {
    case ACCOUNT_INFO: {
        nextState.manager = action.payload.manager
    }
    case LOGIN: {
      if (!state.manager) {
        nextState.manager = action.payload
      }
    }
    case LOGOUT: {
      if (state.manager) {
        delete nextState.manager
      }
    }
    case LOGIN_ERR: {
      nextState.credentials.error = action.payload.error
    }
    case ENTER_CREDENTIALS: {
      nextState.credentials[action.payload.field] = action.payload.value
    }
  }
  return nextState
}

export default reducer

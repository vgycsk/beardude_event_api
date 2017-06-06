
// types
const ME_SET = 'auth/ME_SET'

// actions
const doSetMe = (user) => {
  return {
    type: ME_SET,
    user
  }
}

// belows seems belong to service & API call
const doAuth = () => {
  return (dispatch) => {
        /*
        SoundCloud.connect().then((session) => {
            dispatch(fetchMe(session))
        })
        */
  }
}

const doFetchMe = (session) => {
  return (dispatch) => {
    fetch('//api.soundcloud.com/me?oauth_token=${session.oauth_token}')
        .then((response) => response.json())
        .then((data) => {
          dispatch(setMe(data))
        })
  }
}

// reducers
const initialState = {}
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ME_SET:
      return applySetMe(state, action)

    default:
      return state
  }
}

const applySetMe = (state, action) => {
  const {user} = action

  return (
  {
    ...state,
    user
  }
  )
}

// index
const actionCreators = {
  doAuth
}

const actionTypes = {
  ME_SET
}

export {
    actionCreators,
    actionTypes
}

export default reducer

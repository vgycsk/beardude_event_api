
import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import account from '../ducks/account'
import posts from '../ducks/posts'

export default combineReducers({
  account,
  posts,
  routing: routerReducer
})

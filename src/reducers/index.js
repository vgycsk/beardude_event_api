
import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import auth from '../ducks/auth'
import posts from '../ducks/posts'

export default combineReducers({
  auth,
  posts,
  routing: routerReducer
})

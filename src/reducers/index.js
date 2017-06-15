
import { combineReducers } from 'redux'
import account from '../ducks/account'
import event from '../ducks/event'
import racer from '../ducks/racer'
import posts from '../ducks/posts'

export default combineReducers({
  account,
  event,
  posts,
  racer
})

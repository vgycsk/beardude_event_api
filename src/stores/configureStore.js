import {createStore, applyMiddleware} from 'redux'
import reducers from '../reducers/index'
import {createLogger} from 'redux-logger'

// router
// import { browserHistory } from 'react-router'
// import { routerMiddleware } from 'react-router-redux'
// const router = routerMiddleware(browserHistory)

// fetch api need link to store
import thunk from 'redux-thunk'

// process.env.ENV conflict to sail, remove logger when production
const createStoreWithMiddleware = applyMiddleware(thunk, createLogger())(createStore)

// adding thunk later
const configureStore = (initialState) => {
  return createStoreWithMiddleware(reducers, initialState)
}

export default configureStore

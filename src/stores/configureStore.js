import {createStore, applyMiddleware} from 'redux'
import reducers from '../reducers/index'
import {createLogger} from 'redux-logger'

// router
import { routerMiddleware } from 'react-router-redux'
import createHistory from 'history/createBrowserHistory'

// fetch api need link to store
import thunk from 'redux-thunk'

// Create a history of your choosing (we're using a browser history in this case)
export const history = createHistory()

// Build the middleware for intercepting and dispatching navigation actions
const routerMiddlewareWithHistory = routerMiddleware(history)

// process.env.ENV conflict to sail, remove logger when production
const createStoreWithMiddleware = applyMiddleware(routerMiddlewareWithHistory, thunk, createLogger())(createStore)

// adding thunk later
export const configureStore = (initialState) => {
  return createStoreWithMiddleware(reducers, initialState)
}

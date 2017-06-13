import {createStore, applyMiddleware} from 'redux'
import reducers from '../reducers/index'
import {createLogger} from 'redux-logger'

// fetch api need link to store
import thunk from 'redux-thunk'

const createStoreWithMiddleware = applyMiddleware(thunk, createLogger())(createStore)

// adding thunk later
export const configureStore = (initialState) => {
  return createStoreWithMiddleware(reducers, initialState)
}

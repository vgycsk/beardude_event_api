import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from './stores/configureStore'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import App from './components/App'
import Stream from './components/Stream/'
import Admin from './components/Admin/presenter'

import './style/index.css'

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Route exact path='/console/login' component={App} />
        <Route path='/console/admin' component={Admin} />
        <Route path='/console/stream' component={Stream} />
      </div>
    </Router>
  </Provider>,
  document.getElementById('main-container')
)

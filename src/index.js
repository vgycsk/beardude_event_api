import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from './stores/configureStore'
import { BrowserRouter as Router, Route } from 'react-router-dom'

import Stream from './components/Stream/'
import Admin from './components/Admin/presenter'

import './style/index.css'

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Route exact path='/console' component={Stream} />
        <Route path='/console/admin' component={Admin} />
      </div>
    </Router>
  </Provider>,
  document.getElementById('main-container')
)

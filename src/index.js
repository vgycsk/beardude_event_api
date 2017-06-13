import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from './stores/configureStore'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Stream from './components/Stream/'
import Admin from './components/Admin/presenter'
import Event from './components/Event'
import Account from './components/Account'
import NotFound from './components/NotFound/presenter'

import './style/index.css'

const store = configureStore()

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div>
        <Switch>
          <Route path='/console/login' component={Account} />
          <Route path='/console' component={Event} />
          <Route path='/console/admin' component={Admin} />
          <Route path='/console/stream' component={Stream} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  </Provider>,
  document.getElementById('main-container')
)

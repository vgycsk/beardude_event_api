import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { configureStore } from './stores/configureStore'
import { actionCreators } from './ducks/account'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'

import Stream from './components/Stream/'
import Admin from './components/Admin/presenter'
import EventList from './components/EventList'
import Account from './components/Account'
import Racer from './components/Racer'
import NotFound from './components/NotFound'

import css from './style/index.css'

const store = configureStore()

store.dispatch(actionCreators.accountInfo())

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <div className={css.container}>
        <Switch>
          <Route exact path='/console' component={EventList} />
          <Route path='/console/login' component={Account} />
          <Route path='/console/event/set:id' component={NotFound} />
          <Route path='/console/RFID' component={Admin} />
          <Route path='/console/eventMatch' component={NotFound} />
          <Route path='/console/racer' component={Racer} />
          <Route path='/console/admin' component={Admin} />
          <Route path='/console/stream' component={Stream} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  </Provider>,
  document.getElementById('main-container')
)

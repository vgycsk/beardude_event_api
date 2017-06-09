import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App/presenter'
import Stream from './components/Stream'
import Account from './components/Account'

export default (
  <Route path='/console' component={App}>
    <IndexRoute component={Stream} />
    <Route compoment={Stream} />
    <Route path='login' component={Account} />
  </Route>
)

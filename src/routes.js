import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App'
import Stream from './components/Stream'
import Account from './components/Account'
import NotFound from './components/NotFound/presenter'

export default (
  <Route path='/console' component={App}>
    <IndexRoute component={Stream} />
    <Route path='stream' compoment={Stream} />
    <Route path='login' component={Account} />
    <Route path='*' component={NotFound} />
  </Route>
)

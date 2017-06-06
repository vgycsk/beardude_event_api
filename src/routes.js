import React from 'react'
import { Route, IndexRoute } from 'react-router'
import App from './components/App/presenter'
import Stream from './components/Stream'
import Admin from './components/Admin/presenter'

export default (
  <Route path='/console' component={App}>
    <IndexRoute component={Stream} />
    <Route compoment={Stream} />
    <Route path='/console/admin' compoment={Admin} />
  </Route>
)

import { browserHistory } from 'react-router'
import { actionCreators } from '../../ducks/account'
import React from 'react'
import css from './style.css'

class App extends React.Component {
  bouncer () {
    let toAllow = true
    const pathname = browserHistory.getCurrentLocation().pathname
    const isLoginPage = pathname.match(/^\/console\/login(\/?)$/g)

    if (this.props.account.manager && this.props.account.manager.email) {
        //Already logged in and opening login page, redirect to landing
      if (isLoginPage) {
        browserHistory.replace('/console')
        toAllow = false
      }
    } else if (!isLoginPage) {
        // Not logged in
        browserHistory.replace('/console/login')
        toAllow = false
    }
    return toAllow
  }
  componentDidMount () {
    if (!this.props.account.isChecked) {
      this.props.dispatch(actionCreators.accountInfo())
    }
  }
  componentDidUpdate () {
    if (this.props.account.isChecked) {
      this.bouncer()
    }
  }
  render () {
    const { children } = this.props
    return (<div className={css.app}>{children}</div>)
  }
}
export default App

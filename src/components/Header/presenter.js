import React, { Component } from 'react'
import { actionCreators } from '../../ducks/account'
import css from './style.css'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showAccountMenu: false
    }
    this.handleLogout = this.handleLogout.bind(this)
    this.handleToggleAccountMenu = this.handleToggleAccountMenu.bind(this)
  }
  handleLogout (e) {
    e.preventDefault()
    this.props.dispatch(actionCreators.logout())
  }
  handleToggleAccountMenu () {
    this.setState({showAccountMenu: (this.state.showAccountMenu) ? false : true})
  }
  render () {
    const accountMenu = (this.state.showAccountMenu)
      ? (<ul className={css.accountMenu}>
        <li><a className={css.aMenuItem} href="/console/account">帳號設定</a></li>
        <li><a className={css.aMenuItem} href="" onClick={this.handleLogout}>登出</a></li></ul>)
      : ''
    const accountInfo = (this.props.account.isAuthenticated)
      ? (<div className={css.account}><a className={css.accountLink} onClick={this.handleToggleAccountMenu}>info@beardude.com</a>{accountMenu}</div>)
      : ''
    return (<div className={css.mainHeader}>
        <div className={css.heading}>
            <h1 className={css.bdlogo}>
                <span className={css.logoB}>Beardude</span>
                <span className={css.logoE}>Event</span>
            </h1>
        </div>
      {accountInfo}
    </div>)
  }
}

export default Header
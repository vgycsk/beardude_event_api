import React, { Component } from 'react'
import { NavLink, Redirect } from 'react-router-dom'
import { actionCreators } from '../../ducks/account'
import css from './style.css'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showAccountMenu: false
    }

    if (!this.props.account.isAuthenticated) {
      this.props.dispatch(actionCreators.accountInfo())
    }

    this.handleLogout = this.handleLogout.bind(this)
    this.handleToggleAccountMenu = this.handleToggleAccountMenu.bind(this)
  }
  handleLogout (e) {
    e.preventDefault()
    this.props.dispatch(actionCreators.logout())
  }
  handleToggleAccountMenu () {
    let toggle = !this.state.showAccountMenu
    this.setState({showAccountMenu: toggle})
  }
  renderAccountInfo () {
    const accountMenu = (this.state.showAccountMenu)
      ? <ul className={css.accountMenu}>
        <li><a className={css.aMenuItem} href='/console/account'>帳號設定</a></li>
        <li><a className={css.aMenuItem} href='#' onClick={this.handleLogout}>登出</a></li>
      </ul>
      : ''
    return (<div className={css.account}><a className={css.accountLink} onClick={this.handleToggleAccountMenu}>info@beardude.com</a>{accountMenu}</div>)
  }
  renderNav () {
    return <ul className={css.navContainer}>
      <li><NavLink activeClassName={css.navActive} className={css.nav} to='/console/event'>賽制</NavLink></li>
      <li><NavLink activeClassName={css.navActive} className={css.nav} to='/console/RFID'>RFID 操作</NavLink></li>
      <li><NavLink activeClassName={css.navActive} className={css.nav} to='/console/eventMatch'>賽制操作</NavLink></li>
      <li><NavLink activeClassName={css.navActive} className={css.nav} to='/console/stream'>Stream</NavLink></li>
    </ul>
  }
  render () {
    let accountInfo = ''
    let nav = ''

    if (this.props.account.isAuthenticated) {
      accountInfo = this.renderAccountInfo()
      nav = this.renderNav()
    } else {
      return <Redirect to={{
        pathname: '/console',
        state: { from: this.props.location }
      }} />
    }
    return (<div className={css.mainHeader}>
        <div className={css.heading}>
            <h1 className={css.bdlogo}>
                <span className={css.logoB}>Beardude</span>
                <span className={css.logoE}>Event</span>
            </h1>
        </div>
      {accountInfo}
      {nav}
    </div>)
  }
}

export default Header

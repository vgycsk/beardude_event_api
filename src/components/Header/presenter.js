import React from 'react'
import BaseComponent from '../BaseComponent'
import { NavLink, Redirect } from 'react-router-dom'
import { actionCreators } from '../../ducks/account'
import css from './style.css'

const navs = {
  base: [
    { name: '活動', url: '/console', exact: true },
    { name: '選手', url: '/console/racer' },
    { name: '隊伍', url: '/console/team' },
    { name: '管理員', url: '/console/manager' }
  ],
  event: [
    { name: '賽制', url: '/console/event' },
    { name: 'RFID 操作', url: '/console/RFID' },
    { name: '賽制操作', url: '/console/eventMatch' },
    { name: 'Stream', url: '/console/stream' }
  ]
}

const renderAccountInfo = (that) => (<div className={css.account}>
  <a className={css.accountLink} onClick={that.handleToggleAccountMenu}>{that.props.account.manager.email}</a>
  { that.state.showAccountMenu && <ul className={css.accountMenu}>
    <li><a className={css.aMenuItem} href='/console/account'>帳號設定</a></li>
    <li><a className={css.aMenuItem} href='#' onClick={that.handleLogout}>登出</a></li>
  </ul> }
</div>)

const renderNav = (navs) => <ul className={css.navContainer}>{navs.map(nav => 
  <li key={nav.name}><NavLink activeClassName={css.navActive} className={css.nav} to={nav.url} exact={nav.exact}>{nav.name}</NavLink></li>
)}</ul>

class Header extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      showAccountMenu: false
    }
    this._bind('handleLogout', 'handleToggleAccountMenu')
  }
  handleLogout (e) {
    e.preventDefault()
    this.props.dispatch(actionCreators.logout())
  }
  handleToggleAccountMenu () {
    this.setState({showAccountMenu: !this.state.showAccountMenu})
  }
  render () {
    if (this.props.account.isAuthenticated !== undefined && !this.props.account.isAuthenticated) {
      return <Redirect to={{
        pathname: '/console/login',
        state: { from: this.props.location }
      }} />
    }
    return (<div className={css.mainHeader}>
        <div className={css.heading}>
            <h1 className={css.bdlogo}>
              <a href="/console">
                <span className={css.logoB}>Beardude</span>
                <span className={css.logoE}>Event</span>
              </a>
            </h1>
        </div>
      { this.props.account.manager && renderAccountInfo(this) }
      { this.props.nav && renderNav(navs[this.props.nav]) }
    </div>)
  }
}

export default Header
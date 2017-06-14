import React from 'react'
import { Redirect } from 'react-router-dom'
import { actionCreators } from '../../ducks/event'
import { actionCreators as accountActionCreators } from '../../ducks/account'
import 'url-search-params-polyfill'
import css from './style.css'

class Event extends React.Component {
  componentDidMount () {
    if (!this.props.account.isAuthenticated) {
      this.props.dispatch(accountActionCreators.accountInfo())
    }
    this.props.dispatch(actionCreators.getEvents())
  }
  handleLogout () {
    this.props.dispatch(accountActionCreators.logout())
  }
  render () {
    if (!this.props.account.isAuthenticated) {
      return (<Redirect to={'/console/login'}/>)
    }
    const that = this
    const eventList = (this.props.event && this.props.event.events) ? this.props.event.events.map(raceEvent => <li key={'event-' + raceEvent.id}>{raceEvent.nameCht}</li>) : <li>empty</li>
    return (<div className={css.container}>
      <div className={css.mainHeader}>
          <div className={css.heading}>
              <h1 className={css.bdlogo}>
                  <span className={css.logoB}>Beardude</span>
                  <span className={css.logoE}>Event</span>
              </h1>
          </div>
          <button onClick={this.handleLogout.bind(that)} type="submit">登出</button>
      </div>
      <div className={css.mainBody}>
          <div className={css.body}>
            <div>
              <ul>{eventList}</ul>
              <div className={css.ft}>
                footer
              </div>
            </div>
          </div>
      </div>
      <div className={css.footer}>
          <ul>
              <li className={css.copyRight}><span>Copyright &copy; </span><span>2020</span><span> Beardude Inc. All Rights Reserved</span></li>
          </ul>
      </div>
    </div>)
  }
}

export default Event

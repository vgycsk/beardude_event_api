import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/event'

import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'

const GroupList = ({group}) =>
  group.length > 0
  ? <ul>
    { group.map((V, I) => <li key={`gp_${I}`}><span>{`${V.title} (${V.count}/${V.maxCount})`}</span></li>) }
  </ul>
  : null

export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    this.dispatch = this.props.dispatch

    this._bind('dateChangehandler')
  }
  componentDidMount () {
    this.dispatch(actionCreators.getSelectedEvent(this.props.match.params.id || 'new'))
  }
  dateChangehandler (name) {
    return (E) => {
      console.log(name + E.currentTarget.value)
    }
  }
  render () {
    const { location, selectedEvent, group } = this.props

    if (!selectedEvent) {
      return (
        <div>
          <Header location={location} nav='event' />
          <div className={css.loading}>Loading...</div>
        </div>
      )
    }

    console.log(group)
    return (
      <div>
        <Header location={location} nav='event' />
        <div className={css.info}>
          <div><div className={css.actTitle}><span>Bear Dude Activity</span><span className={css.name}>{selectedEvent.activity}</span></div></div>
          <div><div className={css.actTitle}><span>Event Name</span><input type='text' defaultValue={selectedEvent.eventName} className={css.title} placeholder='event name' maxLength={120} onChange={this.dateChangehandler('eventName')} /></div></div>
          <div>
            <div className={css.actTitle}>
              <span>報名日期</span><input type='date' value={selectedEvent.regDate} onChange={this.dateChangehandler('reg')} />
              <span>開放日期</span><input type='date' value={selectedEvent.openDate} onChange={this.dateChangehandler('open')} />
              <span>截止日期</span><input type='date' value={selectedEvent.endDate} onChange={this.dateChangehandler('end')} />
            </div>
          </div>
        </div>
        <div className={css.managerList}>
          <div>
            <span className={css.head}>組別</span>
            { GroupList({group}) }
            <div>
              <input type='text' placeholder='new group name' />
              <span>+</span>
            </div>
          </div>
          <div>
            <span className={css.head}>組別賽制</span>
            <div>
              <input type='text' placeholder='new group name' />
              <span>+</span>
            </div>
          </div>
          <div>
            <span className={css.head}>選手</span>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}

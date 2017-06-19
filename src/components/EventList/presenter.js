import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/event'
import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'
import Button from '../Button'

const EventList = ({ events = [] }) =>
events.length > 0
? events.map(raceEvent =>
  <li key={'event-' + raceEvent.id}>
    <Button style='bigIcon' text={raceEvent.nameCht} url={'/console/event/' + raceEvent.id} />
  </li>)
: null

class Event extends BaseComponent {
  constructor (props) {
    super(props)
    console.log(this.props);
    this.dispatch = this.props.dispatch
  }
  componentDidMount () {
    this.dispatch(actionCreators.getEvents())
  }
  render () {
    const { event, location } = this.props
    const nav = [
      { name: '賽制', url: '/console/event' },
      { name: 'RFID 操作', url: '/console/RFID' },
      { name: '賽制操作', url: '/console/eventMatch' },
      { name: 'Stream', url: '/console/stream'}
    ]
    return (
      <div>
        <Header location={location} nav={nav} />
        <div className={css.mainBody}>
          <ul className={css.iconView}>
            <li><Button style='bigIconCreate' url='/console/event/new' text='+' /></li>
            {EventList({...event})}
          </ul>
        </div>
        <Footer />
      </div>
    )
  }
}

export default Event

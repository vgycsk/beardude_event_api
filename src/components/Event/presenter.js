import React from 'react'
import { actionCreators } from '../../ducks/event'
import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'
import Button from '../Button'

class Event extends React.Component {
  componentDidMount () {
    this.props.dispatch(actionCreators.getEvents())
  }
  render () {
    const eventList = (this.props.event && this.props.event.events) ? this.props.event.events.map(raceEvent => <li key={'event-' + raceEvent.id}><Button style="bigIcon" text={raceEvent.nameCht} url={"/console/event/" + raceEvent.id}/></li>) : ''
    return (<div>
      <Header />
      <div className={css.mainBody}>
        <ul className={css.iconView}>
          <li><Button style="bigIconCreate" url="/console/event/new" text="+" /></li>
          {eventList}
        </ul>
      </div>
      <Footer />
    </div>)
  }
}

export default Event

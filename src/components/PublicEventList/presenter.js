import React from 'react'
// import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/event'
import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'
import Button from '../Button'

const EventBrick = ({ events = [] }) =>
events.length > 0
? events.map(raceEvent =>
  <li key={'event-' + raceEvent.id}>
    <Button style='bigIcon' text={raceEvent.nameCht} url={'/event/' + raceEvent.id} />
  </li>)
: null

class PublicEventList extends React.PureComponent {
  constructor (props) {
    super(props)
    this.dispatch = this.props.dispatch
  }
  componentDidMount () {
    this.dispatch(actionCreators.getEvents())
  }
  render () {
    const { event, location } = this.props
    return (
      <div>
        <Header isPublic='1' location={location} />
        <div className={css.mainBody}>
          <ul className={css.iconView}>
            {EventBrick({...event})}
          </ul>
        </div>
        <Footer />
      </div>
    )
  }
}

export default PublicEventList

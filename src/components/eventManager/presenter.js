import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/event'

import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'

export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    this.dispatch = this.props.dispatch
  }
  componentDidMount () {
    this.dispatch(actionCreators.getSelectedEvent(this.props.match.params.id || 'new'))
  }
  render () {
    const { location, selectedEvent } = this.props

    if (selectedEvent) {
      return <div className={css.loading}>Loading...</div>
    }

    return (
      <div>
        <Header location={location} />
        <div className={css.info}>
          <div></div>
        </div>
        <Footer />
      </div>
    )
  }
}

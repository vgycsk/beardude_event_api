import { connect } from 'react-redux'
import { EventManager } from './presenter'

const mapStateToProps = (state) => ({
  account: state.account,
  selectedEvent: state.event.selectedEvent,
  group: state.event.selectedEvent.group || []
})

export default connect(mapStateToProps)(EventManager)

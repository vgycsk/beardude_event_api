import { connect } from 'react-redux'
import { EventManager } from './presenter'

const mapStateToProps = (state) => ({
  account: state.account,
  selectedEvent: state.selectedEvent
})

export default connect(mapStateToProps)(EventManager)

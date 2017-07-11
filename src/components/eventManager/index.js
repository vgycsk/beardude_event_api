import { connect } from 'react-redux'
import { EventManager } from './presenter'

const mapStateToProps = (state) => ({
  selectedEvent: state.event.selectedEvent,
  loading: state.posts.loading,
  error: state.posts.error
})

export default connect(mapStateToProps)(EventManager)

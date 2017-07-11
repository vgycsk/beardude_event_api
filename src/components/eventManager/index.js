import { connect } from 'react-redux'
import { EventManager } from './presenter'

const mapStateToProps = (state) => ({
  event: state.event.event,
  loading: state.posts.loading,
  error: state.posts.error
})

export default connect(mapStateToProps)(EventManager)

import { connect } from 'react-redux'
import EventList from './presenter'

const mapStateToProps = (state) => ({
  event: state.event
})

export default connect(mapStateToProps)(EventList)

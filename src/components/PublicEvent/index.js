import { connect } from 'react-redux'
import { PublicEvent } from './presenter'

const mapStateToProps = (state) => ({
  event: state.event.event
})

export default connect(mapStateToProps)(PublicEvent)

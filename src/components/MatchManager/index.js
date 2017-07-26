import { connect } from 'react-redux'
import { MatchManager } from './presenter'

const mapStateToProps = (state) => ({
  event: state.event.event
})

export default connect(mapStateToProps)(MatchManager)

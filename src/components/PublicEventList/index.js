import { connect } from 'react-redux'
import PublicEventList from './presenter'

const mapStateToProps = (state) => ({
  event: state.event
})

export default connect(mapStateToProps)(PublicEventList)

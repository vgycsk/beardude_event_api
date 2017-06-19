import { connect } from 'react-redux'
import Event from './presenter'

const mapStateToProps = (state) => ({
  account: state.account,
  event: state.event
})

export default connect(mapStateToProps)(Event)

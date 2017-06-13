import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Event from './presenter'

const mapStateToProps = (state) => ({
  account: state.account,
  event: state.event
})
export default withRouter(connect(mapStateToProps)(Event))

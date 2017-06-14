import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Account from './presenter'

const mapStateToProps = (state) => {
  return {
    account: state.account
  }
}

export default withRouter(connect(mapStateToProps)(Account))

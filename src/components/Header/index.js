import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Header from './presenter'

const mapStateToProps = (state) => {
  return {
    account: state.account
  }
}

export default withRouter(connect(mapStateToProps)(Header))

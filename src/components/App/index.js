import { connect } from 'react-redux'
import App from './presenter'
import { withRouter } from 'react-router-dom'

const mapStateToProps = (state) => {
  return {
    account: state.account
  }
}

export default withRouter(connect(mapStateToProps)(App))

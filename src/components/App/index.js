import { connect } from 'react-redux'
import App from './presenter'

const mapStateToProps = (state) => {
  return {
    account: state.account
  }
}

export default connect(mapStateToProps)(App)

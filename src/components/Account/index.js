import { connect } from 'react-redux'
import Account from './presenter'

const mapStateToProps = (state) => {
  return {
    credentials: state.account.credentials
  }
}

export default connect(mapStateToProps)(Account)

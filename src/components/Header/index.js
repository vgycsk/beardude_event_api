import { connect } from 'react-redux'
import Header from './presenter'

const mapStateToProps = (state) => {
  return {
    account: state.account
  }
}

export default connect(mapStateToProps)(Header)

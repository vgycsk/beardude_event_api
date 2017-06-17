import { connect } from 'react-redux'
import Account from './presenter'

const mapStateToProps = (state) => ({
  account: state.account
})

export default connect(mapStateToProps)(Account)

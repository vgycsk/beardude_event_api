import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Admin from './presenter'

const mapStateToProps = (state) => ({
  loading: state.posts.loading,
  error: state.posts.error
})

export default withRouter(connect(mapStateToProps)(Admin))

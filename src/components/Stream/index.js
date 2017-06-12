import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Stream from './presenter'

const mapStateToProps = (state) => ({
  loading: state.posts.loading,
  error: state.posts.error,
  posts: state.posts.posts
})

export default withRouter(connect(mapStateToProps)(Stream))

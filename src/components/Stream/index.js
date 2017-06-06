import { connect } from 'react-redux'
import Stream from './presenter'

const mapStateToProps = (state) => ({
  loading: state.posts.loading,
  error: state.posts.error,
  posts: state.posts.posts
})

export default connect(mapStateToProps)(Stream)

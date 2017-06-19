import { connect } from 'react-redux'
import Admin from './presenter'

const mapStateToProps = (state) => ({
  loading: state.posts.loading,
  error: state.posts.error
})

export default connect(mapStateToProps)(Admin)

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import Racer from './presenter'

const mapStateToProps = (state) => {
  return {
    racer: state.racer
  }
}

export default withRouter(connect(mapStateToProps)(Racer))

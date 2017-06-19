import { connect } from 'react-redux'
import Racer from './presenter'

const mapStateToProps = (state) => {
  return {
    racer: state.racer
  }
}

export default connect(mapStateToProps)(Racer)

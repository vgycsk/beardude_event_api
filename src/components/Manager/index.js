import { connect } from 'react-redux'
import Manager from './presenter'

const mapStateToProps = (state) => {
  return {
    manager: state.manager
  }
}

export default connect(mapStateToProps)(Manager)

import { connect } from 'react-redux'
import AssignReg from './presenter'

const mapStateToProps = (state) => {
  return {
    event: state.event
  }
}

export default connect(mapStateToProps)(AssignReg)

import { connect } from 'react-redux'
import AdvRule from './presenter'

const mapStateToProps = (state) => {
  return {
    event: state.event
  }
}

export default connect(mapStateToProps)(AdvRule)

import { connect } from 'react-redux'
import Team from './presenter'

const mapStateToProps = (state) => {
  return {
    team: state.team,
    racer: state.racer
  }
}

export default connect(mapStateToProps)(Team)

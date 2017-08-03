/* global io */
import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators as eventActions } from '../../ducks/event'

import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'
import processData from '../MatchManager/processData'

const render = {
  raceList: ({race, raceSelected, index, handleSelect, groupNames}) => {
    return <li className={(index === raceSelected) ? css.selected : css.li} key={'race' + race.id}>
      <button className={css.list} onClick={handleSelect(index)}>
        <span>{groupNames[race.group.toString()]}</span>
        <span>:</span>
        <span>{(race.nameCht) ? race.nameCht : race.name}</span>
      </button>
      <div className={css[race.raceStatus]} />
    </li>
  },
  dashboard: {
    labels: (race) => <div className={css.dashId}><table className={css.dashTable}>
      <thead><tr>
        <th className={css.no}>名次</th>
        <th className={css.name}>選手</th>
      </tr></thead>
      <tbody>{race.result.map((record, index) => {
        const reg = race.registrations.filter(V => (V.id === record.registration))[0]
        return reg ? <tr className={css.dashItem} key={'rec' + index}>
          <td className={css.no}>{index + 1}</td>
          <td className={css.name}><span className={css.raceNumber}>{reg.raceNumber}</span> <span>{reg.name}</span></td>
        </tr> : <tr />
      })
      }</tbody>
    </table></div>,
    results: (race) => <table className={css.dashTable}>
      <thead><tr>
        {processData.returnLapLabels(race.laps).map((V, I) => <th key={'th-' + I}>{V}</th>)}
      </tr></thead>
      <tbody>{race.result.map((record, index) => <tr key={'tr' + record.registration} className={css.dashItem}>
        {record.lapRecords.map((time, index) => <td key={'record-' + index} className={css.lap}>{time}</td>)}
      </tr>)}</tbody>
    </table>,
    summary: (race) => <table className={css.dashTable}>
      <thead><tr><th>加總</th></tr></thead>
      <tbody>{race.result.map((record, index) => <tr className={css.dashItem} key={'lap' + index}><td className={css.lap}>{record.sum}</td></tr>)}
      </tbody>
    </table>,
    advance: ({race, raceNames}) => <table className={css.dashTable}>
      <thead><tr><th><span>{race.isFinalRace ? '總排名' : '晉級資格'}</span></th></tr></thead>
      <tbody>{race.result.map((record, index) => <tr key={'adv' + index} className={css.dashItem}><td className={css.center}>{race.isFinalRace ? index + 1 : raceNames[record.advanceTo]}</td></tr>)}</tbody>
    </table>
  }
}

export class PublicEvent extends BaseComponent {
  constructor (props) {
    super(props)
    io.sails.autoConnect = false
    io.sails.url = 'http://localhost:1337'
    this.sConnection = io.sails.connect()
    this.timer = 0
    this.groupNames = {}
    this.raceNames = {}
    this.state = {
      races: [],
      raceSelected: -1,
      ongoingRace: -1
    }
    this.dispatch = this.props.dispatch
    this._bind('socketIoEvents', 'handleRefreshRace', 'handleSelect', 'updateRecords', 'updateRaces')
  }
  updateRaces () {
    const orderedRaces = processData.returnRacesByOrder(processData.returnRaces(this.props.event.groups), this.props.event.raceOrder)
    const ongoingRace = (this.state.ongoingRace === -1) ? ((this.props.event.ongoingRace === -1) ? undefined : processData.returnOngoingRace(this.props.event.ongoingRace, orderedRaces)) : this.state.ongoingRace
    let stateObj = { races: orderedRaces, raceSelected: this.state.raceSelected, ongoingRace: ongoingRace, dialog: undefined, editField: undefined }
    if (ongoingRace === undefined) {
      clearInterval(this.timer)
      if (stateObj.raceSelected === -1) { stateObj.raceSelected = processData.returnSelectedRace(orderedRaces) }
    } else {
      stateObj.raceSelected = ongoingRace
    }
    this.setState(stateObj, function () {
      if (this.state.races[this.state.raceSelected].result.length === 0) {
        this.updateResult(this.state.raceSelected)
      }
    })
  }
  updateResult (index) {
    let races = this.state.races
    let race = races[index]
    race.result = processData.returnRaceResult(race)
    this.setState({races: races})
  }
  componentDidMount () {
    const onSuccess = () => {
      const races = processData.returnRaces(this.props.event.groups)
      this.groupNames = processData.returnIdNameMap(this.props.event.groups)
      this.raceNames = processData.returnIdNameMap(races)
      return this.updateRaces()
    }
    this.socketIoEvents()
    if (!this.props.event) {
      return this.dispatch(eventActions.getEvent(this.props.match.params.id, onSuccess))
    }
    if (this.props.event !== -1) { return onSuccess() }
  }
  componentWillUnmount () {
    this.sConnection.off('raceupdate')
  }
  socketIoEvents (callback) {
    this.sConnection.on('raceupdate', function (data) {
      let races = this.state.races
      let race = races[this.state.ongoingRace]

      race.recordsHashTable = data.result.recordsHashTable
      race.result = processData.returnRaceResult(race)
      this.setState({races: races})
    }.bind(this))
  }
  handleRefreshRace (raceid) {
    return (e) => {
      this.dispatch(eventActions.getRace(raceid))
    }
  }
  handleSelect (index) {
    return (e) => {
      this.setState({ raceSelected: index }, function () {
        if (this.state.races[index].result.length === 0) {
          this.updateResult(index)
        }
      })
    }
  }
  render () {
    const { location, event, match } = this.props
    const { races, raceSelected } = this.state
    const { groupNames, handleSelect, raceNames } = this
    let dbLabels = ''
    let dbResults = ''
    let dbSummary = ''
    let dbAdvance = ''
    let race

    if (event === -1 || !match.params.id) { return <Redirect to={{pathname: '/'}} /> } else if (!event) { return <div><Header location={location} match={match} isPublic='1' /><div className={css.loading}>Loading...</div></div> }

    if (raceSelected !== -1) {
      race = races[raceSelected]
      dbLabels = render.dashboard.labels(race)
      dbResults = <div className={css.scrollBox}>{render.dashboard.results(race)}</div>
      dbSummary = <div className={css.summary}>{render.dashboard.summary(race)}</div>
      dbAdvance = <div className={css.advTable}>{render.dashboard.advance({race, raceNames})}</div>
    }
    return (<div className={css.wrap}><Header isPublic='1' location={location} match={match} />
      <div className={css.mainBody}>
        <div className={css.info}>
          <h2>{event.nameCht}</h2>
        </div>
        <div className={css.managerList}>
          <div>
            <div className={css.hd}><span>賽程</span></div>
            <ul className={css.ul}>
              {races.map((race, index) => render.raceList({ race, index, raceSelected, groupNames, handleSelect }))}
            </ul>
          </div>
          {dbLabels}{dbResults}{dbSummary}{dbAdvance}
        </div>
      </div>
      <Footer />
    </div>)
  }
}

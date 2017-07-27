import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators as eventActions} from '../../ducks/event'

import css from './style.css'
import { Dialogue } from '../Dialogue/presenter'
import Button from '../Button'
import Header from '../Header'

const returnRaces = (groups) => {
  let races = []
  groups.map(V => { races = races.concat(V.races) })
  return races
}
const returnRacesByOrder = (races, order) => {
  let result = []
  order.map(raceId => { races.map(race => { if (race.id === raceId) { result.push(race) } }) })
  return result
}
const returnGroupNameMap = (groups) => {
  let result = {}
  groups.map(group => { result[group.id.toString()] = group.nameCht })
  return result
}
const returnOngoingRace = (ongoingRaceId, orderedRaces) => {
  for (let i = 0; i < orderedRaces.length; i += 1) {
    if (orderedRaces[i].id === ongoingRaceId) { return i }
  }
  return undefined
}
const returnLapLabels = (laps) => {
  let result = []
  for (var i = 0; i < laps; i += 1) {
    result.push(i + 1)
  }
  return result
}
const returnFormattedTime = (milS) => {
  const sec = ((milS % 60000) / 1000).toFixed(2);
  const min = Math.floor(milS / 60000);
  return min + ':' + (sec < 10 ? '0' : '') + sec
}
const returnLapRecord = (records, laps, startTime) => {
  let result = []
  let lastRecord = startTime;
  for (var i = 1; i <= laps; i += 1) {
    if (records[i]) {
      result.push(returnFormattedTime(records[i] - lastRecord))
      lastRecord = records[i]
    } else {
      result.push('')
    }
  }
  return result
}
const returnSummary = (lastRecord, startTime) => {
  if (lastRecord !== 0) {
    return returnFormattedTime(lastRecord - startTime)
  }
  return 'N/A'
}
const validate = {
  racerCompletedLaps: ({recordsHashTable, laps}) => {
    let result = false
    for (let i in recordsHashTable) {
      if (recordsHashTable.hasOwnProperty(i)) {
        result = true
        if (recordsHashTable[i].length < laps) { return false }
      }
    }
    return result
  },
  requirePacer: (race) => {
    if (race.requirePacer && (!racer.pacerEpc || racer.pacerEpc === '')) { return false }
    return true
  }
}
const returnSortedRecord = (regs, hashTable, laps) => {
  let sortTable = []
  let incomplete = []
  let notStarted = []
  const lastRecordIndex = laps + 1

  regs.map(reg => {
    const record = hashTable[reg.epc]
    if (record) {
      if (record[lastRecordIndex]) {
        sortTable.push([reg.epc, reg.name, reg.raceNumber, record[lastRecordIndex], record.length - 1, record])
      } else {
        incomplete.push([reg.epc, reg.name, reg.raceNumber, record[record.length - 1], record.length - 1, record])
      }
    } else {
      notStarted.push([reg.epc, reg.name, reg.raceNumber, 0, 0, []])
    }
  })
  // sort completed racer by last lap record
  sortTable.sort((a, b) => a[3] - b[3])
  // sort incompleted by laps
  incomplete.sort((a, b) => b[4] - a[4])
  // sort incompleted same-lap by time
  incomplete.sort((a, b) => (a[4] === b[4]) ? a[3] - b[3] : 0 )
  // sort notStart by raceNumber
  notStarted.sort((a, b) => a[2] - b[2])

  sortTable = sortTable.concat(incomplete)
  sortTable = sortTable.concat(notStarted)
  // [epc, name, raceNumber, timestamp, laps, record]
  return sortTable
}
const render = {
  raceList: ({race, raceSelected, index, handleSelect, groupNames}) => {
    const className = css[((index === raceSelected) ? 'selected' : '') + race.raceStatus]
    return <li className={className} key={'race' + race.id}>
      <button className={css.list} onClick={handleSelect(index)}>{groupNames[race.group.toString()]} - {(race.nameCht) ? race.nameCht : race.name}</button>
    </li>
  },
  raceCtrl: ({race, readerStatus, ongoingRace, handleEndRace, handleUpdateDialog}) => {
    switch (race.raceStatus) {
      case 'init': {
        return <span className={css.raceCtrl}>{(ongoingRace === undefined) ? <Button style='short' text='開賽倒數' onClick={handleUpdateDialog('startCountdown')}/> : <Button text='開賽倒數' style='shortDisabled' />}</span>
      }
      case 'started': {
        return <span className={css.raceCtrl}>
          {validate.racerCompletedLaps(race.recordsHashTable, race.laps)
            ? <Button style='short' text='結束比賽' onClick={handleEndRace}/>
            : <Button style='shortRed' text='結束比賽' onClick={handleUpdateDialog('endRace')}/>
          }
          <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
        </span>
      }
      case 'ended': {
        return <span className={css.raceCtrl}>
          <Button style='short' text='送出結果' onClick={handleUpdateDialog('submitResult')} />
          <Button style='shortDisabled' text='編輯' />
          <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
        </span>
      }
      case 'submitted': {
        return <span className={css.raceCtrl}>
          <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
        </span>
      }
    }
  },
  readerStatusBtn: ({ongoingRace, readerStatus, handleControlReader, getReaderStatus}) => {
    switch (readerStatus) {
    case 'idle':
      return <span>
        <Button style='short' text='啟動RFID' onClick={handleControlReader('startreader')}/>
        <Button style='shortGrey' text='測試RFID' onClick={handleControlReader('debug')}/>
      </span>
    case 'started':
      return <span>
        {(ongoingRace === undefined)
          ? <Button style='shortRed' text='關閉RFID' onClick={handleControlReader('terminatereader')} />
          : <Button style='shortDisabled' text='關閉RFID' />
        }
      </span>
    case 'debug':
      return <span>
        <Button style='shortDisabled' text='啟動RFID' />
        <Button style='shortGrey' text='結束測試' onClick={handleControlReader('terminatereader')} />
      </span>
    default:
      return <Button style='shortGrey' text='檢查RFID狀態' onClick={getReaderStatus}/>
    }
  },
  dialog: {
    startCountdown: ({ handleStartRace, handleUpdateDialog, countdown, handleChangeCountdown }) => <div className={css.form}>
      <h3>開賽倒數</h3>
      <div><input className={css.countDown} type='number' value={countdown} onChange={handleChangeCountdown()} placeholder='秒' /></div>
      <div className={css.boxFt}>
        <Button onClick={handleStartRace} text='開始' />
        <Button style='grey' onClick={handleUpdateDialog()} text='取消' />
      </div>
    </div>,
    countdown: ({ counter, handleUpdateDialog }) => <div className={css.form}>
      <h3>開賽倒數</h3>
      {counter && <div className={css.timer}>{counter}</div>}
      <div className={css.boxFt}>
        <Button style='alert' onClick={handleUpdateDialog('cancelRace')} text='重設比賽' />
      </div>
    </div>,
    cancelRace: ({ handleResetRace, handleUpdateDialog, counter }) => <div className={css.form}>
      <h3>重設比賽</h3>
      <h4>您確定要取消這場比賽的所有成績，並將比賽狀態還原嗎？</h4>
      <div className={css.boxFt}>
        <Button style='alert' onClick={handleResetRace} text='確定重設' />
        {counter
          ? <Button style='grey' onClick={handleUpdateDialog('countdown')} text='取消' />
          : <Button style='grey' onClick={handleUpdateDialog()} text='取消' />
        }
      </div>
    </div>,
    endRace: ({ handleEndRace, handleUpdateDialog }) => <div className={css.form}>
      <h3>結束比賽</h3>
      <h4>您確定要結束這場比賽，使用這場比賽記錄的資料計算成績？</h4>
      <div className={css.boxFt}>
        <Button style='alert' onClick={handleEndRace} text='確定結束' />
        <Button style='grey' onClick={handleUpdateDialog()} text='取消' />
      </div>
    </div>,
    submitResult: ({handleSubmitResult, handleUpdateDialog}) => <div className={css.form}>
      <h3>送出比賽結果</h3>
      <h4>確認並送出比賽結果</h4>
      <div className={css.boxFt}>
        <Button style='alert' onClick={handleSubmitResult} text='送出' />
        <Button style='grey' onClick={handleUpdateDialog()} text='取消' />
      </div>
    </div>,
    readerNotStarted: () => <div className={css.form}>
      <h3>連線異常</h3>
      <h4>無法連接到RFID閘門系統，請確定閘門系統已正確啟動，並具備網路連線</h4>
      <div className={css.boxFt}>
        <Button onClick={handleUpdateDialog()} text='關閉' />
      </div>
    </div>,
  },
  dashboardIds: ({sortTable}) => <div className={css.dashId}><table className={css.dashTable}>
    <thead><tr>
      <th className={css.no}>名次</th>
      <th className={css.name}>選手</th>
    </tr></thead>
    <tbody>{sortTable.map((record, index) => <tr className={css.dashItem}>
      <td className={css.no}>{index + 1}</td>
      <td className={css.name}><span className={css.raceNumber}>{record[2]}</span> <span>{record[1]}</span></td>
    </tr>)}</tbody>
  </table></div>,
  // [epc, name, raceNumber, timestamp, laps, record]
  dashboard: ({laps, sortTable, startTime}) => <table className={css.dashTable}>
    <thead><tr>
      {returnLapLabels(laps).map(V => <th>{V}</th>)}
    </tr></thead>
    <tbody>{sortTable.map((record, index) => <tr className={css.dashItem}>
      {returnLapRecord(record[5], laps, startTime).map(time => <td className={css.lap}>{time}</td>)}
    </tr>)}</tbody>
  </table>,
  dashboardSummary: ({sortTable, startTime}) => {
    return <table className={css.dashTable}>
        <thead><tr><th>成績</th></tr></thead>
        <tbody>{sortTable.map((record, index) => <tr className={css.dashItem}><td className={css.lap}>{returnSummary(record[3], startTime)}</td></tr>)}
        </tbody>
      </table>
  }
}

export class MatchManager extends BaseComponent {
  constructor (props) {
    super(props)
    io.sails.autoConnect = false
    io.sails.url = 'http://localhost:1337'
    this.sConnection = io.sails.connect()
    this.timer = 0
    this.state = {
      races: [],
      raceSelected: -1,
      groupNames: {},
      readerStatus: undefined, // didmount的時候打一次api先init狀態
      ongoingRace: undefined,
      dialog: undefined,
      countdown: 60,
      counter: undefined
    }
    this.dispatch = this.props.dispatch
    this._bind('socketIoEvents', 'getReaderStatus', 'countdown', 'handleChangeCountdown', 'handleRefreshRace', 'handleResize', 'handleSelect', 'handleControlReader', 'handleSubmitResult', 'handleStartRace', 'handleEndRace', 'handleUpdateDialog', 'handleResetRace', 'updateState')
  }
  updateState () {
    const orderedRaces = returnRacesByOrder(returnRaces(this.props.event.groups), this.props.event.raceOrder)
    const ongoingRace = (this.props.event.ongoingRace === -1) ? undefined : returnOngoingRace(this.props.event.ongoingRace, orderedRaces)
    let stateObj = { races: orderedRaces, raceSelected: 0, ongoingRace: ongoingRace, dialog: undefined }

    if (ongoingRace === undefined) {
      clearInterval(this.timer)
    } else {
      stateObj.raceSelected = ongoingRace
      if (orderedRaces[ongoingRace].startTime && orderedRaces[ongoingRace].startTime > Date.now()) {
        stateObj.dialog = 'countdown'
        this.timer = setInterval(this.countdown, 100)
      }
    }
    this.setState(stateObj)
  }
  componentDidMount () {
    const onSuccess = () => {
      const races = returnRaces(this.props.event.groups)
      this.setState({ groupNames: returnGroupNameMap(this.props.event.groups) })
      if (this.props.event.raceOrder.length === 0 || this.props.event.raceOrder.length < races.length) {
        const eventStateObj = { model: 'event', original: { id: this.props.event.id }, modified: { raceOrder: races.map(race => race.id) } }
        return this.dispatch(eventActions.submit(eventStateObj))
      }
      return this.updateState()
    }
    this.socketIoEvents(this.getReaderStatus)
    if (!this.props.event) {
      return this.dispatch(eventActions.getEvent(this.props.match.params.id, onSuccess))
    }
    return onSuccess()
  }
  componentWillUnmount () {
    this.sConnection.off('connect')
    this.sConnection.off('readerstatus')
  }
  countdown () {
    const reset = () => {
      clearInterval(this.timer)
      return this.setState({ counter: undefined, dialog: undefined })
    }
    if (this.state.ongoingRace === undefined) { return reset() }
    const startTime = this.state.races[this.state.ongoingRace].startTime
    const timeLeft = (startTime - Date.now())
    if (timeLeft <= 0) { return reset() }
    const result = parseFloat(Math.floor(timeLeft / 100) / 10).toFixed(1)
    this.setState({ counter:  result})
  }
  socketIoEvents (callback) {
    this.sConnection.on('connect', function onConnect () {
      this.sConnection.get('/api/race/joinReaderRoom', function res () { if (callback !== undefined) { callback () } })
    }.bind(this))
    this.sConnection.on('readerstatus', function (data) { this.setState({readerStatus: data.result}) }.bind(this))
    this.sConnection.on('raceupdate', function (data) { this.setState({readerStatus: data.result}) }.bind(this))

  }
  getReaderStatus (callback) {
    this.sConnection.post(io.sails.url + '/api/race/readerRoom', { type: 'getreaderstatus' }, function () {
      if (callback !== undefined) { callback() }
    })
  }
  handleUpdateDialog (value) { return (e) => {
    this.setState({ dialog: value })
  }}
  handleRefreshRace (raceid) { return (e) => {
    this.dispatch(eventActions.getRace(raceid))
  }}
  handleChangeCountdown () { return (e) => {
    this.setState({ countdown: e.target.value })
  }}
  handleControlReader (type) { return (e) => {
    this.sConnection.post(io.sails.url + '/api/race/readerRoom', { type: type, payload: {} }, function res (data, jwRes) {
      this.getReaderStatus()
    }.bind(this))
  }}
  handleStartRace () {
    const obj = { id: this.state.races[this.state.raceSelected].id, startTime: Date.now() + (this.state.countdown * 1000) }
    const callback = () => this.dispatch(eventActions.controlRace('start', obj, this.updateState))
    if (this.state.races[this.state.raceSelected].raceStatus === 'init' && this.state.ongoingRace === undefined) {
//      this.handleControlReader('startreader')
      callback()
    }
  }
  handleResetRace () {
    this.dispatch(eventActions.controlRace('reset', {id: this.state.races[this.state.raceSelected].id}, this.updateState))
  }
  handleEndRace () {
    this.dispatch(eventActions.controlRace('end', {id: this.state.races[this.state.raceSelected].id}, this.updateState))
  }
  handleSubmitResult () {
    this.dispatch(eventActions.submitRaceResult(this.state.races[this.state.raceSelected].id, this.updateState))
  }
  handleSelect (index) { return (e) => {
    if (this.state.races[index].raceStatus === 'init') { this.getReaderStatus() }
    this.setState({ raceSelected: index})
  }}
  render () {
    const { location, event, match } = this.props
    const { counter, races, raceSelected, groupNames, readerStatus, dialog, ongoingRace, countdown } = this.state
    if (event === -1 || !match.params.id) { return <Redirect to={{pathname: '/console'}} /> }
    else if (!event) { return <div><Header location={location} nav='event' match={match} /><div className={css.loading}>Loading...</div></div> }
    const sortTable = (raceSelected === -1) ? undefined : returnSortedRecord(races[raceSelected].registrations, races[raceSelected].recordsHashTable, races[raceSelected].laps)
    return (<div className={css.wrap}><Header location={location} nav='event' match={match} />
      <div className={css.mainBody}>
        <div className={css.info}>
          <h2>{event.nameCht}（ID: {event.id}）</h2>
          <span className={css.btn}>
            {render.readerStatusBtn({ongoingRace, readerStatus, handleControlReader: this.handleControlReader, getReaderStatus: this.getReaderStatus})}
          </span>
          {raceSelected !== -1 && render.raceCtrl({ race: races[raceSelected], readerStatus, ongoingRace, handleUpdateDialog: this.handleUpdateDialog, handleEndRace: this.handleEndRace })}
        </div>
        <div className={css.managerList}>
          <div>
            <div className={css.hd}><Button style='short' text='編輯賽程' /></div>
            <ul className={css.ul}>{races.map((race, index) => render.raceList({race, index, raceSelected, groupNames, handleSelect: this.handleSelect}))}
            </ul>
          </div>
          {sortTable && render.dashboardIds({sortTable})}
          {sortTable && <div className={css.scrollBox}>{render.dashboard({laps: races[raceSelected].laps, startTime: races[raceSelected].startTime, sortTable})}</div>}
          {sortTable && <div className={css.summary}>{render.dashboardSummary({sortTable, startTime: races[raceSelected].startTime})}</div>}
        </div>
      </div>
      {dialog && <Dialogue content={render.dialog[dialog]({ countdown, counter, handleStartRace: this.handleStartRace, handleUpdateDialog: this.handleUpdateDialog, handleChangeCountdown: this.handleChangeCountdown, handleResetRace: this.handleResetRace, handleEndRace: this.handleEndRace, handleSubmitResult: this.handleSubmitResult })} />}
    </div>)
  }
}
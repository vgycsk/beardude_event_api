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
const returnIdNameMap = (objs) => {
  let result = {}
  objs.map(obj => { result[obj.id.toString()] = obj.nameCht })
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
  for (var i = 0; i < laps; i += 1) { result.push(i + 1) }
  return result
}
const returnMovedArray = (arr, old_index, new_index) => {
  while (old_index < 0) { old_index += arr.length; }
  while (new_index < 0) { new_index += arr.length; }
  if (new_index >= arr.length) {
      var k = new_index - arr.length
      while ((k--) + 1) { arr.push(undefined) }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
 return arr
}

const returnFormattedTime = (milS) => {
  const sec = ((milS % 60000) / 1000).toFixed(2);
  const min = Math.floor(milS / 60000);
  return min + ':' + (sec < 10 ? '0' : '') + sec
}
const returnLapRecord = (result, laps, startTime) => {
  let output = []
  let lastRecord = startTime;
  for (var i = 1; i <= laps; i += 1) {
    if (result[i]) {
      output.push(returnFormattedTime(result[i] - lastRecord))
      lastRecord = result[i]
    } else {
      output.push('-')
    }
  }
  return output
}
const returnAdvanceToId = (index, advancingRules) => {
  for (var i = 0; i < advancingRules.length; i += 1) {
    if ( index >= advancingRules[i].rankFrom && index <= advancingRules[i].rankTo) { return advancingRules[i].toRace }
  }
  return undefined
}
const returnRaceResult = (race) => {
  let sortTable = []
  let incomplete = []
  let notStarted = []
  const lastRecordIndex = race.laps + 1

  race.registrations.map(reg => {
    const record = race.recordsHashTable[reg.epc]
    if (record) {
      if (record[lastRecordIndex]) {
        sortTable.push([reg.epc, reg.id, reg.raceNumber, record[lastRecordIndex], record.length - 1, record])
      } else {
        incomplete.push([reg.epc, reg.id, reg.raceNumber, record[record.length - 1], record.length - 1, record])
      }
    } else {
      notStarted.push([reg.epc, reg.id, reg.raceNumber, 0, 0, [], reg.id])
    }
  })
  sortTable.sort((a, b) => a[3] - b[3]) // sort completed racer by last lap record
  incomplete.sort((a, b) => b[4] - a[4]) // sort incompleted by laps
  incomplete.sort((a, b) => (a[4] === b[4]) ? a[3] - b[3] : 0 ) // sort incompleted same-lap by time
  notStarted.sort((a, b) => a[2] - b[2]) // sort notStart by raceNumber
  sortTable = sortTable.concat(incomplete).concat(notStarted)
  // sortTable: [epc, name, raceNumber, timestamp, laps, record]
  return sortTable.map((item, index) => ({ epc: item[0], registration: item[1], sum: (item[3]) ? returnFormattedTime(item[3] - race.startTime) : '-', laps: item[4], lapRecords: returnLapRecord(item[5], race.laps, race.startTime), advanceTo: returnAdvanceToId(index, race.advancingRules) }))
}
const render = {
  advanceMenu: ({advancingRules, raceNames, value, handleEditAdvnace, index}) => <select defaultValue={value} onChange={handleEditAdvnace(index)}><option value='-1'>無</option>{advancingRules.map(rule => <option key={'rule' + rule.toRace} value={rule.toRace}>{raceNames[rule.toRace]}</option>)}</select>,
  raceList: ({race, raceSelected, index, handleSelect, groupNames}) => {
    const className = css[((index === raceSelected) ? 'selected' : '') + race.raceStatus]
    return <li className={className} key={'race' + race.id}>
      <button className={css.list} onClick={handleSelect(index)}><span>{groupNames[race.group.toString()]}</span><span>:</span> <span>{(race.nameCht) ? race.nameCht : race.name}</span>
      </button>
    </li>
  },
  raceListDraggable: ({race, raceSelected, index, handleSelect, groupNames, handleDragStart, handleDragOver, handleDragEnd}) => {
    const className = css[((index === raceSelected) ? 'selected' : '') + race.raceStatus]
    return <li className={className} key={'race' + race.id} draggable='true' onDragStart={handleDragStart(index)} onDragOver={handleDragOver(index)} onDragEnd={handleDragEnd}>
      <button className={css.list} onClick={handleSelect(index)}>{groupNames[race.group.toString()]} - {(race.nameCht) ? race.nameCht : race.name}
      </button>
      <div className={css.dragHandle}></div>
    </li>
  },
  raceCtrl: ({race, readerStatus, editField, ongoingRace, handleEndRace, handleUpdateDialog, handleToggleEdit, modified}) => {
    switch (race.raceStatus) {
      case 'init': {
        return <span className={css.raceCtrl}>{(ongoingRace === undefined) ? <Button style='short' text='開賽倒數' onClick={handleUpdateDialog('startCountdown')}/> : <Button text='開賽倒數' style='shortDisabled' />}</span>
      }
      case 'started': {
        return <span className={css.raceCtrl}>
          {(race.result.laps === race.laps)
            ? <Button style='short' text='結束比賽' onClick={handleEndRace}/>
            : <Button style='shortRed' text='結束比賽' onClick={handleUpdateDialog('endRace')}/>
          }
          <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
        </span>
      }
      case 'ended': {
        return <span className={css.raceCtrl}>
          {modified
            ? <Button style='short' text='送出結果' onClick={handleUpdateDialog('submitResult')} />
            : <Button style='shortDisabled' text='送出結果' />
          }
          {(editField === 'raceResult')
            ? <span>
              <Button style='shortGrey' text='取消' onClick={handleToggleEdit('raceResult')}/>
              <Button style='shortDisabled' text='重設比賽' />
            </span>
            : <span>
              <Button style='short' text='編輯' onClick={handleToggleEdit('raceResult')}/>
              <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
            </span>
          }
        </span>
      }
      case 'submitted': {
        return <span className={css.raceCtrl}>
          {(editField === 'raceResult')
            ? <span>
              {modified
                ? <Button style='short' text='送出結果' onClick={handleUpdateDialog('submitResult')} />
                : <Button style='shortDisabled' text='送出結果' />
              }
              <Button style='shortGrey' text='取消' onClick={handleToggleEdit('raceResult')}/>
              <Button style='shortDisabled' text='重設比賽' />
            </span>
            : <span>
              <Button style='short' text='編輯' onClick={handleToggleEdit('raceResult')}/>
              <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
            </span>
          }
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
        </tr> : <tr></tr>})
      }</tbody>
    </table></div>,
    results: (race) => <table className={css.dashTable}>
      <thead><tr>
        {returnLapLabels(race.laps).map((V, I) => <th key={'th-' + I}>{V}</th>)}
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
    </table>,
    edit: ({race, raceNames, handleDragStart, handleDragOver, handleDragEnd, handleEditAdvnace}) => <table className={css.dashTable}>
      <thead><tr><th><span>校正成績</span></th></tr></thead>
      <tbody>{race.result.map((record, index) => <tr key={'adv' + index} className={css.dashItem}><td className={css.center}>{render.advanceMenu({advancingRules: race.advancingRules, raceNames, index, value: record.advanceTo, handleEditAdvnace})}<div className={css.dragHandle} draggable='true' onDragStart={handleDragStart(index)} onDragOver={handleDragOver(index)} onDragEnd={handleDragEnd}></div></td></tr>)}</tbody>
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
    this.groupNames = {}
    this.raceNames = {}
    this.originalData = {}
    this.modified = false
    this.state = {
      races: [],
      raceSelected: -1,
      readerStatus: undefined, // didmount的時候打一次api先init狀態
      ongoingRace: undefined,
      dialog: undefined,
      countdown: 60,
      counter: undefined,
      editField: undefined
    }
    this.dispatch = this.props.dispatch
    this._bind('socketIoEvents', 'getReaderStatus', 'countdown', 'handleChangeCountdown', 'handleControlReader', 'handleDragStart', 'handleDragOver', 'handleDragEnd', 'handleEditAdvnace', 'handleEndRace', 'handleRefreshRace', 'handleResize', 'handleSelect', 'handleStartRace', 'handleSubmitRaceOrder', 'handleSubmitResult', 'handleToggleEdit', 'handleUpdateDialog', 'handleResetRace', 'updateRecords', 'updateRaces')
  }
  updateRaces () {
    const orderedRaces = returnRacesByOrder(returnRaces(this.props.event.groups), this.props.event.raceOrder)
    const ongoingRace = (this.props.event.ongoingRace === -1) ? undefined : returnOngoingRace(this.props.event.ongoingRace, orderedRaces)
    let stateObj = { races: orderedRaces, raceSelected: (this.state.raceSelected === -1) ? 0 : this.state.raceSelected, ongoingRace: ongoingRace, dialog: undefined, editField: undefined }
    let race

    this.originalData = orderedRaces
    this.modified = false
    if (ongoingRace === undefined) {
      clearInterval(this.timer)
    } else {
      stateObj.raceSelected = ongoingRace
      if (orderedRaces[ongoingRace].startTime && orderedRaces[ongoingRace].startTime > Date.now()) {
        stateObj.dialog = 'countdown'
        this.timer = setInterval(this.countdown, 100)
      }
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
    race.result = returnRaceResult(race)
    this.setState({races: races})
  }
  componentDidMount () {
    const onSuccess = () => {
      const races = returnRaces(this.props.event.groups)
      this.groupNames = returnIdNameMap(this.props.event.groups)
      this.raceNames = returnIdNameMap(races)
      if (this.props.event.raceOrder.length === 0 || this.props.event.raceOrder.length < races.length) {
        const eventStateObj = { model: 'event', original: { id: this.props.event.id }, modified: { raceOrder: races.map(race => race.id) } }
        return this.dispatch(eventActions.submit(eventStateObj))
      }
      return this.updateRaces()
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
  getReaderStatus () {
    this.sConnection.post(io.sails.url + '/api/race/readerRoom', { type: 'getreaderstatus' })
  }
  handleToggleEdit (field) { return (e) => {
    if (this.state.editField === field) {
      this.modified = false
      return this.setState({ editField: undefined, races: this.originalData })
    }
    this.setState({ editField: field })
  }}
  handleDragStart (fromIndex) { return (e) => {
    this.dragFromIndex = fromIndex
    this.dragOverIndex = fromIndex
  }}
  handleDragOver (overIndex) { return (e) => {
    this.dragOverIndex = overIndex
  }}
  handleDragEnd () {
    if (this.dragFromIndex !== this.dragOverIndex) {
      this.modified = true
      if (this.state.editField === 'raceOrder') {
        this.setState({races: returnMovedArray([...this.state.races], this.dragFromIndex, this.dragOverIndex), raceSelected: this.dragOverIndex})
      } else if (this.state.editField === 'raceResult') {
        let races = this.state.races
        let race = races[this.state.raceSelected]
        race.result = returnMovedArray([...race.result], this.dragFromIndex, this.dragOverIndex)
        this.setState({races: races})
      }
    }
  }
  handleEditAdvnace (index) { return (e) => {
    let stateObj = { races: this.state.races }
    let race = stateObj.races[this.state.raceSelected]
    this.modified = true
    race.result[index].advanceTo = (e.target.value === '-1') ? undefined : parseInt(e.target.value)
    this.setState(stateObj)
  }}
  handleSubmitRaceOrder () {
    const onSuccess = () => this.setState({ editField: undefined })
    const eventStateObj = { model: 'event', original: { id: this.props.event.id }, modified: { raceOrder: this.state.races.map(V => V.id) } }
    return this.dispatch(eventActions.submit(eventStateObj, onSuccess))
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
    const callback = () => this.dispatch(eventActions.controlRace('start', obj, this.updateRaces))
    if (this.state.races[this.state.raceSelected].raceStatus === 'init' && this.state.ongoingRace === undefined) {
//      this.handleControlReader('startreader')
      callback()
    }
  }
  handleResetRace () {
    this.dispatch(eventActions.controlRace('reset', {id: this.state.races[this.state.raceSelected].id}, this.updateRaces))
  }
  handleEndRace () {
    this.dispatch(eventActions.controlRace('end', {id: this.state.races[this.state.raceSelected].id}, this.updateRaces))
  }
  handleEditResult () {
    
  }
  handleSubmitResult () {
    this.dispatch(eventActions.submitRaceResult(this.state.races[this.state.raceSelected], this.updateRaces))
  }
  handleSelect (index) { return (e) => {
    if (this.state.races[index].raceStatus === 'init') { this.getReaderStatus() }
    this.setState({ raceSelected: index}, function () {
      if (this.state.races[index].result.length === 0) {
        this.updateResult(index)
      }
    })
  }}
  render () {
    const { location, event, match } = this.props
    const { counter, races, raceSelected, readerStatus, dialog, ongoingRace, countdown, editField } = this.state
    const { getReaderStatus, groupNames, handleControlReader, handleChangeCountdown, handleDragStart, handleDragOver, handleDragEnd, handleEditAdvnace, handleEndRace, handleResetRace, handleToggleEdit, handleSelect, handleStartRace, handleSubmitResult, handleUpdateDialog, modified, raceNames } = this
    let dbLabels = ''
    let dbResults = ''
    let dbSummary = ''
    let dbAdvance = ''
    let raceCtrl = ''
    let race

    if (event === -1 || !match.params.id) { return <Redirect to={{pathname: '/console'}} /> }
    else if (!event) { return <div><Header location={location} nav='event' match={match} /><div className={css.loading}>Loading...</div></div> }

    if (raceSelected !== -1) {
      race = races[raceSelected]
      dbLabels = render.dashboard.labels(race)
      dbResults = <div className={css.scrollBox}>{render.dashboard.results(race)}</div>
      dbSummary = <div className={css.summary}>{render.dashboard.summary(race)}</div>
      if (editField === 'raceResult') {
        dbAdvance = <div className={css.editRank}>{render.dashboard.edit({race, raceNames, handleDragStart, handleDragOver, handleDragEnd, handleEditAdvnace })}</div>
      } else {
        dbAdvance = <div className={css.advTable}>{render.dashboard.advance({race, raceNames})}</div>
      }
      raceCtrl = render.raceCtrl({ race, readerStatus, editField, ongoingRace, modified, handleUpdateDialog, handleEndRace, handleToggleEdit })
    }
    return (<div className={css.wrap}><Header location={location} nav='event' match={match} />
      <div className={css.mainBody}>
        <div className={css.info}>
          <h2>{event.nameCht}（ID: {event.id}）</h2>
          <span className={css.btn}>
            {render.readerStatusBtn({ongoingRace, readerStatus, handleControlReader, getReaderStatus})}
          </span>
          {raceCtrl}
        </div>
        <div className={css.managerList}>
          <div className={(editField === 'raceOrder') ? css.draggable : ''}>
            <div className={css.hd}>
            {editField === 'raceOrder'
              ? <span>
                  {modified === false ? <Button style='shortDisabled' text='儲存'/> : <Button style='short' onClick={this.handleSubmitRaceOrder} text='儲存'/>}
                  <Button style='shortGrey' onClick={this.handleToggleEdit('raceOrder')} text='取消'/>
                </span>
              : <Button style='short' text='編輯賽程' onClick={this.handleToggleEdit('raceOrder')}/>
            }
            </div>
            <ul className={css.ul}>
              {races.map((race, index) => (editField === 'raceOrder') ? render.raceListDraggable({race, index, raceSelected, groupNames, handleSelect, handleDragStart, handleDragOver, handleDragEnd }) : render.raceList({race, index, raceSelected, groupNames, handleSelect }))}
            </ul>
          </div>
          {dbLabels}{dbResults}{dbSummary}{dbAdvance}
        </div>
      </div>
      {dialog && <Dialogue content={render.dialog[dialog]({ countdown, counter, handleStartRace, handleUpdateDialog, handleChangeCountdown, handleResetRace, handleEndRace, handleSubmitResult })} />}
    </div>)
  }
}
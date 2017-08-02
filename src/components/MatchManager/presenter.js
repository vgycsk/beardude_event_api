/* global io */
import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators as eventActions } from '../../ducks/event'

import css from './style.css'
import { Dialogue } from '../Dialogue/presenter'
import Button from '../Button'
import Header from '../Header'
import processData from './processData'

const render = {
  advanceMenu: ({advancingRules, raceNames, value, handleEditAdvnace, index}) => <select defaultValue={value} onChange={handleEditAdvnace(index)}><option value='-1'>無</option>{advancingRules.map(rule => <option key={'rule' + rule.toRace} value={rule.toRace}>{raceNames[rule.toRace]}</option>)}</select>,

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
  raceListDraggable: ({race, raceSelected, index, handleSelect, groupNames, handleDragStart, handleDragOver, handleDragEnd}) => {
    return <li className={(index === raceSelected) ? css.selected : css.li} key={'race' + race.id} draggable='true' onDragStart={handleDragStart(index)} onDragOver={handleDragOver(index)} onDragEnd={handleDragEnd}>
      <button className={css.list} onClick={handleSelect(index)}>
        <span>{groupNames[race.group.toString()]}</span>
        <span>:</span>
        <span>{(race.nameCht) ? race.nameCht : race.name}</span>
      </button>
      <div className={css.dragHandle} />
    </li>
  },
  raceCtrl: ({race, readerStatus, editField, ongoingRace, handleEndRace, handleUpdateDialog, handleToggleEdit, modified}) => {
    switch (race.raceStatus) {
      case 'init': {
        return <span className={css.raceCtrl}>{(ongoingRace === undefined) ? <Button style='short' text='開賽倒數' onClick={handleUpdateDialog('startCountdown')} /> : <Button text='開賽倒數' style='shortDisabled' />}<Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} /></span>
      }
      case 'started': {
        return <span className={css.raceCtrl}>
          {(race.result.laps === race.laps)
            ? <Button style='short' text='結束比賽' onClick={handleEndRace} />
            : <Button style='shortRed' text='結束比賽' onClick={handleUpdateDialog('endRace')} />
          }
          <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
        </span>
      }
      case 'ended': {
        return <span className={css.raceCtrl}>
          <Button style='short' text='送出結果' onClick={handleUpdateDialog('submitResult')} />
          {(editField === 'raceResult')
            ? <span>
              <Button style='shortGrey' text='取消' onClick={handleToggleEdit('raceResult')} />
              <Button style='shortDisabled' text='重設比賽' />
            </span>
            : <span>
              <Button style='short' text='編輯' onClick={handleToggleEdit('raceResult')} />
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
              <Button style='shortGrey' text='取消' onClick={handleToggleEdit('raceResult')} />
              <Button style='shortDisabled' text='重設比賽' />
            </span>
            : <span>
              <Button style='short' text='編輯' onClick={handleToggleEdit('raceResult')} />
              <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
            </span>
          }
        </span>
      }
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
    readerNotStarted: ({handleUpdateDialog}) => <div className={css.form}>
      <h3>連線異常</h3>
      <h4>無法連接到RFID閘門系統，請確定閘門系統已正確啟動，並具備網路連線</h4>
      <div className={css.boxFt}>
        <Button onClick={handleUpdateDialog()} text='關閉' />
      </div>
    </div>
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
    </table>,
    edit: ({race, raceNames, handleDragStart, handleDragOver, handleDragEnd, handleEditAdvnace}) => <table className={css.dashTable}>
      <thead><tr><th><span>校正成績</span></th></tr></thead>
      <tbody>{race.result.map((record, index) => <tr key={'adv' + index} className={css.dashItem}><td className={css.center}>{!race.isFinalRace && render.advanceMenu({advancingRules: race.advancingRules, raceNames, index, value: record.advanceTo, handleEditAdvnace})}<div className={css.dragHandle} draggable='true' onDragStart={handleDragStart(index)} onDragOver={handleDragOver(index)} onDragEnd={handleDragEnd} /></td></tr>)}</tbody>
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
    this.rfidTimeout = 0
    this.groupNames = {}
    this.raceNames = {}
    this.originalData = {}
    this.modified = false
    this.state = {
      races: [],
      raceSelected: -1,
      readerStatus: undefined, // didmount的時候打一次api先init狀態
      ongoingRace: -1,
      dialog: undefined,
      countdown: 60,
      counter: undefined,
      editField: undefined
    }
    this.dispatch = this.props.dispatch
    this._bind('socketIoEvents', 'getReaderStatus', 'countdown', 'handleChangeCountdown', 'handleControlReader', 'handleDragStart', 'handleDragOver', 'handleDragEnd', 'handleEditAdvnace', 'handleEndRace', 'handleRefreshRace', 'handleResize', 'handleSelect', 'handleStartRace', 'handleSubmitRaceOrder', 'handleSubmitResult', 'handleToggleEdit', 'handleUpdateDialog', 'handleResetRace', 'updateRecords', 'updateRaces')
  }
  updateRaces () {
    const orderedRaces = processData.returnRacesByOrder(processData.returnRaces(this.props.event.groups), this.props.event.raceOrder)
    const ongoingRace = (this.state.ongoingRace === -1) ? ((this.props.event.ongoingRace === -1) ? undefined : processData.returnOngoingRace(this.props.event.ongoingRace, orderedRaces)) : this.state.ongoingRace
    let stateObj = { races: orderedRaces, raceSelected: this.state.raceSelected, ongoingRace: ongoingRace, dialog: undefined, editField: undefined }
    this.originalData = orderedRaces
    this.modified = false
    if (ongoingRace === undefined) {
      clearInterval(this.timer)
      if (stateObj.raceSelected === -1) { stateObj.raceSelected = processData.returnSelectedRace(orderedRaces) }
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
    race.result = processData.returnRaceResult(race)
    this.setState({races: races})
  }
  componentDidMount () {
    const onSuccess = () => {
      const races = processData.returnRaces(this.props.event.groups)
      this.groupNames = processData.returnIdNameMap(this.props.event.groups)
      this.raceNames = processData.returnIdNameMap(races)
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
    this.sConnection.off('raceupdate')
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
    this.setState({ counter: result })
  }
  socketIoEvents (callback) {
    this.sConnection.on('connect', function onConnect () {
      this.sConnection.get('/api/race/joinReaderRoom', function res () { if (callback !== undefined) { callback() } })
    }.bind(this))
    this.sConnection.on('readerstatus', function (data) {
      this.setState({readerStatus: (data.result && data.result.isSingulating) ? 'started' : 'idle'})
    }.bind(this))
    this.sConnection.on('raceupdate', function (data) {
      let races = this.state.races
      let race = races[this.state.ongoingRace]

      race.recordsHashTable = data.result.recordsHashTable
      race.result = processData.returnRaceResult(race)
      this.setState({races: races})
    }.bind(this))
  }
  getReaderStatus () {
    this.sConnection.post(io.sails.url + '/api/race/readerRoom', { type: 'getreaderstatus' })
  }
  handleToggleEdit (field) {
    return (e) => {
      if (this.state.editField === field) {
        this.modified = false
        return this.setState({ editField: undefined, races: this.originalData })
      }
      this.setState({ editField: field })
    }
  }
  handleDragStart (fromIndex) {
    return (e) => {
      this.dragFromIndex = fromIndex
      this.dragOverIndex = fromIndex
    }
  }
  handleDragOver (overIndex) {
    return (e) => {
      this.dragOverIndex = overIndex
    }
  }
  handleDragEnd () {
    if (this.dragFromIndex !== this.dragOverIndex) {
      this.modified = true
      if (this.state.editField === 'raceOrder') {
        this.setState({races: processData.returnMovedArray([...this.state.races], this.dragFromIndex, this.dragOverIndex), raceSelected: this.dragOverIndex})
      } else if (this.state.editField === 'raceResult') {
        let races = this.state.races
        let race = races[this.state.raceSelected]
        race.result = processData.returnMovedArray([...race.result], this.dragFromIndex, this.dragOverIndex)
        this.setState({races: races})
      }
    }
  }
  handleEditAdvnace (index) {
    return (e) => {
      let stateObj = { races: this.state.races }
      let race = stateObj.races[this.state.raceSelected]
      this.modified = true
      race.result[index].advanceTo = (e.target.value === '-1') ? undefined : parseInt(e.target.value)
      this.setState(stateObj)
    }
  }
  handleSubmitRaceOrder () {
    const onSuccess = () => this.setState({ editField: undefined })
    const eventStateObj = { model: 'event', original: { id: this.props.event.id }, modified: { raceOrder: this.state.races.map(V => V.id) } }
    return this.dispatch(eventActions.submit(eventStateObj, onSuccess))
  }
  handleUpdateDialog (value) {
    return (e) => {
      this.setState({ dialog: value })
    }
  }
  handleRefreshRace (raceid) {
    return (e) => {
      this.dispatch(eventActions.getRace(raceid))
    }
  }
  handleChangeCountdown () {
    return (e) => {
      this.setState({ countdown: e.target.value })
    }
  }
  handleControlReader (type) {
    this.sConnection.post(io.sails.url + '/api/race/readerRoom', { type: type, payload: { eventId: this.props.event.id } })
  }
  handleStartRace () {
    const obj = { id: this.state.races[this.state.raceSelected].id, startTime: Date.now() + (this.state.countdown * 1000) }
    if (this.state.races[this.state.raceSelected].raceStatus === 'init' && this.state.ongoingRace === undefined) {
      this.handleControlReader('startreader')
      this.rfidTimeout = setInterval(function () {
        if (this.state.readerStatus === 'started') {
          clearInterval(this.rfidTimeout)
          this.setState({ ongoingRace: this.state.raceSelected }, function () {
            this.dispatch(eventActions.controlRace('start', obj, this.updateRaces))
          }.bind(this))
        }
      }.bind(this), 300)
      setTimeout(function () {
        if (this.state.readerStatus !== 'started') {
          clearInterval(this.rfidTimeout)
          this.setState({dialog: 'readerNotStarted'})
        }
      }.bind(this), 5000)
    }
  }
  handleResetRace () {
    const onSuccess = () => {
      this.handleControlReader('terminatereader')
      this.setState({ ongoingRace: undefined }, function () { this.updateRaces() }.bind(this))
    }
    this.dispatch(eventActions.controlRace('reset', {id: this.state.races[this.state.raceSelected].id}, onSuccess))
  }
  handleEndRace () {
    const onSuccess = () => {
      this.handleControlReader('terminatereader')
      this.setState({ ongoingRace: undefined }, function () { this.updateRaces() }.bind(this))
    }
    this.dispatch(eventActions.controlRace('end', {id: this.state.races[this.state.raceSelected].id}, onSuccess))
  }
  handleSubmitResult () {
    this.dispatch(eventActions.submitRaceResult(this.state.races[this.state.raceSelected], this.updateRaces))
  }
  handleSelect (index) {
    return (e) => {
      if (this.state.editField === undefined) {
        this.setState({ raceSelected: index }, function () {
          if (this.state.races[index].result.length === 0) {
            this.updateResult(index)
          }
        })
      }
    }
  }
  render () {
    const { location, event, match } = this.props
    const { counter, races, raceSelected, readerStatus, dialog, ongoingRace, countdown, editField } = this.state
    const { groupNames, handleChangeCountdown, handleDragStart, handleDragOver, handleDragEnd, handleEditAdvnace, handleEndRace, handleResetRace, handleToggleEdit, handleSelect, handleStartRace, handleSubmitResult, handleUpdateDialog, modified, raceNames } = this
    let dbLabels = ''
    let dbResults = ''
    let dbSummary = ''
    let dbAdvance = ''
    let raceCtrl = ''
    let race

    if (event === -1 || !match.params.id) { return <Redirect to={{pathname: '/console'}} /> } else if (!event) { return <div><Header location={location} nav='event' match={match} /><div className={css.loading}>Loading...</div></div> }

    if (raceSelected !== -1) {
      race = races[raceSelected]
      dbLabels = render.dashboard.labels(race)
      dbResults = <div className={css.scrollBox}>{render.dashboard.results(race)}</div>
      dbSummary = <div className={css.summary}>{render.dashboard.summary(race)}</div>
      if (editField === 'raceResult') {
        dbAdvance = <div className={css.editRank}>{ render.dashboard.edit({ race, raceNames, handleDragStart, handleDragOver, handleDragEnd, handleEditAdvnace }) }</div>
      } else {
        dbAdvance = <div className={css.advTable}>{render.dashboard.advance({race, raceNames})}</div>
      }
      raceCtrl = render.raceCtrl({ race, readerStatus, editField, ongoingRace, modified, handleUpdateDialog, handleEndRace, handleToggleEdit })
    }
    return (<div className={css.wrap}><Header location={location} nav='event' match={match} />
      <div className={css.mainBody}>
        <div className={css.info}>
          <h2>{event.nameCht}</h2>
          {raceCtrl}
        </div>
        <div className={css.managerList}>
          <div>
            <div className={css.hd}>
              {editField === 'raceOrder'
              ? <span>
                {modified === false ? <Button style='shortDisabled' text='儲存' /> : <Button style='short' onClick={this.handleSubmitRaceOrder} text='儲存' />}
                <Button style='shortGrey' onClick={this.handleToggleEdit('raceOrder')} text='取消' />
              </span>
              : <Button style='short' text='編輯賽程' onClick={this.handleToggleEdit('raceOrder')} />
            }
            </div>
            <ul className={css.ul}>{ races.map((race, index) => (editField === 'raceOrder') ? render.raceListDraggable({ race, index, raceSelected, groupNames, handleSelect, handleDragStart, handleDragOver, handleDragEnd }) : render.raceList({ race, index, raceSelected, groupNames, handleSelect })) }</ul>
          </div>
          {dbLabels}{dbResults}{dbSummary}{dbAdvance}
        </div>
      </div>
      {dialog && <Dialogue content={render.dialog[dialog]({ countdown, counter, handleStartRace, handleUpdateDialog, handleChangeCountdown, handleResetRace, handleEndRace, handleSubmitResult })} />}
    </div>)
  }
}

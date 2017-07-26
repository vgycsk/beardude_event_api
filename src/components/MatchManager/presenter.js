import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators as eventActions} from '../../ducks/event'

import css from './style.css'
import { Dialogue } from '../Dialogue/presenter'
import Button from '../Button'
import Header from '../Header'

const returnListHeight = ({pageHeight = 360, ftHeight = 89}) => Math.max(window.innerHeight - ftHeight, (pageHeight - ftHeight))
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
const validate = {
  racerCompletedLaps: ({recordsHashTable, laps}) => {
    let result = false
    for (let i in recordsHashTable) {
      if (recordsHashTable.hasOwnProperty(i)) {
        result = true
        if (recordsHashTable[i].length < laps) {
          return false
        }
      }
    }
    return result
  },
  requirePacer: (race) => {
    if (race.requirePacer && (!racer.pacerEpc || racer.pacerEpc === '')) { return false }
    return true
  }
}

let mockReaderStatus = 'started'
const returnMockReaderStatus = (callback) => { return callback({message: mockReaderStatus}) }
const mockReaderResponse = (action, callback) => {
  if (action === 'start') { mockReaderStatus = 'started' }
  else if (action === 'debug') { mockReaderStatus = 'debug' }
  else { mockReaderStatus = 'idle' }
  return callback({message: mockReaderStatus})
}

const render = {
  raceList: ({race, raceSelected, index, handleSelect, groupNames}) => {
    const className = css[((index === raceSelected) ? 'selected' : '') + race.raceStatus]
    return <li className={className} key={'race' + race.id}>
      <button className={css.list} onClick={handleSelect(index)}>{groupNames[race.group.toString()]} - {(race.nameCht) ? race.nameCht : race.name}</button>
    </li>
  },
  raceCtrl: ({races, raceSelected, readerStatus, ongoingRace, handleEndRace, handleUpdateDialog}) => {
    if (raceSelected > 0 && !races[raceSelected - 1].raceStatus !== 'submitted') { return '' }
    if (readerStatus === 'idle' || readerStatus === 'debug') { return <Button style='shortDisabled' text='比賽倒數'/> }
    const race = races[raceSelected]
    switch (race.raceStatus) {
      case 'init': {
        return (races[raceSelected].raceStatus === 'init' && ongoingRace === undefined) ? <Button style='short' text='開賽倒數' onClick={handleUpdateDialog('startCountdown')}/> : ''
      }
      case 'started': {
        return <span>
          {validate.racerCompletedLaps(race.recordsHashTable, race.laps)
            ? <Button style='short' text='結束比賽' onClick={handleEndRace}/>
            : <Button style='shortRed' text='結束比賽' onClick={handleUpdateDialog('endRace')}/>
          }
          <span className={css.right}>
            <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
          </span>
        </span>
      }
      case 'ended': {
        return <span>
          <Button style='short' text='送出結果' onClick={handleUpdateDialog('submitResult')} />
          <Button style='shortDisabled' text='編輯' />
          <span className={css.right}>
            <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
          </span>
        </span>
      }
      case 'submitted': {
        return <span className={css.right}>
          <Button style='shortRed' text='重設比賽' onClick={handleUpdateDialog('cancelRace')} />
        </span>
      }
    }
  },
  readerStatusBtn: ({ongoingRace, readerStatus, handleControlReader}) => {
    switch (readerStatus) {
    case 'idle':
      return <span>
        <Button style='short' text='啟動RFID' onClick={handleControlReader('start')}/>
        <Button style='shortGrey' text='測試RFID' onClick={handleControlReader('debug')}/>
      </span>
    case 'started':
      return <span>
        {(ongoingRace === undefined)
          ? <Button style='shortRed' text='關閉RFID' onClick={handleControlReader('stop')} />
          : <Button style='shortDisabled' text='關閉RFID' />
        }
      </span>
    case 'debug':
      return <span>
        <Button style='shortDisabled' text='啟動RFID' />
        <Button style='shortGrey' text='結束測試' onClick={handleControlReader('stop')} />
      </span>
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
    </div>
  }
}

export class MatchManager extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      listHeight: returnListHeight({}),
      races: [],
      raceSelected: -1,
      groupNames: {},
      readerStatus: undefined, // didmount的時候打一次api先init狀態
      ongoingRace: undefined,
      dialog: undefined,
      countdown: 60,
      counter: undefined,
      intervalId: {}
    }
    this.dispatch = this.props.dispatch
    this._bind('countdown', 'handleChangeCountdown', 'handleRefreshRace', 'handleResize', 'handleSelect', 'handleControlReader', 'handleSubmitResult', 'handleStartRace', 'handleEndRace', 'handleUpdateDialog', 'handleResetRace', 'updateState')
  }
  updateState () {
    const orderedRaces = returnRacesByOrder(returnRaces(this.props.event.groups), this.props.event.raceOrder)
    const ongoingRace = (this.props.event.ongoingRace === -1) ? undefined : returnOngoingRace(this.props.event.ongoingRace, orderedRaces)
    let stateObj = { races: orderedRaces, raceSelected: 0, ongoingRace: ongoingRace, dialog: undefined }

    if (ongoingRace === undefined) {
      clearInterval(this.state.intervalId)
      stateObj.intervalId = {}
    } else {
      stateObj.raceSelected = ongoingRace
      if (orderedRaces[ongoingRace].startTime && orderedRaces[ongoingRace].startTime > Date.now()) {
        stateObj.dialog = 'countdown'
        let intervalId = setInterval(this.countdown, 100)
        stateObj.intervalId = intervalId
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
    window.addEventListener('resize', this.handleResize);
    returnMockReaderStatus(function (res) {
      this.setState({readerStatus: res.message})
    }.bind(this))

    if (!this.props.event) {
      return this.dispatch(eventActions.getEvent(this.props.match.params.id, onSuccess))
    }
    return onSuccess()
  }
  componentWillUnmount () {
    window.removeEventListener('resize', this.handleResize)
  }
  countdown () {
    const reset = () => {
      clearInterval(this.state.intervalId)
      return this.setState({ counter: undefined, dialog: undefined, intervalId: {} })
    }
    if (this.state.ongoingRace === undefined) { return reset() }
    const startTime = this.state.races[this.state.ongoingRace].startTime
    const timeLeft = (startTime - Date.now())
    if (timeLeft <= 0) { return reset() }
    const result = parseFloat(Math.floor(timeLeft / 100) / 10).toFixed(1)
    this.setState({ counter:  result})
  }
  handleUpdateDialog (value) { return (e) => {
    this.setState({ dialog: value })
  }}
  handleRefreshRace (raceid) { return (e) => {
    this.dispatch(eventActions.getRace(raceid))
  }}
  handleResize () {
    this.setState({ listHeight: returnListHeight({}) })
  }
  handleChangeCountdown () { return (e) => {
    this.setState({ countdown: e.target.value })
  }}
  handleControlReader (action) { return (e) => {
    const onSuccess = (res) => this.setState({readerStatus: res.message})
    mockReaderResponse(action, onSuccess)
  }}
  handleStartRace () {
    const obj = { id: this.state.races[this.state.raceSelected].id, startTime: Date.now() + (this.state.countdown * 1000) }
    if (this.state.races[this.state.raceSelected].raceStatus === 'init' && this.state.ongoingRace === undefined) {
      return this.dispatch(eventActions.controlRace('start', obj, this.updateState))
    }
  }
  handleResetRace () {
    this.dispatch(eventActions.controlRace('reset', {id: this.state.races[this.state.raceSelected].id}, this.updateState))
  }
  handleEndRace () {
    this.dispatch(eventActions.controlRace('end', {id: this.state.races[this.state.raceSelected].id}, this.updateState))
  }
  handleSubmitResult () {
    this.dispatch(eventActions.submitRaceResult(this.state.races[this.state.raceSelected].id))
  }
  handleSelect (index) { return (e) => {
    this.setState({ raceSelected: index})
  }}
  render () {
    const { location, event, match } = this.props
    const { counter, races, raceSelected, groupNames, readerStatus, dialog, ongoingRace, countdown } = this.state
    if (event === -1 || !match.params.id) { return <Redirect to={{pathname: '/console'}} /> }
    else if (!event) { return <div><Header location={location} nav='event' match={match} /><div className={css.loading}>Loading...</div></div> }

    return (<div className={css.wrap}><Header location={location} nav='event' match={match} />
      <div className={css.mainBody}>
        <div className={css.info}>
          <h2>{event.nameCht}（ID: {event.id}）</h2>
          <span className={css.btn}>
            {render.readerStatusBtn({ongoingRace, readerStatus, handleControlReader: this.handleControlReader})}
          </span>
        </div>
        <div className={css.managerList}>
          <div>
            <div className={css.hd}><Button style='short' text='編輯賽程' /></div>
            <ul className={css.ul} style={{height: this.state.listHeight}}>{races.map((race, index) => render.raceList({race, index, raceSelected, groupNames, handleSelect: this.handleSelect}))}
            </ul>
          </div>
            <div>{(raceSelected !== -1) && <span>
              <div className={css.hd}>{render.raceCtrl({ races, raceSelected, readerStatus, ongoingRace, handleUpdateDialog: this.handleUpdateDialog, handleEndRace: this.handleEndRace })}</div>
              <ul className={css.ul} style={{height: this.state.listHeight}}></ul>
            </span>}</div>
        </div>
      </div>
      {dialog && <Dialogue content={render.dialog[dialog]({ countdown, counter, handleStartRace: this.handleStartRace, handleUpdateDialog: this.handleUpdateDialog, handleChangeCountdown: this.handleChangeCountdown, handleResetRace: this.handleResetRace, handleEndRace: this.handleEndRace, handleSubmitResult: this.handleSubmitResult })} />}
    </div>)
  }
}
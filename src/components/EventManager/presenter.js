import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators as eventActions } from '../../ducks/event'
// import { actionCreators as racerActions } from '../../ducks/racer'

import css from './style.css'
import { Dialogue } from '../Dialogue/presenter'
import Button from '../Button'
import Header from '../Header'
import AdvRule from '../AdvRule'
import AssignReg from '../AssignReg'
import { renderInput } from '../Table/presenter'

const valueFunc = (modified, original, field) => (modified && modified[field] !== undefined) ? modified[field] : original[field]
const returnDateTime = (timestamp, forDisplay) => {
  const t = new Date(timestamp + 28800000) // taipei diff
  return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2) + (forDisplay ? ' ' : 'T') + ('0' + t.getUTCHours()).slice(-2) + ':' + ('0' + t.getUTCMinutes()).slice(-2) // yyyy-mm-ddThh:mm
}
const returnListArray = {
  group: (groups, state) => groups,
  race: (groups, state) => (state.groupSelected === -1) ? undefined : groups[state.groupSelected].races,
  reg: (groups, state) => (state.groupSelected === -1) ? undefined : ((state.raceSelected === -1) ? groups[state.groupSelected].registrations : groups[state.groupSelected].races[state.raceSelected].registrations)
}
const validateRfid = ({input, event, pacerEpc}) => {
  if (pacerEpc && input === pacerEpc) {
    return false
  }
  for (let i = 0; i < event.groups.length; i += 1) {
    for (let j = 0; j < event.groups[i].registrations.length; j += 1) {
      if (event.groups[i].registrations[j].epc === input) {
        return false
      }
    }
  }
  return true
}
const returnInputs = {
  event: (modified, original) => [
    {label: '中文名稱', field: 'nameCht', type: 'text'},
    {label: '英文名稱', field: 'name', type: 'text'},
    {label: '地點', field: 'location', type: 'text'},
    {label: '跑道長度(公尺)', field: 'lapDistance', type: 'number'},
    {label: '開始時間', field: 'startTime', type: 'datetime', value: (modified && modified.startTime) ? modified.startTime : returnDateTime(original.startTime)},
    {label: '結束時間', field: 'endTime', type: 'datetime', value: (modified && modified.endTime) ? modified.endTime : returnDateTime(original.endTime)},
    {label: '公開活動', field: 'isPublic', type: 'checkbox'},
    {label: '隊伍報名', field: 'isTeamRegistrationOpen', type: 'checkbox'},
    {label: '個人報名', field: 'isRegistrationOpen', type: 'checkbox'},
    {label: '地下活動', field: 'isIndieEvent', type: 'checkbox', value: true}
  ],
  group: () => [
    {label: '中文名稱', field: 'nameCht', type: 'text'},
    {label: '英文名稱', field: 'name', type: 'text'},
    {label: '名額', field: 'racerNumberAllowed', type: 'number'}
  ],
  race: () => [
    {label: '中文名稱', field: 'nameCht', type: 'text'},
    {label: '英文名稱', field: 'name', type: 'text'},
    {label: '名額', field: 'racerNumberAllowed', type: 'number'},
    {label: '圈數', field: 'laps', type: 'number'},
    {label: '組別初賽', field: 'isEntryRace', type: 'checkbox'},
    {label: '組別決賽', field: 'isFinalRace', type: 'checkbox'},
    {label: '需前導車', field: 'requirePacer', type: 'checkbox'}
  ],
  reg: () => [
//    {label: '選手 ID', field: 'racer', type: 'number', disabled: true},
    {label: '稱呼方式', field: 'name', type: 'text'},
    {label: '選手號碼', field: 'raceNumber', type: 'number'}
  ]
}
const title = { event: '活動', group: '組別', race: '賽事', reg: '選手' }
const lists = ['group', 'race', 'reg']
const render = {
  delete: (model, original, onDelete) => (
    (model === 'event' && original.groups.length === 0) ||
    (model === 'group' && original.races.length === 0 && original.registrations.length === 0) ||
    (model === 'race' && original.registrations.length === 0) ||
    (model === 'reg'))
    ? <Button style='alert' onClick={onDelete(model)} text='刪除' />
    : <Button style='disabled' text='刪除' />,
  li: {
    group: (V, I, selected, onSelect) => <li className={selected === I ? css.selected : css.li} key={'li_' + V.id}>
      <button className={css.list} onClick={onSelect('group', I)}>
        {V.nameCht ? V.nameCht : V.name}
        <span className={css.count}>{(V.registrations ? V.registrations.length : 0) + '/' + V.racerNumberAllowed}</span>
      </button>
    </li>,
    race: (V, I, selected, onSelect) => <li className={selected === I ? css.selected : css.li} key={'li_' + V.id}>
      <button className={css.list} onClick={onSelect('race', I)}>
        {V.nameCht ? V.nameCht : V.name}
        <ul className={css.lights}>
          <li className={V.requirePacer ? css.on : css.off}>前導</li>
          <li className={V.isEntryRace ? css.on : css.off}>初賽</li>
          {V.isFinalRace ? <li className={css.on}>決賽</li> : <li className={V.advancingRules.length > 0 ? css.on : css.off}>晉級</li>}
        </ul>
        <span className={css.count}>{(V.registrations ? V.registrations.length : 0) + '/' + V.racerNumberAllowed}</span>
      </button>
    </li>,
    reg: (V, I, selected, onSelect) => <li className={selected === I ? css.selected : css.li} key={'li_' + V.id}>
      <button className={css.list} onClick={onSelect('reg', I)}>
        <span className={css.raceNumber}>{V.raceNumber}</span>
        {(V.name) ? V.name : V.id}
        <span className={css.toRight}>
          <ul className={css.lights}>
            <li className={V.epc ? css.on : css.off}>RFID</li>
          </ul>
        </span>
      </button>
    </li>
  },
  ctrl: {
    group: (selected, array, handleStartEdit) => <span className={css.right}>
      {selected !== -1 && <span>
        <Button style='short' text='編輯' onClick={handleStartEdit('group', array[selected])} />
      </span>}
      <Button style='short' text='新增' onClick={handleStartEdit('group', {})} />
    </span>,
    race: (selected, array, handleStartEdit) => <span className={css.right}>
      {array && <span>
        {selected !== -1 && <Button style='short' text='編輯' onClick={handleStartEdit('race', array[selected])} /> }
        <Button style='short' text='新增' onClick={handleStartEdit('race', {})} />
        <Button style='short' text='晉級規則' onClick={handleStartEdit('advRules', array)} />
      </span>}
    </span>,
    reg: (selected, array, handleStartEdit) => <span className={css.right}>
      {array && <span>
        <Button style='short' text='新增' onClick={handleStartEdit('reg', {})} />
        <Button style='short' text='選手分組' onClick={handleStartEdit('assignReg', array)} />
        {selected !== -1 && <Button style='short' text='編輯' onClick={handleStartEdit('reg', array[selected])} />}
      </span>}
    </span>
  },
  listHd: ({model, state, array, handleStartEdit}) => <div className={css.hd} key={'listHd' + model}>
    <span>{title[model]}</span>
    {render.ctrl[model](state[model + 'Selected'], array, handleStartEdit)}
  </div>,
  list: ({model, array, state, onSelect}) => <div key={'list' + model}>
    <ul className={css.ul}>{array && array.map((V, I) => (render.li[model](V, I, state[model + 'Selected'], onSelect)))}</ul>
  </div>,
  event: ({event, onEdit}) => <div className={css.info}>
    <h2>{event.nameCht} <span className={css.btn}><Button style='short' text='編輯' onClick={onEdit} /></span>
    </h2>
    <h3>{event.name} <span className={css.time}>{event.startTime && returnDateTime(event.startTime, true)}{event.endTime && ' - ' + returnDateTime(event.endTime, true)}</span></h3>
    <ul className={css.lights}>
      <li className={event.isPublic ? css.on : css.off}>公開活動</li>
      <li className={event.isTeamRegistrationOpen ? css.on : css.off}>隊伍報名</li>
      <li className={event.isRegistrationOpen ? css.on : css.off}>個人報名</li>
      <li className={event.isIndieEvent ? css.on : css.off}>地下活動</li>
      <li className={event.pacerEpc ? css.on : css.off}>前導車RFID</li>
    </ul>
  </div>,
  infoForm: ({model, modified, original, onChange, onSubmit, onCancel, onDelete, rfidForm}) => <div className={css.form}>
    <h3>{original.id ? '編輯' : '新增'}{title[model]}</h3>
    <ul>{ returnInputs[model](modified, original).map((V, I) => <li key={'in_' + I}><label>{V.label}</label>{ renderInput[V.type]({ onChange: onChange(V.field), value: ((V.value) ? V.value : valueFunc(modified, original, V.field)), disabled: V.disabled }) }</li>) }</ul>
    {rfidForm}
    <div className={css.boxFt}>
      {modified ? <Button text='儲存' onClick={onSubmit(model)} /> : <Button style='disabled' text='儲存' />}
      {original.id && render.delete(model, original, onDelete)}
      <Button style='grey' onClick={onCancel} text='取消' />
    </div>
  </div>,
  rfidForm: {
    event: ({original, modified, handleInputRfid, rfidMessage}) => {
      const pacerEpc = (modified && modified.pacerEpc !== undefined) ? modified.pacerEpc : original.pacerEpc
      return <div>{rfidMessage && <h4 className={css.forbidden}>{rfidMessage}</h4>}<ul>
        <li>
          <label>前導車ID</label>
          <input type='text' value={pacerEpc} onChange={handleInputRfid('pacerEpc')} />
        </li>
      </ul></div>
    },
    reg: ({original, modified, handleInputRfid, rfidMessage}) => {
      const epc = (modified && modified.epc !== undefined) ? modified.epc : original.epc
      return <div>{rfidMessage && <h4 className={css.forbidden}>{rfidMessage}</h4>}
        <label>RFID</label>
        <input type='text' value={epc} onChange={handleInputRfid('epc')} />
      </div>
    }
  }
}
let isRfidReader = false
export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      model: undefined,
      modified: undefined,
      original: undefined,
      groupSelected: -1,
      raceSelected: -1,
      regSelected: -1,
      rfidMessage: undefined
    }
    this.dispatch = this.props.dispatch
    this._bind('handleStartEdit', 'handleKeypress', 'handleKeyup', 'handleCancelEdit', 'handleDelete', 'handleSubmit', 'handleInput', 'handleInputRfid', 'handleSelect')
  }
  componentDidMount () {
    const onSuccess = () => this.setState({model: 'event', original: {}})
    const isMobile = (window.navigator.userAgent.indexOf('Android') !== -1)
    if (isMobile) {
      window.addEventListener('keypress', this.handleKeypress)
      window.addEventListener('keyup', this.handleKeyup)
    }
    if (this.props.match.params.id === 'new') {
      this.dispatch(eventActions.getEvent(this.props.match.params.id, onSuccess))
    } else {
      this.dispatch(eventActions.getEvent(this.props.match.params.id))
    }
//    this.dispatch(racerActions.getRacers())
  }
  componentWillUnmount () {
    window.removeEventListener('keypress', this.handleKeypress)
    window.removeEventListener('keyup', this.handleKeyup)
  }
  handleKeypress () {
    isRfidReader = true
  }
  handleKeyup () {
    isRfidReader = false
  }
  handleStartEdit (model, object) {
    return (e) => {
      this.setState({model: model, original: object})
    }
  }
  handleCancelEdit () {
    if (this.props.match.params.id === 'new') { window.location = '/console' }
    this.setState({model: undefined, modified: undefined, original: undefined})
  }
  handleDelete (model) {
    return (e) => {
      let stateObj = {model: undefined, modified: undefined, original: undefined}
      const onSuccess = () => this.setState(stateObj)
      stateObj[model + 'Selected'] = -1
      this.dispatch(eventActions.delete(this.state, onSuccess))
    }
  }
  handleInput (field) {
    return (e) => {
      if (!isRfidReader) {
        const val = (e.target.value === 'true' || e.target.value === 'false' || e.target.value === 'on') ? (e.target.value !== 'true') : e.target.value
        this.setState({ modified: (this.state.modified ? { ...this.state.modified, [field]: val } : { [field]: val }) })
      }
    }
  }
  handleInputRfid (field, index) {
    return (e) => {
      const value = e.target.value
      if (index !== undefined) {
        let stateObj = {modified: {...this.state.modified}}
        stateObj.modified[field][index] = value
        this.setState(stateObj)
      } else {
        this.setState({ modified: (this.state.modified ? { ...this.state.modified, [field]: value } : { [field]: value }) })
      }
    }
  }
  handleSubmit (model) {
    return (e) => {
      let stateObj = {model: undefined, modified: undefined, original: undefined, rfidMessage: undefined}
      let state = {...this.state}
      let onSuccess = () => this.setState(stateObj)
      let validateResult = true
      if (!state.original.id) {
        switch (model) {
          case 'event':
            stateObj.model = -1
            break
          case 'group':
            state.modified.event = this.props.event.id
            state.groupSelected = stateObj.groupSelected = this.props.event.groups.length
            break
          case 'race':
            state.modified.group = this.props.event.groups[this.state.groupSelected].id
            state.raceSelected = stateObj.raceSelected = this.props.event.groups[this.state.groupSelected].races.length
            break
          case 'reg':
            state.modified.group = this.props.event.groups[this.state.groupSelected].id
            state.regSelected = stateObj.regSelected = this.props.event.groups[this.state.groupSelected].registrations.length
            stateObj.raceSelected = -1
            break
        }
      }
      if (model === 'event') {
        if (state.modified.pacerEpc) {
          validateResult = validateRfid({input: state.modified.pacerEpc, event: this.props.event})
          if (!validateResult) {
            return this.setState({rfidMessage: '重複的RFID: ' + state.modified.pacerEpc})
          }
        }
      } else if (model === 'reg') {
        validateResult = validateRfid({input: state.modified.epc, event: this.props.event, pacerEpc: this.props.event.pacerEpc})
        if (!validateResult) {
          return this.setState({rfidMessage: '重複的RFID: ' + state.modified.epc})
        }
      }
      this.dispatch(eventActions.submit(state, onSuccess))
    }
  }
  handleSelect (model, index) {
    return (e) => {
      switch (model) {
        case 'group':
          return this.setState({ groupSelected: (this.state.groupSelected === index) ? -1 : index, raceSelected: -1, regSelected: -1 })
        case 'race':
          return this.setState({ raceSelected: (this.state.raceSelected === index) ? -1 : index, regSelected: -1 })
        case 'reg':
          return this.setState({ regSelected: (this.state.regSelected === index) ? -1 : index })
      }
    }
  }
  render () {
    const { location, event, match } = this.props
    const { modified, original, model, groupSelected, rfidMessage } = this.state
    if (!match.params.id) { return <Redirect to={{pathname: '/console'}} /> } else if (!event) { return <div><Header location={location} nav='event' match={match} /><div className={css.loading}>Loading...</div></div> } else if (model === -1) { return <Redirect to={{pathname: '/console/event/' + event.id}} /> }

    return (<div className={model ? css.fixed : css.wrap}><Header location={location} nav='event' match={match} />
      <div className={css.mainBody}>
        {render.event({event, onEdit: this.handleStartEdit('event', event)})}
        <div className={css.listHds}>{lists.map(V => (render.listHd({model: V, array: returnListArray[V](this.props.event.groups, this.state), state: this.state, handleStartEdit: this.handleStartEdit})))}
        </div>
        <div className={css.managerList}>
          {lists.map(V => (render.list({model: V, array: returnListArray[V](this.props.event.groups, this.state), state: this.state, onSelect: this.handleSelect, handleStartEdit: this.handleStartEdit})))}
        </div>
      </div>
      {model && <Dialogue content={(model === 'advRules')
        ? <AdvRule races={event.groups[groupSelected].races} handleCancelEdit={this.handleCancelEdit} />
        : ((model === 'assignReg')
          ? <AssignReg groupIndex={groupSelected} group={event.groups[groupSelected]} handleCancelEdit={this.handleCancelEdit} />
          : render.infoForm({ model, modified, original, onChange: this.handleInput, onSubmit: this.handleSubmit, onCancel: this.handleCancelEdit, onDelete: this.handleDelete, rfidForm: (render.rfidForm[model]) ? render.rfidForm[model]({ modified, original, rfidMessage, handleInputRfid: this.handleInputRfid }) : '' }))
        } /> }
    </div>)
  }
}

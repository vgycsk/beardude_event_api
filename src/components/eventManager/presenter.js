import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators as eventActions} from '../../ducks/event'
import { actionCreators as racerActions } from '../../ducks/racer'

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
  return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2) + (forDisplay ? ' ' : 'T') + ('0' + t.getUTCHours()).slice(-2) + ':' + ('0' + t.getUTCMinutes()).slice(-2) //yyyy-mm-ddThh:mm
}

const returnListHeight = ({pageHeight = 360, ftHeight = 211}) => Math.max(window.innerHeight - ftHeight, (pageHeight - ftHeight))
const returnListArray = {
  group: (groups, state) => groups,
  race: (groups, state) => (state.groupSelected === -1) ? undefined : groups[state.groupSelected].races,
  reg: (groups, state) => (state.groupSelected === -1) ? undefined : ( (state.raceSelected === -1) ? groups[state.groupSelected].registrations : groups[state.groupSelected].races[state.raceSelected].registrations)
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
    {label: '稱呼方式', field: 'name', type: 'text'}
  ]
}
const title = { event: '活動', group: '組別', race: '賽事', reg: '選手賽籍' }
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
    group: (V, I, selected, onSelect) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}>
      <button className={css.list} onClick={onSelect('group', I)}>
        {V.nameCht ? V.nameCht : V.name}
        <span className={css.count}>{(V.registrations ? V.registrations.length : 0) + '/' + V.racerNumberAllowed}</span>
      </button>
    </li>,
    race: (V, I, selected, onSelect) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}>
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
    reg: (V, I, selected, onSelect) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}>
      <button className={css.list} onClick={onSelect('reg', I)}>{(V.name) ? V.name : V.id}</button>
    </li>
  },
  ft: {
    group: (selected, array, handleStartEdit) => <span>
      <Button style='listFtIcon' text='+' onClick={handleStartEdit('group', {})} />
      {selected !== -1 && <span>
        <Button style='listFt' text='編輯' onClick={handleStartEdit('group', array[selected])} />
      </span>}
    </span>,
    race: (selected, array, handleStartEdit) => <span>
      {array && <span>
        <Button style='listFtIcon' text='+' onClick={handleStartEdit('race', {})} />
        <Button style='listFt' text='編輯晉級規則' onClick={handleStartEdit('advRules', array)} />
        {selected !== -1 && <Button style='listFt' text='編輯' onClick={handleStartEdit('race', array[selected])} /> }
      </span>}
    </span>,
    reg: (selected, array, handleStartEdit) => <span>
      {array && <span>
        <Button style='listFtIcon' text='+' onClick={handleStartEdit('reg', {})} />
        <Button style='listFt' text='選手分組' onClick={handleStartEdit('assignReg', array)} />
        {selected !== -1 && <Button style='listFt' text='編輯' onClick={handleStartEdit('reg', array[selected])} />}
      </span>}
    </span>
  },
  list: ({model, array, state, onSelect, handleStartEdit}) => <div key={'list' + model}><h3>{title[model]}</h3>
  <ul className={css.ul} style={{height: state.listHeight}}>{array && array.map((V, I) => (render.li[model](V, I, state[model + 'Selected'], onSelect)))}</ul>
    <span className={css.listFt}>{render.ft[model](state[model + 'Selected'], array, handleStartEdit)}</span>
  </div>,
  event: ({event, onEdit}) => <div className={css.info}>
    <h2>{event.nameCht}</h2>
    <h3>{event.name} <span className={css.time}>{returnDateTime(event.startTime, true)} - {returnDateTime(event.endTime, true)}</span></h3>
    <ul className={css.lights}>
      <li className={event.isPublic ? css.on : css.off}>公開活動</li>
      <li className={event.isTeamRegistrationOpen ? css.on : css.off}>隊伍報名</li>
      <li className={event.isRegistrationOpen ? css.on : css.off}>個人報名</li>
      <li className={event.isIndieEvent ? css.on : css.off}>地下活動</li>
    </ul>
    <span className={css.btn}><Button text='編輯' onClick={onEdit} /></span>
  </div>,
  infoForm: ({model, table, modified, original, onChange, onSubmit, onCancel, onDelete}) => <div className={css.form}>
    <h3>{original.id ? '編輯' : '新增'}{title[model]}</h3>
    <ul>{returnInputs[model](modified, original).map((V, I) => <li key={'in_' + I}><label>{V.label}</label>{renderInput[V.type]({onChange: onChange(V.field), value: ((V.value) ? V.value : valueFunc(modified, original, V.field)), disabled: V.disabled })}</li>)}</ul>
    <div className={css.boxFt}>
      {modified ? <Button text='儲存' onClick={onSubmit(model)} /> : <Button style='disabled' text='儲存'/>}
      {original.id && render.delete(model, original, onDelete)}
      <Button style='grey' onClick={onCancel} text='取消'/>
    </div>
  </div>
}
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
      listHeight: returnListHeight({})
    }
    this.dispatch = this.props.dispatch
    this._bind('handleStartEdit', 'handleCancelEdit', 'handleDelete', 'handleResize', 'handleSubmit', 'handleInput', 'handleSelect')
  }
  componentDidMount () {
    const onSuccess = () => this.setState({model: 'event', original: {}})
    window.addEventListener('resize', this.handleResize);
    this.dispatch(eventActions.getEvent(this.props.match.params.id, onSuccess))
    this.dispatch(racerActions.getRacers())
  }
  handleResize () {
    this.setState({ listHeight: returnListHeight({}) })
  }
  handleStartEdit (model, object) { return (e) => {
    this.setState({model: model, original: object})
  }}
  handleCancelEdit () {
    this.setState({model: undefined, modified: undefined, original: undefined})
  }
  handleDelete (model) { return (e) => {
    let stateObj = {model: undefined, modified: undefined, original: undefined}
    const onSuccess = () => this.setState(stateObj)
    stateObj[model + 'Selected'] = -1
    this.dispatch(eventActions.delete(this.state, onSuccess))
  }}
  handleInput (field) { return (e) => {
    const val = (e.target.value === 'true' || e.target.value === 'false' || e.target.value === 'on') ? (e.target.value === 'true' ? false : true) : e.target.value
    this.setState({modified: (this.state.modified ? {...this.state.modified, [field]: val } : {[field]: val})})
  }}
  handleSubmit (model) { return (e) => {
    let stateObj = {model: undefined, modified: undefined, original: undefined}
    let state = {... this.state}
    let onSuccess = () => this.setState(stateObj)
    if (!state.original.id) {
      switch (model) {
      case 'event':
        stateObj.model = -1
        break;
      case 'group':
        state.modified.event = this.props.event.id
        state.groupSelected = stateObj.groupSelected = this.props.event.groups.length
        break;
      case 'race':
        state.modified.group = this.props.event.groups[this.state.groupSelected].id
        state.raceSelected = stateObj.raceSelected = this.props.event.groups[this.state.groupSelected].races.length
        break;
      case 'reg':
        state.modified.group = this.props.event.groups[this.state.groupSelected].id
        state.regSelected = stateObj.regSelected = this.props.event.groups[this.state.groupSelected].registrations.length
        stateObj.raceSelected = -1
        break;
      }
    }
    this.dispatch(eventActions.submit(state, onSuccess))
  }}
  handleSelect (model, index) { return (e) => {
    let obj
    let stateObj
    const onSuccess = () => this.setState(stateObj)

    switch (model) {
    case 'group':
      obj = this.props.event.groups[index]
      stateObj = {groupSelected: (this.state.groupSelected === index) ? -1 : index, raceSelected: -1, regSelected: -1}
      break
    case 'race':
      obj = this.props.event.groups[this.state.groupSelected].races[index]
      stateObj = {raceSelected: (this.state.raceSelected === index) ? -1 : index, regSelected: -1}
      break
    case 'reg':
      stateObj = {regSelected: (this.state.regSelected === index) ? -1 : index}
      break
    }
    return onSuccess()
  }}
  render () {
    const { location, event } = this.props
    const { modified, original, model, groupSelected } = this.state
    if (event === -1) { return <Redirect to={{pathname: '/console'}} /> }
    else if (!event) { return <div><Header location={location} nav='event' /><div className={css.loading}>Loading...</div></div> }
    else if (model === -1) { return <Redirect to={{pathname: '/console/event/' + event.id}} /> }
    return (<div className={model ? css.fixed : css.wrap}><Header location={location} nav='event' />
      <div className={css.mainBody}>
        {render.event({event, onEdit: this.handleStartEdit('event', event)})}
        <div className={css.managerList}>
          {lists.map(V => ( render.list({model: V, array: returnListArray[V](this.props.event.groups, this.state), state: this.state, onSelect: this.handleSelect, handleStartEdit: this.handleStartEdit}) ))}
        </div>
      </div>
      {model && <Dialogue content={(model === 'advRules')
        ? <AdvRule races={event.groups[groupSelected].races} handleCancelEdit={this.handleCancelEdit} />
        : ((model === 'assignReg')
          ? <AssignReg groupIndex={groupSelected} group={event.groups[groupSelected]} handleCancelEdit={this.handleCancelEdit} />
          : render.infoForm({ model, modified, original, onChange: this.handleInput, onSubmit: this.handleSubmit, onCancel: this.handleCancelEdit, onDelete: this.handleDelete }))
        } /> }
    </div>)
  }
}
import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators } from '../../ducks/event'

import css from './style.css'
import { Dialogue } from '../Dialogue/presenter'
import Button from '../Button'
import Header from '../Header'
import { renderInput } from '../Table/presenter'

const valueFunc = (modified, original, field) => (modified && modified[field] !== undefined) ? modified[field] : original[field]
const returnDateTime = (timestamp, forDisplay) => {
  const t = new Date(timestamp + 28800000) // taipei diff
  return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2) + (forDisplay ? ' ' : 'T') + ('0' + t.getUTCHours()).slice(-2) + ':' + ('0' + t.getUTCMinutes()).slice(-2) //yyyy-mm-ddThh:mm
}
const returnListHeight = ({pageHeight = 360, ftHeight = 211}) => Math.max(window.innerHeight - ftHeight, (pageHeight - ftHeight));
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
    {label: '個人報名', field: 'isRegistrationOpen', type: 'checkbox'}
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
    {label: '需前導車', field: 'requirePacer', type: 'checkbox'}
  ]
}
const title = { event: '活動', group: '組別', race: '賽事' }
const render = {
  delete: (model, original, onDelete) => {
    if ( (model === 'event' && original.groups.length === 0) ||
      (model === 'group' && original.races.length === 0 && original.registrations.length === 0) ||
      (model === 'race' && original.registrations.length === 0) ) {
      return <Button style='alert' onClick={onDelete(model)} text='刪除' />
    }
    return <Button style='disabled' text='刪除' />
  },
  info: ({event, onEdit}) => <div className={css.info}>
    <h2>{event.nameCht}</h2>
    <h3>{event.name} <span className={css.time}>{returnDateTime(event.startTime, true)} - {returnDateTime(event.endTime, true)}</span></h3>
    <ul className={css.lights}>
      <li className={event.isPublic ? css.on : css.off}>公開活動</li>
      <li className={event.isTeamRegistrationOpen ? css.on : css.off}>隊伍報名</li>
      <li className={event.isRegistrationOpen ? css.on : css.off}>個人報名</li>
    </ul>
    <span className={css.btn}><Button text='編輯' onClick={onEdit} /></span>
  </div>,
  ft: (selected, model, onEdit, editObj) => <span className={css.listFt}>
  <Button style='listFtIcon' text='+' onClick={onEdit(model, {})} /> {selected !== -1 && <Button style='listFt' text='編輯' onClick={onEdit(model, editObj)} />}</span>,
  ftBlank: () => <span className={css.listFt}></span>,
  list: ({array, selected, onSelect, listHeight}) => <ul style={{height: listHeight}}>{array.map((V, I) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}><Button style='listDark' text={V.nameCht ? V.nameCht : V.name} counter={(V.registrations ? V.registrations.length : 0) + '/' + V.racerNumberAllowed} onClick={onSelect(I)} /></li>)}</ul>,
  overlay: ({model, modified, original, onChange, onSubmit, onCancel, onDelete}) => <div>
  <h3>{original.id ? '編輯' : '新增'}{title[model]}</h3>
    <ul>{returnInputs[model](modified, original).map((V, I) => <li key={'in_' + I}><label>{V.label}</label>{renderInput[V.type]({onChange: onChange(V.field), value: ((V.value) ? V.value : valueFunc(modified, original, V.field)) })}</li>)}</ul>
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
      listHeight: returnListHeight({})
    }
    this.dispatch = this.props.dispatch
    this._bind('handleStartEdit', 'handleCancelEdit', 'handleDelete', 'handleResize', 'handleSubmit', 'handleInput', 'handleSelectGroup', 'handleSelectRace', 'deleteEventHandler', 'dragStartHandler', 'dragOverHandler', 'dragEndHandler')
  }
  componentDidMount () {
    const onSuccess = () => this.setState({model: 'event', original: {}})
    window.addEventListener('resize', this.handleResize);
    this.dispatch(actionCreators.getEvent(this.props.match.params.id, onSuccess))
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
    this.dispatch(actionCreators.delete(this.state, onSuccess))
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
      }
    }
    this.dispatch(actionCreators.submit(state, onSuccess))
  }}
  handleSelectRace (index) { return (e) => {
    this.setState({raceSelected: (this.state.raceSelected === index) ? -1 : index})
  }}
  handleSelectGroup (index) { return (e) => {
    this.setState({groupSelected: (this.state.groupSelected === index) ? -1 : index, raceSelected: -1})
  }}
  dragStartHandler (E) {
    console.log(`drag start - ${E.currentTarget.dataset.id}`)
    this.dragItem = {
      name: E.currentTarget.dataset.group,
      id: E.currentTarget.dataset.id
    }
    E.dataTransfer.effectAllowed = 'move'
    E.dataTransfer.setData('text/html', null)
  }
  dragOverHandler (E) {
    E.preventDefault()
    const over = E.currentTarget
    if ((over.dataset.group !== this.dragItem.name) &&
      (E.clientY - over.offsetTop) > (over.offsetHeight / 2) &&
      ((E.clientX - over.offsetLeft) > (over.offsetWidth / 2))) {
      this.overItem = {
        name: over.dataset.group,
        id: over.dataset.id}
    }
    console.log(`drag over event`)
  }
  dragEndHandler (E) {
    console.log(`drag end -> ${this.dragItem} over ${this.overItem}`)
    if (this.overItem && (this.dragItem.name + this.dragItem.id !== this.overItem.name + this.overItem.id)) {
      this.alertMsg = `${this.dragItem.name}-${this.dragItem.id} to ${this.overItem.name}-${this.overItem.id} ?`
      this.setState({
        showDialogue: 1
      })
    }
  }
  deleteEventHandler (E) {
    E.preventDefault()
    console.log(`delete ${E.currentTarget.dataset.name} - ${E.currentTarget.parentNode.dataset.id}`)
  }
  render () {
    const { location, event } = this.props
    const { listHeight, modified, original, model, groupSelected, raceSelected } = this.state
    if (event === -1) {
      return <Redirect to={{pathname: '/console'}} />
    } else if (!event) {
      return <div><Header location={location} nav='event' /><div className={css.loading}>Loading...</div></div>
    } else if (model === -1) {
      return <Redirect to={{pathname: '/console/event/' + event.id}} />
    }
    return (<div className={model ? css.fixed : css.wrap}><Header location={location} nav='event' />
      <div className={css.mainBody}>
        {render.info({event, onEdit: this.handleStartEdit('event', event)})}
        <div className={css.managerList}>
          <div><h3>組別</h3>
            {event.groups && render.list({array: event.groups, listHeight, selected: groupSelected, onSelect: this.handleSelectGroup})}
            {render.ft(groupSelected, 'group', this.handleStartEdit, event.groups[groupSelected])}
          </div>
          <div><h3>組別賽制</h3>
            {groupSelected !== -1 && render.list({array: event.groups[groupSelected].races, listHeight, selected: raceSelected, onSelect: this.handleSelectRace})}
            {groupSelected !== -1 ? render.ft(raceSelected, 'race', this.handleStartEdit, event.groups[groupSelected].races[raceSelected]) : render.ftBlank()}
          </div>
          <div><h3>選手賽籍</h3></div>
        </div>
      </div>
      <Dialogue content={model && render.overlay({model, modified, original, onChange: this.handleInput, onSubmit: this.handleSubmit, onCancel: this.handleCancelEdit, onDelete: this.handleDelete})} />
    </div>)
  }
}

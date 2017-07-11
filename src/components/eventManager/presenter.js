import React from 'react'
import BaseComponent from '../BaseComponent'
import classes from 'classnames'
import { actionCreators } from '../../ducks/event'

import css from './style.css'
import { Dialogue } from '../Dialogue/presenter'
import Button from '../Button'
import Header from '../Header'
import Footer from '../Footer'

const valueFunc = (state, store, field) => (state && state[field] !== undefined) ? state[field] : store[field]
const returnDateTime = (timestamp) => {
  const t = new Date(timestamp + 28800000) // taipei diff
  return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2) + 'T' + ('0' + t.getUTCHours()).slice(-2) + ':' + ('0' + t.getUTCMinutes()).slice(-2) //yyyy-mm-ddThh:mm
}
const nameInputs = [{label: '活動名稱（中）', field: 'nameCht'}, {label: '名稱（英）', field: 'name'}, {label: '地點', field: 'location'}]
const timeInputs = [{label: '開始時間', field: 'startTime'},{label: '結束時間', field: 'endTime'}]
const checkInputs = [{label: '公開活動', field: 'isPublic'}, {label: '開放隊伍報名', field: 'isTeamRegistrationOpen'}, {label: '開放個人報名', field: 'isRegistrationOpen'}]
const groupInfo = [{label: '名稱 (中)', field: 'nameCht'}, {label: '名稱 (英)', field: 'name'}, {label: '名額', field: 'racerNumberAllowed', type: 'number'}]
const raceInfo = [{label: '名稱 (中)', field: 'nameCht'}, {label: '名稱 (英)', field: 'name'}, {label: '名額', field: 'racerNumberAllowed', type: 'number'}, {label: '圈數', field: 'laps', type: 'number'} ]

const renderInfo = (eventInEdit, selectedEvent, onChange, submit) => <section><ul>
  <li>{nameInputs.map((val, i) => <span key={'name-' + i}><label>{val.label}</label><input type='text' value={valueFunc(eventInEdit, selectedEvent,val.field)} onChange={onChange(val.field)} /></span>)}</li>
  <li>{timeInputs.map((val, i) => <span key={'time-' + i}><label>{val.label}</label><input type='datetime-local' value={(eventInEdit && eventInEdit[val.field]) ? eventInEdit[val.field] : returnDateTime(selectedEvent[val.field])} onChange={onChange(val.field)} /></span>)}</li>
  <li>{checkInputs.map((val, i) => <span key={'time-' + i}><label>{val.label}</label><input type='checkbox' checked={valueFunc(eventInEdit, selectedEvent,val.field)} value={valueFunc(eventInEdit, selectedEvent,val.field)} onChange={onChange(val.field)} /></span>)}<span className={css.right}>{ (eventInEdit) ? <Button text='儲存' onClick={submit()} /> : <Button text='儲存' style='disabled' /> }</span>
</li>
</ul></section>
const renderList = (inputs, array, selected, inEdit, onChange, onSelect) => <ul>
  {array.map((V, I) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}>{((selected === I) && inEdit)
    ? <span>{inputs.map((V, I) => <input key={'input_' + I} type={V.type ? V.type : 'text'} placeholder={V.label} value={inEdit[V.field] ? inEdit[V.field] : array[selected][V.field]} onChange={onChange(V.field)}/>)}</span>
    : <Button style='list' text={V.nameCht ? V.nameCht : V.name} counter={V.registrations.length + '/' + V.racerNumberAllowed} onClick={onSelect(I)}/>
  }</li>)}
</ul>
const renderFt = (inEdit, selected, onSubmit, onCancel, onDelete, onAdd, onEdit) => <span>{inEdit
  ? <span><Button style='listFt' text='儲存' onClick={onSubmit} /><Button style='listFt' text='取消' onClick={onCancel}/><span className={css.right}><Button style='listFtAlert' text='刪除' onClick={onDelete} /></span></span>
  : <span><Button style='listFtIcon' text='+' onClick={onAdd} /> {selected !== -1 && <span className={css.right}><Button style='listFt' text='編輯' onClick={onEdit} /></span>}</span> }</span>

export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      eventinEdit: undefined,
      groupInEdit: undefined,
      groupSelected: -1,
      raceInEdit: undefined,
      raceSelected: -1,
      showDialogue: 0,
      dialoguePosHandler: null
    }
    this.dispatch = this.props.dispatch
    this._bind('handleAddGroup', 'handleAddRace', 'handleCancelAddGroup', 'handleCancelAddRace', 'handleDeleteGroup', 'handleDeleteRace', 'handleEditGroup', 'handleEditRace', 'handleInputEvent', 'handleSubmitEvent', 'handleSubmitGroup', 'handleSubmitRace', 'handleSelectGroup', 'handleSelectRace', 'deleteEventHandler', 'dragStartHandler', 'dragOverHandler', 'dragEndHandler', 'dialogueNagitiveHandler')
  }
  componentDidMount () {
    this.dispatch(actionCreators.getSelectedEvent(this.props.match.params.id || 'new'))
  }
  handleAddGroup () {
    const onSuccess = () => this.setState({groupSelected: this.props.selectedEvent.groups.length - 1, groupInEdit: {event: this.props.selectedEvent.id}})
    this.dispatch(actionCreators.addGroup(onSuccess))
  }
  handleAddRace () {
    const group = this.props.selectedEvent.groups[this.state.groupSelected]
    const onSuccess = () => this.setState({raceSelected: group.races.length - 1, raceInEdit: {group: group.id}})
    this.dispatch(actionCreators.addRace(this.state.groupSelected, onSuccess))
  }
  handleCancelAddGroup () {
    const onSuccess = () => this.setState({groupSelected: - 1, groupInEdit: undefined})
    this.dispatch(actionCreators.cancelAddGroup(onSuccess))
  }
  handleCancelAddRace () {
    const onSuccess = () => this.setState({raceSelected: - 1, raceInEdit: undefined})
    this.dispatch(actionCreators.cancelAddRace(this.state.groupSelected, onSuccess))
  }
  handleDeleteGroup () {
    const group = this.props.selectedEvent.groups[this.state.groupSelected]
    if (group.registrations.length === 0 && group.races.length === 0) {
      const onSuccess = () => this.setState({groupSelected: - 1, groupInEdit: undefined})
      this.dispatch(actionCreators.deleteGroup(this.state.groupSelected, group.id, onSuccess))
    }
  }
  handleDeleteRace () {
    const race = this.props.selectedEvent.groups[this.state.groupSelected].races[this.state.raceSelected]
    if (race.registrations.length === 0) {
      const onSuccess = () => this.setState({raceSelected: - 1, raceInEdit: undefined})
      this.dispatch(actionCreators.deleteRace(this.state.groupSelected, this.state.raceSelected, race.id, onSuccess))
    }
  }
  handleEditGroup () {
    this.setState({groupInEdit: { id: this.props.selectedEvent.groups[this.state.groupSelected].id}})
  }
  handleEditRace () {
    this.setState({raceInEdit: { id: this.props.selectedEvent.groups[this.state.groupSelected].races[this.state.raceSelected].id}})
  }
  handleInputEvent (field) { return (e) => {
    let value = (e.target.value === 'true' || e.target.value === 'false') ? (e.target.value === 'true' ? false : true) : e.target.value
    this.setState({ eventInEdit: (this.state.eventInEdit) ? {...this.state.eventInEdit, [field]: value} : { id: this.props.selectedEvent.id, [field]: value } })
  }}
  handleInputGroup (field) { return (e) => {
    this.setState({ groupInEdit: (this.state.groupInEdit) ? {...this.state.groupInEdit, [field]: e.target.value} : {[field]: e.target.value}})
  }}
  handleInputRace (field) { return (e) => {
    this.setState({ raceInEdit: (this.state.raceInEdit) ? {...this.state.raceInEdit, [field]: e.target.value} : {[field]: e.target.value}})
  }}
  handleSelectRace (index) { return (e) => {
    this.setState({raceSelected: (this.state.raceSelected === index) ? -1 : index})
  }}
  handleSelectGroup (index) { return (e) => {
    if (!this.state.raceInEdit) {
      const onSuccess = () => this.setState({groupSelected: (this.state.groupSelected === index) ? -1 : index, raceSelected: -1})
      if (!this.props.selectedEvent.groups[index].races) {
         return this.dispatch(actionCreators.getGroup(this.props.selectedEvent.groups[index].id, index, onSuccess))
      }
      onSuccess()
    }
  }}
  handleSubmitEvent () {
    const onSuccess = () => this.setState({eventInEdit: undefined})
    this.dispatch(actionCreators.submitEvent(this.state.eventInEdit, onSuccess))
  }
  handleSubmitGroup () {
    const onSuccess = () => this.setState({groupInEdit: undefined})
    this.dispatch(actionCreators.submitGroup(this.state.groupInEdit, this.state.groupSelected, onSuccess))
  }
  handleSubmitRace () {
    const onSuccess = () => this.setState({raceInEdit: undefined})
    this.dispatch(actionCreators.submitRace(this.state.raceInEdit, this.state.groupSelected, this.state.raceSelected, onSuccess))
  }
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
  dialogueNagitiveHandler (E) {
    E.preventDefault()
    this.setState({
      showDialogue: 0
    })
  }
  render () {
    const { location, selectedEvent } = this.props
    const { eventInEdit, groupInEdit, groupSelected, raceInEdit, raceSelected, showDialogue } = this.state
    if (!selectedEvent) { return <div><Header location={location} nav='event' /><div className={css.loading}>Loading...</div></div> }
    return (<div>
      <Header location={location} nav='event' />
      <div className={css.mainBody}>
        {renderInfo(eventInEdit, selectedEvent, this.handleInputEvent, this.handleSubmitEvent)}
        <div className={css.managerList}>
          <div><h3>組別</h3>
            {renderList(groupInfo, selectedEvent.groups, groupSelected, groupInEdit, this.handleInputGroup, this.handleSelectGroup)}
            {renderFt(groupInEdit, groupSelected, this.handleSubmitGroup, this.handleCancelAddGroup, this.handleDeleteGroup, this.handleAddGroup, this.handleEditGroup)}
          </div>
          <div><h3>組別賽制</h3>
            {groupSelected !== -1 && selectedEvent.groups[groupSelected].races && renderList(raceInfo, selectedEvent.groups[groupSelected].races, raceSelected, raceInEdit, this.handleInputRace, this.handleSelectRace)}
            {(groupSelected !== -1) && renderFt(raceInEdit, raceSelected, this.handleSubmitRace, this.handleCancelAddRace, this.handleDeleteRace, this.handleAddRace, this.handleEditRace)}
          </div>
          <div><h3>選手賽籍</h3>
          </div>
        </div>
      </div>
      { <Dialogue {...{enable: showDialogue, msg: this.alertMsg, title: 'move event', nagitiveHandler: this.dialogueNagitiveHandler}} /> }
    </div>)
  }
}

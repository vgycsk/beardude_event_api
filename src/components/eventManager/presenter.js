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
const nameInputs = [{ label: '活動名稱（中）', field: 'nameCht'}, { label: '名稱（英）', field: 'name'}, { label: '地點', field: 'location'}]
const timeInputs = [{ label: '開始時間', field: 'startTime'},{ label: '結束時間', field: 'endTime'}]
const checkInputs = [{ label: '公開活動', field: 'isPublic'}, { label: '開放隊伍報名', field: 'isTeamRegistrationOpen'}, { label: '開放個人報名', field: 'isRegistrationOpen'}]
const renderInfo = (eventInEdit, selectedEvent, onChange, submit) => <section><ul>
  <li>{nameInputs.map((val, i) => <span key={'name-' + i}><label>{val.label}</label><input type='text' value={valueFunc(eventInEdit, selectedEvent,val.field)} onChange={onChange(val.field)} /></span>)}</li>
  <li>{timeInputs.map((val, i) => <span key={'time-' + i}><label>{val.label}</label><input type='datetime-local' value={(eventInEdit && eventInEdit[val.field]) ? eventInEdit[val.field] : returnDateTime(selectedEvent[val.field])} onChange={onChange(val.field)} /></span>)}</li>
  <li>{checkInputs.map((val, i) => <span key={'time-' + i}><label>{val.label}</label><input type='checkbox' checked={valueFunc(eventInEdit, selectedEvent,val.field)} value={valueFunc(eventInEdit, selectedEvent,val.field)} onChange={onChange(val.field)} /></span>)}<span className={css.right}>{ (eventInEdit) ? <Button text='儲存' onClick={submit()} /> : <Button text='儲存' style='disabled' /> }</span>
</li>
</ul></section>

const GroupList = ({groups, name, dragStart, dragOver, dragEnd, deleteHandler}) =>
  <ul>
    { groups.map((V, I) => <li key={`gp_${I}`} data-id={V.id} data-group={name} draggable='true' onDragStart={dragStart} onDragOver={dragOver} onDragEnd={dragEnd} ><span className={css.itemExpand}>{`${V.name} (?/${V.racerNumberAllowed})`}</span><span className={css.redTxt} onClick={deleteHandler}>delete</span></li>) }
  </ul>

export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    console.log(this.props)
    this.state = {
      eventinEdit: undefined,
      groupSelected: -1,
      raceSelected: -1,
      racerSelected: -1,
      groupInEdit: undefined,
      editPanel: 0,
      showDialogue: 0,
      dialoguePosHandler: null
    }
    this.dispatch = this.props.dispatch
    this._bind('handleAddGroup', 'handleCancelAddGroup', 'handleEditGroup', 'handleInputEvent', 'handleSubmitEvent', 'handleSubmitGroup', 'editPanelHandler', 'deleteEventHandler', 'dragStartHandler', 'dragOverHandler', 'dragEndHandler', 'dialogueNagitiveHandler')
  }
  componentDidMount () {
    this.dispatch(actionCreators.getSelectedEvent(this.props.match.params.id || 'new'))
  }
  handleAddGroup () {
    const onSuccess = () => this.setState({groupSelected: this.props.selectedEvent.groups.length - 1, groupInEdit: {event: this.props.selectedEvent.id}})
    this.dispatch(actionCreators.addGroup(onSuccess))
  }
  handleCancelAddGroup () {
    const onSuccess = () => this.setState({groupSelected: - 1, groupInEdit: undefined})
    this.dispatch(actionCreators.cancelAddGroup(onSuccess))
  }
  handleEditGroup () {
    this.setState({groupInEdit: { id: this.props.selectedEvent.groups[this.state.groupSelected].id}})
  }
  handleInputEvent (field) { return (e) => {
    let value = (e.target.value === 'true' || e.target.value === 'false') ? (e.target.value === 'true' ? false : true) : e.target.value
    this.setState({ eventInEdit: (this.state.eventInEdit) ? {...this.state.eventInEdit, [field]: value} : { id: this.props.selectedEvent.id, [field]: value } })
  }}
  handleInputGroup (field) { return (e) => {
    this.setState({ groupInEdit: (this.state.groupInEdit) ? {...this.state.groupInEdit, [field]: e.target.value} : {[field]: e.target.value}})
  }}
  handleSelect (field, index) { return (e) => {
    this.setState({[field + 'Selected']: index})
  }}
  handleSubmitEvent () {
    const onSuccess = () => this.setState({eventInEdit: undefined})
    this.dispatch(actionCreators.submitEvent(this.state.eventInEdit, onSuccess))
  }
  handleSubmitGroup () {
    const onSuccess = () => this.setState({groupInEdit: undefined})
    this.dispatch(actionCreators.submitGroup(this.state.groupInEdit, this.state.groupSelected, onSuccess))
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
  editPanelHandler (idx) {
    return (E) => {
      this.setState({
        editPanel: idx
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

    if (!selectedEvent) { return <div><Header location={location} nav='event' /><div className={css.loading}>Loading...</div></div> }
    const groups = selectedEvent.groups
    const { eventInEdit, editPanel, groupSelected, groupInEdit, showDialogue } = this.state
    return (<div>
      <Header location={location} nav='event' />
      <div className={css.mainBody}>
        {renderInfo(eventInEdit, selectedEvent, this.handleInputEvent, this.handleSubmitEvent)}
        <div className={css.managerList}>
          <div>
            <h3>組別</h3>
            <ul>
              {groups.map((V, I) => <li className={groupSelected === I ? css.selected : css.li } key={'gp_' + I}>{((groupSelected === I) && groupInEdit)
                ? <span>
                    <input type='text' placeholder='名稱 (中)' value={groupInEdit.nameCht ? groupInEdit.nameCht : V.nameCht} onChange={this.handleInputGroup('nameCht')}/>
                    <input type='text' placeholder='名稱 (英)' value={groupInEdit.name ? groupInEdit.name : V.name} onChange={this.handleInputGroup('name')} />
                    <input type='number' placeholder='名額' value={groupInEdit.racerNumberAllowed ? groupInEdit.racerNumberAllowed : V.racerNumberAllowed} onChange={this.handleInputGroup('racerNumberAllowed')} />
                  </span>
                : <Button style='list' text={V.nameCht ? V.nameCht : V.name} counter={'?/' + V.racerNumberAllowed} onClick={this.handleSelect('group', I)}/>
              }</li>)}
            </ul>
            {groupInEdit
              ? <span><Button style='listFt' text='儲存' onClick={this.handleSubmitGroup} /><span className={css.right}><Button style='listFt' text='取消' onClick={this.handleCancelAddGroup}/></span></span>
              : <span><Button style='listFtIcon' text='+' onClick={this.handleAddGroup} /> {groupSelected !== -1 && <span className={css.right}><Button style='listFt' text='編輯' onClick={this.handleEditGroup} /></span>}</span> }
          </div>
          <div>
            <h3>組別賽制</h3>
              { groups.length > 0 ? <GroupList {...{groups, name: 'race', deleteHandler: this.deleteEventHandler, dragStart: this.dragStartHandler, dragOver: this.dragOverHandler, dragEnd: this.dragEndHandler}} /> : null }
            <div className={css.editPanel}>
              <div className={classes(!(editPanel === 2) && css.hidden)}>
                <div>
                  <input type='text' placeholder='new race name' />
                </div>
                <div><span>OK</span><span onClick={this.editPanelHandler(0)} >Cancel</span></div>
              </div>
              <span className={classes((editPanel !== 0) && css.hidden)} onClick={this.editPanelHandler(2)}>+</span>
            </div>
          </div>
          <div>
            <h3>選手</h3>
          </div>
        </div>
      </div>
      { <Dialogue {...{enable: showDialogue, msg: this.alertMsg, title: 'move event', nagitiveHandler: this.dialogueNagitiveHandler}} /> }
    </div>)
  }
}

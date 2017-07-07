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

const GroupList = ({groups, name, dragStart, dragOver, dragEnd, deleteHandler}) =>
  <ul>
    { groups.map((V, I) => <li key={`gp_${I}`} data-id={V.id} data-group={name} draggable='true' onDragStart={dragStart} onDragOver={dragOver} onDragEnd={dragEnd} ><span className={css.itemExpand}>{`${V.name} (?/${V.racerNumberAllowed})`}</span><span className={css.redTxt} onClick={deleteHandler}>delete</span></li>) }
  </ul>

//yyyy-mm-ddThh:mm
const returnDateTime = (timestamp) => {
  const t = new Date(timestamp + 28800000) // taipei diff
  return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2) + 'T' + ('0' + t.getUTCHours()).slice(-2) + ':' + ('0' + t.getUTCMinutes()).slice(-2)
}

export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    console.log(this.props)
    this.state = {
      inEdit: undefined,
      editPanel: 0,
      showDialogue: 0,
      dialoguePosHandler: null
    }
    this.dispatch = this.props.dispatch
    this._bind('handleInput', 'handleSubmit', 'editPanelHandler', 'deleteEventHandler', 'dragStartHandler', 'dragOverHandler', 'dragEndHandler', 'dialogueNagitiveHandler')
  }
  componentDidMount () {
    this.dispatch(actionCreators.getSelectedEvent(this.props.match.params.id || 'new'))
  }
  handleInput (field) { return (e) => {
    let value = (e.target.value === 'true' || e.target.value === 'false') ? (e.target.value === 'true' ? false : true) : e.target.value
    const stateObj = { inEdit: (this.state.inEdit) ? this.state.inEdit : { id: this.props.selectedEvent.id } }

// let server handle this
//    if (field === 'startTime' || field === 'endTime') { value = returnTimestamp(value) }
    stateObj.inEdit[field] = value
    this.setState(stateObj)
  }}
  handleSubmit (content) { return (e) => {
    const onSuccess = () => this.setState({inEdit: undefined})
    this.dispatch(actionCreators.submit(this.state.inEdit, onSuccess))
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
    if (!selectedEvent) {
      return <div><Header location={location} nav='event' /><div className={css.loading}>Loading...</div></div>
    }
    const groups = selectedEvent.groups
    const { inEdit, editPanel, showDialogue } = this.state
    return (<div>
      <Header location={location} nav='event' />
      <div className={css.mainBody}>
        <section>
          <ul>
            <li>
              <label>活動名稱（中）</label>
              <input type='text' value={valueFunc(inEdit, selectedEvent, 'nameCht')} onChange={this.handleInput('nameCht')} />
              <label>名稱（英）</label>
              <input type='text' value={valueFunc(inEdit, selectedEvent, 'name')} onChange={this.handleInput('name')} />
            </li>
            <li>
              <label>開始時間</label>
              <input type='datetime-local' value={(inEdit && inEdit.startTime) ? inEdit.startTime : returnDateTime(selectedEvent.startTime)} onChange={this.handleInput('startTime')} />
              <label>結束時間</label>
              <input type='datetime-local' value={(inEdit && inEdit.endTime) ? inEdit.endTime : returnDateTime(selectedEvent.endTime)} onChange={this.handleInput('endTime')} />
            </li>
            <li>
              <label>地點</label>
              <input type='text' value={valueFunc(inEdit, selectedEvent, 'location')} onChange={this.handleInput('location')} />
            </li>
            <li>
              <label>公開活動</label><input type='checkbox' checked={valueFunc(inEdit, selectedEvent, 'isPublic')} value={valueFunc(inEdit, selectedEvent, 'isPublic')} onChange={this.handleInput('isPublic')} />  
              <label>開放隊伍報名</label><input type='checkbox' checked={valueFunc(inEdit, selectedEvent, 'isTeamRegistrationOpen')} value={valueFunc(inEdit, selectedEvent, 'isTeamRegistrationOpen')} onChange={this.handleInput('isTeamRegistrationOpen')} />  
              <label>開放個人報名</label><input type='checkbox' checked={valueFunc(inEdit, selectedEvent, 'isRegistrationOpen')} value={valueFunc(inEdit, selectedEvent, 'isRegistrationOpen')} onChange={this.handleInput('isRegistrationOpen')} />
              <span className={css.right}>{ (inEdit) ? <Button text='儲存' onClick={this.handleSubmit('event')} /> : <Button text='儲存' style='disabled' /> }</span>
            </li>
          </ul>
        </section>
        <div className={css.managerList}>
          <div>
            <span className={css.head}>組別</span>
              { groups.length > 0 ? <GroupList {...{groups, name: 'group', deleteHandler: this.deleteEventHandler, dragStart: this.dragStartHandler, dragOver: this.dragOverHandler, dragEnd: this.dragEndHandler}} /> : null }
            <div className={css.editPanel}>
              <div className={classes(!(editPanel === 1) && css.hidden)}>
                <div>
                  <input type='text' placeholder='new group name' />
                </div>
                <div><span>OK</span><span onClick={this.editPanelHandler(0)} >cancel</span></div>
              </div>
              <span className={classes((editPanel !== 0) && css.hidden)} onClick={this.editPanelHandler(1)}>+</span>
            </div>
          </div>
          <div>
            <span className={css.head}>組別賽制</span>
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
            <span className={css.head}>選手</span>
          </div>
        </div>
      </div>
      { <Dialogue {...{enable: showDialogue, msg: this.alertMsg, title: 'move event', nagitiveHandler: this.dialogueNagitiveHandler}} /> }
    </div>)
  }
}

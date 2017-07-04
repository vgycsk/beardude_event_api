import React from 'react'
import BaseComponent from '../BaseComponent'
import classes from 'classnames'
import { actionCreators } from '../../ducks/event'

import css from './style.css'
import { Dialogue } from '../Dialogue/presenter'
import Header from '../Header'
import Footer from '../Footer'

const GroupList = ({group, name, dragStart, dragOver, dragEnd, deleteHandler}) =>
  <ul>
    { group.map((V, I) => <li key={`gp_${I}`} data-id={V.id} data-group={name} draggable='true' onDragStart={dragStart} onDragOver={dragOver} onDragEnd={dragEnd} ><span className={css.itemExpand}>{`${V.title} (${V.count}/${V.maxCount})`}</span><span className={css.redTxt} onClick={deleteHandler}>delete</span></li>) }
  </ul>

export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    console.log(this.props)
    this.state = {
      editPanel: 0,
      showDialogue: 0,
      dialoguePosHandler: null
    }
    this.dispatch = this.props.dispatch
    this._bind('dateChangehandler', 'editPanelHandler', 'deleteEventHandler', 'dragStartHandler', 'dragOverHandler', 'dragEndHandler', 'dialogueNagitiveHandler')
  }
  componentDidMount () {
    this.dispatch(actionCreators.getSelectedEvent(this.props.match.params.id || 'new'))
  }
  dateChangehandler (name) {
    return (E) => {
      console.log(name + E.currentTarget.value)
    }
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
    const { location, selectedEvent, group } = this.props

    if (!selectedEvent) {
      return (
        <div>
          <Header location={location} nav='event' />
          <div className={css.loading}>Loading...</div>
        </div>
      )
    }

    const { editPanel, showDialogue } = this.state
    return (
      <div>
        <Header location={location} nav='event' />
        <div className={css.info}>
          <div><div className={css.actTitle}><span>Bear Dude Activity</span><span className={css.name}>{selectedEvent.activity}</span></div></div>
          <div><div className={css.actTitle}><span>Event Name</span><input type='text' defaultValue={selectedEvent.eventName} className={css.title} placeholder='event name' maxLength={120} onChange={this.dateChangehandler('eventName')} /></div></div>
          <div>
            <div className={css.actTitle}>
              <span>報名日期</span><input type='date' value={selectedEvent.regDate} onChange={this.dateChangehandler('reg')} />
              <span>開放日期</span><input type='date' value={selectedEvent.openDate} onChange={this.dateChangehandler('open')} />
              <span>截止日期</span><input type='date' value={selectedEvent.endDate} onChange={this.dateChangehandler('end')} />
            </div>
          </div>
        </div>
        <div className={css.managerList}>
          <div>
            <span className={css.head}>組別</span>
              { group.length > 0 ? <GroupList {...{group, name: 'group', deleteHandler: this.deleteEventHandler, dragStart: this.dragStartHandler, dragOver: this.dragOverHandler, dragEnd: this.dragEndHandler}} /> : null }
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
              { group.length > 0 ? <GroupList {...{group, name: 'race', deleteHandler: this.deleteEventHandler, dragStart: this.dragStartHandler, dragOver: this.dragOverHandler, dragEnd: this.dragEndHandler}} /> : null }
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
        { <Dialogue {...{enable: showDialogue, msg: this.alertMsg, title: 'move event', nagitiveHandler: this.dialogueNagitiveHandler}} /> }
        <Footer />
      </div>
    )
  }
}

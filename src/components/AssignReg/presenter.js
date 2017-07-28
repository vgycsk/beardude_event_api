import React from 'react'
import BaseComponent from '../BaseComponent'
import Button from '../Button'
import { actionCreators as eventActions} from '../../ducks/event'

import css from './style.css'

const returnInitStateObj = (group) => {
  let races = {}
  let stateObj = { entrysRegs: [], rematchsRegs: [], finalRegs: [], unassignedRegs: [] }

  group.races.map(V => { races[V.id] = { regs: [], name: V.name, nameCht: V.nameCht, isEntryRace: V.isEntryRace, isFinalRace: V.isFinalRace, racerNumberAllowed: V.racerNumberAllowed } })
  group.registrations.map(reg => {
    const regObj = {id: reg.id, name: reg.name, raceNumber: reg.raceNumber}
    if (reg.races.length === 0) { stateObj.unassignedRegs.push(regObj) }
    else { reg.races.map(race => { races[race.id].regs.push(regObj) }) }
  })
  for (let id in races) {
    const raceObj = {id: id, name: races[id].name, nameCht: races[id].nameCht, regs: races[id].regs, racerNumberAllowed: races[id].racerNumberAllowed}
    if (races[id].isEntryRace) { stateObj.entrysRegs.push(raceObj) }
    else if (races[id].isFinalRace) { stateObj.finalRegs.push(raceObj) }
    else { stateObj.rematchsRegs.push(raceObj) }
  }
  return stateObj
}

class AssignReg extends BaseComponent {
  constructor (props) {
    super(props)
    const stateObj = returnInitStateObj(props.group)
    this.state = {
      entrysRegs: stateObj.entrysRegs,
      rematchsRegs: stateObj.rematchsRegs,
      finalRegs: stateObj.finalRegs,
      unassignedRegs: stateObj.unassignedRegs,
      autoAssign: false,
      modified: false,
      original: {
        entrysRegs: [...stateObj.entrysRegs],
        unassignedRegs: [...stateObj.unassignedRegs]
      }
    }
    //{id: ID, regs: []}
    this.dispatch = this.props.dispatch
    this._bind('handleAutoAssign', 'handleRestore', 'handleDragStart', 'handleDragOver', 'handleDragEnd', 'handleSubmit')
  }
  handleAutoAssign () {
    const shuffleArray = (arr) => arr.sort(() => (Math.random() - 0.5))
    let stateObj = {autoAssign: true, entrysRegs: [...this.state.entrysRegs], unassignedRegs: [...this.state.unassignedRegs], modified: true}
    const slots = Math.floor(this.props.group.registrations.length / stateObj.entrysRegs.length)

    stateObj.entrysRegs.map((race, i) => {
      const availableSlots = slots - race.regs.length
      let newRegs = stateObj.unassignedRegs.splice(0, availableSlots)
      newRegs = newRegs.map(reg => ({...reg, toAdd: true}))
      stateObj.entrysRegs[i].regs = stateObj.entrysRegs[i].regs.concat(newRegs)
    })
    if (stateObj.unassignedRegs.length > 0) {
      stateObj.unassignedRegs.map((reg, index) => {
        stateObj.entrysRegs[index].regs.push({...reg, toAdd: true})
      })
      stateObj.unassignedRegs = []
    }
    this.setState(stateObj)
  }
  handleSubmit () {
    const onSuccess = (group) => {
      const stateObj = returnInitStateObj(group)
      this.setState({...stateObj,
        autoAssign: false,
        modified: false,
        original: {
          entrysRegs: stateObj.entrysRegs,
          unassignedRegs: stateObj.unassignedRegs
        }
      })
    }
    let submitObject = []
    this.state.entrysRegs.map(race => {
      let obj = {id: race.id, toAdd: [], toRemove: []}
      let toSubmit

      race.regs.map(reg => {
        if (reg.toAdd) {
          obj.toAdd.push(reg.id)
          toSubmit = true
        } else if (reg.toRemove) {
          obj.toRemove.push(reg.id)
          toSubmit = true
        }
      })
      if (toSubmit) {
        submitObject.push(obj)
      }
    })
    if (submitObject.length > 0) {
      this.dispatch(eventActions.submitRegsToRaces(this.props.group.id, this.props.groupIndex, submitObject, onSuccess))
    } else {
      this.setState({modified: false})
    }
  }
  handleDragStart (fromState, index, fromIndex) { return (e) => {
    this.dragFrom = fromState
    this.dragItemIndex = index
    this.dragFromIndex = fromIndex
  }}
  handleDragOver (overIndex) { return (e) => {
    e.preventDefault()
    this.dragOverIndex = overIndex
  }}
  handleDragEnd (e) {
    let stateObj = {
      unassignedRegs: this.state.unassignedRegs,
      entrysRegs: this.state.entrysRegs,
      modified: false
    }
    let reg
    switch (this.dragFrom) {
    case 'unassignedRegs':
      reg = stateObj.unassignedRegs.splice(this.dragItemIndex, 1)[0]
      reg.toAdd = true
      stateObj.entrysRegs[this.dragOverIndex].regs.push(reg)
      stateObj.modified = true
      return this.setState(stateObj)
    case 'entrysRegs':
      if (this.dragFromIndex !== this.dragOverIndex) {
        stateObj.modified = true
        // moving unsaved item again
        if (stateObj.entrysRegs[this.dragFromIndex].regs[this.dragItemIndex].toAdd) {
          let existsInTarget = false
          reg = stateObj.entrysRegs[this.dragFromIndex].regs.splice([this.dragItemIndex], 1)[0]
          if (this.dragOverIndex !== -1) {
            stateObj.entrysRegs[this.dragOverIndex].regs.forEach((regNew, i) => {
              if (regNew.id === reg.id) {
                stateObj.entrysRegs[this.dragOverIndex].regs[i].toRemove = false
                stateObj.entrysRegs[this.dragOverIndex].regs[i].toAdd = false
                existsInTarget = true
              }
            })
          }
          if (!existsInTarget) {
            reg.toAdd = true
            if (this.dragOverIndex === -1) {
              stateObj.unassignedRegs.push(reg)
            } else {
              stateObj.entrysRegs[this.dragOverIndex].regs.push(reg)
            }
          }
        } else {
          let existsInTarget = false
          reg = {...stateObj.entrysRegs[this.dragFromIndex].regs[this.dragItemIndex]}
          stateObj.entrysRegs[this.dragFromIndex].regs[this.dragItemIndex].toRemove = true
          reg.toAdd = true
          if (this.dragOverIndex === -1) {
            stateObj.unassignedRegs.push(reg)
          } else {
            stateObj.entrysRegs[this.dragOverIndex].regs.push(reg)
          }
        }
        return this.setState(stateObj)
      }
    }
  }
  render () {
    const { autoAssign, modified, unassignedRegs, entrysRegs, rematchsRegs, finalRegs } = this.state

    const renderMoveBit = ({stateName, reg, regIndex, raceIndex}) => <li className={(reg.toAdd || reg.toRemove) ? css.modifiedMoveBit : css.moveBit} draggable='true' key={'move' + reg.id} onDragStart={this.handleDragStart(stateName, regIndex, raceIndex)} onDragEnd={this.handleDragEnd}>{reg.raceNumber} {(reg.nameCht) ? reg.nameCht : reg.name}</li>

    return (<div className={css.assignReg}>
      <h3>選手分組</h3>
      <div>
        <div className={css.unassign} onDragOver={this.handleDragOver(-1)}>
          {(unassignedRegs.length > 0) &&
            <div className={css.auto}><Button style='shortGrey' text='自動分配選手' onClick={this.handleAutoAssign} /></div>
          }
          <h5 className={css.inlineB}>尚未分組</h5>
          <ul>{unassignedRegs.map((reg, regIndex) => (renderMoveBit({ stateName: 'unassignedRegs', reg, regIndex })))}</ul>
        </div>
        <label className={css.inlineB}>初賽</label>
        <ul className={css.races}>{entrysRegs.map((race, raceIndex) => <li key={`race${race.id}`} onDragOver={this.handleDragOver(raceIndex)}>
          <h5>{(race.nameCht) ? race.nameCht : race.name} <span className={css.count}>{race.regs.filter(reg => !reg.toRemove).length} / {race.racerNumberAllowed}</span></h5>
          <ul>{race.regs.map((reg, regIndex) => (!reg.toRemove) && (renderMoveBit({stateName: 'entrysRegs', reg, regIndex, raceIndex})))}</ul>
        </li>)}</ul>
      </div>
      {(rematchsRegs.length > 0) && <div>
        <label>複賽</label>
        <ul className={css.races}>{rematchsRegs.map(race => <li key={`race${race.id}`}>
          <h5>{race.nameCht} <span className={css.count}>{race.regs.length} / {race.racerNumberAllowed}</span></h5>
          <ul>{race.regs.map(reg => <li key={`reg${reg.id}`} className={css.moveBit}>{(reg.nameCht ? reg.nameCht : reg.name)}</li>)}</ul>
        </li>)}</ul>
      </div>}
      <div>
        <label>決賽</label>
        <ul className={css.races}>{finalRegs.map(race => <li key={`race${race.id}`}>
          <h5>{race.nameCht} <span className={css.count}>{race.regs.length} / {race.racerNumberAllowed}</span></h5>
          <ul>{race.regs.map(reg => <li key={`reg${reg.id}`} className={css.moveBit}>{(reg.nameCht ? reg.nameCht : reg.name)}</li>)}</ul>
        </li>)}</ul>
      </div>
      <div className={css.boxFt}>
        {modified ? <Button onClick={this.handleSubmit} text='儲存' /> : <Button style='disabled' text='儲存' />}
        <Button style='grey' onClick={this.props.handleCancelEdit} text='關閉' />
      </div>
    </div>)
  }
}

export default AssignReg
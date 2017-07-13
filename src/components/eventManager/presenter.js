import React from 'react'
import BaseComponent from '../BaseComponent'
import { Redirect } from 'react-router-dom'
import { actionCreators as eventActions} from '../../ducks/event'
import { actionCreators as racerActions } from '../../ducks/racer'

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

const validateAdvRules = {
  ruleCompleted: (modified) => (modified.rankFrom !== undefined && modified.rankTo !== undefined && modified.toRace !== undefined) ? true : false,
  continuity: (rules) => { let hasError
    if (rules.length > 1) { rules.forEach((rule, i) => { if (rules[i + 1] && (rules[i + 1].rankFrom - rule.rankTo !== 1)) { hasError = true } }) }
    return (hasError) ? '晉級規則的名次必須連續' : undefined
  },
  // 'Must set rule from first place racer'
  startFromZero: (rules) => (rules[0].rankFrom === 0) ? undefined : '需從第一名開始設定晉級規則',
  noOverflow: (raceId, modified, toRace, races) => {
    const advRules = races.map(race => (race.id === raceId) ? modified : race.advancingRules).reduce((sum, v) => sum.concat(v))
    const sum = advRules.reduce((sum, V) => {return sum + (V.rankTo - V.rankFrom + 1)}, 0)
    let toRaceObj
    races.forEach(race => { if (race.id === toRace) { toRaceObj = race }} )
    const toRaceName = (toRaceObj.nameCht) ? toRaceObj.nameCht : toRaceObj.name
    return (toRaceObj.racerNumberAllowed !== sum) ? `晉級至「${toRaceName}」的人數加總（${sum}）不符合設定的人數（${racerNumberAllowed}）` : undefined
  }
}

const returnListHeight = ({pageHeight = 360, ftHeight = 211}) => Math.max(window.innerHeight - ftHeight, (pageHeight - ftHeight))
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
    {label: '地下活動', field: 'isIndieEvent', type: 'checkbox', value: true},
    {label: '報名時需付費', field: 'requiresPaymentOnReg', type: 'checkbox', value: false}
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
    {label: '選手 ID', field: 'racer', type: 'number', disabled: true},
    {label: '稱呼方式', field: 'name', type: 'text'}
  ]
}
const title = { event: '活動', group: '組別', race: '賽事' }
//  handleEditAdvRule ({raceObj, action, index, field}) { return (e) => {
const render = {
  advRuleTable: ({advRuleMsg, group, advRuleRaceId, advModifiedRules, onEdit, onSubmit, onToggle, onCancel}) => {
    return <div className={css.advTable}><h3>晉級規則 - {(group.nameCht) ? group.nameCht : group.name}組</h3><h4 className={css.alert}>{advRuleMsg}</h4>
      {group.races.map((V, I) => {
        let options = [];
        for (let i = 0; i < V.racerNumberAllowed; i += 1) {
          options.push({value: i, label: i + 1})
        }
        return <div key={'race' + I}><label>{V.nameCht}</label>
          {!V.isFinalRace && <div className={css.tableInput}>
            <table><thead><tr><th>資格</th><th>晉級到</th></tr></thead><tbody>
            {render.advRuleItem({races: group.races, rules: (advModifiedRules && advRuleRaceId === V.id) ? advModifiedRules : V.advancingRules, onEdit, raceObj: V, disabled: (advRuleRaceId === V.id) ? false : true, options: options})}
              <tr><td className={css.ft} colSpan='4'>
                {(advRuleRaceId === V.id)
                  ? <span><Button style='listFtIcon' text='+' onClick={onEdit({raceObj: V, action: 'add'})}/><span className={css.right}><Button onClick={onSubmit} text='儲存' /><Button text='取消' style='grey' onClick={onToggle(V, I)}/></span></span>
                  : (!advRuleRaceId && <span className={css.right}><Button onClick={onSubmit} text='編輯' onClick={onToggle(V, I)}/></span>)}
                </td></tr>
            </tbody></table>
          </div>}
        </div>})}
      <div className={css.boxFt}><Button style='grey' onClick={onCancel} text='關閉' /></div>
    </div>
  },
  advRuleItem: ({races, raceObj, rules, onEdit, disabled, options}) => rules.map((V, index) => <tr key={'adv' + index}>
    <td>從 <select value={V.rankFrom} disabled={disabled} onChange={onEdit({action: 'edit', index, field: 'rankFrom'})}><option key='opt0'>名次...</option>{options.map(V => <option key={'opt' + V.label}value={V.value}>{V.label}</option>)}</select>
      到 <select disabled={disabled} value={V.rankTo} onChange={onEdit({action: 'edit', index, field: 'rankTo'})}><option key='opt0'>名次...</option>{options.map(V => <option key={'opt' + V.label}value={V.value}>{V.label}</option>)}</select></td>
    <td><select disabled={disabled} onChange={onEdit({action: 'edit', index, field: 'toRace'})} value={V.toRace}><option key='toRace0'>賽事...</option>{races.map((V) => { if ((V.id !== raceObj.id) && !V.isEntryRace) { return <option key={'toRace' + V.id} value={V.id}>{V.nameCht}</option>}})}</select> {!disabled && <span className={css.right}><Button onClick={onEdit({action: 'delete', index})} style='del' text='x' /></span>}</td>
  </tr>),
  delete: (model, original, onDelete) => ((model === 'event' && original.groups.length === 0) || (model === 'group' && original.races.length === 0 && original.registrations.length === 0) || (model === 'race' && original.registrations.length === 0) || model === 'reg')
    ? <Button style='alert' onClick={onDelete(model)} text='刪除' />
    : <Button style='disabled' text='刪除' />,
  info: ({event, onEdit}) => <div className={css.info}>
    <h2>{event.nameCht}</h2>
    <h3>{event.name} <span className={css.time}>{returnDateTime(event.startTime, true)} - {returnDateTime(event.endTime, true)}</span></h3>
    <ul className={css.lights}><li className={event.isPublic ? css.on : css.off}>公開活動</li><li className={event.isTeamRegistrationOpen ? css.on : css.off}>隊伍報名</li><li className={event.isRegistrationOpen ? css.on : css.off}>個人報名</li><li className={event.isIndieEvent ? css.on : css.off}>地下活動</li><li className={event.requiresPaymentOnReg ? css.on : css.off}>報名時付款</li></ul>
    <span className={css.btn}><Button text='編輯' onClick={onEdit} /></span>
  </div>,
  infoForm: ({model, table, modified, original, onChange, onSubmit, onCancel, onDelete}) => <div>
  <h3>{original.id ? '編輯' : '新增'}{title[model]}</h3>
    <ul>{returnInputs[model](modified, original).map((V, I) => <li key={'in_' + I}><label>{V.label}</label>{renderInput[V.type]({onChange: onChange(V.field), value: ((V.value) ? V.value : valueFunc(modified, original, V.field)), disabled: V.disabled })}</li>)}</ul>
    {table}
    <div className={css.boxFt}>
      {modified ? <Button text='儲存' onClick={onSubmit(model)} /> : <Button style='disabled' text='儲存'/>}
      {original.id && render.delete(model, original, onDelete)}
      <Button style='grey' onClick={onCancel} text='取消'/>
    </div>
  </div>,
  ftBlank: () => <span className={css.listFt}></span>,
  list: ({array, selected, onSelect, listHeight}) => <ul className={css.ul} style={{height: listHeight}}>{array.map((V, I) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}><button className={css.list} onClick={onSelect(I)}>{V.nameCht ? V.nameCht : V.name} <span className={css.count}>{(V.registrations ? V.registrations.length : 0) + '/' + V.racerNumberAllowed}</span></button></li>)}</ul>,
  listRace: ({array, selected, onSelect, listHeight}) => <ul className={css.ul} style={{height: listHeight}}>{array.map((V, I) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}><button className={css.list} onClick={onSelect(I)}>{V.nameCht ? V.nameCht : V.name}<ul className={css.lights}><li className={V.requirePacer ? css.on : css.off}>前導</li><li className={V.isEntryRace ? css.on : css.off}>初賽</li>{V.isFinalRace ? <li className={css.on}>決賽</li> : <li className={V.advancingRules.length > 0 ? css.on : css.off}>晉級</li>}</ul><span className={css.count}>{(V.registrations ? V.registrations.length : 0) + '/' + V.racerNumberAllowed}</span></button></li>)}</ul>,
  listReg: ({array, selected, onSelect, listHeight}) => <ul className={css.ul} style={{height: listHeight}}>{array.map((V, I) => <li className={selected === I ? css.selected : css.li } key={'li_' + V.id}><button className={css.list} onClick={onSelect(I)}>{(V.name) ? V.name : V.id}</button></li>)}</ul>
}
export class EventManager extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      advRuleMsg: undefined,
      advRuleRaceId: undefined,
      advRuleModified: undefined,
      model: undefined,
      modified: undefined,
      original: undefined,
      groupSelected: -1,
      raceSelected: -1,
      regSelected: -1,
      listHeight: returnListHeight({})
    }
    this.dispatch = this.props.dispatch
    this._bind('handleStartEdit', 'handleCancelEdit', 'handleEditAdvRule', 'handleDelete', 'handleResize', 'handleSubmit', 'handleSubmitAdvRule', 'handleInput', 'handleSelectGroup', 'handleSelectRace', 'handleSelectReg', 'handleToggleEditAdvRule', 'deleteEventHandler', 'dragStartHandler', 'dragOverHandler', 'dragEndHandler')
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
        break;
      }
    }
    this.dispatch(eventActions.submit(state, onSuccess))
  }}
  handleSubmitAdvRule () {
    const successCallback = () => this.setState({advRuleRaceId: undefined, raceSelected: -1, advRuleModified: undefined})
    this.dispatch(eventActions.submitAdvancingRules(this.state, successCallback))
  }
  handleToggleEditAdvRule (raceObj, index) { return (e) => {
    if (this.state.advRuleRaceId === raceObj.id) {
      return this.setState({advRuleRaceId: undefined, raceSelected: -1, advRuleModified: undefined, advRuleMsg: undefined})
    }
    this.setState({advRuleRaceId: raceObj.id, raceSelected: index, advRuleModified: [...raceObj.advancingRules]})
  }}
  handleEditAdvRule ({action, index, field}) { return (e) => {
    let advRuleModified = this.state.advRuleModified
    let advRuleMsg
    let startFromZero
    let continuity
    let noOverflow
    if (action === 'add') {
      advRuleModified.push({})
    } else if (action === 'edit') {
      advRuleModified[index][field] = parseInt(e.target.value)
      const ruleCompleted = validateAdvRules.ruleCompleted(advRuleModified[index])
      if (ruleCompleted) {
        startFromZero = validateAdvRules.startFromZero(advRuleModified)
        continuity = validateAdvRules.continuity(advRuleModified)
        noOverflow = validateAdvRules.noOverflow(this.state.advRuleRaceId, advRuleModified, advRuleModified[index].toRace, this.props.event.groups[this.state.groupSelected].races)
        advRuleMsg = (startFromZero) ? startFromZero : (continuity ? continuity : (noOverflow ? noOverflow : undefined))
      }
    } else if (action === 'delete') {
      advRuleModified.splice(index, 1)
      if (advRuleModified.length > 0) {
        // to do: check overflow
          startFromZero = validateAdvRules.startFromZero(advRuleModified)
          continuity = validateAdvRules.continuity(advRuleModified)
          advRuleMsg = (startFromZero) ? startFromZero : (continuity ? continuity : undefined)
      }
    }
    this.setState({advRuleModified: advRuleModified, advRuleMsg: advRuleMsg})
  }}
  handleSelectRace (index) { return (e) => {
    this.setState({raceSelected: (this.state.raceSelected === index) ? -1 : index})
  }}
  handleSelectReg (index) { return (e) => {
    this.setState({regSelected: (this.state.raceSelected === index) ? -1 : index})
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
    const { advRuleModified, advRuleRaceId, advRuleMsg, listHeight, modified, original, model, groupSelected, raceSelected, regSelected } = this.state
    let overlay

    if (event === -1) { return <Redirect to={{pathname: '/console'}} /> }
    else if (!event) { return <div><Header location={location} nav='event' /><div className={css.loading}>Loading...</div></div> }
    else if (model === -1) { return <Redirect to={{pathname: '/console/event/' + event.id}} /> }

    if (model) {
      if (model === 'advRules') {
        overlay = render.advRuleTable({group: event.groups[groupSelected], advRuleMsg, advRuleRaceId, advModifiedRules, onEdit: this.handleEditAdvRule, onSubmit: this.handleSubmitAdvRule, onToggle: this.handleToggleEditAdvRule, onCancel: this.handleCancelEdit })
      } else {
        overlay = render.infoForm({ model, modified, original, onChange: this.handleInput, onSubmit: this.handleSubmit, onCancel: this.handleCancelEdit, onDelete: this.handleDelete })
      }
    }
    return (<div className={model ? css.fixed : css.wrap}><Header location={location} nav='event' />
      <div className={css.mainBody}>
        {render.info({event, onEdit: this.handleStartEdit('event', event)})}
        <div className={css.managerList}>
          <div><h3>組別</h3>
            {event.groups && render.list({array: event.groups, listHeight, selected: groupSelected, onSelect: this.handleSelectGroup})}
            <span className={css.listFt}>
              <Button style='listFtIcon' text='+' onClick={this.handleStartEdit('group', {})} />
              {groupSelected !== -1 && <span>
                <Button style='listFt' text='編輯' onClick={this.handleStartEdit('group', event.groups[groupSelected])} />
                <Button style='listFt' text='編輯晉級規則' onClick={this.handleStartEdit('advRules', event.groups[groupSelected])} />
              </span>}
            </span>
          </div>
          <div><h3>組別賽制</h3>
            {groupSelected !== -1 ? <span>
              {render.listRace({array: event.groups[groupSelected].races, listHeight, selected: raceSelected, onSelect: this.handleSelectRace})}
              <span className={css.listFt}>
                <Button style='listFtIcon' text='+' onClick={this.handleStartEdit('race', {})} />
                {raceSelected !== -1 &&
                  <Button style='listFt' text='編輯' onClick={this.handleStartEdit('race', event.groups[groupSelected].races[raceSelected])} />
                }
              </span>
            </span> : <span className={css.listFt}></span>
            }
          </div>
          <div><h3>選手賽籍</h3>
            {groupSelected !== -1 && render.listReg({array: ((raceSelected === -1) ? event.groups[groupSelected].registrations : event.groups[groupSelected].races[raceSelected].registrations), listHeight, selected: regSelected, onSelect: this.handleSelectReg})}
            <span className={css.listFt}>
              {groupSelected !== -1 && <Button style='listFtIcon' text='+' onClick={this.handleStartEdit('reg', {})} />}
              {regSelected !== -1 &&
                <Button style='listFt' text='編輯' onClick={this.handleStartEdit('reg', event.groups[groupSelected].registrations[regSelected])} />
              }
            </span>
          </div>
        </div>
      </div>
      <Dialogue content={overlay} />
    </div>)
  }
}

// racer footer: 
// {groupSelected !== -1 && <Button style='listFtIcon' text='+' onClick={this.handleStartEdit('registration', {})} />}
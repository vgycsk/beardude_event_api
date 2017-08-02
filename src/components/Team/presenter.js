import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/team'
import { actionCreators as racerActionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import Table from '../Table'
import css from './style.css'
import { renderInput } from '../Table/presenter'

const valueFunc = (store, field) => (store.inEdit && store.inEdit[field] !== undefined) ? store.inEdit[field] : store.teams[store.selectedIndex][field]
const listNameFunc = (team) => (team.id) ? ((team.nameCht && team.nameCht !== '') ? team.nameCht : team.name) : '新增'
const returnInputs = (store, onChange) => [
  { label: '名稱', field: 'name', onChange: onChange('name'), value: valueFunc(store, 'name') },
  { label: '中文名稱', field: 'nameCht', onChange: onChange('nameCht'), value: valueFunc(store, 'nameCht') },
  { label: '描述', field: 'description', type: 'textarea', onChange: onChange('description'), value: valueFunc(store, 'description') },
  { label: '網址', field: 'url', onChange: onChange('url'), value: valueFunc(store, 'url') }
]
const render = {
  inputSection: ({store, inputFunc}) => <section key='sec-input'><h3>隊伍資料</h3><ul>{returnInputs(store, inputFunc).map(input => render.item({ ...input }))}</ul></section>,
  memberSection: ({store, inputFunc, deleteFunc}) => {
    const team = store.teams[store.selectedIndex]
    const teamRacers = (store.selectedIndex !== -1) ? (store.inEdit && store.inEdit.racers) ? store.inEdit.racers : team.racers : []
    return (<section key='sec-member'><h3>成員</h3><table><thead><tr><th>姓名</th><th>隊長</th><th className={css.ctrl}><span>&nbsp;</span></th></tr></thead>
      <tbody>{teamRacers && teamRacers.map(racer => render.tableItem({ racer: racer, leader: (store.inEdit && store.inEdit.leader !== undefined) ? store.inEdit.leader : team.leader, onChange: inputFunc, onDelete: deleteFunc }))}</tbody></table></section>)
  },
  newMemberSection: ({racers, addFunc}) => <section key='sec-newMember'><h3>新增隊員</h3><div className={css.addList}><ul>{ (racers.length > 0) && racers.map(racer => { if (!racer.team) { return render.newMemberOption({ racer, onClick: addFunc }) } }) }</ul></div></section>,
  item: ({disabled, label, field, onChange, type = 'text', value}) => { return <li key={field}><label>{label}</label>{ renderInput[type]({disabled, onChange, value}) }</li> },
  tableItem: ({racer, leader, onChange, onDelete}) => (<tr key={'item-' + racer.id}>
    <td>{racer.lastName + racer.firstName}</td>
    <td className={css.center}><input onChange={onChange('leader')} type='radio' value={racer.id} checked={(leader === racer.id) ? 'checked' : ''} /></td>
    <td className={css.ctrl}>{(racer.toAdd || (racer.id !== leader && !racer.toRemove)) && <Button onClick={onDelete(racer.id)} text='刪除' />}
      {(!racer.toAdd && racer.toRemove) && <Button onClick={onDelete(racer.id, true)} text='還原' />}
    </td>
  </tr>),
  newMemberOption: ({racer, onClick}) => <li key={'racerOption-' + racer.id}><Button text={racer.lastName + ' ' + racer.firstName} onClick={onClick(racer)} /></li>
}
export default class Team extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = { readOnly: true }
    this.dispatch = this.props.dispatch
    this._bind('handleCreate', 'handleInput', 'handleEditToggle', 'handleAddRacer', 'handleRemoveRacer', 'handleSelect', 'handleSubmit')
  }
  handleCreate () {
    this.dispatch(actionCreators.create())
    this.setState({ readOnly: false })
  }
  handleInput (field) {
    return (e) => {
      this.dispatch(actionCreators.input(field, (field === 'leader') ? parseInt(e.currentTarget.value) : e.currentTarget.value))
    }
  }
  handleEditToggle () {
    this.setState({ readOnly: !this.state.readOnly })
    if (!this.state.readOnly) {
      this.dispatch(actionCreators.cancelEdit())
    }
  }
  handleAddRacer (newRacer) {
    return (e) => {
      let added
      this.props.team.teams[this.props.team.selectedIndex].racers.forEach(racer => { if (racer.id === newRacer.id) { added = true } })
      if (!added) {
        this.dispatch(actionCreators.addRacer(newRacer))
      }
    }
  }
  handleRemoveRacer (id, toRestore) {
    return (e) => {
      if (this.props.team.teams[this.props.team.selectedIndex].racers.length > 1) {
        this.dispatch(actionCreators.removeRacer(id, toRestore))
      }
    }
  }
  handleSelect (index) {
    return (e) => {
      this.dispatch(actionCreators.selectTeam(index))
      this.setState({ readOnly: true })
    }
  }
  handleSubmit () {
    this.dispatch(actionCreators.submit())
    this.setState({ readOnly: true })
  }
  componentDidMount () {
    if (!this.props.team.teams) {
      this.dispatch(actionCreators.getTeams())
    }
    if (!this.props.racer.racers) {
      this.dispatch(racerActionCreators.getRacers())
    }
  }
  render () {
    const store = this.props.team
    const newMemberSection = (!this.state.readOnly) ? render.newMemberSection({racers: this.props.racer.racers, addFunc: this.handleAddRacer}) : ''
    const editBd = (store.teams && store.selectedIndex > -1 && store.teams[store.selectedIndex]) ? [
      render.inputSection({store, inputFunc: this.handleInput}),
      render.memberSection({store, inputFunc: this.handleInput, deleteFunc: this.handleRemoveRacer}),
      newMemberSection
    ] : []

    return (<div><Header location={this.props.location} nav='base' /><div className={css.mainBody}>
      <Table list={store.teams} selectedIndex={store.selectedIndex} editBody={editBd} inEdit={this.props.team.inEdit && true} readOnly={this.state.readOnly} listNameFunc={listNameFunc} handleSelect={this.handleSelect} handleSubmit={this.handleSubmit} handleEditToggle={this.handleEditToggle} handleCreate={this.handleCreate} />
    </div></div>)
  }
}

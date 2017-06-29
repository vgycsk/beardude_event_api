import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/team'
import { actionCreators as racerActionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import Table from '../Table'
import css from './style.css'

const returnInputs = (store, onChange) => {
  const valueFunc = (store, field) => (store.inEdit && store.inEdit[field] !== undefined) ? store.inEdit[field] : store.teams[store.selectedIndex][field]
  return [
    { label: '名稱', field: 'name', onChange: onChange('name'), value: valueFunc(store, 'name') },
    { label: '中文名稱', field: 'nameCht', onChange: onChange('nameCht'), value: valueFunc(store, 'nameCht') },
    { label: '描述', field: 'description', type: 'textarea', onChange: onChange('description'), value: valueFunc(store, 'description') },
    { label: '網址', field: 'url', onChange: onChange('url'), value: valueFunc(store, 'url') }
  ]
}
const listNameFunc = (team) => (team.id) ? ((team.nameCht && team.nameCht !== '') ? team.nameCht : team.name) : '新增'
const render = {
  inputSection: ({store, inputFunc}) => <section><h3>隊伍資料</h3><ul>{store.teams[store.selectedIndex] && returnInputs(store, inputFunc).map(input =>  render.item({ ...input })) }</ul></section>,
  memberSection: ({store, inputFunc, deleteFunc}) => {
    const team = store.teams[store.selectedIndex]
    const teamRacers = (store.selectedIndex !== -1) ? (store.inEdit && store.inEdit.racers) ? store.inEdit.racers : team.racers : []
    return (<section><h3>成員</h3><table><thead><tr><th>姓名</th><th>隊長</th><th className={css.ctrl}></th></tr></thead>
      <tbody>{teamRacers && teamRacers.map(racer => render.tableItem({ racer: racer, leader: (store.inEdit && store.inEdit.leader !== undefined) ? store.inEdit.leader : team.leader, onChange: inputFunc, onDelete: deleteFunc }))}</tbody></table></section>)
  },
  newMemberSection: ({racers, addFunc}) => <section><h3>新增隊員</h3><div className={css.addList}><ul>{ (racers.length > 0) && racers.map(racer => { if (!racer.team) {return render.newMemberOption({racer, onClick: addFunc})}} )}</ul></div></section>,
  input: {
    text: ({disabled, onChange, value}) => {return <input type='text' onChange={onChange} value={value} disabled={disabled} />},
    textarea: ({disabled, onChange, value}) => {return <textarea onChange={onChange} value={value} disabled={disabled} />}
  },
  item: ({className = css.row, disabled, label, field, onChange, type = 'text', value}) => { return <li key={field}><label>{label}</label>{ render.input[type]({disabled, onChange, value}) }</li> },
  tableItem: ({racer, leader, onChange, onDelete}) => { return (<tr key={'item-' + racer.id}>
    <td>{racer.lastName + racer.firstName}</td>
    <td className={css.center}>
      <input onChange={onChange('leader')} type='radio' value={racer.id} checked={(leader === racer.id) ? 'checked' : ''} /></td>
    <td className={css.ctrl}>{(racer.toAdd || (racer.id !== leader && !racer.toRemove)) && <Button onClick={onDelete(racer.id)} text='刪除' />}
        {(!racer.toAdd && racer.toRemove) && <Button onClick={onDelete(racer.id, true)} text='還原' />}
    </td>
  </tr>)},
  newMemberOption: ({racer, onClick}) => <li key={'racerOption-' + racer.id}><Button text={racer.lastName + ' ' + racer.firstName} onClick={onClick(racer)} /></li>,
  ft: (that) => { return (<span>{ (that.props.team.inEdit)
    ? <Button style='listFt' onClick={that.handleSubmit} text='儲存' /> : <Button style='listFtDisabled' text='儲存' /> }
    <span className={css.right}><Button style='listFt' onClick={that.handleEditToggle} text='取消' /></span></span>)
  },
  ftReadOnly: (that) => { return <Button style='listFt' onClick={that.handleEditToggle} text='編輯' /> }
}

class Team extends BaseComponent {
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
  handleInput (field) { return (e) => {
    this.dispatch(actionCreators.input(field, (field === 'leader') ? parseInt(e.currentTarget.value) : e.currentTarget.value))
  }}
  handleEditToggle () {
    this.setState({ readOnly: !this.state.readOnly })
    if (!this.state.readOnly) {
      this.dispatch(actionCreators.cancelEdit())
    }
  }
  handleAddRacer (newRacer) { return (e) => {
    let added
    this.props.team.teams[this.props.team.selectedIndex].racers.forEach(racer => {if (racer.id === newRacer.id) { added = true}})
    if (!added) {
      this.dispatch(actionCreators.addRacer(newRacer))
    }
  }}
  handleRemoveRacer (id, toRestore) { return (e) => {
    if (this.props.team.teams[this.props.team.selectedIndex].racers.length > 1) {
      this.dispatch(actionCreators.removeRacer(id, toRestore))
    }
  }}
  handleSelect (index) { return (e) => {
    this.dispatch(actionCreators.selectTeam(index))
    this.setState({ readOnly: true })
  }}
  handleSubmit () {
    this.dispatch(actionCreators.submit())
  }
  componentDidMount () {
    this.dispatch(actionCreators.getTeams())
    this.dispatch(racerActionCreators.getRacers())
  }
  render () {
    const store = this.props.team
    const editBd = (<div className={this.state.readOnly ? css.readOnly : css.content}>
      {render.inputSection({store, inputFunc: this.handleInput})}
      {render.memberSection({store, inputFunc: this.handleInput, deleteFunc: this.handleRemoveRacer})}
      {!this.state.readOnly && render.newMemberSection({racers: this.props.racer.racers, addFunc: this.handleAddRacer})}
    </div>)
    const editFt = (this.state.readOnly) ? render.ftReadOnly(this) : render.ft(this)

    return (<div><Header location={this.props.location} /><div className={css.mainBody}><Table list={store.teams} selectedIndex={store.selectedIndex} editBody={editBd} editFt={editFt} listNameFunc={listNameFunc} selectFunc={this.handleSelect} createFunc={this.handleCreate} /></div></div>)
  }
}

export default Team
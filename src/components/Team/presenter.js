import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/team'
import { actionCreators as racerActionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import TableList from '../TableList'
import css from './style.css'
//import {render} from '../Table/presenter'

const returnInputs = (store, onChange) => {
  let inputs = [
    { label: '名稱', field: 'name'},
    { label: '中文名稱', field: 'nameCht'},
    { label: '描述', field: 'description', type: 'textarea' },
    { label: '網址', field: 'url' }
  ]
  inputs.forEach(input => {
    input.onChange = onChange(input.field)
    input.value = (store.inEdit && store.inEdit[input.field] !== undefined) ? store.inEdit[input.field] : store.teams[store.selectedIndex][input.field]
  })
  return inputs
}
const render = {
  edit: {
    bd: {
      newMemberOption: ({racer, onClick}) => <li key={'racerOption-' + racer.id}><Button text={racer.lastName + ' ' + racer.firstName} onClick={onClick(racer)} /></li>,
      input: {
        text: ({disabled, onChange, value}) => {return <input type='text' onChange={onChange} value={value} disabled={disabled} />},
        textarea: ({disabled, onChange, value}) => {return <textarea onChange={onChange} value={value} disabled={disabled} />}
      },
      item: ({className = css.row, disabled, label, field, onChange, type = 'text', value}) => { return <div className={className} key={field}><label className={css.label}>{label}</label>{ render.edit.bd.input[type]({disabled, onChange, value}) }</div> },
      tableItem: ({racer, leader, onChange, onDelete}) => { return (<tr key={'item-' + racer.id}>
        <td>{racer.lastName + racer.firstName}</td>
        <td className={css.center}><input onChange={onChange('leader')} type='radio' value={racer.id} checked={(leader === racer.id) ? 'checked' : ''} /></td>
        <td className={css.ctrl}>{(racer.toAdd || (racer.id !== leader && !racer.toRemove)) && <Button onClick={onDelete(racer.id)} text='刪除' />}
            {(!racer.toAdd && racer.toRemove) && <Button onClick={onDelete(racer.id, true)} text='還原' />}
        </td>
      </tr>)}
    },
    ft: (that) => { return (<span>{ (that.props.team.inEdit)
      ? <Button style='listFt' onClick={that.handleSubmit} text='儲存' /> : <Button style='listFtDisabled' text='儲存' /> }
      <span className={css.right}><Button style='listFt' onClick={that.handleEditToggle} text='取消' /></span></span>)
    },
    ftReadOnly: (that) => { return <Button style='listFt' onClick={that.handleEditToggle} text='編輯' /> }
  },
  list: {
    bd: {
      content: ({list, selectedIndex, listNameFunc, selectFunc}) => {
        return <ul> { list.map((team, index) => render.list.bd.item({ className: (selectedIndex === index) ? css.selected : css.li, key: 'list-' + index, onClick: selectFunc(index), text: listNameFunc(team) }))
        } </ul>
      },
      item: ({className, key, onClick, text}) => { return <li className={className} key={key}><Button onClick={onClick} style='list' text={text} /></li> }
    },
    ft: (that) => { return <div className={css.ft}><Button style='listFtIcon' text='+' onClick={that.handleCreate} /></div>}
  }
}

const listNameFunc = (team) => (team.id) ? ((team.nameCht && team.nameCht !== '') ? team.nameCht : team.name) : '新增'


class Team extends BaseComponent {
  constructor (props) {
    super(props)
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
    const newVal = (this.state.readOnly) ? false : true
    this.setState({ readOnly: newVal })
    if (newVal) {
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
  // store, readOnly, listNameFunc, selectFunc, editBody
  render () {
    const store = this.props.team
    const team = store.teams[store.selectedIndex]
    const teamRacers = (store.selectedIndex !== -1) ? (store.inEdit && store.inEdit.racers) ? store.inEdit.racers : team.racers : []
    return (<div><Header location={this.props.location} /><div className={css.mainBody}><div className={css.body}>
      <div className={css.list}>{ (store.teams.length > 0) && 
        <div className={css.table}>
          <div className={css.bd}>
            <div className={css.content}>{render.list.bd.content({ list: store.teams, selectedIndex: store.selectedIndex, listNameFunc: listNameFunc, selectFunc: this.handleSelect })}</div>
          </div>
          <div className={css.tableFt}>{render.list.ft(this)}</div>
        </div>}
      </div>
      { (store.selectedIndex !== -1) && <div className={css.edit}>
        <div className={css.table}>
          <div className={(this.state.readOnly) ? css.bdReadOnly : css.bd}>
            <div className={css.content}>
              <section><h3>隊伍資料</h3> { returnInputs(store, this.handleInput).map(input =>  render.edit.bd.item({ ...input })) }</section>
              <section><h3>隊員</h3>
                <table>
                  <thead><tr><th>姓名</th><th>隊長</th><th className={css.ctrl}></th></tr></thead>
                  <tbody>{teamRacers.map(racer => render.edit.bd.tableItem({ racer: racer, leader: (store.inEdit && store.inEdit.leader !== undefined) ? store.inEdit.leader : team.leader, onChange: this.handleInput, onDelete: this.handleRemoveRacer }))}</tbody>
                </table>
              </section>
              {!this.state.readOnly && <section><h3>新增隊員</h3><div className={css.addList}><ul>{ (this.props.racer.racers.length > 0) && this.props.racer.racers.map(racer => { if (!racer.team) {return render.edit.bd.newMemberOption({racer, onClick: this.handleAddRacer})}} )}</ul></div></section>}
            </div>
          </div>
          <div className={css.tableFt}>{this.state.readOnly ? render.edit.ftReadOnly(this) : render.edit.ft(this)}</div>
        </div>
      </div> }
    </div></div></div>)
  }
}

export default Team
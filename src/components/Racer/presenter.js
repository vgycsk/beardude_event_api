import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import Table from '../Table'
import css from './style.css'

const valueFunc = (store, field) => (store.inEdit && store.inEdit[field] !== undefined) ? store.inEdit[field] : store.racers[store.selectedIndex][field]
const listNameFunc = (racer) => (racer.id) ? racer.lastName + racer.firstName : '新增'

const returnBasicInputs = (store, onChange) => {
  let inputs = [{ label: '電子信箱', field: 'email'},
    { label: '電話', field: 'phone'},
    { label: '姓氏', field: 'lastName' },
    { label: '名字', field: 'firstName' },
    { label: '綽號', field: 'nickName' },
    { label: '生日', field: 'birthday' },
    { label: '身分證或護照', field: 'idNumber' },
    { label: '已啟用', field: 'isActive', type: 'checkbox' }]
  inputs.forEach(input => {
    input.onChange = onChange(input.field)
    input.value = valueFunc(store, input.field)
  })
  return inputs
}
const returnPasswordInputs = (store, onChange) => {
  let inputs = [{ label: '新密碼', field: 'password', type: 'password' },
    { label: '確認新密碼', field: 'confirmPassword', type: 'password' }]
  inputs.forEach(input => {
    input.onChange = onChange(input.field)
    input.value = valueFunc(store, input.field)
  })
  return inputs
}
const returnAddressInputs = (store, onChange) => {
  let inputs = [{ label: '街道', field: 'street' },
    { label: '區', field: 'district' },
    { label: '城市', field: 'city' },
    { label: '鄉鎮', field: 'county' },
    { label: '國家', field: 'country' },
    { label: '郵遞區號', field: 'zip' }]
  inputs.forEach(input => {
    input.onChange = onChange(input.field)
    input.value = valueFunc(store, input.field)
  })
  return inputs
}
const returnTeamInputs = (racer) => [
  { label: '車隊', field: 'name', disabled: true, value: (racer.team) ? racer.team.name : '(無)'},
  { label: '隊長', field: 'leader', type: 'checkbox', disabled: true, value: (racer.team && (racer.id === racer.team.leader)) ? true : false}
]

const render = {
  input: {
    checkbox: ({disabled, onChange, value}) => <input type='checkbox' onChange={onChange} checked={value} value={value} disabled={disabled} />,
    password: ({disabled, onChange, value}) => <input type='password' onChange={onChange} value={value} disabled={disabled} />,
    text: ({disabled, onChange, value}) => <input type='text' onChange={onChange} value={value} disabled={disabled} />
  },
  item: ({disabled, label, field, onChange, type = 'text', value}) => <li key={field}><label>{label}</label>{ render.input[type]({disabled, onChange, value}) }</li>,
  section: ({heading, inputs}) => <section><h3>{ heading }</h3><ul>{ inputs.map(input =>  render.item({ ...input })) }</ul></section>,
  ft: (that) => { return (<span>{ (that.props.racer.inEdit)
    ? <Button style='listFt' onClick={that.handleSubmit} text='儲存' /> : <Button style='listFtDisabled' text='儲存' /> }
    <span className={css.right}><Button style='listFt' onClick={that.handleEditToggle} text='取消' /></span></span>)
  },
  ftReadOnly: (that) => { return <Button style='listFt' onClick={that.handleEditToggle} text='編輯' /> }
}

class Racer extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = { readOnly: true }
    this.dispatch = this.props.dispatch
    this._bind('handleCreate', 'handleInput', 'handleEditToggle', 'handleSelect', 'handleSubmit')
  }
  handleCreate () {
    this.dispatch(actionCreators.create())
    this.setState({ readOnly: false })
  }
  handleInput (field) { return (e) => {
    const value = (field === 'isActive') ? ((e.target.value === 'true') ? false : true) : e.currentTarget.value
    this.dispatch(actionCreators.input(field, value))
  }}
  handleEditToggle () {
    this.setState({ readOnly: !this.state.readOnly })
    if (!this.state.readOnly) {
      this.dispatch(actionCreators.cancelEdit())
    }
  }
  handleSelect (index) { return (e) => {
    this.dispatch(actionCreators.selectRacer(index))
    this.setState({ readOnly: true })
  }}
  handleSubmit () {
    this.dispatch(actionCreators.submit())
    // TO DO: overlay dialog
//    this.setState({ readOnly: true })
  }
  componentDidMount () {
    this.dispatch(actionCreators.getRacers())
  }
  render () {
    const store = this.props.racer
    const editBd = (store.racers[store.selectedIndex]) ? (<div className={this.state.readOnly ? css.readOnly : css.content}>
      { render.section({ heading: '身份', inputs: returnBasicInputs(store, this.handleInput) }) }
      { render.section({ heading: '更改密碼', inputs: returnPasswordInputs(store, this.handleInput) }) }
      { render.section({ heading: '聯絡地址', inputs: returnAddressInputs(store, this.handleInput) }) }
      { render.section({ heading: '所屬車隊', inputs: returnTeamInputs(store.racers[store.selectedIndex]) }) }
    </div>) : ''
    const editFt = (this.state.readOnly) ? render.ftReadOnly(this) : render.ft(this)

    return (<div><Header location={this.props.location} /><div className={css.mainBody}><Table list={store.racers} selectedIndex={store.selectedIndex} editBody={editBd} editFt={editFt} listNameFunc={listNameFunc} selectFunc={this.handleSelect} createFunc={this.handleCreate} /></div></div>)
  }
}

export default Racer

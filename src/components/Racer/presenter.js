import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/racer'
import Header from '../Header'
import Table from '../Table'
import css from './style.css'
import { renderInput } from '../Table/presenter'

const valueFunc = (store, field) => (store.inEdit && store.inEdit[field] !== undefined) ? store.inEdit[field] : store.racers[store.selectedIndex][field]
const listNameFunc = (racer) => (racer.id) ? racer.lastName + racer.firstName : '新增'
const returnBasicInputs = (store, onChange) => [
  { label: '電子信箱', field: 'email', onChange: onChange('email'), value: valueFunc(store, 'email') },
  { label: '電話', field: 'phone', onChange: onChange('phone'), value: valueFunc(store, 'phone') },
  { label: '姓氏', field: 'lastName', onChange: onChange('lastName'), value: valueFunc(store, 'lastName') },
  { label: '名字', field: 'firstName', onChange: onChange('firstName'), value: valueFunc(store, 'firstName') },
  { label: '綽號', field: 'nickName', onChange: onChange('nickName'), value: valueFunc(store, 'nickName') },
  { label: '生日', field: 'birthday', onChange: onChange('birthday'), value: valueFunc(store, 'birthday') },
  { label: '身分證或護照', field: 'idNumber', onChange: onChange('idNumber'), value: valueFunc(store, 'idNumber') },
  { label: '已啟用', field: 'isActive', type: 'checkbox', onChange: onChange('isActive'), value: valueFunc(store, 'isActive') }
]
const returnPasswordInputs = (store, onChange) => [
  { label: '新密碼', field: 'password', type: 'password', onChange: onChange('password'), value: valueFunc(store, 'password') },
  { label: '確認新密碼', field: 'confirmPassword', type: 'password', onChange: onChange('confirmPassword'), value: valueFunc(store, 'confirmPassword') }
]
const returnAddressInputs = (store, onChange) => [
  { label: '街道', field: 'street', onChange: onChange('street'), value: valueFunc(store, 'street') },
  { label: '區', field: 'district', onChange: onChange('district'), value: valueFunc(store, 'district') },
  { label: '城市', field: 'city', onChange: onChange('city'), value: valueFunc(store, 'city') },
  { label: '鄉鎮', field: 'county', onChange: onChange('county'), value: valueFunc(store, 'county') },
  { label: '國家', field: 'country', onChange: onChange('country'), value: valueFunc(store, 'country') },
  { label: '郵遞區號', field: 'zip', onChange: onChange('zip'), value: valueFunc(store, 'zip') }
]
const returnTeamInputs = (racer) => [
  { label: '車隊', field: 'name', disabled: true, value: (racer.team) ? racer.team.name : '(無)' },
  { label: '隊長', field: 'leader', type: 'checkbox', disabled: true, value: !!((racer.team && (racer.id === racer.team.leader))) }
]
const render = {
  item: ({disabled, label, field, onChange, type = 'text', value}) => <li key={field}><label>{label}</label>{ renderInput[type]({disabled, onChange, value}) }</li>,
  section: ({heading, inputs, key}) => <section key={key}><h3>{ heading }</h3><ul>{ inputs.map(input => render.item({ ...input })) }</ul></section>
}

export default class Racer extends BaseComponent {
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
  handleInput (field) {
    return (e) => {
      const value = (field === 'isActive') ? (e.target.value !== 'true') : e.currentTarget.value
      this.dispatch(actionCreators.input(field, value))
    }
  }
  handleEditToggle () {
    this.setState({ readOnly: !this.state.readOnly })
    if (!this.state.readOnly) {
      this.dispatch(actionCreators.cancelEdit())
    }
  }
  handleSelect (index) {
    return (e) => {
      this.dispatch(actionCreators.selectRacer(index))
      this.setState({ readOnly: true })
    }
  }
  handleSubmit () {
    this.dispatch(actionCreators.submit())
    this.setState({ readOnly: true })
  }
  componentDidMount () {
    if (!this.props.racer.racers) {
      this.dispatch(actionCreators.getRacers())
    }
  }
  render () {
    const store = this.props.racer
    const editBd = (store.racers && store.selectedIndex > -1 && store.racers[store.selectedIndex]) ? [
      render.section({ heading: '身份', inputs: returnBasicInputs(store, this.handleInput), key: 'sec-0' }),
      render.section({ heading: '更改密碼', inputs: returnPasswordInputs(store, this.handleInput), key: 'sec-1' }),
      render.section({ heading: '聯絡地址', inputs: returnAddressInputs(store, this.handleInput), key: 'sec-2' }),
      render.section({ heading: '所屬車隊', inputs: returnTeamInputs(store.racers[store.selectedIndex]), key: 'sec-3' })
    ] : []

    return (<div><Header location={this.props.location} nav='base' /><div className={css.mainBody}><Table list={store.racers} selectedIndex={store.selectedIndex} editBody={editBd} inEdit={(!!this.props.racer.inEdit)} readOnly={this.state.readOnly} handleSubmit={this.handleSubmit} handleEditToggle={this.handleEditToggle} listNameFunc={listNameFunc} handleSelect={this.handleSelect} handleCreate={this.handleCreate} /></div></div>)
  }
}

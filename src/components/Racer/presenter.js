import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import Table from '../Table'
import css from './style.css'

const returnTableHeight = (pageMinHeight = 360, ftHeight = 89) => (Math.max(window.innerHeight, pageMinHeight) - ftHeight)
let basicInputs = [
  { label: '電子信箱', field: 'email'},
  { label: '電話', field: 'phone' },
  { label: '姓氏', field: 'lastName' },
  { label: '名字', field: 'firstName' },
  { label: '綽號', field: 'nickName' },
  { label: '生日', field: 'birthday' },
  { label: '身分證或護照', field: 'idNumber' },
  { label: '已啟用', field: 'isActive', type: 'checkbox' }
]
let passwordInputs = [
  { label: '新密碼', field: 'password', type: 'password' },
  { label: '確認新密碼', field: 'confirmPassword', type: 'password' }
]
let addressInputs = [
  {label: '街道', field: 'street'},
  {label: '區', field: 'district'},
  {label: '城市', field: 'city'},
  {label: '鄉鎮', field: 'county'},
  {label: '國家', field: 'country'},
  {label: '郵遞區號', field: 'zip'}
]

const render = {
  edit: {
    bd: {
      content: (that) => {
        let inputs = [...basicInputs, ...passwordInputs, ...addressInputs]

        inputs.forEach(input => {
          input.onChange = that.handleInput(input.field)
          input.value = (that.props.racer.racerInEdit && that.props.racer.racerInEdit[input.field]) ? that.props.racer.racerInEdit[input.field] : that.props.racer.racers[that.props.racer.selectedRacerIndex][input.field]
        })
        return <div>{ render.edit.bd.section({ heading: '身份', inputs: basicInputs }) } { render.edit.bd.section({ heading: '更改密碼', inputs: passwordInputs }) } { render.edit.bd.section({ heading: '聯絡地址', inputs: addressInputs }) }</div>
      },
      input: {
        checkbox: ({onChange, value}) => { return <input type='checkbox' onChange={onChange} checked={value} />},
        password: ({onChange, value}) => { return <input className={css.input} type='password' onChange={onChange} value={value} />},
        text: ({onChange, value}) => { return <input className={css.input} type='text' onChange={onChange} value={value} />}
      },
      item: ({className = css.row, label, field, onChange, type = 'text', value}) => { return <div className={className} key={field}><label className={css.label}>{label}</label>{ render.edit.bd.input[type]({onChange, value}) }</div> },
      section: ({heading, inputs}) => { return <div className={css.section}><h3>{ heading }</h3> { inputs.map(input =>  render.edit.bd.item({ ...input })) }</div>
      }
    },
    ft: (that) => { return (<span>{ (that.props.racer.racerInEdit)
      ? <Button style='listFt' onClick={that.handleSubmit} text='儲存' /> : <Button style='listFtDisabled' text='儲存' /> }
      <span className={css.right}><Button style='listFt' onClick={that.handleEditToggle} text='取消' /></span></span>)
    },
    ftReadOnly: (that) => { return <Button style='listFt' onClick={that.handleEditToggle} text='編輯' /> }
  },
  list: {
    bd: {
      content: (that) => {
        const store = that.props.racer
        return <ul> { store.racers &&
          store.racers.map((racer, index) => render.list.bd.item({ className: (store.selectedRacerIndex === index) ? css.selected : css.li, key: racer.id, onClick: that.handleSelect(racer.id), text: racer.firstName + racer.lastName }))
        } </ul>
      },
      item: ({className, key, onClick, text}) => { return <li className={className} key={key}><Button onClick={onClick} style='list' text={text} /></li> }
    },
    ft: (that) => { return <div className={css.ft}><Button style='listFtIcon' text='+' /></div>}
  }
}

class Racer extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = { tableHeight: returnTableHeight(), readOnly: true, selectedCategoryIndex: 0, showPasswordFields: false }
    this.dispatch = this.props.dispatch
    this._bind('handleInput', 'handleEditToggle', 'handlePasswordFieldsToggle', 'handleSelect', 'handleSubmit', 'handleUpdateTableHeight')
  }
  handleInput (field) { return (e) => {
    this.dispatch(actionCreators.input(field, e.currentTarget.value))
  }}
  handleEditToggle () {
    this.setState({ readOnly: (this.state.readOnly) ? false : true })
  }
  handleSelectCategory (index) {return (e) => {
    this.setState({selectedCategoryIndex: index})
  }}
  handleSelect (id) { return (e) => {
    e.stopPropagation()
    this.dispatch(actionCreators.selectRacer(id))
    this.setState({ readOnly: true, selectedCategoryIndex: 0 })
  }}
  handlePasswordFieldsToggle () { return (e) => {
    console.log('newState 123 123: ', newState)
    const newState = (this.state.showPasswordFields) ? false : true
    this.setState({ showPasswordFields: newState})
  }}
  handleSubmit () {
    this.dispatch(actionCreators.submit())
  }
  handleUpdateTableHeight () {
    this.setState({ tableHeight: returnTableHeight() })
  }
  componentDidMount () {
    window.addEventListener('resize', this.handleUpdateTableHeight)
    this.dispatch(actionCreators.getRacers())
  }
  render () {
    return (<div><Header /><div className={css.mainBody}><div className={css.body}>
      <div className={css.list}><Table bdStyle={{height: this.state.tableHeight}} content={render.list.bd.content(this)} ft={render.list.ft()} /></div>
      { (this.props.racer.selectedRacerIndex !== -1) && <div className={css.edit}><Table bdStyle = {{height: this.state.tableHeight}} content = {render.edit.bd.content(this)} readOnly = {this.state.readOnly} ft = {this.state.readOnly ? render.edit.ftReadOnly(this) : render.edit.ft(this)} /></div> }
      </div></div></div>)
  }
}

export default Racer

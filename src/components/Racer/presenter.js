import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import Table from '../Table'
import css from './style.css'

class Racer extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = { listHeight: this.returnListWrapperHeight(), readOnly: true, selectedCategoryIndex: 0 }
    this.dispatch = this.props.dispatch
    this._bind('handleInput', 'handleEditToggle', 'handleSelect', 'updateListWrapperHeight')
  }
  handleInput (field) {
    return (e) => { this.dispatch(actionCreators.input(field, e.currentTarget.value)) }
  }
  handleEditToggle () {
    this.setState({readOnly: (this.state.readOnly) ? false : true})
  }
  handleSelectCategory (index) {
    return (e) => {
      e.stopPropagation()
      this.setState({selectedCategoryIndex: index})
    }
  }
  handleSelect (id) {
    return (e) => {
      e.stopPropagation()
      this.dispatch(actionCreators.selectRacer(id))
      this.setState({ readOnly: true, selectedCategoryIndex: 0 })
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.updateListWrapperHeight)
    this.dispatch(actionCreators.getRacers())
  }
  updateListWrapperHeight () {
    this.setState({listHeight: this.returnListWrapperHeight()})
  }
  returnListWrapperHeight (pageMinHeight = 360, ftHeight = 89) {
    return Math.max(window.innerHeight, pageMinHeight) - ftHeight
  }
  renderListItem ({counter, key, onClick, className, text}) {
    return <li className={className} key={key}><Button counter={counter} onClick={onClick} style='list' text={text} /></li>
  }
  renderRacerList (racerStore = this.props.racer) {
    return (<ul>{racerStore.racers &&
      racerStore.racers.map((racer, index) => this.renderListItem({
        className: (racerStore.selectedRacerIndex === index) ? css.selected : css.li,
        key: 'racer-' + racer.id,
        onClick: this.handleSelect(racer.id),
        text: racer.firstName + racer.lastName
      }))
    }</ul>)
  }
  renderListFt () {
    return (<div className={css.ft}><Button style='listFtIcon' text='+' /></div>)
  }
  renderInputRow ({label, field, onChange = this.handleInput(field), type, value}) {
    return (<div className={css.row} key={'input-' + field}><label className={css.label}>{label}</label>
      {(type === 'checkbox')
        ? <input type='checkbox' onChange={onChange} checked={value} />
        : <input className={css.input} type={type} onChange={onChange} value={value} />}
    </div>)
  }
  renderEditContent () {
    const racerStore = this.props.racer
    const basicInputs = [
      { label: '電子信箱', field: 'email' },
      { label: '電話', field: 'phone' },
      { label: '姓氏', field: 'lastName' },
      { label: '名字', field: 'firstName' },
      { label: '綽號', field: 'nickName' },
      { label: '生日', field: 'birthday' },
      { label: '身分證或護照', field: 'idNumber' },
      { label: '已啟用', field: 'isActive', type: 'checkbox' },
      { label: '密碼', field: 'password', type: 'password' },
      { label: '確認密碼', field: 'confirmPassword', type: 'password' }
    ]
    const addressInputs = [
      {label: '街道', field: 'street'},
      {label: '區', field: 'district'},
      {label: '城市', field: 'city'},
      {label: '鄉鎮', field: 'county'},
      {label: '國家', field: 'country'},
      {label: '郵遞區號', field: 'zip'}
    ]
    return (<div>
      <div className={css.section}><h3>身份</h3>{basicInputs.map(input => {
        return this.renderInputRow({...input, value: (racerStore.racerInEdit[input.field]) ? racerStore.racerInEdit[input.field] : racerStore.racers[racerStore.selectedRacerIndex][input.field]})
      })}</div>
      <div className={css.section}><h3>地址</h3>{addressInputs.map(input => {
        return this.renderInputRow({...input, value: (racerStore.racerInEdit[input.field]) ? racerStore.racerInEdit[input.field] : racerStore.racers[racerStore.selectedRacerIndex][input.field]})
      })}</div>
    </div>)
  }
  renderEditFt () {
    if (this.state.readOnly) { return <Button style='listFt' onClick={this.handleEditToggle} text='編輯' /> }
    return (<span>{(Object.is(this.props.racer.racerInEdit, {}))
      ? <Button style='listFtDisabled' text='儲存' />
      : <Button style='listFt' onClick={this.handleSave} text='儲存' />}
      <span className={css.right}><Button style='listFt' onClick={this.handleEditToggle} text='取消' /></span></span>)
  }
  render () {
    return (<div><Header /><div className={css.mainBody}><div className={css.body}>
      <div className={css.list}><Table bdStyle={{height: this.state.listHeight}} content={this.renderRacerList()} ft={this.renderListFt()} /></div>
      { (this.props.racer.selectedRacerIndex !== -1) &&
        <div className={css.edit}><Table bdStyle = {{height: this.state.listHeight}} content = {this.renderEditContent()} readOnly = {this.state.readOnly} ft = {this.renderEditFt()} /></div>
      }
    </div></div></div>)
  }
}

export default Racer

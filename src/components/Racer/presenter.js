import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import css from './style.css'

class Account extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      listHeight: this.returnListWrapperHeight(),
      readOnly: true
    }
    this.dispatch = this.props.dispatch
    this._bind('handleInput', 'handleEditToggle', 'handleSelect', 'updateListWrapperHeight')
  }
  handleInput (field) {
    return (e) => {
      this.dispatch(actionCreators.input(field, e.currentTarget.value))
    }
  }
  handleEditToggle () {
    this.setState({readOnly: false})
    console.log('edit toggle')
//    this.dispatch(actionCreators.selectRacer(id))
  }
  handleSelect (id) {
    return (e) => {
      e.stopPropagation()
      this.dispatch(actionCreators.selectRacer(id))
      this.setState({readOnly: true})
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.updateListWrapperHeight)
    this.dispatch(actionCreators.getRacers())
  }
  updateListWrapperHeight () {
    const that = this
    this.setState({listHeight: that.returnListWrapperHeight()})
  }
  returnListWrapperHeight (pageMinHeight = 360, ftHeight = 89) {
    return Math.max(window.innerHeight, pageMinHeight) - ftHeight
  }
  renderTableListItem ({counter, key, onClick, className, text}) {
    return (<li className={className} key={key}>
      <Button counter={counter} onClick={onClick} style='list' text={text} />
    </li>)
  }
  renderTableList (racers = this.props.racer.racers, selectedRacerIndex = this.props.racer.selectedRacerIndex) {
    return (<div className={css.list}>
      <div className={css.bd} onClick={this.handleSelect(-1)} style={{height: this.state.listHeight}}>
        <ul className={css.content}>{racers &&
          racers.map((racer, index) => this.renderTableListItem({
            className: (selectedRacerIndex === index) ? css.selected : css.li,
            key: 'racer-' + racer.id,
            onClick: this.handleSelect(racer.id),
            text: racer.firstName + racer.lastName}))
          }</ul>
      </div>
      <div className={css.ft}><Button style='listFtIcon' text='+' /></div>
    </div>)
  }
  renderTableEdit (racer = this.props.racer.racers[this.props.racer.selectedRacerIndex], racerInEdit = this.props.racer.racerInEdit) {
    return (<div className={css.edit}>
        <div className={(this.state.readOnly) ? css.bdReadOnly : css.bd} style={{height: this.state.listHeight}}>
          <div className={css.content}>
            <div className={css.section}>
              <h3>基本資料</h3>
              <h4></h4>
              <div className={css.row}>
                <label className={css.label}>電子信箱</label>
                <input className={css.input} type='text' onChange={this.handleInput('email')} value={racer.email} />
              </div>
              <div className={css.row}>
                <label className={css.label}>電話</label>
                <input className={css.input}  type='text' onChange={this.handleInput('phone')} value={racer.phone} />
              </div>
              <div className={css.row}>
                <label className={css.label}>姓氏</label>
                <input className={css.input}  type='text' onChange={this.handleInput('lastName')} value={racer.lastName} />
              </div>
              <div className={css.row}>
                <label className={css.label}>名字</label>
                <input className={css.input}  type='text' onChange={this.handleInput('firstName')} value={racer.firstName} />
              </div>
            </div>
            <div className={css.section}>
            </div>
          </div>
        </div>
        <div className={css.ft}><Button style='listFt' onClick={this.handleEditToggle} text='編輯' /></div>
    </div>)
  }
  render () {
    return (<div><Header />
      <div className={css.mainBody}><div className={css.body}>
        {this.renderTableList()}
        {(this.props.racer.selectedRacerIndex !== undefined) && this.renderTableEdit()}
      </div></div>
    </div>)
  }
}

export default Account

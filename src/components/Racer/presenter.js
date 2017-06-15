import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/racer'
import Header from '../Header'
import Button from '../Button'
import css from './style.css'

class Account extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {listHeight: this.returnListWrapperHeight()}
    this.dispatch = this.props.dispatch
    this._bind('handleSelect', 'updateListWrapperHeight')
  }
  handleSelect (id) {
    return (e) => {
      this.dispatch(actionCreators.selectRacer(id))
    }
  }
  componentDidMount () {
    window.addEventListener('resize', this.updateListWrapperHeight)
    this.dispatch(actionCreators.getRacers())
  }
  updateListWrapperHeight (that = this) {
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
    return (<div className={css.listWrap} style={{height: this.state.listHeight + 'px'}}>
      <ul>{racers &&
        racers.map((racer, index) => this.renderTableListItem({
          className: (selectedRacerIndex === index) ? css.selected : css.li,
          key: 'racer-' + racer.id,
          onClick: this.handleSelect(racer.id),
          text: racer.firstName + racer.lastName}))
        }</ul>
      <div className={css.ft}><Button style='listFtIcon' text='+' /></div>
    </div>)
  }
  renderTableEdit (racer = this.props.racer.selectedRacerIndex) {
    return (<div className={css.editWrap}><div className={css.form}>
      <div className={css.ft}><Button style='listFt' text='編輯' /></div>
    </div></div>)
  }
  render () {
    return (<div><Header />
      <div className={css.mainBody}><div className={css.body}>
        {this.renderTableList()}
        {this.props.selectedRacerIndex && this.renderTableEdit()}
      </div></div>
    </div>)
  }
}

export default Account

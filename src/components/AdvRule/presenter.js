import React from 'react'
import BaseComponent from '../BaseComponent'
import Button from '../Button'
import { actionCreators as eventActions} from '../../ducks/event'

import css from './style.css'

const validate = {
  ruleCompleted: (rule) => (rule.rankFrom !== undefined && rule.rankTo !== undefined && rule.toRace !== undefined) ? true : false,
  continuity: (rules) => {
    let hasError
    if (rules.length > 1) { rules.forEach((rule, i) => { if (rules[i + 1] && (rules[i + 1].rankFrom - rule.rankTo !== 1)) { hasError = true } }) }
    return (hasError) ? '晉級規則的名次必須連續' : undefined
  },
  incrementalRange: (rule) => (rule.rankTo >= rule.rankFrom) ? undefined : '名次必須從小到大做設定',
  startFromZero: (rules) => (rules[0].rankFrom === 0) ? undefined : '需從第一名開始設定晉級規則',
  noOverflow: (raceId, modifiedRules, toRace, races) => {
    const advRules = races.map(race => (race.id === raceId) ? modifiedRules : race.advancingRules).reduce((sum, v) => sum.concat(v))
    const sum = advRules.reduce((sum, V) => {return sum + (V.rankTo - V.rankFrom + 1)}, 0)
    let toRaceObj = races.filter(V => (V.id === toRace))[0]
    const toRaceName = (toRaceObj.nameCht) ? toRaceObj.nameCht : toRaceObj.name
    return (toRaceObj.racerNumberAllowed !== sum) ? `晉級至「${toRaceName}」的人數加總（${sum}）不符合設定的人數（${toRaceObj.racerNumberAllowed}）` : undefined
  }
}
const returnRankArray = (racerNumberAllowed) => {
  let options = [];
  for (let i = 0; i < racerNumberAllowed; i += 1) {
    options.push({value: i, label: i + 1})
  }
  return options
}
const render = {
  ruleItem: ({races, raceObj, rules, onEdit, onRemove, disabled, options}) => rules.map((V, index) => <tr key={'adv' + index}>
    <td>
      從 <select value={V.rankFrom} disabled={disabled} onChange={onEdit({index, field: 'rankFrom'})}>
        <option key='opt0'>名次...</option>
        {options.map(V => <option key={'opt' + V.label}value={V.value}>{V.label}</option>)}
      </select>
      到 <select disabled={disabled} value={V.rankTo} onChange={onEdit({index, field: 'rankTo'})}>
        <option key='opt0'>名次...</option>{options.map(V => <option key={'opt' + V.label}value={V.value}>{V.label}</option>)}
      </select>
    </td>
    <td>
      <select disabled={disabled} onChange={onEdit({index, field: 'toRace'})} value={V.toRace}>
        <option key='toRace0'>賽事...</option>
        {races.map((V) => { if ((V.id !== raceObj.id) && !V.isEntryRace) { return <option key={'toRace' + V.id} value={V.id}>{V.nameCht}</option>}})}
      </select>
      {!disabled && <span className={css.right}><Button onClick={onRemove({index})} style='del' text='x' /></span>}
    </td>
  </tr>)
}

class AdvRule extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      warning: undefined,
      raceId: undefined,
      modified: undefined,
      canSubmit: true
    }
    this.dispatch = this.props.dispatch
    this._bind('handleAdd', 'handleRemove', 'handleSubmit', 'handleToggle', 'handleEdit')
  }
  handleSubmit () {
    if (this.state.canSubmit) {
      const successCallback = () => this.setState({raceId: undefined, modified: undefined})
      this.dispatch(eventActions.submitAdvancingRules(this.state, successCallback))
    }
  }
  handleToggle (raceObj, index) { return (e) => {
    if (this.state.raceId === raceObj.id) {
      return this.setState({raceId: undefined, raceSelected: -1, modified: undefined, warning: undefined})
    }
    this.setState({raceId: raceObj.id, raceSelected: index, modified: [...raceObj.advancingRules]})
  }}
  handleAdd () { return (e) => {
    this.setState({modified: [...this.state.modified, {}]})
  }}
  handleRemove ({index}) { return (e) => {
    let stateObj = { modified: this.state.modified, warning: undefined, canSubmit: true }

    stateObj.modified.splice(index, 1)
    if (stateObj.modified.length > 0) {
      stateObj.warning = validate.startFromZero(stateObj.modified)
      if (stateObj.warning) {
        stateObj.canSubmit = false
        return this.setState(stateObj)
      }
      stateObj.warning = validate.continuity(stateObj.modified)
      if (stateObj.warning) {
          stateObj.canSubmit = false
      }
      this.setState(stateObj)
    }
  }}
  handleEdit ({index, field}) { return (e) => {
    let stateObj = { modified: this.state.modified, warning: undefined, canSubmit: true }

    stateObj.modified[index][field] = parseInt(e.target.value)
    if (validate.ruleCompleted(stateObj.modified[index])) {
      stateObj.warning = validate.startFromZero(stateObj.modified)
      if (stateObj.warning) {
        return this.setState(stateObj)
      }
      stateObj.warning = validate.incrementalRange(stateObj.modified[index])
      if (stateObj.warning) {
        stateObj.canSubmit = false
        return this.setState(stateObj)
      }
      stateObj.warning = validate.continuity(stateObj.modified)
      if (stateObj.warning) {
        return this.setState(stateObj)
      }
      stateObj.warning = validate.noOverflow(this.state.raceId, stateObj.modified, stateObj.modified[index].toRace, this.props.races)
    } else {
      stateObj.canSubmit = false
    }
    this.setState(stateObj)
  }}

  render () {
    const { races } = this.props
    const { canSubmit, warning, raceId, modified } = this.state

    return (<div className={css.advTable}>
      <h3>晉級規則</h3>
      <h4 className={canSubmit ? css.warning : css.forbidden}>{warning}</h4>
      {races.map((V, I) => {
        const options = returnRankArray(V.racerNumberAllowed)
        return <div key={'race' + I}><label>{V.nameCht}</label>
          {!V.isFinalRace && <div className={css.tableInput}>
            <table>
              <thead>
                <tr>
                  <th>資格</th><th>晉級到</th>
                </tr>
              </thead>
              <tbody>
                {render.ruleItem({races, rules: (modified && raceId === V.id) ? modified : V.advancingRules, onEdit: this.handleEdit, onRemove: this.handleRemove, raceObj: V, disabled: (raceId === V.id) ? false : true, options: options})}
                <tr>
                  <td className={css.ft} colSpan='4'>{(raceId === V.id)
                    ? <span><Button style='listFtIcon' text='+' onClick={this.handleAdd()}/><span className={css.right}><Button onClick={this.handleSubmit} text='儲存' /><Button text='取消' style='grey' onClick={this.handleToggle(V, I)}/></span></span>
                    : (!raceId && <span className={css.right}><Button text='編輯' onClick={this.handleToggle(V, I)}/></span>)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>}
        </div>})}
      <div className={css.boxFt}><Button style='grey' onClick={this.props.handleCancelEdit} text='關閉' /></div>
    </div>)
  }
}

export default AdvRule
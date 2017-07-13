import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/event'
import css from './style.css'

const render = {
  advRuleTable: ({advRuleMsg, races, modifiedId, modifiedRules, onEdit, onSubmit, onToggle, onCancel}) => {
    return <div className={css.advTable}><h3>晉級規則</h3><h4 className={css.alert}>{advRuleMsg}</h4>
      {races.map((V, I) => {
        let options = [];
        for (let i = 0; i < V.racerNumberAllowed; i += 1) {
          options.push({value: i, label: i + 1})
        }
        return <div key={'race' + I}><label>{V.nameCht}</label>
          {!V.isFinalRace && <div className={css.tableInput}>
            <table><thead><tr><th>資格</th><th>晉級到</th></tr></thead><tbody>
            {render.advRuleItem({races, rules: (modifiedRules && modifiedId === V.id) ? modifiedRules : V.advancingRules, onEdit, raceObj: V, disabled: (modifiedId === V.id) ? false : true, options: options})}
              <tr><td className={css.ft} colSpan='4'>
                {(modifiedId === V.id)
                  ? <span><Button style='listFtIcon' text='+' onClick={onEdit({raceObj: V, action: 'add'})}/><span className={css.right}><Button onClick={onSubmit} text='儲存' /><Button text='取消' style='grey' onClick={onToggle(V, I)}/></span></span>
                  : (!modifiedId && <span className={css.right}><Button onClick={onSubmit} text='編輯' onClick={onToggle(V, I)}/></span>)}
                </td></tr>
            </tbody></table>
          </div>}
        </div>})}
      <div className={css.boxFt}><Button style='grey' onClick={onCancel} text='關閉' /></div>
    </div>
  },
  advRuleItem: ({races, raceObj, rules, onEdit, disabled, options}) => rules.map((V, index) => <tr key={'adv' + index}>
    <td>從 <select value={V.rankFrom} disabled={disabled} onChange={onEdit({action: 'edit', index, field: 'rankFrom'})}><option key='opt0'>名次...</option>{options.map(V => <option key={'opt' + V.label}value={V.value}>{V.label}</option>)}</select>
      到 <select disabled={disabled} value={V.rankTo} onChange={onEdit({action: 'edit', index, field: 'rankTo'})}><option key='opt0'>名次...</option>{options.map(V => <option key={'opt' + V.label}value={V.value}>{V.label}</option>)}</select></td>
    <td><select disabled={disabled} onChange={onEdit({action: 'edit', index, field: 'toRace'})} value={V.toRace}><option key='toRace0'>賽事...</option>{races.map((V) => { if ((V.id !== raceObj.id) && !V.isEntryRace) { return <option key={'toRace' + V.id} value={V.id}>{V.nameCht}</option>}})}</select> {!disabled && <span className={css.right}><Button onClick={onEdit({action: 'delete', index})} style='del' text='x' /></span>}</td>
  </tr>),
}

class AdvRule extends BaseComponent {
  constructor (props) {
    super(props)
    this.state = {
      advRuleMsg: undefined,
      advRuleRaceId: undefined,
      advRuleModified: undefined
    }
//    this._bind('handleLogout', 'handleToggleAccountMenu')
  }
  render () {

    return (<div className={css.advTable}><h3>晉級規則</h3><h4 className={css.alert}>{advRuleMsg}</h4>
      {races.map((V, I) => {
        let options = [];
        for (let i = 0; i < V.racerNumberAllowed; i += 1) {
          options.push({value: i, label: i + 1})
        }
        return <div key={'race' + I}><label>{V.nameCht}</label>
          {!V.isFinalRace && <div className={css.tableInput}>
            <table><thead><tr><th>資格</th><th>晉級到</th></tr></thead><tbody>
            {render.advRuleItem({races, rules: (modifiedRules && modifiedId === V.id) ? modifiedRules : V.advancingRules, onEdit, raceObj: V, disabled: (modifiedId === V.id) ? false : true, options: options})}
              <tr><td className={css.ft} colSpan='4'>
                {(modifiedId === V.id)
                  ? <span><Button style='listFtIcon' text='+' onClick={onEdit({raceObj: V, action: 'add'})}/><span className={css.right}><Button onClick={onSubmit} text='儲存' /><Button text='取消' style='grey' onClick={onToggle(V, I)}/></span></span>
                  : (!modifiedId && <span className={css.right}><Button onClick={onSubmit} text='編輯' onClick={onToggle(V, I)}/></span>)}
                </td></tr>
            </tbody></table>
          </div>}
        </div>})}
      <div className={css.boxFt}><Button style='grey' onClick={onCancel} text='關閉' /></div>
    </div>)
  }
}

export default AdvRule
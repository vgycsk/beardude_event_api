import React from 'react'
import Button from '../Button'
import css from './style.css'

const renderList = ({selectedIndex, index, handleSelect, name}) => <li className={(selectedIndex === index) ? css.selected : css.li} key={'list-' + index}><Button onClick={handleSelect(index)} style='list' text={name} /></li>

const Table = ({ list, selectedIndex, editBody, editFt, listNameFunc, readOnly, handleSelect, handleCreate}) => (<div className={css.body}>
  <div className={css.list}>{ (list.length > 0) && 
    <div className={css.table}>
      <div className={css.tableBd}>
        <div className={css.content}>
          <ul>{list.map((listItem, index) => renderList({selectedIndex, index, handleSelect, name: listNameFunc(listItem)}))}</ul>
        </div>
      </div>
      <div className={css.tableFt}><Button style='listFtIcon' text='+' onClick={handleCreate} /></div>
    </div>}
  </div>
  { (selectedIndex !== -1) && <div className={css.edit}>
    <div className={css.table}>
      <div className={css.tableBd}>
        <div className={readOnly ? css.readOnly : css.content}>
          {editBody}
        </div>
      </div>
      <div className={css.tableFt}>{editFt}</div>
    </div>
  </div> }
</div>)

export default Table
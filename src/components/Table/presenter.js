import React from 'react'
import Button from '../Button'
import css from './style.css'

const renderList = ({selectedIndex, index, handleSelect, name}) => <li className={(selectedIndex === index) ? css.selected : css.li} key={'list-' + index}><Button onClick={handleSelect(index)} style='list' text={name} /></li>
const renderFt = ({inEdit, handleSubmit, handleEditToggle}) => <span>{inEdit ? <Button style='listFt' onClick={handleSubmit} text='儲存' /> : <Button style='listFtDisabled' text='儲存' />}<Button style='listFtRight' onClick={handleEditToggle} text='取消' /></span>
const renderFtReadOnly = ({handleEditToggle}) => <Button style='listFt' onClick={handleEditToggle} text='編輯' />

const Table = ({ list, selectedIndex, editBody, inEdit, listNameFunc, readOnly, handleSelect, handleCreate, handleEditToggle, handleSubmit }) => (<div className={css.body}>
  <div className={css.list}>{ (list && list.length > 0) &&
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
      <div className={css.tableFt}>{readOnly ? renderFtReadOnly({handleEditToggle}) : renderFt({inEdit, handleSubmit, handleEditToggle})}</div>
    </div>
  </div> }
</div>)

export default Table
export const renderInput = {
  checkbox: ({disabled, onChange, value}) => <input type='checkbox' onChange={onChange} checked={value} value={value} disabled={disabled} />,
  datetime: ({disabled, onChange, value}) => <input type='datetime-local' onChange={onChange} value={value} disabled={disabled} />,
  password: ({disabled, onChange, value}) => <input type='password' onChange={onChange} value={value} disabled={disabled} />,
  text: ({disabled, onChange, value}) => <input type='text' onChange={onChange} value={value} disabled={disabled} />,
  number: ({disabled, onChange, value}) => <input type='number' onChange={onChange} value={value} disabled={disabled} />,
  textarea: ({disabled, onChange, value}) => <textarea onChange={onChange} value={value} disabled={disabled} />
}

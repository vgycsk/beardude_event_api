import React from 'react'
import Button from '../Button'
import css from './style.css'

const Table = ({bdStyle = {}, content = '', ft = '', readOnly = false}) => (<div className={css.table}>
  <div className={(readOnly) ? css.bdReadOnly : css.bdClass} style={bdStyle}>
    <div className={css.content}>{content}</div>
  </div>
  <div className={css.ft}>{ft}</div>
</div>)

export default Table
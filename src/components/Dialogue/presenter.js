import React from 'react'
import css from './style.css'

export const Dialogue = ({content}) => <span>{content &&
  <div className={css.box}>
    <div className={css.wrap}>
      <div className={css.content}>{content}</div>
    </div>
  </div>}</span>
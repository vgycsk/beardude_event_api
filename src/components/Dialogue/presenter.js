import React from 'react'
import classes from 'classnames'

import css from './style.css'

export const Dialogue = ({enable, positiveHandler, nagitiveHandler, title, msg, children}) =>
  <div className={classes(css.box, !enable && css.hidden)}>
    <div className={css.content}>
      <div className={css.title}><span>{title}</span></div>
      { msg ? <span className={css.msg}>{msg}</span> : null }
      { children ? <div>{children}</div> : null }
      <div className={css.btnBar}>
        <span className={css.btn} onClick={positiveHandler}>OK</span>
        <span className={css.btn} onClick={nagitiveHandler}>Cancel</span>
      </div>
    </div>
  </div>

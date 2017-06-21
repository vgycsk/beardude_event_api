import React from 'react'
import css from './style.css'

const Button = ({ counter, onClick, style = 'regular', text, url }) => {
  const counterHtml = (counter !== undefined
    ? <span className={css.count}>{counter}</span>
    : ''
  )
  return (url
    ? (<a className={css[style]} href={url}>{text}{counterHtml}</a>)
    : (<button className={css[style]} onClick={onClick}>{text}{counterHtml}</button>)
  )
}
export default Button

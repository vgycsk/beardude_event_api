import React from 'react'
import css from './style.css'
import { Link } from 'react-router-dom'

const Button = ({ counter, onClick, style = 'regular', text, url, body }) => {
  const counterHtml = (counter !== undefined
    ? <span className={css.count}>{counter}</span>
    : ''
  )
  return (url
    ? (<Link className={css[style]} to={url}>{text}{counterHtml}</Link>)
    : (<button className={css[style]} onClick={onClick}>{text}{counterHtml}</button>)
  )
}
export default Button

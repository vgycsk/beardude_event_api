import React from 'react'
import css from './style.css'

const Button = ({ onClick, style = 'regular', text }) => (<button className={css[style]} onClick={onClick}>{text}</button>)

export default Button

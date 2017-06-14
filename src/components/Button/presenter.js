import React from 'react'
import css from './style.css'

const Button = ({ onClick, style, text }) => (<button className={(style) ? css[style] : css.regular} onClick={onClick}>{text}</button>)

export default Button

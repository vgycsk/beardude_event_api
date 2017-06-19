import React from 'react'
import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'

const NotFound = ({location}) => <div><Header location={location} /><div className={css.mainBody}>Not Found</div><Footer /></div>
export default NotFound

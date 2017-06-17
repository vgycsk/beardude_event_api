import React from 'react'
import css from './style.css'
import Header from '../Header'
import Footer from '../Footer'

const NotFound = () => <div><Header location={{pathname: '/notfound'}} /><div className={css.mainBody}>Not Found</div><Footer /></div>
export default NotFound

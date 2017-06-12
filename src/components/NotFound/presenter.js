import React from 'react'
import css from './style.css'

const NotFound = () => {
    return (<div className={css.container}>
      <div className={css.mainHeader}>
          <div className={css.heading}>
              <h1 className={css.bdlogo}>
                  <span className={css.logoB}>Beardude</span>
                  <span className={css.logoE}>Event</span>
              </h1>
          </div>
      </div>
      <div className={css.mainBody}>
          <div className={css.body}><div className={css.pageMessage}>Not Found</div></div>
      </div>
      <div className={css.footer}>
          <ul>
              <li className={css.copyRight}><span>Copyright &copy; </span><span>2020</span><span> Beardude Inc. All Rights Reserved</span></li>
          </ul>
      </div>
    </div>)
}

export default NotFound

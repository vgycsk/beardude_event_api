import React from 'react'
import { actionCreators } from '../../ducks/account'
import css from './style.css'

class Account extends React.Component {
  handleInput (field, e) {
    this.props.dispatch(actionCreators.input(field, e.target.value))
  }
  handleSubmit () {
    this.props.dispatch(actionCreators.login())
  }
  render () {
    const credentials = this.props.credentials
    const that = this
    const err = (credentials.error === '') ? '' : <div className={css.errMsg}>{credentials.error}</div>
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
          <div className={css.body}>
            <div>
              {err}
              <ul>
                  <li className={css.li}>
                      <input type="text" className={css.text1} onChange={this.handleInput.bind(that, 'email')}  placeholder="電子信箱" />
                  </li>
                  <li className={css.li}>
                      <input type="password" className={css.text2} onChange={this.handleInput.bind(that, 'password')} placeholder="密碼" />
                  </li>
              </ul>
              <div className={css.ft}>
                  <button className={css.submit} onClick={this.handleSubmit.bind(that)} type="submit">登入</button>
              </div>
            </div>
          </div>
      </div>
      <div className={css.footer}>
          <ul>
              <li className={css.copyRight}><span>Copyright &copy; </span><span>2020</span><span> Beardude Inc. All Rights Reserved</span></li>
          </ul>
      </div>
    </div>)
  }
}

export default Account

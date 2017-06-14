import React from 'react'
import { Redirect } from 'react-router-dom'
import { actionCreators } from '../../ducks/account'
import Header from '../Header'
import Footer from '../Footer'
import css from './style.css'

class Account extends React.Component {
  handleInput (field, e) {
    this.props.dispatch(actionCreators.input(field, e.target.value))
  }
  handleSubmit () {
    this.props.dispatch(actionCreators.login())
  }
  componentDidMount () {
    if (!this.props.account.isAuthenticated) {
      this.props.dispatch(actionCreators.accountInfo())
    }
  }
  render () {
    const credentials = this.props.account.credentials
    const that = this
    const err = (credentials.error === '') ? '' : <div className={css.errMsg}>{credentials.error}</div>

    if (this.props.account.isAuthenticated) {
      return (<Redirect to={'/console'}/>)
    }
    return (<div className={css.container}>
      <Header />
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
      <Footer />
    </div>)
  }
}

export default Account

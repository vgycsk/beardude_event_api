import React from 'react'
import BaseComponent from '../BaseComponent'
import { actionCreators } from '../../ducks/account'
import { Redirect } from 'react-router-dom'
import Footer from '../Footer'
import Button from '../Button'
import css from './style.css'

class Account extends BaseComponent {
  constructor (props) {
    super(props)
    this.dispatch = this.props.dispatch

    if (this.props.account.isAuthenticated === undefined) {
      this.props.dispatch(actionCreators.accountInfo())
    }
    this._bind('handleSubmit', 'handleInput')
  }
  handleInput (field) {
    return (e) => {
      this.dispatch(actionCreators.input(field, e.currentTarget.value))
    }
  }
  handleSubmit () {
    const { email, password } = this.props.account.credentials
    if (email && password) {
      this.dispatch(actionCreators.login())
    }
  }
  render () {
    const { credentials, isAuthenticated } = this.props.account // isAuthenticated === undefined just means store is not ready yet
    const { from } = this.props.location.state || { from: { pathname: '/console' } }
    const err = (credentials.error === '') ? '' : <div className={css.errMsg}>{credentials.error}</div>

    console.log('account ----')
    console.log(this.props.location.state)
    console.log(isAuthenticated)

    if (isAuthenticated) {
      return <Redirect to={from} />
    }

    return (<div>
      <div className={css.heading}>
        <h1 className={css.bdlogo}>
          <span className={css.logoB}>Beardude</span>
          <span className={css.logoE}>Event</span>
        </h1>
      </div>
      <div className={css.mainBody}>
        <div className={css.body}>
          { !this.props.location.state || isAuthenticated !== undefined
            ? <div>
              {err}
              <ul>
                <li className={css.li}>
                  <input type='text' className={css.text1} onChange={this.handleInput('email')} placeholder='電子信箱' />
                </li>
                <li className={css.li}>
                  <input type='password' className={css.text2} onChange={this.handleInput('password')} placeholder='密碼' />
                </li>
              </ul>
              <div className={css.ft}>
                <Button onClick={this.handleSubmit} text='登入' />
              </div>
            </div>
          : <div className={css.loading}>Loading...</div> }
        </div>
      </div>
      <Footer />
    </div>)
  }
}

export default Account

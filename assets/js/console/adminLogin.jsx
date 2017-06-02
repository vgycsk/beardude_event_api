
'use strict';

var React = require('react');
var libraryMixin = require('./libraryMixin.js');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            credentials: {
                email: '',
                password: ''
            },
            url: {
                login: '/console/login'
            },
            error: ''
        };
    },
    mixins: [libraryMixin],
    handleInput: function (field, e) {
        var stateObj = {
            credentials: this.state.credentials
        };
        var val = e.currentTarget.value;

        stateObj.credentials[field] = val;
        e.preventDefault();
        this.setState(stateObj);
    },
    handleSubmit: function (e) {
        var that = this;

        e.preventDefault();
        this.post(that.state.url.login, that.state.credentials, function (result) {
            if (result.code === 400) {
                that.setState({
                    error: result.message
                });
            } else if (result.code === 200) {
                window.location = '/console';
            }
        });
    },
    render: function () {
        var email = this.state.credentials.email;
        var password = this.state.credentials.password;
        var err = '';
        var that = this;

        if (this.state.error) {
            err = <div className="err">{this.state.error}</div>;
        }
        return (<div>
            <div className="header">
                <div className="heading Cf">
                    <h1 className="bdlogo">
                        <span className="b">Beardude</span>
                        <span className="e">Event</span>
                    </h1>
                </div>
            </div>
            <div className="body">
                <div className="wrap">
                {err}
                <ul>
                    <li>
                        <input type="text" name="email" className="text" onChange={this.handleInput.bind(that, 'email')} placeholder="電子信箱" value={email} />
                    </li>
                    <li>
                        <input type="password" name="password" className="text" onChange={this.handleInput.bind(that, 'password')} placeholder="密碼" value={password} />
                    </li>
                </ul>
                <div className="ft">
                    <button className="submit" onClick={this.handleSubmit} type="submit">登入</button>
                </div>
                </div>
            </div>
            <div className="footer">
                <ul>
                    <li className="copyRight"><span>Copyright &copy; </span><span>2020</span><span> Beardude Inc. All Rights Reserved</span></li>
                </ul>
            </div>
        </div>);
    }
});

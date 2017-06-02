
'use strict';

var React = require('react');
var libraryMixin = require('./libraryMixin.js');

module.exports = React.createClass({
    getInitialState: function () {
        return {};
    },
    mixins: [libraryMixin],
    handleLogout: function () {
        this.get('/console/logout', function () {
            return window.location = '/console/login';
        });
    },
    render: function () {
        return (<div>
            <div className="header">
                <div className="heading Cf">
                    <h1 className="bdlogo">
                        <span className="b">Beardude</span>
                        <span className="e">Event</span>
                    </h1>
                <button onClick={this.handleLogout}>Logout</button>
                </div>
            </div>
            <div className="body">
                <div className="wrap">
            Console landing page
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

/* global config, document */

'use strict';

var React = require('react');
var ReactDom = require('react-dom');
var rootElement = document.getElementById('main-container');

var pageName = config.page;
var pages = {
    adminLogin: require('./adminLogin.jsx'),
    adminLanding: require('./adminLanding.jsx')
};

ReactDom.render(React.createElement(pages[pageName]), rootElement);

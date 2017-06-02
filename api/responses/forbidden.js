/* eslint-disable no-underscore-dangle */

/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, 'some/specific/forbidden/view');
 *
 * e.g.:
 * ```
 * return res.forbidden('Access denied.');
 * ```
 */

module.exports = function (data) {
    var logContent = data || '';
    var req = this.req;
    var res = this.res;
    var response = 'Sending 403 ("Forbidden") response';
    var sails = req._sails;
    var statusCode = 403;
    var statusTitle = 'Forbidden';
    var viewData = data;

    // Set status code
    res.status(statusCode);
    sails.log.verbose(response, logContent);

    // If the user-agent wants JSON, always respond with JSON
    // If views are disabled, revert to json
    if (req.wantsJSON || sails.config.hooks.views === false) {
        if (typeof viewData === 'string') {
            return res.jsonx({
                status: statusTitle,
                code: statusCode,
                message: viewData
            });
        }
        return res.jsonx(data);
    }

    // Attempt to prettify data for views, if it's a non-error object
    if (!(viewData instanceof Error) && typeof viewData === 'object') {
        try {
            viewData = require('util').inspect(data, {
                depth: null
            });
        } catch (e) {
            viewData = {};
        }
    }

    return res.view('error', {
        title: 'Forbidden'
    }, function (err, html) {
        if (err) {
            if (err.code === 'E_VIEW_FAILED') {
                sails.log.verbose('res.forbidden() :: Could not locate view for error page (sending JSON instead).  Details: ', err);
            } else {
                sails.log.warn('res.forbidden() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
            }
            return res.jsonx(data);
        }
        return res.send(html);
    });
};


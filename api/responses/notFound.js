/* eslint-disable no-underscore-dangle */

/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound(err);
 * return res.notFound(err, 'some/specific/notfound/view');
 *
 * e.g.:
 * ```
 * return res.notFound();
 * ```
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes", Sails will call `res.notFound()`
 * automatically.
 */

module.exports = function (data) {
    var logContent = data || '';
    var req = this.req;
    var res = this.res;
    var response = 'Sending 404 ("Not Found") response';
    var sails = req._sails;
    var statusCode = 404;
    var statusTitle = 'Not Found';
    var viewData = data;

    // Set status code
    res.status(statusCode);
    sails.log.verbose(response, logContent);

    // If the user-agent wants JSON, always respond with JSON
    // If views are disabled, revert to json
    if (req.wantsJSON || sails.config.hooks.views === false) {
        if (typeof viewData === 'string') {
            return res.jsonx({
//                status: statusTitle,
//                code: statusCode,
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
    return res.jsonx({
        message: statusTitle
    });
    /*
    return res.view('error', {
        title: 'Not Found'
    }, function (err, html) {
        if (err) {
            if (err.code === 'E_VIEW_FAILED') {
                sails.log.verbose('res.notFound() :: Could not locate view for error page (sending JSON instead).  Details: ', err);
            } else {
                sails.log.warn('res.notFound() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
            }
            return res.jsonx(data);
        }
        return res.send(html);
    });
    */
};

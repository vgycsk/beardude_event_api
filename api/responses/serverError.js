/* eslint-disable no-underscore-dangle */

/**
 * 500 (Server Error) Response
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, 'some/specific/error/view');
 *
 * NOTE:
 * If something throws in a policy or controller, or an internal
 * error is encountered, Sails will call `res.serverError()`
 * automatically.
*/

module.exports = function (data) {
    var logContent = data || '';
    var statusCode = 500;
    var statusTitle = 'Server Error';
    var req = this.req;
    var res = this.res;
    var response = 'Sending 500 ("Server Error") response';
    var sails = req._sails;
    var viewData = data;

    res.status(statusCode);
    sails.log.verbose(response, logContent);

    if (req.wantsJSON || sails.config.hooks.views === false) {
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
    delete viewData.rawStack;
    delete viewData.stack;
    return res.view(statusCode, {
        data: viewData,
        title: statusTitle
    }, function (err, html) {
        // If a view error occured, fall back to JSON(P).
        if (err) {
            if (err.code === 'E_VIEW_FAILED') {
                sails.log.verbose('res.serverError() :: Could not locate view for error page (sending JSON instead).  Details: ', err);
            } else {
                sails.log.warn('res.serverError() :: When attempting to render error page view, an error occured (sending JSON instead).  Details: ', err);
            }
            return res.jsonx(data);
        }
        return res.send(html);
    });
};

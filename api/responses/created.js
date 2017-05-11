/* eslint-disable no-underscore-dangle */

/**
 * 201 (CREATED) Response
 *
 * Usage:
 * return res.created();
 * return res.created(data);
 * return res.created(data, 'auth/login');
 *
 * @param  {Object} data
 * @param  {String|Object} options
 *          - pass string to render specified view
 */

module.exports = function (data, options) {
    var statusCode = 201;
    var statusTitle = 'Created';
    var req = this.req;
    var res = this.res;
    var response = 'res.created() :: Sending 201 ("CREATED") response';
    var sails = req._sails;
    var viewData = data;
    var sendJSON = function (data) {
        if (!data) {
            return res.send();
        } else if (typeof data !== 'object') {
            return res.send(data);
        } else if (req.options.jsonp && !req.isSocket) {
            return res.jsonp(data);
        }
        return res.json(data);
    };

    res.status(statusCode);
    sails.log.silly(response);
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
    // view specified
    if (typeof options === 'string') {
        return res.view(options, viewData, function (viewErr, html) {
            if (viewErr) {
                return sendJSON(data);
            }
            return res.send(html);
        });
    }
    return res.guessView({
        data: viewData,
        title: statusTitle
    }, function () {
        return res.jsonx(data);
    });
};

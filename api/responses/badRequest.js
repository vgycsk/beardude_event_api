/* eslint-disable no-underscore-dangle */

/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(data);
 * return res.badRequest(data, 'some/specific/badRequest/view');
 *
 * e.g.:
 * ```
 * return res.badRequest(
 *   'Please choose a valid `password` (6-12 characters)',
 *   'trial/signup'
 * );
 * ```
 */

module.exports = function (data) {
    var logContent = data || '';
    var req = this.req;
    var res = this.res;
    var response = 'Sending 400 ("Bad Request") response';
    var sails = req._sails;
    var statusCode = 400;
    var statusTitle = 'Bad Request';
    var viewData = data;

    // Set status code
    res.status(statusCode);
    sails.log.verbose(response, logContent);
    if (req.wantsJSON || sails.config.hooks.views === false) {
        return res.jsonx(data);
    }

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
    return res.guessView({
        data: viewData,
        title: statusTitle
    }, function () {
        return res.jsonx(data);
    });
};

module.exports.views = {
    engine: 'ejs',
    layout: false,

    /****************************************************************************
    *                                                                           *
    * Partials are simply top-level snippets you can leverage to reuse template *
    * for your server-side views. If you're using handlebars, you can take      *
    * advantage of Sails' built-in `partials` support.                          *
    *                                                                           *
    * If `false` or empty partials will be located in the same folder as views. *
    * Otherwise, if a string is specified, it will be interpreted as the        *
    * relative path to your partial files from `views/` folder.                 *
    *                                                                           *
    ****************************************************************************/

    partials: false
};

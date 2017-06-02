var path = require('path');

module.exports = {
    module: {
        rules: [
            {
                loader: 'babel-loader',
                // Skip any files outside of your project's `src` directory
                include: [
                    path.resolve('./assets/js/console')
                ],

                // Only run `.js` and `.jsx` files through Babel
                test: /\.jsx?$/,

                // Options to configure babel with
                query: {
                    presets: ['react']
                }
            }
        ]
    },
    entry: ['whatwg-fetch', path.resolve('./assets/js/console/index.jsx')],
    devtool: 'source-map',
    output: {
        path: path.resolve('.tmp/public/js/console'),
        filename: 'bundle.js',
        sourceMapFilename: 'bundle.js.map'
    }
};
/*
options: {
    devtool: 'source-map',
    progress: true,
    failOnError: false,
    // watch options
    watch: true,
    keepalive: false,
    inline: true
}
*/

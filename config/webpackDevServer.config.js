'use strict';

const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware');
const evalSourceMapMiddleware = require('react-dev-utils/evalSourceMapMiddleware');
const noopServiceWorkerMiddleware = require('react-dev-utils/noopServiceWorkerMiddleware');
const ignoredFiles = require('react-dev-utils/ignoredFiles');
const path = require('path');
const paths = require('./paths');
const fs = require('fs');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';

module.exports = {
    // Enable gzip compression of generated files.
    compress: true,
    // Enable HTTPS if the HTTPS environment variable is set to 'true'
    https: protocol === 'https',
    historyApiFallback: true,
    static: {
      directory: "/public",
      staticOptions: {},
      // Don't be confused with `devMiddleware.publicPath`, it is `publicPath` for static directory
      // Can be:
      // publicPath: ['/static-public-path-one/', '/static-public-path-two/'],
        publicPath: paths.publicPath,
      // Can be:
      // serveIndex: {} (options for the `serveIndex` option you can find https://github.com/expressjs/serve-index)
      serveIndex: true,
      // Can be:
      // watch: {} (options for the `watch` option you can find https://github.com/paulmillr/chokidar)
      watch: true,
    },
    devMiddleware: {
        index: true,
        mimeTypes: { "text/html": ["phtml"] },
        publicPath: paths.publicPath,
        serverSideRender: true,
        writeToDisk: true,
    },
    hot: "only",
    open: true
};

const withCSS = require('@zeit/next-css')

module.exports = withCSS({
  cssLoaderOptions: {
    url: false
  },
  exportPathMap: function () {
    return {
      '/': { page: '/' }
    }
  },
  target: 'serverless'
})

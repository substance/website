const withCSS = require('@zeit/next-css')

module.exports = withCSS({
  cssLoaderOptions: {
    url: false
  },
  exportPathMap: function () {
    return {
      '/': { page: '/' },
      '/dar': { page: '/dar' },
      '/texture': { page: '/texture' },
      '/publishing': { page: '/publishing' },
      '/repro-docs': { page: '/repro-docs' },
      '/consortium': { page: '/consortium' },
      '/story': { page: '/story' },
      '/contact': { page: '/contact' },
      '/privacy': { page: '/privacy' },
      '/terms': { page: '/terms' }
    }
  }
})

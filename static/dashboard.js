// TODO: we need to use bundling (e.g. Substance Bundler)

const { Component } = window.substance

// TODO: load from /api/dashboard

class Dashboard extends Component {
  render($$) {
    return $$('div').addClass('sc-dashboard').append(
      'I AM THE DASHBOARD'
    )
  }
}

window.addEventListener('load', () => {
  // substanceGlobals.DEBUG_RENDERING = true 
  Dashboard.mount({}, document.body)
})



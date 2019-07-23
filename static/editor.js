
const { Component } = window.substance

class Editor extends Component {
  render($$) {
    return $$('div').addClass('sc-editor').append(
      'Texture Editor should go here and load from API!'
    )
  }
}

window.addEventListener('load', () => {
  // substanceGlobals.DEBUG_RENDERING = true 
  Editor.mount({}, document.body)
})
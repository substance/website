const fs = require('fs')

function appRoutes (server) {

  // Dashboard
  // -------------
  server.get('/dashboard', (req, res) => {
    const html = fs.readFileSync(__dirname+'/pages/dashboard.html', 'utf8');
    res.send(html)
  })

  // Edit document
  // -------------
  server.get('/:username/:document/edit', (req, res) => {
    const html = fs.readFileSync(__dirname+'/pages/editor.html', 'utf8');
    res.send(html)
  })

  // Read document
  // -------------
  server.get('/:username/:document/view', (req, res) => {
    res.send('TODO: implement fast cached static view for reading')
  })

}

module.exports = appRoutes
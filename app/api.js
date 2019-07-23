function api (server) {

  // Login
  // -------------
  server.post('/api/authenticate', (req, res) => {
    res.json(AUTHENTICATED_STUB)
  })

  // Signup
  // -------------
  server.post('/api/register', (req, res) => {
    res.json({"todo": "register-user"})
  })

  // User dashboard
  // -------------
  server.get('/api/dashboard', (req, res) => {
    res.json(DASHBOARD_STUB)
  })

  // Create document
  // -------------
  server.put('/api/documents/:username', (req, res) => {
    res.json({"todo": "create-document"})
  })

  // Read document
  // -------------
  server.get('/api/documents/:username/:document', (req, res) => {
    // TODO: hard code to load from DOCS_DIR/demo/demo
    res.json({"todo": "raw-archive"})
  })

  // Update document
  // -------------
  server.put('/api/documents/:username/:document', (req, res) => {
    // TODO: hard code to update DOCS_DIR/demo/demo
    res.json({"todo": "update-document"})
  })

  // Delete document
  // -------------
  server.put('/api/documents/:username/:document', (req, res) => {
    res.json({"todo": "create-document"})
  })
}

const DASHBOARD_STUB = {
  "documentCount": 3,
  "documents": [
    { "title": "Demo document", "creator": "demo", "name": "demo", "status": "published", "updatedAt": "dummy", "fileSize": "4MB" }
  ]
}

const AUTHENTICATED_STUB = {
  "username": "demo",
  "givenNames": "Frank",
  "surname": "Demo",
  "sessionId": "dummy-session-id"
}

module.exports = api
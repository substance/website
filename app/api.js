function api (server) {

  // Login
  // -------------
  server.get('/api/authenticate', (req, res) => {
    res.json(AUTHENTICATED_STUB)
  })

  // User dashboard
  // -------------
  server.get('/api/dashboard/:username', (req, res) => {
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
    res.json({"todo": "raw-archive"})
  })

  // Update document
  // -------------
  server.put('/api/documents/:username/:document', (req, res) => {
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
    { "title": "Welcome to Substance", "status": "published", "updatedAt": "dummy", "fileSize": "4MB" },
    { "title": "Open Peer Review", "status": "draft", "updatedAt": "dummy", "fileSize": "2MB" }
  ]
}

const AUTHENTICATED_STUB = {
  "username": "michael",
  "givenNames": "Michael",
  "surname": "Aufreiter",
  "sessionId": "dummy-session-id"
}

module.exports = api
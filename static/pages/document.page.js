import { $ as $$, C as Component, L as Limiter, H as HorizontalStack, S as SubstanceLogo, T as Title, a as StackFill, B as Button, I as Icon, D as DropdownMenu, i as Document, j as createNodeFromJson, k as DOMElement, l as append, p as prettyPrintXML, m as CHILDREN, n as DocumentSchema, o as DocumentNode, q as STRING, E as EventEmitter, u as uuid, r as platform, A as AbstractEditorSession, t as removeFromCollection, v as deepDeleteNode, f as forEach, w as isString, x as last, y as DocumentIndex, z as stopAndPrevent, G as renderProperty, J as EditorSession, K as createEditorContext, M as ModalCanvas, N as stop, O as isNil, P as Modal, e as Form, g as FormRow, h as Input, Q as BasicEditorApi, R as selectNode, U as renderMenu, V as AbstractEditor, W as Managed, X as ListMixin, Y as ListItemMixin, Z as SchemaBuilder, _ as InsertNodeCommand$1, a0 as Configurator, a1 as BasePackage, a2 as ParagraphComponent, a3 as HeadingComponent, a4 as FigureComponent, a5 as ListComponent, a6 as ListItemComponent, a7 as LinkComponent, a8 as DefaultHtmlImporter, a9 as HTMLExporter, aa as UndoCommand, ab as Redo, ac as SelectAllCommand, ad as SwitchTextTypeCommand, ae as AnnotationCommand, af as CreateLinkCommand, ag as HtmlConverters, ah as SwitchTextTypeDropdown, ai as debounce, aj as getQueryStringParam, ak as parseKeyEvent, c as BasePage, F as Footer } from './Footer-8f9b3fea.js';
import { M as MobileHeader } from './MobileHeader-495e59c5.js';
import { L as LoginStatus } from './LoginStatus-aa15daae.js';
import { a as GetDocumentLink } from './utils-e939ecca.js';
import { s as sendRequest } from './_sendRequest-aee5ea34.js';

function StatusMessage (props) {
  return (
    $$('div', { class: 'sc-status-message' },
      props.children
    )
  )
}

const DOCUMENT_MENU = (document) => ({
  items: [
    { action: 'openVersions', label: 'Versions', icon: 'history' },
    { url: GetDocumentLink(document, 'preview'), newTab: true, label: 'Preview', icon: 'eye' },
    { action: 'deleteDocument', label: 'Delete', icon: 'trash' },
    { action: 'downloadDocument', label: 'Download', icon: 'file-download' }
  ]
});

class DocumentHeader extends Component {
  render () {
    // ATTENTION: only when the user is logged in the document tools should be visible
    const { user, document, readOnly, statusMessage } = this.props;
    return $$('div', { class: 'sc-header' },
      $$(Limiter, { fullscreen: true },
        $$(HorizontalStack, {},
          $$(SubstanceLogo),
          $$(Title, { ellipsis: true }, document.title),
          $$(StackFill),
          $$(StatusMessage, {}, statusMessage),
          user && !readOnly
            ? $$(Button, { style: 'plain', size: 'default', action: 'openVersions' },
              $$(Icon, { icon: 'history' })
            )
            : null,
          user && !readOnly
            ? $$(DropdownMenu, DOCUMENT_MENU(document),
              $$(Icon, { icon: 'ellipsis-h' })
            )
            : null,
          user
            ? $$(LoginStatus, { user })
            : $$(Button, { style: 'primary', size: 'small', url: '/login' }, 'Login')
        )
      )
    )
  }
}

class ManifestDocument extends Document {
  constructor () {
    super(DARSchema);
  }

  getDocumentNodes () {
    return this.get('dar').resolve('documents')
  }

  getAssetNodes () {
    return this.get('dar').resolve('assets')
  }

  getAssetByFilename (filename) {
    return this.getAssetNodes().find(asset => asset.filename === filename)
  }

  getDocumentEntries () {
    return this.getDocumentNodes().map(_getEntryFromDocumentNode)
  }

  getDocumentEntry (id) {
    const entryNode = this.get(id);
    if (entryNode && entryNode.type === 'document') {
      return _getEntryFromDocumentNode(entryNode)
    }
  }

  static createEmptyManifest () {
    const doc = new ManifestDocument();
    createNodeFromJson(doc, {
      type: 'dar',
      id: 'dar',
      documents: [],
      assets: []
    });
    return doc
  }

  static fromXML (xmlStr) {
    const xmlDom = DOMElement.parseXML(xmlStr);

    const manifest = ManifestDocument.createEmptyManifest();
    const documentEls = xmlDom.findAll('documents > document');
    for (const el of documentEls) {
      const documentNode = manifest.create({
        type: 'document',
        id: el.attr('id'),
        documentType: el.attr('type'),
        name: el.attr('name'),
        // TODO: I would prefer 'filename' in the DAR XML
        filename: el.attr('path')
      });
      append(manifest, ['dar', 'documents'], documentNode.id);
    }
    const assetEls = xmlDom.findAll('assets > asset');
    for (const el of assetEls) {
      const assetNode = manifest.create({
        type: 'asset',
        id: el.attr('id'),
        // TODO: I would prefer 'filename' in the DAR XML
        filename: el.attr('path'),
        // TODO: I would prefer 'mimetype' in the DAR XML
        mimetype: el.attr('type')
      });
      append(manifest, ['dar', 'assets'], assetNode.id);
    }

    return manifest
  }

  toXml (options = {}) {
    const { assetRefIndex, prettyPrint } = options;
    const dar = this.get('dar');
    const xmlDom = DOMElement.createDocument('xml');
    const $$ = xmlDom.createElement.bind(xmlDom);
    xmlDom.append(
      $$('dar').append(
        $$('documents').append(
          dar.resolve('documents').map(node => {
            const docEl = $$('document').attr({
              id: node.id,
              type: node.documentType,
              path: node.filename
            });
            if (node.name) {
              docEl.setAttribute('name', node.name);
            }
            return docEl
          })
        ),
        $$('assets').append(
          dar.resolve('assets').map(node => {
            const assetEl = $$('asset').attr({
              id: node.id,
              // TODO: I would prefer to use filename instead of 'path' in the DAR XML
              type: node.mimetype,
              path: node.filename
            });
            // EXPERIMENTAL: storing 'unused' to allow for keeping assets around, e.g. when replacing an asset.
            // Similar to the problem in versioning, for undo/redo during a session, all assets need to be retained.
            // Note that this is only used internally, e.g. in RawArchiveFSStorage.
            // TODO: rethink. Maybe we could instead analyse the content of the DAR,
            // But that would either mean to load the documents, or doing a poor man's detection via XML.
            if (assetRefIndex && !assetRefIndex.hasRef(node.id)) {
              assetEl.setAttribute('unused', true);
            }
            return assetEl
          })
        )
      )
    );
    const xmlStr = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<!DOCTYPE dar PUBLIC "-//SUBSTANCE//DTD DocumentArchive v1.0//EN" "DocumentArchive-1.0.dtd">',
      prettyPrint ? prettyPrintXML(xmlDom) : xmlDom.serialize()
    ].join('\n');
    return xmlStr
  }
}

function _getEntryFromDocumentNode (documentNode) {
  return {
    id: documentNode.id,
    type: documentNode.documentType,
    name: documentNode.name,
    filename: documentNode.filename
  }
}

class DAR extends DocumentNode {}
DAR.schema = {
  type: 'dar',
  documents: CHILDREN('document'),
  assets: CHILDREN('asset')
};

class DARDocument extends DocumentNode {}
DARDocument.schema = {
  type: 'document',
  name: STRING,
  documentType: STRING,
  filename: STRING
};

class DARAsset extends DocumentNode {}
DARAsset.schema = {
  type: 'asset',
  name: STRING,
  filename: STRING,
  mimetype: STRING
};

const DARSchema = new DocumentSchema({
  DocumentClass: ManifestDocument,
  nodes: [DAR, DARDocument, DARAsset]
});

var ManifestLoader = {
  load (manifestXml) {
    return ManifestDocument.fromXML(manifestXml)
  }
};

class DocumentArchive extends EventEmitter {
  constructor (storage, buffer, context, config) {
    super();
    this.storage = storage;
    this.buffer = buffer;

    this._config = config;
    this._archiveId = null;
    this._documents = null;
    this._pendingFiles = new Map();
    this._assetRefs = new AssetRefCountIndex();
  }

  _loadDocument (type, record, documents) {
    const loader = this._config.getDocumentLoader(type);
    if (!loader) {
      const msg = `No loader defined for document type ${type}`;
      console.error(msg, type, record);
      throw new Error(msg)
    }
    const doc = loader.load(record.data, { archive: this, config: this._config });
    return doc
  }

  addDocument (type, name, xml) {
    const documentId = uuid();
    const documents = this._documents;
    const document = this._loadDocument(type, { data: xml }, documents);
    documents[documentId] = document;
    this._registerForChanges(document, documentId);
    this._addDocumentRecord(documentId, type, name, documentId + '.xml');
    return documentId
  }

  addAsset (file, blob) {
    // sometimes it is desired to override the native file data e.g. file.name
    // in that case, you can provide the file data seperate from the blob
    if (!blob) blob = file;
    const filename = file.name;
    if (this.isFilenameUsed(filename)) {
      throw new Error('A file with this name already exists: ' + filename)
    }
    let assetId;
    this._manifestSession.transaction(tx => {
      const assetNode = tx.create({
        type: 'asset',
        id: assetId,
        filename,
        mimetype: file.type
      });
      assetId = assetNode.id;
      append(tx, ['dar', 'assets'], assetId);
    });
    this.buffer.addBlob(assetId, {
      id: assetId,
      filename,
      blob
    });
    // NOTE: blob urls are not supported in nodejs and I do not see that this is really necessary
    // For sake of testing we use `PSEUDO-BLOB-URL:${filePath}`
    // so that we can see if the rest of the system is working
    const blobUrl = platform.inBrowser ? URL.createObjectURL(blob) : `PSEUDO-BLOB-URL:${filename}`;
    this._pendingFiles.set(assetId, {
      id: assetId,
      filename,
      blob,
      blobUrl
    });
    return assetId
  }

  getFilename (resourceId) {
    const resource = this._documents.manifest.get(resourceId);
    if (resource) {
      return resource.filename
    }
  }

  getAssetById (assetId) {
    return this._documents.manifest.get(assetId)
  }

  getAssetForFilename (filename) {
    return this._documents.manifest.getAssetByFilename(filename)
  }

  getAssetEntries () {
    return this._documents.manifest.getAssetNodes().map(node => node.toJSON())
  }

  renameAsset (assetId, newFilename) {
    const asset = this.getAssetById(assetId);
    if (!asset) {
      throw new Error(`No asset is registered with id ${assetId}`)
    }
    if (this.isFilenameUsed(newFilename)) {
      throw new Error('A file with this name already exists: ' + newFilename)
    }
    this._manifestSession.transaction(tx => {
      tx.set([asset.id, 'filename'], newFilename);
    });
  }

  getBlob (assetId) {
    // There are the following cases
    // 1. the asset is on a different server (remote url)
    // 2. the asset is on the local server (local url / relative path)
    // 3. an unsaved is present as a blob in memory
    const blobEntry = this._pendingFiles.get(assetId);
    if (blobEntry) {
      return Promise.resolve(blobEntry.blob)
    } else {
      return this.storage.getBlob(assetId)
    }
  }

  getConfig () {
    return this._config
  }

  getDocumentEntries () {
    return this.getDocument('manifest').getDocumentEntries()
  }

  getDownloadLink (filename) {
    const manifest = this.getDocument('manifest');
    const asset = manifest.getAssetByFilename(filename);
    if (asset) {
      return this.resolveUrl(filename)
    }
  }

  getDocument (docId) {
    return this._documents[docId]
  }

  getDocuments () {
    return this.getDocumentEntries().map(entry => this._documents[entry.id]).filter(Boolean)
  }

  getManifestSession () {
    return this._manifestSession
  }

  isFilenameUsed (filename) {
    // check all document entries and referenced assets if the filename
    // TODO: this could be optimized by keeping a set of used filenames up-to-date
    for (const entry of this.getDocumentEntries()) {
      if (entry.filename === filename) return true
    }
    const assetIds = this._assetRefs.getReferencedAssetIds();
    for (const assetId of assetIds) {
      const asset = this.getAssetById(assetId);
      if (asset) {
        if (asset.filename === filename) return true
      }
    }
  }

  hasPendingChanges () {
    return this.buffer.hasPendingChanges()
  }

  load (archiveId, cb) {
    const storage = this.storage;
    const buffer = this.buffer;
    storage.read(archiveId, (err, upstreamArchive) => {
      if (err) return cb(err)
      buffer.load(archiveId, err => {
        if (err) return cb(err)
        // Ensure that the upstream version is compatible with the buffer.
        // The buffer may contain pending changes.
        // In this case the buffer should be based on the same version
        // as the latest version in the storage.
        if (!buffer.hasPendingChanges()) {
          const localVersion = buffer.getVersion();
          const upstreamVersion = upstreamArchive.version;
          if (localVersion && upstreamVersion && localVersion !== upstreamVersion) {
            // If the local version is out-of-date, it would be necessary to 'rebase' the
            // local changes.
            console.error('Upstream document has changed. Discarding local changes');
            this.buffer.reset(upstreamVersion);
          } else {
            buffer.reset(upstreamVersion);
          }
        }
        // convert raw archive to documents (=ingestion)
        const documents = this._ingest(upstreamArchive);
        // contract: there must be a manifest
        if (!documents.manifest) {
          throw new Error('There must be a manifest.')
        }
        // Creating an EditorSession for the manifest
        this._manifestSession = new AbstractEditorSession('manifest', documents.manifest);

        // apply pending changes
        if (!buffer.hasPendingChanges()) ; else {
          buffer.reset(upstreamArchive.version);
        }
        // register for any changes in each document
        this._registerForAllChanges(documents);

        this._archiveId = archiveId;
        this._documents = documents;

        cb(null, this);
      });
    });
  }

  removeDocument (documentId) {
    const document = this._documents[documentId];
    if (document) {
      this._unregisterFromDocument(document);
      // TODO: this is not ready for collab
      const manifest = this._documents.manifest;
      removeFromCollection(manifest, ['dar', 'documents'], documentId);
      deepDeleteNode(manifest, documentId);
    }
  }

  renameDocument (documentId, name) {
    // TODO: this is not ready for collab
    const manifest = this._documents.manifest;
    const documentNode = manifest.get(documentId);
    documentNode.name = name;
  }

  resolveUrl (idOrFilename) {
    // console.log('Resolving url for', idOrFilename)
    let url = null;
    const asset = this.getAssetById(idOrFilename) || this.getAssetForFilename(idOrFilename);
    if (asset) {
      // until saved, files have a blob URL
      const blobEntry = this._pendingFiles.get(asset.id);
      if (blobEntry) {
        url = blobEntry.blobUrl;
      } else {
        // Note: arguments for getAssetUrl() must be serializable as this is an RPC
        url = this.storage.getAssetUrl(this._archiveId, { id: asset.id, filename: asset.filename });
      }
    }
    // console.log('... url =', url)
    return url
  }

  save (cb) {
    // FIXME: buffer.hasPendingChanges() is not working
    this.buffer._isDirty.manuscript = true;
    this._save(this._archiveId, cb);
  }

  /*
    Save as is implemented as follows.

    1. clone: copy all files from original archive to new archive (backend)
    2. save: perform a regular save using user buffer (over new archive, including pending
       documents and blobs)
  */
  saveAs (newArchiveId, cb) {
    this.storage.clone(this._archiveId, newArchiveId, (err) => {
      if (err) return cb(err)
      this._save(newArchiveId, cb);
    });
  }

  /*
    Adds a document record to the manifest
  */
  _addDocumentRecord (documentId, type, name, filename) {
    this._manifestSession.transaction(tx => {
      const documentNode = tx.create({
        type: 'document',
        id: documentId,
        documentType: type,
        name,
        filename
      });
      append(tx, ['dar', 'documents', documentNode.id]);
    });
  }

  getUniqueFileName (filename) {
    const [name, ext] = _getNameAndExtension(filename);
    let candidate;
    // first try the canonical one
    candidate = `${name}.${ext}`;
    if (this.isFilenameUsed(candidate)) {
      let count = 2;
      // now use a suffix counting up
      while (true) {
        candidate = `${name}_${count++}.${ext}`;
        if (!this.isFilenameUsed(candidate)) break
      }
    }

    return candidate
  }

  _loadManifest (record) {
    return ManifestLoader.load(record.data)
  }

  _registerForAllChanges (documents) {
    forEach(documents, (document, docId) => {
      this._registerForChanges(document, docId);
    });
  }

  _registerForChanges (doc, docId) {
    // record any change to allow for incremental synchronisation, or storage of incremental data
    doc.on('document:changed', change => {
      this.buffer.addChange(docId, change);
      setTimeout(() => {
        // Apps can subscribe to this (e.g. to show there's pending changes)
        this.emit('archive:changed');
      }, 0);
    }, this);
    // add an index for counting refs to assets
    doc.addIndex('_assetRefs', this._assetRefs);
  }

  _repair () {
    // no-op
  }

  /*
    Create a raw archive for upload from the changed resources.
  */
  _save (archiveId, cb) {
    const buffer = this.buffer;
    const storage = this.storage;

    this._exportChanges(this._documents, buffer)
      .then(rawArchiveUpdate => {
        // CHALLENGE: we either need to lock the buffer, so that
        // new changes are interfering with ongoing sync
        // or we need something pretty smart caching changes until the
        // sync has succeeded or failed, e.g. we could use a second buffer in the meantime
        // probably a fast first-level buffer (in-mem) is necessary anyways, even in conjunction with
        // a slower persisted buffer
        storage.write(archiveId, rawArchiveUpdate, (err, res) => {
          // TODO: this need to implemented in a more robust fashion
          // i.e. we should only reset the buffer if storage.write was successful
          if (err) return cb(err)

          // TODO: if successful we should receive the new version as response
          // and then we can reset the buffer
          let _res = { version: '0' };
          if (isString(res)) {
            try {
              _res = JSON.parse(res);
            } catch (err) {
              console.error('Invalid response from storage.write()');
            }
          }
          // console.log('Saved. New version:', res.version)
          buffer.reset(_res.version);
          // revoking object urls
          if (platform.inBrowser) {
            for (const blobEntry of this._pendingFiles.values()) {
              window.URL.revokeObjectURL(blobEntry.blobUrl);
            }
          }
          this._pendingFiles.clear();

          // After successful save the archiveId may have changed (save as use case)
          this._archiveId = archiveId;
          this.emit('archive:saved');
          cb(null, rawArchiveUpdate);
        });
      })
      .catch(cb);
  }

  _unregisterFromDocument (document) {
    document.off(this);
  }

  /*
    Uses the current state of the buffer to generate a rawArchive object
    containing all changed documents
  */
  async _exportChanges (documents, buffer) {
    const resources = {};
    const manifestUpdate = this._exportManifest(documents, buffer);
    if (manifestUpdate) {
      resources.manifest = manifestUpdate;
    }
    Object.assign(resources, this._exportChangedDocuments(documents, buffer));
    const assetUpdates = await this._exportChangedAssets(documents, buffer);
    Object.assign(resources, assetUpdates);
    const rawArchive = {
      resources,
      version: buffer.getVersion(),
      diff: buffer.getChanges()
    };
    return rawArchive
  }

  _exportManifest (documents, buffer, rawArchive) {
    const manifest = documents.manifest;
    if (buffer.hasResourceChanged('manifest')) {
      const manifestXmlStr = manifest.toXml({ assetRefIndex: this._assetRefs, prettyPrint: true });
      return {
        id: 'manifest',
        filename: 'manifest.xml',
        data: manifestXmlStr,
        encoding: 'utf8',
        updatedAt: Date.now()
      }
    }
  }

  async _exportChangedAssets (documents, buffer) {
    const manifest = documents.manifest;
    const assetNodes = manifest.getAssetNodes();
    const resources = {};
    for (const asset of assetNodes) {
      const assetId = asset.id;
      if (buffer.hasBlobChanged(assetId)) {
        const filename = asset.filename || assetId;
        const blobRecord = buffer.getBlob(assetId);
        // convert the blob into an array buffer
        // so that it can be serialized correctly
        const data = await blobRecord.blob.arrayBuffer();
        resources[assetId] = {
          id: assetId,
          filename,
          data,
          encoding: 'blob',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
      }
    }
    return resources
  }

  _exportChangedDocuments (documents, buffer, rawArchive) {
    // Note: we are only adding resources that have changed
    // and only those which are registered in the manifest
    const entries = this.getDocumentEntries();
    const resources = {};
    for (const entry of entries) {
      const { id, type, filename } = entry;
      const document = documents[id];
      // TODO: how should we communicate file renamings?
      resources[id] = {
        id,
        filename,
        data: this._exportDocument(type, document, documents),
        encoding: 'utf8',
        updatedAt: Date.now()
      };
    }
    return resources
  }

  _exportDocument (type, document, documents) { // eslint-disable-line no-unused-vars
    // TODO: we need better concept for handling errors
    const context = { archive: this, config: this._config };
    const options = { prettyPrint: true };
    return document.toXml(context, options)
  }

  _getManifestXML (rawArchive) {
    return rawArchive.resources.manifest.data
  }

  /*
    Creates EditorSessions from a raw archive.
    This might involve some consolidation and ingestion.
    */
  _ingest (rawArchive) {
    const documents = {};
    const manifestXML = this._getManifestXML(rawArchive);
    const manifest = this._loadManifest({ data: manifestXML });
    documents.manifest = manifest;

    // HACK: assigning loaded documents here already, so that loaders can
    // access other documents, e.g. the manifest
    this._documents = documents;

    const entries = manifest.getDocumentEntries();
    entries.forEach(entry => {
      const id = entry.id;
      const record = rawArchive.resources[id];
      // Note: this happens when a resource is referenced in the manifest
      // but is not there actually
      // we skip loading here and will fix the manuscript later on
      if (!record) return
      // TODO: we need better concept for handling errors
      const document = this._loadDocument(entry.type, record, documents);
      documents[id] = document;
    });
    return documents
  }
}

function _getNameAndExtension (name) {
  const frags = name.split('.');
  let ext = '';
  if (frags.length > 1) {
    ext = last(frags);
    name = frags.slice(0, frags.length - 1).join('.');
  }
  return [name, ext]
}

class AssetRefCountIndex extends DocumentIndex {
  constructor () {
    super();

    this._refCounts = new Map();
  }

  select (node) {
    return node.isInstanceOf('@asset')
  }

  clear () {
    this._refCounts = new Map();
  }

  create (node) {
    this._incRef(node.src);
  }

  delete (node) {
    this._decRef(node.src);
  }

  update (node, path, newValue, oldValue) {
    if (path[1] === 'src') {
      this._decRef(oldValue);
      this._incRef(newValue);
    }
  }

  getReferencedAssetIds () {
    const ids = [];
    for (const [id, count] of this._refCounts.entries()) {
      if (count > 0) {
        ids.push(id);
      }
    }
    return ids
  }

  hasRef (assetId) {
    return this._refCounts.has(assetId) && this._refCounts.get(assetId) > 0
  }

  _incRef (assetId) {
    if (!assetId) return
    let refCount = 0;
    if (this._refCounts.has(assetId)) {
      refCount = this._refCounts.get(assetId);
    }
    refCount = Math.max(0, refCount + 1);
    this._refCounts.set(assetId, refCount);
  }

  _decRef (assetId) {
    if (!assetId) return
    if (this._refCounts.has(assetId)) {
      const refCount = Math.max(0, this._refCounts.get(assetId) - 1);
      this._refCounts.set(assetId, refCount);
    }
  }
}

class InMemoryDarBuffer {
  constructor () {
    this._version = null;
    this._changes = [];
    this._isDirty = {};
    this._blobs = {};
  }

  getVersion () {
    return this._version
  }

  load(archiveId, cb) { // eslint-disable-line
    cb();
  }

  addChange (docId, change) {
    // HACK: if there are no ops we skip
    if (change.ops.length === 0) return
    // console.log('RECORD CHANGE', docId, change)
    this._isDirty[docId] = true;
    this._changes.push({
      docId, change
    });
  }

  hasPendingChanges () {
    return this._changes.length > 0
  }

  getChanges () {
    return this._changes.slice()
  }

  hasResourceChanged (docId) {
    return this._isDirty[docId]
  }

  hasBlobChanged (assetId) {
    return Boolean(this._isDirty[assetId])
  }

  addBlob (assetId, blob) {
    this._isDirty[assetId] = true;
    this._blobs[assetId] = blob;
  }

  getBlob (assetId) {
    return this._blobs[assetId]
  }

  reset (version) {
    this._version = version;
    this._changes = [];
    this._blobs = {};
    this._isDirty = {};
  }
}

function loadArchive (rawArchive, config) {
  const archive = new DocumentArchive(
    // Note: this is a minimalistic Storage adapter with only `read()` implemented
    {
      read (_, cb) {
        cb(null, rawArchive);
      },
      write (_, __, cb) {
        cb();
      },
      getAssetUrl (_, asset) {
        const resource = rawArchive.resources[asset.id];
        if (resource.encoding === 'url') {
          return resource.data
        }
      }
    },
    new InMemoryDarBuffer(),
    {},
    config
  );
  // Note: we are using a synchronous store here (in memory)
  // so this is actually synchronous
  archive.load(null, err => {
    if (err) {
      console.error(err);
    }
  });
  return archive
}

class Switch extends Component {
  render () {
    const { value, label } = this.props;
    const switchEl = $$('label', { className: 'sc-switch' },
      $$('input', { type: 'checkbox', checked: Boolean(value) }).on('change', this._onChange),
      $$('span', { className: 'se-switch' })
    );
    if (label) {
      switchEl.append(
        $$('span', { className: 'se-label' }, label)
      );
    }
    return switchEl
  }

  _onChange (event) {
    // TODO: this logic should somehow be shared amongst all these action impls
    // e.g. introduce a AbstractAction component
    const { action, args } = this.props;
    if (action) {
      // send position arguments if 'args' is specified
      const _args = args || [this.props];
      this.send(action, ..._args);
    }
  }
}

class VersionsLeftHeader extends Component {
  render () {
    const { showAutosaves } = this.props;
    return $$('div', { class: 'sc-header' },
      $$(Limiter, { fullscreen: true },
        $$(HorizontalStack, {},
          $$(Button, { size: 'large', style: 'plain', action: 'closeVersions' },
            $$(Icon, { icon: 'arrow-left' }),
            '\u00A0',
            '\u00A0',
            'Versions'
          ),
          $$(StackFill),
          $$(Switch, { label: 'Autosaved', value: showAutosaves, onchange: this._onChangeShowAutosaves })
        )
      )
    )
  }

  _onChangeShowAutosaves (e) {
    e.stopPropagation();
    this.send('toggleShowAutosaves');
  }
}

class VersionItem extends Component {
  render () {
    const { version, isSelected } = this.props;
    const { isAuto, isPublic } = version;

    const el = $$('div', { class: 'sc-version-item' });
    if (isSelected) el.addClass('sm-selected');
    if (isAuto) el.addClass('sm-auto');
    if (isPublic) el.addClass('sm-public');

    el.append(
      VersionItem.renderItemContent(version)
    );

    el.on('click', this._onClick);
    el.on('dblclick', stopAndPrevent);
    el.on('contextmenu', this._onContextmenu);

    return el
  }

  static renderItemContent (version) {
    if (!version) return

    const { isAuto, createdAt, description, isPublic } = version;
    const dateTimeFormat = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    // TODO: we need some UX decisions here
    // e.g. we could decide to leave auto saves just as recovery points (can not be published)
    // or otherwise turn auto saves in an explicit draft
    return $$(HorizontalStack, {},
      $$('div', { class: 'se-created-at' }, new Date(createdAt).toLocaleString(undefined, dateTimeFormat)),
      $$('div', { class: 'se-description' + (isAuto ? ' sm-autosaved' : '') },
        isAuto
          ? 'Autosaved version'
          : description,
        isPublic
          ? ['\u00A0', $$(Icon, { icon: 'globe-americas' })]
          : null
      ).ref('container')
    )
  }

  _onClick (e) {
    stopAndPrevent(e);
    this._select();
  }

  _onContextmenu (e) {
    stopAndPrevent(e);
    this._select();
    const desiredPos = { x: e.clientX, y: e.clientY };
    this.send('requestPopover', {
      requester: this,
      desiredPos,
      content: {
        type: 'menu',
        noIcons: true,
        items: this._getContextMenuItems()
      },
      position: 'relative'
    });
  }

  _select () {
    this.send('selectVersion', this.props.version);
  }

  _getContextMenuItems () {
    const { user, document, version } = this.props;
    return VersionItem.getContextMenuItems(user, document, version)
  }

  static getContextMenuItems (user, document, version) {
    const items = [];
    if (user) {
      if (version.id === 'current') {
        if (document.hasUnversionedChanges) {
          items.push(
            { action: 'createRevision', label: 'Create Revision', args: [version] }
          );
        }
      } else {
        // an autosave needs to be turned into a draft first before being editable or for making it public
        if (version.isAuto) {
          items.push(
            { action: 'createRevision', label: 'Create Revision', args: [version] }
          );
        } else {
          items.push(
            { action: 'editRevision', label: 'Edit', args: [version] }
          );
          items.push(
            { action: 'togglePublic', label: version.isPublic ? 'Make private' : 'Make public', args: [version] }
          );
        }
        items.push(
          { action: 'deleteVersion', label: 'Delete', args: [version] }
        );
        if (version.documentChangeId !== document.changeId) {
          items.push(
            { action: 'restoreVersion', label: 'Restore', args: [version] }
          );
        }
      }
    }
    return items
  }
}

class VersionsRightHeader extends Component {
  render () {
    const { document, version } = this.props;
    const enabled = (version.id === 'current' && document.hasUnversionedChanges) || version.isAuto;
    return $$('div', { class: 'sc-versions-right-header sc-header' },
      $$(Limiter, { fullscreen: true },
        $$(HorizontalStack, {},
          $$(Title, {},
            VersionItem.renderItemContent(version)
          ),
          $$(StackFill),
          $$(Button, { style: 'primary', size: 'default', action: 'createRevision', args: [version], disabled: !enabled }, 'Create Revision'),
          this._getEllipsesMenu()
        )
      )
    )
  }

  _getEllipsesMenu () {
    const { user, document, version } = this.props;
    if (version) {
      // For now we only have those items in the ellipses menu
      // which are also shown in the items context menu
      const items = VersionItem.getContextMenuItems(user, document, version);
      if (items.length > 0) {
        return $$(DropdownMenu, { items },
          $$(Icon, { icon: 'ellipsis-v' })
        )
      }
    }
  }
}

class Essay extends Component {
  getChildContext () {
    return {
      // render headings with level+1 because we use h1 for title
      headingOffset: 1
    }
  }

  render () {
    const { node } = this.props;
    const doc = node.getDocument();
    return $$('div', { class: 'sc-essay' },
      $$(Limiter, {},
        $$('div', { class: 'se-essay-content' },
          renderProperty(this, doc, [node.id, 'title'], { placeholder: 'Untitled' })
            // HACK: We apply heading class manually, to keep a flat structure
            // and avoid wrapping a div in h1 tag.
            .addClass('sc-heading')
            .addClass('sm-level-1'),
          renderProperty(this, doc, [node.id, 'body'], { placeholder: 'Write your article here.' })
        )
      )
    )
  }
}

// TODO: work on a slimmer Reader impl
class EssayReader extends Component {
  constructor (...args) {
    super(...args);

    this._initialize(this.props);
  }

  _initialize (props) {
    // HACK: this mess is necessary to use components from Texture
    // which are too much coupled to context.api and context.editorSession
    // TODO: we should try to make Texture components more reusable

    const { archive } = props;
    const config = archive.getConfig();
    const manuscript = archive.getDocument('manuscript');

    // HACK: unfortunately we need an EditorSession, otherwise we can not create
    // an ArticleAPI, which all components rely on.
    // TODO: this should be possible without any session
    const editorSession = new EditorSession('manuscript', manuscript, config, {
      overlayId: null
    });
    this.editorSession = editorSession;
    const editorState = editorSession.editorState;
    this.editorState = editorState;

    const context = Object.assign(this.context, createEditorContext(config, editorSession), {
      config: config,
      editorSession,
      editorState,
      archive,
      urlResolver: archive,
      editable: false
    });
    this.context = context;

    editorSession.setContext(context);
    editorSession.initialize();

    // HACK: resetting the app state here, because things might get 'dirty' during initialization
    // TODO: find out if there is a better way to do this
    editorState._reset();
  }

  willReceiveProps (props) {
    if (props.archive !== this.props.archive) {
      this._dispose();
      this._initialize(props);
      this.empty();
    }
  }

  dispose () {
    this._dispose();
  }

  _dispose () {
    this.editorSession.dispose();
  }

  render () {
    const { archive, disabled } = this.props;
    const manuscript = archive.getDocument('manuscript');
    const el = $$('div').addClass('sc-essay-reader');
    el.append(
      $$(Essay, { node: manuscript.root, readOnly: true, disabled })
    );
    return el
  }
}

// TODO: later we could load components according to the specific document type
class DocumentReader extends Component {
  defineContext (props) {
    const { archive } = props;
    return {
      archive
    }
  }

  render () {
    return $$(EssayReader, this.props)
  }
}

/* Just a little layout component for forms */
function FourSquareLaoyut (props) {
  return (
    $$('div', { class: 'sc-four-square-layout' },
      $$('div', { class: 'se-top-left' },
        props.children[0]
      ),
      $$('div', { class: 'se-top-right' },
        props.children[1]
      ),
      $$('div', { class: 'se-bottom-left' },
        props.children[2]
      ),
      $$('div', { class: 'se-bottom-right' },
        props.children[3]
      )
    )
  )
}

class RadioToggle extends Component {
  getInitialState () {
    const value = this.props.value;
    return { value }
  }

  render () {
    const options = this.props.options;

    return $$('div', { className: 'sc-radio-toggle' },
      $$(HorizontalStack, {},
        options.map(option => {
          const isActive = option.value === this.state.value;
          const labelEl = $$('div', { className: 'se-radio-label' },
            $$('div', { className: 'se-label' }, option.label)
          );
          if (option.description) {
            labelEl.append(
              $$('div', { className: 'se-description' }, option.description)
            );
          }
          return $$('div', { className: 'se-radio-option' + (isActive ? ' sm-active' : '') },
            $$(HorizontalStack, {},
              $$('div', { className: 'se-radio-input' },
                $$('input', { name: 'radio-toggle', type: 'radio', value: option.value, checked: isActive })
              ),
              labelEl
            )
          ).on('click', this.val.bind(this, option.value))
        })
      )
    )
  }

  val (value) {
    if (value) {
      this.setState({ value });
    } else {
      return this.state.value
    }
  }
}

class Versions extends Component {
  getInitialState () {
    const { document, archive } = this.props;
    // a fake version record for the current document version which might
    // not be versioned yet
    this._currentVersion = {
      id: 'current',
      isAuto: false,
      isPublic: false,
      description: 'Current',
      get createdAt () {
        return document.updatedAt
      },
      get documentChangeId () {
        return document.changeId
      }
    };
    return {
      versions: [],
      showAutosaves: false,
      selectedVersion: this._currentVersion,
      selectedVersionArchive: archive
    }
  }

  getActionHandlers () {
    return {
      toggleShowAutosaves: this._toggleShowAutosaves,
      selectVersion: this._selectVersion,
      deleteVersion: this._deleteVersion,
      createRevision: this._createRevision,
      editRevision: this._editRevision,
      togglePublic: this._togglePublic,
      requestPopover: this._interceptPopoverRequest
    }
  }

  didMount () {
    this._getVersions().then(versions => {
      this.extendState({ versions });
    });
  }

  didUpdate (oldProps) {
    if (oldProps.document !== this.props.document) {
      this._getVersions().then(versions => {
        this.extendState({ versions });
      });
    }
  }

  render () {
    const { user, document } = this.props;
    const { showAutosaves, selectedVersion: version } = this.state;
    const el = $$('div', { class: 'sc-versions' },
      $$(FourSquareLaoyut, {},
        $$(VersionsLeftHeader, { showAutosaves }),
        $$(VersionsRightHeader, { user, document, version }),
        this._renderVersions(),
        this._renderSelectedVersion()
      ),
      // The ModalCanvas is empty by default, and only has content if
      // we open a modal (e.g. VersionModal)
      $$(ModalCanvas).ref('modalCanvas')
    )
    // prevent some events from bubbling up
    ;['copy', 'cut', 'paste', 'keydown'].forEach(event => el.on(event, stop));

    return el
  }

  _renderVersions () {
    const { user, document } = this.props;
    const { versions, selectedVersion } = this.state;
    const el = $$('div', { class: 'se-versions' }).ref('versions');

    el.append(
      $$(_CurrentVersionItem, {
        document,
        version: this._currentVersion,
        isSelected: _isSelected(this._currentVersion, selectedVersion)
      }).ref('current')
    );

    if (versions) {
      for (const version of versions) {
        // skip autosaves if showAutosaves switch is off
        if (version.isAuto && !this.state.showAutosaves) continue
        const isSelected = _isSelected(version, selectedVersion);
        const isCurrent = document.changeId === version.changeId;
        el.append(
          $$(VersionItem, {
            user,
            document,
            version,
            isSelected,
            isCurrent
          }).ref(version.id)
        );
      }
    }
    return el
  }

  _renderSelectedVersion () {
    const { selectedVersionArchive: archive } = this.state;
    if (archive) {
      const selectedVersionEl = $$('div').addClass('se-selected-version');
      selectedVersionEl.append(
        $$(DocumentReader, { archive, disabled: true })
      );
      return selectedVersionEl
    }
  }

  _getVersions (showAutosaves) {
    const { document } = this.props;
    if (isNil(showAutosaves)) {
      showAutosaves = this.state.showAutosaves;
    }
    return sendRequest({
      url: '/api/listVersions',
      method: 'POST',
      json: true,
      data: {
        documentId: document.id,
        noAuto: !showAutosaves
      }
    })
  }

  _toggleShowAutosaves () {
    let selectedVersion = this.state.selectedVersion;
    if (selectedVersion && selectedVersion.isAuto) {
      selectedVersion = null;
    }
    const showAutosaves = !this.state.showAutosaves;
    this._getVersions(showAutosaves).then(versions => {
      this.extendState({
        showAutosaves,
        versions,
        selectedVersion
      });
    });
  }

  _selectVersion (version) {
    if (this.state.selectedVersion === version) return

    // first clear the content
    this.extendState({ selectedVersion: version, selectedVersionArchive: null });

    if (version === this._currentVersion) {
      const archive = this.props.archive;
      this.extendState({ selectedVersionArchive: archive });
    } else {
      const document = this.props.document;
      // then fetch the version archive data
      sendRequest({
        url: '/api/getArchiveForVersion',
        method: 'POST',
        json: true,
        data: {
          documentId: document.id,
          versionId: version.id
        }
      }).then(rawArchive => {
        const archive = loadArchive(rawArchive, this.context.config);
        this.extendState({ selectedVersionArchive: archive });
      });
    }
  }

  _createRevision () {
    const { selectedVersion } = this.state;
    const modalCanvas = this.refs.modalCanvas;

    modalCanvas.openModal(() => {
      return $$(_RevisionModal, { mode: 'create', version: selectedVersion })
    }).then(modal => {
      if (!modal) return
      const { revisionType, description } = modal.getResult();
      const isPublic = revisionType === 'public';

      // this is used either to create a revision from the current unversioned document
      // or to create a revision from an autosaved version
      if (selectedVersion === this._currentVersion) {
        this._createRevisionFromCurrentVersion({ description, isPublic });
      } else if (selectedVersion.isAuto) {
        this._updateVersion(selectedVersion, {
          isAuto: false,
          description,
          isPublic
        });
      }
    });
  }

  _editRevision (version) {
    const modalCanvas = this.refs.modalCanvas;
    modalCanvas.openModal(() => {
      return $$(_RevisionModal, { mode: 'edit', version })
    }).then(modal => {
      if (!modal) return
      const { revisionType, description } = modal.getResult();
      this._updateVersion(version, {
        isPublic: revisionType === 'public',
        description
      });
    });
  }

  _togglePublic (version) {
    this._updateVersion(version, { isPublic: !version.isPublic });
  }

  _createRevisionFromCurrentVersion ({ description, isPublic }) {
    const { document } = this.props;
    return sendRequest({
      url: '/api/createVersion',
      method: 'POST',
      json: true,
      data: {
        documentId: document.id,
        description,
        isPublic,
        isAuto: false
      }
    }).then(version => {
      this._updateSelectedVersion(version);
      this.send('updateDocumentRecord');
    })
  }

  _deleteVersion (version) {
    // TODO: show dialog before permanently deleting a version
    const { document } = this.props;
    sendRequest({
      url: '/api/deleteVersion',
      method: 'POST',
      json: true,
      data: {
        documentId: document.id,
        versionId: version.id
      }
    }).then(() => {
      this._updateSelectedVersion(null);
      this.send('updateDocumentRecord');
    });
  }

  _updateVersion (version, update) {
    const { document } = this.props;
    sendRequest({
      url: '/api/updateVersion',
      method: 'POST',
      json: true,
      data: {
        documentId: document.id,
        versionId: version.id,
        update
      }
    }).then(updatedVersion => {
      this._updateSelectedVersion(updatedVersion);
      this.send('updateDocumentRecord');
    });
  }

  _updateSelectedVersion (selectedVersion) {
    this._getVersions().then(versions => {
      this.extendState({
        versions,
        selectedVersion,
        selectedVersionArchive: null
      });
    });
  }

  _getScrollableElement () {
    this.refs.versions.getElement();
  }

  _interceptPopoverRequest (requestParams) {
    const parent = this.getParent();
    parent.send('requestPopover', requestParams, this._getScrollableElement());
  }
}

class _CurrentVersionItem extends VersionItem {
  render () {
    return super.render().addClass('sc-version-item sm-current')
  }

  _renderItemContent () {
    const { version } = this.props;
    return $$(HorizontalStack, {},
      $$('div', { class: 'se-created-at' }, new Date(version.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })),
      $$('div', { class: 'se-description' }, version.description)
    )
  }

  _getContextMenuItems () {
    const { document, version } = this.props;
    if (document.hasUnversionedChanges) {
      return [
        { action: 'createRevision', label: 'Create Revision', args: [version] }
      ]
    }
    return []
  }
}

class _RevisionModal extends Component {
  didMount () {
    // TODO: autofocus is not working somehow
    this.refs.description.focus();
  }

  render () {
    const { mode, version } = this.props;
    const value = version.isPublic ? 'public' : 'draft';
    const options = [
      { value: 'draft', label: 'Private', description: 'Only collaborators have access.' },
      { value: 'public', label: 'Public', description: 'Makes this revision available for readers on the web.' }
    ];
    const modalProps = mode === 'create'
      ? { title: 'Create revision', cancelLabel: 'Cancel', confirmLabel: 'Create Revision' }
      : { title: 'Edit revision', cancelLabel: 'Cancel', confirmLabel: 'Update Revision' };
    return $$(Modal, modalProps, $$(Form, {},
      $$(FormRow, {},
        $$(RadioToggle, { options, ref: 'revisionType', value })
      ),
      $$(FormRow, { label: 'Description' },
        $$(Input, { ref: 'description', autofocus: true, value: version.description })
      )
    ))
  }

  getResult () {
    return {
      revisionType: this.refs.revisionType.val(),
      description: this.refs.description.val()
    }
  }
}

function _isSelected (version, selectedVersion) {
  return (
    version && selectedVersion && version.id === selectedVersion.id
  )
}

class EssayEditorApi extends BasicEditorApi {
  insertImagesAsFigures (files) {
    // TODO: we would need a transaction on archive level, creating assets,
    // and then placing them inside the article body.
    // This way the archive gets 'polluted', i.e. a redo of that change does
    // not remove the asset.
    const editorSession = this.editorSession;
    const paths = files.map(file => {
      return this.archive.addAsset(file)
    });
    const sel = editorSession.getSelection();
    if (!sel || !sel.containerPath) return
    editorSession.transaction(tx => {
      this._insertFigures(tx, sel, files, paths);
    });
  }

  _insertFigures (tx, sel, files, paths) {
    if (files.length === 0) return

    const containerPath = sel.containerPath;
    const figures = files.map((file, idx) => {
      const href = paths[idx];
      const figure = createNodeFromJson(tx, {
        type: 'figure',
        image: href,
        legend: [{ type: 'paragraph' }]
      });
      // Note: this is necessary because tx.insertBlockNode()
      // selects the inserted node
      // TODO: maybe we should change the behavior of tx.insertBlockNode()
      // so that it is easier to insert multiple nodes at once
      if (idx !== 0) {
        tx.break();
      }
      tx.insertBlockNode(figure);
      return figure
    });
    selectNode(tx, last(figures).id, containerPath);
  }
}

// ATTENTION: deviating from the common toolbar implementation
// because we want to use a Limiter around the menu content
// TODO: alternatively we could discuss whether it makes sense
// to make the common implementation configurable, i.e. 'limiter:true|false'
class EditorToolbar extends Component {
  render () {
    return $$('div', { class: 'sc-editor-toolbar' }).append(
      $$(Limiter, { fullscreen: true },
        renderMenu(this, 'editor-toolbar')
      )
    )
  }
}

class EssayEditor extends AbstractEditor {
  getActionHandlers () {
    return {
      requestPopover: this._interceptPopoverRequest
    }
  }

  render () {
    const document = this.document;
    const el = $$('div', { class: 'sc-essay-editor' });
    el.append(
      $$(Managed(EditorToolbar, 'commandStates'))
    );
    el.append(
      $$(Essay, { node: document.root, editable: true, onscroll: this._onScroll }).ref('content')
    );
    // ATTENTION: hopefully this does not prevent any other default behavior
    // important not to preventDefault here, as otherwise native mouse stuff, like focussing is not working anymore
    el.on('mousedown', stop);
    el.on('contextmenu', this._onContextMenu);

    return el
  }

  _createAPI (archive, editorSession) {
    return new EssayEditorApi(archive, editorSession)
  }

  _getDocumentType () {
    return 'essay'
  }

  _getScrollableElement () {
    return this.refs.content.getElement()
  }

  _onContextMenu (event) {
    stopAndPrevent(event);
    console.error('Show editor context menu');
  }

  _interceptPopoverRequest (requestParams) {
    const parent = this.getParent();
    parent.send('requestPopover', requestParams, this._getScrollableElement());
  }

  _onScroll () {
    this.send('repositionPopover', this._getScrollableElement());
  }
}

// TODO: later we could load components according to the specific document type
class DocumentEditor extends Component {
  render () {
    return $$(EssayEditor, this.props).ref('impl')
  }

  handleKeydown (event) {
    return this.refs.impl.handleKeydown(event)
  }
}

function EssaySchema () {
  const builder = new SchemaBuilder('essay', 'substance');

  builder.nextVersion(v => {
    // essay
    v.addNode('essay', '@node', {
      title: 'text',
      body: {
        type: 'container',
        childTypes: ['paragraph', 'heading', 'figure', 'list'],
        defaultTextType: 'paragraph'
      }
    });
    // annotations
    v.addNode('bold', '@annotation');
    v.addNode('italic', '@annotation');
    v.addNode('link', '@annotation', {
      href: 'string'
    });
    v.addNode('strike', '@annotation');
    v.addNode('subscript', '@annotation');
    v.addNode('superscript', '@annotation');
    const RICH_TEXT_ANNOS = ['bold', 'italic', 'link', 'subscript', 'superscript', 'strike'];
    // paragraph
    v.addNode('paragraph', '@text', {
      content: { type: 'text', childTypes: RICH_TEXT_ANNOS }
    });
    // heading
    v.addNode('heading', '@text', {
      content: { type: 'text', childTypes: RICH_TEXT_ANNOS },
      level: { type: 'number', default: 1 }
    });
    v.addNode('figure', '@node', {
      // Not yet
      // title: { type: 'text', childTypes: [/* only plain text */] },
      image: 'string',
      legend: { type: 'container', childTypes: ['paragraph'], defaultTextType: 'paragraph' }
    });
    v.addNode('list', '@node', {
      items: { type: 'children', childTypes: ['list-item'] },
      listType: 'string'
    }, { Mixin: ListMixin, omitPropertyElement: true });
    v.addNode('list-item', '@text', {
      content: { type: 'text', childTypes: RICH_TEXT_ANNOS },
      level: { type: 'number', default: 1 }
    }, { Mixin: ListItemMixin });
  });

  const schema = builder.createSchema();
  // HACK: we still have to set documentSchema.defaultTextType
  schema._documentSchema.defaultTextType = 'paragraph';

  return schema
}

class EssayLoader {
  load (xmlData) {
    const schema = EssaySchema();
    const doc = schema.createDocumentInstance();
    return doc.fromXml(xmlData)
  }
}

class InsertNodeCommand extends InsertNodeCommand$1 {
  getCommandState (params, context) {
    const { selection, selectionState } = params;
    const newState = {
      disabled: true,
      active: false
    };
    if (selection && !selection.isNull() && !selection.isCustomSelection()) {
      const { node, containerPath } = selectionState;
      if (node && node.isText() && containerPath) {
        // TODO: discuss this. IMO the most natural way to insert block nodes is
        // to create an empty paragraph, and then insert the figure there.
        // This is not consistent with behavior of Word or GDocs
        // but they treat images et al. as characters -- which justifies inserting anywhere.
        // Here we enable block node insertion only on empty text nodes, or when at start or end of
        // a text node.
        if (node.isEmpty() || selectionState.isFirst || selectionState.isLast) {
          newState.disabled = false;
        }
      }
    }
    return newState
  }
}

class InsertFigureCommand extends InsertNodeCommand {
  getType () {
    return 'figure'
  }

  execute (params, context) {
    const state = params.commandState;
    if (state.disabled) return
    const surface = params.surface;
    if (!surface) {
      console.error('No surface available.');
    } else {
      surface.send('requestFileSelect', { fileType: 'image/*', multiple: true }).then(files => {
        if (files.length > 0) {
          context.api.insertImagesAsFigures(files);
        }
      });
    }
  }
}

const {
  ParagraphConverter, HeadingConverter, FigureConverter, BoldConverter, ItalicConverter,
  StrikeConverter, SubscriptConverter, SuperscriptConverter, LinkConverter
} = HtmlConverters;

class EssayConfiguration extends Configurator {
  constructor () {
    super();

    this.configure(this);
  }

  configure (config) {
    // basic stuff from substance
    config.import(BasePackage);

    config.registerDocumentLoader('essay', EssayLoader);

    // document specific configuration
    config.addComponent('essay', Essay);
    config.addComponent('paragraph', ParagraphComponent);
    config.addComponent('heading', HeadingComponent);
    config.addComponent('figure', FigureComponent);
    config.addComponent('list', ListComponent);
    config.addComponent('list-item', ListItemComponent);
    config.addComponent('link', LinkComponent);

    // HTML conversion
    config.addConverter('html', ParagraphConverter);
    config.addConverter('html', HeadingConverter);
    config.addConverter('html', FigureConverter);
    config.addConverter('html', BoldConverter);
    config.addConverter('html', ItalicConverter);
    config.addConverter('html', StrikeConverter);
    config.addConverter('html', SubscriptConverter);
    config.addConverter('html', SuperscriptConverter);
    config.addConverter('html', LinkConverter);
    config.addImporter('html', DefaultHtmlImporter);
    config.addExporter('html', HTMLExporter);

    // Commands
    config.addCommand('undo', UndoCommand, { accelerator: 'CommandOrControl+z' });
    config.addCommand('redo', Redo, { accelerator: 'CommandOrControl+Shift+z' });
    config.addCommand('select-all', SelectAllCommand, { accelerator: 'CommandOrControl+a' });

    // ATTENTION: Ctrl+Alt is unfortunately not working in Windows, because Windows maps this to AltGr
    // Using Ctrl+level for now
    config.addCommand('switch-to-paragraph', SwitchTextTypeCommand, {
      spec: { type: 'paragraph' },
      commandGroup: 'text-types',
      accelerator: platform.isWindows ? 'Ctrl+0' : 'CommandOrControl+Alt+0'
    })
    ;[1, 2, 3, 4].forEach(level => {
      config.addCommand(`switch-to-heading-${level}`, SwitchTextTypeCommand, {
        spec: { type: 'heading', level },
        commandGroup: 'text-types',
        accelerator: platform.isWindows ? `Ctrl+${level}` : `CommandOrControl+Alt+${level}`
      });
    });
    config.addCommand('toggle-bold', AnnotationCommand, {
      nodeType: 'bold',
      accelerator: 'CommandOrControl+B'
    });
    config.addCommand('toggle-italic', AnnotationCommand, {
      nodeType: 'italic',
      accelerator: 'CommandOrControl+I'
    });
    config.addCommand('toggle-strike', AnnotationCommand, {
      nodeType: 'strike',
      accelerator: 'CommandOrControl+Shift+X'
    });
    config.addCommand('toggle-subscript', AnnotationCommand, {
      nodeType: 'subscript',
      accelerator: 'CommandOrControl+Shift+B'
    });
    config.addCommand('toggle-superscript', AnnotationCommand, {
      nodeType: 'superscript',
      accelerator: 'CommandOrControl+Shift+P'
    });
    config.addCommand('create-link', CreateLinkCommand, {
      nodeType: 'link',
      accelerator: 'CommandOrControl+K'
    });
    config.addCommand('insert-figure', InsertFigureCommand, {
      nodeType: 'figure',
      accelerator: 'CommandOrControl+Shift+f'
    });

    const switchTextType = {
      type: 'menu',
      ComponentClass: SwitchTextTypeDropdown,
      hideWhenDisabled: true,
      items: [
        { command: 'switch-to-paragraph', label: 'Paragraph', icon: 'paragraph' },
        { command: 'switch-to-heading-1', label: 'Heading 1', icon: 'heading' },
        { command: 'switch-to-heading-2', label: 'Heading 2', icon: 'heading' },
        { command: 'switch-to-heading-3', label: 'Heading 3', icon: 'heading' },
        { command: 'switch-to-heading-4', label: 'Heading 4', icon: 'heading' }
      ]
    };

    const editorToolbar = {
      type: 'toolbar',
      style: 'plain',
      size: 'small',
      items: [
        { command: 'undo', icon: 'undo', tooltip: 'Undo' },
        { command: 'redo', icon: 'redo', tooltip: 'Redo' },
        { type: 'separator' },
        { command: 'toggle-bold', icon: 'bold', tooltip: 'Bring attention to' },
        { command: 'toggle-italic', icon: 'italic', tooltip: 'Introduce to' },
        { command: 'toggle-strike', icon: 'strikethrough', tooltip: 'Strike Through' },
        { command: 'toggle-subscript', icon: 'subscript', tooltip: 'Subscript' },
        { command: 'toggle-superscript', icon: 'superscript', tooltip: 'Superscript' },
        { command: 'create-link', icon: 'link', tooltip: 'Link' },
        { command: 'toggle-unordered-list', icon: 'list-ul', tooltip: 'Bullet-List' },
        { command: 'toggle-ordered-list', icon: 'list-ol', tooltip: 'Numbered List' },
        { command: 'indent-list', icon: 'indent', tooltip: 'Indent' },
        { command: 'outdent-list', icon: 'outdent', tooltip: 'Outdent' },
        { command: 'insert-figure', icon: 'image', tooltip: 'Figure' },
        switchTextType,
        { type: 'fill' }
      ]
    };

    config.addToolPanel('editor-toolbar', editorToolbar);
    config.addLabel('essay.title', 'Title');
    config.addLabel('paragraph', 'Paragraph');
    config.addLabel('heading', 'Heading');

    return config
  }
}

/* global FormData, Blob */

// Note: the DocumentComponent takes care of loading and saving a DAR, and creating versions.
class DocumentComponent extends Component {
  constructor (...args) {
    super(...args);

    this._debouncedAutosave = debounce(this.save, 1000);
  }

  getActionHandlers () {
    return {
      openVersions: this.openVersions,
      closeVersions: this.closeVersions,
      save: this.save
    }
  }

  getInitialState () {
    const { rawArchive, document } = this.props;

    // TODO: the configuration should be derived from the documen type
    this._config = new EssayConfiguration();

    const archive = loadArchive(rawArchive, this._config);
    if (this._isEditable()) {
      archive.storage = new _PersistenceAdapter(rawArchive, document.id, document.url);
    }
    const showVersions = Boolean(getQueryStringParam('versions'));
    return {
      archive,
      showVersions
    }
  }

  getChildContext () {
    return {
      config: this._config
    }
  }

  didMount () {
    if (this._isEditable()) {
      // Note: adding global handlers causes problems in the test suite
      DOMElement.getBrowserWindow().on('keydown', this._keyDown, this);
      DOMElement.getBrowserWindow().on('drop', stopAndPrevent, this);
      DOMElement.getBrowserWindow().on('dragover', stopAndPrevent, this);

      this.state.archive.on('archive:changed', this._debouncedAutosave, this);
      this._debouncedChangeStatusMessage = debounce(this.changeStatusMessage, 3000);
    }
  }

  dispose () {
    DOMElement.getBrowserWindow().off(this);
    this.state.archive.off(this);
  }

  render () {
    // TODO: we need to find out which use-cases we have
    // a readOnly could be like a static version, which needs to be rendered with pure HTML
    // for the others, there could be need for enabling specific features, e.g. only commenting
    const { user, document, readOnly } = this.props;
    const { archive } = this.state;
    const el = $$('div', { class: 'sc-document-content' });
    if (archive) {
      if (readOnly) {
        el.append(
          $$(DocumentReader, { archive }).ref('reader')
        );
      } else {
        el.append(
          $$(DocumentEditor, { archive }).ref('editor')
        );
      }
      if (this.state.showVersions) {
        el.append(
          // Notes:
          // - the archive is passed so that the current version can be displayed
          // - user is needed to conditionally show version management tools (Versions has its own header)
          $$(Versions, { user, document, archive })
        );
      }
    } else {
      el.text('LOADING...');
    }
    return el
  }

  _updateTitle () {}

  _keyDown (event) {
    // TODO: should this really be suppressed here?
    if (event.key === 'Dead') return
    this._handleKeydown(event);
  }

  _handleKeydown (event) {
    const key = parseKeyEvent(event);
    // console.log('Texture received keydown for combo', key)
    let handled = false;
    // CommandOrControl+S
    if (key === 'META+83' || key === 'CTRL+83') {
      this.save();
      handled = true;
    }
    if (!handled) {
      if (this.refs.editor) {
        handled = this.refs.editor.handleKeydown(event);
      }
    }
    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  openVersions () {
    this.extendState({ showVersions: true });
  }

  closeVersions () {
    return this._updateDocumentState().then(() => {
      this.extendState({ showVersions: false });
    })
  }

  save () {
    const { archive } = this.state;
    this.changeStatusMessage('Saving...');
    return new Promise((resolve, reject) => {
      archive.save((err, update) => {
        if (err) {
          console.error(err);
          return reject(err)
        }
        this._updateTitle();
        this._updateDocumentState().then(() => {
          resolve(update);
        });
      });
    }).finally(() => {
      this._debouncedChangeStatusMessage('All changes saved');
    })
  }

  changeStatusMessage (msg) {
    this.send('displayStatusMessage', msg);
  }

  _updateDocumentState () {
    return this.send('updateDocumentRecord')
  }

  _isEditable () {
    return !this.props.readOnly
  }
}

// Temporary solution
// Using a hybrid in-memory and http implementation.
// In-memory for server side rendering, and initial mount, http for storing
class _PersistenceAdapter {
  constructor (rawArchive, documentId, documentUrl) {
    this.rawArchive = rawArchive;
    this.documentId = documentId;
    this.documentUrl = documentUrl;
  }

  read (_, cb) {
    cb(null, this.rawArchive);
  }

  write (_, data, cb) {
    const form = new FormData();
    const resources = data.resources;
    Object.keys(resources).forEach(id => {
      const record = resources[id];
      if (record.encoding === 'blob') {
        // removing the blob from the record and submitting it as extra part
        let blob = record.data;
        if (!(blob instanceof Blob)) {
          blob = new Blob([record.data]);
        }
        form.append(id, blob, record.filename);
        delete record.data;
      }
    });
    form.append('_archive', JSON.stringify(data));
    // substanceSendRequest({
    sendRequest({
      method: 'PUT',
      url: this.documentUrl,
      multiPart: true,
      data: form
    }).then(response => {
      cb(null, response);
    }).catch(err => {
      cb(err);
    });
  }

  getAssetUrl (_, { id, filename }) {
    return `/assets/${this.documentId}/${filename}`
  }
}

class DocumentPage extends BasePage {
  // ATTENTION: we need to dispatch content related actions from
  // header to the content component
  getActionHandlers () {
    return Object.assign(super.getActionHandlers(),
      {
        openVersions: () => {
          return this.refs.content.openVersions()
        },
        updateDocumentRecord: this._getUpdatedDocumentRecord,
        displayStatusMessage: this._displayStatusMessage
      }
    )
  }

  renderPageBody () {
    const body = super.renderPageBody();
    const { readOnly } = this.props;
    if (readOnly) {
      body.addClass('sm-reader');
    } else {
      // prevent native context menu in the editor
      body.on('contextmenu', stopAndPrevent);
      body.addClass('sm-editor');
    }
    return body
  }

  renderBodyContent () {
    const { user, document, rawArchive, readOnly } = this.props;
    const { isMobile, statusMessage } = this.state;

    if (user && !readOnly) {
      // Editor
      return [
        $$(DocumentHeader, { user, document, statusMessage }).ref('header'),
        $$(DocumentComponent, { user, document, rawArchive, readOnly }).ref('content')
      ]
    } else {
      // Reader
      return [
        isMobile
          ? $$(MobileHeader, { user }).ref('header')
          : $$(DocumentHeader, { user, document, readOnly: true }).ref('header'),
        $$(DocumentComponent, { user, document, rawArchive, readOnly: true }).ref('content'),
        $$(Footer, { isMobile })
      ]
    }
  }

  async _getUpdatedDocumentRecord () {
    const document = await sendRequest({
      url: '/api/getDocumentRecord',
      method: 'POST',
      json: true,
      data: {
        documentId: this.props.document.id
      }
    });
    // HACK: this only makes sense because DocumentPage is the root component
    this.extendProps({ document });
  }

  _displayStatusMessage (statusMessage) {
    this.extendState({ statusMessage });
  }
}

export default DocumentPage;
//# sourceMappingURL=document.page.js.map

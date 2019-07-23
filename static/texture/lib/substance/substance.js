(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.substance = {})));
}(this, (function (exports) { 'use strict';

  const platform = {

    inBrowser: false,

    inNodeJS: false,

    inElectron: false,

    
    isIE: false,
    

    isFF: false,

    isOpera: false,

    isWebkit: false,

    isChromium: false,

    
    version: -1,

    

    isWindows: false,

    isMac: false,

    devtools: false,

    
    
    _reset: detect
  };

  function detect () {
    if (typeof window !== 'undefined') {
      platform.inBrowser = true;

      
      const ua = window.navigator.userAgent;
      const vn = window.navigator.vendor;
      const msie = ua.indexOf('MSIE ');
      const trident = ua.indexOf('Trident/');
      const edge = ua.indexOf('Edge/');
      const opera = window.opr;
      const chrome = window.chrome;

      if (msie > 0) {
        
        platform.isIE = true;
        platform.version = 10;
        
        
      } else if (trident > 0) {
        
        platform.isIE = true;
        platform.version = 11;
        platform.isTrident = true;
        
        
        
      } else if (edge > 0) {
        
        platform.isIE = true;
        platform.isEdge = true;
        platform.version = 12;
        
        parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
      }

      
      platform.isFF = window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

      
      platform.isWebkit = !platform.isFF && !platform.isIE;

      
      platform.isOpera = typeof opera !== 'undefined';

      
      platform.isChromium = !!chrome && vn === 'Google Inc.' && !platform.isOpera && !platform.isEdge;
    } else {
      platform.inBrowser = false;
    }

    if (platform.inBrowser) {
      platform.isWindows = (window.navigator !== undefined && window.navigator.appVersion && window.navigator.appVersion.indexOf('Win') !== -1);
      platform.isMac = (window.navigator !== undefined && window.navigator.platform.indexOf('Mac') >= 0);
    }

    
    if (typeof process !== 'undefined') {
      if (platform.inBrowser) {
        platform.inElectron = true;
      } else {
        platform.inNodeJS = true;
      }
    }
  }

  detect();

  function isString (s) {
    return typeof s === 'string'
  }

  function isNumber (n) {
    return typeof n === 'number'
  }

  function isNil (o) {
    return o === null || o === undefined
  }

  const _global = (typeof global !== 'undefined') ? global : window;
  const substanceGlobals = _global.hasOwnProperty('Substance') ? _global.Substance : _global.Substance = {
    DEBUG_RENDERING: false
  };

  const COUNTERS = new Map();

  function deterministicId (prefix) {
    prefix = prefix || '';
    let counter;
    if (!COUNTERS.has(prefix)) {
      counter = 0;
    } else {
      counter = COUNTERS.get(prefix);
    }
    counter++;
    COUNTERS.set(prefix, counter);
    if (prefix) {
      return `${prefix}-${counter}`
    } else {
      return String(counter)
    }
  }

  function uuid (prefix, len) {
    if (substanceGlobals.DETERMINISTIC_UUID) {
      return deterministicId(prefix)
    }

    if (prefix && prefix[prefix.length - 1] !== '-') {
      prefix = prefix.concat('-');
    }
    var chars = '0123456789abcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [];
    var radix = 16;
    var idx;
    len = len || 32;
    if (len) {
      
      for (idx = 0; idx < len; idx++) uuid[idx] = chars[0 | Math.random() * radix];
    } else {
      
      var r;
      
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';
      
      
      for (idx = 0; idx < 36; idx++) {
        if (!uuid[idx]) {
          r = 0 | Math.random() * 16;
          uuid[idx] = chars[(idx === 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }
    return (prefix || '') + uuid.join('')
  }

  function isObject (val) {
    const type = typeof val;
    return Boolean(val) && (type === 'object' || type === 'function')
  }

  function isFunction (f) {
    return typeof f === 'function'
  }

  function isArray (a) {
    return Array.isArray(a)
  }

  function forEach (iteratee, func) {
    if (!iteratee) return
    if (iteratee.constructor.prototype.forEach) {
      iteratee.forEach(func);
    } else {
      Object.keys(iteratee).forEach(function (key) {
        return func(iteratee[key], key)
      });
    }
  }

  class ArrayIterator {
    constructor (arr) {
      this.arr = arr;
      this.pos = -1;
    }

    get _isArrayIterator () {
      return true
    }

    
    hasNext () {
      return this.pos < this.arr.length - 1
    }

    
    next () {
      this.pos += 1;
      var next = this.arr[this.pos];
      return next
    }

    
    back () {
      if (this.pos >= 0) {
        this.pos -= 1;
      }
      return this
    }

    peek () {
      return this.arr[this.pos + 1]
    }
  }

  function findIndex (arr, predicate) {
    if (!isFunction(predicate)) return arr.indexOf(predicate)
    for (let i = 0; i < arr.length; i++) {
      if (predicate(arr[i])) return i
    }
    return -1
  }

  class DOMEventListener {
    constructor (eventName, handler, options) {
      
      if (!isString(eventName) || !isFunction(handler)) {
        throw new Error("Illegal arguments: 'eventName' must be a String, and 'handler' must be a Function.")
      }
      options = options || {};
      var origHandler = handler;
      var context = options.context;
      var capture = Boolean(options.capture);

      if (context) {
        handler = handler.bind(context);
      }
      if (options.once === true) {
        handler = _once(this, handler);
      }

      this.eventName = eventName;
      this.originalHandler = origHandler;
      this.handler = handler;
      this.capture = capture;
      this.context = context;
      this.options = options;
      
      this._el = null;
    }

    
    get _isDOMEventListener () { return true }

    static findIndex (eventListeners, eventName, handler) {
      var idx = -1;
      if (arguments[1]._isDOMEventListener) {
        idx = eventListeners.indexOf(arguments[1]);
      } else {
        idx = findIndex(eventListeners,
          _matches.bind(null, {
            eventName: eventName,
            originalHandler: handler
          })
        );
      }
      return idx
    }
  }

  function _matches (l1, l2) {
    return l1.eventName === l2.eventName && l1.originalHandler === l2.originalHandler
  }

  function _once (listener, handler) {
    return function (event) {
      handler(event);
      listener._el.removeEventListener(listener);
    }
  }

  const NOT_IMPLEMENTED = 'This method is not implemented.';


  class DOMElement {
    

    

    

    

    

    

    

    

    

    
    getNativeElement () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    isTextNode () {
      
      return false
    }

    
    isElementNode () {
      
      return false
    }

    
    isCommentNode () {
      
      return false
    }

    
    isDocumentNode () {
      
      return false
    }

    
    getTagName () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    setTagName (tagName) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    getId () {
      return this.getAttribute('id')
    }

    
    setId (id) {
      this.setAttribute('id', id);
      return this
    }

    
    hasClass (className) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    addClass (classString) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    removeClass (classString) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    hasAttribute (name) {
      return Boolean(this.getAttribute(name))
    }

    
    attr () {
      if (arguments.length === 1) {
        if (isString(arguments[0])) {
          return this.getAttribute(arguments[0])
        } else if (isObject(arguments[0])) {
          forEach(arguments[0], function (value, name) {
            this.setAttribute(name, value);
          }.bind(this));
        }
      } else if (arguments.length === 2) {
        this.setAttribute(arguments[0], arguments[1]);
      }
      return this
    }

    
    removeAttr (name) {
      var names = name.split(/\s+/);
      if (names.length === 1) {
        this.removeAttribute(name);
      } else {
        names.forEach(function (name) {
          this.removeAttribute(name);
        }.bind(this));
      }
      return this
    }

    
    getAttribute (name) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    setAttribute (name, value) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    removeAttribute (name) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getAttributes () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    htmlProp () {
      if (arguments.length === 1) {
        if (isString(arguments[0])) {
          return this.getProperty(arguments[0])
        } else if (isObject(arguments[0])) {
          forEach(arguments[0], function (value, name) {
            this.setProperty(name, value);
          }.bind(this));
        }
      } else if (arguments.length === 2) {
        this.setProperty(arguments[0], arguments[1]);
      }
      return this
    }

    getProperty (name) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    setProperty (name, value) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    val (value) {
      if (arguments.length === 0) {
        return this.getValue()
      } else {
        this.setValue(value);
        return this
      }
    }

    getValue () {
      return this.getProperty('value')
    }

    setValue (value) {
      this.setProperty('value', value);
      return this
    }

    
    css () {
      
      if (arguments.length === 1) {
        
        if (isString(arguments[0])) {
          return this.getStyle(arguments[0])
        } else if (isObject(arguments[0])) {
          forEach(arguments[0], function (value, name) {
            this.setStyle(name, value);
          }.bind(this));
        } else {
          throw new Error('Illegal arguments.')
        }
      } else if (arguments.length === 2) {
        this.setStyle(arguments[0], arguments[1]);
      } else {
        throw new Error('Illegal arguments.')
      }
      return this
    }

    getStyle (name) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    setStyle (name, value) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    text (text) {
      if (arguments.length === 0) {
        return this.getTextContent()
      } else {
        this.setTextContent(text);
      }
      return this
    }

    
    getTextContent () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    setTextContent (text) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    html (html) {
      if (arguments.length === 0) {
        return this.getInnerHTML()
      } else {
        this.setInnerHTML(html);
      }
      return this
    }

    
    getInnerHTML () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    getInnerXML () {
      return this.getInnerHTML()
    }

    
    setInnerHTML (html) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    setInnerXML (xml) {
      return this.setInnerHTML(xml)
    }

    
    getOuterHTML () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getOuterXML () {
      return this.getOuterHTML()
    }

    
    on (eventName, handler, context, options) {
      
      if (!isString(eventName)) {
        throw new Error('Illegal argument: "event" must be a String.')
      }
      options = options || {};
      if (context) {
        options.context = context;
      }
      
      if (!handler || !isFunction(handler)) {
        throw new Error('Illegal argument: invalid handler function for event ' + eventName)
      }
      this.addEventListener(eventName, handler, options);
      return this
    }

    
    off (eventName, handler) {
      
      if (arguments.length === 1 && !isString(eventName)) {
        let context = arguments[0];
        this.getEventListeners().filter(function (l) {
          return l.context === context
        }).forEach(function (l) {
          this.removeEventListener(l);
        }.bind(this));
      } else {
        this.removeEventListener(eventName, handler);
      }
      return this
    }

    addEventListener (eventName, handler, options = {}) {
      let listener;
      if (arguments.length === 1 && arguments[0]) {
        listener = arguments[0];
      } else {
        listener = this._createEventListener(eventName, handler, options);
      }
      if (!this.eventListeners) {
        this.eventListeners = [];
      }
      listener._el = this;
      this.eventListeners.push(listener);
      this._addEventListenerNative(listener);
      return this
    }

    _createEventListener (eventName, handler, options) {
      return new DOMEventListener(eventName, handler, options)
    }

    _addEventListenerNative(listener) {} 

    removeEventListener (eventName, handler) {
      if (!this.eventListeners) return
      
      let listener = null;
      let idx = DOMEventListener.findIndex(this.eventListeners, eventName, handler);
      listener = this.eventListeners[idx];
      if (idx > -1) {
        this.eventListeners.splice(idx, 1);
        
        listener._el = null;
        this._removeEventListenerNative(listener);
      }
      return this
    }

    _removeEventListenerNative(listener) {} 

    removeAllEventListeners () {
      if (!this.eventListeners) return
      for (let i = 0; i < this.eventListeners.length; i++) {
        let listener = this.eventListeners[i];
        
        listener._el = null;
        this._removeEventListenerNative(listener);
      }
      delete this.eventListeners;
    }

    getEventListeners () {
      return this.eventListeners || []
    }

    
    getNodeType () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getContentType () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getChildCount () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    getChildNodes () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    getChildren () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getChildAt (pos) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getChildIndex (child) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getChildNodeIterator () {
      return new ArrayIterator(this.getChildNodes())
    }

    getLastChild () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getFirstChild () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getNextSibling () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    getPreviousSibling () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    clone(deep) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    createElement (str) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    createTextNode (text) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    createComment (data) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    createProcessingInstruction (name, data) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    createCDATASection (data) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    is (cssSelector) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    getParent () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    getOwnerDocument () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    getDoctype () {
      
      throw new Error('NOT_IMPLEMENTED')
    }

    
    setDoctype(qualifiedNameStr, publicId, systemId) { 
      throw new Error('NOT_IMPLEMENTED')
    }

    
    find (cssSelector) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    findAll (cssSelector) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    append (children) {
      if (arguments.length === 1) {
        if (isArray(children)) {
          children = children.slice();
        } else {
          let child = children;
          return this.appendChild(child)
        }
      } else {
        children = arguments;
      }
      if (children) {
        Array.prototype.forEach.call(children, this.appendChild.bind(this));
      }
      return this
    }

    appendChild (child) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    insertAt (pos, child) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    insertBefore (newChild, before) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    removeAt (pos) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    removeChild (child) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    replaceChild (oldChild, newChild) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    
    remove () {
      var parent = this.getParent();
      if (parent) {
        parent.removeChild(this);
      }
    }

    
    empty () {
      
      throw new Error(NOT_IMPLEMENTED)
    }

    serialize () {
      return this.getOuterHTML()
    }

    isInDocument () {
      let el = this;
      while (el) {
        if (el.isDocumentNode()) {
          return true
        }
        el = el.getParent();
      }
    }

    
    focus () {
      
      return this
    }

    
    select () {
      
      return this
    }

    
    blur () {
      
      return this
    }

    
    click () {
      
      return this
    }

    

    getWidth () {
      
      return 0
    }

    getHeight () {
      
      return 0
    }

    
    getOuterHeight (withMargin) { 
      
      return 0
    }

    
    getOffset () {
      
      return { top: 0, left: 0 }
    }

    
    getPosition () {
      
      return { top: 0, left: 0 }
    }

    
    getElementFactory () {
      return this.createElement.bind(this)
    }

    
    emit(name, data) { 
      
      throw new Error(NOT_IMPLEMENTED)
    }

    

    get id () {
      return this.getId()
    }

    set id (id) {
      this.setId(id);
    }

    get tagName () {
      return this.getTagName()
    }

    set tagName (tagName) {
      this.setTagName(tagName);
    }

    get nodeName () {
      return this.getTagName()
    }

    get nodeType () {
      return this.getNodeType()
    }

    get className () {
      return this.getAttribute('class')
    }

    set className (className) {
      this.setAttribute('class', className);
    }

    get textContent () {
      return this.getTextContent()
    }

    set textContent (text) {
      this.setTextContent(text);
    }

    get innerHTML () {
      return this.getInnerHTML()
    }

    set innerHTML (html) {
      this.setInnerHTML(html);
    }

    get outerHTML () {
      return this.getOuterHTML()
    }

    get firstChild () {
      return this.getFirstChild()
    }

    get lastChild () {
      return this.getLastChild()
    }

    get nextSibling () {
      return this.getNextSibling()
    }

    get previousSibling () {
      return this.getPreviousSibling()
    }

    get parentNode () {
      return this.getParent()
    }

    get height () {
      return this.getHeight()
    }

    get width () {
      return this.getWidth()
    }

    get value () {
      return this.getValue()
    }

    set value (value) {
      return this.setValue(value)
    }

    get _isDOMElement () { return true }

    
    static get pxStyles () { return PX_STYLES }

    static get EMPTY_HTML () { return EMPTY_HTML }
  }

  const PX_STYLES = {
    top: true,
    bottom: true,
    left: true,
    right: true,
    height: true,
    width: true
  };

  const EMPTY_HTML = '<html><head></head><body></body></html>';

  const SIGNATURE = uuid('_BrowserDOMElement');

  function _attach (nativeEl, browserDOMElement) {
    if (!browserDOMElement._isBrowserDOMElement) throw new Error('Invalid argument')
    if (nativeEl.hasOwnProperty(SIGNATURE)) throw new Error('Already attached')
    nativeEl[SIGNATURE] = browserDOMElement;
  }

  function _detach (nativeEl) {
    delete nativeEl[SIGNATURE];
  }

  function _unwrap (nativeEl) {
    return nativeEl[SIGNATURE]
  }

  class BrowserDOMElement extends DOMElement {
    constructor (el) {
      super();
      console.assert(el instanceof window.Node, 'Expecting native DOM node.');
      this.el = el;
      
      
      _attach(el, this);
    }

    getNativeElement () {
      return this.el
    }

    getNodeType () {
      switch (this.el.nodeType) {
        case window.Node.TEXT_NODE:
          return 'text'
        case window.Node.ELEMENT_NODE:
          return 'element'
        case window.Node.DOCUMENT_NODE:
          return 'document'
        case window.Node.COMMENT_NODE:
          return 'comment'
        case window.Node.PROCESSING_INSTRUCTION_NODE:
          return 'directive'
        case window.Node.CDATA_SECTION_NODE:
          return 'cdata'
        default:
          
      }
    }

    getDoctype () {
      if (this.isDocumentNode()) {
        return this.el.doctype
      } else {
        return this.getOwnerDocument().getDoctype()
      }
    }

    setDoctype (qualifiedNameStr, publicId, systemId) {
      let ownerDocument = this._getNativeOwnerDocument();
      let oldDocType = ownerDocument.doctype;
      let newDocType = ownerDocument.implementation.createDocumentType(
        qualifiedNameStr, publicId, systemId
      );
      if (oldDocType) {
        oldDocType.parentNode.replaceChild(newDocType, oldDocType);
      } else {
        ownerDocument.insertBefore(newDocType, ownerDocument.firstChild);
      }
    }

    isTextNode () {
      return (this.el.nodeType === window.Node.TEXT_NODE)
    }

    isElementNode () {
      return (this.el.nodeType === window.Node.ELEMENT_NODE)
    }

    isCommentNode () {
      return (this.el.nodeType === window.Node.COMMENT_NODE)
    }

    isDocumentNode () {
      return (this.el.nodeType === window.Node.DOCUMENT_NODE)
    }

    hasClass (className) {
      return this.el.classList.contains(className)
    }

    addClass (className) {
      this.el.classList.add(className);
      return this
    }

    removeClass (className) {
      this.el.classList.remove(className);
      return this
    }

    hasAttribute (name) {
      return this.el.hasAttribute(name)
    }

    getAttribute (name) {
      
      
      if (this.el.hasAttribute(name)) {
        return this.el.getAttribute(name)
      }
    }

    setAttribute (name, value) {
      this.el.setAttribute(name, String(value));
      return this
    }

    removeAttribute (name) {
      this.el.removeAttribute(name);
      return this
    }

    getAttributes () {
      if (!this.el.attributes._mapAdapter) {
        this.el.attributes._mapAdapter = new AttributesMapAdapter(this.el.attributes);
      }
      return this.el.attributes._mapAdapter
    }

    getProperty (name) {
      return this.el[name]
    }

    setProperty (name, value) {
      
      
      if (this._isXML()) throw new Error('setProperty() is only supported for HTML elements.')
      this.el[name] = value;
      return this
    }

    getTagName () {
      
      
      if (this._isXML()) {
        return this.el.tagName
      } else if (this.el.tagName) {
        return this.el.tagName.toLowerCase()
      }
    }

    setTagName (tagName) {
      let newEl = this.createElement(tagName);
      let attributes = this.el.attributes;
      let l = attributes.length;
      let i;
      for (i = 0; i < l; i++) {
        let attr = attributes.item(i);
        newEl.setAttribute(attr.name, attr.value);
      }
      if (this.eventListeners) {
        this.eventListeners.forEach(function (listener) {
          newEl.addEventListener(listener.eventName, listener.handler, listener.capture);
        });
      }
      newEl.append(this.getChildNodes());

      this._replaceNativeEl(newEl.getNativeElement());
      return this
    }

    getId () {
      return this.el.id
    }

    setId (id) {
      this.el.id = id;
      return this
    }

    getStyle (name) {
      let val = this.el.style[name];
      if (!val) {
        let computedStyle = this.getComputedStyle();
        val = computedStyle[name];
      }
      return val
    }

    getComputedStyle () {
      return window.getComputedStyle(this.el)
    }

    setStyle (name, value) {
      if (DOMElement.pxStyles[name] && isNumber(value)) value = value + 'px';
      this.el.style[name] = value;
      return this
    }

    getTextContent () {
      return this.el.textContent
    }

    setTextContent (text) {
      this.el.textContent = text;
      return this
    }

    getInnerHTML () {
      if (this._isXML()) {
        let xs = new window.XMLSerializer();
        let result = Array.prototype.map.call(this.el.childNodes, c => xs.serializeToString(c));
        return result.join('')
      } else {
        return this.el.innerHTML
      }
    }

    setInnerHTML (html) {
      
      
      this.el.innerHTML = html;
      return this
    }

    getOuterHTML () {
      
      
      if (this._isXML()) {
        let xs = new window.XMLSerializer();
        return xs.serializeToString(this.el)
      } else {
        return this.el.outerHTML
      }
    }

    _addEventListenerNative (listener) {
      this.el.addEventListener(listener.eventName, listener.handler, listener.capture);
    }

    _removeEventListenerNative (listener) {
      this.el.removeEventListener(listener.eventName, listener.handler);
    }

    getEventListeners () {
      return this.eventListeners || []
    }

    getChildCount () {
      return this.el.childNodes.length
    }

    getChildNodes () {
      let childNodes = [];
      for (let node = this.el.firstChild; node; node = node.nextSibling) {
        childNodes.push(BrowserDOMElement.wrap(node));
      }
      return childNodes
    }

    getChildNodeIterator () {
      return new BrowserChildNodeIterator(this.el)
    }

    get childNodes () {
      return this.getChildNodes()
    }

    getChildren () {
      
      
      let children = [];
      for (let node = this.el.firstChild; node; node = node.nextSibling) {
        if (node.nodeType === window.Node.ELEMENT_NODE) {
          children.push(BrowserDOMElement.wrap(node));
        }
      }
      return children
    }

    get children () {
      return this.getChildren()
    }

    getChildAt (pos) {
      return BrowserDOMElement.wrap(this.el.childNodes[pos])
    }

    getChildIndex (child) {
      
      if (!child._isBrowserDOMElement) {
        throw new Error('Expecting a BrowserDOMElement instance.')
      }
      return Array.prototype.indexOf.call(this.el.childNodes, child.el)
    }

    getFirstChild () {
      let firstChild = this.el.firstChild;
      
      if (firstChild) {
        return BrowserDOMElement.wrap(firstChild)
      } else {
        return null
      }
    }

    getLastChild () {
      var lastChild = this.el.lastChild;
      
      if (lastChild) {
        return BrowserDOMElement.wrap(lastChild)
      } else {
        return null
      }
    }

    getNextSibling () {
      let next = this.el.nextSibling;
      
      if (next) {
        return BrowserDOMElement.wrap(next)
      } else {
        return null
      }
    }

    getPreviousSibling () {
      let previous = this.el.previousSibling;
      
      if (previous) {
        return BrowserDOMElement.wrap(previous)
      } else {
        return null
      }
    }

    clone (deep) {
      let clone = this.el.cloneNode(deep);
      return BrowserDOMElement.wrap(clone)
    }

    createDocument (format, opts) {
      return BrowserDOMElement.createDocument(format, opts)
    }

    createElement (tagName) {
      let doc = this._getNativeOwnerDocument();
      let el = doc.createElement(tagName);
      return BrowserDOMElement.wrap(el)
    }

    createTextNode (text) {
      let doc = this._getNativeOwnerDocument();
      let el = doc.createTextNode(text);
      return BrowserDOMElement.wrap(el)
    }

    createComment (data) {
      let doc = this._getNativeOwnerDocument();
      let el = doc.createComment(data);
      return BrowserDOMElement.wrap(el)
    }

    createProcessingInstruction (name, data) {
      let doc = this._getNativeOwnerDocument();
      let el = doc.createProcessingInstruction(name, data);
      return BrowserDOMElement.wrap(el)
    }

    createCDATASection (data) {
      let doc = this._getNativeOwnerDocument();
      let el = doc.createCDATASection(data);
      return BrowserDOMElement.wrap(el)
    }

    is (cssSelector) {
      
      
      let el = this.el;
      
      if (this.isElementNode()) {
        return matches(el, cssSelector)
      } else {
        return false
      }
    }

    getParent () {
      let parent = this.el.parentNode;
      
      if (parent) {
        return BrowserDOMElement.wrap(parent)
      } else {
        return null
      }
    }

    getOwnerDocument () {
      return BrowserDOMElement.wrap(this._getNativeOwnerDocument())
    }

    get ownerDocument () {
      return this.getOwnerDocument()
    }

    _getNativeOwnerDocument () {
      return (this.isDocumentNode() ? this.el : this.el.ownerDocument)
    }

    find (cssSelector) {
      let result = null;
      if (this.el.querySelector) {
        result = this.el.querySelector(cssSelector);
      }
      if (result) {
        return BrowserDOMElement.wrap(result)
      } else {
        return null
      }
    }

    findAll (cssSelector) {
      let result = [];
      if (this.el.querySelectorAll) {
        result = this.el.querySelectorAll(cssSelector);
      }
      return Array.prototype.map.call(result, function (el) {
        return BrowserDOMElement.wrap(el)
      })
    }

    _normalizeChild (child) {
      if (isNil(child)) return child

      if (child instanceof window.Node) {
        child = BrowserDOMElement.wrap(child);
      
      
      
      } else if (child._isBrowserDOMElement && !(child instanceof BrowserDOMElement)) {
        child = BrowserDOMElement.wrap(child);
      } else if (isString(child) || isNumber(child)) {
        child = this.createTextNode(child);
      }
      
      if (!child || !child._isBrowserDOMElement) {
        throw new Error('Illegal child type.')
      }
      console.assert(_unwrap(child.el) === child, 'The backlink to the wrapper should be consistent');
      return child.getNativeElement()
    }

    appendChild (child) {
      let nativeChild = this._normalizeChild(child);
      if (nativeChild) {
        this.el.appendChild(nativeChild);
      }
      return this
    }

    insertAt (pos, child) {
      let nativeChild = this._normalizeChild(child);
      let childNodes = this.el.childNodes;
      if (pos >= childNodes.length) {
        this.el.appendChild(nativeChild);
      } else {
        this.el.insertBefore(nativeChild, childNodes[pos]);
      }
      return this
    }

    insertBefore (child, before) {
      
      if (isNil(before)) {
        return this.appendChild(child)
      }
      if (!before._isBrowserDOMElement) {
        throw new Error('insertBefore(): Illegal arguments. "before" must be a BrowserDOMElement instance.')
      }
      var nativeChild = this._normalizeChild(child);
      if (nativeChild) {
        this.el.insertBefore(nativeChild, before.el);
      }
      return this
    }

    removeAt (pos) {
      this.el.removeChild(this.el.childNodes[pos]);
      return this
    }

    removeChild (child) {
      
      if (!child || !child._isBrowserDOMElement) {
        throw new Error('removeChild(): Illegal arguments. Expecting a BrowserDOMElement instance.')
      }
      this.el.removeChild(child.el);
      return this
    }

    replaceChild (oldChild, newChild) {
      
      if (!newChild || !oldChild ||
          !newChild._isBrowserDOMElement || !oldChild._isBrowserDOMElement) {
        throw new Error('replaceChild(): Illegal arguments. Expecting BrowserDOMElement instances.')
      }
      
      this.el.replaceChild(newChild.el, oldChild.el);
      return this
    }

    empty () {
      let el = this.el;
      while (el.lastChild) {
        el.removeChild(el.lastChild);
      }
      return this
    }

    remove () {
      if (this.el.parentNode) {
        this.el.parentNode.removeChild(this.el);
      }
      return this
    }

    serialize () {
      let outerHTML = this.el.outerHTML;
      if (isString(outerHTML)) {
        return outerHTML
      } else {
        let xs = new window.XMLSerializer();
        return xs.serializeToString(this.el)
      }
    }

    isInDocument () {
      let el = this.el;
      while (el) {
        if (el.nodeType === window.Node.DOCUMENT_NODE) {
          return true
        }
        el = el.parentNode;
      }
    }

    _replaceNativeEl (newEl) {
      console.assert(newEl instanceof window.Node, 'Expecting a native element.');
      let oldEl = this.el;
      let parentNode = oldEl.parentNode;
      if (parentNode) {
        parentNode.replaceChild(newEl, oldEl);
      }
      this.el = newEl;
      _detach(oldEl);
      _detach(newEl);
      _attach(newEl, this);
    }

    _getChildNodeCount () {
      return this.el.childNodes.length
    }

    focus (opts) {
      this.el.focus(opts);
      return this
    }

    select () {
      this.el.select();
      return this
    }

    blur () {
      this.el.blur();
      return this
    }

    click () {
      
      
      
      
      this.el.click();
      return true
    }

    getWidth () {
      let rect = this.el.getClientRects()[0];
      if (rect) {
        return rect.width
      } else {
        return 0
      }
    }

    getHeight () {
      let rect = this.el.getClientRects()[0];
      if (rect) {
        return rect.height
      } else {
        return 0
      }
    }

    getOffset () {
      let rect = this.el.getBoundingClientRect();
      return {
        top: rect.top + document.body.scrollTop,
        left: rect.left + document.body.scrollLeft
      }
    }

    getPosition () {
      return {left: this.el.offsetLeft, top: this.el.offsetTop}
    }

    getOuterHeight (withMargin) {
      let outerHeight = this.el.offsetHeight;
      if (withMargin) {
        let style = this.getComputedStyle();
        outerHeight += parseInt(style.marginTop, 10) + parseInt(style.marginBottom, 10);
      }
      return outerHeight
    }

    getContentType () {
      return this._getNativeOwnerDocument().contentType
    }

    _isXML () {
      return this.getContentType() === 'application/xml'
    }

    emit (name, data) {
      let event;
      if (data) {
        event = new window.CustomEvent(name, {
          detail: data,
          bubbles: true,
          cancelable: true
        });
      } else {
        event = new window.Event(name, {
          bubbles: true,
          cancelable: true
        });
      }
      this.el.dispatchEvent(event);
    }
  }

  BrowserDOMElement.prototype._isBrowserDOMElement = true;


  BrowserDOMElement.createDocument = function (format, opts = {}) {
    let doc;
    if (format === 'xml') {
      let xmlInstruction = [];
      if (opts.version) {
        xmlInstruction.push(`version="${opts.version}"`);
      }
      if (opts.encoding) {
        xmlInstruction.push(`encoding="${opts.encoding}"`);
      }
      let xmlStr;
      if (xmlInstruction.length > 0) {
        xmlStr = `<?xml ${xmlInstruction.join(' ')}?><dummy/>`;
      } else {
        xmlStr = `<dummy/>`;
      }
      
      doc = (new window.DOMParser()).parseFromString(xmlStr, 'application/xml');
      
      doc.removeChild(doc.firstChild);
    } else {
      doc = (new window.DOMParser()).parseFromString(DOMElement.EMPTY_HTML, 'text/html');
    }
    return BrowserDOMElement.wrap(doc)
  };

  BrowserDOMElement.parseMarkup = function (str, format, options = {}) {
    if (!str) {
      return BrowserDOMElement.createDocument(format)
    }
    if (options.snippet) {
      str = `<div id='__snippet__'>${str}</div>`;
    }
    let doc;
    let parser = new window.DOMParser();
    if (format === 'html') {
      doc = BrowserDOMElement.wrap(
        _check(
          parser.parseFromString(str, 'text/html')
        )
      );
    } else if (format === 'xml') {
      doc = BrowserDOMElement.wrap(
        _check(
          parser.parseFromString(str, 'application/xml')
        )
      );
    }
    if (options.snippet) {
      let childNodes = doc.find('#__snippet__').childNodes;
      if (childNodes.length === 1) {
        return childNodes[0]
      } else {
        return childNodes
      }
    } else {
      return doc
    }

    function _check (doc) {
      if (doc) {
        let parserError = doc.querySelector('parsererror');
        if (parserError) {
          
          
          throw new Error('ParserError: ' + BrowserDOMElement.wrap(parserError).outerHTML)
        }
      }
      return doc
    }
  };

  BrowserDOMElement.wrap =
  BrowserDOMElement.wrapNativeElement = function (el) {
    if (el) {
      let _el = _unwrap(el);
      if (_el) {
        return _el
      } else if (el instanceof window.Node) {
        return new BrowserDOMElement(el)
      } else if (el._isBrowserDOMElement) {
        return el
      } else if (el === window) {
        return BrowserDOMElement.getBrowserWindow()
      }
    } else {
      return null
    }
  };

  BrowserDOMElement.unwrap = function (nativeEl) {
    return _unwrap(nativeEl)
  };


  class BrowserWindow {
    constructor () {
      
      this.el = window;
      _attach(window, this);
    }

    get _isBrowserDOMElement () { return true }
  }

  BrowserWindow.prototype.getNativeElement = BrowserDOMElement.prototype.getNativeElement;
  BrowserWindow.prototype.on = BrowserDOMElement.prototype.on;
  BrowserWindow.prototype.off = BrowserDOMElement.prototype.off;
  BrowserWindow.prototype.addEventListener = BrowserDOMElement.prototype.addEventListener;
  BrowserWindow.prototype.removeEventListener = BrowserDOMElement.prototype.removeEventListener;
  BrowserWindow.prototype._createEventListener = BrowserDOMElement.prototype._createEventListener;
  BrowserWindow.prototype._addEventListenerNative = BrowserDOMElement.prototype._addEventListenerNative;
  BrowserWindow.prototype._removeEventListenerNative = BrowserDOMElement.prototype._removeEventListenerNative;

  BrowserWindow.prototype.getEventListeners = BrowserDOMElement.prototype.getEventListeners;

  BrowserDOMElement.getBrowserWindow = function () {
    if (window[SIGNATURE]) return window[SIGNATURE]
    return new BrowserWindow(window)
  };

  BrowserDOMElement.isReverse = function (anchorNode, anchorOffset, focusNode, focusOffset) {
    
    
    if (focusNode && anchorNode) {
      if (!BrowserDOMElement.isReverse._r1) {
        BrowserDOMElement.isReverse._r1 = window.document.createRange();
        BrowserDOMElement.isReverse._r2 = window.document.createRange();
      }
      const _r1 = BrowserDOMElement.isReverse._r1;
      const _r2 = BrowserDOMElement.isReverse._r2;
      _r1.setStart(anchorNode.getNativeElement(), anchorOffset);
      _r2.setStart(focusNode.getNativeElement(), focusOffset);
      let cmp = _r1.compareBoundaryPoints(window.Range.START_TO_START, _r2);
      if (cmp === 1) {
        return true
      }
    }
    return false
  };

  BrowserDOMElement.getWindowSelection = function () {
    let nativeSel = window.getSelection();
    let result = {
      anchorNode: BrowserDOMElement.wrap(nativeSel.anchorNode),
      anchorOffset: nativeSel.anchorOffset,
      focusNode: BrowserDOMElement.wrap(nativeSel.focusNode),
      focusOffset: nativeSel.focusOffset
    };
    return result
  };

  function matches (el, selector) {
    let elProto = window.Element.prototype;
    let _matches = (
      elProto.matches || elProto.matchesSelector ||
      elProto.msMatchesSelector || elProto.webkitMatchesSelector
    );
    return _matches.call(el, selector)
  }

  class AttributesMapAdapter {
    constructor (attributes) {
      this.attributes = attributes;
    }

    get size () {
      return this.attributes.length
    }

    get (name) {
      let item = this.attributes.getNamedItem(name);
      if (item) {
        return item.value
      }
    }

    set (name, value) {
      this.attributes.setNamedItem(name, value);
    }

    forEach (fn) {
      const S = this.size;
      for (let i = 0; i < S; i++) {
        const item = this.attributes.item(i);
        fn(item.value, item.name);
      }
    }

    map (fn) {
      let result = [];
      this.forEach((val, key) => { result.push(fn(val, key)); });
      return result
    }

    keys () {
      return this.map((val, key) => { return key })
    }

    values () {
      return this.map((val) => { return val })
    }

    entries () {
      return this.map((val, key) => { return [key, val] })
    }
  }

  class BrowserChildNodeIterator {
    constructor (el) {
      this._next = el.firstChild;
      this._curr = null;
    }

    hasNext () {
      return Boolean(this._next)
    }

    next () {
      let next = this._next;
      this._curr = next;
      this._next = next.nextSibling;
      return BrowserDOMElement.wrap(next)
    }

    back () {
      this._next = this._curr;
      this._curr = this._curr.previousSibling;
    }

    peek () {
      return BrowserDOMElement.wrap(this._curr)
    }
  }

  function last (arr) {
    return arr[arr.length - 1]
  }

  var inBrowser = platform.inBrowser

  var domelementtype = {
  	Text: "text", 
  	Directive: "directive", 
  	Comment: "comment", 
  	Script: "script", 
  	Style: "style", 
  	Tag: "tag", 
  	CDATA: "cdata", 
  	Doctype: "doctype",

  	isTag: function(elem){
  		return elem.type === "tag" || elem.type === "script" || elem.type === "style";
  	}
  };

  var boolbase = {
  	trueFunc: function trueFunc(){
  		return true;
  	},
  	falseFunc: function falseFunc(){
  		return false;
  	}
  };

  var parse_1 = parse;




  var re_nthElement = /^([+\-]?\d*n)?\s*(?:([+\-]?)\s*(\d+))?$/;


  function parse(formula){
  	formula = formula.trim().toLowerCase();

  	if(formula === "even"){
  		return [2, 0];
  	} else if(formula === "odd"){
  		return [2, 1];
  	} else {
  		var parsed = formula.match(re_nthElement);

  		if(!parsed){
  			throw new SyntaxError("n-th rule couldn't be parsed ('" + formula + "')");
  		}

  		var a;

  		if(parsed[1]){
  			a = parseInt(parsed[1], 10);
  			if(isNaN(a)){
  				if(parsed[1].charAt(0) === "-") a = -1;
  				else a = 1;
  			}
  		} else a = 0;

  		return [
  			a,
  			parsed[3] ? parseInt((parsed[2] || "") + parsed[3], 10) : 0
  		];
  	}
  }

  var compile_1 = compile;

  var trueFunc  = boolbase.trueFunc,
      falseFunc = boolbase.falseFunc;


  function compile(parsed){
  	var a = parsed[0],
  	    b = parsed[1] - 1;

  	
  	
  	if(b < 0 && a <= 0) return falseFunc;

  	
  	if(a ===-1) return function(pos){ return pos <= b; };
  	if(a === 0) return function(pos){ return pos === b; };
  	
  	if(a === 1) return b < 0 ? trueFunc : function(pos){ return pos >= b; };

  	
  	var bMod = b % a;
  	if(bMod < 0) bMod += a;

  	if(a > 1){
  		return function(pos){
  			return pos >= b && pos % a === bMod;
  		};
  	}

  	a *= -1; 

  	return function(pos){
  		return pos <= b && pos % a === bMod;
  	};
  }

  var nthCheck = function nthCheck(formula){
  	return compile_1(parse_1(formula));
  };

  var parse_1$1 = parse_1;
  var compile_1$1 = compile_1;
  nthCheck.parse = parse_1$1;
  nthCheck.compile = compile_1$1;

  var cssWhat = parse$1;

  var re_name = /^(?:\\.|[\w\-\u00c0-\uFFFF])+/,
      re_escape = /\\([\da-f]{1,6}\s?|(\s)|.)/ig,
      
      re_attr = /^\s*((?:\\.|[\w\u00c0-\uFFFF\-])+)\s*(?:(\S?)=\s*(?:(['"])(.*?)\3|(#?(?:\\.|[\w\u00c0-\uFFFF\-])*)|)|)\s*(i)?\]/;

  var actionTypes = {
  	__proto__: null,
  	"undefined": "exists",
  	"":  "equals",
  	"~": "element",
  	"^": "start",
  	"$": "end",
  	"*": "any",
  	"!": "not",
  	"|": "hyphen"
  };

  var simpleSelectors = {
  	__proto__: null,
  	">": "child",
  	"<": "parent",
  	"~": "sibling",
  	"+": "adjacent"
  };

  var attribSelectors = {
  	__proto__: null,
  	"#": ["id", "equals"],
  	".": ["class", "element"]
  };


  var unpackPseudos = {
  	__proto__: null,
  	"has": true,
  	"not": true,
  	"matches": true
  };

  var stripQuotesFromPseudos = {
  	__proto__: null,
  	"contains": true,
  	"icontains": true
  };

  var quotes = {
  	__proto__: null,
  	"\"": true,
  	"'": true
  };


  function funescape( _, escaped, escapedWhitespace ) {
  	var high = "0x" + escaped - 0x10000;
  	
  	
  	
  	return high !== high || escapedWhitespace ?
  		escaped :
  		
  		high < 0 ?
  			String.fromCharCode( high + 0x10000 ) :
  			
  			String.fromCharCode( high >> 10 | 0xD800, high & 0x3FF | 0xDC00 );
  }

  function unescapeCSS(str){
  	return str.replace(re_escape, funescape);
  }

  function isWhitespace(c){
  	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
  }

  function parse$1(selector, options){
  	var subselects = [];

  	selector = parseSelector(subselects, selector + "", options);

  	if(selector !== ""){
  		throw new SyntaxError("Unmatched selector: " + selector);
  	}

  	return subselects;
  }

  function parseSelector(subselects, selector, options){
  	var tokens = [],
  		sawWS = false,
  		data, firstChar, name, quot;

  	function getName(){
  		var sub = selector.match(re_name)[0];
  		selector = selector.substr(sub.length);
  		return unescapeCSS(sub);
  	}

  	function stripWhitespace(start){
  		while(isWhitespace(selector.charAt(start))) start++;
  		selector = selector.substr(start);
  	}

  	stripWhitespace(0);

  	while(selector !== ""){
  		firstChar = selector.charAt(0);

  		if(isWhitespace(firstChar)){
  			sawWS = true;
  			stripWhitespace(1);
  		} else if(firstChar in simpleSelectors){
  			tokens.push({type: simpleSelectors[firstChar]});
  			sawWS = false;

  			stripWhitespace(1);
  		} else if(firstChar === ","){
  			if(tokens.length === 0){
  				throw new SyntaxError("empty sub-selector");
  			}
  			subselects.push(tokens);
  			tokens = [];
  			sawWS = false;
  			stripWhitespace(1);
  		} else {
  			if(sawWS){
  				if(tokens.length > 0){
  					tokens.push({type: "descendant"});
  				}
  				sawWS = false;
  			}

  			if(firstChar === "*"){
  				selector = selector.substr(1);
  				tokens.push({type: "universal"});
  			} else if(firstChar in attribSelectors){
  				selector = selector.substr(1);
  				tokens.push({
  					type: "attribute",
  					name: attribSelectors[firstChar][0],
  					action: attribSelectors[firstChar][1],
  					value: getName(),
  					ignoreCase: false
  				});
  			} else if(firstChar === "["){
  				selector = selector.substr(1);
  				data = selector.match(re_attr);
  				if(!data){
  					throw new SyntaxError("Malformed attribute selector: " + selector);
  				}
  				selector = selector.substr(data[0].length);
  				name = unescapeCSS(data[1]);

  				if(
  					!options || (
  						"lowerCaseAttributeNames" in options ?
  							options.lowerCaseAttributeNames :
  							!options.xmlMode
  					)
  				){
  					name = name.toLowerCase();
  				}

  				tokens.push({
  					type: "attribute",
  					name: name,
  					action: actionTypes[data[2]],
  					value: unescapeCSS(data[4] || data[5] || ""),
  					ignoreCase: !!data[6]
  				});

  			} else if(firstChar === ":"){
  				if(selector.charAt(1) === ":"){
  					selector = selector.substr(2);
  					tokens.push({type: "pseudo-element", name: getName().toLowerCase()});
  					continue;
  				}

  				selector = selector.substr(1);

  				name = getName().toLowerCase();
  				data = null;

  				if(selector.charAt(0) === "("){
  					if(name in unpackPseudos){
  						quot = selector.charAt(1);
  						var quoted = quot in quotes;

  						selector = selector.substr(quoted + 1);

  						data = [];
  						selector = parseSelector(data, selector, options);

  						if(quoted){
  							if(selector.charAt(0) !== quot){
  								throw new SyntaxError("unmatched quotes in :" + name);
  							} else {
  								selector = selector.substr(1);
  							}
  						}

  						if(selector.charAt(0) !== ")"){
  							throw new SyntaxError("missing closing parenthesis in :" + name + " " + selector);
  						}

  						selector = selector.substr(1);
  					} else {
  						var pos = 1, counter = 1;

  						for(; counter > 0 && pos < selector.length; pos++){
  							if(selector.charAt(pos) === "(") counter++;
  							else if(selector.charAt(pos) === ")") counter--;
  						}

  						if(counter){
  							throw new SyntaxError("parenthesis not matched");
  						}

  						data = selector.substr(1, pos - 2);
  						selector = selector.substr(pos);

  						if(name in stripQuotesFromPseudos){
  							quot = data.charAt(0);

  							if(quot === data.slice(-1) && quot in quotes){
  								data = data.slice(1, -1);
  							}

  							data = unescapeCSS(data);
  						}
  					}
  				}

  				tokens.push({type: "pseudo", name: name, data: data});
  			} else if(re_name.test(selector)){
  				name = getName();

  				if(!options || ("lowerCaseTags" in options ? options.lowerCaseTags : !options.xmlMode)){
  					name = name.toLowerCase();
  				}

  				tokens.push({type: "tag", name: name});
  			} else {
  				if(tokens.length && tokens[tokens.length - 1].type === "descendant"){
  					tokens.pop();
  				}
  				addToken(subselects, tokens);
  				return selector;
  			}
  		}
  	}

  	addToken(subselects, tokens);

  	return selector;
  }

  function addToken(subselects, tokens){
  	if(subselects.length > 0 && tokens.length === 0){
  		throw new SyntaxError("empty sub-selector");
  	}

  	subselects.push(tokens);
  }

  const _encodeXMLContent = ((obj) => {
    let invObj = getInverseObj(obj);
    let replacer = getInverseReplacer(invObj);
    return getInverse(invObj, replacer)
  })({
    amp: '&',
    gt: '>',
    lt: '<'
  });

  const _encodeXMLAttr = ((obj) => {
    let invObj = getInverseObj(obj);
    let replacer = getInverseReplacer(invObj);
    return getInverse(invObj, replacer)
  })({
    quot: '"'
  });

  function getInverseObj (obj) {
    return Object.keys(obj).sort().reduce(function (inverse, name) {
      inverse[obj[name]] = '&' + name + ';';
      return inverse
    }, {})
  }

  function getInverseReplacer (inverse) {
    let single = [];
    let multiple = [];

    Object.keys(inverse).forEach(function (k) {
      if (k.length === 1) {
        single.push('\\' + k);
      } else {
        multiple.push(k);
      }
    });

    multiple.unshift('[' + single.join('') + ']');

    return new RegExp(multiple.join('|'), 'g')
  }

  const RE_NON_ASCII = /[^\0-\x7F]/g;
  const RE_ASTRAL_SYMBOLS = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  function singleCharReplacer (c) {
    return '&#x' + c.charCodeAt(0).toString(16).toUpperCase() + ';'
  }

  function astralReplacer (c) {
    var high = c.charCodeAt(0);
    var low = c.charCodeAt(1);
    var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
    return '&#x' + codePoint.toString(16).toUpperCase() + ';'
  }

  function getInverse (inverse, re) {
    function func (name) {
      return inverse[name]
    }
    return function (data) {
      return data
        .replace(re, func)
        .replace(RE_ASTRAL_SYMBOLS, astralReplacer)
        .replace(RE_NON_ASCII, singleCharReplacer)
    }
  }

  const booleanAttributes = {
    __proto__: null,
    allowfullscreen: true,
    async: true,
    autofocus: true,
    autoplay: true,
    checked: true,
    controls: true,
    default: true,
    defer: true,
    disabled: true,
    hidden: true,
    ismap: true,
    loop: true,
    multiple: true,
    muted: true,
    open: true,
    readonly: true,
    required: true,
    reversed: true,
    scoped: true,
    seamless: true,
    selected: true,
    typemustmatch: true
  };

  const unencodedElements = {
    __proto__: null,
    style: true,
    script: true,
    xmp: true,
    iframe: true,
    noembed: true,
    noframes: true,
    plaintext: true,
    noscript: true
  };

  const singleTag = {
    __proto__: null,
    area: true,
    base: true,
    basefont: true,
    br: true,
    col: true,
    command: true,
    embed: true,
    frame: true,
    hr: true,
    img: true,
    input: true,
    isindex: true,
    keygen: true,
    link: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
  };

  class DomUtils {
    isTag (elem) {
      return domelementtype.isTag(elem)
    }

    removeElement (elem) {
      if (elem.prev) elem.prev.next = elem.next;
      if (elem.next) elem.next.prev = elem.prev;
      if (elem.parent) {
        var childs = elem.parent.childNodes;
        let pos = childs.lastIndexOf(elem);
        if (pos < 0) throw new Error('Invalid state')
        childs.splice(pos, 1);
        elem.parent = null;
      }
    }

    replaceElement (elem, replacement) {
      if (replacement.parent) this.removeElement(replacement);
      var prev = replacement.prev = elem.prev;
      if (prev) {
        prev.next = replacement;
      }

      var next = replacement.next = elem.next;
      if (next) {
        next.prev = replacement;
      }

      var parent = replacement.parent = elem.parent;
      if (parent) {
        var childs = parent.childNodes;
        let pos = childs.lastIndexOf(elem);
        if (pos < 0) throw new Error('Invalid state')
        childs[pos] = replacement;
      }
    }

    appendChild (elem, child) {
      if (child.parent) this.removeElement(child);
      child.parent = elem;

      if (elem.childNodes.push(child) !== 1) {
        var sibling = elem.childNodes[elem.childNodes.length - 2];
        sibling.next = child;
        child.prev = sibling;
        child.next = null;
      }
    }

    append (elem, next) {
      if (next.parent) this.removeElement(next);
      let parent = elem.parent;
      let currNext = elem.next;

      next.next = currNext;
      next.prev = elem;
      elem.next = next;
      next.parent = parent;

      if (currNext) {
        currNext.prev = next;
        if (parent) {
          var childs = parent.childNodes;
          let pos = childs.lastIndexOf(currNext);
          if (pos < 0) throw new Error('Invalid state')
          childs.splice(pos, 0, next);
        }
      } else if (parent) {
        parent.childNodes.push(next);
      }
    }

    prepend (elem, prev) {
      if (prev.parent) this.removeElement(prev);
      var parent = elem.parent;
      if (parent) {
        var childs = parent.childNodes;
        let pos = childs.lastIndexOf(elem);
        if (pos < 0) throw new Error('Invalid state')
        childs.splice(pos, 0, prev);
      }

      if (elem.prev) {
        elem.prev.next = prev;
      }

      prev.parent = parent;
      prev.prev = elem.prev;
      prev.next = elem;
      elem.prev = prev;
    }

    filter (test, element, recurse, limit) {
      if (!Array.isArray(element)) element = [element];

      if (typeof limit !== 'number' || !isFinite(limit)) {
        limit = Infinity;
      }
      return this.find(test, element, recurse !== false, limit)
    }

    find (test, elems, recurse, limit) {
      let result = [];
      let childs;

      for (var i = 0, j = elems.length; i < j; i++) {
        if (test(elems[i])) {
          result.push(elems[i]);
          if (--limit <= 0) break
        }

        childs = this.getChildren(elems[i]);
        if (recurse && childs && childs.length > 0) {
          childs = this.find(test, childs, recurse, limit);
          result = result.concat(childs);
          limit -= childs.length;
          if (limit <= 0) break
        }
      }

      return result
    }

    findOneChild (test, elems) {
      for (var i = 0, l = elems.length; i < l; i++) {
        if (test(elems[i])) return elems[i]
      }

      return null
    }

    findOne (test, elems) {
      var elem = null;

      for (var i = 0, l = elems.length; i < l && !elem; i++) {
        const child = elems[i];
        if (!this.isTag(child)) {
          continue
        } else if (test(child)) {
          elem = child;
        } else {
          const childNodes = this.getChildren(child);
          if (childNodes.length > 0) {
            elem = this.findOne(test, childNodes);
          }
        }
      }

      return elem
    }

    existsOne (test, elems) {
      for (var i = 0, l = elems.length; i < l; i++) {
        const elem = elems[i];
        
        if (!this.isTag(elem)) continue
        
        if (test(elem)) return true
        
        const childNodes = this.getChildren(elem);
        if (childNodes.length > 0 && this.existsOne(test, childNodes)) return true
      }
      return false
    }

    findAll (test, elems) {
      var result = [];
      for (var i = 0, j = elems.length; i < j; i++) {
        const elem = elems[i];
        if (!this.isTag(elem)) continue
        if (test(elem)) result.push(elem);
        const childNodes = this.getChildren(elem);
        if (childNodes.length > 0) {
          result = result.concat(this.findAll(test, childNodes));
        }
      }
      return result
    }

    getAttributes (el) {
      let attribs = el.getAttributes();
      
      
      if (attribs instanceof Map) {
        return Array.from(attribs)
      } else if (attribs && attribs.forEach) {
        let res = [];
        attribs.forEach((val, key) => {
          res.push([key, val]);
        });
        return res
      } else {
        return []
      }
    }

    formatAttribs (el, opts = {}) {
      let output = [];
      const attributes = this.getAttributes(el);
      attributes.forEach(([key, value]) => {
        if (opts.disallowHandlers && /^\s*on/.exec(key)) return
        if (opts.disallowHandlers && /^javascript[:]/.exec(value)) return
        if (opts.disallowedAttributes && opts.disallowedAttributes.has(key)) return
        if (!value && booleanAttributes[key]) {
          output.push(key);
        } else {
          output.push(key + '="' + (opts.decodeEntities ? _encodeXMLAttr(value) : value) + '"');
        }
      });
      return output.join(' ')
    }

    render (dom, opts) {
      if (!Array.isArray(dom)) dom = [dom];
      opts = opts || {};
      let output = [];
      for (var i = 0; i < dom.length; i++) {
        let elem = dom[i];
        switch (elem.type) {
          case 'root':
          case 'document': {
            if (elem._xmlInstruction) {
              output.push(this.render(elem._xmlInstruction, opts));
            }
            output.push(this.render(this.getChildren(elem), opts));
            break
          }
          case domelementtype.Tag:
          case domelementtype.Script:
          case domelementtype.Style: {
            output.push(this.renderTag(elem, opts));
            break
          }
          case domelementtype.CDATA: {
            if (!opts.stripCDATA) {
              output.push(this.renderCdata(elem));
            }
            break
          }
          case domelementtype.Comment: {
            if (!opts.stripComments) {
              output.push(this.renderComment(elem));
            }
            break
          }
          case domelementtype.Directive: {
            output.push(this.renderDirective(elem));
            break
          }
          case domelementtype.Doctype: {
            output.push(this.renderDoctype(elem));
            break
          }
          case domelementtype.Text: {
            output.push(this.renderText(elem, opts));
            break
          }
          default:
            throw new Error('Not implement yet: render of element type ' + elem.type)
        }
      }
      return output.join('')
    }

    renderTag (elem, opts) {
      const name = this.getName(elem);
      if (opts.allowedTags) {
        if (!opts.allowedTags.has(this.getNameWithoutNS(elem))) return
      }
      if (opts.disallowedTags) {
        if (opts.disallowedTags.has(this.getNameWithoutNS(elem))) return
      }
      if (name === 'svg') opts = Object.assign({}, opts, {decodeEntities: opts.decodeEntities, xmlMode: true});
      let tag = '<' + name;
      let attribs = this.formatAttribs(elem, opts);
      if (attribs) {
        tag += ' ' + attribs;
      }
      const childNodes = this.getChildren(elem);
      if (opts.xmlMode && childNodes.length === 0) {
        tag += '/>';
      } else {
        tag += '>';
        if (childNodes.length > 0) {
          tag += this.render(childNodes, opts);
        }
        if (!singleTag[name] || opts.xmlMode) {
          tag += '</' + name + '>';
        }
      }
      return tag
    }

    renderDirective (elem) {
      return '<?' + this.getName(elem) + ' ' + this.getData(elem) + '?>'
    }

    renderDoctype (elem) {
      const { name, publicId, systemId } = this.getData(elem);
      let frags = ['DOCTYPE', name];
      if (publicId) {
        frags.push('PUBLIC');
        frags.push('"' + publicId + '"');
        if (systemId) frags.push('"' + systemId + '"');
      }
      return '<!' + frags.join(' ') + '>'
    }

    renderText (elem, opts) {
      let text = this.getText(elem);
      if (opts.decodeEntities) {
        const parent = this.getParent(elem);
        if (!(parent && this.getName(parent) in unencodedElements)) {
          text = _encodeXMLContent(text);
        }
      }
      return text
    }

    renderCdata (elem) {
      return '<![CDATA[' + this.getData(elem) + ']]>'
    }

    renderComment (elem) {
      return '<!--' + this.getData(elem) + '-->'
    }

    getInnerHTML (elem, opts) {
      const childNodes = this.getChildren(elem);
      return childNodes.map((child) => {
        return this.render(child, opts)
      }).join('')
    }

    getOuterHTML (elem, opts) {
      return this.render(elem, opts)
    }

    getData (elem) {
      return elem.data
    }

    getText (elem, sub) {
      if (Array.isArray(elem)) return elem.map(e => this.getText(e, sub)).join('')
      switch (elem.type) {
        case domelementtype.Tag:
        case domelementtype.Script:
        case domelementtype.Style:
          return this.getText(this.getChildren(elem), true)
        case domelementtype.Text:
        case domelementtype.CDATA:
          return elem.data
        case domelementtype.Comment:
          
          
          if (sub) {
            return ''
          }
          return elem.data
        default:
          return ''
      }
    }

    getChildren (elem) {
      return elem.childNodes
    }

    getParent (elem) {
      return elem.parent
    }

    getSiblings (elem) {
      var parent = this.getParent(elem);
      return parent ? this.getChildren(parent) : [elem]
    }

    getAttributeValue (elem, name) {
      return elem.getAttribute(name)
    }

    hasAttrib (elem, name) {
      return elem.hasAttribute(name)
    }

    getName (elem) {
      return elem.name
    }

    getNameWithoutNS (elem) {
      return elem.nameWithoutNS
    }
  }

  const domUtils = new DomUtils();
  domUtils.DomUtils = DomUtils;

  var universal = 50;
  var tag = 30;
  var attribute = 1;
  var pseudo = 0;
  var descendant = -1;
  var child = -1;
  var parent = -1;
  var sibling = -1;
  var adjacent = -1;
  var procedure = {
  	universal: universal,
  	tag: tag,
  	attribute: attribute,
  	pseudo: pseudo,
  	descendant: descendant,
  	child: child,
  	parent: parent,
  	sibling: sibling,
  	adjacent: adjacent
  };

  var procedure$1 = Object.freeze({
    universal: universal,
    tag: tag,
    attribute: attribute,
    pseudo: pseudo,
    descendant: descendant,
    child: child,
    parent: parent,
    sibling: sibling,
    adjacent: adjacent,
    default: procedure
  });

  var procedure$2 = ( procedure$1 && procedure ) || procedure$1;

  var sort = sortByProcedure;





  var attributes = {
  	__proto__: null,
  	exists: 10,
  	equals: 8,
  	not: 7,
  	start: 6,
  	end: 6,
  	any: 5,
  	hyphen: 4,
  	element: 4
  };

  function sortByProcedure(arr){
  	var procs = arr.map(getProcedure);
  	for(var i = 1; i < arr.length; i++){
  		var procNew = procs[i];

  		if(procNew < 0) continue;

  		for(var j = i - 1; j >= 0 && procNew < procs[j]; j--){
  			var token = arr[j + 1];
  			arr[j + 1] = arr[j];
  			arr[j] = token;
  			procs[j + 1] = procs[j];
  			procs[j] = procNew;
  		}
  	}
  }

  function getProcedure(token){
  	var proc = procedure$2[token.type];

  	if(proc === procedure$2.attribute){
  		proc = attributes[token.action];

  		if(proc === attributes.equals && token.name === "id"){
  			
  			proc = 9;
  		}

  		if(token.ignoreCase){
  			
  			
  			proc >>= 1;
  		}
  	} else if(proc === procedure$2.pseudo){
  		if(!token.data){
  			proc = 3;
  		} else if(token.name === "has" || token.name === "contains"){
  			proc = 0; 
  		} else if(token.name === "matches" || token.name === "not"){
  			proc = 0;
  			for(var i = 0; i < token.data.length; i++){
  				
  				if(token.data[i].length !== 1) continue;
  				var cur = getProcedure(token.data[i][0]);
  				
  				if(cur === 0){
  					proc = 0;
  					break;
  				}
  				if(cur > proc) proc = cur;
  			}
  			if(token.data.length > 1 && proc > 0) proc -= 1;
  		} else {
  			proc = 1;
  		}
  	}
  	return proc;
  }

  var falseFunc$1 = boolbase.falseFunc;


  var reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;

  function factory(adapter){
  	
  	var attributeRules = {
  		__proto__: null,
  		equals: function(next, data){
  			var name  = data.name,
  				value = data.value;

  			if(data.ignoreCase){
  				value = value.toLowerCase();

  				return function equalsIC(elem){
  					var attr = adapter.getAttributeValue(elem, name);
  					return attr != null && attr.toLowerCase() === value && next(elem);
  				};
  			}

  			return function equals(elem){
  				return adapter.getAttributeValue(elem, name) === value && next(elem);
  			};
  		},
  		hyphen: function(next, data){
  			var name  = data.name,
  				value = data.value,
  				len = value.length;

  			if(data.ignoreCase){
  				value = value.toLowerCase();

  				return function hyphenIC(elem){
  					var attr = adapter.getAttributeValue(elem, name);
  					return attr != null &&
  							(attr.length === len || attr.charAt(len) === "-") &&
  							attr.substr(0, len).toLowerCase() === value &&
  							next(elem);
  				};
  			}

  			return function hyphen(elem){
  				var attr = adapter.getAttributeValue(elem, name);
  				return attr != null &&
  						attr.substr(0, len) === value &&
  						(attr.length === len || attr.charAt(len) === "-") &&
  						next(elem);
  			};
  		},
  		element: function(next, data){
  			var name = data.name,
  				value = data.value;
  			if (data.name === 'class') {
  				let value = data.value;
  				if (/\s/.test(value)) return function() { return false }
  				return function clazz(elem) {
  					let classes = elem.classes;
  					return classes && classes.has(value) && next(elem)
  				}
  			} else {
  				if(/\s/.test(value)){
  					return falseFunc$1;
  				}

  				value = value.replace(reChars, "\\$&");

  				var pattern = "(?:^|\\s)" + value + "(?:$|\\s)",
  					flags = data.ignoreCase ? "i" : "",
  					regex = new RegExp(pattern, flags);

  				return function element(elem){
  					var attr = adapter.getAttributeValue(elem, name);
  					return attr != null && regex.test(attr) && next(elem);
  				};
  			}
  		},
  		exists: function(next, data){
  			var name = data.name;
  			return function exists(elem){
  				return adapter.hasAttrib(elem, name) && next(elem);
  			};
  		},
  		start: function(next, data){
  			var name  = data.name,
  				value = data.value,
  				len = value.length;

  			if(len === 0){
  				return falseFunc$1;
  			}

  			if(data.ignoreCase){
  				value = value.toLowerCase();

  				return function startIC(elem){
  					var attr = adapter.getAttributeValue(elem, name);
  					return attr != null && attr.substr(0, len).toLowerCase() === value && next(elem);
  				};
  			}

  			return function start(elem){
  				var attr = adapter.getAttributeValue(elem, name);
  				return attr != null && attr.substr(0, len) === value && next(elem);
  			};
  		},
  		end: function(next, data){
  			var name  = data.name,
  				value = data.value,
  				len   = -value.length;

  			if(len === 0){
  				return falseFunc$1;
  			}

  			if(data.ignoreCase){
  				value = value.toLowerCase();

  				return function endIC(elem){
  					var attr = adapter.getAttributeValue(elem, name);
  					return attr != null && attr.substr(len).toLowerCase() === value && next(elem);
  				};
  			}

  			return function end(elem){
  				var attr = adapter.getAttributeValue(elem, name);
  				return attr != null && attr.substr(len) === value && next(elem);
  			};
  		},
  		any: function(next, data){
  			var name  = data.name,
  				value = data.value;

  			if(value === ""){
  				return falseFunc$1;
  			}

  			if(data.ignoreCase){
  				var regex = new RegExp(value.replace(reChars, "\\$&"), "i");

  				return function anyIC(elem){
  					var attr = adapter.getAttributeValue(elem, name);
  					return attr != null && regex.test(attr) && next(elem);
  				};
  			}

  			return function any(elem){
  				var attr = adapter.getAttributeValue(elem, name);
  				return attr != null && attr.indexOf(value) >= 0 && next(elem);
  			};
  		},
  		not: function(next, data){
  			var name  = data.name,
  				value = data.value;

  			if(value === ""){
  				return function notEmpty(elem){
  					return !!adapter.getAttributeValue(elem, name) && next(elem);
  				};
  			} else if(data.ignoreCase){
  				value = value.toLowerCase();

  				return function notIC(elem){
  					var attr = adapter.getAttributeValue(elem, name);
  					return attr != null && attr.toLowerCase() !== value && next(elem);
  				};
  			}

  			return function not(elem){
  				return adapter.getAttributeValue(elem, name) !== value && next(elem);
  			};
  		}
  	};

  	return {
  		compile: function(next, data, options){
  			if(options && options.strict && (
  				data.ignoreCase || data.action === "not"
  			)) throw new Error("Unsupported attribute selector");
  			return attributeRules[data.action](next, data);
  		},
  		rules: attributeRules
  	};
  }

  var attributes$1 = factory;

  function generalFactory(adapter, Pseudos){
  	
  	return {
  		__proto__: null,

  		attribute: attributes$1(adapter).compile,
  		pseudo: Pseudos.compile,

  		
  		tag: function(next, data){
  			var name = data.name;
  			return function tag(elem){
  				return adapter.getNameWithoutNS(elem) === name && next(elem);
  			}
  		},

  		
  		descendant: function(next){
  			return function descendant(elem){

  				var found = false;

  				while(!found && (elem = adapter.getParent(elem))){
  					found = next(elem);
  				}

  				return found;
  			};
  		},
  		_flexibleDescendant: function(next){
  			
  			return function descendant(elem){

  				var found = next(elem);

  				while(!found && (elem = adapter.getParent(elem))){
  					found = next(elem);
  				}

  				return found;
  			};
  		},
  		parent: function(next, data, options){
  			if(options && options.strict) throw new Error("Parent selector isn't part of CSS3");

  			return function parent(elem){
  				return adapter.getChildren(elem).some(test);
  			};

  			function test(elem){
  				return adapter.isTag(elem) && next(elem);
  			}
  		},
  		child: function(next){
  			return function child(elem){
  				var parent = adapter.getParent(elem);
  				return !!parent && next(parent);
  			};
  		},
  		sibling: function(next){
  			return function sibling(elem){
  				var siblings = adapter.getSiblings(elem);

  				for(var i = 0; i < siblings.length; i++){
  					if(adapter.isTag(siblings[i])){
  						if(siblings[i] === elem) break;
  						if(next(siblings[i])) return true;
  					}
  				}

  				return false;
  			};
  		},
  		adjacent: function(next){
  			return function adjacent(elem){
  				var siblings = adapter.getSiblings(elem),
  					lastElement;

  				for(var i = 0; i < siblings.length; i++){
  					if(adapter.isTag(siblings[i])){
  						if(siblings[i] === elem) break;
  						lastElement = siblings[i];
  					}
  				}

  				return !!lastElement && next(lastElement);
  			};
  		},
  		universal: function(next){
  			return next;
  		}
  	};
  }

  var general = generalFactory;

  var trueFunc$1          = boolbase.trueFunc,
  	falseFunc$1$1         = boolbase.falseFunc;

  function filtersFactory(adapter){
  	var attributes  = attributes$1(adapter),
  		checkAttrib = attributes.rules.equals;

  	
  	function equals(a, b){
  		if(typeof adapter.equals === "function") return adapter.equals(a, b);

  		return a === b;
  	}

  	function getAttribFunc(name, value){
  		var data = {name: name, value: value};
  		return function attribFunc(next){
  			return checkAttrib(next, data);
  		};
  	}

  	function getChildFunc(next){
  		return function(elem){
  			return !!adapter.getParent(elem) && next(elem);
  		};
  	}

  	var filters = {
  		contains: function(next, text){
  			return function contains(elem){
  				return next(elem) && adapter.getText(elem).indexOf(text) >= 0;
  			};
  		},
  		icontains: function(next, text){
  			var itext = text.toLowerCase();
  			return function icontains(elem){
  				return next(elem) &&
  					adapter.getText(elem).toLowerCase().indexOf(itext) >= 0;
  			};
  		},

  		
  		"nth-child": function(next, rule){
  			var func = nthCheck(rule);

  			if(func === falseFunc$1$1) return func;
  			if(func === trueFunc$1)  return getChildFunc(next);

  			return function nthChild(elem){
  				var siblings = adapter.getSiblings(elem);

  				for(var i = 0, pos = 0; i < siblings.length; i++){
  					if(adapter.isTag(siblings[i])){
  						if(siblings[i] === elem) break;
  						else pos++;
  					}
  				}

  				return func(pos) && next(elem);
  			};
  		},
  		"nth-last-child": function(next, rule){
  			var func = nthCheck(rule);

  			if(func === falseFunc$1$1) return func;
  			if(func === trueFunc$1)  return getChildFunc(next);

  			return function nthLastChild(elem){
  				var siblings = adapter.getSiblings(elem);

  				for(var pos = 0, i = siblings.length - 1; i >= 0; i--){
  					if(adapter.isTag(siblings[i])){
  						if(siblings[i] === elem) break;
  						else pos++;
  					}
  				}

  				return func(pos) && next(elem);
  			};
  		},
  		"nth-of-type": function(next, rule){
  			var func = nthCheck(rule);

  			if(func === falseFunc$1$1) return func;
  			if(func === trueFunc$1)  return getChildFunc(next);

  			return function nthOfType(elem){
  				var siblings = adapter.getSiblings(elem);

  				for(var pos = 0, i = 0; i < siblings.length; i++){
  					if(adapter.isTag(siblings[i])){
  						if(siblings[i] === elem) break;
  						if(adapter.getName(siblings[i]) === adapter.getName(elem)) pos++;
  					}
  				}

  				return func(pos) && next(elem);
  			};
  		},
  		"nth-last-of-type": function(next, rule){
  			var func = nthCheck(rule);

  			if(func === falseFunc$1$1) return func;
  			if(func === trueFunc$1)  return getChildFunc(next);

  			return function nthLastOfType(elem){
  				var siblings = adapter.getSiblings(elem);

  				for(var pos = 0, i = siblings.length - 1; i >= 0; i--){
  					if(adapter.isTag(siblings[i])){
  						if(siblings[i] === elem) break;
  						if(adapter.getName(siblings[i]) === adapter.getName(elem)) pos++;
  					}
  				}

  				return func(pos) && next(elem);
  			};
  		},

  		
  		root: function(next){
  			return function(elem){
  				return !adapter.getParent(elem) && next(elem);
  			};
  		},

  		scope: function(next, rule, options, context){
  			if(!context || context.length === 0){
  				
  				return filters.root(next);
  			}

  			if(context.length === 1){
  				
  				return function(elem){
  					return equals(context[0], elem) && next(elem);
  				};
  			}

  			return function(elem){
  				return context.indexOf(elem) >= 0 && next(elem);
  			};
  		},

  		
  		checkbox: getAttribFunc("type", "checkbox"),
  		file: getAttribFunc("type", "file"),
  		password: getAttribFunc("type", "password"),
  		radio: getAttribFunc("type", "radio"),
  		reset: getAttribFunc("type", "reset"),
  		image: getAttribFunc("type", "image"),
  		submit: getAttribFunc("type", "submit")
  	};
  	return filters;
  }

  function pseudosFactory(adapter){
  	
  	function getFirstElement(elems){
  		for(var i = 0; elems && i < elems.length; i++){
  			if(adapter.isTag(elems[i])) return elems[i];
  		}
  	}

  	
  	var pseudos = {
  		empty: function(elem){
  			return !adapter.getChildren(elem).some(function(elem){
  				return adapter.isTag(elem) || elem.type === "text";
  			});
  		},

  		"first-child": function(elem){
  			return getFirstElement(adapter.getSiblings(elem)) === elem;
  		},
  		"last-child": function(elem){
  			var siblings = adapter.getSiblings(elem);

  			for(var i = siblings.length - 1; i >= 0; i--){
  				if(siblings[i] === elem) return true;
  				if(adapter.isTag(siblings[i])) break;
  			}

  			return false;
  		},
  		"first-of-type": function(elem){
  			var siblings = adapter.getSiblings(elem);

  			for(var i = 0; i < siblings.length; i++){
  				if(adapter.isTag(siblings[i])){
  					if(siblings[i] === elem) return true;
  					if(adapter.getName(siblings[i]) === adapter.getName(elem)) break;
  				}
  			}

  			return false;
  		},
  		"last-of-type": function(elem){
  			var siblings = adapter.getSiblings(elem);

  			for(var i = siblings.length - 1; i >= 0; i--){
  				if(adapter.isTag(siblings[i])){
  					if(siblings[i] === elem) return true;
  					if(adapter.getName(siblings[i]) === adapter.getName(elem)) break;
  				}
  			}

  			return false;
  		},
  		"only-of-type": function(elem){
  			var siblings = adapter.getSiblings(elem);

  			for(var i = 0, j = siblings.length; i < j; i++){
  				if(adapter.isTag(siblings[i])){
  					if(siblings[i] === elem) continue;
  					if(adapter.getName(siblings[i]) === adapter.getName(elem)) return false;
  				}
  			}

  			return true;
  		},
  		"only-child": function(elem){
  			var siblings = adapter.getSiblings(elem);

  			for(var i = 0; i < siblings.length; i++){
  				if(adapter.isTag(siblings[i]) && siblings[i] !== elem) return false;
  			}

  			return true;
  		},

  		
  		link: function(elem){
  			return adapter.hasAttrib(elem, "href");
  		},
  		visited: falseFunc$1$1, 
  		

  		
  		

  		
  		selected: function(elem){
  			if(adapter.hasAttrib(elem, "selected")) return true;
  			else if(adapter.getName(elem) !== "option") return false;

  			
  			var parent = adapter.getParent(elem);

  			if(
  				!parent ||
  				adapter.getName(parent) !== "select" ||
  				adapter.hasAttrib(parent, "multiple")
  			) return false;

  			var siblings = adapter.getChildren(parent),
  				sawElem  = false;

  			for(var i = 0; i < siblings.length; i++){
  				if(adapter.isTag(siblings[i])){
  					if(siblings[i] === elem){
  						sawElem = true;
  					} else if(!sawElem){
  						return false;
  					} else if(adapter.hasAttrib(siblings[i], "selected")){
  						return false;
  					}
  				}
  			}

  			return sawElem;
  		},
  		
  		
  		
  		
  		
  		
  		disabled: function(elem){
  			return adapter.hasAttrib(elem, "disabled");
  		},
  		enabled: function(elem){
  			return !adapter.hasAttrib(elem, "disabled");
  		},
  		
  		checked: function(elem){
  			return adapter.hasAttrib(elem, "checked") || pseudos.selected(elem);
  		},
  		
  		required: function(elem){
  			return adapter.hasAttrib(elem, "required");
  		},
  		
  		optional: function(elem){
  			return !adapter.hasAttrib(elem, "required");
  		},

  		

  		
  		parent: function(elem){
  			return !pseudos.empty(elem);
  		},
  		
  		header: function(elem){
  			var name = adapter.getName(elem);
  			return name === "h1" ||
  					name === "h2" ||
  					name === "h3" ||
  					name === "h4" ||
  					name === "h5" ||
  					name === "h6";
  		},

  		
  		button: function(elem){
  			var name = adapter.getName(elem);
  			return name === "button" ||
  					name === "input" &&
  					adapter.getAttributeValue(elem, "type") === "button";
  		},
  		
  		input: function(elem){
  			var name = adapter.getName(elem);
  			return name === "input" ||
  					name === "textarea" ||
  					name === "select" ||
  					name === "button";
  		},
  		
  		text: function(elem){
  			var attr;
  			return adapter.getName(elem) === "input" && (
  				!(attr = adapter.getAttributeValue(elem, "type")) ||
  				attr.toLowerCase() === "text"
  			);
  		}
  	};

  	return pseudos;
  }

  function verifyArgs(func, name, subselect){
  	if(subselect === null){
  		if(func.length > 1 && name !== "scope"){
  			throw new Error("pseudo-selector :" + name + " requires an argument");
  		}
  	} else {
  		if(func.length === 1){
  			throw new Error("pseudo-selector :" + name + " doesn't have any arguments");
  		}
  	}
  }


  var re_CSS3 = /^(?:(?:nth|last|first|only)-(?:child|of-type)|root|empty|(?:en|dis)abled|checked|not)$/;

  function factory$1(adapter){
  	var pseudos = pseudosFactory(adapter);
  	var filters = filtersFactory(adapter);

  	return {
  		compile: function(next, data, options, context){
  			var name = data.name,
  				subselect = data.data;

  			if(options && options.strict && !re_CSS3.test(name)){
  				throw new Error(":" + name + " isn't part of CSS3");
  			}

  			if(typeof filters[name] === "function"){
  				verifyArgs(filters[name], name,  subselect);
  				return filters[name](next, subselect, options, context);
  			} else if(typeof pseudos[name] === "function"){
  				var func = pseudos[name];
  				verifyArgs(func, name, subselect);

  				if(next === trueFunc$1) return func;

  				return function pseudoArgs(elem){
  					return func(elem, subselect) && next(elem);
  				};
  			} else {
  				throw new Error("unmatched pseudo-class :" + name);
  			}
  		},
  		filters: filters,
  		pseudos: pseudos
  	};
  }

  var pseudos = factory$1;

  var compile$1 = compileFactory;

  var trueFunc$1$1       = boolbase.trueFunc,
  	falseFunc$2      = boolbase.falseFunc;

  function compileFactory(adapter){
  	var Pseudos     = pseudos(adapter),
  		filters     = Pseudos.filters,
  		Rules 			= general(adapter, Pseudos);

  	function compile(selector, options, context){
  		var next = compileUnsafe(selector, options, context);
  		return wrap(next);
  	}

  	function wrap(next){
  		return function base(elem){
  			return adapter.isTag(elem) && next(elem);
  		};
  	}

  	function compileUnsafe(selector, options, context){
  		var token = cssWhat(selector, options);
  		return compileToken(token, options, context);
  	}

  	function includesScopePseudo(t){
  		return t.type === "pseudo" && (
  			t.name === "scope" || (
  				Array.isArray(t.data) &&
  				t.data.some(function(data){
  					return data.some(includesScopePseudo);
  				})
  			)
  		);
  	}

  	var DESCENDANT_TOKEN = {type: "descendant"},
  		FLEXIBLE_DESCENDANT_TOKEN = {type: "_flexibleDescendant"},
  		SCOPE_TOKEN = {type: "pseudo", name: "scope"},
  		PLACEHOLDER_ELEMENT = {};

  	
  	
  	function absolutize(token, context){
  		
  		var hasContext = !!context && !!context.length && context.every(function(e){
  			return e === PLACEHOLDER_ELEMENT || !!adapter.getParent(e);
  		});


  		token.forEach(function(t){
  			if(t.length > 0 && isTraversal(t[0]) && t[0].type !== "descendant"); else if(hasContext && !includesScopePseudo(t)){
  				t.unshift(DESCENDANT_TOKEN);
  			} else {
  				return;
  			}

  			t.unshift(SCOPE_TOKEN);
  		});
  	}

  	function compileToken(token, options, context){
  		token = token.filter(function(t){ return t.length > 0; });

  		token.forEach(sort);

  		var isArrayContext = Array.isArray(context);

  		context = (options && options.context) || context;

  		if(context && !isArrayContext) context = [context];

  		absolutize(token, context);

  		var shouldTestNextSiblings = false;

  		var query = token
  			.map(function(rules){
  				if(rules[0] && rules[1] && rules[0].name === "scope"){
  					var ruleType = rules[1].type;
  					if(isArrayContext && ruleType === "descendant") rules[1] = FLEXIBLE_DESCENDANT_TOKEN;
  					else if(ruleType === "adjacent" || ruleType === "sibling") shouldTestNextSiblings = true;
  				}
  				return compileRules(rules, options, context);
  			})
  			.reduce(reduceRules, falseFunc$2);

  		query.shouldTestNextSiblings = shouldTestNextSiblings;

  		return query;
  	}

  	function isTraversal(t){
  		return procedure$2[t.type] < 0;
  	}

  	function compileRules(rules, options, context){
  		return rules.reduce(function(func, rule){
  			if(func === falseFunc$2) return func;
  			return Rules[rule.type](func, rule, options, context);
  		}, options && options.rootFunc || trueFunc$1$1);
  	}

  	function reduceRules(a, b){
  		if(b === falseFunc$2 || a === trueFunc$1$1){
  			return a;
  		}
  		if(a === falseFunc$2 || b === trueFunc$1$1){
  			return b;
  		}

  		return function combine(elem){
  			return a(elem) || b(elem);
  		};
  	}

  	function containsTraversal(t){
  		return t.some(isTraversal);
  	}

  	
  	
  	
  	filters.not = function(next, token, options, context){
  		var opts = {
  			xmlMode: !!(options && options.xmlMode),
  			strict: !!(options && options.strict)
  		};

  		if(opts.strict){
  			if(token.length > 1 || token.some(containsTraversal)){
  				throw new Error("complex selectors in :not aren't allowed in strict mode");
  			}
  		}

  		var func = compileToken(token, opts, context);

  		if(func === falseFunc$2) return next;
  		if(func === trueFunc$1$1)  return falseFunc$2;

  		return function(elem){
  			return !func(elem) && next(elem);
  		};
  	};

  	filters.has = function(next, token, options){
  		var opts = {
  			xmlMode: !!(options && options.xmlMode),
  			strict: !!(options && options.strict)
  		};

  		
  		var context = token.some(containsTraversal) ? [PLACEHOLDER_ELEMENT] : null;

  		var func = compileToken(token, opts, context);

  		if(func === falseFunc$2) return falseFunc$2;
  		if(func === trueFunc$1$1){
  			return function(elem){
  				return adapter.getChildren(elem).some(adapter.isTag) && next(elem);
  			};
  		}

  		func = wrap(func);

  		if(context){
  			return function has(elem){
  				return next(elem) && (
  					(context[0] = elem), adapter.existsOne(func, adapter.getChildren(elem))
  				);
  			};
  		}

  		return function has(elem){
  			return next(elem) && adapter.existsOne(func, adapter.getChildren(elem));
  		};
  	};

  	filters.matches = function(next, token, options, context){
  		var opts = {
  			xmlMode: !!(options && options.xmlMode),
  			strict: !!(options && options.strict),
  			rootFunc: next
  		};

  		return compileToken(token, opts, context);
  	};

  	compile.compileToken = compileToken;
  	compile.compileUnsafe = compileUnsafe;
  	compile.Pseudos = Pseudos;

  	return compile;
  }

  var cssSelect = CSSselect;

  var falseFunc$3      = boolbase.falseFunc,
  	defaultCompile = compile$1(domUtils);

  function adapterCompile(adapter){
  	if(!adapter.__compile__){
  		adapter.__compile__ = compile$1(adapter);
  	}
  	return adapter.__compile__
  }

  function getSelectorFunc(searchFunc){
  	return function select(query, elems, options){
  		options = options || {};
  		options.adapter = options.adapter || domUtils;
  		var compile$$1 = adapterCompile(options.adapter);

  		if(typeof query !== "function") query = compile$$1.compileUnsafe(query, options, elems);
  		if(query.shouldTestNextSiblings) elems = appendNextSiblings((options && options.context) || elems, options.adapter);
  		if(!Array.isArray(elems)) elems = options.adapter.getChildren(elems);
  		else elems = options.adapter.removeSubsets(elems);
  		return searchFunc(query, elems, options);
  	};
  }

  function getNextSiblings(elem, adapter){
  	var siblings = adapter.getSiblings(elem);
  	if(!Array.isArray(siblings)) return [];
  	siblings = siblings.slice(0);
  	while(siblings.shift() !== elem);
  	return siblings;
  }

  function appendNextSiblings(elems, adapter){
  	
  	if(!Array.isArray(elems)) elems = [elems];
  	var newElems = elems.slice(0);

  	for(var i = 0, len = elems.length; i < len; i++){
  		var nextSiblings = getNextSiblings(newElems[i], adapter);
  		newElems.push.apply(newElems, nextSiblings);
  	}
  	return newElems;
  }

  var selectAll = getSelectorFunc(function selectAll(query, elems, options){
  	return (query === falseFunc$3 || !elems || elems.length === 0) ? [] : options.adapter.findAll(query, elems);
  });

  var selectOne = getSelectorFunc(function selectOne(query, elems, options){
  	return (query === falseFunc$3 || !elems || elems.length === 0) ? null : options.adapter.findOne(query, elems);
  });

  function is(elem, query, options){
  	options = options || {};
  	options.adapter = options.adapter || domUtils;
  	var compile$$1 = adapterCompile(options.adapter);
  	return (typeof query === "function" ? query : compile$$1(query, options))(elem);
  }


  function CSSselect(query, elems, options){
  	return selectAll(query, elems, options);
  }

  CSSselect.compile = defaultCompile;
  CSSselect.filters = defaultCompile.Pseudos.filters;
  CSSselect.pseudos = defaultCompile.Pseudos.pseudos;

  CSSselect.selectAll = selectAll;
  CSSselect.selectOne = selectOne;

  CSSselect.is = is;


  CSSselect.parse = defaultCompile;
  CSSselect.iterate = selectAll;


  CSSselect._compileUnsafe = defaultCompile.compileUnsafe;
  CSSselect._compileToken = defaultCompile.compileToken;

  var amp = "&";
  var apos = "'";
  var gt = ">";
  var lt = "<";
  var quot = "\"";
  var xmlJSON = {
  	amp: amp,
  	apos: apos,
  	gt: gt,
  	lt: lt,
  	quot: quot
  };

  var xml = Object.freeze({
  	amp: amp,
  	apos: apos,
  	gt: gt,
  	lt: lt,
  	quot: quot,
  	default: xmlJSON
  });

  var Aacute = "Á";
  var aacute = "á";
  var Abreve = "Ă";
  var abreve = "ă";
  var ac = "∾";
  var acd = "∿";
  var acE = "∾̳";
  var Acirc = "Â";
  var acirc = "â";
  var acute = "´";
  var Acy = "А";
  var acy = "а";
  var AElig = "Æ";
  var aelig = "æ";
  var af = "⁡";
  var Afr = "𝔄";
  var afr = "𝔞";
  var Agrave = "À";
  var agrave = "à";
  var alefsym = "ℵ";
  var aleph = "ℵ";
  var Alpha = "Α";
  var alpha = "α";
  var Amacr = "Ā";
  var amacr = "ā";
  var amalg = "⨿";
  var amp$1 = "&";
  var AMP = "&";
  var andand = "⩕";
  var And = "⩓";
  var and = "∧";
  var andd = "⩜";
  var andslope = "⩘";
  var andv = "⩚";
  var ang = "∠";
  var ange = "⦤";
  var angle = "∠";
  var angmsdaa = "⦨";
  var angmsdab = "⦩";
  var angmsdac = "⦪";
  var angmsdad = "⦫";
  var angmsdae = "⦬";
  var angmsdaf = "⦭";
  var angmsdag = "⦮";
  var angmsdah = "⦯";
  var angmsd = "∡";
  var angrt = "∟";
  var angrtvb = "⊾";
  var angrtvbd = "⦝";
  var angsph = "∢";
  var angst = "Å";
  var angzarr = "⍼";
  var Aogon = "Ą";
  var aogon = "ą";
  var Aopf = "𝔸";
  var aopf = "𝕒";
  var apacir = "⩯";
  var ap = "≈";
  var apE = "⩰";
  var ape = "≊";
  var apid = "≋";
  var apos$1 = "'";
  var ApplyFunction = "⁡";
  var approx = "≈";
  var approxeq = "≊";
  var Aring = "Å";
  var aring = "å";
  var Ascr = "𝒜";
  var ascr = "𝒶";
  var Assign = "≔";
  var ast = "*";
  var asymp = "≈";
  var asympeq = "≍";
  var Atilde = "Ã";
  var atilde = "ã";
  var Auml = "Ä";
  var auml = "ä";
  var awconint = "∳";
  var awint = "⨑";
  var backcong = "≌";
  var backepsilon = "϶";
  var backprime = "‵";
  var backsim = "∽";
  var backsimeq = "⋍";
  var Backslash = "∖";
  var Barv = "⫧";
  var barvee = "⊽";
  var barwed = "⌅";
  var Barwed = "⌆";
  var barwedge = "⌅";
  var bbrk = "⎵";
  var bbrktbrk = "⎶";
  var bcong = "≌";
  var Bcy = "Б";
  var bcy = "б";
  var bdquo = "„";
  var becaus = "∵";
  var because = "∵";
  var Because = "∵";
  var bemptyv = "⦰";
  var bepsi = "϶";
  var bernou = "ℬ";
  var Bernoullis = "ℬ";
  var Beta = "Β";
  var beta = "β";
  var beth = "ℶ";
  var between = "≬";
  var Bfr = "𝔅";
  var bfr = "𝔟";
  var bigcap = "⋂";
  var bigcirc = "◯";
  var bigcup = "⋃";
  var bigodot = "⨀";
  var bigoplus = "⨁";
  var bigotimes = "⨂";
  var bigsqcup = "⨆";
  var bigstar = "★";
  var bigtriangledown = "▽";
  var bigtriangleup = "△";
  var biguplus = "⨄";
  var bigvee = "⋁";
  var bigwedge = "⋀";
  var bkarow = "⤍";
  var blacklozenge = "⧫";
  var blacksquare = "▪";
  var blacktriangle = "▴";
  var blacktriangledown = "▾";
  var blacktriangleleft = "◂";
  var blacktriangleright = "▸";
  var blank = "␣";
  var blk12 = "▒";
  var blk14 = "░";
  var blk34 = "▓";
  var block = "█";
  var bne = "=⃥";
  var bnequiv = "≡⃥";
  var bNot = "⫭";
  var bnot = "⌐";
  var Bopf = "𝔹";
  var bopf = "𝕓";
  var bot = "⊥";
  var bottom = "⊥";
  var bowtie = "⋈";
  var boxbox = "⧉";
  var boxdl = "┐";
  var boxdL = "╕";
  var boxDl = "╖";
  var boxDL = "╗";
  var boxdr = "┌";
  var boxdR = "╒";
  var boxDr = "╓";
  var boxDR = "╔";
  var boxh = "─";
  var boxH = "═";
  var boxhd = "┬";
  var boxHd = "╤";
  var boxhD = "╥";
  var boxHD = "╦";
  var boxhu = "┴";
  var boxHu = "╧";
  var boxhU = "╨";
  var boxHU = "╩";
  var boxminus = "⊟";
  var boxplus = "⊞";
  var boxtimes = "⊠";
  var boxul = "┘";
  var boxuL = "╛";
  var boxUl = "╜";
  var boxUL = "╝";
  var boxur = "└";
  var boxuR = "╘";
  var boxUr = "╙";
  var boxUR = "╚";
  var boxv = "│";
  var boxV = "║";
  var boxvh = "┼";
  var boxvH = "╪";
  var boxVh = "╫";
  var boxVH = "╬";
  var boxvl = "┤";
  var boxvL = "╡";
  var boxVl = "╢";
  var boxVL = "╣";
  var boxvr = "├";
  var boxvR = "╞";
  var boxVr = "╟";
  var boxVR = "╠";
  var bprime = "‵";
  var breve = "˘";
  var Breve = "˘";
  var brvbar = "¦";
  var bscr = "𝒷";
  var Bscr = "ℬ";
  var bsemi = "⁏";
  var bsim = "∽";
  var bsime = "⋍";
  var bsolb = "⧅";
  var bsol = "\\";
  var bsolhsub = "⟈";
  var bull = "•";
  var bullet = "•";
  var bump = "≎";
  var bumpE = "⪮";
  var bumpe = "≏";
  var Bumpeq = "≎";
  var bumpeq = "≏";
  var Cacute = "Ć";
  var cacute = "ć";
  var capand = "⩄";
  var capbrcup = "⩉";
  var capcap = "⩋";
  var cap = "∩";
  var Cap = "⋒";
  var capcup = "⩇";
  var capdot = "⩀";
  var CapitalDifferentialD = "ⅅ";
  var caps = "∩︀";
  var caret = "⁁";
  var caron = "ˇ";
  var Cayleys = "ℭ";
  var ccaps = "⩍";
  var Ccaron = "Č";
  var ccaron = "č";
  var Ccedil = "Ç";
  var ccedil = "ç";
  var Ccirc = "Ĉ";
  var ccirc = "ĉ";
  var Cconint = "∰";
  var ccups = "⩌";
  var ccupssm = "⩐";
  var Cdot = "Ċ";
  var cdot = "ċ";
  var cedil = "¸";
  var Cedilla = "¸";
  var cemptyv = "⦲";
  var cent = "¢";
  var centerdot = "·";
  var CenterDot = "·";
  var cfr = "𝔠";
  var Cfr = "ℭ";
  var CHcy = "Ч";
  var chcy = "ч";
  var check = "✓";
  var checkmark = "✓";
  var Chi = "Χ";
  var chi = "χ";
  var circ = "ˆ";
  var circeq = "≗";
  var circlearrowleft = "↺";
  var circlearrowright = "↻";
  var circledast = "⊛";
  var circledcirc = "⊚";
  var circleddash = "⊝";
  var CircleDot = "⊙";
  var circledR = "®";
  var circledS = "Ⓢ";
  var CircleMinus = "⊖";
  var CirclePlus = "⊕";
  var CircleTimes = "⊗";
  var cir = "○";
  var cirE = "⧃";
  var cire = "≗";
  var cirfnint = "⨐";
  var cirmid = "⫯";
  var cirscir = "⧂";
  var ClockwiseContourIntegral = "∲";
  var CloseCurlyDoubleQuote = "”";
  var CloseCurlyQuote = "’";
  var clubs = "♣";
  var clubsuit = "♣";
  var colon = ":";
  var Colon = "∷";
  var Colone = "⩴";
  var colone = "≔";
  var coloneq = "≔";
  var comma = ",";
  var commat = "@";
  var comp = "∁";
  var compfn = "∘";
  var complement = "∁";
  var complexes = "ℂ";
  var cong = "≅";
  var congdot = "⩭";
  var Congruent = "≡";
  var conint = "∮";
  var Conint = "∯";
  var ContourIntegral = "∮";
  var copf = "𝕔";
  var Copf = "ℂ";
  var coprod = "∐";
  var Coproduct = "∐";
  var copy = "©";
  var COPY = "©";
  var copysr = "℗";
  var CounterClockwiseContourIntegral = "∳";
  var crarr = "↵";
  var cross = "✗";
  var Cross = "⨯";
  var Cscr = "𝒞";
  var cscr = "𝒸";
  var csub = "⫏";
  var csube = "⫑";
  var csup = "⫐";
  var csupe = "⫒";
  var ctdot = "⋯";
  var cudarrl = "⤸";
  var cudarrr = "⤵";
  var cuepr = "⋞";
  var cuesc = "⋟";
  var cularr = "↶";
  var cularrp = "⤽";
  var cupbrcap = "⩈";
  var cupcap = "⩆";
  var CupCap = "≍";
  var cup = "∪";
  var Cup = "⋓";
  var cupcup = "⩊";
  var cupdot = "⊍";
  var cupor = "⩅";
  var cups = "∪︀";
  var curarr = "↷";
  var curarrm = "⤼";
  var curlyeqprec = "⋞";
  var curlyeqsucc = "⋟";
  var curlyvee = "⋎";
  var curlywedge = "⋏";
  var curren = "¤";
  var curvearrowleft = "↶";
  var curvearrowright = "↷";
  var cuvee = "⋎";
  var cuwed = "⋏";
  var cwconint = "∲";
  var cwint = "∱";
  var cylcty = "⌭";
  var dagger = "†";
  var Dagger = "‡";
  var daleth = "ℸ";
  var darr = "↓";
  var Darr = "↡";
  var dArr = "⇓";
  var dash = "‐";
  var Dashv = "⫤";
  var dashv = "⊣";
  var dbkarow = "⤏";
  var dblac = "˝";
  var Dcaron = "Ď";
  var dcaron = "ď";
  var Dcy = "Д";
  var dcy = "д";
  var ddagger = "‡";
  var ddarr = "⇊";
  var DD = "ⅅ";
  var dd = "ⅆ";
  var DDotrahd = "⤑";
  var ddotseq = "⩷";
  var deg = "°";
  var Del = "∇";
  var Delta = "Δ";
  var delta = "δ";
  var demptyv = "⦱";
  var dfisht = "⥿";
  var Dfr = "𝔇";
  var dfr = "𝔡";
  var dHar = "⥥";
  var dharl = "⇃";
  var dharr = "⇂";
  var DiacriticalAcute = "´";
  var DiacriticalDot = "˙";
  var DiacriticalDoubleAcute = "˝";
  var DiacriticalGrave = "`";
  var DiacriticalTilde = "˜";
  var diam = "⋄";
  var diamond = "⋄";
  var Diamond = "⋄";
  var diamondsuit = "♦";
  var diams = "♦";
  var die = "¨";
  var DifferentialD = "ⅆ";
  var digamma = "ϝ";
  var disin = "⋲";
  var div = "÷";
  var divide = "÷";
  var divideontimes = "⋇";
  var divonx = "⋇";
  var DJcy = "Ђ";
  var djcy = "ђ";
  var dlcorn = "⌞";
  var dlcrop = "⌍";
  var dollar = "$";
  var Dopf = "𝔻";
  var dopf = "𝕕";
  var Dot = "¨";
  var dot = "˙";
  var DotDot = "⃜";
  var doteq = "≐";
  var doteqdot = "≑";
  var DotEqual = "≐";
  var dotminus = "∸";
  var dotplus = "∔";
  var dotsquare = "⊡";
  var doublebarwedge = "⌆";
  var DoubleContourIntegral = "∯";
  var DoubleDot = "¨";
  var DoubleDownArrow = "⇓";
  var DoubleLeftArrow = "⇐";
  var DoubleLeftRightArrow = "⇔";
  var DoubleLeftTee = "⫤";
  var DoubleLongLeftArrow = "⟸";
  var DoubleLongLeftRightArrow = "⟺";
  var DoubleLongRightArrow = "⟹";
  var DoubleRightArrow = "⇒";
  var DoubleRightTee = "⊨";
  var DoubleUpArrow = "⇑";
  var DoubleUpDownArrow = "⇕";
  var DoubleVerticalBar = "∥";
  var DownArrowBar = "⤓";
  var downarrow = "↓";
  var DownArrow = "↓";
  var Downarrow = "⇓";
  var DownArrowUpArrow = "⇵";
  var DownBreve = "̑";
  var downdownarrows = "⇊";
  var downharpoonleft = "⇃";
  var downharpoonright = "⇂";
  var DownLeftRightVector = "⥐";
  var DownLeftTeeVector = "⥞";
  var DownLeftVectorBar = "⥖";
  var DownLeftVector = "↽";
  var DownRightTeeVector = "⥟";
  var DownRightVectorBar = "⥗";
  var DownRightVector = "⇁";
  var DownTeeArrow = "↧";
  var DownTee = "⊤";
  var drbkarow = "⤐";
  var drcorn = "⌟";
  var drcrop = "⌌";
  var Dscr = "𝒟";
  var dscr = "𝒹";
  var DScy = "Ѕ";
  var dscy = "ѕ";
  var dsol = "⧶";
  var Dstrok = "Đ";
  var dstrok = "đ";
  var dtdot = "⋱";
  var dtri = "▿";
  var dtrif = "▾";
  var duarr = "⇵";
  var duhar = "⥯";
  var dwangle = "⦦";
  var DZcy = "Џ";
  var dzcy = "џ";
  var dzigrarr = "⟿";
  var Eacute = "É";
  var eacute = "é";
  var easter = "⩮";
  var Ecaron = "Ě";
  var ecaron = "ě";
  var Ecirc = "Ê";
  var ecirc = "ê";
  var ecir = "≖";
  var ecolon = "≕";
  var Ecy = "Э";
  var ecy = "э";
  var eDDot = "⩷";
  var Edot = "Ė";
  var edot = "ė";
  var eDot = "≑";
  var ee = "ⅇ";
  var efDot = "≒";
  var Efr = "𝔈";
  var efr = "𝔢";
  var eg = "⪚";
  var Egrave = "È";
  var egrave = "è";
  var egs = "⪖";
  var egsdot = "⪘";
  var el = "⪙";
  var Element = "∈";
  var elinters = "⏧";
  var ell = "ℓ";
  var els = "⪕";
  var elsdot = "⪗";
  var Emacr = "Ē";
  var emacr = "ē";
  var empty = "∅";
  var emptyset = "∅";
  var EmptySmallSquare = "◻";
  var emptyv = "∅";
  var EmptyVerySmallSquare = "▫";
  var emsp13 = " ";
  var emsp14 = " ";
  var emsp = " ";
  var ENG = "Ŋ";
  var eng = "ŋ";
  var ensp = " ";
  var Eogon = "Ę";
  var eogon = "ę";
  var Eopf = "𝔼";
  var eopf = "𝕖";
  var epar = "⋕";
  var eparsl = "⧣";
  var eplus = "⩱";
  var epsi = "ε";
  var Epsilon = "Ε";
  var epsilon = "ε";
  var epsiv = "ϵ";
  var eqcirc = "≖";
  var eqcolon = "≕";
  var eqsim = "≂";
  var eqslantgtr = "⪖";
  var eqslantless = "⪕";
  var Equal = "⩵";
  var equals = "=";
  var EqualTilde = "≂";
  var equest = "≟";
  var Equilibrium = "⇌";
  var equiv = "≡";
  var equivDD = "⩸";
  var eqvparsl = "⧥";
  var erarr = "⥱";
  var erDot = "≓";
  var escr = "ℯ";
  var Escr = "ℰ";
  var esdot = "≐";
  var Esim = "⩳";
  var esim = "≂";
  var Eta = "Η";
  var eta = "η";
  var ETH = "Ð";
  var eth = "ð";
  var Euml = "Ë";
  var euml = "ë";
  var euro = "€";
  var excl = "!";
  var exist = "∃";
  var Exists = "∃";
  var expectation = "ℰ";
  var exponentiale = "ⅇ";
  var ExponentialE = "ⅇ";
  var fallingdotseq = "≒";
  var Fcy = "Ф";
  var fcy = "ф";
  var female = "♀";
  var ffilig = "ﬃ";
  var fflig = "ﬀ";
  var ffllig = "ﬄ";
  var Ffr = "𝔉";
  var ffr = "𝔣";
  var filig = "ﬁ";
  var FilledSmallSquare = "◼";
  var FilledVerySmallSquare = "▪";
  var fjlig = "fj";
  var flat = "♭";
  var fllig = "ﬂ";
  var fltns = "▱";
  var fnof = "ƒ";
  var Fopf = "𝔽";
  var fopf = "𝕗";
  var forall = "∀";
  var ForAll = "∀";
  var fork = "⋔";
  var forkv = "⫙";
  var Fouriertrf = "ℱ";
  var fpartint = "⨍";
  var frac12 = "½";
  var frac13 = "⅓";
  var frac14 = "¼";
  var frac15 = "⅕";
  var frac16 = "⅙";
  var frac18 = "⅛";
  var frac23 = "⅔";
  var frac25 = "⅖";
  var frac34 = "¾";
  var frac35 = "⅗";
  var frac38 = "⅜";
  var frac45 = "⅘";
  var frac56 = "⅚";
  var frac58 = "⅝";
  var frac78 = "⅞";
  var frasl = "⁄";
  var frown = "⌢";
  var fscr = "𝒻";
  var Fscr = "ℱ";
  var gacute = "ǵ";
  var Gamma = "Γ";
  var gamma = "γ";
  var Gammad = "Ϝ";
  var gammad = "ϝ";
  var gap = "⪆";
  var Gbreve = "Ğ";
  var gbreve = "ğ";
  var Gcedil = "Ģ";
  var Gcirc = "Ĝ";
  var gcirc = "ĝ";
  var Gcy = "Г";
  var gcy = "г";
  var Gdot = "Ġ";
  var gdot = "ġ";
  var ge = "≥";
  var gE = "≧";
  var gEl = "⪌";
  var gel = "⋛";
  var geq = "≥";
  var geqq = "≧";
  var geqslant = "⩾";
  var gescc = "⪩";
  var ges = "⩾";
  var gesdot = "⪀";
  var gesdoto = "⪂";
  var gesdotol = "⪄";
  var gesl = "⋛︀";
  var gesles = "⪔";
  var Gfr = "𝔊";
  var gfr = "𝔤";
  var gg = "≫";
  var Gg = "⋙";
  var ggg = "⋙";
  var gimel = "ℷ";
  var GJcy = "Ѓ";
  var gjcy = "ѓ";
  var gla = "⪥";
  var gl = "≷";
  var glE = "⪒";
  var glj = "⪤";
  var gnap = "⪊";
  var gnapprox = "⪊";
  var gne = "⪈";
  var gnE = "≩";
  var gneq = "⪈";
  var gneqq = "≩";
  var gnsim = "⋧";
  var Gopf = "𝔾";
  var gopf = "𝕘";
  var grave = "`";
  var GreaterEqual = "≥";
  var GreaterEqualLess = "⋛";
  var GreaterFullEqual = "≧";
  var GreaterGreater = "⪢";
  var GreaterLess = "≷";
  var GreaterSlantEqual = "⩾";
  var GreaterTilde = "≳";
  var Gscr = "𝒢";
  var gscr = "ℊ";
  var gsim = "≳";
  var gsime = "⪎";
  var gsiml = "⪐";
  var gtcc = "⪧";
  var gtcir = "⩺";
  var gt$1 = ">";
  var GT = ">";
  var Gt = "≫";
  var gtdot = "⋗";
  var gtlPar = "⦕";
  var gtquest = "⩼";
  var gtrapprox = "⪆";
  var gtrarr = "⥸";
  var gtrdot = "⋗";
  var gtreqless = "⋛";
  var gtreqqless = "⪌";
  var gtrless = "≷";
  var gtrsim = "≳";
  var gvertneqq = "≩︀";
  var gvnE = "≩︀";
  var Hacek = "ˇ";
  var hairsp = " ";
  var half = "½";
  var hamilt = "ℋ";
  var HARDcy = "Ъ";
  var hardcy = "ъ";
  var harrcir = "⥈";
  var harr = "↔";
  var hArr = "⇔";
  var harrw = "↭";
  var Hat = "^";
  var hbar = "ℏ";
  var Hcirc = "Ĥ";
  var hcirc = "ĥ";
  var hearts = "♥";
  var heartsuit = "♥";
  var hellip = "…";
  var hercon = "⊹";
  var hfr = "𝔥";
  var Hfr = "ℌ";
  var HilbertSpace = "ℋ";
  var hksearow = "⤥";
  var hkswarow = "⤦";
  var hoarr = "⇿";
  var homtht = "∻";
  var hookleftarrow = "↩";
  var hookrightarrow = "↪";
  var hopf = "𝕙";
  var Hopf = "ℍ";
  var horbar = "―";
  var HorizontalLine = "─";
  var hscr = "𝒽";
  var Hscr = "ℋ";
  var hslash = "ℏ";
  var Hstrok = "Ħ";
  var hstrok = "ħ";
  var HumpDownHump = "≎";
  var HumpEqual = "≏";
  var hybull = "⁃";
  var hyphen = "‐";
  var Iacute = "Í";
  var iacute = "í";
  var ic = "⁣";
  var Icirc = "Î";
  var icirc = "î";
  var Icy = "И";
  var icy = "и";
  var Idot = "İ";
  var IEcy = "Е";
  var iecy = "е";
  var iexcl = "¡";
  var iff = "⇔";
  var ifr = "𝔦";
  var Ifr = "ℑ";
  var Igrave = "Ì";
  var igrave = "ì";
  var ii = "ⅈ";
  var iiiint = "⨌";
  var iiint = "∭";
  var iinfin = "⧜";
  var iiota = "℩";
  var IJlig = "Ĳ";
  var ijlig = "ĳ";
  var Imacr = "Ī";
  var imacr = "ī";
  var image = "ℑ";
  var ImaginaryI = "ⅈ";
  var imagline = "ℐ";
  var imagpart = "ℑ";
  var imath = "ı";
  var Im = "ℑ";
  var imof = "⊷";
  var imped = "Ƶ";
  var Implies = "⇒";
  var incare = "℅";
  var infin = "∞";
  var infintie = "⧝";
  var inodot = "ı";
  var intcal = "⊺";
  var int = "∫";
  var Int = "∬";
  var integers = "ℤ";
  var Integral = "∫";
  var intercal = "⊺";
  var Intersection = "⋂";
  var intlarhk = "⨗";
  var intprod = "⨼";
  var InvisibleComma = "⁣";
  var InvisibleTimes = "⁢";
  var IOcy = "Ё";
  var iocy = "ё";
  var Iogon = "Į";
  var iogon = "į";
  var Iopf = "𝕀";
  var iopf = "𝕚";
  var Iota = "Ι";
  var iota = "ι";
  var iprod = "⨼";
  var iquest = "¿";
  var iscr = "𝒾";
  var Iscr = "ℐ";
  var isin = "∈";
  var isindot = "⋵";
  var isinE = "⋹";
  var isins = "⋴";
  var isinsv = "⋳";
  var isinv = "∈";
  var it = "⁢";
  var Itilde = "Ĩ";
  var itilde = "ĩ";
  var Iukcy = "І";
  var iukcy = "і";
  var Iuml = "Ï";
  var iuml = "ï";
  var Jcirc = "Ĵ";
  var jcirc = "ĵ";
  var Jcy = "Й";
  var jcy = "й";
  var Jfr = "𝔍";
  var jfr = "𝔧";
  var jmath = "ȷ";
  var Jopf = "𝕁";
  var jopf = "𝕛";
  var Jscr = "𝒥";
  var jscr = "𝒿";
  var Jsercy = "Ј";
  var jsercy = "ј";
  var Jukcy = "Є";
  var jukcy = "є";
  var Kappa = "Κ";
  var kappa = "κ";
  var kappav = "ϰ";
  var Kcedil = "Ķ";
  var kcedil = "ķ";
  var Kcy = "К";
  var kcy = "к";
  var Kfr = "𝔎";
  var kfr = "𝔨";
  var kgreen = "ĸ";
  var KHcy = "Х";
  var khcy = "х";
  var KJcy = "Ќ";
  var kjcy = "ќ";
  var Kopf = "𝕂";
  var kopf = "𝕜";
  var Kscr = "𝒦";
  var kscr = "𝓀";
  var lAarr = "⇚";
  var Lacute = "Ĺ";
  var lacute = "ĺ";
  var laemptyv = "⦴";
  var lagran = "ℒ";
  var Lambda = "Λ";
  var lambda = "λ";
  var lang = "⟨";
  var Lang = "⟪";
  var langd = "⦑";
  var langle = "⟨";
  var lap = "⪅";
  var Laplacetrf = "ℒ";
  var laquo = "«";
  var larrb = "⇤";
  var larrbfs = "⤟";
  var larr = "←";
  var Larr = "↞";
  var lArr = "⇐";
  var larrfs = "⤝";
  var larrhk = "↩";
  var larrlp = "↫";
  var larrpl = "⤹";
  var larrsim = "⥳";
  var larrtl = "↢";
  var latail = "⤙";
  var lAtail = "⤛";
  var lat = "⪫";
  var late = "⪭";
  var lates = "⪭︀";
  var lbarr = "⤌";
  var lBarr = "⤎";
  var lbbrk = "❲";
  var lbrace = "{";
  var lbrack = "[";
  var lbrke = "⦋";
  var lbrksld = "⦏";
  var lbrkslu = "⦍";
  var Lcaron = "Ľ";
  var lcaron = "ľ";
  var Lcedil = "Ļ";
  var lcedil = "ļ";
  var lceil = "⌈";
  var lcub = "{";
  var Lcy = "Л";
  var lcy = "л";
  var ldca = "⤶";
  var ldquo = "“";
  var ldquor = "„";
  var ldrdhar = "⥧";
  var ldrushar = "⥋";
  var ldsh = "↲";
  var le = "≤";
  var lE = "≦";
  var LeftAngleBracket = "⟨";
  var LeftArrowBar = "⇤";
  var leftarrow = "←";
  var LeftArrow = "←";
  var Leftarrow = "⇐";
  var LeftArrowRightArrow = "⇆";
  var leftarrowtail = "↢";
  var LeftCeiling = "⌈";
  var LeftDoubleBracket = "⟦";
  var LeftDownTeeVector = "⥡";
  var LeftDownVectorBar = "⥙";
  var LeftDownVector = "⇃";
  var LeftFloor = "⌊";
  var leftharpoondown = "↽";
  var leftharpoonup = "↼";
  var leftleftarrows = "⇇";
  var leftrightarrow = "↔";
  var LeftRightArrow = "↔";
  var Leftrightarrow = "⇔";
  var leftrightarrows = "⇆";
  var leftrightharpoons = "⇋";
  var leftrightsquigarrow = "↭";
  var LeftRightVector = "⥎";
  var LeftTeeArrow = "↤";
  var LeftTee = "⊣";
  var LeftTeeVector = "⥚";
  var leftthreetimes = "⋋";
  var LeftTriangleBar = "⧏";
  var LeftTriangle = "⊲";
  var LeftTriangleEqual = "⊴";
  var LeftUpDownVector = "⥑";
  var LeftUpTeeVector = "⥠";
  var LeftUpVectorBar = "⥘";
  var LeftUpVector = "↿";
  var LeftVectorBar = "⥒";
  var LeftVector = "↼";
  var lEg = "⪋";
  var leg = "⋚";
  var leq = "≤";
  var leqq = "≦";
  var leqslant = "⩽";
  var lescc = "⪨";
  var les = "⩽";
  var lesdot = "⩿";
  var lesdoto = "⪁";
  var lesdotor = "⪃";
  var lesg = "⋚︀";
  var lesges = "⪓";
  var lessapprox = "⪅";
  var lessdot = "⋖";
  var lesseqgtr = "⋚";
  var lesseqqgtr = "⪋";
  var LessEqualGreater = "⋚";
  var LessFullEqual = "≦";
  var LessGreater = "≶";
  var lessgtr = "≶";
  var LessLess = "⪡";
  var lesssim = "≲";
  var LessSlantEqual = "⩽";
  var LessTilde = "≲";
  var lfisht = "⥼";
  var lfloor = "⌊";
  var Lfr = "𝔏";
  var lfr = "𝔩";
  var lg = "≶";
  var lgE = "⪑";
  var lHar = "⥢";
  var lhard = "↽";
  var lharu = "↼";
  var lharul = "⥪";
  var lhblk = "▄";
  var LJcy = "Љ";
  var ljcy = "љ";
  var llarr = "⇇";
  var ll = "≪";
  var Ll = "⋘";
  var llcorner = "⌞";
  var Lleftarrow = "⇚";
  var llhard = "⥫";
  var lltri = "◺";
  var Lmidot = "Ŀ";
  var lmidot = "ŀ";
  var lmoustache = "⎰";
  var lmoust = "⎰";
  var lnap = "⪉";
  var lnapprox = "⪉";
  var lne = "⪇";
  var lnE = "≨";
  var lneq = "⪇";
  var lneqq = "≨";
  var lnsim = "⋦";
  var loang = "⟬";
  var loarr = "⇽";
  var lobrk = "⟦";
  var longleftarrow = "⟵";
  var LongLeftArrow = "⟵";
  var Longleftarrow = "⟸";
  var longleftrightarrow = "⟷";
  var LongLeftRightArrow = "⟷";
  var Longleftrightarrow = "⟺";
  var longmapsto = "⟼";
  var longrightarrow = "⟶";
  var LongRightArrow = "⟶";
  var Longrightarrow = "⟹";
  var looparrowleft = "↫";
  var looparrowright = "↬";
  var lopar = "⦅";
  var Lopf = "𝕃";
  var lopf = "𝕝";
  var loplus = "⨭";
  var lotimes = "⨴";
  var lowast = "∗";
  var lowbar = "_";
  var LowerLeftArrow = "↙";
  var LowerRightArrow = "↘";
  var loz = "◊";
  var lozenge = "◊";
  var lozf = "⧫";
  var lpar = "(";
  var lparlt = "⦓";
  var lrarr = "⇆";
  var lrcorner = "⌟";
  var lrhar = "⇋";
  var lrhard = "⥭";
  var lrm = "‎";
  var lrtri = "⊿";
  var lsaquo = "‹";
  var lscr = "𝓁";
  var Lscr = "ℒ";
  var lsh = "↰";
  var Lsh = "↰";
  var lsim = "≲";
  var lsime = "⪍";
  var lsimg = "⪏";
  var lsqb = "[";
  var lsquo = "‘";
  var lsquor = "‚";
  var Lstrok = "Ł";
  var lstrok = "ł";
  var ltcc = "⪦";
  var ltcir = "⩹";
  var lt$1 = "<";
  var LT = "<";
  var Lt = "≪";
  var ltdot = "⋖";
  var lthree = "⋋";
  var ltimes = "⋉";
  var ltlarr = "⥶";
  var ltquest = "⩻";
  var ltri = "◃";
  var ltrie = "⊴";
  var ltrif = "◂";
  var ltrPar = "⦖";
  var lurdshar = "⥊";
  var luruhar = "⥦";
  var lvertneqq = "≨︀";
  var lvnE = "≨︀";
  var macr = "¯";
  var male = "♂";
  var malt = "✠";
  var maltese = "✠";
  var map = "↦";
  var mapsto = "↦";
  var mapstodown = "↧";
  var mapstoleft = "↤";
  var mapstoup = "↥";
  var marker = "▮";
  var mcomma = "⨩";
  var Mcy = "М";
  var mcy = "м";
  var mdash = "—";
  var mDDot = "∺";
  var measuredangle = "∡";
  var MediumSpace = " ";
  var Mellintrf = "ℳ";
  var Mfr = "𝔐";
  var mfr = "𝔪";
  var mho = "℧";
  var micro = "µ";
  var midast = "*";
  var midcir = "⫰";
  var mid = "∣";
  var middot = "·";
  var minusb = "⊟";
  var minus = "−";
  var minusd = "∸";
  var minusdu = "⨪";
  var MinusPlus = "∓";
  var mlcp = "⫛";
  var mldr = "…";
  var mnplus = "∓";
  var models = "⊧";
  var Mopf = "𝕄";
  var mopf = "𝕞";
  var mp = "∓";
  var mscr = "𝓂";
  var Mscr = "ℳ";
  var mstpos = "∾";
  var Mu = "Μ";
  var mu = "μ";
  var multimap = "⊸";
  var mumap = "⊸";
  var nabla = "∇";
  var Nacute = "Ń";
  var nacute = "ń";
  var nang = "∠⃒";
  var nap = "≉";
  var napE = "⩰̸";
  var napid = "≋̸";
  var napos = "ŉ";
  var napprox = "≉";
  var natural = "♮";
  var naturals = "ℕ";
  var natur = "♮";
  var nbsp = " ";
  var nbump = "≎̸";
  var nbumpe = "≏̸";
  var ncap = "⩃";
  var Ncaron = "Ň";
  var ncaron = "ň";
  var Ncedil = "Ņ";
  var ncedil = "ņ";
  var ncong = "≇";
  var ncongdot = "⩭̸";
  var ncup = "⩂";
  var Ncy = "Н";
  var ncy = "н";
  var ndash = "–";
  var nearhk = "⤤";
  var nearr = "↗";
  var neArr = "⇗";
  var nearrow = "↗";
  var ne = "≠";
  var nedot = "≐̸";
  var NegativeMediumSpace = "​";
  var NegativeThickSpace = "​";
  var NegativeThinSpace = "​";
  var NegativeVeryThinSpace = "​";
  var nequiv = "≢";
  var nesear = "⤨";
  var nesim = "≂̸";
  var NestedGreaterGreater = "≫";
  var NestedLessLess = "≪";
  var NewLine = "\n";
  var nexist = "∄";
  var nexists = "∄";
  var Nfr = "𝔑";
  var nfr = "𝔫";
  var ngE = "≧̸";
  var nge = "≱";
  var ngeq = "≱";
  var ngeqq = "≧̸";
  var ngeqslant = "⩾̸";
  var nges = "⩾̸";
  var nGg = "⋙̸";
  var ngsim = "≵";
  var nGt = "≫⃒";
  var ngt = "≯";
  var ngtr = "≯";
  var nGtv = "≫̸";
  var nharr = "↮";
  var nhArr = "⇎";
  var nhpar = "⫲";
  var ni = "∋";
  var nis = "⋼";
  var nisd = "⋺";
  var niv = "∋";
  var NJcy = "Њ";
  var njcy = "њ";
  var nlarr = "↚";
  var nlArr = "⇍";
  var nldr = "‥";
  var nlE = "≦̸";
  var nle = "≰";
  var nleftarrow = "↚";
  var nLeftarrow = "⇍";
  var nleftrightarrow = "↮";
  var nLeftrightarrow = "⇎";
  var nleq = "≰";
  var nleqq = "≦̸";
  var nleqslant = "⩽̸";
  var nles = "⩽̸";
  var nless = "≮";
  var nLl = "⋘̸";
  var nlsim = "≴";
  var nLt = "≪⃒";
  var nlt = "≮";
  var nltri = "⋪";
  var nltrie = "⋬";
  var nLtv = "≪̸";
  var nmid = "∤";
  var NoBreak = "⁠";
  var NonBreakingSpace = " ";
  var nopf = "𝕟";
  var Nopf = "ℕ";
  var Not = "⫬";
  var not = "¬";
  var NotCongruent = "≢";
  var NotCupCap = "≭";
  var NotDoubleVerticalBar = "∦";
  var NotElement = "∉";
  var NotEqual = "≠";
  var NotEqualTilde = "≂̸";
  var NotExists = "∄";
  var NotGreater = "≯";
  var NotGreaterEqual = "≱";
  var NotGreaterFullEqual = "≧̸";
  var NotGreaterGreater = "≫̸";
  var NotGreaterLess = "≹";
  var NotGreaterSlantEqual = "⩾̸";
  var NotGreaterTilde = "≵";
  var NotHumpDownHump = "≎̸";
  var NotHumpEqual = "≏̸";
  var notin = "∉";
  var notindot = "⋵̸";
  var notinE = "⋹̸";
  var notinva = "∉";
  var notinvb = "⋷";
  var notinvc = "⋶";
  var NotLeftTriangleBar = "⧏̸";
  var NotLeftTriangle = "⋪";
  var NotLeftTriangleEqual = "⋬";
  var NotLess = "≮";
  var NotLessEqual = "≰";
  var NotLessGreater = "≸";
  var NotLessLess = "≪̸";
  var NotLessSlantEqual = "⩽̸";
  var NotLessTilde = "≴";
  var NotNestedGreaterGreater = "⪢̸";
  var NotNestedLessLess = "⪡̸";
  var notni = "∌";
  var notniva = "∌";
  var notnivb = "⋾";
  var notnivc = "⋽";
  var NotPrecedes = "⊀";
  var NotPrecedesEqual = "⪯̸";
  var NotPrecedesSlantEqual = "⋠";
  var NotReverseElement = "∌";
  var NotRightTriangleBar = "⧐̸";
  var NotRightTriangle = "⋫";
  var NotRightTriangleEqual = "⋭";
  var NotSquareSubset = "⊏̸";
  var NotSquareSubsetEqual = "⋢";
  var NotSquareSuperset = "⊐̸";
  var NotSquareSupersetEqual = "⋣";
  var NotSubset = "⊂⃒";
  var NotSubsetEqual = "⊈";
  var NotSucceeds = "⊁";
  var NotSucceedsEqual = "⪰̸";
  var NotSucceedsSlantEqual = "⋡";
  var NotSucceedsTilde = "≿̸";
  var NotSuperset = "⊃⃒";
  var NotSupersetEqual = "⊉";
  var NotTilde = "≁";
  var NotTildeEqual = "≄";
  var NotTildeFullEqual = "≇";
  var NotTildeTilde = "≉";
  var NotVerticalBar = "∤";
  var nparallel = "∦";
  var npar = "∦";
  var nparsl = "⫽⃥";
  var npart = "∂̸";
  var npolint = "⨔";
  var npr = "⊀";
  var nprcue = "⋠";
  var nprec = "⊀";
  var npreceq = "⪯̸";
  var npre = "⪯̸";
  var nrarrc = "⤳̸";
  var nrarr = "↛";
  var nrArr = "⇏";
  var nrarrw = "↝̸";
  var nrightarrow = "↛";
  var nRightarrow = "⇏";
  var nrtri = "⋫";
  var nrtrie = "⋭";
  var nsc = "⊁";
  var nsccue = "⋡";
  var nsce = "⪰̸";
  var Nscr = "𝒩";
  var nscr = "𝓃";
  var nshortmid = "∤";
  var nshortparallel = "∦";
  var nsim = "≁";
  var nsime = "≄";
  var nsimeq = "≄";
  var nsmid = "∤";
  var nspar = "∦";
  var nsqsube = "⋢";
  var nsqsupe = "⋣";
  var nsub = "⊄";
  var nsubE = "⫅̸";
  var nsube = "⊈";
  var nsubset = "⊂⃒";
  var nsubseteq = "⊈";
  var nsubseteqq = "⫅̸";
  var nsucc = "⊁";
  var nsucceq = "⪰̸";
  var nsup = "⊅";
  var nsupE = "⫆̸";
  var nsupe = "⊉";
  var nsupset = "⊃⃒";
  var nsupseteq = "⊉";
  var nsupseteqq = "⫆̸";
  var ntgl = "≹";
  var Ntilde = "Ñ";
  var ntilde = "ñ";
  var ntlg = "≸";
  var ntriangleleft = "⋪";
  var ntrianglelefteq = "⋬";
  var ntriangleright = "⋫";
  var ntrianglerighteq = "⋭";
  var Nu = "Ν";
  var nu = "ν";
  var num = "#";
  var numero = "№";
  var numsp = " ";
  var nvap = "≍⃒";
  var nvdash = "⊬";
  var nvDash = "⊭";
  var nVdash = "⊮";
  var nVDash = "⊯";
  var nvge = "≥⃒";
  var nvgt = ">⃒";
  var nvHarr = "⤄";
  var nvinfin = "⧞";
  var nvlArr = "⤂";
  var nvle = "≤⃒";
  var nvlt = "<⃒";
  var nvltrie = "⊴⃒";
  var nvrArr = "⤃";
  var nvrtrie = "⊵⃒";
  var nvsim = "∼⃒";
  var nwarhk = "⤣";
  var nwarr = "↖";
  var nwArr = "⇖";
  var nwarrow = "↖";
  var nwnear = "⤧";
  var Oacute = "Ó";
  var oacute = "ó";
  var oast = "⊛";
  var Ocirc = "Ô";
  var ocirc = "ô";
  var ocir = "⊚";
  var Ocy = "О";
  var ocy = "о";
  var odash = "⊝";
  var Odblac = "Ő";
  var odblac = "ő";
  var odiv = "⨸";
  var odot = "⊙";
  var odsold = "⦼";
  var OElig = "Œ";
  var oelig = "œ";
  var ofcir = "⦿";
  var Ofr = "𝔒";
  var ofr = "𝔬";
  var ogon = "˛";
  var Ograve = "Ò";
  var ograve = "ò";
  var ogt = "⧁";
  var ohbar = "⦵";
  var ohm = "Ω";
  var oint = "∮";
  var olarr = "↺";
  var olcir = "⦾";
  var olcross = "⦻";
  var oline = "‾";
  var olt = "⧀";
  var Omacr = "Ō";
  var omacr = "ō";
  var Omega = "Ω";
  var omega = "ω";
  var Omicron = "Ο";
  var omicron = "ο";
  var omid = "⦶";
  var ominus = "⊖";
  var Oopf = "𝕆";
  var oopf = "𝕠";
  var opar = "⦷";
  var OpenCurlyDoubleQuote = "“";
  var OpenCurlyQuote = "‘";
  var operp = "⦹";
  var oplus = "⊕";
  var orarr = "↻";
  var Or = "⩔";
  var or = "∨";
  var ord = "⩝";
  var order = "ℴ";
  var orderof = "ℴ";
  var ordf = "ª";
  var ordm = "º";
  var origof = "⊶";
  var oror = "⩖";
  var orslope = "⩗";
  var orv = "⩛";
  var oS = "Ⓢ";
  var Oscr = "𝒪";
  var oscr = "ℴ";
  var Oslash = "Ø";
  var oslash = "ø";
  var osol = "⊘";
  var Otilde = "Õ";
  var otilde = "õ";
  var otimesas = "⨶";
  var Otimes = "⨷";
  var otimes = "⊗";
  var Ouml = "Ö";
  var ouml = "ö";
  var ovbar = "⌽";
  var OverBar = "‾";
  var OverBrace = "⏞";
  var OverBracket = "⎴";
  var OverParenthesis = "⏜";
  var para = "¶";
  var parallel = "∥";
  var par = "∥";
  var parsim = "⫳";
  var parsl = "⫽";
  var part = "∂";
  var PartialD = "∂";
  var Pcy = "П";
  var pcy = "п";
  var percnt = "%";
  var period = ".";
  var permil = "‰";
  var perp = "⊥";
  var pertenk = "‱";
  var Pfr = "𝔓";
  var pfr = "𝔭";
  var Phi = "Φ";
  var phi = "φ";
  var phiv = "ϕ";
  var phmmat = "ℳ";
  var phone = "☎";
  var Pi = "Π";
  var pi = "π";
  var pitchfork = "⋔";
  var piv = "ϖ";
  var planck = "ℏ";
  var planckh = "ℎ";
  var plankv = "ℏ";
  var plusacir = "⨣";
  var plusb = "⊞";
  var pluscir = "⨢";
  var plus = "+";
  var plusdo = "∔";
  var plusdu = "⨥";
  var pluse = "⩲";
  var PlusMinus = "±";
  var plusmn = "±";
  var plussim = "⨦";
  var plustwo = "⨧";
  var pm = "±";
  var Poincareplane = "ℌ";
  var pointint = "⨕";
  var popf = "𝕡";
  var Popf = "ℙ";
  var pound = "£";
  var prap = "⪷";
  var Pr = "⪻";
  var pr = "≺";
  var prcue = "≼";
  var precapprox = "⪷";
  var prec = "≺";
  var preccurlyeq = "≼";
  var Precedes = "≺";
  var PrecedesEqual = "⪯";
  var PrecedesSlantEqual = "≼";
  var PrecedesTilde = "≾";
  var preceq = "⪯";
  var precnapprox = "⪹";
  var precneqq = "⪵";
  var precnsim = "⋨";
  var pre = "⪯";
  var prE = "⪳";
  var precsim = "≾";
  var prime = "′";
  var Prime = "″";
  var primes = "ℙ";
  var prnap = "⪹";
  var prnE = "⪵";
  var prnsim = "⋨";
  var prod = "∏";
  var Product = "∏";
  var profalar = "⌮";
  var profline = "⌒";
  var profsurf = "⌓";
  var prop = "∝";
  var Proportional = "∝";
  var Proportion = "∷";
  var propto = "∝";
  var prsim = "≾";
  var prurel = "⊰";
  var Pscr = "𝒫";
  var pscr = "𝓅";
  var Psi = "Ψ";
  var psi = "ψ";
  var puncsp = " ";
  var Qfr = "𝔔";
  var qfr = "𝔮";
  var qint = "⨌";
  var qopf = "𝕢";
  var Qopf = "ℚ";
  var qprime = "⁗";
  var Qscr = "𝒬";
  var qscr = "𝓆";
  var quaternions = "ℍ";
  var quatint = "⨖";
  var quest = "?";
  var questeq = "≟";
  var quot$1 = "\"";
  var QUOT = "\"";
  var rAarr = "⇛";
  var race = "∽̱";
  var Racute = "Ŕ";
  var racute = "ŕ";
  var radic = "√";
  var raemptyv = "⦳";
  var rang = "⟩";
  var Rang = "⟫";
  var rangd = "⦒";
  var range = "⦥";
  var rangle = "⟩";
  var raquo = "»";
  var rarrap = "⥵";
  var rarrb = "⇥";
  var rarrbfs = "⤠";
  var rarrc = "⤳";
  var rarr = "→";
  var Rarr = "↠";
  var rArr = "⇒";
  var rarrfs = "⤞";
  var rarrhk = "↪";
  var rarrlp = "↬";
  var rarrpl = "⥅";
  var rarrsim = "⥴";
  var Rarrtl = "⤖";
  var rarrtl = "↣";
  var rarrw = "↝";
  var ratail = "⤚";
  var rAtail = "⤜";
  var ratio = "∶";
  var rationals = "ℚ";
  var rbarr = "⤍";
  var rBarr = "⤏";
  var RBarr = "⤐";
  var rbbrk = "❳";
  var rbrace = "}";
  var rbrack = "]";
  var rbrke = "⦌";
  var rbrksld = "⦎";
  var rbrkslu = "⦐";
  var Rcaron = "Ř";
  var rcaron = "ř";
  var Rcedil = "Ŗ";
  var rcedil = "ŗ";
  var rceil = "⌉";
  var rcub = "}";
  var Rcy = "Р";
  var rcy = "р";
  var rdca = "⤷";
  var rdldhar = "⥩";
  var rdquo = "”";
  var rdquor = "”";
  var rdsh = "↳";
  var real = "ℜ";
  var realine = "ℛ";
  var realpart = "ℜ";
  var reals = "ℝ";
  var Re = "ℜ";
  var rect = "▭";
  var reg = "®";
  var REG = "®";
  var ReverseElement = "∋";
  var ReverseEquilibrium = "⇋";
  var ReverseUpEquilibrium = "⥯";
  var rfisht = "⥽";
  var rfloor = "⌋";
  var rfr = "𝔯";
  var Rfr = "ℜ";
  var rHar = "⥤";
  var rhard = "⇁";
  var rharu = "⇀";
  var rharul = "⥬";
  var Rho = "Ρ";
  var rho = "ρ";
  var rhov = "ϱ";
  var RightAngleBracket = "⟩";
  var RightArrowBar = "⇥";
  var rightarrow = "→";
  var RightArrow = "→";
  var Rightarrow = "⇒";
  var RightArrowLeftArrow = "⇄";
  var rightarrowtail = "↣";
  var RightCeiling = "⌉";
  var RightDoubleBracket = "⟧";
  var RightDownTeeVector = "⥝";
  var RightDownVectorBar = "⥕";
  var RightDownVector = "⇂";
  var RightFloor = "⌋";
  var rightharpoondown = "⇁";
  var rightharpoonup = "⇀";
  var rightleftarrows = "⇄";
  var rightleftharpoons = "⇌";
  var rightrightarrows = "⇉";
  var rightsquigarrow = "↝";
  var RightTeeArrow = "↦";
  var RightTee = "⊢";
  var RightTeeVector = "⥛";
  var rightthreetimes = "⋌";
  var RightTriangleBar = "⧐";
  var RightTriangle = "⊳";
  var RightTriangleEqual = "⊵";
  var RightUpDownVector = "⥏";
  var RightUpTeeVector = "⥜";
  var RightUpVectorBar = "⥔";
  var RightUpVector = "↾";
  var RightVectorBar = "⥓";
  var RightVector = "⇀";
  var ring = "˚";
  var risingdotseq = "≓";
  var rlarr = "⇄";
  var rlhar = "⇌";
  var rlm = "‏";
  var rmoustache = "⎱";
  var rmoust = "⎱";
  var rnmid = "⫮";
  var roang = "⟭";
  var roarr = "⇾";
  var robrk = "⟧";
  var ropar = "⦆";
  var ropf = "𝕣";
  var Ropf = "ℝ";
  var roplus = "⨮";
  var rotimes = "⨵";
  var RoundImplies = "⥰";
  var rpar = ")";
  var rpargt = "⦔";
  var rppolint = "⨒";
  var rrarr = "⇉";
  var Rrightarrow = "⇛";
  var rsaquo = "›";
  var rscr = "𝓇";
  var Rscr = "ℛ";
  var rsh = "↱";
  var Rsh = "↱";
  var rsqb = "]";
  var rsquo = "’";
  var rsquor = "’";
  var rthree = "⋌";
  var rtimes = "⋊";
  var rtri = "▹";
  var rtrie = "⊵";
  var rtrif = "▸";
  var rtriltri = "⧎";
  var RuleDelayed = "⧴";
  var ruluhar = "⥨";
  var rx = "℞";
  var Sacute = "Ś";
  var sacute = "ś";
  var sbquo = "‚";
  var scap = "⪸";
  var Scaron = "Š";
  var scaron = "š";
  var Sc = "⪼";
  var sc = "≻";
  var sccue = "≽";
  var sce = "⪰";
  var scE = "⪴";
  var Scedil = "Ş";
  var scedil = "ş";
  var Scirc = "Ŝ";
  var scirc = "ŝ";
  var scnap = "⪺";
  var scnE = "⪶";
  var scnsim = "⋩";
  var scpolint = "⨓";
  var scsim = "≿";
  var Scy = "С";
  var scy = "с";
  var sdotb = "⊡";
  var sdot = "⋅";
  var sdote = "⩦";
  var searhk = "⤥";
  var searr = "↘";
  var seArr = "⇘";
  var searrow = "↘";
  var sect = "§";
  var semi = ";";
  var seswar = "⤩";
  var setminus = "∖";
  var setmn = "∖";
  var sext = "✶";
  var Sfr = "𝔖";
  var sfr = "𝔰";
  var sfrown = "⌢";
  var sharp = "♯";
  var SHCHcy = "Щ";
  var shchcy = "щ";
  var SHcy = "Ш";
  var shcy = "ш";
  var ShortDownArrow = "↓";
  var ShortLeftArrow = "←";
  var shortmid = "∣";
  var shortparallel = "∥";
  var ShortRightArrow = "→";
  var ShortUpArrow = "↑";
  var shy = "­";
  var Sigma = "Σ";
  var sigma = "σ";
  var sigmaf = "ς";
  var sigmav = "ς";
  var sim = "∼";
  var simdot = "⩪";
  var sime = "≃";
  var simeq = "≃";
  var simg = "⪞";
  var simgE = "⪠";
  var siml = "⪝";
  var simlE = "⪟";
  var simne = "≆";
  var simplus = "⨤";
  var simrarr = "⥲";
  var slarr = "←";
  var SmallCircle = "∘";
  var smallsetminus = "∖";
  var smashp = "⨳";
  var smeparsl = "⧤";
  var smid = "∣";
  var smile = "⌣";
  var smt = "⪪";
  var smte = "⪬";
  var smtes = "⪬︀";
  var SOFTcy = "Ь";
  var softcy = "ь";
  var solbar = "⌿";
  var solb = "⧄";
  var sol = "/";
  var Sopf = "𝕊";
  var sopf = "𝕤";
  var spades = "♠";
  var spadesuit = "♠";
  var spar = "∥";
  var sqcap = "⊓";
  var sqcaps = "⊓︀";
  var sqcup = "⊔";
  var sqcups = "⊔︀";
  var Sqrt = "√";
  var sqsub = "⊏";
  var sqsube = "⊑";
  var sqsubset = "⊏";
  var sqsubseteq = "⊑";
  var sqsup = "⊐";
  var sqsupe = "⊒";
  var sqsupset = "⊐";
  var sqsupseteq = "⊒";
  var square = "□";
  var Square = "□";
  var SquareIntersection = "⊓";
  var SquareSubset = "⊏";
  var SquareSubsetEqual = "⊑";
  var SquareSuperset = "⊐";
  var SquareSupersetEqual = "⊒";
  var SquareUnion = "⊔";
  var squarf = "▪";
  var squ = "□";
  var squf = "▪";
  var srarr = "→";
  var Sscr = "𝒮";
  var sscr = "𝓈";
  var ssetmn = "∖";
  var ssmile = "⌣";
  var sstarf = "⋆";
  var Star = "⋆";
  var star = "☆";
  var starf = "★";
  var straightepsilon = "ϵ";
  var straightphi = "ϕ";
  var strns = "¯";
  var sub = "⊂";
  var Sub = "⋐";
  var subdot = "⪽";
  var subE = "⫅";
  var sube = "⊆";
  var subedot = "⫃";
  var submult = "⫁";
  var subnE = "⫋";
  var subne = "⊊";
  var subplus = "⪿";
  var subrarr = "⥹";
  var subset = "⊂";
  var Subset = "⋐";
  var subseteq = "⊆";
  var subseteqq = "⫅";
  var SubsetEqual = "⊆";
  var subsetneq = "⊊";
  var subsetneqq = "⫋";
  var subsim = "⫇";
  var subsub = "⫕";
  var subsup = "⫓";
  var succapprox = "⪸";
  var succ = "≻";
  var succcurlyeq = "≽";
  var Succeeds = "≻";
  var SucceedsEqual = "⪰";
  var SucceedsSlantEqual = "≽";
  var SucceedsTilde = "≿";
  var succeq = "⪰";
  var succnapprox = "⪺";
  var succneqq = "⪶";
  var succnsim = "⋩";
  var succsim = "≿";
  var SuchThat = "∋";
  var sum = "∑";
  var Sum = "∑";
  var sung = "♪";
  var sup1 = "¹";
  var sup2 = "²";
  var sup3 = "³";
  var sup = "⊃";
  var Sup = "⋑";
  var supdot = "⪾";
  var supdsub = "⫘";
  var supE = "⫆";
  var supe = "⊇";
  var supedot = "⫄";
  var Superset = "⊃";
  var SupersetEqual = "⊇";
  var suphsol = "⟉";
  var suphsub = "⫗";
  var suplarr = "⥻";
  var supmult = "⫂";
  var supnE = "⫌";
  var supne = "⊋";
  var supplus = "⫀";
  var supset = "⊃";
  var Supset = "⋑";
  var supseteq = "⊇";
  var supseteqq = "⫆";
  var supsetneq = "⊋";
  var supsetneqq = "⫌";
  var supsim = "⫈";
  var supsub = "⫔";
  var supsup = "⫖";
  var swarhk = "⤦";
  var swarr = "↙";
  var swArr = "⇙";
  var swarrow = "↙";
  var swnwar = "⤪";
  var szlig = "ß";
  var Tab = "\t";
  var target = "⌖";
  var Tau = "Τ";
  var tau = "τ";
  var tbrk = "⎴";
  var Tcaron = "Ť";
  var tcaron = "ť";
  var Tcedil = "Ţ";
  var tcedil = "ţ";
  var Tcy = "Т";
  var tcy = "т";
  var tdot = "⃛";
  var telrec = "⌕";
  var Tfr = "𝔗";
  var tfr = "𝔱";
  var there4 = "∴";
  var therefore = "∴";
  var Therefore = "∴";
  var Theta = "Θ";
  var theta = "θ";
  var thetasym = "ϑ";
  var thetav = "ϑ";
  var thickapprox = "≈";
  var thicksim = "∼";
  var ThickSpace = "  ";
  var ThinSpace = " ";
  var thinsp = " ";
  var thkap = "≈";
  var thksim = "∼";
  var THORN = "Þ";
  var thorn = "þ";
  var tilde = "˜";
  var Tilde = "∼";
  var TildeEqual = "≃";
  var TildeFullEqual = "≅";
  var TildeTilde = "≈";
  var timesbar = "⨱";
  var timesb = "⊠";
  var times = "×";
  var timesd = "⨰";
  var tint = "∭";
  var toea = "⤨";
  var topbot = "⌶";
  var topcir = "⫱";
  var top = "⊤";
  var Topf = "𝕋";
  var topf = "𝕥";
  var topfork = "⫚";
  var tosa = "⤩";
  var tprime = "‴";
  var trade = "™";
  var TRADE = "™";
  var triangle = "▵";
  var triangledown = "▿";
  var triangleleft = "◃";
  var trianglelefteq = "⊴";
  var triangleq = "≜";
  var triangleright = "▹";
  var trianglerighteq = "⊵";
  var tridot = "◬";
  var trie = "≜";
  var triminus = "⨺";
  var TripleDot = "⃛";
  var triplus = "⨹";
  var trisb = "⧍";
  var tritime = "⨻";
  var trpezium = "⏢";
  var Tscr = "𝒯";
  var tscr = "𝓉";
  var TScy = "Ц";
  var tscy = "ц";
  var TSHcy = "Ћ";
  var tshcy = "ћ";
  var Tstrok = "Ŧ";
  var tstrok = "ŧ";
  var twixt = "≬";
  var twoheadleftarrow = "↞";
  var twoheadrightarrow = "↠";
  var Uacute = "Ú";
  var uacute = "ú";
  var uarr = "↑";
  var Uarr = "↟";
  var uArr = "⇑";
  var Uarrocir = "⥉";
  var Ubrcy = "Ў";
  var ubrcy = "ў";
  var Ubreve = "Ŭ";
  var ubreve = "ŭ";
  var Ucirc = "Û";
  var ucirc = "û";
  var Ucy = "У";
  var ucy = "у";
  var udarr = "⇅";
  var Udblac = "Ű";
  var udblac = "ű";
  var udhar = "⥮";
  var ufisht = "⥾";
  var Ufr = "𝔘";
  var ufr = "𝔲";
  var Ugrave = "Ù";
  var ugrave = "ù";
  var uHar = "⥣";
  var uharl = "↿";
  var uharr = "↾";
  var uhblk = "▀";
  var ulcorn = "⌜";
  var ulcorner = "⌜";
  var ulcrop = "⌏";
  var ultri = "◸";
  var Umacr = "Ū";
  var umacr = "ū";
  var uml = "¨";
  var UnderBar = "_";
  var UnderBrace = "⏟";
  var UnderBracket = "⎵";
  var UnderParenthesis = "⏝";
  var Union = "⋃";
  var UnionPlus = "⊎";
  var Uogon = "Ų";
  var uogon = "ų";
  var Uopf = "𝕌";
  var uopf = "𝕦";
  var UpArrowBar = "⤒";
  var uparrow = "↑";
  var UpArrow = "↑";
  var Uparrow = "⇑";
  var UpArrowDownArrow = "⇅";
  var updownarrow = "↕";
  var UpDownArrow = "↕";
  var Updownarrow = "⇕";
  var UpEquilibrium = "⥮";
  var upharpoonleft = "↿";
  var upharpoonright = "↾";
  var uplus = "⊎";
  var UpperLeftArrow = "↖";
  var UpperRightArrow = "↗";
  var upsi = "υ";
  var Upsi = "ϒ";
  var upsih = "ϒ";
  var Upsilon = "Υ";
  var upsilon = "υ";
  var UpTeeArrow = "↥";
  var UpTee = "⊥";
  var upuparrows = "⇈";
  var urcorn = "⌝";
  var urcorner = "⌝";
  var urcrop = "⌎";
  var Uring = "Ů";
  var uring = "ů";
  var urtri = "◹";
  var Uscr = "𝒰";
  var uscr = "𝓊";
  var utdot = "⋰";
  var Utilde = "Ũ";
  var utilde = "ũ";
  var utri = "▵";
  var utrif = "▴";
  var uuarr = "⇈";
  var Uuml = "Ü";
  var uuml = "ü";
  var uwangle = "⦧";
  var vangrt = "⦜";
  var varepsilon = "ϵ";
  var varkappa = "ϰ";
  var varnothing = "∅";
  var varphi = "ϕ";
  var varpi = "ϖ";
  var varpropto = "∝";
  var varr = "↕";
  var vArr = "⇕";
  var varrho = "ϱ";
  var varsigma = "ς";
  var varsubsetneq = "⊊︀";
  var varsubsetneqq = "⫋︀";
  var varsupsetneq = "⊋︀";
  var varsupsetneqq = "⫌︀";
  var vartheta = "ϑ";
  var vartriangleleft = "⊲";
  var vartriangleright = "⊳";
  var vBar = "⫨";
  var Vbar = "⫫";
  var vBarv = "⫩";
  var Vcy = "В";
  var vcy = "в";
  var vdash = "⊢";
  var vDash = "⊨";
  var Vdash = "⊩";
  var VDash = "⊫";
  var Vdashl = "⫦";
  var veebar = "⊻";
  var vee = "∨";
  var Vee = "⋁";
  var veeeq = "≚";
  var vellip = "⋮";
  var verbar = "|";
  var Verbar = "‖";
  var vert = "|";
  var Vert = "‖";
  var VerticalBar = "∣";
  var VerticalLine = "|";
  var VerticalSeparator = "❘";
  var VerticalTilde = "≀";
  var VeryThinSpace = " ";
  var Vfr = "𝔙";
  var vfr = "𝔳";
  var vltri = "⊲";
  var vnsub = "⊂⃒";
  var vnsup = "⊃⃒";
  var Vopf = "𝕍";
  var vopf = "𝕧";
  var vprop = "∝";
  var vrtri = "⊳";
  var Vscr = "𝒱";
  var vscr = "𝓋";
  var vsubnE = "⫋︀";
  var vsubne = "⊊︀";
  var vsupnE = "⫌︀";
  var vsupne = "⊋︀";
  var Vvdash = "⊪";
  var vzigzag = "⦚";
  var Wcirc = "Ŵ";
  var wcirc = "ŵ";
  var wedbar = "⩟";
  var wedge = "∧";
  var Wedge = "⋀";
  var wedgeq = "≙";
  var weierp = "℘";
  var Wfr = "𝔚";
  var wfr = "𝔴";
  var Wopf = "𝕎";
  var wopf = "𝕨";
  var wp = "℘";
  var wr = "≀";
  var wreath = "≀";
  var Wscr = "𝒲";
  var wscr = "𝓌";
  var xcap = "⋂";
  var xcirc = "◯";
  var xcup = "⋃";
  var xdtri = "▽";
  var Xfr = "𝔛";
  var xfr = "𝔵";
  var xharr = "⟷";
  var xhArr = "⟺";
  var Xi = "Ξ";
  var xi = "ξ";
  var xlarr = "⟵";
  var xlArr = "⟸";
  var xmap = "⟼";
  var xnis = "⋻";
  var xodot = "⨀";
  var Xopf = "𝕏";
  var xopf = "𝕩";
  var xoplus = "⨁";
  var xotime = "⨂";
  var xrarr = "⟶";
  var xrArr = "⟹";
  var Xscr = "𝒳";
  var xscr = "𝓍";
  var xsqcup = "⨆";
  var xuplus = "⨄";
  var xutri = "△";
  var xvee = "⋁";
  var xwedge = "⋀";
  var Yacute = "Ý";
  var yacute = "ý";
  var YAcy = "Я";
  var yacy = "я";
  var Ycirc = "Ŷ";
  var ycirc = "ŷ";
  var Ycy = "Ы";
  var ycy = "ы";
  var yen = "¥";
  var Yfr = "𝔜";
  var yfr = "𝔶";
  var YIcy = "Ї";
  var yicy = "ї";
  var Yopf = "𝕐";
  var yopf = "𝕪";
  var Yscr = "𝒴";
  var yscr = "𝓎";
  var YUcy = "Ю";
  var yucy = "ю";
  var yuml = "ÿ";
  var Yuml = "Ÿ";
  var Zacute = "Ź";
  var zacute = "ź";
  var Zcaron = "Ž";
  var zcaron = "ž";
  var Zcy = "З";
  var zcy = "з";
  var Zdot = "Ż";
  var zdot = "ż";
  var zeetrf = "ℨ";
  var ZeroWidthSpace = "​";
  var Zeta = "Ζ";
  var zeta = "ζ";
  var zfr = "𝔷";
  var Zfr = "ℨ";
  var ZHcy = "Ж";
  var zhcy = "ж";
  var zigrarr = "⇝";
  var zopf = "𝕫";
  var Zopf = "ℤ";
  var Zscr = "𝒵";
  var zscr = "𝓏";
  var zwj = "‍";
  var zwnj = "‌";
  var entitiesJSON = {
  	Aacute: Aacute,
  	aacute: aacute,
  	Abreve: Abreve,
  	abreve: abreve,
  	ac: ac,
  	acd: acd,
  	acE: acE,
  	Acirc: Acirc,
  	acirc: acirc,
  	acute: acute,
  	Acy: Acy,
  	acy: acy,
  	AElig: AElig,
  	aelig: aelig,
  	af: af,
  	Afr: Afr,
  	afr: afr,
  	Agrave: Agrave,
  	agrave: agrave,
  	alefsym: alefsym,
  	aleph: aleph,
  	Alpha: Alpha,
  	alpha: alpha,
  	Amacr: Amacr,
  	amacr: amacr,
  	amalg: amalg,
  	amp: amp$1,
  	AMP: AMP,
  	andand: andand,
  	And: And,
  	and: and,
  	andd: andd,
  	andslope: andslope,
  	andv: andv,
  	ang: ang,
  	ange: ange,
  	angle: angle,
  	angmsdaa: angmsdaa,
  	angmsdab: angmsdab,
  	angmsdac: angmsdac,
  	angmsdad: angmsdad,
  	angmsdae: angmsdae,
  	angmsdaf: angmsdaf,
  	angmsdag: angmsdag,
  	angmsdah: angmsdah,
  	angmsd: angmsd,
  	angrt: angrt,
  	angrtvb: angrtvb,
  	angrtvbd: angrtvbd,
  	angsph: angsph,
  	angst: angst,
  	angzarr: angzarr,
  	Aogon: Aogon,
  	aogon: aogon,
  	Aopf: Aopf,
  	aopf: aopf,
  	apacir: apacir,
  	ap: ap,
  	apE: apE,
  	ape: ape,
  	apid: apid,
  	apos: apos$1,
  	ApplyFunction: ApplyFunction,
  	approx: approx,
  	approxeq: approxeq,
  	Aring: Aring,
  	aring: aring,
  	Ascr: Ascr,
  	ascr: ascr,
  	Assign: Assign,
  	ast: ast,
  	asymp: asymp,
  	asympeq: asympeq,
  	Atilde: Atilde,
  	atilde: atilde,
  	Auml: Auml,
  	auml: auml,
  	awconint: awconint,
  	awint: awint,
  	backcong: backcong,
  	backepsilon: backepsilon,
  	backprime: backprime,
  	backsim: backsim,
  	backsimeq: backsimeq,
  	Backslash: Backslash,
  	Barv: Barv,
  	barvee: barvee,
  	barwed: barwed,
  	Barwed: Barwed,
  	barwedge: barwedge,
  	bbrk: bbrk,
  	bbrktbrk: bbrktbrk,
  	bcong: bcong,
  	Bcy: Bcy,
  	bcy: bcy,
  	bdquo: bdquo,
  	becaus: becaus,
  	because: because,
  	Because: Because,
  	bemptyv: bemptyv,
  	bepsi: bepsi,
  	bernou: bernou,
  	Bernoullis: Bernoullis,
  	Beta: Beta,
  	beta: beta,
  	beth: beth,
  	between: between,
  	Bfr: Bfr,
  	bfr: bfr,
  	bigcap: bigcap,
  	bigcirc: bigcirc,
  	bigcup: bigcup,
  	bigodot: bigodot,
  	bigoplus: bigoplus,
  	bigotimes: bigotimes,
  	bigsqcup: bigsqcup,
  	bigstar: bigstar,
  	bigtriangledown: bigtriangledown,
  	bigtriangleup: bigtriangleup,
  	biguplus: biguplus,
  	bigvee: bigvee,
  	bigwedge: bigwedge,
  	bkarow: bkarow,
  	blacklozenge: blacklozenge,
  	blacksquare: blacksquare,
  	blacktriangle: blacktriangle,
  	blacktriangledown: blacktriangledown,
  	blacktriangleleft: blacktriangleleft,
  	blacktriangleright: blacktriangleright,
  	blank: blank,
  	blk12: blk12,
  	blk14: blk14,
  	blk34: blk34,
  	block: block,
  	bne: bne,
  	bnequiv: bnequiv,
  	bNot: bNot,
  	bnot: bnot,
  	Bopf: Bopf,
  	bopf: bopf,
  	bot: bot,
  	bottom: bottom,
  	bowtie: bowtie,
  	boxbox: boxbox,
  	boxdl: boxdl,
  	boxdL: boxdL,
  	boxDl: boxDl,
  	boxDL: boxDL,
  	boxdr: boxdr,
  	boxdR: boxdR,
  	boxDr: boxDr,
  	boxDR: boxDR,
  	boxh: boxh,
  	boxH: boxH,
  	boxhd: boxhd,
  	boxHd: boxHd,
  	boxhD: boxhD,
  	boxHD: boxHD,
  	boxhu: boxhu,
  	boxHu: boxHu,
  	boxhU: boxhU,
  	boxHU: boxHU,
  	boxminus: boxminus,
  	boxplus: boxplus,
  	boxtimes: boxtimes,
  	boxul: boxul,
  	boxuL: boxuL,
  	boxUl: boxUl,
  	boxUL: boxUL,
  	boxur: boxur,
  	boxuR: boxuR,
  	boxUr: boxUr,
  	boxUR: boxUR,
  	boxv: boxv,
  	boxV: boxV,
  	boxvh: boxvh,
  	boxvH: boxvH,
  	boxVh: boxVh,
  	boxVH: boxVH,
  	boxvl: boxvl,
  	boxvL: boxvL,
  	boxVl: boxVl,
  	boxVL: boxVL,
  	boxvr: boxvr,
  	boxvR: boxvR,
  	boxVr: boxVr,
  	boxVR: boxVR,
  	bprime: bprime,
  	breve: breve,
  	Breve: Breve,
  	brvbar: brvbar,
  	bscr: bscr,
  	Bscr: Bscr,
  	bsemi: bsemi,
  	bsim: bsim,
  	bsime: bsime,
  	bsolb: bsolb,
  	bsol: bsol,
  	bsolhsub: bsolhsub,
  	bull: bull,
  	bullet: bullet,
  	bump: bump,
  	bumpE: bumpE,
  	bumpe: bumpe,
  	Bumpeq: Bumpeq,
  	bumpeq: bumpeq,
  	Cacute: Cacute,
  	cacute: cacute,
  	capand: capand,
  	capbrcup: capbrcup,
  	capcap: capcap,
  	cap: cap,
  	Cap: Cap,
  	capcup: capcup,
  	capdot: capdot,
  	CapitalDifferentialD: CapitalDifferentialD,
  	caps: caps,
  	caret: caret,
  	caron: caron,
  	Cayleys: Cayleys,
  	ccaps: ccaps,
  	Ccaron: Ccaron,
  	ccaron: ccaron,
  	Ccedil: Ccedil,
  	ccedil: ccedil,
  	Ccirc: Ccirc,
  	ccirc: ccirc,
  	Cconint: Cconint,
  	ccups: ccups,
  	ccupssm: ccupssm,
  	Cdot: Cdot,
  	cdot: cdot,
  	cedil: cedil,
  	Cedilla: Cedilla,
  	cemptyv: cemptyv,
  	cent: cent,
  	centerdot: centerdot,
  	CenterDot: CenterDot,
  	cfr: cfr,
  	Cfr: Cfr,
  	CHcy: CHcy,
  	chcy: chcy,
  	check: check,
  	checkmark: checkmark,
  	Chi: Chi,
  	chi: chi,
  	circ: circ,
  	circeq: circeq,
  	circlearrowleft: circlearrowleft,
  	circlearrowright: circlearrowright,
  	circledast: circledast,
  	circledcirc: circledcirc,
  	circleddash: circleddash,
  	CircleDot: CircleDot,
  	circledR: circledR,
  	circledS: circledS,
  	CircleMinus: CircleMinus,
  	CirclePlus: CirclePlus,
  	CircleTimes: CircleTimes,
  	cir: cir,
  	cirE: cirE,
  	cire: cire,
  	cirfnint: cirfnint,
  	cirmid: cirmid,
  	cirscir: cirscir,
  	ClockwiseContourIntegral: ClockwiseContourIntegral,
  	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
  	CloseCurlyQuote: CloseCurlyQuote,
  	clubs: clubs,
  	clubsuit: clubsuit,
  	colon: colon,
  	Colon: Colon,
  	Colone: Colone,
  	colone: colone,
  	coloneq: coloneq,
  	comma: comma,
  	commat: commat,
  	comp: comp,
  	compfn: compfn,
  	complement: complement,
  	complexes: complexes,
  	cong: cong,
  	congdot: congdot,
  	Congruent: Congruent,
  	conint: conint,
  	Conint: Conint,
  	ContourIntegral: ContourIntegral,
  	copf: copf,
  	Copf: Copf,
  	coprod: coprod,
  	Coproduct: Coproduct,
  	copy: copy,
  	COPY: COPY,
  	copysr: copysr,
  	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
  	crarr: crarr,
  	cross: cross,
  	Cross: Cross,
  	Cscr: Cscr,
  	cscr: cscr,
  	csub: csub,
  	csube: csube,
  	csup: csup,
  	csupe: csupe,
  	ctdot: ctdot,
  	cudarrl: cudarrl,
  	cudarrr: cudarrr,
  	cuepr: cuepr,
  	cuesc: cuesc,
  	cularr: cularr,
  	cularrp: cularrp,
  	cupbrcap: cupbrcap,
  	cupcap: cupcap,
  	CupCap: CupCap,
  	cup: cup,
  	Cup: Cup,
  	cupcup: cupcup,
  	cupdot: cupdot,
  	cupor: cupor,
  	cups: cups,
  	curarr: curarr,
  	curarrm: curarrm,
  	curlyeqprec: curlyeqprec,
  	curlyeqsucc: curlyeqsucc,
  	curlyvee: curlyvee,
  	curlywedge: curlywedge,
  	curren: curren,
  	curvearrowleft: curvearrowleft,
  	curvearrowright: curvearrowright,
  	cuvee: cuvee,
  	cuwed: cuwed,
  	cwconint: cwconint,
  	cwint: cwint,
  	cylcty: cylcty,
  	dagger: dagger,
  	Dagger: Dagger,
  	daleth: daleth,
  	darr: darr,
  	Darr: Darr,
  	dArr: dArr,
  	dash: dash,
  	Dashv: Dashv,
  	dashv: dashv,
  	dbkarow: dbkarow,
  	dblac: dblac,
  	Dcaron: Dcaron,
  	dcaron: dcaron,
  	Dcy: Dcy,
  	dcy: dcy,
  	ddagger: ddagger,
  	ddarr: ddarr,
  	DD: DD,
  	dd: dd,
  	DDotrahd: DDotrahd,
  	ddotseq: ddotseq,
  	deg: deg,
  	Del: Del,
  	Delta: Delta,
  	delta: delta,
  	demptyv: demptyv,
  	dfisht: dfisht,
  	Dfr: Dfr,
  	dfr: dfr,
  	dHar: dHar,
  	dharl: dharl,
  	dharr: dharr,
  	DiacriticalAcute: DiacriticalAcute,
  	DiacriticalDot: DiacriticalDot,
  	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
  	DiacriticalGrave: DiacriticalGrave,
  	DiacriticalTilde: DiacriticalTilde,
  	diam: diam,
  	diamond: diamond,
  	Diamond: Diamond,
  	diamondsuit: diamondsuit,
  	diams: diams,
  	die: die,
  	DifferentialD: DifferentialD,
  	digamma: digamma,
  	disin: disin,
  	div: div,
  	divide: divide,
  	divideontimes: divideontimes,
  	divonx: divonx,
  	DJcy: DJcy,
  	djcy: djcy,
  	dlcorn: dlcorn,
  	dlcrop: dlcrop,
  	dollar: dollar,
  	Dopf: Dopf,
  	dopf: dopf,
  	Dot: Dot,
  	dot: dot,
  	DotDot: DotDot,
  	doteq: doteq,
  	doteqdot: doteqdot,
  	DotEqual: DotEqual,
  	dotminus: dotminus,
  	dotplus: dotplus,
  	dotsquare: dotsquare,
  	doublebarwedge: doublebarwedge,
  	DoubleContourIntegral: DoubleContourIntegral,
  	DoubleDot: DoubleDot,
  	DoubleDownArrow: DoubleDownArrow,
  	DoubleLeftArrow: DoubleLeftArrow,
  	DoubleLeftRightArrow: DoubleLeftRightArrow,
  	DoubleLeftTee: DoubleLeftTee,
  	DoubleLongLeftArrow: DoubleLongLeftArrow,
  	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
  	DoubleLongRightArrow: DoubleLongRightArrow,
  	DoubleRightArrow: DoubleRightArrow,
  	DoubleRightTee: DoubleRightTee,
  	DoubleUpArrow: DoubleUpArrow,
  	DoubleUpDownArrow: DoubleUpDownArrow,
  	DoubleVerticalBar: DoubleVerticalBar,
  	DownArrowBar: DownArrowBar,
  	downarrow: downarrow,
  	DownArrow: DownArrow,
  	Downarrow: Downarrow,
  	DownArrowUpArrow: DownArrowUpArrow,
  	DownBreve: DownBreve,
  	downdownarrows: downdownarrows,
  	downharpoonleft: downharpoonleft,
  	downharpoonright: downharpoonright,
  	DownLeftRightVector: DownLeftRightVector,
  	DownLeftTeeVector: DownLeftTeeVector,
  	DownLeftVectorBar: DownLeftVectorBar,
  	DownLeftVector: DownLeftVector,
  	DownRightTeeVector: DownRightTeeVector,
  	DownRightVectorBar: DownRightVectorBar,
  	DownRightVector: DownRightVector,
  	DownTeeArrow: DownTeeArrow,
  	DownTee: DownTee,
  	drbkarow: drbkarow,
  	drcorn: drcorn,
  	drcrop: drcrop,
  	Dscr: Dscr,
  	dscr: dscr,
  	DScy: DScy,
  	dscy: dscy,
  	dsol: dsol,
  	Dstrok: Dstrok,
  	dstrok: dstrok,
  	dtdot: dtdot,
  	dtri: dtri,
  	dtrif: dtrif,
  	duarr: duarr,
  	duhar: duhar,
  	dwangle: dwangle,
  	DZcy: DZcy,
  	dzcy: dzcy,
  	dzigrarr: dzigrarr,
  	Eacute: Eacute,
  	eacute: eacute,
  	easter: easter,
  	Ecaron: Ecaron,
  	ecaron: ecaron,
  	Ecirc: Ecirc,
  	ecirc: ecirc,
  	ecir: ecir,
  	ecolon: ecolon,
  	Ecy: Ecy,
  	ecy: ecy,
  	eDDot: eDDot,
  	Edot: Edot,
  	edot: edot,
  	eDot: eDot,
  	ee: ee,
  	efDot: efDot,
  	Efr: Efr,
  	efr: efr,
  	eg: eg,
  	Egrave: Egrave,
  	egrave: egrave,
  	egs: egs,
  	egsdot: egsdot,
  	el: el,
  	Element: Element,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	Emacr: Emacr,
  	emacr: emacr,
  	empty: empty,
  	emptyset: emptyset,
  	EmptySmallSquare: EmptySmallSquare,
  	emptyv: emptyv,
  	EmptyVerySmallSquare: EmptyVerySmallSquare,
  	emsp13: emsp13,
  	emsp14: emsp14,
  	emsp: emsp,
  	ENG: ENG,
  	eng: eng,
  	ensp: ensp,
  	Eogon: Eogon,
  	eogon: eogon,
  	Eopf: Eopf,
  	eopf: eopf,
  	epar: epar,
  	eparsl: eparsl,
  	eplus: eplus,
  	epsi: epsi,
  	Epsilon: Epsilon,
  	epsilon: epsilon,
  	epsiv: epsiv,
  	eqcirc: eqcirc,
  	eqcolon: eqcolon,
  	eqsim: eqsim,
  	eqslantgtr: eqslantgtr,
  	eqslantless: eqslantless,
  	Equal: Equal,
  	equals: equals,
  	EqualTilde: EqualTilde,
  	equest: equest,
  	Equilibrium: Equilibrium,
  	equiv: equiv,
  	equivDD: equivDD,
  	eqvparsl: eqvparsl,
  	erarr: erarr,
  	erDot: erDot,
  	escr: escr,
  	Escr: Escr,
  	esdot: esdot,
  	Esim: Esim,
  	esim: esim,
  	Eta: Eta,
  	eta: eta,
  	ETH: ETH,
  	eth: eth,
  	Euml: Euml,
  	euml: euml,
  	euro: euro,
  	excl: excl,
  	exist: exist,
  	Exists: Exists,
  	expectation: expectation,
  	exponentiale: exponentiale,
  	ExponentialE: ExponentialE,
  	fallingdotseq: fallingdotseq,
  	Fcy: Fcy,
  	fcy: fcy,
  	female: female,
  	ffilig: ffilig,
  	fflig: fflig,
  	ffllig: ffllig,
  	Ffr: Ffr,
  	ffr: ffr,
  	filig: filig,
  	FilledSmallSquare: FilledSmallSquare,
  	FilledVerySmallSquare: FilledVerySmallSquare,
  	fjlig: fjlig,
  	flat: flat,
  	fllig: fllig,
  	fltns: fltns,
  	fnof: fnof,
  	Fopf: Fopf,
  	fopf: fopf,
  	forall: forall,
  	ForAll: ForAll,
  	fork: fork,
  	forkv: forkv,
  	Fouriertrf: Fouriertrf,
  	fpartint: fpartint,
  	frac12: frac12,
  	frac13: frac13,
  	frac14: frac14,
  	frac15: frac15,
  	frac16: frac16,
  	frac18: frac18,
  	frac23: frac23,
  	frac25: frac25,
  	frac34: frac34,
  	frac35: frac35,
  	frac38: frac38,
  	frac45: frac45,
  	frac56: frac56,
  	frac58: frac58,
  	frac78: frac78,
  	frasl: frasl,
  	frown: frown,
  	fscr: fscr,
  	Fscr: Fscr,
  	gacute: gacute,
  	Gamma: Gamma,
  	gamma: gamma,
  	Gammad: Gammad,
  	gammad: gammad,
  	gap: gap,
  	Gbreve: Gbreve,
  	gbreve: gbreve,
  	Gcedil: Gcedil,
  	Gcirc: Gcirc,
  	gcirc: gcirc,
  	Gcy: Gcy,
  	gcy: gcy,
  	Gdot: Gdot,
  	gdot: gdot,
  	ge: ge,
  	gE: gE,
  	gEl: gEl,
  	gel: gel,
  	geq: geq,
  	geqq: geqq,
  	geqslant: geqslant,
  	gescc: gescc,
  	ges: ges,
  	gesdot: gesdot,
  	gesdoto: gesdoto,
  	gesdotol: gesdotol,
  	gesl: gesl,
  	gesles: gesles,
  	Gfr: Gfr,
  	gfr: gfr,
  	gg: gg,
  	Gg: Gg,
  	ggg: ggg,
  	gimel: gimel,
  	GJcy: GJcy,
  	gjcy: gjcy,
  	gla: gla,
  	gl: gl,
  	glE: glE,
  	glj: glj,
  	gnap: gnap,
  	gnapprox: gnapprox,
  	gne: gne,
  	gnE: gnE,
  	gneq: gneq,
  	gneqq: gneqq,
  	gnsim: gnsim,
  	Gopf: Gopf,
  	gopf: gopf,
  	grave: grave,
  	GreaterEqual: GreaterEqual,
  	GreaterEqualLess: GreaterEqualLess,
  	GreaterFullEqual: GreaterFullEqual,
  	GreaterGreater: GreaterGreater,
  	GreaterLess: GreaterLess,
  	GreaterSlantEqual: GreaterSlantEqual,
  	GreaterTilde: GreaterTilde,
  	Gscr: Gscr,
  	gscr: gscr,
  	gsim: gsim,
  	gsime: gsime,
  	gsiml: gsiml,
  	gtcc: gtcc,
  	gtcir: gtcir,
  	gt: gt$1,
  	GT: GT,
  	Gt: Gt,
  	gtdot: gtdot,
  	gtlPar: gtlPar,
  	gtquest: gtquest,
  	gtrapprox: gtrapprox,
  	gtrarr: gtrarr,
  	gtrdot: gtrdot,
  	gtreqless: gtreqless,
  	gtreqqless: gtreqqless,
  	gtrless: gtrless,
  	gtrsim: gtrsim,
  	gvertneqq: gvertneqq,
  	gvnE: gvnE,
  	Hacek: Hacek,
  	hairsp: hairsp,
  	half: half,
  	hamilt: hamilt,
  	HARDcy: HARDcy,
  	hardcy: hardcy,
  	harrcir: harrcir,
  	harr: harr,
  	hArr: hArr,
  	harrw: harrw,
  	Hat: Hat,
  	hbar: hbar,
  	Hcirc: Hcirc,
  	hcirc: hcirc,
  	hearts: hearts,
  	heartsuit: heartsuit,
  	hellip: hellip,
  	hercon: hercon,
  	hfr: hfr,
  	Hfr: Hfr,
  	HilbertSpace: HilbertSpace,
  	hksearow: hksearow,
  	hkswarow: hkswarow,
  	hoarr: hoarr,
  	homtht: homtht,
  	hookleftarrow: hookleftarrow,
  	hookrightarrow: hookrightarrow,
  	hopf: hopf,
  	Hopf: Hopf,
  	horbar: horbar,
  	HorizontalLine: HorizontalLine,
  	hscr: hscr,
  	Hscr: Hscr,
  	hslash: hslash,
  	Hstrok: Hstrok,
  	hstrok: hstrok,
  	HumpDownHump: HumpDownHump,
  	HumpEqual: HumpEqual,
  	hybull: hybull,
  	hyphen: hyphen,
  	Iacute: Iacute,
  	iacute: iacute,
  	ic: ic,
  	Icirc: Icirc,
  	icirc: icirc,
  	Icy: Icy,
  	icy: icy,
  	Idot: Idot,
  	IEcy: IEcy,
  	iecy: iecy,
  	iexcl: iexcl,
  	iff: iff,
  	ifr: ifr,
  	Ifr: Ifr,
  	Igrave: Igrave,
  	igrave: igrave,
  	ii: ii,
  	iiiint: iiiint,
  	iiint: iiint,
  	iinfin: iinfin,
  	iiota: iiota,
  	IJlig: IJlig,
  	ijlig: ijlig,
  	Imacr: Imacr,
  	imacr: imacr,
  	image: image,
  	ImaginaryI: ImaginaryI,
  	imagline: imagline,
  	imagpart: imagpart,
  	imath: imath,
  	Im: Im,
  	imof: imof,
  	imped: imped,
  	Implies: Implies,
  	incare: incare,
  	infin: infin,
  	infintie: infintie,
  	inodot: inodot,
  	intcal: intcal,
  	int: int,
  	Int: Int,
  	integers: integers,
  	Integral: Integral,
  	intercal: intercal,
  	Intersection: Intersection,
  	intlarhk: intlarhk,
  	intprod: intprod,
  	InvisibleComma: InvisibleComma,
  	InvisibleTimes: InvisibleTimes,
  	IOcy: IOcy,
  	iocy: iocy,
  	Iogon: Iogon,
  	iogon: iogon,
  	Iopf: Iopf,
  	iopf: iopf,
  	Iota: Iota,
  	iota: iota,
  	iprod: iprod,
  	iquest: iquest,
  	iscr: iscr,
  	Iscr: Iscr,
  	isin: isin,
  	isindot: isindot,
  	isinE: isinE,
  	isins: isins,
  	isinsv: isinsv,
  	isinv: isinv,
  	it: it,
  	Itilde: Itilde,
  	itilde: itilde,
  	Iukcy: Iukcy,
  	iukcy: iukcy,
  	Iuml: Iuml,
  	iuml: iuml,
  	Jcirc: Jcirc,
  	jcirc: jcirc,
  	Jcy: Jcy,
  	jcy: jcy,
  	Jfr: Jfr,
  	jfr: jfr,
  	jmath: jmath,
  	Jopf: Jopf,
  	jopf: jopf,
  	Jscr: Jscr,
  	jscr: jscr,
  	Jsercy: Jsercy,
  	jsercy: jsercy,
  	Jukcy: Jukcy,
  	jukcy: jukcy,
  	Kappa: Kappa,
  	kappa: kappa,
  	kappav: kappav,
  	Kcedil: Kcedil,
  	kcedil: kcedil,
  	Kcy: Kcy,
  	kcy: kcy,
  	Kfr: Kfr,
  	kfr: kfr,
  	kgreen: kgreen,
  	KHcy: KHcy,
  	khcy: khcy,
  	KJcy: KJcy,
  	kjcy: kjcy,
  	Kopf: Kopf,
  	kopf: kopf,
  	Kscr: Kscr,
  	kscr: kscr,
  	lAarr: lAarr,
  	Lacute: Lacute,
  	lacute: lacute,
  	laemptyv: laemptyv,
  	lagran: lagran,
  	Lambda: Lambda,
  	lambda: lambda,
  	lang: lang,
  	Lang: Lang,
  	langd: langd,
  	langle: langle,
  	lap: lap,
  	Laplacetrf: Laplacetrf,
  	laquo: laquo,
  	larrb: larrb,
  	larrbfs: larrbfs,
  	larr: larr,
  	Larr: Larr,
  	lArr: lArr,
  	larrfs: larrfs,
  	larrhk: larrhk,
  	larrlp: larrlp,
  	larrpl: larrpl,
  	larrsim: larrsim,
  	larrtl: larrtl,
  	latail: latail,
  	lAtail: lAtail,
  	lat: lat,
  	late: late,
  	lates: lates,
  	lbarr: lbarr,
  	lBarr: lBarr,
  	lbbrk: lbbrk,
  	lbrace: lbrace,
  	lbrack: lbrack,
  	lbrke: lbrke,
  	lbrksld: lbrksld,
  	lbrkslu: lbrkslu,
  	Lcaron: Lcaron,
  	lcaron: lcaron,
  	Lcedil: Lcedil,
  	lcedil: lcedil,
  	lceil: lceil,
  	lcub: lcub,
  	Lcy: Lcy,
  	lcy: lcy,
  	ldca: ldca,
  	ldquo: ldquo,
  	ldquor: ldquor,
  	ldrdhar: ldrdhar,
  	ldrushar: ldrushar,
  	ldsh: ldsh,
  	le: le,
  	lE: lE,
  	LeftAngleBracket: LeftAngleBracket,
  	LeftArrowBar: LeftArrowBar,
  	leftarrow: leftarrow,
  	LeftArrow: LeftArrow,
  	Leftarrow: Leftarrow,
  	LeftArrowRightArrow: LeftArrowRightArrow,
  	leftarrowtail: leftarrowtail,
  	LeftCeiling: LeftCeiling,
  	LeftDoubleBracket: LeftDoubleBracket,
  	LeftDownTeeVector: LeftDownTeeVector,
  	LeftDownVectorBar: LeftDownVectorBar,
  	LeftDownVector: LeftDownVector,
  	LeftFloor: LeftFloor,
  	leftharpoondown: leftharpoondown,
  	leftharpoonup: leftharpoonup,
  	leftleftarrows: leftleftarrows,
  	leftrightarrow: leftrightarrow,
  	LeftRightArrow: LeftRightArrow,
  	Leftrightarrow: Leftrightarrow,
  	leftrightarrows: leftrightarrows,
  	leftrightharpoons: leftrightharpoons,
  	leftrightsquigarrow: leftrightsquigarrow,
  	LeftRightVector: LeftRightVector,
  	LeftTeeArrow: LeftTeeArrow,
  	LeftTee: LeftTee,
  	LeftTeeVector: LeftTeeVector,
  	leftthreetimes: leftthreetimes,
  	LeftTriangleBar: LeftTriangleBar,
  	LeftTriangle: LeftTriangle,
  	LeftTriangleEqual: LeftTriangleEqual,
  	LeftUpDownVector: LeftUpDownVector,
  	LeftUpTeeVector: LeftUpTeeVector,
  	LeftUpVectorBar: LeftUpVectorBar,
  	LeftUpVector: LeftUpVector,
  	LeftVectorBar: LeftVectorBar,
  	LeftVector: LeftVector,
  	lEg: lEg,
  	leg: leg,
  	leq: leq,
  	leqq: leqq,
  	leqslant: leqslant,
  	lescc: lescc,
  	les: les,
  	lesdot: lesdot,
  	lesdoto: lesdoto,
  	lesdotor: lesdotor,
  	lesg: lesg,
  	lesges: lesges,
  	lessapprox: lessapprox,
  	lessdot: lessdot,
  	lesseqgtr: lesseqgtr,
  	lesseqqgtr: lesseqqgtr,
  	LessEqualGreater: LessEqualGreater,
  	LessFullEqual: LessFullEqual,
  	LessGreater: LessGreater,
  	lessgtr: lessgtr,
  	LessLess: LessLess,
  	lesssim: lesssim,
  	LessSlantEqual: LessSlantEqual,
  	LessTilde: LessTilde,
  	lfisht: lfisht,
  	lfloor: lfloor,
  	Lfr: Lfr,
  	lfr: lfr,
  	lg: lg,
  	lgE: lgE,
  	lHar: lHar,
  	lhard: lhard,
  	lharu: lharu,
  	lharul: lharul,
  	lhblk: lhblk,
  	LJcy: LJcy,
  	ljcy: ljcy,
  	llarr: llarr,
  	ll: ll,
  	Ll: Ll,
  	llcorner: llcorner,
  	Lleftarrow: Lleftarrow,
  	llhard: llhard,
  	lltri: lltri,
  	Lmidot: Lmidot,
  	lmidot: lmidot,
  	lmoustache: lmoustache,
  	lmoust: lmoust,
  	lnap: lnap,
  	lnapprox: lnapprox,
  	lne: lne,
  	lnE: lnE,
  	lneq: lneq,
  	lneqq: lneqq,
  	lnsim: lnsim,
  	loang: loang,
  	loarr: loarr,
  	lobrk: lobrk,
  	longleftarrow: longleftarrow,
  	LongLeftArrow: LongLeftArrow,
  	Longleftarrow: Longleftarrow,
  	longleftrightarrow: longleftrightarrow,
  	LongLeftRightArrow: LongLeftRightArrow,
  	Longleftrightarrow: Longleftrightarrow,
  	longmapsto: longmapsto,
  	longrightarrow: longrightarrow,
  	LongRightArrow: LongRightArrow,
  	Longrightarrow: Longrightarrow,
  	looparrowleft: looparrowleft,
  	looparrowright: looparrowright,
  	lopar: lopar,
  	Lopf: Lopf,
  	lopf: lopf,
  	loplus: loplus,
  	lotimes: lotimes,
  	lowast: lowast,
  	lowbar: lowbar,
  	LowerLeftArrow: LowerLeftArrow,
  	LowerRightArrow: LowerRightArrow,
  	loz: loz,
  	lozenge: lozenge,
  	lozf: lozf,
  	lpar: lpar,
  	lparlt: lparlt,
  	lrarr: lrarr,
  	lrcorner: lrcorner,
  	lrhar: lrhar,
  	lrhard: lrhard,
  	lrm: lrm,
  	lrtri: lrtri,
  	lsaquo: lsaquo,
  	lscr: lscr,
  	Lscr: Lscr,
  	lsh: lsh,
  	Lsh: Lsh,
  	lsim: lsim,
  	lsime: lsime,
  	lsimg: lsimg,
  	lsqb: lsqb,
  	lsquo: lsquo,
  	lsquor: lsquor,
  	Lstrok: Lstrok,
  	lstrok: lstrok,
  	ltcc: ltcc,
  	ltcir: ltcir,
  	lt: lt$1,
  	LT: LT,
  	Lt: Lt,
  	ltdot: ltdot,
  	lthree: lthree,
  	ltimes: ltimes,
  	ltlarr: ltlarr,
  	ltquest: ltquest,
  	ltri: ltri,
  	ltrie: ltrie,
  	ltrif: ltrif,
  	ltrPar: ltrPar,
  	lurdshar: lurdshar,
  	luruhar: luruhar,
  	lvertneqq: lvertneqq,
  	lvnE: lvnE,
  	macr: macr,
  	male: male,
  	malt: malt,
  	maltese: maltese,
  	map: map,
  	mapsto: mapsto,
  	mapstodown: mapstodown,
  	mapstoleft: mapstoleft,
  	mapstoup: mapstoup,
  	marker: marker,
  	mcomma: mcomma,
  	Mcy: Mcy,
  	mcy: mcy,
  	mdash: mdash,
  	mDDot: mDDot,
  	measuredangle: measuredangle,
  	MediumSpace: MediumSpace,
  	Mellintrf: Mellintrf,
  	Mfr: Mfr,
  	mfr: mfr,
  	mho: mho,
  	micro: micro,
  	midast: midast,
  	midcir: midcir,
  	mid: mid,
  	middot: middot,
  	minusb: minusb,
  	minus: minus,
  	minusd: minusd,
  	minusdu: minusdu,
  	MinusPlus: MinusPlus,
  	mlcp: mlcp,
  	mldr: mldr,
  	mnplus: mnplus,
  	models: models,
  	Mopf: Mopf,
  	mopf: mopf,
  	mp: mp,
  	mscr: mscr,
  	Mscr: Mscr,
  	mstpos: mstpos,
  	Mu: Mu,
  	mu: mu,
  	multimap: multimap,
  	mumap: mumap,
  	nabla: nabla,
  	Nacute: Nacute,
  	nacute: nacute,
  	nang: nang,
  	nap: nap,
  	napE: napE,
  	napid: napid,
  	napos: napos,
  	napprox: napprox,
  	natural: natural,
  	naturals: naturals,
  	natur: natur,
  	nbsp: nbsp,
  	nbump: nbump,
  	nbumpe: nbumpe,
  	ncap: ncap,
  	Ncaron: Ncaron,
  	ncaron: ncaron,
  	Ncedil: Ncedil,
  	ncedil: ncedil,
  	ncong: ncong,
  	ncongdot: ncongdot,
  	ncup: ncup,
  	Ncy: Ncy,
  	ncy: ncy,
  	ndash: ndash,
  	nearhk: nearhk,
  	nearr: nearr,
  	neArr: neArr,
  	nearrow: nearrow,
  	ne: ne,
  	nedot: nedot,
  	NegativeMediumSpace: NegativeMediumSpace,
  	NegativeThickSpace: NegativeThickSpace,
  	NegativeThinSpace: NegativeThinSpace,
  	NegativeVeryThinSpace: NegativeVeryThinSpace,
  	nequiv: nequiv,
  	nesear: nesear,
  	nesim: nesim,
  	NestedGreaterGreater: NestedGreaterGreater,
  	NestedLessLess: NestedLessLess,
  	NewLine: NewLine,
  	nexist: nexist,
  	nexists: nexists,
  	Nfr: Nfr,
  	nfr: nfr,
  	ngE: ngE,
  	nge: nge,
  	ngeq: ngeq,
  	ngeqq: ngeqq,
  	ngeqslant: ngeqslant,
  	nges: nges,
  	nGg: nGg,
  	ngsim: ngsim,
  	nGt: nGt,
  	ngt: ngt,
  	ngtr: ngtr,
  	nGtv: nGtv,
  	nharr: nharr,
  	nhArr: nhArr,
  	nhpar: nhpar,
  	ni: ni,
  	nis: nis,
  	nisd: nisd,
  	niv: niv,
  	NJcy: NJcy,
  	njcy: njcy,
  	nlarr: nlarr,
  	nlArr: nlArr,
  	nldr: nldr,
  	nlE: nlE,
  	nle: nle,
  	nleftarrow: nleftarrow,
  	nLeftarrow: nLeftarrow,
  	nleftrightarrow: nleftrightarrow,
  	nLeftrightarrow: nLeftrightarrow,
  	nleq: nleq,
  	nleqq: nleqq,
  	nleqslant: nleqslant,
  	nles: nles,
  	nless: nless,
  	nLl: nLl,
  	nlsim: nlsim,
  	nLt: nLt,
  	nlt: nlt,
  	nltri: nltri,
  	nltrie: nltrie,
  	nLtv: nLtv,
  	nmid: nmid,
  	NoBreak: NoBreak,
  	NonBreakingSpace: NonBreakingSpace,
  	nopf: nopf,
  	Nopf: Nopf,
  	Not: Not,
  	not: not,
  	NotCongruent: NotCongruent,
  	NotCupCap: NotCupCap,
  	NotDoubleVerticalBar: NotDoubleVerticalBar,
  	NotElement: NotElement,
  	NotEqual: NotEqual,
  	NotEqualTilde: NotEqualTilde,
  	NotExists: NotExists,
  	NotGreater: NotGreater,
  	NotGreaterEqual: NotGreaterEqual,
  	NotGreaterFullEqual: NotGreaterFullEqual,
  	NotGreaterGreater: NotGreaterGreater,
  	NotGreaterLess: NotGreaterLess,
  	NotGreaterSlantEqual: NotGreaterSlantEqual,
  	NotGreaterTilde: NotGreaterTilde,
  	NotHumpDownHump: NotHumpDownHump,
  	NotHumpEqual: NotHumpEqual,
  	notin: notin,
  	notindot: notindot,
  	notinE: notinE,
  	notinva: notinva,
  	notinvb: notinvb,
  	notinvc: notinvc,
  	NotLeftTriangleBar: NotLeftTriangleBar,
  	NotLeftTriangle: NotLeftTriangle,
  	NotLeftTriangleEqual: NotLeftTriangleEqual,
  	NotLess: NotLess,
  	NotLessEqual: NotLessEqual,
  	NotLessGreater: NotLessGreater,
  	NotLessLess: NotLessLess,
  	NotLessSlantEqual: NotLessSlantEqual,
  	NotLessTilde: NotLessTilde,
  	NotNestedGreaterGreater: NotNestedGreaterGreater,
  	NotNestedLessLess: NotNestedLessLess,
  	notni: notni,
  	notniva: notniva,
  	notnivb: notnivb,
  	notnivc: notnivc,
  	NotPrecedes: NotPrecedes,
  	NotPrecedesEqual: NotPrecedesEqual,
  	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
  	NotReverseElement: NotReverseElement,
  	NotRightTriangleBar: NotRightTriangleBar,
  	NotRightTriangle: NotRightTriangle,
  	NotRightTriangleEqual: NotRightTriangleEqual,
  	NotSquareSubset: NotSquareSubset,
  	NotSquareSubsetEqual: NotSquareSubsetEqual,
  	NotSquareSuperset: NotSquareSuperset,
  	NotSquareSupersetEqual: NotSquareSupersetEqual,
  	NotSubset: NotSubset,
  	NotSubsetEqual: NotSubsetEqual,
  	NotSucceeds: NotSucceeds,
  	NotSucceedsEqual: NotSucceedsEqual,
  	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
  	NotSucceedsTilde: NotSucceedsTilde,
  	NotSuperset: NotSuperset,
  	NotSupersetEqual: NotSupersetEqual,
  	NotTilde: NotTilde,
  	NotTildeEqual: NotTildeEqual,
  	NotTildeFullEqual: NotTildeFullEqual,
  	NotTildeTilde: NotTildeTilde,
  	NotVerticalBar: NotVerticalBar,
  	nparallel: nparallel,
  	npar: npar,
  	nparsl: nparsl,
  	npart: npart,
  	npolint: npolint,
  	npr: npr,
  	nprcue: nprcue,
  	nprec: nprec,
  	npreceq: npreceq,
  	npre: npre,
  	nrarrc: nrarrc,
  	nrarr: nrarr,
  	nrArr: nrArr,
  	nrarrw: nrarrw,
  	nrightarrow: nrightarrow,
  	nRightarrow: nRightarrow,
  	nrtri: nrtri,
  	nrtrie: nrtrie,
  	nsc: nsc,
  	nsccue: nsccue,
  	nsce: nsce,
  	Nscr: Nscr,
  	nscr: nscr,
  	nshortmid: nshortmid,
  	nshortparallel: nshortparallel,
  	nsim: nsim,
  	nsime: nsime,
  	nsimeq: nsimeq,
  	nsmid: nsmid,
  	nspar: nspar,
  	nsqsube: nsqsube,
  	nsqsupe: nsqsupe,
  	nsub: nsub,
  	nsubE: nsubE,
  	nsube: nsube,
  	nsubset: nsubset,
  	nsubseteq: nsubseteq,
  	nsubseteqq: nsubseteqq,
  	nsucc: nsucc,
  	nsucceq: nsucceq,
  	nsup: nsup,
  	nsupE: nsupE,
  	nsupe: nsupe,
  	nsupset: nsupset,
  	nsupseteq: nsupseteq,
  	nsupseteqq: nsupseteqq,
  	ntgl: ntgl,
  	Ntilde: Ntilde,
  	ntilde: ntilde,
  	ntlg: ntlg,
  	ntriangleleft: ntriangleleft,
  	ntrianglelefteq: ntrianglelefteq,
  	ntriangleright: ntriangleright,
  	ntrianglerighteq: ntrianglerighteq,
  	Nu: Nu,
  	nu: nu,
  	num: num,
  	numero: numero,
  	numsp: numsp,
  	nvap: nvap,
  	nvdash: nvdash,
  	nvDash: nvDash,
  	nVdash: nVdash,
  	nVDash: nVDash,
  	nvge: nvge,
  	nvgt: nvgt,
  	nvHarr: nvHarr,
  	nvinfin: nvinfin,
  	nvlArr: nvlArr,
  	nvle: nvle,
  	nvlt: nvlt,
  	nvltrie: nvltrie,
  	nvrArr: nvrArr,
  	nvrtrie: nvrtrie,
  	nvsim: nvsim,
  	nwarhk: nwarhk,
  	nwarr: nwarr,
  	nwArr: nwArr,
  	nwarrow: nwarrow,
  	nwnear: nwnear,
  	Oacute: Oacute,
  	oacute: oacute,
  	oast: oast,
  	Ocirc: Ocirc,
  	ocirc: ocirc,
  	ocir: ocir,
  	Ocy: Ocy,
  	ocy: ocy,
  	odash: odash,
  	Odblac: Odblac,
  	odblac: odblac,
  	odiv: odiv,
  	odot: odot,
  	odsold: odsold,
  	OElig: OElig,
  	oelig: oelig,
  	ofcir: ofcir,
  	Ofr: Ofr,
  	ofr: ofr,
  	ogon: ogon,
  	Ograve: Ograve,
  	ograve: ograve,
  	ogt: ogt,
  	ohbar: ohbar,
  	ohm: ohm,
  	oint: oint,
  	olarr: olarr,
  	olcir: olcir,
  	olcross: olcross,
  	oline: oline,
  	olt: olt,
  	Omacr: Omacr,
  	omacr: omacr,
  	Omega: Omega,
  	omega: omega,
  	Omicron: Omicron,
  	omicron: omicron,
  	omid: omid,
  	ominus: ominus,
  	Oopf: Oopf,
  	oopf: oopf,
  	opar: opar,
  	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
  	OpenCurlyQuote: OpenCurlyQuote,
  	operp: operp,
  	oplus: oplus,
  	orarr: orarr,
  	Or: Or,
  	or: or,
  	ord: ord,
  	order: order,
  	orderof: orderof,
  	ordf: ordf,
  	ordm: ordm,
  	origof: origof,
  	oror: oror,
  	orslope: orslope,
  	orv: orv,
  	oS: oS,
  	Oscr: Oscr,
  	oscr: oscr,
  	Oslash: Oslash,
  	oslash: oslash,
  	osol: osol,
  	Otilde: Otilde,
  	otilde: otilde,
  	otimesas: otimesas,
  	Otimes: Otimes,
  	otimes: otimes,
  	Ouml: Ouml,
  	ouml: ouml,
  	ovbar: ovbar,
  	OverBar: OverBar,
  	OverBrace: OverBrace,
  	OverBracket: OverBracket,
  	OverParenthesis: OverParenthesis,
  	para: para,
  	parallel: parallel,
  	par: par,
  	parsim: parsim,
  	parsl: parsl,
  	part: part,
  	PartialD: PartialD,
  	Pcy: Pcy,
  	pcy: pcy,
  	percnt: percnt,
  	period: period,
  	permil: permil,
  	perp: perp,
  	pertenk: pertenk,
  	Pfr: Pfr,
  	pfr: pfr,
  	Phi: Phi,
  	phi: phi,
  	phiv: phiv,
  	phmmat: phmmat,
  	phone: phone,
  	Pi: Pi,
  	pi: pi,
  	pitchfork: pitchfork,
  	piv: piv,
  	planck: planck,
  	planckh: planckh,
  	plankv: plankv,
  	plusacir: plusacir,
  	plusb: plusb,
  	pluscir: pluscir,
  	plus: plus,
  	plusdo: plusdo,
  	plusdu: plusdu,
  	pluse: pluse,
  	PlusMinus: PlusMinus,
  	plusmn: plusmn,
  	plussim: plussim,
  	plustwo: plustwo,
  	pm: pm,
  	Poincareplane: Poincareplane,
  	pointint: pointint,
  	popf: popf,
  	Popf: Popf,
  	pound: pound,
  	prap: prap,
  	Pr: Pr,
  	pr: pr,
  	prcue: prcue,
  	precapprox: precapprox,
  	prec: prec,
  	preccurlyeq: preccurlyeq,
  	Precedes: Precedes,
  	PrecedesEqual: PrecedesEqual,
  	PrecedesSlantEqual: PrecedesSlantEqual,
  	PrecedesTilde: PrecedesTilde,
  	preceq: preceq,
  	precnapprox: precnapprox,
  	precneqq: precneqq,
  	precnsim: precnsim,
  	pre: pre,
  	prE: prE,
  	precsim: precsim,
  	prime: prime,
  	Prime: Prime,
  	primes: primes,
  	prnap: prnap,
  	prnE: prnE,
  	prnsim: prnsim,
  	prod: prod,
  	Product: Product,
  	profalar: profalar,
  	profline: profline,
  	profsurf: profsurf,
  	prop: prop,
  	Proportional: Proportional,
  	Proportion: Proportion,
  	propto: propto,
  	prsim: prsim,
  	prurel: prurel,
  	Pscr: Pscr,
  	pscr: pscr,
  	Psi: Psi,
  	psi: psi,
  	puncsp: puncsp,
  	Qfr: Qfr,
  	qfr: qfr,
  	qint: qint,
  	qopf: qopf,
  	Qopf: Qopf,
  	qprime: qprime,
  	Qscr: Qscr,
  	qscr: qscr,
  	quaternions: quaternions,
  	quatint: quatint,
  	quest: quest,
  	questeq: questeq,
  	quot: quot$1,
  	QUOT: QUOT,
  	rAarr: rAarr,
  	race: race,
  	Racute: Racute,
  	racute: racute,
  	radic: radic,
  	raemptyv: raemptyv,
  	rang: rang,
  	Rang: Rang,
  	rangd: rangd,
  	range: range,
  	rangle: rangle,
  	raquo: raquo,
  	rarrap: rarrap,
  	rarrb: rarrb,
  	rarrbfs: rarrbfs,
  	rarrc: rarrc,
  	rarr: rarr,
  	Rarr: Rarr,
  	rArr: rArr,
  	rarrfs: rarrfs,
  	rarrhk: rarrhk,
  	rarrlp: rarrlp,
  	rarrpl: rarrpl,
  	rarrsim: rarrsim,
  	Rarrtl: Rarrtl,
  	rarrtl: rarrtl,
  	rarrw: rarrw,
  	ratail: ratail,
  	rAtail: rAtail,
  	ratio: ratio,
  	rationals: rationals,
  	rbarr: rbarr,
  	rBarr: rBarr,
  	RBarr: RBarr,
  	rbbrk: rbbrk,
  	rbrace: rbrace,
  	rbrack: rbrack,
  	rbrke: rbrke,
  	rbrksld: rbrksld,
  	rbrkslu: rbrkslu,
  	Rcaron: Rcaron,
  	rcaron: rcaron,
  	Rcedil: Rcedil,
  	rcedil: rcedil,
  	rceil: rceil,
  	rcub: rcub,
  	Rcy: Rcy,
  	rcy: rcy,
  	rdca: rdca,
  	rdldhar: rdldhar,
  	rdquo: rdquo,
  	rdquor: rdquor,
  	rdsh: rdsh,
  	real: real,
  	realine: realine,
  	realpart: realpart,
  	reals: reals,
  	Re: Re,
  	rect: rect,
  	reg: reg,
  	REG: REG,
  	ReverseElement: ReverseElement,
  	ReverseEquilibrium: ReverseEquilibrium,
  	ReverseUpEquilibrium: ReverseUpEquilibrium,
  	rfisht: rfisht,
  	rfloor: rfloor,
  	rfr: rfr,
  	Rfr: Rfr,
  	rHar: rHar,
  	rhard: rhard,
  	rharu: rharu,
  	rharul: rharul,
  	Rho: Rho,
  	rho: rho,
  	rhov: rhov,
  	RightAngleBracket: RightAngleBracket,
  	RightArrowBar: RightArrowBar,
  	rightarrow: rightarrow,
  	RightArrow: RightArrow,
  	Rightarrow: Rightarrow,
  	RightArrowLeftArrow: RightArrowLeftArrow,
  	rightarrowtail: rightarrowtail,
  	RightCeiling: RightCeiling,
  	RightDoubleBracket: RightDoubleBracket,
  	RightDownTeeVector: RightDownTeeVector,
  	RightDownVectorBar: RightDownVectorBar,
  	RightDownVector: RightDownVector,
  	RightFloor: RightFloor,
  	rightharpoondown: rightharpoondown,
  	rightharpoonup: rightharpoonup,
  	rightleftarrows: rightleftarrows,
  	rightleftharpoons: rightleftharpoons,
  	rightrightarrows: rightrightarrows,
  	rightsquigarrow: rightsquigarrow,
  	RightTeeArrow: RightTeeArrow,
  	RightTee: RightTee,
  	RightTeeVector: RightTeeVector,
  	rightthreetimes: rightthreetimes,
  	RightTriangleBar: RightTriangleBar,
  	RightTriangle: RightTriangle,
  	RightTriangleEqual: RightTriangleEqual,
  	RightUpDownVector: RightUpDownVector,
  	RightUpTeeVector: RightUpTeeVector,
  	RightUpVectorBar: RightUpVectorBar,
  	RightUpVector: RightUpVector,
  	RightVectorBar: RightVectorBar,
  	RightVector: RightVector,
  	ring: ring,
  	risingdotseq: risingdotseq,
  	rlarr: rlarr,
  	rlhar: rlhar,
  	rlm: rlm,
  	rmoustache: rmoustache,
  	rmoust: rmoust,
  	rnmid: rnmid,
  	roang: roang,
  	roarr: roarr,
  	robrk: robrk,
  	ropar: ropar,
  	ropf: ropf,
  	Ropf: Ropf,
  	roplus: roplus,
  	rotimes: rotimes,
  	RoundImplies: RoundImplies,
  	rpar: rpar,
  	rpargt: rpargt,
  	rppolint: rppolint,
  	rrarr: rrarr,
  	Rrightarrow: Rrightarrow,
  	rsaquo: rsaquo,
  	rscr: rscr,
  	Rscr: Rscr,
  	rsh: rsh,
  	Rsh: Rsh,
  	rsqb: rsqb,
  	rsquo: rsquo,
  	rsquor: rsquor,
  	rthree: rthree,
  	rtimes: rtimes,
  	rtri: rtri,
  	rtrie: rtrie,
  	rtrif: rtrif,
  	rtriltri: rtriltri,
  	RuleDelayed: RuleDelayed,
  	ruluhar: ruluhar,
  	rx: rx,
  	Sacute: Sacute,
  	sacute: sacute,
  	sbquo: sbquo,
  	scap: scap,
  	Scaron: Scaron,
  	scaron: scaron,
  	Sc: Sc,
  	sc: sc,
  	sccue: sccue,
  	sce: sce,
  	scE: scE,
  	Scedil: Scedil,
  	scedil: scedil,
  	Scirc: Scirc,
  	scirc: scirc,
  	scnap: scnap,
  	scnE: scnE,
  	scnsim: scnsim,
  	scpolint: scpolint,
  	scsim: scsim,
  	Scy: Scy,
  	scy: scy,
  	sdotb: sdotb,
  	sdot: sdot,
  	sdote: sdote,
  	searhk: searhk,
  	searr: searr,
  	seArr: seArr,
  	searrow: searrow,
  	sect: sect,
  	semi: semi,
  	seswar: seswar,
  	setminus: setminus,
  	setmn: setmn,
  	sext: sext,
  	Sfr: Sfr,
  	sfr: sfr,
  	sfrown: sfrown,
  	sharp: sharp,
  	SHCHcy: SHCHcy,
  	shchcy: shchcy,
  	SHcy: SHcy,
  	shcy: shcy,
  	ShortDownArrow: ShortDownArrow,
  	ShortLeftArrow: ShortLeftArrow,
  	shortmid: shortmid,
  	shortparallel: shortparallel,
  	ShortRightArrow: ShortRightArrow,
  	ShortUpArrow: ShortUpArrow,
  	shy: shy,
  	Sigma: Sigma,
  	sigma: sigma,
  	sigmaf: sigmaf,
  	sigmav: sigmav,
  	sim: sim,
  	simdot: simdot,
  	sime: sime,
  	simeq: simeq,
  	simg: simg,
  	simgE: simgE,
  	siml: siml,
  	simlE: simlE,
  	simne: simne,
  	simplus: simplus,
  	simrarr: simrarr,
  	slarr: slarr,
  	SmallCircle: SmallCircle,
  	smallsetminus: smallsetminus,
  	smashp: smashp,
  	smeparsl: smeparsl,
  	smid: smid,
  	smile: smile,
  	smt: smt,
  	smte: smte,
  	smtes: smtes,
  	SOFTcy: SOFTcy,
  	softcy: softcy,
  	solbar: solbar,
  	solb: solb,
  	sol: sol,
  	Sopf: Sopf,
  	sopf: sopf,
  	spades: spades,
  	spadesuit: spadesuit,
  	spar: spar,
  	sqcap: sqcap,
  	sqcaps: sqcaps,
  	sqcup: sqcup,
  	sqcups: sqcups,
  	Sqrt: Sqrt,
  	sqsub: sqsub,
  	sqsube: sqsube,
  	sqsubset: sqsubset,
  	sqsubseteq: sqsubseteq,
  	sqsup: sqsup,
  	sqsupe: sqsupe,
  	sqsupset: sqsupset,
  	sqsupseteq: sqsupseteq,
  	square: square,
  	Square: Square,
  	SquareIntersection: SquareIntersection,
  	SquareSubset: SquareSubset,
  	SquareSubsetEqual: SquareSubsetEqual,
  	SquareSuperset: SquareSuperset,
  	SquareSupersetEqual: SquareSupersetEqual,
  	SquareUnion: SquareUnion,
  	squarf: squarf,
  	squ: squ,
  	squf: squf,
  	srarr: srarr,
  	Sscr: Sscr,
  	sscr: sscr,
  	ssetmn: ssetmn,
  	ssmile: ssmile,
  	sstarf: sstarf,
  	Star: Star,
  	star: star,
  	starf: starf,
  	straightepsilon: straightepsilon,
  	straightphi: straightphi,
  	strns: strns,
  	sub: sub,
  	Sub: Sub,
  	subdot: subdot,
  	subE: subE,
  	sube: sube,
  	subedot: subedot,
  	submult: submult,
  	subnE: subnE,
  	subne: subne,
  	subplus: subplus,
  	subrarr: subrarr,
  	subset: subset,
  	Subset: Subset,
  	subseteq: subseteq,
  	subseteqq: subseteqq,
  	SubsetEqual: SubsetEqual,
  	subsetneq: subsetneq,
  	subsetneqq: subsetneqq,
  	subsim: subsim,
  	subsub: subsub,
  	subsup: subsup,
  	succapprox: succapprox,
  	succ: succ,
  	succcurlyeq: succcurlyeq,
  	Succeeds: Succeeds,
  	SucceedsEqual: SucceedsEqual,
  	SucceedsSlantEqual: SucceedsSlantEqual,
  	SucceedsTilde: SucceedsTilde,
  	succeq: succeq,
  	succnapprox: succnapprox,
  	succneqq: succneqq,
  	succnsim: succnsim,
  	succsim: succsim,
  	SuchThat: SuchThat,
  	sum: sum,
  	Sum: Sum,
  	sung: sung,
  	sup1: sup1,
  	sup2: sup2,
  	sup3: sup3,
  	sup: sup,
  	Sup: Sup,
  	supdot: supdot,
  	supdsub: supdsub,
  	supE: supE,
  	supe: supe,
  	supedot: supedot,
  	Superset: Superset,
  	SupersetEqual: SupersetEqual,
  	suphsol: suphsol,
  	suphsub: suphsub,
  	suplarr: suplarr,
  	supmult: supmult,
  	supnE: supnE,
  	supne: supne,
  	supplus: supplus,
  	supset: supset,
  	Supset: Supset,
  	supseteq: supseteq,
  	supseteqq: supseteqq,
  	supsetneq: supsetneq,
  	supsetneqq: supsetneqq,
  	supsim: supsim,
  	supsub: supsub,
  	supsup: supsup,
  	swarhk: swarhk,
  	swarr: swarr,
  	swArr: swArr,
  	swarrow: swarrow,
  	swnwar: swnwar,
  	szlig: szlig,
  	Tab: Tab,
  	target: target,
  	Tau: Tau,
  	tau: tau,
  	tbrk: tbrk,
  	Tcaron: Tcaron,
  	tcaron: tcaron,
  	Tcedil: Tcedil,
  	tcedil: tcedil,
  	Tcy: Tcy,
  	tcy: tcy,
  	tdot: tdot,
  	telrec: telrec,
  	Tfr: Tfr,
  	tfr: tfr,
  	there4: there4,
  	therefore: therefore,
  	Therefore: Therefore,
  	Theta: Theta,
  	theta: theta,
  	thetasym: thetasym,
  	thetav: thetav,
  	thickapprox: thickapprox,
  	thicksim: thicksim,
  	ThickSpace: ThickSpace,
  	ThinSpace: ThinSpace,
  	thinsp: thinsp,
  	thkap: thkap,
  	thksim: thksim,
  	THORN: THORN,
  	thorn: thorn,
  	tilde: tilde,
  	Tilde: Tilde,
  	TildeEqual: TildeEqual,
  	TildeFullEqual: TildeFullEqual,
  	TildeTilde: TildeTilde,
  	timesbar: timesbar,
  	timesb: timesb,
  	times: times,
  	timesd: timesd,
  	tint: tint,
  	toea: toea,
  	topbot: topbot,
  	topcir: topcir,
  	top: top,
  	Topf: Topf,
  	topf: topf,
  	topfork: topfork,
  	tosa: tosa,
  	tprime: tprime,
  	trade: trade,
  	TRADE: TRADE,
  	triangle: triangle,
  	triangledown: triangledown,
  	triangleleft: triangleleft,
  	trianglelefteq: trianglelefteq,
  	triangleq: triangleq,
  	triangleright: triangleright,
  	trianglerighteq: trianglerighteq,
  	tridot: tridot,
  	trie: trie,
  	triminus: triminus,
  	TripleDot: TripleDot,
  	triplus: triplus,
  	trisb: trisb,
  	tritime: tritime,
  	trpezium: trpezium,
  	Tscr: Tscr,
  	tscr: tscr,
  	TScy: TScy,
  	tscy: tscy,
  	TSHcy: TSHcy,
  	tshcy: tshcy,
  	Tstrok: Tstrok,
  	tstrok: tstrok,
  	twixt: twixt,
  	twoheadleftarrow: twoheadleftarrow,
  	twoheadrightarrow: twoheadrightarrow,
  	Uacute: Uacute,
  	uacute: uacute,
  	uarr: uarr,
  	Uarr: Uarr,
  	uArr: uArr,
  	Uarrocir: Uarrocir,
  	Ubrcy: Ubrcy,
  	ubrcy: ubrcy,
  	Ubreve: Ubreve,
  	ubreve: ubreve,
  	Ucirc: Ucirc,
  	ucirc: ucirc,
  	Ucy: Ucy,
  	ucy: ucy,
  	udarr: udarr,
  	Udblac: Udblac,
  	udblac: udblac,
  	udhar: udhar,
  	ufisht: ufisht,
  	Ufr: Ufr,
  	ufr: ufr,
  	Ugrave: Ugrave,
  	ugrave: ugrave,
  	uHar: uHar,
  	uharl: uharl,
  	uharr: uharr,
  	uhblk: uhblk,
  	ulcorn: ulcorn,
  	ulcorner: ulcorner,
  	ulcrop: ulcrop,
  	ultri: ultri,
  	Umacr: Umacr,
  	umacr: umacr,
  	uml: uml,
  	UnderBar: UnderBar,
  	UnderBrace: UnderBrace,
  	UnderBracket: UnderBracket,
  	UnderParenthesis: UnderParenthesis,
  	Union: Union,
  	UnionPlus: UnionPlus,
  	Uogon: Uogon,
  	uogon: uogon,
  	Uopf: Uopf,
  	uopf: uopf,
  	UpArrowBar: UpArrowBar,
  	uparrow: uparrow,
  	UpArrow: UpArrow,
  	Uparrow: Uparrow,
  	UpArrowDownArrow: UpArrowDownArrow,
  	updownarrow: updownarrow,
  	UpDownArrow: UpDownArrow,
  	Updownarrow: Updownarrow,
  	UpEquilibrium: UpEquilibrium,
  	upharpoonleft: upharpoonleft,
  	upharpoonright: upharpoonright,
  	uplus: uplus,
  	UpperLeftArrow: UpperLeftArrow,
  	UpperRightArrow: UpperRightArrow,
  	upsi: upsi,
  	Upsi: Upsi,
  	upsih: upsih,
  	Upsilon: Upsilon,
  	upsilon: upsilon,
  	UpTeeArrow: UpTeeArrow,
  	UpTee: UpTee,
  	upuparrows: upuparrows,
  	urcorn: urcorn,
  	urcorner: urcorner,
  	urcrop: urcrop,
  	Uring: Uring,
  	uring: uring,
  	urtri: urtri,
  	Uscr: Uscr,
  	uscr: uscr,
  	utdot: utdot,
  	Utilde: Utilde,
  	utilde: utilde,
  	utri: utri,
  	utrif: utrif,
  	uuarr: uuarr,
  	Uuml: Uuml,
  	uuml: uuml,
  	uwangle: uwangle,
  	vangrt: vangrt,
  	varepsilon: varepsilon,
  	varkappa: varkappa,
  	varnothing: varnothing,
  	varphi: varphi,
  	varpi: varpi,
  	varpropto: varpropto,
  	varr: varr,
  	vArr: vArr,
  	varrho: varrho,
  	varsigma: varsigma,
  	varsubsetneq: varsubsetneq,
  	varsubsetneqq: varsubsetneqq,
  	varsupsetneq: varsupsetneq,
  	varsupsetneqq: varsupsetneqq,
  	vartheta: vartheta,
  	vartriangleleft: vartriangleleft,
  	vartriangleright: vartriangleright,
  	vBar: vBar,
  	Vbar: Vbar,
  	vBarv: vBarv,
  	Vcy: Vcy,
  	vcy: vcy,
  	vdash: vdash,
  	vDash: vDash,
  	Vdash: Vdash,
  	VDash: VDash,
  	Vdashl: Vdashl,
  	veebar: veebar,
  	vee: vee,
  	Vee: Vee,
  	veeeq: veeeq,
  	vellip: vellip,
  	verbar: verbar,
  	Verbar: Verbar,
  	vert: vert,
  	Vert: Vert,
  	VerticalBar: VerticalBar,
  	VerticalLine: VerticalLine,
  	VerticalSeparator: VerticalSeparator,
  	VerticalTilde: VerticalTilde,
  	VeryThinSpace: VeryThinSpace,
  	Vfr: Vfr,
  	vfr: vfr,
  	vltri: vltri,
  	vnsub: vnsub,
  	vnsup: vnsup,
  	Vopf: Vopf,
  	vopf: vopf,
  	vprop: vprop,
  	vrtri: vrtri,
  	Vscr: Vscr,
  	vscr: vscr,
  	vsubnE: vsubnE,
  	vsubne: vsubne,
  	vsupnE: vsupnE,
  	vsupne: vsupne,
  	Vvdash: Vvdash,
  	vzigzag: vzigzag,
  	Wcirc: Wcirc,
  	wcirc: wcirc,
  	wedbar: wedbar,
  	wedge: wedge,
  	Wedge: Wedge,
  	wedgeq: wedgeq,
  	weierp: weierp,
  	Wfr: Wfr,
  	wfr: wfr,
  	Wopf: Wopf,
  	wopf: wopf,
  	wp: wp,
  	wr: wr,
  	wreath: wreath,
  	Wscr: Wscr,
  	wscr: wscr,
  	xcap: xcap,
  	xcirc: xcirc,
  	xcup: xcup,
  	xdtri: xdtri,
  	Xfr: Xfr,
  	xfr: xfr,
  	xharr: xharr,
  	xhArr: xhArr,
  	Xi: Xi,
  	xi: xi,
  	xlarr: xlarr,
  	xlArr: xlArr,
  	xmap: xmap,
  	xnis: xnis,
  	xodot: xodot,
  	Xopf: Xopf,
  	xopf: xopf,
  	xoplus: xoplus,
  	xotime: xotime,
  	xrarr: xrarr,
  	xrArr: xrArr,
  	Xscr: Xscr,
  	xscr: xscr,
  	xsqcup: xsqcup,
  	xuplus: xuplus,
  	xutri: xutri,
  	xvee: xvee,
  	xwedge: xwedge,
  	Yacute: Yacute,
  	yacute: yacute,
  	YAcy: YAcy,
  	yacy: yacy,
  	Ycirc: Ycirc,
  	ycirc: ycirc,
  	Ycy: Ycy,
  	ycy: ycy,
  	yen: yen,
  	Yfr: Yfr,
  	yfr: yfr,
  	YIcy: YIcy,
  	yicy: yicy,
  	Yopf: Yopf,
  	yopf: yopf,
  	Yscr: Yscr,
  	yscr: yscr,
  	YUcy: YUcy,
  	yucy: yucy,
  	yuml: yuml,
  	Yuml: Yuml,
  	Zacute: Zacute,
  	zacute: zacute,
  	Zcaron: Zcaron,
  	zcaron: zcaron,
  	Zcy: Zcy,
  	zcy: zcy,
  	Zdot: Zdot,
  	zdot: zdot,
  	zeetrf: zeetrf,
  	ZeroWidthSpace: ZeroWidthSpace,
  	Zeta: Zeta,
  	zeta: zeta,
  	zfr: zfr,
  	Zfr: Zfr,
  	ZHcy: ZHcy,
  	zhcy: zhcy,
  	zigrarr: zigrarr,
  	zopf: zopf,
  	Zopf: Zopf,
  	Zscr: Zscr,
  	zscr: zscr,
  	zwj: zwj,
  	zwnj: zwnj,
  	"in": "∈",
  	"Map": "⤅"
  };

  var entities = Object.freeze({
  	Aacute: Aacute,
  	aacute: aacute,
  	Abreve: Abreve,
  	abreve: abreve,
  	ac: ac,
  	acd: acd,
  	acE: acE,
  	Acirc: Acirc,
  	acirc: acirc,
  	acute: acute,
  	Acy: Acy,
  	acy: acy,
  	AElig: AElig,
  	aelig: aelig,
  	af: af,
  	Afr: Afr,
  	afr: afr,
  	Agrave: Agrave,
  	agrave: agrave,
  	alefsym: alefsym,
  	aleph: aleph,
  	Alpha: Alpha,
  	alpha: alpha,
  	Amacr: Amacr,
  	amacr: amacr,
  	amalg: amalg,
  	amp: amp$1,
  	AMP: AMP,
  	andand: andand,
  	And: And,
  	and: and,
  	andd: andd,
  	andslope: andslope,
  	andv: andv,
  	ang: ang,
  	ange: ange,
  	angle: angle,
  	angmsdaa: angmsdaa,
  	angmsdab: angmsdab,
  	angmsdac: angmsdac,
  	angmsdad: angmsdad,
  	angmsdae: angmsdae,
  	angmsdaf: angmsdaf,
  	angmsdag: angmsdag,
  	angmsdah: angmsdah,
  	angmsd: angmsd,
  	angrt: angrt,
  	angrtvb: angrtvb,
  	angrtvbd: angrtvbd,
  	angsph: angsph,
  	angst: angst,
  	angzarr: angzarr,
  	Aogon: Aogon,
  	aogon: aogon,
  	Aopf: Aopf,
  	aopf: aopf,
  	apacir: apacir,
  	ap: ap,
  	apE: apE,
  	ape: ape,
  	apid: apid,
  	apos: apos$1,
  	ApplyFunction: ApplyFunction,
  	approx: approx,
  	approxeq: approxeq,
  	Aring: Aring,
  	aring: aring,
  	Ascr: Ascr,
  	ascr: ascr,
  	Assign: Assign,
  	ast: ast,
  	asymp: asymp,
  	asympeq: asympeq,
  	Atilde: Atilde,
  	atilde: atilde,
  	Auml: Auml,
  	auml: auml,
  	awconint: awconint,
  	awint: awint,
  	backcong: backcong,
  	backepsilon: backepsilon,
  	backprime: backprime,
  	backsim: backsim,
  	backsimeq: backsimeq,
  	Backslash: Backslash,
  	Barv: Barv,
  	barvee: barvee,
  	barwed: barwed,
  	Barwed: Barwed,
  	barwedge: barwedge,
  	bbrk: bbrk,
  	bbrktbrk: bbrktbrk,
  	bcong: bcong,
  	Bcy: Bcy,
  	bcy: bcy,
  	bdquo: bdquo,
  	becaus: becaus,
  	because: because,
  	Because: Because,
  	bemptyv: bemptyv,
  	bepsi: bepsi,
  	bernou: bernou,
  	Bernoullis: Bernoullis,
  	Beta: Beta,
  	beta: beta,
  	beth: beth,
  	between: between,
  	Bfr: Bfr,
  	bfr: bfr,
  	bigcap: bigcap,
  	bigcirc: bigcirc,
  	bigcup: bigcup,
  	bigodot: bigodot,
  	bigoplus: bigoplus,
  	bigotimes: bigotimes,
  	bigsqcup: bigsqcup,
  	bigstar: bigstar,
  	bigtriangledown: bigtriangledown,
  	bigtriangleup: bigtriangleup,
  	biguplus: biguplus,
  	bigvee: bigvee,
  	bigwedge: bigwedge,
  	bkarow: bkarow,
  	blacklozenge: blacklozenge,
  	blacksquare: blacksquare,
  	blacktriangle: blacktriangle,
  	blacktriangledown: blacktriangledown,
  	blacktriangleleft: blacktriangleleft,
  	blacktriangleright: blacktriangleright,
  	blank: blank,
  	blk12: blk12,
  	blk14: blk14,
  	blk34: blk34,
  	block: block,
  	bne: bne,
  	bnequiv: bnequiv,
  	bNot: bNot,
  	bnot: bnot,
  	Bopf: Bopf,
  	bopf: bopf,
  	bot: bot,
  	bottom: bottom,
  	bowtie: bowtie,
  	boxbox: boxbox,
  	boxdl: boxdl,
  	boxdL: boxdL,
  	boxDl: boxDl,
  	boxDL: boxDL,
  	boxdr: boxdr,
  	boxdR: boxdR,
  	boxDr: boxDr,
  	boxDR: boxDR,
  	boxh: boxh,
  	boxH: boxH,
  	boxhd: boxhd,
  	boxHd: boxHd,
  	boxhD: boxhD,
  	boxHD: boxHD,
  	boxhu: boxhu,
  	boxHu: boxHu,
  	boxhU: boxhU,
  	boxHU: boxHU,
  	boxminus: boxminus,
  	boxplus: boxplus,
  	boxtimes: boxtimes,
  	boxul: boxul,
  	boxuL: boxuL,
  	boxUl: boxUl,
  	boxUL: boxUL,
  	boxur: boxur,
  	boxuR: boxuR,
  	boxUr: boxUr,
  	boxUR: boxUR,
  	boxv: boxv,
  	boxV: boxV,
  	boxvh: boxvh,
  	boxvH: boxvH,
  	boxVh: boxVh,
  	boxVH: boxVH,
  	boxvl: boxvl,
  	boxvL: boxvL,
  	boxVl: boxVl,
  	boxVL: boxVL,
  	boxvr: boxvr,
  	boxvR: boxvR,
  	boxVr: boxVr,
  	boxVR: boxVR,
  	bprime: bprime,
  	breve: breve,
  	Breve: Breve,
  	brvbar: brvbar,
  	bscr: bscr,
  	Bscr: Bscr,
  	bsemi: bsemi,
  	bsim: bsim,
  	bsime: bsime,
  	bsolb: bsolb,
  	bsol: bsol,
  	bsolhsub: bsolhsub,
  	bull: bull,
  	bullet: bullet,
  	bump: bump,
  	bumpE: bumpE,
  	bumpe: bumpe,
  	Bumpeq: Bumpeq,
  	bumpeq: bumpeq,
  	Cacute: Cacute,
  	cacute: cacute,
  	capand: capand,
  	capbrcup: capbrcup,
  	capcap: capcap,
  	cap: cap,
  	Cap: Cap,
  	capcup: capcup,
  	capdot: capdot,
  	CapitalDifferentialD: CapitalDifferentialD,
  	caps: caps,
  	caret: caret,
  	caron: caron,
  	Cayleys: Cayleys,
  	ccaps: ccaps,
  	Ccaron: Ccaron,
  	ccaron: ccaron,
  	Ccedil: Ccedil,
  	ccedil: ccedil,
  	Ccirc: Ccirc,
  	ccirc: ccirc,
  	Cconint: Cconint,
  	ccups: ccups,
  	ccupssm: ccupssm,
  	Cdot: Cdot,
  	cdot: cdot,
  	cedil: cedil,
  	Cedilla: Cedilla,
  	cemptyv: cemptyv,
  	cent: cent,
  	centerdot: centerdot,
  	CenterDot: CenterDot,
  	cfr: cfr,
  	Cfr: Cfr,
  	CHcy: CHcy,
  	chcy: chcy,
  	check: check,
  	checkmark: checkmark,
  	Chi: Chi,
  	chi: chi,
  	circ: circ,
  	circeq: circeq,
  	circlearrowleft: circlearrowleft,
  	circlearrowright: circlearrowright,
  	circledast: circledast,
  	circledcirc: circledcirc,
  	circleddash: circleddash,
  	CircleDot: CircleDot,
  	circledR: circledR,
  	circledS: circledS,
  	CircleMinus: CircleMinus,
  	CirclePlus: CirclePlus,
  	CircleTimes: CircleTimes,
  	cir: cir,
  	cirE: cirE,
  	cire: cire,
  	cirfnint: cirfnint,
  	cirmid: cirmid,
  	cirscir: cirscir,
  	ClockwiseContourIntegral: ClockwiseContourIntegral,
  	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
  	CloseCurlyQuote: CloseCurlyQuote,
  	clubs: clubs,
  	clubsuit: clubsuit,
  	colon: colon,
  	Colon: Colon,
  	Colone: Colone,
  	colone: colone,
  	coloneq: coloneq,
  	comma: comma,
  	commat: commat,
  	comp: comp,
  	compfn: compfn,
  	complement: complement,
  	complexes: complexes,
  	cong: cong,
  	congdot: congdot,
  	Congruent: Congruent,
  	conint: conint,
  	Conint: Conint,
  	ContourIntegral: ContourIntegral,
  	copf: copf,
  	Copf: Copf,
  	coprod: coprod,
  	Coproduct: Coproduct,
  	copy: copy,
  	COPY: COPY,
  	copysr: copysr,
  	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
  	crarr: crarr,
  	cross: cross,
  	Cross: Cross,
  	Cscr: Cscr,
  	cscr: cscr,
  	csub: csub,
  	csube: csube,
  	csup: csup,
  	csupe: csupe,
  	ctdot: ctdot,
  	cudarrl: cudarrl,
  	cudarrr: cudarrr,
  	cuepr: cuepr,
  	cuesc: cuesc,
  	cularr: cularr,
  	cularrp: cularrp,
  	cupbrcap: cupbrcap,
  	cupcap: cupcap,
  	CupCap: CupCap,
  	cup: cup,
  	Cup: Cup,
  	cupcup: cupcup,
  	cupdot: cupdot,
  	cupor: cupor,
  	cups: cups,
  	curarr: curarr,
  	curarrm: curarrm,
  	curlyeqprec: curlyeqprec,
  	curlyeqsucc: curlyeqsucc,
  	curlyvee: curlyvee,
  	curlywedge: curlywedge,
  	curren: curren,
  	curvearrowleft: curvearrowleft,
  	curvearrowright: curvearrowright,
  	cuvee: cuvee,
  	cuwed: cuwed,
  	cwconint: cwconint,
  	cwint: cwint,
  	cylcty: cylcty,
  	dagger: dagger,
  	Dagger: Dagger,
  	daleth: daleth,
  	darr: darr,
  	Darr: Darr,
  	dArr: dArr,
  	dash: dash,
  	Dashv: Dashv,
  	dashv: dashv,
  	dbkarow: dbkarow,
  	dblac: dblac,
  	Dcaron: Dcaron,
  	dcaron: dcaron,
  	Dcy: Dcy,
  	dcy: dcy,
  	ddagger: ddagger,
  	ddarr: ddarr,
  	DD: DD,
  	dd: dd,
  	DDotrahd: DDotrahd,
  	ddotseq: ddotseq,
  	deg: deg,
  	Del: Del,
  	Delta: Delta,
  	delta: delta,
  	demptyv: demptyv,
  	dfisht: dfisht,
  	Dfr: Dfr,
  	dfr: dfr,
  	dHar: dHar,
  	dharl: dharl,
  	dharr: dharr,
  	DiacriticalAcute: DiacriticalAcute,
  	DiacriticalDot: DiacriticalDot,
  	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
  	DiacriticalGrave: DiacriticalGrave,
  	DiacriticalTilde: DiacriticalTilde,
  	diam: diam,
  	diamond: diamond,
  	Diamond: Diamond,
  	diamondsuit: diamondsuit,
  	diams: diams,
  	die: die,
  	DifferentialD: DifferentialD,
  	digamma: digamma,
  	disin: disin,
  	div: div,
  	divide: divide,
  	divideontimes: divideontimes,
  	divonx: divonx,
  	DJcy: DJcy,
  	djcy: djcy,
  	dlcorn: dlcorn,
  	dlcrop: dlcrop,
  	dollar: dollar,
  	Dopf: Dopf,
  	dopf: dopf,
  	Dot: Dot,
  	dot: dot,
  	DotDot: DotDot,
  	doteq: doteq,
  	doteqdot: doteqdot,
  	DotEqual: DotEqual,
  	dotminus: dotminus,
  	dotplus: dotplus,
  	dotsquare: dotsquare,
  	doublebarwedge: doublebarwedge,
  	DoubleContourIntegral: DoubleContourIntegral,
  	DoubleDot: DoubleDot,
  	DoubleDownArrow: DoubleDownArrow,
  	DoubleLeftArrow: DoubleLeftArrow,
  	DoubleLeftRightArrow: DoubleLeftRightArrow,
  	DoubleLeftTee: DoubleLeftTee,
  	DoubleLongLeftArrow: DoubleLongLeftArrow,
  	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
  	DoubleLongRightArrow: DoubleLongRightArrow,
  	DoubleRightArrow: DoubleRightArrow,
  	DoubleRightTee: DoubleRightTee,
  	DoubleUpArrow: DoubleUpArrow,
  	DoubleUpDownArrow: DoubleUpDownArrow,
  	DoubleVerticalBar: DoubleVerticalBar,
  	DownArrowBar: DownArrowBar,
  	downarrow: downarrow,
  	DownArrow: DownArrow,
  	Downarrow: Downarrow,
  	DownArrowUpArrow: DownArrowUpArrow,
  	DownBreve: DownBreve,
  	downdownarrows: downdownarrows,
  	downharpoonleft: downharpoonleft,
  	downharpoonright: downharpoonright,
  	DownLeftRightVector: DownLeftRightVector,
  	DownLeftTeeVector: DownLeftTeeVector,
  	DownLeftVectorBar: DownLeftVectorBar,
  	DownLeftVector: DownLeftVector,
  	DownRightTeeVector: DownRightTeeVector,
  	DownRightVectorBar: DownRightVectorBar,
  	DownRightVector: DownRightVector,
  	DownTeeArrow: DownTeeArrow,
  	DownTee: DownTee,
  	drbkarow: drbkarow,
  	drcorn: drcorn,
  	drcrop: drcrop,
  	Dscr: Dscr,
  	dscr: dscr,
  	DScy: DScy,
  	dscy: dscy,
  	dsol: dsol,
  	Dstrok: Dstrok,
  	dstrok: dstrok,
  	dtdot: dtdot,
  	dtri: dtri,
  	dtrif: dtrif,
  	duarr: duarr,
  	duhar: duhar,
  	dwangle: dwangle,
  	DZcy: DZcy,
  	dzcy: dzcy,
  	dzigrarr: dzigrarr,
  	Eacute: Eacute,
  	eacute: eacute,
  	easter: easter,
  	Ecaron: Ecaron,
  	ecaron: ecaron,
  	Ecirc: Ecirc,
  	ecirc: ecirc,
  	ecir: ecir,
  	ecolon: ecolon,
  	Ecy: Ecy,
  	ecy: ecy,
  	eDDot: eDDot,
  	Edot: Edot,
  	edot: edot,
  	eDot: eDot,
  	ee: ee,
  	efDot: efDot,
  	Efr: Efr,
  	efr: efr,
  	eg: eg,
  	Egrave: Egrave,
  	egrave: egrave,
  	egs: egs,
  	egsdot: egsdot,
  	el: el,
  	Element: Element,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	Emacr: Emacr,
  	emacr: emacr,
  	empty: empty,
  	emptyset: emptyset,
  	EmptySmallSquare: EmptySmallSquare,
  	emptyv: emptyv,
  	EmptyVerySmallSquare: EmptyVerySmallSquare,
  	emsp13: emsp13,
  	emsp14: emsp14,
  	emsp: emsp,
  	ENG: ENG,
  	eng: eng,
  	ensp: ensp,
  	Eogon: Eogon,
  	eogon: eogon,
  	Eopf: Eopf,
  	eopf: eopf,
  	epar: epar,
  	eparsl: eparsl,
  	eplus: eplus,
  	epsi: epsi,
  	Epsilon: Epsilon,
  	epsilon: epsilon,
  	epsiv: epsiv,
  	eqcirc: eqcirc,
  	eqcolon: eqcolon,
  	eqsim: eqsim,
  	eqslantgtr: eqslantgtr,
  	eqslantless: eqslantless,
  	Equal: Equal,
  	equals: equals,
  	EqualTilde: EqualTilde,
  	equest: equest,
  	Equilibrium: Equilibrium,
  	equiv: equiv,
  	equivDD: equivDD,
  	eqvparsl: eqvparsl,
  	erarr: erarr,
  	erDot: erDot,
  	escr: escr,
  	Escr: Escr,
  	esdot: esdot,
  	Esim: Esim,
  	esim: esim,
  	Eta: Eta,
  	eta: eta,
  	ETH: ETH,
  	eth: eth,
  	Euml: Euml,
  	euml: euml,
  	euro: euro,
  	excl: excl,
  	exist: exist,
  	Exists: Exists,
  	expectation: expectation,
  	exponentiale: exponentiale,
  	ExponentialE: ExponentialE,
  	fallingdotseq: fallingdotseq,
  	Fcy: Fcy,
  	fcy: fcy,
  	female: female,
  	ffilig: ffilig,
  	fflig: fflig,
  	ffllig: ffllig,
  	Ffr: Ffr,
  	ffr: ffr,
  	filig: filig,
  	FilledSmallSquare: FilledSmallSquare,
  	FilledVerySmallSquare: FilledVerySmallSquare,
  	fjlig: fjlig,
  	flat: flat,
  	fllig: fllig,
  	fltns: fltns,
  	fnof: fnof,
  	Fopf: Fopf,
  	fopf: fopf,
  	forall: forall,
  	ForAll: ForAll,
  	fork: fork,
  	forkv: forkv,
  	Fouriertrf: Fouriertrf,
  	fpartint: fpartint,
  	frac12: frac12,
  	frac13: frac13,
  	frac14: frac14,
  	frac15: frac15,
  	frac16: frac16,
  	frac18: frac18,
  	frac23: frac23,
  	frac25: frac25,
  	frac34: frac34,
  	frac35: frac35,
  	frac38: frac38,
  	frac45: frac45,
  	frac56: frac56,
  	frac58: frac58,
  	frac78: frac78,
  	frasl: frasl,
  	frown: frown,
  	fscr: fscr,
  	Fscr: Fscr,
  	gacute: gacute,
  	Gamma: Gamma,
  	gamma: gamma,
  	Gammad: Gammad,
  	gammad: gammad,
  	gap: gap,
  	Gbreve: Gbreve,
  	gbreve: gbreve,
  	Gcedil: Gcedil,
  	Gcirc: Gcirc,
  	gcirc: gcirc,
  	Gcy: Gcy,
  	gcy: gcy,
  	Gdot: Gdot,
  	gdot: gdot,
  	ge: ge,
  	gE: gE,
  	gEl: gEl,
  	gel: gel,
  	geq: geq,
  	geqq: geqq,
  	geqslant: geqslant,
  	gescc: gescc,
  	ges: ges,
  	gesdot: gesdot,
  	gesdoto: gesdoto,
  	gesdotol: gesdotol,
  	gesl: gesl,
  	gesles: gesles,
  	Gfr: Gfr,
  	gfr: gfr,
  	gg: gg,
  	Gg: Gg,
  	ggg: ggg,
  	gimel: gimel,
  	GJcy: GJcy,
  	gjcy: gjcy,
  	gla: gla,
  	gl: gl,
  	glE: glE,
  	glj: glj,
  	gnap: gnap,
  	gnapprox: gnapprox,
  	gne: gne,
  	gnE: gnE,
  	gneq: gneq,
  	gneqq: gneqq,
  	gnsim: gnsim,
  	Gopf: Gopf,
  	gopf: gopf,
  	grave: grave,
  	GreaterEqual: GreaterEqual,
  	GreaterEqualLess: GreaterEqualLess,
  	GreaterFullEqual: GreaterFullEqual,
  	GreaterGreater: GreaterGreater,
  	GreaterLess: GreaterLess,
  	GreaterSlantEqual: GreaterSlantEqual,
  	GreaterTilde: GreaterTilde,
  	Gscr: Gscr,
  	gscr: gscr,
  	gsim: gsim,
  	gsime: gsime,
  	gsiml: gsiml,
  	gtcc: gtcc,
  	gtcir: gtcir,
  	gt: gt$1,
  	GT: GT,
  	Gt: Gt,
  	gtdot: gtdot,
  	gtlPar: gtlPar,
  	gtquest: gtquest,
  	gtrapprox: gtrapprox,
  	gtrarr: gtrarr,
  	gtrdot: gtrdot,
  	gtreqless: gtreqless,
  	gtreqqless: gtreqqless,
  	gtrless: gtrless,
  	gtrsim: gtrsim,
  	gvertneqq: gvertneqq,
  	gvnE: gvnE,
  	Hacek: Hacek,
  	hairsp: hairsp,
  	half: half,
  	hamilt: hamilt,
  	HARDcy: HARDcy,
  	hardcy: hardcy,
  	harrcir: harrcir,
  	harr: harr,
  	hArr: hArr,
  	harrw: harrw,
  	Hat: Hat,
  	hbar: hbar,
  	Hcirc: Hcirc,
  	hcirc: hcirc,
  	hearts: hearts,
  	heartsuit: heartsuit,
  	hellip: hellip,
  	hercon: hercon,
  	hfr: hfr,
  	Hfr: Hfr,
  	HilbertSpace: HilbertSpace,
  	hksearow: hksearow,
  	hkswarow: hkswarow,
  	hoarr: hoarr,
  	homtht: homtht,
  	hookleftarrow: hookleftarrow,
  	hookrightarrow: hookrightarrow,
  	hopf: hopf,
  	Hopf: Hopf,
  	horbar: horbar,
  	HorizontalLine: HorizontalLine,
  	hscr: hscr,
  	Hscr: Hscr,
  	hslash: hslash,
  	Hstrok: Hstrok,
  	hstrok: hstrok,
  	HumpDownHump: HumpDownHump,
  	HumpEqual: HumpEqual,
  	hybull: hybull,
  	hyphen: hyphen,
  	Iacute: Iacute,
  	iacute: iacute,
  	ic: ic,
  	Icirc: Icirc,
  	icirc: icirc,
  	Icy: Icy,
  	icy: icy,
  	Idot: Idot,
  	IEcy: IEcy,
  	iecy: iecy,
  	iexcl: iexcl,
  	iff: iff,
  	ifr: ifr,
  	Ifr: Ifr,
  	Igrave: Igrave,
  	igrave: igrave,
  	ii: ii,
  	iiiint: iiiint,
  	iiint: iiint,
  	iinfin: iinfin,
  	iiota: iiota,
  	IJlig: IJlig,
  	ijlig: ijlig,
  	Imacr: Imacr,
  	imacr: imacr,
  	image: image,
  	ImaginaryI: ImaginaryI,
  	imagline: imagline,
  	imagpart: imagpart,
  	imath: imath,
  	Im: Im,
  	imof: imof,
  	imped: imped,
  	Implies: Implies,
  	incare: incare,
  	infin: infin,
  	infintie: infintie,
  	inodot: inodot,
  	intcal: intcal,
  	int: int,
  	Int: Int,
  	integers: integers,
  	Integral: Integral,
  	intercal: intercal,
  	Intersection: Intersection,
  	intlarhk: intlarhk,
  	intprod: intprod,
  	InvisibleComma: InvisibleComma,
  	InvisibleTimes: InvisibleTimes,
  	IOcy: IOcy,
  	iocy: iocy,
  	Iogon: Iogon,
  	iogon: iogon,
  	Iopf: Iopf,
  	iopf: iopf,
  	Iota: Iota,
  	iota: iota,
  	iprod: iprod,
  	iquest: iquest,
  	iscr: iscr,
  	Iscr: Iscr,
  	isin: isin,
  	isindot: isindot,
  	isinE: isinE,
  	isins: isins,
  	isinsv: isinsv,
  	isinv: isinv,
  	it: it,
  	Itilde: Itilde,
  	itilde: itilde,
  	Iukcy: Iukcy,
  	iukcy: iukcy,
  	Iuml: Iuml,
  	iuml: iuml,
  	Jcirc: Jcirc,
  	jcirc: jcirc,
  	Jcy: Jcy,
  	jcy: jcy,
  	Jfr: Jfr,
  	jfr: jfr,
  	jmath: jmath,
  	Jopf: Jopf,
  	jopf: jopf,
  	Jscr: Jscr,
  	jscr: jscr,
  	Jsercy: Jsercy,
  	jsercy: jsercy,
  	Jukcy: Jukcy,
  	jukcy: jukcy,
  	Kappa: Kappa,
  	kappa: kappa,
  	kappav: kappav,
  	Kcedil: Kcedil,
  	kcedil: kcedil,
  	Kcy: Kcy,
  	kcy: kcy,
  	Kfr: Kfr,
  	kfr: kfr,
  	kgreen: kgreen,
  	KHcy: KHcy,
  	khcy: khcy,
  	KJcy: KJcy,
  	kjcy: kjcy,
  	Kopf: Kopf,
  	kopf: kopf,
  	Kscr: Kscr,
  	kscr: kscr,
  	lAarr: lAarr,
  	Lacute: Lacute,
  	lacute: lacute,
  	laemptyv: laemptyv,
  	lagran: lagran,
  	Lambda: Lambda,
  	lambda: lambda,
  	lang: lang,
  	Lang: Lang,
  	langd: langd,
  	langle: langle,
  	lap: lap,
  	Laplacetrf: Laplacetrf,
  	laquo: laquo,
  	larrb: larrb,
  	larrbfs: larrbfs,
  	larr: larr,
  	Larr: Larr,
  	lArr: lArr,
  	larrfs: larrfs,
  	larrhk: larrhk,
  	larrlp: larrlp,
  	larrpl: larrpl,
  	larrsim: larrsim,
  	larrtl: larrtl,
  	latail: latail,
  	lAtail: lAtail,
  	lat: lat,
  	late: late,
  	lates: lates,
  	lbarr: lbarr,
  	lBarr: lBarr,
  	lbbrk: lbbrk,
  	lbrace: lbrace,
  	lbrack: lbrack,
  	lbrke: lbrke,
  	lbrksld: lbrksld,
  	lbrkslu: lbrkslu,
  	Lcaron: Lcaron,
  	lcaron: lcaron,
  	Lcedil: Lcedil,
  	lcedil: lcedil,
  	lceil: lceil,
  	lcub: lcub,
  	Lcy: Lcy,
  	lcy: lcy,
  	ldca: ldca,
  	ldquo: ldquo,
  	ldquor: ldquor,
  	ldrdhar: ldrdhar,
  	ldrushar: ldrushar,
  	ldsh: ldsh,
  	le: le,
  	lE: lE,
  	LeftAngleBracket: LeftAngleBracket,
  	LeftArrowBar: LeftArrowBar,
  	leftarrow: leftarrow,
  	LeftArrow: LeftArrow,
  	Leftarrow: Leftarrow,
  	LeftArrowRightArrow: LeftArrowRightArrow,
  	leftarrowtail: leftarrowtail,
  	LeftCeiling: LeftCeiling,
  	LeftDoubleBracket: LeftDoubleBracket,
  	LeftDownTeeVector: LeftDownTeeVector,
  	LeftDownVectorBar: LeftDownVectorBar,
  	LeftDownVector: LeftDownVector,
  	LeftFloor: LeftFloor,
  	leftharpoondown: leftharpoondown,
  	leftharpoonup: leftharpoonup,
  	leftleftarrows: leftleftarrows,
  	leftrightarrow: leftrightarrow,
  	LeftRightArrow: LeftRightArrow,
  	Leftrightarrow: Leftrightarrow,
  	leftrightarrows: leftrightarrows,
  	leftrightharpoons: leftrightharpoons,
  	leftrightsquigarrow: leftrightsquigarrow,
  	LeftRightVector: LeftRightVector,
  	LeftTeeArrow: LeftTeeArrow,
  	LeftTee: LeftTee,
  	LeftTeeVector: LeftTeeVector,
  	leftthreetimes: leftthreetimes,
  	LeftTriangleBar: LeftTriangleBar,
  	LeftTriangle: LeftTriangle,
  	LeftTriangleEqual: LeftTriangleEqual,
  	LeftUpDownVector: LeftUpDownVector,
  	LeftUpTeeVector: LeftUpTeeVector,
  	LeftUpVectorBar: LeftUpVectorBar,
  	LeftUpVector: LeftUpVector,
  	LeftVectorBar: LeftVectorBar,
  	LeftVector: LeftVector,
  	lEg: lEg,
  	leg: leg,
  	leq: leq,
  	leqq: leqq,
  	leqslant: leqslant,
  	lescc: lescc,
  	les: les,
  	lesdot: lesdot,
  	lesdoto: lesdoto,
  	lesdotor: lesdotor,
  	lesg: lesg,
  	lesges: lesges,
  	lessapprox: lessapprox,
  	lessdot: lessdot,
  	lesseqgtr: lesseqgtr,
  	lesseqqgtr: lesseqqgtr,
  	LessEqualGreater: LessEqualGreater,
  	LessFullEqual: LessFullEqual,
  	LessGreater: LessGreater,
  	lessgtr: lessgtr,
  	LessLess: LessLess,
  	lesssim: lesssim,
  	LessSlantEqual: LessSlantEqual,
  	LessTilde: LessTilde,
  	lfisht: lfisht,
  	lfloor: lfloor,
  	Lfr: Lfr,
  	lfr: lfr,
  	lg: lg,
  	lgE: lgE,
  	lHar: lHar,
  	lhard: lhard,
  	lharu: lharu,
  	lharul: lharul,
  	lhblk: lhblk,
  	LJcy: LJcy,
  	ljcy: ljcy,
  	llarr: llarr,
  	ll: ll,
  	Ll: Ll,
  	llcorner: llcorner,
  	Lleftarrow: Lleftarrow,
  	llhard: llhard,
  	lltri: lltri,
  	Lmidot: Lmidot,
  	lmidot: lmidot,
  	lmoustache: lmoustache,
  	lmoust: lmoust,
  	lnap: lnap,
  	lnapprox: lnapprox,
  	lne: lne,
  	lnE: lnE,
  	lneq: lneq,
  	lneqq: lneqq,
  	lnsim: lnsim,
  	loang: loang,
  	loarr: loarr,
  	lobrk: lobrk,
  	longleftarrow: longleftarrow,
  	LongLeftArrow: LongLeftArrow,
  	Longleftarrow: Longleftarrow,
  	longleftrightarrow: longleftrightarrow,
  	LongLeftRightArrow: LongLeftRightArrow,
  	Longleftrightarrow: Longleftrightarrow,
  	longmapsto: longmapsto,
  	longrightarrow: longrightarrow,
  	LongRightArrow: LongRightArrow,
  	Longrightarrow: Longrightarrow,
  	looparrowleft: looparrowleft,
  	looparrowright: looparrowright,
  	lopar: lopar,
  	Lopf: Lopf,
  	lopf: lopf,
  	loplus: loplus,
  	lotimes: lotimes,
  	lowast: lowast,
  	lowbar: lowbar,
  	LowerLeftArrow: LowerLeftArrow,
  	LowerRightArrow: LowerRightArrow,
  	loz: loz,
  	lozenge: lozenge,
  	lozf: lozf,
  	lpar: lpar,
  	lparlt: lparlt,
  	lrarr: lrarr,
  	lrcorner: lrcorner,
  	lrhar: lrhar,
  	lrhard: lrhard,
  	lrm: lrm,
  	lrtri: lrtri,
  	lsaquo: lsaquo,
  	lscr: lscr,
  	Lscr: Lscr,
  	lsh: lsh,
  	Lsh: Lsh,
  	lsim: lsim,
  	lsime: lsime,
  	lsimg: lsimg,
  	lsqb: lsqb,
  	lsquo: lsquo,
  	lsquor: lsquor,
  	Lstrok: Lstrok,
  	lstrok: lstrok,
  	ltcc: ltcc,
  	ltcir: ltcir,
  	lt: lt$1,
  	LT: LT,
  	Lt: Lt,
  	ltdot: ltdot,
  	lthree: lthree,
  	ltimes: ltimes,
  	ltlarr: ltlarr,
  	ltquest: ltquest,
  	ltri: ltri,
  	ltrie: ltrie,
  	ltrif: ltrif,
  	ltrPar: ltrPar,
  	lurdshar: lurdshar,
  	luruhar: luruhar,
  	lvertneqq: lvertneqq,
  	lvnE: lvnE,
  	macr: macr,
  	male: male,
  	malt: malt,
  	maltese: maltese,
  	map: map,
  	mapsto: mapsto,
  	mapstodown: mapstodown,
  	mapstoleft: mapstoleft,
  	mapstoup: mapstoup,
  	marker: marker,
  	mcomma: mcomma,
  	Mcy: Mcy,
  	mcy: mcy,
  	mdash: mdash,
  	mDDot: mDDot,
  	measuredangle: measuredangle,
  	MediumSpace: MediumSpace,
  	Mellintrf: Mellintrf,
  	Mfr: Mfr,
  	mfr: mfr,
  	mho: mho,
  	micro: micro,
  	midast: midast,
  	midcir: midcir,
  	mid: mid,
  	middot: middot,
  	minusb: minusb,
  	minus: minus,
  	minusd: minusd,
  	minusdu: minusdu,
  	MinusPlus: MinusPlus,
  	mlcp: mlcp,
  	mldr: mldr,
  	mnplus: mnplus,
  	models: models,
  	Mopf: Mopf,
  	mopf: mopf,
  	mp: mp,
  	mscr: mscr,
  	Mscr: Mscr,
  	mstpos: mstpos,
  	Mu: Mu,
  	mu: mu,
  	multimap: multimap,
  	mumap: mumap,
  	nabla: nabla,
  	Nacute: Nacute,
  	nacute: nacute,
  	nang: nang,
  	nap: nap,
  	napE: napE,
  	napid: napid,
  	napos: napos,
  	napprox: napprox,
  	natural: natural,
  	naturals: naturals,
  	natur: natur,
  	nbsp: nbsp,
  	nbump: nbump,
  	nbumpe: nbumpe,
  	ncap: ncap,
  	Ncaron: Ncaron,
  	ncaron: ncaron,
  	Ncedil: Ncedil,
  	ncedil: ncedil,
  	ncong: ncong,
  	ncongdot: ncongdot,
  	ncup: ncup,
  	Ncy: Ncy,
  	ncy: ncy,
  	ndash: ndash,
  	nearhk: nearhk,
  	nearr: nearr,
  	neArr: neArr,
  	nearrow: nearrow,
  	ne: ne,
  	nedot: nedot,
  	NegativeMediumSpace: NegativeMediumSpace,
  	NegativeThickSpace: NegativeThickSpace,
  	NegativeThinSpace: NegativeThinSpace,
  	NegativeVeryThinSpace: NegativeVeryThinSpace,
  	nequiv: nequiv,
  	nesear: nesear,
  	nesim: nesim,
  	NestedGreaterGreater: NestedGreaterGreater,
  	NestedLessLess: NestedLessLess,
  	NewLine: NewLine,
  	nexist: nexist,
  	nexists: nexists,
  	Nfr: Nfr,
  	nfr: nfr,
  	ngE: ngE,
  	nge: nge,
  	ngeq: ngeq,
  	ngeqq: ngeqq,
  	ngeqslant: ngeqslant,
  	nges: nges,
  	nGg: nGg,
  	ngsim: ngsim,
  	nGt: nGt,
  	ngt: ngt,
  	ngtr: ngtr,
  	nGtv: nGtv,
  	nharr: nharr,
  	nhArr: nhArr,
  	nhpar: nhpar,
  	ni: ni,
  	nis: nis,
  	nisd: nisd,
  	niv: niv,
  	NJcy: NJcy,
  	njcy: njcy,
  	nlarr: nlarr,
  	nlArr: nlArr,
  	nldr: nldr,
  	nlE: nlE,
  	nle: nle,
  	nleftarrow: nleftarrow,
  	nLeftarrow: nLeftarrow,
  	nleftrightarrow: nleftrightarrow,
  	nLeftrightarrow: nLeftrightarrow,
  	nleq: nleq,
  	nleqq: nleqq,
  	nleqslant: nleqslant,
  	nles: nles,
  	nless: nless,
  	nLl: nLl,
  	nlsim: nlsim,
  	nLt: nLt,
  	nlt: nlt,
  	nltri: nltri,
  	nltrie: nltrie,
  	nLtv: nLtv,
  	nmid: nmid,
  	NoBreak: NoBreak,
  	NonBreakingSpace: NonBreakingSpace,
  	nopf: nopf,
  	Nopf: Nopf,
  	Not: Not,
  	not: not,
  	NotCongruent: NotCongruent,
  	NotCupCap: NotCupCap,
  	NotDoubleVerticalBar: NotDoubleVerticalBar,
  	NotElement: NotElement,
  	NotEqual: NotEqual,
  	NotEqualTilde: NotEqualTilde,
  	NotExists: NotExists,
  	NotGreater: NotGreater,
  	NotGreaterEqual: NotGreaterEqual,
  	NotGreaterFullEqual: NotGreaterFullEqual,
  	NotGreaterGreater: NotGreaterGreater,
  	NotGreaterLess: NotGreaterLess,
  	NotGreaterSlantEqual: NotGreaterSlantEqual,
  	NotGreaterTilde: NotGreaterTilde,
  	NotHumpDownHump: NotHumpDownHump,
  	NotHumpEqual: NotHumpEqual,
  	notin: notin,
  	notindot: notindot,
  	notinE: notinE,
  	notinva: notinva,
  	notinvb: notinvb,
  	notinvc: notinvc,
  	NotLeftTriangleBar: NotLeftTriangleBar,
  	NotLeftTriangle: NotLeftTriangle,
  	NotLeftTriangleEqual: NotLeftTriangleEqual,
  	NotLess: NotLess,
  	NotLessEqual: NotLessEqual,
  	NotLessGreater: NotLessGreater,
  	NotLessLess: NotLessLess,
  	NotLessSlantEqual: NotLessSlantEqual,
  	NotLessTilde: NotLessTilde,
  	NotNestedGreaterGreater: NotNestedGreaterGreater,
  	NotNestedLessLess: NotNestedLessLess,
  	notni: notni,
  	notniva: notniva,
  	notnivb: notnivb,
  	notnivc: notnivc,
  	NotPrecedes: NotPrecedes,
  	NotPrecedesEqual: NotPrecedesEqual,
  	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
  	NotReverseElement: NotReverseElement,
  	NotRightTriangleBar: NotRightTriangleBar,
  	NotRightTriangle: NotRightTriangle,
  	NotRightTriangleEqual: NotRightTriangleEqual,
  	NotSquareSubset: NotSquareSubset,
  	NotSquareSubsetEqual: NotSquareSubsetEqual,
  	NotSquareSuperset: NotSquareSuperset,
  	NotSquareSupersetEqual: NotSquareSupersetEqual,
  	NotSubset: NotSubset,
  	NotSubsetEqual: NotSubsetEqual,
  	NotSucceeds: NotSucceeds,
  	NotSucceedsEqual: NotSucceedsEqual,
  	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
  	NotSucceedsTilde: NotSucceedsTilde,
  	NotSuperset: NotSuperset,
  	NotSupersetEqual: NotSupersetEqual,
  	NotTilde: NotTilde,
  	NotTildeEqual: NotTildeEqual,
  	NotTildeFullEqual: NotTildeFullEqual,
  	NotTildeTilde: NotTildeTilde,
  	NotVerticalBar: NotVerticalBar,
  	nparallel: nparallel,
  	npar: npar,
  	nparsl: nparsl,
  	npart: npart,
  	npolint: npolint,
  	npr: npr,
  	nprcue: nprcue,
  	nprec: nprec,
  	npreceq: npreceq,
  	npre: npre,
  	nrarrc: nrarrc,
  	nrarr: nrarr,
  	nrArr: nrArr,
  	nrarrw: nrarrw,
  	nrightarrow: nrightarrow,
  	nRightarrow: nRightarrow,
  	nrtri: nrtri,
  	nrtrie: nrtrie,
  	nsc: nsc,
  	nsccue: nsccue,
  	nsce: nsce,
  	Nscr: Nscr,
  	nscr: nscr,
  	nshortmid: nshortmid,
  	nshortparallel: nshortparallel,
  	nsim: nsim,
  	nsime: nsime,
  	nsimeq: nsimeq,
  	nsmid: nsmid,
  	nspar: nspar,
  	nsqsube: nsqsube,
  	nsqsupe: nsqsupe,
  	nsub: nsub,
  	nsubE: nsubE,
  	nsube: nsube,
  	nsubset: nsubset,
  	nsubseteq: nsubseteq,
  	nsubseteqq: nsubseteqq,
  	nsucc: nsucc,
  	nsucceq: nsucceq,
  	nsup: nsup,
  	nsupE: nsupE,
  	nsupe: nsupe,
  	nsupset: nsupset,
  	nsupseteq: nsupseteq,
  	nsupseteqq: nsupseteqq,
  	ntgl: ntgl,
  	Ntilde: Ntilde,
  	ntilde: ntilde,
  	ntlg: ntlg,
  	ntriangleleft: ntriangleleft,
  	ntrianglelefteq: ntrianglelefteq,
  	ntriangleright: ntriangleright,
  	ntrianglerighteq: ntrianglerighteq,
  	Nu: Nu,
  	nu: nu,
  	num: num,
  	numero: numero,
  	numsp: numsp,
  	nvap: nvap,
  	nvdash: nvdash,
  	nvDash: nvDash,
  	nVdash: nVdash,
  	nVDash: nVDash,
  	nvge: nvge,
  	nvgt: nvgt,
  	nvHarr: nvHarr,
  	nvinfin: nvinfin,
  	nvlArr: nvlArr,
  	nvle: nvle,
  	nvlt: nvlt,
  	nvltrie: nvltrie,
  	nvrArr: nvrArr,
  	nvrtrie: nvrtrie,
  	nvsim: nvsim,
  	nwarhk: nwarhk,
  	nwarr: nwarr,
  	nwArr: nwArr,
  	nwarrow: nwarrow,
  	nwnear: nwnear,
  	Oacute: Oacute,
  	oacute: oacute,
  	oast: oast,
  	Ocirc: Ocirc,
  	ocirc: ocirc,
  	ocir: ocir,
  	Ocy: Ocy,
  	ocy: ocy,
  	odash: odash,
  	Odblac: Odblac,
  	odblac: odblac,
  	odiv: odiv,
  	odot: odot,
  	odsold: odsold,
  	OElig: OElig,
  	oelig: oelig,
  	ofcir: ofcir,
  	Ofr: Ofr,
  	ofr: ofr,
  	ogon: ogon,
  	Ograve: Ograve,
  	ograve: ograve,
  	ogt: ogt,
  	ohbar: ohbar,
  	ohm: ohm,
  	oint: oint,
  	olarr: olarr,
  	olcir: olcir,
  	olcross: olcross,
  	oline: oline,
  	olt: olt,
  	Omacr: Omacr,
  	omacr: omacr,
  	Omega: Omega,
  	omega: omega,
  	Omicron: Omicron,
  	omicron: omicron,
  	omid: omid,
  	ominus: ominus,
  	Oopf: Oopf,
  	oopf: oopf,
  	opar: opar,
  	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
  	OpenCurlyQuote: OpenCurlyQuote,
  	operp: operp,
  	oplus: oplus,
  	orarr: orarr,
  	Or: Or,
  	or: or,
  	ord: ord,
  	order: order,
  	orderof: orderof,
  	ordf: ordf,
  	ordm: ordm,
  	origof: origof,
  	oror: oror,
  	orslope: orslope,
  	orv: orv,
  	oS: oS,
  	Oscr: Oscr,
  	oscr: oscr,
  	Oslash: Oslash,
  	oslash: oslash,
  	osol: osol,
  	Otilde: Otilde,
  	otilde: otilde,
  	otimesas: otimesas,
  	Otimes: Otimes,
  	otimes: otimes,
  	Ouml: Ouml,
  	ouml: ouml,
  	ovbar: ovbar,
  	OverBar: OverBar,
  	OverBrace: OverBrace,
  	OverBracket: OverBracket,
  	OverParenthesis: OverParenthesis,
  	para: para,
  	parallel: parallel,
  	par: par,
  	parsim: parsim,
  	parsl: parsl,
  	part: part,
  	PartialD: PartialD,
  	Pcy: Pcy,
  	pcy: pcy,
  	percnt: percnt,
  	period: period,
  	permil: permil,
  	perp: perp,
  	pertenk: pertenk,
  	Pfr: Pfr,
  	pfr: pfr,
  	Phi: Phi,
  	phi: phi,
  	phiv: phiv,
  	phmmat: phmmat,
  	phone: phone,
  	Pi: Pi,
  	pi: pi,
  	pitchfork: pitchfork,
  	piv: piv,
  	planck: planck,
  	planckh: planckh,
  	plankv: plankv,
  	plusacir: plusacir,
  	plusb: plusb,
  	pluscir: pluscir,
  	plus: plus,
  	plusdo: plusdo,
  	plusdu: plusdu,
  	pluse: pluse,
  	PlusMinus: PlusMinus,
  	plusmn: plusmn,
  	plussim: plussim,
  	plustwo: plustwo,
  	pm: pm,
  	Poincareplane: Poincareplane,
  	pointint: pointint,
  	popf: popf,
  	Popf: Popf,
  	pound: pound,
  	prap: prap,
  	Pr: Pr,
  	pr: pr,
  	prcue: prcue,
  	precapprox: precapprox,
  	prec: prec,
  	preccurlyeq: preccurlyeq,
  	Precedes: Precedes,
  	PrecedesEqual: PrecedesEqual,
  	PrecedesSlantEqual: PrecedesSlantEqual,
  	PrecedesTilde: PrecedesTilde,
  	preceq: preceq,
  	precnapprox: precnapprox,
  	precneqq: precneqq,
  	precnsim: precnsim,
  	pre: pre,
  	prE: prE,
  	precsim: precsim,
  	prime: prime,
  	Prime: Prime,
  	primes: primes,
  	prnap: prnap,
  	prnE: prnE,
  	prnsim: prnsim,
  	prod: prod,
  	Product: Product,
  	profalar: profalar,
  	profline: profline,
  	profsurf: profsurf,
  	prop: prop,
  	Proportional: Proportional,
  	Proportion: Proportion,
  	propto: propto,
  	prsim: prsim,
  	prurel: prurel,
  	Pscr: Pscr,
  	pscr: pscr,
  	Psi: Psi,
  	psi: psi,
  	puncsp: puncsp,
  	Qfr: Qfr,
  	qfr: qfr,
  	qint: qint,
  	qopf: qopf,
  	Qopf: Qopf,
  	qprime: qprime,
  	Qscr: Qscr,
  	qscr: qscr,
  	quaternions: quaternions,
  	quatint: quatint,
  	quest: quest,
  	questeq: questeq,
  	quot: quot$1,
  	QUOT: QUOT,
  	rAarr: rAarr,
  	race: race,
  	Racute: Racute,
  	racute: racute,
  	radic: radic,
  	raemptyv: raemptyv,
  	rang: rang,
  	Rang: Rang,
  	rangd: rangd,
  	range: range,
  	rangle: rangle,
  	raquo: raquo,
  	rarrap: rarrap,
  	rarrb: rarrb,
  	rarrbfs: rarrbfs,
  	rarrc: rarrc,
  	rarr: rarr,
  	Rarr: Rarr,
  	rArr: rArr,
  	rarrfs: rarrfs,
  	rarrhk: rarrhk,
  	rarrlp: rarrlp,
  	rarrpl: rarrpl,
  	rarrsim: rarrsim,
  	Rarrtl: Rarrtl,
  	rarrtl: rarrtl,
  	rarrw: rarrw,
  	ratail: ratail,
  	rAtail: rAtail,
  	ratio: ratio,
  	rationals: rationals,
  	rbarr: rbarr,
  	rBarr: rBarr,
  	RBarr: RBarr,
  	rbbrk: rbbrk,
  	rbrace: rbrace,
  	rbrack: rbrack,
  	rbrke: rbrke,
  	rbrksld: rbrksld,
  	rbrkslu: rbrkslu,
  	Rcaron: Rcaron,
  	rcaron: rcaron,
  	Rcedil: Rcedil,
  	rcedil: rcedil,
  	rceil: rceil,
  	rcub: rcub,
  	Rcy: Rcy,
  	rcy: rcy,
  	rdca: rdca,
  	rdldhar: rdldhar,
  	rdquo: rdquo,
  	rdquor: rdquor,
  	rdsh: rdsh,
  	real: real,
  	realine: realine,
  	realpart: realpart,
  	reals: reals,
  	Re: Re,
  	rect: rect,
  	reg: reg,
  	REG: REG,
  	ReverseElement: ReverseElement,
  	ReverseEquilibrium: ReverseEquilibrium,
  	ReverseUpEquilibrium: ReverseUpEquilibrium,
  	rfisht: rfisht,
  	rfloor: rfloor,
  	rfr: rfr,
  	Rfr: Rfr,
  	rHar: rHar,
  	rhard: rhard,
  	rharu: rharu,
  	rharul: rharul,
  	Rho: Rho,
  	rho: rho,
  	rhov: rhov,
  	RightAngleBracket: RightAngleBracket,
  	RightArrowBar: RightArrowBar,
  	rightarrow: rightarrow,
  	RightArrow: RightArrow,
  	Rightarrow: Rightarrow,
  	RightArrowLeftArrow: RightArrowLeftArrow,
  	rightarrowtail: rightarrowtail,
  	RightCeiling: RightCeiling,
  	RightDoubleBracket: RightDoubleBracket,
  	RightDownTeeVector: RightDownTeeVector,
  	RightDownVectorBar: RightDownVectorBar,
  	RightDownVector: RightDownVector,
  	RightFloor: RightFloor,
  	rightharpoondown: rightharpoondown,
  	rightharpoonup: rightharpoonup,
  	rightleftarrows: rightleftarrows,
  	rightleftharpoons: rightleftharpoons,
  	rightrightarrows: rightrightarrows,
  	rightsquigarrow: rightsquigarrow,
  	RightTeeArrow: RightTeeArrow,
  	RightTee: RightTee,
  	RightTeeVector: RightTeeVector,
  	rightthreetimes: rightthreetimes,
  	RightTriangleBar: RightTriangleBar,
  	RightTriangle: RightTriangle,
  	RightTriangleEqual: RightTriangleEqual,
  	RightUpDownVector: RightUpDownVector,
  	RightUpTeeVector: RightUpTeeVector,
  	RightUpVectorBar: RightUpVectorBar,
  	RightUpVector: RightUpVector,
  	RightVectorBar: RightVectorBar,
  	RightVector: RightVector,
  	ring: ring,
  	risingdotseq: risingdotseq,
  	rlarr: rlarr,
  	rlhar: rlhar,
  	rlm: rlm,
  	rmoustache: rmoustache,
  	rmoust: rmoust,
  	rnmid: rnmid,
  	roang: roang,
  	roarr: roarr,
  	robrk: robrk,
  	ropar: ropar,
  	ropf: ropf,
  	Ropf: Ropf,
  	roplus: roplus,
  	rotimes: rotimes,
  	RoundImplies: RoundImplies,
  	rpar: rpar,
  	rpargt: rpargt,
  	rppolint: rppolint,
  	rrarr: rrarr,
  	Rrightarrow: Rrightarrow,
  	rsaquo: rsaquo,
  	rscr: rscr,
  	Rscr: Rscr,
  	rsh: rsh,
  	Rsh: Rsh,
  	rsqb: rsqb,
  	rsquo: rsquo,
  	rsquor: rsquor,
  	rthree: rthree,
  	rtimes: rtimes,
  	rtri: rtri,
  	rtrie: rtrie,
  	rtrif: rtrif,
  	rtriltri: rtriltri,
  	RuleDelayed: RuleDelayed,
  	ruluhar: ruluhar,
  	rx: rx,
  	Sacute: Sacute,
  	sacute: sacute,
  	sbquo: sbquo,
  	scap: scap,
  	Scaron: Scaron,
  	scaron: scaron,
  	Sc: Sc,
  	sc: sc,
  	sccue: sccue,
  	sce: sce,
  	scE: scE,
  	Scedil: Scedil,
  	scedil: scedil,
  	Scirc: Scirc,
  	scirc: scirc,
  	scnap: scnap,
  	scnE: scnE,
  	scnsim: scnsim,
  	scpolint: scpolint,
  	scsim: scsim,
  	Scy: Scy,
  	scy: scy,
  	sdotb: sdotb,
  	sdot: sdot,
  	sdote: sdote,
  	searhk: searhk,
  	searr: searr,
  	seArr: seArr,
  	searrow: searrow,
  	sect: sect,
  	semi: semi,
  	seswar: seswar,
  	setminus: setminus,
  	setmn: setmn,
  	sext: sext,
  	Sfr: Sfr,
  	sfr: sfr,
  	sfrown: sfrown,
  	sharp: sharp,
  	SHCHcy: SHCHcy,
  	shchcy: shchcy,
  	SHcy: SHcy,
  	shcy: shcy,
  	ShortDownArrow: ShortDownArrow,
  	ShortLeftArrow: ShortLeftArrow,
  	shortmid: shortmid,
  	shortparallel: shortparallel,
  	ShortRightArrow: ShortRightArrow,
  	ShortUpArrow: ShortUpArrow,
  	shy: shy,
  	Sigma: Sigma,
  	sigma: sigma,
  	sigmaf: sigmaf,
  	sigmav: sigmav,
  	sim: sim,
  	simdot: simdot,
  	sime: sime,
  	simeq: simeq,
  	simg: simg,
  	simgE: simgE,
  	siml: siml,
  	simlE: simlE,
  	simne: simne,
  	simplus: simplus,
  	simrarr: simrarr,
  	slarr: slarr,
  	SmallCircle: SmallCircle,
  	smallsetminus: smallsetminus,
  	smashp: smashp,
  	smeparsl: smeparsl,
  	smid: smid,
  	smile: smile,
  	smt: smt,
  	smte: smte,
  	smtes: smtes,
  	SOFTcy: SOFTcy,
  	softcy: softcy,
  	solbar: solbar,
  	solb: solb,
  	sol: sol,
  	Sopf: Sopf,
  	sopf: sopf,
  	spades: spades,
  	spadesuit: spadesuit,
  	spar: spar,
  	sqcap: sqcap,
  	sqcaps: sqcaps,
  	sqcup: sqcup,
  	sqcups: sqcups,
  	Sqrt: Sqrt,
  	sqsub: sqsub,
  	sqsube: sqsube,
  	sqsubset: sqsubset,
  	sqsubseteq: sqsubseteq,
  	sqsup: sqsup,
  	sqsupe: sqsupe,
  	sqsupset: sqsupset,
  	sqsupseteq: sqsupseteq,
  	square: square,
  	Square: Square,
  	SquareIntersection: SquareIntersection,
  	SquareSubset: SquareSubset,
  	SquareSubsetEqual: SquareSubsetEqual,
  	SquareSuperset: SquareSuperset,
  	SquareSupersetEqual: SquareSupersetEqual,
  	SquareUnion: SquareUnion,
  	squarf: squarf,
  	squ: squ,
  	squf: squf,
  	srarr: srarr,
  	Sscr: Sscr,
  	sscr: sscr,
  	ssetmn: ssetmn,
  	ssmile: ssmile,
  	sstarf: sstarf,
  	Star: Star,
  	star: star,
  	starf: starf,
  	straightepsilon: straightepsilon,
  	straightphi: straightphi,
  	strns: strns,
  	sub: sub,
  	Sub: Sub,
  	subdot: subdot,
  	subE: subE,
  	sube: sube,
  	subedot: subedot,
  	submult: submult,
  	subnE: subnE,
  	subne: subne,
  	subplus: subplus,
  	subrarr: subrarr,
  	subset: subset,
  	Subset: Subset,
  	subseteq: subseteq,
  	subseteqq: subseteqq,
  	SubsetEqual: SubsetEqual,
  	subsetneq: subsetneq,
  	subsetneqq: subsetneqq,
  	subsim: subsim,
  	subsub: subsub,
  	subsup: subsup,
  	succapprox: succapprox,
  	succ: succ,
  	succcurlyeq: succcurlyeq,
  	Succeeds: Succeeds,
  	SucceedsEqual: SucceedsEqual,
  	SucceedsSlantEqual: SucceedsSlantEqual,
  	SucceedsTilde: SucceedsTilde,
  	succeq: succeq,
  	succnapprox: succnapprox,
  	succneqq: succneqq,
  	succnsim: succnsim,
  	succsim: succsim,
  	SuchThat: SuchThat,
  	sum: sum,
  	Sum: Sum,
  	sung: sung,
  	sup1: sup1,
  	sup2: sup2,
  	sup3: sup3,
  	sup: sup,
  	Sup: Sup,
  	supdot: supdot,
  	supdsub: supdsub,
  	supE: supE,
  	supe: supe,
  	supedot: supedot,
  	Superset: Superset,
  	SupersetEqual: SupersetEqual,
  	suphsol: suphsol,
  	suphsub: suphsub,
  	suplarr: suplarr,
  	supmult: supmult,
  	supnE: supnE,
  	supne: supne,
  	supplus: supplus,
  	supset: supset,
  	Supset: Supset,
  	supseteq: supseteq,
  	supseteqq: supseteqq,
  	supsetneq: supsetneq,
  	supsetneqq: supsetneqq,
  	supsim: supsim,
  	supsub: supsub,
  	supsup: supsup,
  	swarhk: swarhk,
  	swarr: swarr,
  	swArr: swArr,
  	swarrow: swarrow,
  	swnwar: swnwar,
  	szlig: szlig,
  	Tab: Tab,
  	target: target,
  	Tau: Tau,
  	tau: tau,
  	tbrk: tbrk,
  	Tcaron: Tcaron,
  	tcaron: tcaron,
  	Tcedil: Tcedil,
  	tcedil: tcedil,
  	Tcy: Tcy,
  	tcy: tcy,
  	tdot: tdot,
  	telrec: telrec,
  	Tfr: Tfr,
  	tfr: tfr,
  	there4: there4,
  	therefore: therefore,
  	Therefore: Therefore,
  	Theta: Theta,
  	theta: theta,
  	thetasym: thetasym,
  	thetav: thetav,
  	thickapprox: thickapprox,
  	thicksim: thicksim,
  	ThickSpace: ThickSpace,
  	ThinSpace: ThinSpace,
  	thinsp: thinsp,
  	thkap: thkap,
  	thksim: thksim,
  	THORN: THORN,
  	thorn: thorn,
  	tilde: tilde,
  	Tilde: Tilde,
  	TildeEqual: TildeEqual,
  	TildeFullEqual: TildeFullEqual,
  	TildeTilde: TildeTilde,
  	timesbar: timesbar,
  	timesb: timesb,
  	times: times,
  	timesd: timesd,
  	tint: tint,
  	toea: toea,
  	topbot: topbot,
  	topcir: topcir,
  	top: top,
  	Topf: Topf,
  	topf: topf,
  	topfork: topfork,
  	tosa: tosa,
  	tprime: tprime,
  	trade: trade,
  	TRADE: TRADE,
  	triangle: triangle,
  	triangledown: triangledown,
  	triangleleft: triangleleft,
  	trianglelefteq: trianglelefteq,
  	triangleq: triangleq,
  	triangleright: triangleright,
  	trianglerighteq: trianglerighteq,
  	tridot: tridot,
  	trie: trie,
  	triminus: triminus,
  	TripleDot: TripleDot,
  	triplus: triplus,
  	trisb: trisb,
  	tritime: tritime,
  	trpezium: trpezium,
  	Tscr: Tscr,
  	tscr: tscr,
  	TScy: TScy,
  	tscy: tscy,
  	TSHcy: TSHcy,
  	tshcy: tshcy,
  	Tstrok: Tstrok,
  	tstrok: tstrok,
  	twixt: twixt,
  	twoheadleftarrow: twoheadleftarrow,
  	twoheadrightarrow: twoheadrightarrow,
  	Uacute: Uacute,
  	uacute: uacute,
  	uarr: uarr,
  	Uarr: Uarr,
  	uArr: uArr,
  	Uarrocir: Uarrocir,
  	Ubrcy: Ubrcy,
  	ubrcy: ubrcy,
  	Ubreve: Ubreve,
  	ubreve: ubreve,
  	Ucirc: Ucirc,
  	ucirc: ucirc,
  	Ucy: Ucy,
  	ucy: ucy,
  	udarr: udarr,
  	Udblac: Udblac,
  	udblac: udblac,
  	udhar: udhar,
  	ufisht: ufisht,
  	Ufr: Ufr,
  	ufr: ufr,
  	Ugrave: Ugrave,
  	ugrave: ugrave,
  	uHar: uHar,
  	uharl: uharl,
  	uharr: uharr,
  	uhblk: uhblk,
  	ulcorn: ulcorn,
  	ulcorner: ulcorner,
  	ulcrop: ulcrop,
  	ultri: ultri,
  	Umacr: Umacr,
  	umacr: umacr,
  	uml: uml,
  	UnderBar: UnderBar,
  	UnderBrace: UnderBrace,
  	UnderBracket: UnderBracket,
  	UnderParenthesis: UnderParenthesis,
  	Union: Union,
  	UnionPlus: UnionPlus,
  	Uogon: Uogon,
  	uogon: uogon,
  	Uopf: Uopf,
  	uopf: uopf,
  	UpArrowBar: UpArrowBar,
  	uparrow: uparrow,
  	UpArrow: UpArrow,
  	Uparrow: Uparrow,
  	UpArrowDownArrow: UpArrowDownArrow,
  	updownarrow: updownarrow,
  	UpDownArrow: UpDownArrow,
  	Updownarrow: Updownarrow,
  	UpEquilibrium: UpEquilibrium,
  	upharpoonleft: upharpoonleft,
  	upharpoonright: upharpoonright,
  	uplus: uplus,
  	UpperLeftArrow: UpperLeftArrow,
  	UpperRightArrow: UpperRightArrow,
  	upsi: upsi,
  	Upsi: Upsi,
  	upsih: upsih,
  	Upsilon: Upsilon,
  	upsilon: upsilon,
  	UpTeeArrow: UpTeeArrow,
  	UpTee: UpTee,
  	upuparrows: upuparrows,
  	urcorn: urcorn,
  	urcorner: urcorner,
  	urcrop: urcrop,
  	Uring: Uring,
  	uring: uring,
  	urtri: urtri,
  	Uscr: Uscr,
  	uscr: uscr,
  	utdot: utdot,
  	Utilde: Utilde,
  	utilde: utilde,
  	utri: utri,
  	utrif: utrif,
  	uuarr: uuarr,
  	Uuml: Uuml,
  	uuml: uuml,
  	uwangle: uwangle,
  	vangrt: vangrt,
  	varepsilon: varepsilon,
  	varkappa: varkappa,
  	varnothing: varnothing,
  	varphi: varphi,
  	varpi: varpi,
  	varpropto: varpropto,
  	varr: varr,
  	vArr: vArr,
  	varrho: varrho,
  	varsigma: varsigma,
  	varsubsetneq: varsubsetneq,
  	varsubsetneqq: varsubsetneqq,
  	varsupsetneq: varsupsetneq,
  	varsupsetneqq: varsupsetneqq,
  	vartheta: vartheta,
  	vartriangleleft: vartriangleleft,
  	vartriangleright: vartriangleright,
  	vBar: vBar,
  	Vbar: Vbar,
  	vBarv: vBarv,
  	Vcy: Vcy,
  	vcy: vcy,
  	vdash: vdash,
  	vDash: vDash,
  	Vdash: Vdash,
  	VDash: VDash,
  	Vdashl: Vdashl,
  	veebar: veebar,
  	vee: vee,
  	Vee: Vee,
  	veeeq: veeeq,
  	vellip: vellip,
  	verbar: verbar,
  	Verbar: Verbar,
  	vert: vert,
  	Vert: Vert,
  	VerticalBar: VerticalBar,
  	VerticalLine: VerticalLine,
  	VerticalSeparator: VerticalSeparator,
  	VerticalTilde: VerticalTilde,
  	VeryThinSpace: VeryThinSpace,
  	Vfr: Vfr,
  	vfr: vfr,
  	vltri: vltri,
  	vnsub: vnsub,
  	vnsup: vnsup,
  	Vopf: Vopf,
  	vopf: vopf,
  	vprop: vprop,
  	vrtri: vrtri,
  	Vscr: Vscr,
  	vscr: vscr,
  	vsubnE: vsubnE,
  	vsubne: vsubne,
  	vsupnE: vsupnE,
  	vsupne: vsupne,
  	Vvdash: Vvdash,
  	vzigzag: vzigzag,
  	Wcirc: Wcirc,
  	wcirc: wcirc,
  	wedbar: wedbar,
  	wedge: wedge,
  	Wedge: Wedge,
  	wedgeq: wedgeq,
  	weierp: weierp,
  	Wfr: Wfr,
  	wfr: wfr,
  	Wopf: Wopf,
  	wopf: wopf,
  	wp: wp,
  	wr: wr,
  	wreath: wreath,
  	Wscr: Wscr,
  	wscr: wscr,
  	xcap: xcap,
  	xcirc: xcirc,
  	xcup: xcup,
  	xdtri: xdtri,
  	Xfr: Xfr,
  	xfr: xfr,
  	xharr: xharr,
  	xhArr: xhArr,
  	Xi: Xi,
  	xi: xi,
  	xlarr: xlarr,
  	xlArr: xlArr,
  	xmap: xmap,
  	xnis: xnis,
  	xodot: xodot,
  	Xopf: Xopf,
  	xopf: xopf,
  	xoplus: xoplus,
  	xotime: xotime,
  	xrarr: xrarr,
  	xrArr: xrArr,
  	Xscr: Xscr,
  	xscr: xscr,
  	xsqcup: xsqcup,
  	xuplus: xuplus,
  	xutri: xutri,
  	xvee: xvee,
  	xwedge: xwedge,
  	Yacute: Yacute,
  	yacute: yacute,
  	YAcy: YAcy,
  	yacy: yacy,
  	Ycirc: Ycirc,
  	ycirc: ycirc,
  	Ycy: Ycy,
  	ycy: ycy,
  	yen: yen,
  	Yfr: Yfr,
  	yfr: yfr,
  	YIcy: YIcy,
  	yicy: yicy,
  	Yopf: Yopf,
  	yopf: yopf,
  	Yscr: Yscr,
  	yscr: yscr,
  	YUcy: YUcy,
  	yucy: yucy,
  	yuml: yuml,
  	Yuml: Yuml,
  	Zacute: Zacute,
  	zacute: zacute,
  	Zcaron: Zcaron,
  	zcaron: zcaron,
  	Zcy: Zcy,
  	zcy: zcy,
  	Zdot: Zdot,
  	zdot: zdot,
  	zeetrf: zeetrf,
  	ZeroWidthSpace: ZeroWidthSpace,
  	Zeta: Zeta,
  	zeta: zeta,
  	zfr: zfr,
  	Zfr: Zfr,
  	ZHcy: ZHcy,
  	zhcy: zhcy,
  	zigrarr: zigrarr,
  	zopf: zopf,
  	Zopf: Zopf,
  	Zscr: Zscr,
  	zscr: zscr,
  	zwj: zwj,
  	zwnj: zwnj,
  	default: entitiesJSON
  });

  var require$$0 = ( xml && xmlJSON ) || xml;

  var require$$1 = ( entities && entitiesJSON ) || entities;

  var inverseXML = getInverseObj$1(require$$0);
  var xmlReplacer = getInverseReplacer$1(inverseXML);

  var XML = getInverse$1(inverseXML, xmlReplacer);

  var inverseHTML = getInverseObj$1(require$$1);
  var htmlReplacer = getInverseReplacer$1(inverseHTML);

  var HTML = getInverse$1(inverseHTML, htmlReplacer);

  function getInverseObj$1(obj){
  	return Object.keys(obj).sort().reduce(function(inverse, name){
  		inverse[obj[name]] = "&" + name + ";";
  		return inverse;
  	}, {});
  }

  function getInverseReplacer$1(inverse){
  	var single = [],
  	    multiple = [];

  	Object.keys(inverse).forEach(function(k){
  		if(k.length === 1){
  			single.push("\\" + k);
  		} else {
  			multiple.push(k);
  		}
  	});

  	
  	multiple.unshift("[" + single.join("") + "]");

  	return new RegExp(multiple.join("|"), "g");
  }

  var re_nonASCII = /[^\0-\x7F]/g;
  var re_astralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;

  function singleCharReplacer$1(c){
  	return "&#x" + c.charCodeAt(0).toString(16).toUpperCase() + ";";
  }

  function astralReplacer$1(c){
  	
  	var high = c.charCodeAt(0);
  	var low  = c.charCodeAt(1);
  	var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
  	return "&#x" + codePoint.toString(16).toUpperCase() + ";";
  }

  function getInverse$1(inverse, re){
  	function func(name){
  		return inverse[name];
  	}

  	return function(data){
  		return data
  				.replace(re, func)
  				.replace(re_astralSymbols, astralReplacer$1)
  				.replace(re_nonASCII, singleCharReplacer$1);
  	};
  }

  var re_xmlChars = getInverseReplacer$1(inverseXML);

  function escapeXML(data){
  	return data
  			.replace(re_xmlChars, singleCharReplacer$1)
  			.replace(re_astralSymbols, astralReplacer$1)
  			.replace(re_nonASCII, singleCharReplacer$1);
  }

  var escape = escapeXML;

  var encode = {
  	XML: XML,
  	HTML: HTML,
  	escape: escape
  };

  var decode = {
  	"0": 65533,
  	"128": 8364,
  	"130": 8218,
  	"131": 402,
  	"132": 8222,
  	"133": 8230,
  	"134": 8224,
  	"135": 8225,
  	"136": 710,
  	"137": 8240,
  	"138": 352,
  	"139": 8249,
  	"140": 338,
  	"142": 381,
  	"145": 8216,
  	"146": 8217,
  	"147": 8220,
  	"148": 8221,
  	"149": 8226,
  	"150": 8211,
  	"151": 8212,
  	"152": 732,
  	"153": 8482,
  	"154": 353,
  	"155": 8250,
  	"156": 339,
  	"158": 382,
  	"159": 376
  };

  var decode$1 = Object.freeze({
  	default: decode
  });

  var decodeMap = ( decode$1 && decode ) || decode$1;

  var decode_codepoint = decodeCodePoint;


  function decodeCodePoint(codePoint){

  	if((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF){
  		return "\uFFFD";
  	}

  	if(codePoint in decodeMap){
  		codePoint = decodeMap[codePoint];
  	}

  	var output = "";

  	if(codePoint > 0xFFFF){
  		codePoint -= 0x10000;
  		output += String.fromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
  		codePoint = 0xDC00 | codePoint & 0x3FF;
  	}

  	output += String.fromCharCode(codePoint);
  	return output;
  }

  var Aacute$1 = "Á";
  var aacute$1 = "á";
  var Acirc$1 = "Â";
  var acirc$1 = "â";
  var acute$1 = "´";
  var AElig$1 = "Æ";
  var aelig$1 = "æ";
  var Agrave$1 = "À";
  var agrave$1 = "à";
  var amp$2 = "&";
  var AMP$1 = "&";
  var Aring$1 = "Å";
  var aring$1 = "å";
  var Atilde$1 = "Ã";
  var atilde$1 = "ã";
  var Auml$1 = "Ä";
  var auml$1 = "ä";
  var brvbar$1 = "¦";
  var Ccedil$1 = "Ç";
  var ccedil$1 = "ç";
  var cedil$1 = "¸";
  var cent$1 = "¢";
  var copy$1 = "©";
  var COPY$1 = "©";
  var curren$1 = "¤";
  var deg$1 = "°";
  var divide$1 = "÷";
  var Eacute$1 = "É";
  var eacute$1 = "é";
  var Ecirc$1 = "Ê";
  var ecirc$1 = "ê";
  var Egrave$1 = "È";
  var egrave$1 = "è";
  var ETH$1 = "Ð";
  var eth$1 = "ð";
  var Euml$1 = "Ë";
  var euml$1 = "ë";
  var frac12$1 = "½";
  var frac14$1 = "¼";
  var frac34$1 = "¾";
  var gt$2 = ">";
  var GT$1 = ">";
  var Iacute$1 = "Í";
  var iacute$1 = "í";
  var Icirc$1 = "Î";
  var icirc$1 = "î";
  var iexcl$1 = "¡";
  var Igrave$1 = "Ì";
  var igrave$1 = "ì";
  var iquest$1 = "¿";
  var Iuml$1 = "Ï";
  var iuml$1 = "ï";
  var laquo$1 = "«";
  var lt$2 = "<";
  var LT$1 = "<";
  var macr$1 = "¯";
  var micro$1 = "µ";
  var middot$1 = "·";
  var nbsp$1 = " ";
  var not$1 = "¬";
  var Ntilde$1 = "Ñ";
  var ntilde$1 = "ñ";
  var Oacute$1 = "Ó";
  var oacute$1 = "ó";
  var Ocirc$1 = "Ô";
  var ocirc$1 = "ô";
  var Ograve$1 = "Ò";
  var ograve$1 = "ò";
  var ordf$1 = "ª";
  var ordm$1 = "º";
  var Oslash$1 = "Ø";
  var oslash$1 = "ø";
  var Otilde$1 = "Õ";
  var otilde$1 = "õ";
  var Ouml$1 = "Ö";
  var ouml$1 = "ö";
  var para$1 = "¶";
  var plusmn$1 = "±";
  var pound$1 = "£";
  var quot$2 = "\"";
  var QUOT$1 = "\"";
  var raquo$1 = "»";
  var reg$1 = "®";
  var REG$1 = "®";
  var sect$1 = "§";
  var shy$1 = "­";
  var sup1$1 = "¹";
  var sup2$1 = "²";
  var sup3$1 = "³";
  var szlig$1 = "ß";
  var THORN$1 = "Þ";
  var thorn$1 = "þ";
  var times$1 = "×";
  var Uacute$1 = "Ú";
  var uacute$1 = "ú";
  var Ucirc$1 = "Û";
  var ucirc$1 = "û";
  var Ugrave$1 = "Ù";
  var ugrave$1 = "ù";
  var uml$1 = "¨";
  var Uuml$1 = "Ü";
  var uuml$1 = "ü";
  var Yacute$1 = "Ý";
  var yacute$1 = "ý";
  var yen$1 = "¥";
  var yuml$1 = "ÿ";
  var legacyJSON = {
  	Aacute: Aacute$1,
  	aacute: aacute$1,
  	Acirc: Acirc$1,
  	acirc: acirc$1,
  	acute: acute$1,
  	AElig: AElig$1,
  	aelig: aelig$1,
  	Agrave: Agrave$1,
  	agrave: agrave$1,
  	amp: amp$2,
  	AMP: AMP$1,
  	Aring: Aring$1,
  	aring: aring$1,
  	Atilde: Atilde$1,
  	atilde: atilde$1,
  	Auml: Auml$1,
  	auml: auml$1,
  	brvbar: brvbar$1,
  	Ccedil: Ccedil$1,
  	ccedil: ccedil$1,
  	cedil: cedil$1,
  	cent: cent$1,
  	copy: copy$1,
  	COPY: COPY$1,
  	curren: curren$1,
  	deg: deg$1,
  	divide: divide$1,
  	Eacute: Eacute$1,
  	eacute: eacute$1,
  	Ecirc: Ecirc$1,
  	ecirc: ecirc$1,
  	Egrave: Egrave$1,
  	egrave: egrave$1,
  	ETH: ETH$1,
  	eth: eth$1,
  	Euml: Euml$1,
  	euml: euml$1,
  	frac12: frac12$1,
  	frac14: frac14$1,
  	frac34: frac34$1,
  	gt: gt$2,
  	GT: GT$1,
  	Iacute: Iacute$1,
  	iacute: iacute$1,
  	Icirc: Icirc$1,
  	icirc: icirc$1,
  	iexcl: iexcl$1,
  	Igrave: Igrave$1,
  	igrave: igrave$1,
  	iquest: iquest$1,
  	Iuml: Iuml$1,
  	iuml: iuml$1,
  	laquo: laquo$1,
  	lt: lt$2,
  	LT: LT$1,
  	macr: macr$1,
  	micro: micro$1,
  	middot: middot$1,
  	nbsp: nbsp$1,
  	not: not$1,
  	Ntilde: Ntilde$1,
  	ntilde: ntilde$1,
  	Oacute: Oacute$1,
  	oacute: oacute$1,
  	Ocirc: Ocirc$1,
  	ocirc: ocirc$1,
  	Ograve: Ograve$1,
  	ograve: ograve$1,
  	ordf: ordf$1,
  	ordm: ordm$1,
  	Oslash: Oslash$1,
  	oslash: oslash$1,
  	Otilde: Otilde$1,
  	otilde: otilde$1,
  	Ouml: Ouml$1,
  	ouml: ouml$1,
  	para: para$1,
  	plusmn: plusmn$1,
  	pound: pound$1,
  	quot: quot$2,
  	QUOT: QUOT$1,
  	raquo: raquo$1,
  	reg: reg$1,
  	REG: REG$1,
  	sect: sect$1,
  	shy: shy$1,
  	sup1: sup1$1,
  	sup2: sup2$1,
  	sup3: sup3$1,
  	szlig: szlig$1,
  	THORN: THORN$1,
  	thorn: thorn$1,
  	times: times$1,
  	Uacute: Uacute$1,
  	uacute: uacute$1,
  	Ucirc: Ucirc$1,
  	ucirc: ucirc$1,
  	Ugrave: Ugrave$1,
  	ugrave: ugrave$1,
  	uml: uml$1,
  	Uuml: Uuml$1,
  	uuml: uuml$1,
  	Yacute: Yacute$1,
  	yacute: yacute$1,
  	yen: yen$1,
  	yuml: yuml$1
  };

  var _entities = {
    encodeXML: encode.XML,
    decodeCodepoint: decode_codepoint,
    entitiesJSON,
    legacyJSON,
    xmlJSON
  };

  var _entities_decodeCodepoint = _entities.decodeCodepoint;

  var _entities_decodeCodepoint$1 = Object.freeze({
  	default: _entities_decodeCodepoint
  });

  var _entities_entitiesJSON = _entities.entitiesJSON;


  var _entities_entitiesJSON$1 = Object.freeze({
  	default: _entities_entitiesJSON
  });

  var _entities_legacyJSON = _entities.legacyJSON;

  var _entities_legacyJSON$1 = Object.freeze({
  	default: _entities_legacyJSON
  });

  var _entities_xmlJSON = _entities.xmlJSON;

  var _entities_xmlJSON$1 = Object.freeze({
  	default: _entities_xmlJSON
  });

  var decodeCodePoint$1 = ( _entities_decodeCodepoint$1 && _entities_decodeCodepoint ) || _entities_decodeCodepoint$1;

  var entityMap = ( _entities_entitiesJSON$1 && _entities_entitiesJSON ) || _entities_entitiesJSON$1;

  var legacyMap = ( _entities_legacyJSON$1 && _entities_legacyJSON ) || _entities_legacyJSON$1;

  var xmlMap = ( _entities_xmlJSON$1 && _entities_xmlJSON ) || _entities_xmlJSON$1;

  var Tokenizer_1 = Tokenizer$1;

  var i = 0;
  var TEXT                      = i++;
  var BEFORE_TAG_NAME           = i++;
  var IN_TAG_NAME               = i++;
  var IN_SELF_CLOSING_TAG       = i++;
  var BEFORE_CLOSING_TAG_NAME   = i++;
  var IN_CLOSING_TAG_NAME       = i++;
  var AFTER_CLOSING_TAG_NAME    = i++;
  var BEFORE_ATTRIBUTE_NAME     = i++;
  var IN_ATTRIBUTE_NAME         = i++;
  var AFTER_ATTRIBUTE_NAME      = i++;
  var BEFORE_ATTRIBUTE_VALUE    = i++;
  var IN_ATTRIBUTE_VALUE_DQ     = i++;
  var IN_ATTRIBUTE_VALUE_SQ     = i++;
  var IN_ATTRIBUTE_VALUE_NQ     = i++;
  var BEFORE_DECLARATION        = i++;
  var IN_DECLARATION            = i++;
  var IN_PROCESSING_INSTRUCTION = i++;
  var BEFORE_COMMENT            = i++;
  var IN_COMMENT                = i++;
  var AFTER_COMMENT_1           = i++;
  var AFTER_COMMENT_2           = i++;
  var BEFORE_CDATA_1            = i++;
  var BEFORE_CDATA_2            = i++;
  var BEFORE_CDATA_3            = i++;
  var BEFORE_CDATA_4            = i++;
  var BEFORE_CDATA_5            = i++;
  var BEFORE_CDATA_6            = i++;
  var IN_CDATA                  = i++;
  var AFTER_CDATA_1             = i++;
  var AFTER_CDATA_2             = i++;
  var BEFORE_SPECIAL            = i++;
  var BEFORE_SPECIAL_END        = i++;
  var BEFORE_SCRIPT_1           = i++;
  var BEFORE_SCRIPT_2           = i++;
  var BEFORE_SCRIPT_3           = i++;
  var BEFORE_SCRIPT_4           = i++;
  var BEFORE_SCRIPT_5           = i++;
  var AFTER_SCRIPT_1            = i++;
  var AFTER_SCRIPT_2            = i++;
  var AFTER_SCRIPT_3            = i++;
  var AFTER_SCRIPT_4            = i++;
  var AFTER_SCRIPT_5            = i++;
  var BEFORE_STYLE_1            = i++;
  var BEFORE_STYLE_2            = i++;
  var BEFORE_STYLE_3            = i++;
  var BEFORE_STYLE_4            = i++;
  var AFTER_STYLE_1             = i++;
  var AFTER_STYLE_2             = i++;
  var AFTER_STYLE_3             = i++;
  var AFTER_STYLE_4             = i++;
  var BEFORE_ENTITY             = i++;
  var BEFORE_NUMERIC_ENTITY     = i++;
  var IN_NAMED_ENTITY           = i++;
  var IN_NUMERIC_ENTITY         = i++;
  var IN_HEX_ENTITY             = i++;
  var j = 0;
  var SPECIAL_NONE              = j++;
  var SPECIAL_SCRIPT            = j++;
  var SPECIAL_STYLE             = j++;

  function whitespace(c){
  	return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
  }

  function characterState(char, SUCCESS){
  	return function(c){
  		if(c === char) this._state = SUCCESS;
  	};
  }

  function ifElseState(upper, SUCCESS, FAILURE){
  	var lower = upper.toLowerCase();

  	if(upper === lower){
  		return function(c){
  			if(c === lower){
  				this._state = SUCCESS;
  			} else {
  				this._state = FAILURE;
  				this._index--;
  			}
  		};
  	} else {
  		return function(c){
  			if(c === lower || c === upper){
  				this._state = SUCCESS;
  			} else {
  				this._state = FAILURE;
  				this._index--;
  			}
  		};
  	}
  }

  function consumeSpecialNameChar(upper, NEXT_STATE){
  	var lower = upper.toLowerCase();

  	return function(c){
  		if(c === lower || c === upper){
  			this._state = NEXT_STATE;
  		} else {
  			this._state = IN_TAG_NAME;
  			this._index--; 
  		}
  	};
  }

  function Tokenizer$1(options, cbs){
  	this._state = TEXT;
  	this._buffer = "";
  	this._sectionStart = 0;
  	this._index = 0;
  	this._bufferOffset = 0; 
  	this._baseState = TEXT;
  	this._special = SPECIAL_NONE;
  	this._cbs = cbs;
  	this._running = true;
  	this._ended = false;
  	this._xmlMode = !!(options && options.xmlMode);
  	this._decodeEntities = !!(options && options.decodeEntities);
  }

  Tokenizer$1.prototype._stateText = function(c){
  	if(c === "<"){
  		if(this._index > this._sectionStart){
  			this._cbs.ontext(this._getSection());
  		}
  		this._state = BEFORE_TAG_NAME;
  		this._sectionStart = this._index;
  	} else if(this._decodeEntities && this._special === SPECIAL_NONE && c === "&"){
  		if(this._index > this._sectionStart){
  			this._cbs.ontext(this._getSection());
  		}
  		this._baseState = TEXT;
  		this._state = BEFORE_ENTITY;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateBeforeTagName = function(c){
  	if(c === "/"){
  		this._state = BEFORE_CLOSING_TAG_NAME;
  	} else if(c === "<"){
  		this._cbs.ontext(this._getSection());
  		this._sectionStart = this._index;
  	} else if(c === ">" || this._special !== SPECIAL_NONE || whitespace(c)) {
  		this._state = TEXT;
  	} else if(c === "!"){
  		this._state = BEFORE_DECLARATION;
  		this._sectionStart = this._index + 1;
  	} else if(c === "?"){
  		this._state = IN_PROCESSING_INSTRUCTION;
  		this._sectionStart = this._index + 1;
  	} else {
  		this._state = (!this._xmlMode && (c === "s" || c === "S")) ?
  						BEFORE_SPECIAL : IN_TAG_NAME;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateInTagName = function(c){
  	if(c === "/" || c === ">" || whitespace(c)){
  		this._emitToken("onopentagname");
  		this._state = BEFORE_ATTRIBUTE_NAME;
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._stateBeforeCloseingTagName = function(c){
  	if(whitespace(c));
  	else if(c === ">"){
  		this._state = TEXT;
  	} else if(this._special !== SPECIAL_NONE){
  		if(c === "s" || c === "S"){
  			this._state = BEFORE_SPECIAL_END;
  		} else {
  			this._state = TEXT;
  			this._index--;
  		}
  	} else {
  		this._state = IN_CLOSING_TAG_NAME;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateInCloseingTagName = function(c){
  	if(c === ">" || whitespace(c)){
  		this._emitToken("onclosetag");
  		this._state = AFTER_CLOSING_TAG_NAME;
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._stateAfterCloseingTagName = function(c){
  	
  	if(c === ">"){
  		this._state = TEXT;
  		this._sectionStart = this._index + 1;
  	}
  };

  Tokenizer$1.prototype._stateBeforeAttributeName = function(c){
  	if(c === ">"){
  		this._cbs.onopentagend();
  		this._state = TEXT;
  		this._sectionStart = this._index + 1;
  	} else if(c === "/"){
  		this._state = IN_SELF_CLOSING_TAG;
  	} else if(!whitespace(c)){
  		this._state = IN_ATTRIBUTE_NAME;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateInSelfClosingTag = function(c){
  	if(c === ">"){
  		this._cbs.onselfclosingtag();
  		this._state = TEXT;
  		this._sectionStart = this._index + 1;
  	} else if(!whitespace(c)){
  		this._state = BEFORE_ATTRIBUTE_NAME;
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._stateInAttributeName = function(c){
  	if(c === "=" || c === "/" || c === ">" || whitespace(c)){
  		this._cbs.onattribname(this._getSection());
  		this._sectionStart = -1;
  		this._state = AFTER_ATTRIBUTE_NAME;
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._stateAfterAttributeName = function(c){
  	if(c === "="){
  		this._state = BEFORE_ATTRIBUTE_VALUE;
  	} else if(c === "/" || c === ">"){
  		this._cbs.onattribend();
  		this._state = BEFORE_ATTRIBUTE_NAME;
  		this._index--;
  	} else if(!whitespace(c)){
  		this._cbs.onattribend();
  		this._state = IN_ATTRIBUTE_NAME;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateBeforeAttributeValue = function(c){
  	if(c === "\""){
  		this._state = IN_ATTRIBUTE_VALUE_DQ;
  		this._sectionStart = this._index + 1;
  	} else if(c === "'"){
  		this._state = IN_ATTRIBUTE_VALUE_SQ;
  		this._sectionStart = this._index + 1;
  	} else if(!whitespace(c)){
  		this._state = IN_ATTRIBUTE_VALUE_NQ;
  		this._sectionStart = this._index;
  		this._index--; 
  	}
  };

  Tokenizer$1.prototype._stateInAttributeValueDoubleQuotes = function(c){
  	if(c === "\""){
  		this._emitToken("onattribdata");
  		this._cbs.onattribend();
  		this._state = BEFORE_ATTRIBUTE_NAME;
  	} else if(this._decodeEntities && c === "&"){
  		this._emitToken("onattribdata");
  		this._baseState = this._state;
  		this._state = BEFORE_ENTITY;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateInAttributeValueSingleQuotes = function(c){
  	if(c === "'"){
  		this._emitToken("onattribdata");
  		this._cbs.onattribend();
  		this._state = BEFORE_ATTRIBUTE_NAME;
  	} else if(this._decodeEntities && c === "&"){
  		this._emitToken("onattribdata");
  		this._baseState = this._state;
  		this._state = BEFORE_ENTITY;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateInAttributeValueNoQuotes = function(c){
  	if(whitespace(c) || c === ">"){
  		this._emitToken("onattribdata");
  		this._cbs.onattribend();
  		this._state = BEFORE_ATTRIBUTE_NAME;
  		this._index--;
  	} else if(this._decodeEntities && c === "&"){
  		this._emitToken("onattribdata");
  		this._baseState = this._state;
  		this._state = BEFORE_ENTITY;
  		this._sectionStart = this._index;
  	}
  };

  Tokenizer$1.prototype._stateBeforeDeclaration = function(c){
  	this._state = c === "[" ? BEFORE_CDATA_1 :
  					c === "-" ? BEFORE_COMMENT :
  						IN_DECLARATION;
  };

  Tokenizer$1.prototype._stateInDeclaration = function(c){
  	if(c === ">"){
  		this._cbs.ondeclaration(this._getSection());
  		this._state = TEXT;
  		this._sectionStart = this._index + 1;
  	}
  };

  Tokenizer$1.prototype._stateInProcessingInstruction = function(c){
  	if(c === ">"){
  		this._cbs.onprocessinginstruction(this._getSection());
  		this._state = TEXT;
  		this._sectionStart = this._index + 1;
  	}
  };

  Tokenizer$1.prototype._stateBeforeComment = function(c){
  	if(c === "-"){
  		this._state = IN_COMMENT;
  		this._sectionStart = this._index + 1;
  	} else {
  		this._state = IN_DECLARATION;
  	}
  };

  Tokenizer$1.prototype._stateInComment = function(c){
  	if(c === "-") this._state = AFTER_COMMENT_1;
  };

  Tokenizer$1.prototype._stateAfterComment1 = function(c){
  	if(c === "-"){
  		this._state = AFTER_COMMENT_2;
  	} else {
  		this._state = IN_COMMENT;
  	}
  };

  Tokenizer$1.prototype._stateAfterComment2 = function(c){
  	if(c === ">"){
  		
  		this._cbs.oncomment(this._buffer.substring(this._sectionStart, this._index - 2));
  		this._state = TEXT;
  		this._sectionStart = this._index + 1;
  	} else if(c !== "-"){
  		this._state = IN_COMMENT;
  	}
  	
  };

  Tokenizer$1.prototype._stateBeforeCdata1 = ifElseState("C", BEFORE_CDATA_2, IN_DECLARATION);
  Tokenizer$1.prototype._stateBeforeCdata2 = ifElseState("D", BEFORE_CDATA_3, IN_DECLARATION);
  Tokenizer$1.prototype._stateBeforeCdata3 = ifElseState("A", BEFORE_CDATA_4, IN_DECLARATION);
  Tokenizer$1.prototype._stateBeforeCdata4 = ifElseState("T", BEFORE_CDATA_5, IN_DECLARATION);
  Tokenizer$1.prototype._stateBeforeCdata5 = ifElseState("A", BEFORE_CDATA_6, IN_DECLARATION);

  Tokenizer$1.prototype._stateBeforeCdata6 = function(c){
  	if(c === "["){
  		this._state = IN_CDATA;
  		this._sectionStart = this._index + 1;
  	} else {
  		this._state = IN_DECLARATION;
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._stateInCdata = function(c){
  	if(c === "]") this._state = AFTER_CDATA_1;
  };

  Tokenizer$1.prototype._stateAfterCdata1 = characterState("]", AFTER_CDATA_2);

  Tokenizer$1.prototype._stateAfterCdata2 = function(c){
  	if(c === ">"){
  		
  		this._cbs.oncdata(this._buffer.substring(this._sectionStart, this._index - 2));
  		this._state = TEXT;
  		this._sectionStart = this._index + 1;
  	} else if(c !== "]") {
  		this._state = IN_CDATA;
  	}
  	
  };

  Tokenizer$1.prototype._stateBeforeSpecial = function(c){
  	if(c === "c" || c === "C"){
  		this._state = BEFORE_SCRIPT_1;
  	} else if(c === "t" || c === "T"){
  		this._state = BEFORE_STYLE_1;
  	} else {
  		this._state = IN_TAG_NAME;
  		this._index--; 
  	}
  };

  Tokenizer$1.prototype._stateBeforeSpecialEnd = function(c){
  	if(this._special === SPECIAL_SCRIPT && (c === "c" || c === "C")){
  		this._state = AFTER_SCRIPT_1;
  	} else if(this._special === SPECIAL_STYLE && (c === "t" || c === "T")){
  		this._state = AFTER_STYLE_1;
  	}
  	else this._state = TEXT;
  };

  Tokenizer$1.prototype._stateBeforeScript1 = consumeSpecialNameChar("R", BEFORE_SCRIPT_2);
  Tokenizer$1.prototype._stateBeforeScript2 = consumeSpecialNameChar("I", BEFORE_SCRIPT_3);
  Tokenizer$1.prototype._stateBeforeScript3 = consumeSpecialNameChar("P", BEFORE_SCRIPT_4);
  Tokenizer$1.prototype._stateBeforeScript4 = consumeSpecialNameChar("T", BEFORE_SCRIPT_5);

  Tokenizer$1.prototype._stateBeforeScript5 = function(c){
  	if(c === "/" || c === ">" || whitespace(c)){
  		this._special = SPECIAL_SCRIPT;
  	}
  	this._state = IN_TAG_NAME;
  	this._index--; 
  };

  Tokenizer$1.prototype._stateAfterScript1 = ifElseState("R", AFTER_SCRIPT_2, TEXT);
  Tokenizer$1.prototype._stateAfterScript2 = ifElseState("I", AFTER_SCRIPT_3, TEXT);
  Tokenizer$1.prototype._stateAfterScript3 = ifElseState("P", AFTER_SCRIPT_4, TEXT);
  Tokenizer$1.prototype._stateAfterScript4 = ifElseState("T", AFTER_SCRIPT_5, TEXT);

  Tokenizer$1.prototype._stateAfterScript5 = function(c){
  	if(c === ">" || whitespace(c)){
  		this._special = SPECIAL_NONE;
  		this._state = IN_CLOSING_TAG_NAME;
  		this._sectionStart = this._index - 6;
  		this._index--; 
  	}
  	else this._state = TEXT;
  };

  Tokenizer$1.prototype._stateBeforeStyle1 = consumeSpecialNameChar("Y", BEFORE_STYLE_2);
  Tokenizer$1.prototype._stateBeforeStyle2 = consumeSpecialNameChar("L", BEFORE_STYLE_3);
  Tokenizer$1.prototype._stateBeforeStyle3 = consumeSpecialNameChar("E", BEFORE_STYLE_4);

  Tokenizer$1.prototype._stateBeforeStyle4 = function(c){
  	if(c === "/" || c === ">" || whitespace(c)){
  		this._special = SPECIAL_STYLE;
  	}
  	this._state = IN_TAG_NAME;
  	this._index--; 
  };

  Tokenizer$1.prototype._stateAfterStyle1 = ifElseState("Y", AFTER_STYLE_2, TEXT);
  Tokenizer$1.prototype._stateAfterStyle2 = ifElseState("L", AFTER_STYLE_3, TEXT);
  Tokenizer$1.prototype._stateAfterStyle3 = ifElseState("E", AFTER_STYLE_4, TEXT);

  Tokenizer$1.prototype._stateAfterStyle4 = function(c){
  	if(c === ">" || whitespace(c)){
  		this._special = SPECIAL_NONE;
  		this._state = IN_CLOSING_TAG_NAME;
  		this._sectionStart = this._index - 5;
  		this._index--; 
  	}
  	else this._state = TEXT;
  };

  Tokenizer$1.prototype._stateBeforeEntity = ifElseState("#", BEFORE_NUMERIC_ENTITY, IN_NAMED_ENTITY);
  Tokenizer$1.prototype._stateBeforeNumericEntity = ifElseState("X", IN_HEX_ENTITY, IN_NUMERIC_ENTITY);


  Tokenizer$1.prototype._parseNamedEntityStrict = function(){
  	
  	if(this._sectionStart + 1 < this._index){
  		var entity = this._buffer.substring(this._sectionStart + 1, this._index),
  		    map = this._xmlMode ? xmlMap : entityMap;

  		if(map.hasOwnProperty(entity)){
  			this._emitPartial(map[entity]);
  			this._sectionStart = this._index + 1;
  		}
  	}
  };



  Tokenizer$1.prototype._parseLegacyEntity = function(){
  	var start = this._sectionStart + 1,
  	    limit = this._index - start;

  	if(limit > 6) limit = 6; 

  	while(limit >= 2){ 
  		var entity = this._buffer.substr(start, limit);

  		if(legacyMap.hasOwnProperty(entity)){
  			this._emitPartial(legacyMap[entity]);
  			this._sectionStart += limit + 1;
  			return;
  		} else {
  			limit--;
  		}
  	}
  };

  Tokenizer$1.prototype._stateInNamedEntity = function(c){
  	if(c === ";"){
  		this._parseNamedEntityStrict();
  		if(this._sectionStart + 1 < this._index && !this._xmlMode){
  			this._parseLegacyEntity();
  		}
  		this._state = this._baseState;
  	} else if((c < "a" || c > "z") && (c < "A" || c > "Z") && (c < "0" || c > "9")){
  		if(this._xmlMode);
  		else if(this._sectionStart + 1 === this._index);
  		else if(this._baseState !== TEXT){
  			if(c !== "="){
  				this._parseNamedEntityStrict();
  			}
  		} else {
  			this._parseLegacyEntity();
  		}

  		this._state = this._baseState;
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._decodeNumericEntity = function(offset, base){
  	var sectionStart = this._sectionStart + offset;

  	if(sectionStart !== this._index){
  		
  		var entity = this._buffer.substring(sectionStart, this._index);
  		var parsed = parseInt(entity, base);

  		this._emitPartial(decodeCodePoint$1(parsed));
  		this._sectionStart = this._index;
  	} else {
  		this._sectionStart--;
  	}

  	this._state = this._baseState;
  };

  Tokenizer$1.prototype._stateInNumericEntity = function(c){
  	if(c === ";"){
  		this._decodeNumericEntity(2, 10);
  		this._sectionStart++;
  	} else if(c < "0" || c > "9"){
  		if(!this._xmlMode){
  			this._decodeNumericEntity(2, 10);
  		} else {
  			this._state = this._baseState;
  		}
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._stateInHexEntity = function(c){
  	if(c === ";"){
  		this._decodeNumericEntity(3, 16);
  		this._sectionStart++;
  	} else if((c < "a" || c > "f") && (c < "A" || c > "F") && (c < "0" || c > "9")){
  		if(!this._xmlMode){
  			this._decodeNumericEntity(3, 16);
  		} else {
  			this._state = this._baseState;
  		}
  		this._index--;
  	}
  };

  Tokenizer$1.prototype._cleanup = function (){
  	if(this._sectionStart < 0){
  		this._buffer = "";
  		this._bufferOffset += this._index;
  		this._index = 0;
  	} else if(this._running){
  		if(this._state === TEXT){
  			if(this._sectionStart !== this._index){
  				this._cbs.ontext(this._buffer.substr(this._sectionStart));
  			}
  			this._buffer = "";
  			this._bufferOffset += this._index;
  			this._index = 0;
  		} else if(this._sectionStart === this._index){
  			
  			this._buffer = "";
  			this._bufferOffset += this._index;
  			this._index = 0;
  		} else {
  			
  			this._buffer = this._buffer.substr(this._sectionStart);
  			this._index -= this._sectionStart;
  			this._bufferOffset += this._sectionStart;
  		}

  		this._sectionStart = 0;
  	}
  };


  Tokenizer$1.prototype.write = function(chunk){
  	if(this._ended) this._cbs.onerror(Error(".write() after done!"));

  	this._buffer += chunk;
  	this._parse();
  };

  Tokenizer$1.prototype._parse = function(){
  	while(this._index < this._buffer.length && this._running){
  		var c = this._buffer.charAt(this._index);
  		if(this._state === TEXT) {
  			this._stateText(c);
  		} else if(this._state === BEFORE_TAG_NAME){
  			this._stateBeforeTagName(c);
  		} else if(this._state === IN_TAG_NAME) {
  			this._stateInTagName(c);
  		} else if(this._state === BEFORE_CLOSING_TAG_NAME){
  			this._stateBeforeCloseingTagName(c);
  		} else if(this._state === IN_CLOSING_TAG_NAME){
  			this._stateInCloseingTagName(c);
  		} else if(this._state === AFTER_CLOSING_TAG_NAME){
  			this._stateAfterCloseingTagName(c);
  		} else if(this._state === IN_SELF_CLOSING_TAG){
  			this._stateInSelfClosingTag(c);
  		}

  		
  		else if(this._state === BEFORE_ATTRIBUTE_NAME){
  			this._stateBeforeAttributeName(c);
  		} else if(this._state === IN_ATTRIBUTE_NAME){
  			this._stateInAttributeName(c);
  		} else if(this._state === AFTER_ATTRIBUTE_NAME){
  			this._stateAfterAttributeName(c);
  		} else if(this._state === BEFORE_ATTRIBUTE_VALUE){
  			this._stateBeforeAttributeValue(c);
  		} else if(this._state === IN_ATTRIBUTE_VALUE_DQ){
  			this._stateInAttributeValueDoubleQuotes(c);
  		} else if(this._state === IN_ATTRIBUTE_VALUE_SQ){
  			this._stateInAttributeValueSingleQuotes(c);
  		} else if(this._state === IN_ATTRIBUTE_VALUE_NQ){
  			this._stateInAttributeValueNoQuotes(c);
  		}

  		
  		else if(this._state === BEFORE_DECLARATION){
  			this._stateBeforeDeclaration(c);
  		} else if(this._state === IN_DECLARATION){
  			this._stateInDeclaration(c);
  		}

  		
  		else if(this._state === IN_PROCESSING_INSTRUCTION){
  			this._stateInProcessingInstruction(c);
  		}

  		
  		else if(this._state === BEFORE_COMMENT){
  			this._stateBeforeComment(c);
  		} else if(this._state === IN_COMMENT){
  			this._stateInComment(c);
  		} else if(this._state === AFTER_COMMENT_1){
  			this._stateAfterComment1(c);
  		} else if(this._state === AFTER_COMMENT_2){
  			this._stateAfterComment2(c);
  		}

  		
  		else if(this._state === BEFORE_CDATA_1){
  			this._stateBeforeCdata1(c);
  		} else if(this._state === BEFORE_CDATA_2){
  			this._stateBeforeCdata2(c);
  		} else if(this._state === BEFORE_CDATA_3){
  			this._stateBeforeCdata3(c);
  		} else if(this._state === BEFORE_CDATA_4){
  			this._stateBeforeCdata4(c);
  		} else if(this._state === BEFORE_CDATA_5){
  			this._stateBeforeCdata5(c);
  		} else if(this._state === BEFORE_CDATA_6){
  			this._stateBeforeCdata6(c);
  		} else if(this._state === IN_CDATA){
  			this._stateInCdata(c);
  		} else if(this._state === AFTER_CDATA_1){
  			this._stateAfterCdata1(c);
  		} else if(this._state === AFTER_CDATA_2){
  			this._stateAfterCdata2(c);
  		}

  		
  		else if(this._state === BEFORE_SPECIAL){
  			this._stateBeforeSpecial(c);
  		} else if(this._state === BEFORE_SPECIAL_END){
  			this._stateBeforeSpecialEnd(c);
  		}

  		
  		else if(this._state === BEFORE_SCRIPT_1){
  			this._stateBeforeScript1(c);
  		} else if(this._state === BEFORE_SCRIPT_2){
  			this._stateBeforeScript2(c);
  		} else if(this._state === BEFORE_SCRIPT_3){
  			this._stateBeforeScript3(c);
  		} else if(this._state === BEFORE_SCRIPT_4){
  			this._stateBeforeScript4(c);
  		} else if(this._state === BEFORE_SCRIPT_5){
  			this._stateBeforeScript5(c);
  		}

  		else if(this._state === AFTER_SCRIPT_1){
  			this._stateAfterScript1(c);
  		} else if(this._state === AFTER_SCRIPT_2){
  			this._stateAfterScript2(c);
  		} else if(this._state === AFTER_SCRIPT_3){
  			this._stateAfterScript3(c);
  		} else if(this._state === AFTER_SCRIPT_4){
  			this._stateAfterScript4(c);
  		} else if(this._state === AFTER_SCRIPT_5){
  			this._stateAfterScript5(c);
  		}

  		
  		else if(this._state === BEFORE_STYLE_1){
  			this._stateBeforeStyle1(c);
  		} else if(this._state === BEFORE_STYLE_2){
  			this._stateBeforeStyle2(c);
  		} else if(this._state === BEFORE_STYLE_3){
  			this._stateBeforeStyle3(c);
  		} else if(this._state === BEFORE_STYLE_4){
  			this._stateBeforeStyle4(c);
  		}

  		else if(this._state === AFTER_STYLE_1){
  			this._stateAfterStyle1(c);
  		} else if(this._state === AFTER_STYLE_2){
  			this._stateAfterStyle2(c);
  		} else if(this._state === AFTER_STYLE_3){
  			this._stateAfterStyle3(c);
  		} else if(this._state === AFTER_STYLE_4){
  			this._stateAfterStyle4(c);
  		}

  		
  		else if(this._state === BEFORE_ENTITY){
  			this._stateBeforeEntity(c);
  		} else if(this._state === BEFORE_NUMERIC_ENTITY){
  			this._stateBeforeNumericEntity(c);
  		} else if(this._state === IN_NAMED_ENTITY){
  			this._stateInNamedEntity(c);
  		} else if(this._state === IN_NUMERIC_ENTITY){
  			this._stateInNumericEntity(c);
  		} else if(this._state === IN_HEX_ENTITY){
  			this._stateInHexEntity(c);
  		}

  		else {
  			this._cbs.onerror(Error("unknown _state"), this._state);
  		}

  		this._index++;
  	}

  	this._cleanup();
  };

  Tokenizer$1.prototype.pause = function(){
  	this._running = false;
  };
  Tokenizer$1.prototype.resume = function(){
  	this._running = true;

  	if(this._index < this._buffer.length){
  		this._parse();
  	}
  	if(this._ended){
  		this._finish();
  	}
  };

  Tokenizer$1.prototype.end = function(chunk){
  	if(this._ended) this._cbs.onerror(Error(".end() after done!"));
  	if(chunk) this.write(chunk);

  	this._ended = true;

  	if(this._running) this._finish();
  };

  Tokenizer$1.prototype._finish = function(){
  	
  	if(this._sectionStart < this._index){
  		this._handleTrailingData();
  	}

  	this._cbs.onend();
  };

  Tokenizer$1.prototype._handleTrailingData = function(){
  	var data = this._buffer.substr(this._sectionStart);

  	if(this._state === IN_CDATA || this._state === AFTER_CDATA_1 || this._state === AFTER_CDATA_2){
  		this._cbs.oncdata(data);
  	} else if(this._state === IN_COMMENT || this._state === AFTER_COMMENT_1 || this._state === AFTER_COMMENT_2){
  		this._cbs.oncomment(data);
  	} else if(this._state === IN_NAMED_ENTITY && !this._xmlMode){
  		this._parseLegacyEntity();
  		if(this._sectionStart < this._index){
  			this._state = this._baseState;
  			this._handleTrailingData();
  		}
  	} else if(this._state === IN_NUMERIC_ENTITY && !this._xmlMode){
  		this._decodeNumericEntity(2, 10);
  		if(this._sectionStart < this._index){
  			this._state = this._baseState;
  			this._handleTrailingData();
  		}
  	} else if(this._state === IN_HEX_ENTITY && !this._xmlMode){
  		this._decodeNumericEntity(3, 16);
  		if(this._sectionStart < this._index){
  			this._state = this._baseState;
  			this._handleTrailingData();
  		}
  	} else if(
  		this._state !== IN_TAG_NAME &&
  		this._state !== BEFORE_ATTRIBUTE_NAME &&
  		this._state !== BEFORE_ATTRIBUTE_VALUE &&
  		this._state !== AFTER_ATTRIBUTE_NAME &&
  		this._state !== IN_ATTRIBUTE_NAME &&
  		this._state !== IN_ATTRIBUTE_VALUE_SQ &&
  		this._state !== IN_ATTRIBUTE_VALUE_DQ &&
  		this._state !== IN_ATTRIBUTE_VALUE_NQ &&
  		this._state !== IN_CLOSING_TAG_NAME
  	){
  		this._cbs.ontext(data);
  	}
  	
  	
  };

  Tokenizer$1.prototype.reset = function(){
  	Tokenizer$1.call(this, {xmlMode: this._xmlMode, decodeEntities: this._decodeEntities}, this._cbs);
  };

  Tokenizer$1.prototype.getAbsoluteIndex = function(){
  	return this._bufferOffset + this._index;
  };

  Tokenizer$1.prototype._getSection = function(){
  	return this._buffer.substring(this._sectionStart, this._index);
  };

  Tokenizer$1.prototype._emitToken = function(name){
  	this._cbs[name](this._getSection());
  	this._sectionStart = -1;
  };

  Tokenizer$1.prototype._emitPartial = function(value){
  	if(this._baseState !== TEXT){
  		this._cbs.onattribdata(value); 
  	} else {
  		this._cbs.ontext(value);
  	}
  };

  var _inherits = function() {};

  var _inherits$1 = Object.freeze({
  	default: _inherits
  });

  var _resolve_empty = {};

  var _resolve_empty$1 = Object.freeze({
  	default: _resolve_empty
  });

  var require$$1$1 = ( _inherits$1 && _inherits ) || _inherits$1;

  var require$$2 = ( _resolve_empty$1 && _resolve_empty ) || _resolve_empty$1;

  var Tokenizer = Tokenizer_1;





  var formTags = {
  	input: true,
  	option: true,
  	optgroup: true,
  	select: true,
  	button: true,
  	datalist: true,
  	textarea: true
  };

  var openImpliesClose = {
  	tr      : { tr:true, th:true, td:true },
  	th      : { th:true },
  	td      : { thead:true, th:true, td:true },
  	body    : { head:true, link:true, script:true },
  	li      : { li:true },
  	p       : { p:true },
  	h1      : { p:true },
  	h2      : { p:true },
  	h3      : { p:true },
  	h4      : { p:true },
  	h5      : { p:true },
  	h6      : { p:true },
  	select  : formTags,
  	input   : formTags,
  	output  : formTags,
  	button  : formTags,
  	datalist: formTags,
  	textarea: formTags,
  	option  : { option:true },
  	optgroup: { optgroup:true }
  };

  var voidElements = {
  	__proto__: null,
  	area: true,
  	base: true,
  	basefont: true,
  	br: true,
  	col: true,
  	command: true,
  	embed: true,
  	frame: true,
  	hr: true,
  	img: true,
  	input: true,
  	isindex: true,
  	keygen: true,
  	link: true,
  	meta: true,
  	param: true,
  	source: true,
  	track: true,
  	wbr: true,

  	
  	path: true,
  	circle: true,
  	ellipse: true,
  	line: true,
  	rect: true,
  	use: true,
  	stop: true,
  	polyline: true,
  	polygon: true
  };

  var re_nameEnd = /\s|\//;

  function Parser$1(cbs, options){
  	this._options = options || {};
  	this._cbs = cbs || {};

  	this._tagname = "";
  	this._attribname = "";
  	this._attribvalue = "";
  	this._attribs = null;
  	this._stack = [];

  	this.startIndex = 0;
  	this.endIndex = null;

  	this._lowerCaseTagNames = "lowerCaseTags" in this._options ?
  									!!this._options.lowerCaseTags :
  									!this._options.xmlMode;
  	this._lowerCaseAttributeNames = "lowerCaseAttributeNames" in this._options ?
  									!!this._options.lowerCaseAttributeNames :
  									!this._options.xmlMode;

  	if(this._options.Tokenizer) {
  		Tokenizer = this._options.Tokenizer;
  	}
  	this._tokenizer = new Tokenizer(this._options, this);

  	if(this._cbs.onparserinit) this._cbs.onparserinit(this);
  }

  require$$1$1(Parser$1, require$$2.EventEmitter);

  Parser$1.prototype._updatePosition = function(initialOffset){
  	if(this.endIndex === null){
  		if(this._tokenizer._sectionStart <= initialOffset){
  			this.startIndex = 0;
  		} else {
  			this.startIndex = this._tokenizer._sectionStart - initialOffset;
  		}
  	}
  	else this.startIndex = this.endIndex + 1;
  	this.endIndex = this._tokenizer.getAbsoluteIndex();
  };


  Parser$1.prototype.ontext = function(data){
  	this._updatePosition(1);
  	this.endIndex--;

  	if(this._cbs.ontext) this._cbs.ontext(data);
  };

  Parser$1.prototype.onopentagname = function(name){
  	if(this._lowerCaseTagNames){
  		name = name.toLowerCase();
  	}

  	this._tagname = name;

  	if(!this._options.xmlMode && name in openImpliesClose) {
  		for(
  			var el;
  			(el = this._stack[this._stack.length - 1]) in openImpliesClose[name];
  			this.onclosetag(el)
  		);
  	}

  	if(this._options.xmlMode || !(name in voidElements)){
  		this._stack.push(name);
  	}

  	if(this._cbs.onopentagname) this._cbs.onopentagname(name);
  	if(this._cbs.onopentag) this._attribs = {};
  };

  Parser$1.prototype.onopentagend = function(){
  	this._updatePosition(1);

  	if(this._attribs){
  		if(this._cbs.onopentag) this._cbs.onopentag(this._tagname, this._attribs);
  		this._attribs = null;
  	}

  	if(!this._options.xmlMode && this._cbs.onclosetag && this._tagname in voidElements){
  		this._cbs.onclosetag(this._tagname);
  	}

  	this._tagname = "";
  };

  Parser$1.prototype.onclosetag = function(name){
  	this._updatePosition(1);
  	if(this._lowerCaseTagNames){
  		name = name.toLowerCase();
  	}
  	
  	
  	
  	if(this._options.xmlMode) {
  		const stack = this._stack;
  		let last = stack.pop();
  		while(last !== name) {
  			if(this._cbs.onerror) {
  				this._cbs.onerror("Unclosed tag <"+last+">");
  			}
  			last = stack.pop();
  		}
  		this.onopentagend();
  		if(this._cbs.onclosetag) {
  			this._cbs.onclosetag(last);
  		}
  	} else {
  		if(this._stack.length && (!(name in voidElements))) {
  			let pos = this._stack.lastIndexOf(name);
  			if(pos !== -1){
  				if(this._cbs.onclosetag){
  					pos = this._stack.length - pos;
  					while(pos--) this._cbs.onclosetag(this._stack.pop());
  				}
  				else this._stack.length = pos;
  			} else if(name === "p"){
  				this.onopentagname(name);
  				this._closeCurrentTag();
  			}
  		} else if(name === "br" || name === "p"){
  			this.onopentagname(name);
  			this._closeCurrentTag();
  		}
  	}
  };

  Parser$1.prototype.onselfclosingtag = function(){
  	if(this._options.xmlMode || this._options.recognizeSelfClosing){
  		this._closeCurrentTag();
  	} else {
  		this.onopentagend();
  	}
  };

  Parser$1.prototype._closeCurrentTag = function(){
  	var name = this._tagname;

  	this.onopentagend();

  	
  	
  	if(this._stack[this._stack.length - 1] === name){
  		if(this._cbs.onclosetag){
  			this._cbs.onclosetag(name);
  		}
  		this._stack.pop();
  	}
  };

  Parser$1.prototype.onattribname = function(name){
  	if(this._lowerCaseAttributeNames){
  		name = name.toLowerCase();
  	}
  	this._attribname = name;
  };

  Parser$1.prototype.onattribdata = function(value){
  	this._attribvalue += value;
  };

  Parser$1.prototype.onattribend = function(){
  	if(this._cbs.onattribute) this._cbs.onattribute(this._attribname, this._attribvalue);
  	if(
  		this._attribs &&
  		!Object.prototype.hasOwnProperty.call(this._attribs, this._attribname)
  	){
  		this._attribs[this._attribname] = this._attribvalue;
  	}
  	this._attribname = "";
  	this._attribvalue = "";
  };

  Parser$1.prototype._getInstructionName = function(value){
  	var idx = value.search(re_nameEnd),
  	    name = idx < 0 ? value : value.substr(0, idx);

  	if(this._lowerCaseTagNames){
  		name = name.toLowerCase();
  	}

  	return name;
  };

  Parser$1.prototype.ondeclaration = function(value){
  	if(this._cbs.onprocessinginstruction){
  		var name = this._getInstructionName(value);
  		this._cbs.onprocessinginstruction("!" + name, "!" + value);
  	}
  };

  Parser$1.prototype.onprocessinginstruction = function(value){
  	if(this._cbs.onprocessinginstruction){
  		var name = this._getInstructionName(value);
  		this._cbs.onprocessinginstruction("?" + name, "?" + value);
  	}
  };

  Parser$1.prototype.oncomment = function(value){
  	this._updatePosition(4);

  	if(this._cbs.oncomment) this._cbs.oncomment(value);
  	if(this._cbs.oncommentend) this._cbs.oncommentend();
  };

  Parser$1.prototype.oncdata = function(value){
  	this._updatePosition(1);

  	if(this._options.xmlMode || this._options.recognizeCDATA){
  		if(this._cbs.oncdatastart) this._cbs.oncdatastart();
  		if(this._cbs.ontext) this._cbs.ontext(value);
  		if(this._cbs.oncdataend) this._cbs.oncdataend();
  	} else {
  		this.oncomment("[CDATA[" + value + "]]");
  	}
  };

  Parser$1.prototype.onerror = function(err){
  	if(this._cbs.onerror) this._cbs.onerror(err);
  };

  Parser$1.prototype.onend = function(){
  	if(this._cbs.onclosetag){
  		for(
  			var i = this._stack.length;
  			i > 0;
  			this._cbs.onclosetag(this._stack[--i])
  		);
  	}
  	if(this._cbs.onend) this._cbs.onend();
  };



  Parser$1.prototype.reset = function(){
  	if(this._cbs.onreset) this._cbs.onreset();
  	this._tokenizer.reset();

  	this._tagname = "";
  	this._attribname = "";
  	this._attribs = null;
  	this._stack = [];

  	if(this._cbs.onparserinit) this._cbs.onparserinit(this);
  };


  Parser$1.prototype.parseComplete = function(data){
  	this.reset();
  	this.end(data);
  };

  Parser$1.prototype.write = function(chunk){
  	this._tokenizer.write(chunk);
  };

  Parser$1.prototype.end = function(chunk){
  	this._tokenizer.end(chunk);
  };

  Parser$1.prototype.pause = function(){
  	this._tokenizer.pause();
  };

  Parser$1.prototype.resume = function(){
  	this._tokenizer.resume();
  };


  Parser$1.prototype.parseChunk = Parser$1.prototype.write;
  Parser$1.prototype.done = Parser$1.prototype.end;

  var Parser_1 = Parser$1;

  Parser_1.prototype.ondeclaration = function(value){
    if(this._cbs.ondeclaration){
      this._cbs.ondeclaration(value);
    } else if(this._cbs.onprocessinginstruction){
      var name = this._getInstructionName(value);
      this._cbs.onprocessinginstruction("!" + name, "!" + value);
    }
  };


  Parser_1.prototype.oncdata = function(value){
    this._updatePosition(1);

    if(this._options.xmlMode || this._options.recognizeCDATA){
      if(this._cbs.oncdatastart) this._cbs.oncdatastart(value);
      
      if(this._cbs.oncdataend) this._cbs.oncdataend();
    } else {
      this.oncomment("[CDATA[" + value + "]]");
    }
  };

  function parseMarkup (markup, options) {
    let format = options.ownerDocument ? options.ownerDocument.format : options.format;
    
    if (!format) {
      throw new Error("Either 'ownerDocument' or 'format' must be set.")
    }
    let parserOptions = Object.assign({}, options, {
      xmlMode: (format === 'xml')
    });
    let handler = new DomHandler({ format, elementFactory: options.elementFactory });
    let parser = new Parser_1(handler, parserOptions);
    parser.end(markup);
    return handler.document
  }

  const RE_WHITESPACE = /\s+/g;
  const RE_DOCTYPE = /^DOCTYPE\s+([^\s]+)(?:\s+PUBLIC\s+["]([^"]+)["](?:\s+["]([^"]+)["])?)\s*$/;


  class DomHandler {
    constructor (options = {}) {
      this.elementFactory = options.elementFactory;
      if (!this.elementFactory) throw new Error("'elementFactory' is required")
      this.options = options;
      this.document = null;
      this._tagStack = [];
    }

    
    onparserinit () {
      this.document = this.elementFactory('document', { format: this.options.format });
      this._tagStack = [this.document];
    }

    onend () {
      
      if (this._tagStack.length > 1) {
        throw new Error(`Unexpected EOF. Tag was opened but not closed.`)
      }
    }

    onerror (error) {
      throw new Error(error)
    }

    onclosetag () {
      this._tagStack.pop();
    }

    _addDomElement (element) {
      let parent = this._tagStack[this._tagStack.length - 1];
      if (!parent.childNodes) parent.childNodes = [];
      let siblings = parent.childNodes;

      let previousSibling = siblings[siblings.length - 1];
      
      element.next = null;
      if (previousSibling) {
        element.prev = previousSibling;
        previousSibling.next = element;
      } else {
        element.prev = null;
      }
      
      siblings.push(element);
      element.parent = parent || null;
    }

    onopentag (name, attributes) {
      let element = this.document.createElement(name);
      forEach(attributes, (val, key) => {
        element.setAttribute(key, val);
      });
      this._addDomElement(element);
      this._tagStack.push(element);
    }

    ontext (text) {
      if (this.options.normalizeWhitespace) {
        text = text.replace(RE_WHITESPACE, ' ');
      }
      let lastTag;
      let _top = this._tagStack[this._tagStack.length - 1];
      if (_top && _top.childNodes) lastTag = _top.childNodes[_top.childNodes.length - 1];
      if (lastTag && lastTag.type === domelementtype.Text) {
        lastTag.data += text;
      } else {
        let element = this.document.createTextNode(text);
        this._addDomElement(element);
      }
    }

    oncomment (data) {
      var lastTag = this._tagStack[this._tagStack.length - 1];
      if (lastTag && lastTag.type === domelementtype.Comment) {
        lastTag.data += data;
      } else {
        let element = this.document.createComment(data);
        this._addDomElement(element);
        this._tagStack.push(element);
      }
    }

    oncommentend () {
      this._tagStack.pop();
    }

    oncdatastart (data) {
      let element = this.document.createCDATASection(data);
      this._addDomElement(element);
      this._tagStack.push(element);
    }

    oncdataend () {
      this._tagStack.pop();
    }

    onprocessinginstruction (name, data) {
      
      
      data = data.slice(name.length, -1).trim();
      
      name = name.slice(1);
      let el = this.document.createProcessingInstruction(name, data);
      if (name === 'xml') {
        this.document._xmlInstruction = el;
      } else {
        this._addDomElement(el);
      }
    }

    ondeclaration (data) {
      if (data.startsWith('DOCTYPE')) {
        let m = RE_DOCTYPE.exec(data);
        if (!m) throw new Error('Could not parse DOCTYPE element: ' + data)
        this.document.setDoctype(m[1], m[2], m[3]);
      } else {
        throw new Error('Not implemented: parse declaration ' + data)
      }
    }
  }

  let _browserWindowStub;

  class MemoryDOMElement extends DOMElement {
    constructor (type, args = {}) {
      super();

      this.type = type;
      if (!type) throw new Error("'type' is mandatory")

      this.ownerDocument = args.ownerDocument;
      
      if (type !== 'document' && !this.ownerDocument) {
        throw new Error("'ownerDocument' is mandatory")
      }

      
      
      

      switch (type) {
        case domelementtype.Tag: {
          if (!args.name) throw new Error("'name' is mandatory.")
          this.name = this._normalizeName(args.name);
          this.nameWithoutNS = nameWithoutNS(this.name);
          this.properties = new Map();
          this.attributes = new Map();
          this.classes = new Set();
          this.styles = new Map();
          this.eventListeners = [];
          this.childNodes = args.children || args.childNodes || [];
          this._assign(args);
          break
        }
        case domelementtype.Text:
        case domelementtype.Comment: {
          this.data = args.data || '';
          break
        }
        case domelementtype.CDATA: {
          this.data = args.data || '';
          break
        }
        case domelementtype.Directive: {
          if (!args.name) throw new Error("'name' is mandatory.")
          this.name = this._normalizeName(args.name);
          this.nameWithoutNS = nameWithoutNS(this.name);
          this.data = args.data;
          break
        }
        case domelementtype.Doctype: {
          this.data = args.data;
          break
        }
        case 'document': {
          let format = args.format;
          this.format = format;
          if (!format) throw new Error("'format' is mandatory.")
          this.childNodes = args.children || args.childNodes || [];
          switch (format) {
            case 'xml':
              this.contentType = 'application/xml';
              break
            case 'html':
              this.contentType = 'text/html';
              break
            default:
              throw new Error('Unsupported format ' + format)
          }
          break
        }
        default:
          this.name = null;
          this.properties = new Map();
          this.attributes = new Map();
          this.classes = new Set();
          this.styles = new Map();
          this.eventListeners = [];
          this.childNodes = args.children || args.childNodes || [];
      }
    }

    getNativeElement () {
      return this
    }

    getNodeType () {
      switch (this.type) {
        case domelementtype.Tag:
        case domelementtype.Script:
        case domelementtype.Style:
          return 'element'
        default:
          return this.type
      }
    }

    isTextNode () {
      return this.type === 'text'
    }

    isElementNode () {
      return this.type === 'tag' || this.type === 'script'
    }

    isCommentNode () {
      return this.type === 'comment'
    }

    isDocumentNode () {
      return this.type === 'document'
    }

    isComponentNode () {
      return this.type === 'component'
    }

    clone (deep) {
      let clone = new MemoryDOMElement(this.type, this);
      if (this.childNodes) {
        clone.childNodes.length = 0;
        if (deep) {
          this.childNodes.forEach((child) => {
            clone.appendChild(child.clone(deep));
          });
        }
      }
      return clone
    }

    get tagName () {
      return this.getTagName()
    }

    set tagName (tagName) {
      this.setTagName(tagName);
    }

    getTagName () {
      return this.name
    }

    setTagName (tagName) {
      if (this._isXML()) {
        this.name = String(tagName);
      } else {
        this.name = String(tagName).toLowerCase();
      }
      this.nameWithoutNS = nameWithoutNS(this.name);
      return this
    }

    hasAttribute (name) {
      if (this.attributes) {
        return this.attributes.has(name)
      }
    }

    getAttribute (name) {
      if (this.attributes) {
        return this.attributes.get(name)
      }
    }

    setAttribute (name, value) {
      if (this.attributes) {
        value = String(value);
        
        switch (name) {
          case 'class':
            this.classes = new Set();
            parseClasses(this.classes, value);
            break
          case 'style':
            this.styles = new Map();
            parseStyles(this.styles, value);
            break
          default:
            
        }
        this.attributes.set(name, value);
        if (this._isHTML()) {
          deriveHTMLPropertyFromAttribute(this, name, value);
        }
      }
      return this
    }

    removeAttribute (name) {
      if (this.attributes) {
        switch (name) {
          case 'class':
            this.classes = new Set();
            break
          case 'style':
            this.styles = new Map();
            break
          default:
            
        }
        this.attributes.delete(name);
      }
      return this
    }

    getAttributes () {
      return this.attributes
    }

    getProperty (name) {
      if (this.properties) {
        return this.properties.get(name)
      }
    }

    setProperty (name, value) {
      if (this.properties) {
        if (this._isXML()) {
          throw new Error('setProperty() is only be used on HTML elements')
        }
        _setHTMLPropertyValue(this, name, value);
      }
      return this
    }

    hasClass (name) {
      if (this.classes) {
        return this.classes.has(name)
      }
    }

    addClass (name) {
      if (this.classes) {
        this.classes.add(name);
        this.attributes.set('class', stringifyClasses(this.classes));
      }
      return this
    }

    removeClass (name) {
      if (this.classes && this.classes.has(name)) {
        this.classes.delete(name);
        this.attributes.set('class', stringifyClasses(this.classes));
      }
      return this
    }

    getContentType () {
      return this.getOwnerDocument().contentType
    }

    getDoctype () {
      if (this.isDocumentNode()) {
        return _findDocTypeElement(this)
      } else {
        return this.getOwnerDocument().getDoctype()
      }
    }

    setDoctype (qualifiedNameStr, publicId, systemId) {
      
      let doc = this.getOwnerDocument();
      let oldDocType = _findDocTypeElement(doc);
      let newDocType = this.createDocumentType(qualifiedNameStr, publicId, systemId);
      if (oldDocType) {
        doc.replaceChild(oldDocType, newDocType);
      } else {
        
        doc.insertBefore(newDocType, doc.getChildren()[0]);
      }
      doc.doctype = newDocType;
    }

    getInnerHTML () {
      let isXML = this._isXML();
      return domUtils.getInnerHTML(this, { xmlMode: isXML, decodeEntities: !isXML })
    }

    
    
    setInnerHTML (html) {
      if (this.childNodes) {
        let isXML = this._isXML();
        let _doc = parseMarkup(html, {
          ownerDocument: this.getOwnerDocument(),
          format: isXML ? 'xml' : 'html',
          decodeEntities: !isXML,
          elementFactory: MemoryDOMElementFactory
        });
        this.empty();
        
        
        _doc.childNodes.slice(0).forEach(child => {
          this.appendChild(child);
        });
      }
      return this
    }

    getOuterHTML () {
      let isXML = this._isXML();
      return domUtils.getOuterHTML(this, { xmlMode: isXML, decodeEntities: !isXML })
    }

    getTextContent () {
      return domUtils.getText(this)
    }

    setTextContent (text) {
      switch (this.type) {
        case domelementtype.Text:
        case domelementtype.Comment:
        case domelementtype.CDATA: {
          this.data = text;
          break
        }
        default: {
          if (this.childNodes) {
            let child = this.createTextNode(text);
            this.empty();
            this.appendChild(child);
          }
        }
      }
      return this
    }

    getStyle (name) {
      if (this.styles) {
        return this.styles.get(name)
      }
    }

    setStyle (name, value) {
      if (this.styles) {
        if (DOMElement.pxStyles[name] && isNumber(value)) {
          value = value + 'px';
        }
        this.styles.set(name, value);
        this.attributes.set('style', stringifyStyles(this.styles));
      }
      return this
    }

    is (cssSelector) {
      return cssSelect.is(this, cssSelector, { xmlMode: this._isXML() })
    }

    find (cssSelector) {
      return cssSelect.selectOne(cssSelector, this, { xmlMode: this._isXML() })
    }

    findAll (cssSelector) {
      return cssSelect.selectAll(cssSelector, this, { xmlMode: this._isXML() })
    }

    getChildCount () {
      if (this.childNodes) {
        return this.childNodes.length
      } else {
        return 0
      }
    }

    getChildNodes () {
      return this.childNodes.slice(0)
    }

    getChildren () {
      return this.childNodes.filter(function (node) {
        return node.type === 'tag'
      })
    }

    get children () {
      return this.getChildren()
    }

    getChildAt (pos) {
      if (this.childNodes) {
        return this.childNodes[pos]
      }
    }

    getChildIndex (child) {
      if (this.childNodes) {
        return this.childNodes.indexOf(child)
      }
    }

    getLastChild () {
      if (this.childNodes) {
        return last(this.childNodes)
      }
    }

    getFirstChild () {
      if (this.childNodes) {
        return this.childNodes[0]
      }
    }

    getNextSibling () {
      return this.next
    }

    getPreviousSibling () {
      return this.prev
    }

    getParent () {
      
      
      
      
      
      
      
      
      
      return this.parent
    }

    getOwnerDocument () {
      return (this.type === 'document') ? this : this.ownerDocument
    }

    getFormat () {
      return this.getOwnerDocument().format
    }

    createDocument (format) {
      return MemoryDOMElement.createDocument(format)
    }

    createElement (tagName) {
      return new MemoryDOMElement(domelementtype.Tag, { name: tagName, ownerDocument: this.getOwnerDocument() })
    }

    createTextNode (text) {
      return new MemoryDOMElement(domelementtype.Text, { data: text, ownerDocument: this.getOwnerDocument() })
    }

    createComment (data) {
      return new MemoryDOMElement(domelementtype.Comment, { data: data, ownerDocument: this.getOwnerDocument() })
    }

    createProcessingInstruction (name, data) {
      return new MemoryDOMElement(domelementtype.Directive, { name: name, data: data, ownerDocument: this.getOwnerDocument() })
    }

    createDocumentType (qualifiedNameStr, publicId, systemId) {
      return new MemoryDOMDoctype(domelementtype.Doctype, { data: { name: qualifiedNameStr, publicId, systemId }, ownerDocument: this.getOwnerDocument() })
    }

    createCDATASection (data) {
      return new MemoryDOMElement(domelementtype.CDATA, { data: data, ownerDocument: this.getOwnerDocument() })
    }

    appendChild (child) {
      if (this.childNodes && !isNil(child)) {
        child = this._normalizeChild(child);
        if (!child) return this
        domUtils.appendChild(this, child);
        child.ownerDocument = this.getOwnerDocument();
      }
      return this
    }

    removeChild (child) {
      if (child.parentNode === this) {
        child.remove();
      }
    }

    insertAt (pos, child) {
      child = this._normalizeChild(child);
      if (!child) return this
      let childNodes = this.childNodes;
      if (childNodes) {
        
        if (pos >= childNodes.length) {
          domUtils.appendChild(this, child);
        } else {
          domUtils.prepend(childNodes[pos], child);
        }
        child.ownerDocument = this.getOwnerDocument();
      }
      return this
    }

    insertBefore (newChild, before) {
      if (isNil(before)) {
        return this.appendChild(newChild)
      } else if (this.childNodes) {
        var pos = this.childNodes.indexOf(before);
        if (pos > -1) {
          domUtils.prepend(before, newChild);
          newChild.ownerDocument = this.getOwnerDocument();
        } else {
          throw new Error('insertBefore(): reference node is not a child of this element.')
        }
      }
      return this
    }

    removeAt (pos) {
      let childNodes = this.childNodes;
      if (childNodes) {
        let child = childNodes[pos];
        child.remove();
      }
      return this
    }

    empty () {
      let childNodes = this.childNodes;
      if (childNodes) {
        childNodes.forEach((child) => {
          child.next = child.prev = child.parent = null;
        });
        childNodes.length = 0;
      }
      return this
    }

    remove () {
      domUtils.removeElement(this);
      return this
    }

    replaceChild (oldChild, newChild) {
      if (oldChild.parent === this) {
        oldChild.replaceWith(newChild);
      }
      return this
    }

    replaceWith (newEl) {
      newEl = this._normalizeChild(newEl);
      domUtils.replaceElement(this, newEl);
      newEl.ownerDocument = this.getOwnerDocument();
      return this
    }

    getEventListeners () {
      return this.eventListeners || []
    }

    click () {
      this.emit('click', { target: this, currentTarget: this });
      return true
    }

    emit (name, data) {
      this._propagateEvent(new MemoryDOMElementEvent(name, this, data));
    }

    getBoundingClientRect () {
      return { top: 0, left: 0, height: 0, width: 0 }
    }

    getClientRects () {
      return [{ top: 0, left: 0, height: 0, width: 0 }]
    }

    _propagateEvent (event) {
      let listeners = this.eventListeners;
      if (listeners) {
        listeners.forEach(l => {
          if (l.eventName === event.type) {
            l.handler(event);
          }
        });
        if (event.stopped) return
        let p = this.parentNode;
        if (p) p._propagateEvent(event);
      }
    }

    removeAllEventListeners () {
      this.eventListeners = [];
      return this
    }

    _assign (other) {
      if (other.name) this.name = other.name;
      if (this.classes && other.classes) {
        other.classes.forEach((val) => {
          this.classes.add(val);
        });
      }
      if (this.styles && other.styles) {
        forEach(other.styles, (val, name) => {
          this.styles.set(name, val);
        });
      }
      
      
      let otherAttributes = other.attributes || other.attribs;
      if (this.attributes && otherAttributes) {
        forEach(otherAttributes, (val, name) => {
          switch (name) {
            case 'class': {
              parseClasses(this.classes, val);
              break
            }
            case 'style': {
              parseStyles(this.styles, val);
              break
            }
            default:
              
          }
          this.attributes.set(name, val);
        });
      }
      if (this.eventListeners && other.eventListeners) {
        this.eventListeners = this.eventListeners.concat(other.eventListeners);
      }
    }

    _normalizeChild (child) {
      if (isNil(child)) return

      if (isString(child)) {
        child = this.createTextNode(child);
      }
      
      if (!child || !child._isMemoryDOMElement) {
        throw new Error('Illegal argument: only String and MemoryDOMElement instances are valid.')
      }
      return child
    }

    _normalizeName (name) {
      if (this._isXML()) {
        return name
      } else {
        return name.toLowerCase()
      }
    }

    _isHTML () {
      return this.getFormat() === 'html'
    }

    _isXML () {
      return this.getFormat() === 'xml'
    }

    
    get _isMemoryDOMElement () { return true }

    static createDocument (format, opts = {}) {
      if (format === 'xml') {
        let doc = new MemoryDOMElement('document', { format: format });
        let xmlInstruction = [];
        if (opts.version) {
          xmlInstruction.push(`version="${opts.version}"`);
        }
        if (opts.encoding) {
          xmlInstruction.push(`encoding="${opts.encoding}"`);
        }
        if (xmlInstruction.length > 0) {
          doc._xmlInstruction = doc.createProcessingInstruction('xml', xmlInstruction.join(' '));
        }
        return doc
      } else {
        return MemoryDOMElement.parseMarkup(DOMElement.EMPTY_HTML, 'html')
      }
    }

    static parseMarkup (str, format, options = {}) {
      if (!str) {
        return MemoryDOMElement.createDocument(format)
      }
      
      let decodeEntities = format === 'html';
      let parserOpts = Object.assign({
        format,
        decodeEntities,
        elementFactory: MemoryDOMElementFactory
      }, options);
      
      if (options.raw) {
        return parseMarkup(str, parserOpts)
      }
      if (options.snippet) {
        str = `<__snippet__>${str}</__snippet__>`;
      }
      let doc;
      if (format === 'html') {
        doc = parseMarkup(str, parserOpts);
        _sanitizeHTMLStructure(doc);
      } else if (format === 'xml') {
        doc = parseMarkup(str, parserOpts);
      }
      if (options.snippet) {
        let childNodes = doc.find('__snippet__').childNodes;
        if (childNodes.length === 1) {
          return childNodes[0]
        } else {
          return childNodes
        }
      } else {
        return doc
      }
    }

    static wrapNativeElement (el) {
      if (inBrowser) {
        
        
        
        
        if (el === window || el === window.document) {
          return new DOMElementStub()
        
        
        
        } else if (el instanceof window.Node || el._isBrowserDOMElement) ;
      }
      
      if (!el._isMemoryDOMElement) {
        throw new Error('Illegal argument: expected MemoryDOMElement instance')
      }
      return el
    }

    static wrap (el) { return MemoryDOMElement.wrapNativeElement(el) }

    static unwrap (el) {
      
      if (!el._isMemoryDOMElement) {
        throw new Error('Illegal argument: expected MemoryDOMElement instance')
      }
      return el
    }

    
    
    
    static isReverse () {
      return false
    }

    static getBrowserWindow () {
      
      if (!_browserWindowStub) {
        _browserWindowStub = new MemoryWindowStub();
      }
      return _browserWindowStub
    }
  }

  function MemoryDOMElementFactory (type, data) {
    return new MemoryDOMElement(type, data)
  }

  class MemoryDOMDoctype extends MemoryDOMElement {
    get name () { return this.data.name }
    get publicId () { return this.data.publicId }
    get systemId () { return this.data.systemId }
  }

  function parseClasses (classes, classStr) {
    classStr.split(/\s+/).forEach((name) => {
      classes.add(name);
    });
  }

  function stringifyClasses (classes) {
    return Array.from(classes).join(' ')
  }

  function parseStyles (styles, styleStr) {
    styleStr = (styleStr || '').trim();
    if (!styleStr) return
    styleStr.split(';').forEach((style) => {
      let n = style.indexOf(':');
      
      if (n < 1 || n === style.length - 1) return
      let name = style.slice(0, n).trim();
      let val = style.slice(n + 1).trim();
      styles.set(name, val);
    });
  }

  function stringifyStyles (styles) {
    if (!styles) return ''
    let str = Object.keys(styles).map((name) => {
      return name + ':' + styles[name]
    }).join(';');
    if (str.length > 0) str += ';';
    return str
  }

  const BUILTIN_EVENTS = [
    'keydown', 'keyup', 'keypress',
    'mousedown', 'mouseup', 'mouseover', 'click', 'dblclick'
  ].reduce((m, k) => { m[k] = true; return m }, {});

  class MemoryDOMElementEvent {
    constructor (type, target, detail) {
      this.type = type;
      this.timeStamp = Date.now();
      this.target = target;

      if (BUILTIN_EVENTS[type]) {
        
        if (detail) {
          Object.assign(this, detail);
        }
      } else {
        this.detail = detail;
      }
    }

    stopPropagation () {
      this.stopped = true;
    }

    preventDefault () {
      this.defaultPrevented = true;
    }
  }

  class DOMElementStub {
    on () {}
    off () {}
  }



  class MemoryWindowStub extends MemoryDOMElement {
    constructor () {
      super('window', { ownerDocument: MemoryDOMElement.createDocument('html') });

      let location = {
        href: '',
        hash: ''
      };

      function _updateLocation (url) {
        let hashIdx = url.indexOf('#');
        location.href = url;
        if (hashIdx >= 0) {
          location.hash = url.slice(hashIdx);
        }
      }

      let history = {
        replaceState (stateObj, title, url) {
          _updateLocation(url);
        },
        pushState (stateObj, title, url) {
          _updateLocation(url);
        }
      };

      this.location = location;
      this.history = history;
    }
  }

  function nameWithoutNS (name) {
    const idx = name.indexOf(':');
    if (idx > 0) {
      return name.slice(idx + 1)
    } else {
      return name
    }
  }



  const ATTR_TO_PROPS = {
    'input': {
      'value': true,
      'checked': (el, name, value) => {
        const checked = (value !== 'off');
        el.setProperty('checked', checked);
      }
    }
  };

  function deriveHTMLPropertyFromAttribute (el, name, value) {
    const mappings = ATTR_TO_PROPS[el.tagName];
    if (mappings) {
      let mapper = mappings[name];
      if (mapper === true) {
        el.setProperty(name, value);
      } else if (mapper) {
        mapper(el, name, value);
      }
    }
  }

  const PROPERTY_TRANSFORMATIONS = {
    'input': {
      'checked': (el, name, value) => {
        if (value === true) {
          el.properties.set(name, true);
          el.properties.set('value', 'on');
        } else {
          el.properties.set(name, false);
          el.properties.set('value', 'off');
        }
      },
      'value': (el, name, value) => {
        let type = el.getAttribute('type');
        switch (type) {
          case 'checkbox':
            if (value === 'on') {
              el.properties.set(name, true);
              el.properties.set('value', 'on');
            } else {
              el.properties.set(name, false);
              el.properties.set('value', 'off');
            }
            break
          default:
            _setProperty(el, name, value);
        }
      }
    }
  };

  function _setProperty (el, name, value) {
    if (value === undefined) {
      el.properties.delete(name);
    } else {
      el.properties.set(name, String(value));
    }
  }

  function _setHTMLPropertyValue (el, name, value) {
    const trafos = PROPERTY_TRANSFORMATIONS[el.tagName];
    if (trafos) {
      let mapper = trafos[name];
      if (mapper) {
        mapper(el, name, value);
        return
      }
    }
    _setProperty(el, name, value);
  }

  function _sanitizeHTMLStructure (doc) {
    
    
    
    
    let htmlEl = doc.find('html');
    if (!htmlEl) {
      
      
      let headEl = doc.find('head');
      let titleEl = doc.find('title');
      let metaEls = doc.findAll('meta');
      let bodyEl = doc.find('body');
      if (headEl) headEl.remove();
      if (titleEl) titleEl.remove();
      metaEls.forEach(e => e.remove());
      if (bodyEl) bodyEl.remove();

      
      
      let contentNodes = doc.childNodes.slice();
      contentNodes.forEach((c) => { c.parent = null; });
      doc.childNodes.length = 0;

      htmlEl = doc.createElement('html');
      
      
      
      if (!headEl) {
        headEl = doc.createElement('head');
        headEl.appendChild(titleEl);
        headEl.append(metaEls);
        htmlEl.appendChild(headEl);
      }
      if (!bodyEl) {
        bodyEl = doc.createElement('body');
        bodyEl.append(contentNodes);
      }
      htmlEl.appendChild(bodyEl);

      doc.append(htmlEl);
    }
  }

  function _findDocTypeElement (doc) {
    
    if (doc.doctype) return doc.doctype
    const childNodes = doc.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      let child = childNodes[i];
      if (child.type === domelementtype.Doctype) {
        doc.doctype = child;
        return child
      }
    }
  }

  let DefaultDOMElement = {};

  DefaultDOMElement.createDocument = function (format, opts) {
    return _getDefaultImpl().createDocument(format, opts)
  };


  DefaultDOMElement.createElement = function (tagName) {
    console.error('DEPRECATED: every element should have an ownerDocument. Use DefaultDOMElement.createDocument() to create a document first');
    let doc = DefaultDOMElement.createDocument('html');
    return doc.createElement(tagName)
  };


  DefaultDOMElement.createTextNode = function (text) {
    console.error('DEPRECATED: every element should have a ownerDocument. Use DefaultDOMElement.createDocument() to create a document first');
    let doc = DefaultDOMElement.createDocument('html');
    return doc.createTextNode(text)
  };


  DefaultDOMElement.getBrowserWindow = function () {
    return _getDefaultImpl().getBrowserWindow()
  };


  DefaultDOMElement.parseHTML = function (html, options) {
    return _getDefaultImpl().parseMarkup(html, 'html', options)
  };


  DefaultDOMElement.parseXML = function (xml, options) {
    return _getDefaultImpl().parseMarkup(xml, 'xml', options)
  };

  DefaultDOMElement.parseSnippet = function (str, format) {
    return _getDefaultImpl().parseMarkup(str, format, {snippet: true})
  };

  DefaultDOMElement.wrap =
  DefaultDOMElement.wrapNativeElement = function (nativeEl) {
    if (!nativeEl) throw new Error('Illegal argument')
    return _getDefaultImpl().wrap(nativeEl)
  };

  DefaultDOMElement.unwrap = function (nativeEl) {
    if (!nativeEl) throw new Error('Illegal argument')
    return _getDefaultImpl().unwrap(nativeEl)
  };



  DefaultDOMElement.isReverse = function (anchorNode, anchorOffset, focusNode, focusOffset) {
    return _getDefaultImpl().isReverse(anchorNode, anchorOffset, focusNode, focusOffset)
  };


  DefaultDOMElement._forceMemoryDOM = false;

  function _getDefaultImpl () {
    if (DefaultDOMElement._forceMemoryDOM) {
      return MemoryDOMElement
    } else if (platform.inBrowser || platform.inElectron) {
      return BrowserDOMElement
    } else {
      return MemoryDOMElement
    }
  }

  function findParentDOMElement (nativeEl) {
    while (nativeEl) {
      let el = DefaultDOMElement.unwrap(nativeEl);
      if (el) return el
      nativeEl = nativeEl.parentNode;
    }
  }

  function findParent (el, selector) {
    while (el) {
      if (el.is(selector)) return el
      el = el.getParent();
    }
  }

  function stop (event) {
    event.stopPropagation();
  }

  function stopAndPrevent (event) {
    event.stopPropagation();
    event.preventDefault();
  }

  function walk (el, cb) {
    _walk(el, cb, 0);
  }

  function _walk (el, cb, level) {
    cb(el, level);
    if (el.getChildCount() > 0) {
      let it = el.getChildNodeIterator();
      while (it.hasNext()) {
        _walk(it.next(), cb, level + 1);
      }
    }
  }

  function isRightButton (event) {
    let isRightButton = false;
    if ('which' in event) {
      isRightButton = (event.which === 3);
    } else if ('button' in event) {
      isRightButton = (event.button === 2);
    }
    return isRightButton
  }

  function getBoundingRect (el) {
    let _rect = el.getNativeElement().getBoundingClientRect();
    return {
      top: _rect.top,
      left: _rect.left,
      height: _rect.height,
      width: _rect.width
    }
  }

  function getBoundingRectForRects (...rects) {
    let top, left, bottom, right;
    if (rects.length > 0) {
      let first = rects[0];
      top = first.top;
      left = first.left;
      bottom = top + first.height;
      right = left + first.width;
      for (let i = 1; i < rects.length; i++) {
        let r = rects[i];
        top = Math.min(top, r.top);
        left = Math.min(left, r.left);
        bottom = Math.max(bottom, r.top + r.height);
        right = Math.max(right, r.left + r.width);
      }
    }
    return {
      top,
      left,
      right,
      bottom,
      height: bottom - top,
      width: right - left
    }
  }

  function isXInside (x, rect) {
    return x >= rect.left && x <= rect.left + rect.width
  }

  function isYInside (y, rect) {
    return y >= rect.top && y <= rect.top + rect.height
  }

  var domHelpers = /*#__PURE__*/Object.freeze({
    findParentDOMElement: findParentDOMElement,
    findParent: findParent,
    stop: stop,
    stopAndPrevent: stopAndPrevent,
    walk: walk,
    isRightButton: isRightButton,
    getBoundingRect: getBoundingRect,
    getBoundingRectForRects: getBoundingRectForRects,
    isXInside: isXInside,
    isYInside: isYInside
  });

  const BEFORE = -1;
  const AFTER = 1;
  const PARENT = -2;
  const CHILD = 2;

  function compareDOMElementPosition (a, b) {
    if (a.el._isBrowserDOMElement) {
      let res = a.getNativeElement().compareDocumentPosition(b.getNativeElement());
      if (res & window.Node.DOCUMENT_POSITION_CONTAINS) {
        return CHILD
      } else if (res & window.Node.DOCUMENT_POSITION_CONTAINED_BY) {
        return PARENT
      } else if (res & window.Node.DOCUMENT_POSITION_PRECEDING) {
        return AFTER
      } else if (res & window.Node.DOCUMENT_POSITION_FOLLOWING) {
        return BEFORE
      } else {
        return 0
      }
    } else {
      console.error('FIXME: compareDOMElementPosition() is not implemented for MemoryDOMElement.');
      return 0
    }
  }

  function nameWithoutNS$1 (name) {
    const idx = name.indexOf(':');
    if (idx > 0) {
      return name.slice(idx + 1)
    } else {
      return name
    }
  }

  function _isTextNodeEmpty (el) {
    return Boolean(/^\s*$/.exec(el.textContent))
  }

  function prettyPrintXML (xml) {
    let dom;
    if (isString(xml)) {
      dom = DefaultDOMElement.parseXML(xml);
    } else {
      dom = xml;
    }
    const result = [];
    
    
    
    
    
    let childNodes = dom.getChildNodes();
    if (dom.isDocumentNode()) {
      let xml = dom.empty().serialize();
      if (/<\?\s*xml/.exec(xml)) {
        result.push(xml);
      }
    }
    childNodes.forEach(el => {
      _prettyPrint(result, el, 0);
    });
    return result.join('\n')
  }

  function _prettyPrint (result, el, level) {
    let indent = new Array(level * 2).fill(' ').join('');
    if (el.isElementNode()) {
      const isMixed = _isMixed(el);
      const containsCDATA = _containsCDATA(el);
      if (isMixed || containsCDATA) {
        result.push(indent + el.outerHTML);
      } else {
        let children = el.children;
        const tagName = el.tagName;
        let tagStr = [`<${tagName}`];
        el.getAttributes().forEach((val, name) => {
          tagStr.push(`${name}="${val}"`);
        });
        if (children.length > 0) {
          result.push(indent + tagStr.join(' ') + '>');
          el.children.forEach((child) => {
            _prettyPrint(result, child, level + 1);
          });
          result.push(indent + `</${tagName}>`);
        } else {
          result.push(indent + tagStr.join(' ') + ' />');
        }
      }
    } else if (level === 0 && el.isTextNode()) ; else {
      result.push(indent + el.outerHTML);
    }
  }

  function _isMixed (el) {
    const childNodes = el.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      let child = childNodes[i];
      if (child.isTextNode() && !_isTextNodeEmpty(child)) {
        return true
      }
    }
  }

  function _containsCDATA (el) {
    const childNodes = el.childNodes;
    for (let i = 0; i < childNodes.length; i++) {
      let child = childNodes[i];
      if (child.getNodeType() === 'cdata') {
        return true
      }
    }
  }

  const ELEMENT_BLACK_LIST = new Set(['script', 'object', 'embed', 'link', 'math', 'iframe', 'comment', 'base']);
  const ATTRIBUTE_BLACK_LIST = new Set(['form', 'formaction', 'autofocus', 'dirname']);



  function sanitizeHTML (html, options = {}) {
    let doc = parseMarkup(html, {
      format: 'html',
      xmlMode: true,
      elementFactory: (type, data) => {
        return new MemoryDOMElement(type, data)
      }
    });
    _noFormsWithId(doc);

    let sanitized = domUtils.getOuterHTML(doc, {
      decodeEntities: true,
      disallowedTags: ELEMENT_BLACK_LIST,
      disallowHandlers: true,
      disallowedAttributes: ATTRIBUTE_BLACK_LIST,
      stripComments: true,
      stripCDATA: true
    });
    return sanitized
  }

  function _noFormsWithId (doc) {
    doc.findAll('form').forEach(f => {
      f.removeAttribute('id');
    });
  }

  class Selection {
    constructor () {
      
      var _internal = {};
      Object.defineProperty(this, '_internal', {
        enumerable: false,
        value: _internal
      });
      
      _internal.doc = null;
    }

    clone () {
      var newSel = this._clone();
      if (this._internal.doc) {
        newSel.attach(this._internal.doc);
      }
      return newSel
    }

    
    getDocument () {
      var doc = this._internal.doc;
      if (!doc) {
        throw new Error('Selection is not attached to a document.')
      }
      return doc
    }

    isAttached () {
      return Boolean(this._internal.doc)
    }

    
    attach (doc) {
      this._internal.doc = doc;
      return this
    }

    
    isNull () { return false }

    
    isPropertySelection () { return false }

    
    isContainerSelection () { return false }

    
    isNodeSelection () { return false }

    isCustomSelection () { return false }

    
    isCollapsed () { return true }

    
    isReverse () { return false }

    getType () {
      throw new Error('Selection.getType() is abstract.')
    }

    get type () {
      return this.getType()
    }

    getNodeId () {
      return null
    }

    
    equals (other) {
      if (this === other) {
        return true
      } else if (!other) {
        return false
      } else if (this.isNull() !== other.isNull()) {
        return false
      } else if (this.getType() !== other.getType()) {
        return false
      } else {
        
        
        return true
      }
    }

    
    toString () {
      return 'null'
    }

    
    toJSON () {
      throw new Error('This method is abstract.')
    }

    createWith (update) {
      let SelectionClass = this.constructor;
      let data = this.toJSON();
      Object.assign(data, update);
      return SelectionClass.fromJSON(data)
    }

    
    get _isSelection () { return true }

    static get nullSelection () { return NULL_SELECTION }
  }


  class NullSelection extends Selection {
    isNull () {
      return true
    }

    getType () {
      return 'null'
    }

    toJSON () {
      return null
    }

    clone () {
      return this
    }
  }


  const NULL_SELECTION = Object.freeze(new NullSelection());

  function isArrayEqual (arr1, arr2) {
    if (arr1 === arr2) return true
    if (!isArray(arr1) || !isArray(arr2)) return false
    if (arr1.length !== arr2.length) return false
    let L = arr1.length;
    for (var i = 0; i < L; i++) {
      if (arr1[i] !== arr2[i]) return false
    }
    return true
  }

  class Coordinate {
    
    constructor (path, offset) {
      
      if (arguments[0] === 'SKIP') return
      if (arguments.length === 1) {
        let data = arguments[0];
        this.path = data.path;
        this.offset = data.offset;
      } else {
        this.path = path;
        this.offset = offset;
      }
      if (!isArray(this.path)) {
        throw new Error('Invalid arguments: path should be an array.')
      }
      if (!isNumber(this.offset) || this.offset < 0) {
        throw new Error('Invalid arguments: offset must be a positive number.')
      }
    }

    equals (other) {
      return (other === this ||
        (isArrayEqual(other.path, this.path) && other.offset === this.offset))
    }

    withCharPos (offset) {
      return new Coordinate(this.path, offset)
    }

    getNodeId () {
      return this.path[0]
    }

    getPath () {
      return this.path
    }

    getOffset () {
      return this.offset
    }

    toJSON () {
      return {
        path: this.path.slice(),
        offset: this.offset
      }
    }

    clone () {
      return new Coordinate(this.toJSON())
    }

    toString () {
      return '(' + this.path.join('.') + ', ' + this.offset + ')'
    }

    isPropertyCoordinate () {
      return this.path.length > 1
    }

    isNodeCoordinate () {
      return this.path.length === 1
    }

    hasSamePath (other) {
      return isArrayEqual(this.path, other.path)
    }

    isEqual (other) {
      if (!other) return false
      return this.offset === other.offset && this.hasSamePath(other)
    }

    
    get _isCoordinate () { return true }
  }

  class PropertySelection extends Selection {
    
    constructor (path, startOffset, endOffset, reverse, containerPath, surfaceId) {
      super();

      if (arguments.length === 1) {
        let data = arguments[0];
        path = data.path;
        startOffset = data.startOffset;
        endOffset = data.endOffset;
        reverse = data.reverse;
        containerPath = data.containerPath;
        surfaceId = data.surfaceId;
      }

      if (!path || !isNumber(startOffset)) {
        throw new Error('Invalid arguments: `path` and `startOffset` are mandatory')
      }

      this.start = new Coordinate(path, startOffset);
      this.end = new Coordinate(path, isNumber(endOffset) ? endOffset : startOffset);

      
      this.reverse = Boolean(reverse);

      this.containerPath = containerPath;

      
      this.surfaceId = surfaceId;
    }

    get path () {
      return this.start.path
    }

    get startOffset () {
      return this.start.offset
    }

    get endOffset () {
      return this.end.offset
    }

    
    toJSON () {
      return {
        type: 'property',
        path: this.start.path,
        startOffset: this.start.offset,
        endOffset: this.end.offset,
        reverse: this.reverse,
        containerPath: this.containerPath,
        surfaceId: this.surfaceId
      }
    }

    isPropertySelection () {
      return true
    }

    getType () {
      return 'property'
    }

    isNull () {
      return false
    }

    isCollapsed () {
      return this.start.offset === this.end.offset
    }

    isReverse () {
      return this.reverse
    }

    equals (other) {
      return (
        Selection.prototype.equals.call(this, other) &&
        (this.start.equals(other.start) && this.end.equals(other.end))
      )
    }

    toString () {
      
      return [
        'PropertySelection(', JSON.stringify(this.path), ', ',
        this.start.offset, ' -> ', this.end.offset,
        (this.reverse ? ', reverse' : ''),
        (this.surfaceId ? (', ' + this.surfaceId) : ''),
        ')'
      ].join('')
    }

    
    collapse (direction) {
      var offset;
      if (direction === 'left') {
        offset = this.start.offset;
      } else {
        offset = this.end.offset;
      }
      return this.createWithNewRange(offset, offset)
    }

    
    

    
    getPath () {
      return this.start.path
    }

    getNodeId () {
      return this.start.path[0]
    }

    getPropertyName () {
      return this.start.path[1]
    }

    
    isInsideOf (other, strict) {
      if (other.isNull()) return false
      if (other.isContainerSelection()) {
        return other.contains(this, strict)
      }
      if (strict) {
        return (isArrayEqual(this.path, other.path) &&
          this.start.offset > other.start.offset &&
          this.end.offset < other.end.offset)
      } else {
        return (isArrayEqual(this.path, other.path) &&
          this.start.offset >= other.start.offset &&
          this.end.offset <= other.end.offset)
      }
    }

    
    contains (other, strict) {
      if (other.isNull()) return false
      return other.isInsideOf(this, strict)
    }

    
    overlaps (other, strict) {
      if (other.isNull()) return false
      if (other.isContainerSelection()) {
        
        return other.overlaps(this)
      }
      if (!isArrayEqual(this.path, other.path)) return false
      if (strict) {
        return (!(this.start.offset >= other.end.offset || this.end.offset <= other.start.offset))
      } else {
        return (!(this.start.offset > other.end.offset || this.end.offset < other.start.offset))
      }
    }

    
    isRightAlignedWith (other) {
      if (other.isNull()) return false
      if (other.isContainerSelection()) {
        
        return other.isRightAlignedWith(this)
      }
      return (isArrayEqual(this.path, other.path) &&
        this.end.offset === other.end.offset)
    }

    
    isLeftAlignedWith (other) {
      if (other.isNull()) return false
      if (other.isContainerSelection()) {
        
        return other.isLeftAlignedWith(this)
      }
      return (isArrayEqual(this.path, other.path) &&
        this.start.offset === other.start.offset)
    }

    
    expand (other) {
      if (other.isNull()) return this

      
      
      
      if (other.isContainerSelection()) {
        return other.expand(this)
      }
      if (!isArrayEqual(this.path, other.path)) {
        throw new Error('Can not expand PropertySelection to a different property.')
      }
      var newStartOffset = Math.min(this.start.offset, other.start.offset);
      var newEndOffset = Math.max(this.end.offset, other.end.offset);
      return this.createWithNewRange(newStartOffset, newEndOffset)
    }

    
    truncateWith (other) {
      if (other.isNull()) return this
      if (other.isInsideOf(this, 'strict')) {
        
        throw new Error('Can not truncate with a contained selections')
      }
      if (!this.overlaps(other)) {
        return this
      }
      let otherStartOffset, otherEndOffset;
      if (other.isPropertySelection()) {
        otherStartOffset = other.start.offset;
        otherEndOffset = other.end.offset;
      } else if (other.isContainerSelection()) {
        
        if (isArrayEqual(other.start.path, this.start.path)) {
          otherStartOffset = other.start.offset;
        } else {
          otherStartOffset = this.start.offset;
        }
        if (isArrayEqual(other.end.path, this.start.path)) {
          otherEndOffset = other.end.offset;
        } else {
          otherEndOffset = this.end.offset;
        }
      } else {
        return this
      }

      let newStartOffset;
      let newEndOffset;
      if (this.start.offset > otherStartOffset && this.end.offset > otherEndOffset) {
        newStartOffset = otherEndOffset;
        newEndOffset = this.end.offset;
      } else if (this.start.offset < otherStartOffset && this.end.offset < otherEndOffset) {
        newStartOffset = this.start.offset;
        newEndOffset = otherStartOffset;
      } else if (this.start.offset === otherStartOffset) {
        if (this.end.offset <= otherEndOffset) {
          return Selection.nullSelection
        } else {
          newStartOffset = otherEndOffset;
          newEndOffset = this.end.offset;
        }
      } else if (this.end.offset === otherEndOffset) {
        if (this.start.offset >= otherStartOffset) {
          return Selection.nullSelection
        } else {
          newStartOffset = this.start.offset;
          newEndOffset = otherStartOffset;
        }
      } else if (other.contains(this)) {
        return Selection.nullSelection
      } else {
        
        throw new Error('Illegal state.')
      }
      return this.createWithNewRange(newStartOffset, newEndOffset)
    }

    
    createWithNewRange (startOffset, endOffset) {
      var sel = new PropertySelection(this.path, startOffset, endOffset, false, this.containerPath, this.surfaceId);
      var doc = this._internal.doc;
      if (doc) {
        sel.attach(doc);
      }
      return sel
    }

    _clone () {
      return new PropertySelection(this.start.path, this.start.offset, this.end.offset, this.reverse, this.containerPath, this.surfaceId)
    }
  }

  PropertySelection.fromJSON = function (json) {
    return new PropertySelection(json)
  };

  function compareCoordinates (doc, containerPath, coor1, coor2) {
    
    if (!coor1.hasSamePath(coor2)) {
      let address1 = _getContainerAddress(doc, containerPath, coor1);
      let address2 = _getContainerAddress(doc, containerPath, coor2);
      let L = Math.min(address1.length, address2.length);
      for (let level = 0; level < L; level++) {
        let p1 = address1[level];
        let p2 = address2[level];
        if (p1 < p2) return -1
        if (p1 > p2) return 1
      }
      if (address1.length === address2.length) {
        return Math.sign(coor1.offset - coor2.offset)
      } else {
        
        console.error('FIXME: unexpected case in compareCoordinates()');
        return 0
      }
    } else {
      return Math.sign(coor1.offset - coor2.offset)
    }
  }

  function _getContainerAddress (doc, containerPath, coor) {
    let containerId = containerPath[0];
    let nodeId = coor.path[0];
    let node = doc.get(nodeId);
    let xpath = node.getXpath();
    let address = [];
    while (xpath) {
      if (xpath.id === containerId) return address
      address.unshift(xpath.pos || 0);
      xpath = xpath.prev;
    }
  }

  function isCoordinateBefore (doc, containerPath, coor1, coor2, strict) {
    let cmp = compareCoordinates(doc, containerPath, coor1, coor2);
    if (strict) {
      return cmp < 0
    } else {
      return cmp <= 0
    }
  }

  class ContainerSelection extends Selection {
    constructor (containerPath, startPath, startOffset, endPath, endOffset, reverse, surfaceId) {
      super();

      if (arguments.length === 1) {
        let data = arguments[0];
        containerPath = data.containerPath;
        startPath = data.startPath;
        startOffset = data.startOffset;
        endPath = data.endPath;
        endOffset = data.endOffset;
        reverse = data.reverse;
        surfaceId = data.surfaceId;
      }

      
      this.containerPath = containerPath;
      if (!this.containerPath) throw new Error('Invalid arguments: `containerPath` is mandatory')

      this.start = new Coordinate(startPath, startOffset);
      this.end = new Coordinate(isNil(endPath) ? startPath : endPath, isNil(endOffset) ? startOffset : endOffset);

      this.reverse = Boolean(reverse);

      this.surfaceId = surfaceId;
    }

    

    get startPath () {
      console.warn('DEPRECATED: use sel.start.path instead.');
      return this.start.path
    }

    get startOffset () {
      console.warn('DEPRECATED: use sel.start.offset instead.');
      return this.start.offset
    }

    get endPath () {
      console.warn('DEPRECATED: use sel.end.path instead.');
      return this.end.path
    }

    get endOffset () {
      console.warn('DEPRECATED: use sel.end.offset instead.');
      return this.end.offset
    }

    

    toJSON () {
      return {
        type: 'container',
        containerPath: this.containerPath,
        startPath: this.start.path,
        startOffset: this.start.offset,
        endPath: this.end.path,
        endOffset: this.end.offset,
        reverse: this.reverse,
        surfaceId: this.surfaceId
      }
    }

    isContainerSelection () {
      return true
    }

    getType () {
      return 'container'
    }

    isNull () {
      return false
    }

    isCollapsed () {
      return this.start.equals(this.end)
    }

    isReverse () {
      return this.reverse
    }

    equals (other) {
      return (
        Selection.prototype.equals.call(this, other) &&
        isArrayEqual(this.containerPath, other.containerPath) &&
        (this.start.equals(other.start) && this.end.equals(other.end))
      )
    }

    toString () {
      
      return [
        'ContainerSelection(',
        this.containerPath, ', ',
        JSON.stringify(this.start.path), ', ', this.start.offset,
        ' -> ',
        JSON.stringify(this.end.path), ', ', this.end.offset,
        (this.reverse ? ', reverse' : ''),
        (this.surfaceId ? (', ' + this.surfaceId) : ''),
        ')'
      ].join('')
    }

    isInsideOf (other, strict) {
      
      
      if (other.isNull()) return false
      return (
        this._isCoordinateBefore(other.start, this.start, strict) &&
        this._isCoordinateBefore(this.end, other.end, strict)
      )
    }

    contains (other, strict) {
      
      
      if (other.isNull()) return false
      return (
        this._isCoordinateBefore(this.start, other.start, strict) &&
        this._isCoordinateBefore(other.end, this.end, strict)
      )
    }

    containsNode (nodeId) {
      let containerPath = this.containerPath;
      let doc = this.getDocument();
      let nodeCoor = new Coordinate([nodeId], 0);
      let cmpStart = compareCoordinates(doc, containerPath, nodeCoor, this.start);
      let cmpEnd = compareCoordinates(doc, containerPath, nodeCoor, this.end);
      
      
      
      return cmpStart >= 0 && cmpEnd < 0
    }

    overlaps (other) {
      
      return (
        !this._isCoordinateBefore(this.end, other.start, false) ||
        this._isCoordinateBefore(other.end, this.start, false)
      )
    }

    isLeftAlignedWith (other) {
      return this.start.isEqual(other.start)
    }

    isRightAlignedWith (other) {
      return this.end.isEqual(other.end)
    }

    
    collapse (direction) {
      let coor;
      if (direction === 'left') {
        coor = this.start;
      } else {
        coor = this.end;
      }
      return _createNewSelection(this, coor, coor)
    }

    expand (other) {
      let start;
      let end;

      if (this.start.isEqual(other.start)) {
        start = new Coordinate(this.start.path, Math.min(this.start.offset, other.start.offset));
      } else if (this._isCoordinateBefore(other.start, this.start, false)) {
        start = new Coordinate(other.start.path, other.start.offset);
      } else {
        start = this.start;
      }
      if (this.end.isEqual(other.end)) {
        end = new Coordinate(this.end.path, Math.max(this.end.offset, other.end.offset));
      } else if (this._isCoordinateBefore(this.end, other.end, false)) {
        end = new Coordinate(other.end.path, other.end.offset);
      } else {
        end = this.end;
      }

      return _createNewSelection(this, start, end)
    }

    truncateWith (other) {
      if (other.isInsideOf(this, 'strict')) {
        
        throw new Error('Can not truncate with a contained selections')
      }
      if (!this.overlaps(other)) {
        return this
      }
      let start, end;
      if (this._isCoordinateBefore(other.start, this.start, 'strict') && this._isCoordinateBefore(other.end, this.end, 'strict')) {
        start = other.end;
        end = this.end;
      } else if (this._isCoordinateBefore(this.start, other.start, 'strict') && this._isCoordinateBefore(this.end, other.end, 'strict')) {
        start = this.start;
        end = other.start;
      } else if (this.start.isEqual(other.start)) {
        if (this._isCoordinateBefore(other.end, this.end, 'strict')) {
          start = other.end;
          end = this.end;
        } else {
          
          return Selection.nullSelection
        }
      } else if (this.end.isEqual(other.end)) {
        if (this._isCoordinateBefore(this.start, other.start, 'strict')) {
          start = this.start;
          end = other.start;
        } else {
          
          return Selection.nullSelection
        }
      } else if (this.isInsideOf(other)) {
        return Selection.nullSelection
      } else {
        throw new Error('Could not determine coordinates for truncate. Check input')
      }
      return _createNewSelection(this, start, end)
    }

    
    splitIntoPropertySelections () {
      let fragments = this.getFragments();
      return fragments.filter(f => f instanceof Selection.Fragment).map(f => {
        return new PropertySelection(f.path, f.startOffset,
          f.endOffset, false, this.containerPath, this.surfaceId)
      })
    }

    
    _getContainerContent () {
      return this.getDocument().get(this.containerPath)
    }

    _clone () {
      return new ContainerSelection(this)
    }

    _isCoordinateBefore (coor1, coor2, strict) {
      let doc = this.getDocument();
      return isCoordinateBefore(doc, this.containerPath, coor1, coor2, strict)
    }

    get path () {
      throw new Error('ContainerSelection has no path property. Use startPath and endPath instead')
    }

    get _isContainerSelection () { return true }

    static fromJSON (properties) {
      let sel = new ContainerSelection(properties);
      return sel
    }
  }

  function _createNewSelection (containerSel, start, end) {
    let newSel;

    if (start === end) {
      newSel = new PropertySelection({
        path: start.path,
        startOffset: start.offset,
        endOffset: start.offset,
        containerPath: containerSel.containerPath,
        surfaceId: containerSel.surfaceId
      });
    } else {
      newSel = new ContainerSelection(
        containerSel.containerPath,
        start.path, start.offset, end.path, end.offset,
        false, containerSel.surfaceId
      );
    }
    
    const doc = containerSel._internal.doc;
    if (doc) {
      newSel.attach(doc);
    }
    return newSel
  }

  class NodeSelection extends Selection {
    constructor (containerPath, nodeId, mode, reverse, surfaceId) {
      super();

      if (arguments.length === 1) {
        let data = arguments[0];
        containerPath = data.containerPath;
        nodeId = data.nodeId;
        mode = data.mode;
        reverse = data.reverse;
        surfaceId = data.surfaceId;
      }

      if (!isArray(containerPath)) {
        throw new Error("'containerPath' is mandatory.")
      }
      if (!isString(nodeId)) {
        throw new Error("'nodeId' is mandatory.")
      }
      mode = mode || 'full';

      this.containerPath = containerPath;
      this.nodeId = nodeId;
      this.mode = mode;
      this.reverse = Boolean(reverse);
      this.surfaceId = surfaceId;

      this.start = new Coordinate([nodeId], 0);
      this.end = new Coordinate([nodeId], 1);
    }

    equals (other) {
      return (
        super.equals(other) &&
        this.nodeId === other.nodeId &&
        this.mode === other.mode
      )
    }

    isNodeSelection () {
      return true
    }

    getType () {
      return 'node'
    }

    getNodeId () {
      return this.nodeId
    }

    isFull () {
      return this.mode === 'full'
    }

    isBefore () {
      return this.mode === 'before'
    }

    isAfter () {
      return this.mode === 'after'
    }

    isCollapsed () {
      return this.mode !== 'full'
    }

    toJSON () {
      return {
        type: 'node',
        nodeId: this.nodeId,
        mode: this.mode,
        reverse: this.reverse,
        containerPath: this.containerPath,
        surfaceId: this.surfaceId
      }
    }

    toString () {
      
      return [
        'NodeSelection(',
        this.containerPath, '.', this.nodeId, ', ',
        this.mode, ', ',
        (this.reverse ? ', reverse' : ''),
        (this.surfaceId ? (', ' + this.surfaceId) : ''),
        ')'
      ].join('')
    }

    collapse (direction) {
      if (direction === 'left') {
        if (this.isBefore()) {
          return this
        } else {
          return new NodeSelection(this.containerPath, this.nodeId, 'before', this.reverse, this.surfaceId)
        }
      } else if (direction === 'right') {
        if (this.isAfter()) {
          return this
        } else {
          return new NodeSelection(this.containerPath, this.nodeId, 'after', this.reverse, this.surfaceId)
        }
      } else {
        throw new Error("'direction' must be either 'left' or 'right'")
      }
    }

    _getCoordinate () {
      if (this.mode === 'before') {
        return new Coordinate([this.nodeId], 0)
      } else if (this.mode === 'after') {
        return new Coordinate([this.nodeId], 1)
      }
    }

    _clone () {
      return new NodeSelection(this)
    }

    static fromJSON (data) {
      return new NodeSelection(data)
    }

    get _isNodeSelection () { return true }
  }

  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;


  var root = freeGlobal || freeSelf || Function('return this')();

  var Symbol$1 = root.Symbol;

  function arrayMap(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length,
        result = Array(length);

    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }

  var isArray$1 = Array.isArray;

  var objectProto = Object.prototype;


  var hasOwnProperty = objectProto.hasOwnProperty;


  var nativeObjectToString = objectProto.toString;


  var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;


  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  var objectProto$1 = Object.prototype;


  var nativeObjectToString$1 = objectProto$1.toString;


  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';


  var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;


  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag$1 && symToStringTag$1 in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  var symbolTag = '[object Symbol]';


  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  var INFINITY = 1 / 0;


  var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;


  function baseToString(value) {
    
    if (typeof value == 'string') {
      return value;
    }
    if (isArray$1(value)) {
      
      return arrayMap(value, baseToString) + '';
    }
    if (isSymbol(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  function toString(value) {
    return value == null ? '' : baseToString(value);
  }

  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  function castSlice(array, start, end) {
    var length = array.length;
    end = end === undefined ? length : end;
    return (!start && end >= length) ? array : baseSlice(array, start, end);
  }

  var rsAstralRange = '\\ud800-\\udfff',
      rsComboMarksRange = '\\u0300-\\u036f',
      reComboHalfMarksRange = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange = '\\u20d0-\\u20ff',
      rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
      rsVarRange = '\\ufe0e\\ufe0f';


  var rsZWJ = '\\u200d';


  var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');


  function hasUnicode(string) {
    return reHasUnicode.test(string);
  }

  function asciiToArray(string) {
    return string.split('');
  }

  var rsAstralRange$1 = '\\ud800-\\udfff',
      rsComboMarksRange$1 = '\\u0300-\\u036f',
      reComboHalfMarksRange$1 = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange$1 = '\\u20d0-\\u20ff',
      rsComboRange$1 = rsComboMarksRange$1 + reComboHalfMarksRange$1 + rsComboSymbolsRange$1,
      rsVarRange$1 = '\\ufe0e\\ufe0f';


  var rsAstral = '[' + rsAstralRange$1 + ']',
      rsCombo = '[' + rsComboRange$1 + ']',
      rsFitz = '\\ud83c[\\udffb-\\udfff]',
      rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
      rsNonAstral = '[^' + rsAstralRange$1 + ']',
      rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsZWJ$1 = '\\u200d';


  var reOptMod = rsModifier + '?',
      rsOptVar = '[' + rsVarRange$1 + ']?',
      rsOptJoin = '(?:' + rsZWJ$1 + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
      rsSeq = rsOptVar + reOptMod + rsOptJoin,
      rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';


  var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');


  function unicodeToArray(string) {
    return string.match(reUnicode) || [];
  }

  function stringToArray(string) {
    return hasUnicode(string)
      ? unicodeToArray(string)
      : asciiToArray(string);
  }

  function createCaseFirst(methodName) {
    return function(string) {
      string = toString(string);

      var strSymbols = hasUnicode(string)
        ? stringToArray(string)
        : undefined;

      var chr = strSymbols
        ? strSymbols[0]
        : string.charAt(0);

      var trailing = strSymbols
        ? castSlice(strSymbols, 1).join('')
        : string.slice(1);

      return chr[methodName]() + trailing;
    };
  }

  var upperFirst = createCaseFirst('toUpperCase');

  function capitalize(string) {
    return upperFirst(toString(string).toLowerCase());
  }

  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array == null ? 0 : array.length;

    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }

  function basePropertyOf(object) {
    return function(key) {
      return object == null ? undefined : object[key];
    };
  }

  var deburredLetters = {
    
    '\xc0': 'A',  '\xc1': 'A', '\xc2': 'A', '\xc3': 'A', '\xc4': 'A', '\xc5': 'A',
    '\xe0': 'a',  '\xe1': 'a', '\xe2': 'a', '\xe3': 'a', '\xe4': 'a', '\xe5': 'a',
    '\xc7': 'C',  '\xe7': 'c',
    '\xd0': 'D',  '\xf0': 'd',
    '\xc8': 'E',  '\xc9': 'E', '\xca': 'E', '\xcb': 'E',
    '\xe8': 'e',  '\xe9': 'e', '\xea': 'e', '\xeb': 'e',
    '\xcc': 'I',  '\xcd': 'I', '\xce': 'I', '\xcf': 'I',
    '\xec': 'i',  '\xed': 'i', '\xee': 'i', '\xef': 'i',
    '\xd1': 'N',  '\xf1': 'n',
    '\xd2': 'O',  '\xd3': 'O', '\xd4': 'O', '\xd5': 'O', '\xd6': 'O', '\xd8': 'O',
    '\xf2': 'o',  '\xf3': 'o', '\xf4': 'o', '\xf5': 'o', '\xf6': 'o', '\xf8': 'o',
    '\xd9': 'U',  '\xda': 'U', '\xdb': 'U', '\xdc': 'U',
    '\xf9': 'u',  '\xfa': 'u', '\xfb': 'u', '\xfc': 'u',
    '\xdd': 'Y',  '\xfd': 'y', '\xff': 'y',
    '\xc6': 'Ae', '\xe6': 'ae',
    '\xde': 'Th', '\xfe': 'th',
    '\xdf': 'ss',
    
    '\u0100': 'A',  '\u0102': 'A', '\u0104': 'A',
    '\u0101': 'a',  '\u0103': 'a', '\u0105': 'a',
    '\u0106': 'C',  '\u0108': 'C', '\u010a': 'C', '\u010c': 'C',
    '\u0107': 'c',  '\u0109': 'c', '\u010b': 'c', '\u010d': 'c',
    '\u010e': 'D',  '\u0110': 'D', '\u010f': 'd', '\u0111': 'd',
    '\u0112': 'E',  '\u0114': 'E', '\u0116': 'E', '\u0118': 'E', '\u011a': 'E',
    '\u0113': 'e',  '\u0115': 'e', '\u0117': 'e', '\u0119': 'e', '\u011b': 'e',
    '\u011c': 'G',  '\u011e': 'G', '\u0120': 'G', '\u0122': 'G',
    '\u011d': 'g',  '\u011f': 'g', '\u0121': 'g', '\u0123': 'g',
    '\u0124': 'H',  '\u0126': 'H', '\u0125': 'h', '\u0127': 'h',
    '\u0128': 'I',  '\u012a': 'I', '\u012c': 'I', '\u012e': 'I', '\u0130': 'I',
    '\u0129': 'i',  '\u012b': 'i', '\u012d': 'i', '\u012f': 'i', '\u0131': 'i',
    '\u0134': 'J',  '\u0135': 'j',
    '\u0136': 'K',  '\u0137': 'k', '\u0138': 'k',
    '\u0139': 'L',  '\u013b': 'L', '\u013d': 'L', '\u013f': 'L', '\u0141': 'L',
    '\u013a': 'l',  '\u013c': 'l', '\u013e': 'l', '\u0140': 'l', '\u0142': 'l',
    '\u0143': 'N',  '\u0145': 'N', '\u0147': 'N', '\u014a': 'N',
    '\u0144': 'n',  '\u0146': 'n', '\u0148': 'n', '\u014b': 'n',
    '\u014c': 'O',  '\u014e': 'O', '\u0150': 'O',
    '\u014d': 'o',  '\u014f': 'o', '\u0151': 'o',
    '\u0154': 'R',  '\u0156': 'R', '\u0158': 'R',
    '\u0155': 'r',  '\u0157': 'r', '\u0159': 'r',
    '\u015a': 'S',  '\u015c': 'S', '\u015e': 'S', '\u0160': 'S',
    '\u015b': 's',  '\u015d': 's', '\u015f': 's', '\u0161': 's',
    '\u0162': 'T',  '\u0164': 'T', '\u0166': 'T',
    '\u0163': 't',  '\u0165': 't', '\u0167': 't',
    '\u0168': 'U',  '\u016a': 'U', '\u016c': 'U', '\u016e': 'U', '\u0170': 'U', '\u0172': 'U',
    '\u0169': 'u',  '\u016b': 'u', '\u016d': 'u', '\u016f': 'u', '\u0171': 'u', '\u0173': 'u',
    '\u0174': 'W',  '\u0175': 'w',
    '\u0176': 'Y',  '\u0177': 'y', '\u0178': 'Y',
    '\u0179': 'Z',  '\u017b': 'Z', '\u017d': 'Z',
    '\u017a': 'z',  '\u017c': 'z', '\u017e': 'z',
    '\u0132': 'IJ', '\u0133': 'ij',
    '\u0152': 'Oe', '\u0153': 'oe',
    '\u0149': "'n", '\u017f': 's'
  };


  var deburrLetter = basePropertyOf(deburredLetters);

  var reLatin = /[\xc0-\xd6\xd8-\xf6\xf8-\xff\u0100-\u017f]/g;


  var rsComboMarksRange$2 = '\\u0300-\\u036f',
      reComboHalfMarksRange$2 = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange$2 = '\\u20d0-\\u20ff',
      rsComboRange$2 = rsComboMarksRange$2 + reComboHalfMarksRange$2 + rsComboSymbolsRange$2;


  var rsCombo$1 = '[' + rsComboRange$2 + ']';


  var reComboMark = RegExp(rsCombo$1, 'g');


  function deburr(string) {
    string = toString(string);
    return string && string.replace(reLatin, deburrLetter).replace(reComboMark, '');
  }

  var reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g;


  function asciiWords(string) {
    return string.match(reAsciiWord) || [];
  }

  var reHasUnicodeWord = /[a-z][A-Z]|[A-Z]{2}[a-z]|[0-9][a-zA-Z]|[a-zA-Z][0-9]|[^a-zA-Z0-9 ]/;


  function hasUnicodeWord(string) {
    return reHasUnicodeWord.test(string);
  }

  var rsAstralRange$2 = '\\ud800-\\udfff',
      rsComboMarksRange$3 = '\\u0300-\\u036f',
      reComboHalfMarksRange$3 = '\\ufe20-\\ufe2f',
      rsComboSymbolsRange$3 = '\\u20d0-\\u20ff',
      rsComboRange$3 = rsComboMarksRange$3 + reComboHalfMarksRange$3 + rsComboSymbolsRange$3,
      rsDingbatRange = '\\u2700-\\u27bf',
      rsLowerRange = 'a-z\\xdf-\\xf6\\xf8-\\xff',
      rsMathOpRange = '\\xac\\xb1\\xd7\\xf7',
      rsNonCharRange = '\\x00-\\x2f\\x3a-\\x40\\x5b-\\x60\\x7b-\\xbf',
      rsPunctuationRange = '\\u2000-\\u206f',
      rsSpaceRange = ' \\t\\x0b\\f\\xa0\\ufeff\\n\\r\\u2028\\u2029\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u202f\\u205f\\u3000',
      rsUpperRange = 'A-Z\\xc0-\\xd6\\xd8-\\xde',
      rsVarRange$2 = '\\ufe0e\\ufe0f',
      rsBreakRange = rsMathOpRange + rsNonCharRange + rsPunctuationRange + rsSpaceRange;


  var rsApos = "['\u2019]",
      rsBreak = '[' + rsBreakRange + ']',
      rsCombo$2 = '[' + rsComboRange$3 + ']',
      rsDigits = '\\d+',
      rsDingbat = '[' + rsDingbatRange + ']',
      rsLower = '[' + rsLowerRange + ']',
      rsMisc = '[^' + rsAstralRange$2 + rsBreakRange + rsDigits + rsDingbatRange + rsLowerRange + rsUpperRange + ']',
      rsFitz$1 = '\\ud83c[\\udffb-\\udfff]',
      rsModifier$1 = '(?:' + rsCombo$2 + '|' + rsFitz$1 + ')',
      rsNonAstral$1 = '[^' + rsAstralRange$2 + ']',
      rsRegional$1 = '(?:\\ud83c[\\udde6-\\uddff]){2}',
      rsSurrPair$1 = '[\\ud800-\\udbff][\\udc00-\\udfff]',
      rsUpper = '[' + rsUpperRange + ']',
      rsZWJ$2 = '\\u200d';


  var rsMiscLower = '(?:' + rsLower + '|' + rsMisc + ')',
      rsMiscUpper = '(?:' + rsUpper + '|' + rsMisc + ')',
      rsOptContrLower = '(?:' + rsApos + '(?:d|ll|m|re|s|t|ve))?',
      rsOptContrUpper = '(?:' + rsApos + '(?:D|LL|M|RE|S|T|VE))?',
      reOptMod$1 = rsModifier$1 + '?',
      rsOptVar$1 = '[' + rsVarRange$2 + ']?',
      rsOptJoin$1 = '(?:' + rsZWJ$2 + '(?:' + [rsNonAstral$1, rsRegional$1, rsSurrPair$1].join('|') + ')' + rsOptVar$1 + reOptMod$1 + ')*',
      rsOrdLower = '\\d*(?:1st|2nd|3rd|(?![123])\\dth)(?=\\b|[A-Z_])',
      rsOrdUpper = '\\d*(?:1ST|2ND|3RD|(?![123])\\dTH)(?=\\b|[a-z_])',
      rsSeq$1 = rsOptVar$1 + reOptMod$1 + rsOptJoin$1,
      rsEmoji = '(?:' + [rsDingbat, rsRegional$1, rsSurrPair$1].join('|') + ')' + rsSeq$1;


  var reUnicodeWord = RegExp([
    rsUpper + '?' + rsLower + '+' + rsOptContrLower + '(?=' + [rsBreak, rsUpper, '$'].join('|') + ')',
    rsMiscUpper + '+' + rsOptContrUpper + '(?=' + [rsBreak, rsUpper + rsMiscLower, '$'].join('|') + ')',
    rsUpper + '?' + rsMiscLower + '+' + rsOptContrLower,
    rsUpper + '+' + rsOptContrUpper,
    rsOrdUpper,
    rsOrdLower,
    rsDigits,
    rsEmoji
  ].join('|'), 'g');


  function unicodeWords(string) {
    return string.match(reUnicodeWord) || [];
  }

  function words(string, pattern, guard) {
    string = toString(string);
    pattern = guard ? undefined : pattern;

    if (pattern === undefined) {
      return hasUnicodeWord(string) ? unicodeWords(string) : asciiWords(string);
    }
    return string.match(pattern) || [];
  }

  var rsApos$1 = "['\u2019]";


  var reApos = RegExp(rsApos$1, 'g');


  function createCompounder(callback) {
    return function(string) {
      return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
    };
  }

  var camelCase = createCompounder(function(result, word, index) {
    word = word.toLowerCase();
    return result + (index ? capitalize(word) : word);
  });

  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var arrayProto = Array.prototype;


  var splice = arrayProto.splice;


  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }

  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }


  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;

  function stackClear() {
    this.__data__ = new ListCache;
    this.size = 0;
  }

  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  function stackGet(key) {
    return this.__data__.get(key);
  }

  function stackHas(key) {
    return this.__data__.has(key);
  }

  function isObject$1(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';


  function isFunction$1(value) {
    if (!isObject$1(value)) {
      return false;
    }
    
    
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  var coreJsData = root['__core-js_shared__'];

  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());


  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  var funcProto = Function.prototype;


  var funcToString = funcProto.toString;


  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;


  var reIsHostCtor = /^\[object .+?Constructor\]$/;


  var funcProto$1 = Function.prototype,
      objectProto$2 = Object.prototype;


  var funcToString$1 = funcProto$1.toString;


  var hasOwnProperty$1 = objectProto$2.hasOwnProperty;


  var reIsNative = RegExp('^' +
    funcToString$1.call(hasOwnProperty$1).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );


  function baseIsNative(value) {
    if (!isObject$1(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction$1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }

  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }

  var Map$1 = getNative(root, 'Map');

  var nativeCreate = getNative(Object, 'create');

  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }

  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var HASH_UNDEFINED = '__lodash_hash_undefined__';


  var objectProto$3 = Object.prototype;


  var hasOwnProperty$2 = objectProto$3.hasOwnProperty;


  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty$2.call(data, key) ? data[key] : undefined;
  }

  var objectProto$4 = Object.prototype;


  var hasOwnProperty$3 = objectProto$4.hasOwnProperty;


  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? (data[key] !== undefined) : hasOwnProperty$3.call(data, key);
  }

  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';


  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
    return this;
  }

  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }


  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;

  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map$1 || ListCache),
      'string': new Hash
    };
  }

  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }

  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }

  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }


  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;

  var LARGE_ARRAY_SIZE = 200;


  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map$1 || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }


  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;

  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }

  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  var objectProto$5 = Object.prototype;


  var hasOwnProperty$4 = objectProto$5.hasOwnProperty;


  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$4.call(object, key) && eq(objValue, value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }

  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }

  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  var argsTag = '[object Arguments]';


  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }

  var objectProto$6 = Object.prototype;


  var hasOwnProperty$5 = objectProto$6.hasOwnProperty;


  var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;


  var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty$5.call(value, 'callee') &&
      !propertyIsEnumerable.call(value, 'callee');
  };

  function stubFalse() {
    return false;
  }

  var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;


  var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;


  var moduleExports = freeModule && freeModule.exports === freeExports;


  var Buffer = moduleExports ? root.Buffer : undefined;


  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;


  var isBuffer = nativeIsBuffer || stubFalse;

  var MAX_SAFE_INTEGER = 9007199254740991;


  var reIsUint = /^(?:0|[1-9]\d*)$/;


  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  var MAX_SAFE_INTEGER$1 = 9007199254740991;


  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$1;
  }

  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';


  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;


  function baseIsTypedArray(value) {
    return isObjectLike(value) &&
      isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }

  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  var freeExports$1 = typeof exports == 'object' && exports && !exports.nodeType && exports;


  var freeModule$1 = freeExports$1 && typeof module == 'object' && module && !module.nodeType && module;


  var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;


  var freeProcess = moduleExports$1 && freeGlobal.process;


  var nodeUtil = (function() {
    try {
      
      var types = freeModule$1 && freeModule$1.require && freeModule$1.require('util').types;

      if (types) {
        return types;
      }

      
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;


  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

  var objectProto$7 = Object.prototype;


  var hasOwnProperty$6 = objectProto$7.hasOwnProperty;


  function arrayLikeKeys(value, inherited) {
    var isArr = isArray$1(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$6.call(value, key)) &&
          !(skipIndexes && (
             
             key == 'length' ||
             
             (isBuff && (key == 'offset' || key == 'parent')) ||
             
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             
             isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  var objectProto$8 = Object.prototype;


  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$8;

    return value === proto;
  }

  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  var nativeKeys = overArg(Object.keys, Object);

  var objectProto$9 = Object.prototype;


  var hasOwnProperty$7 = objectProto$9.hasOwnProperty;


  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$7.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction$1(value);
  }

  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }

  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }

  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  var objectProto$10 = Object.prototype;


  var hasOwnProperty$8 = objectProto$10.hasOwnProperty;


  function baseKeysIn(object) {
    if (!isObject$1(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$8.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  function keysIn$1(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }

  function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn$1(source), object);
  }

  var freeExports$2 = typeof exports == 'object' && exports && !exports.nodeType && exports;


  var freeModule$2 = freeExports$2 && typeof module == 'object' && module && !module.nodeType && module;


  var moduleExports$2 = freeModule$2 && freeModule$2.exports === freeExports$2;


  var Buffer$1 = moduleExports$2 ? root.Buffer : undefined,
      allocUnsafe = Buffer$1 ? Buffer$1.allocUnsafe : undefined;


  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length,
        result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

    buffer.copy(result);
    return result;
  }

  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];

    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }

  function stubArray() {
    return [];
  }

  var objectProto$11 = Object.prototype;


  var propertyIsEnumerable$1 = objectProto$11.propertyIsEnumerable;


  var nativeGetSymbols = Object.getOwnPropertySymbols;


  var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable$1.call(object, symbol);
    });
  };

  function copySymbols(source, object) {
    return copyObject(source, getSymbols(source), object);
  }

  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;

    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }

  var getPrototype = overArg(Object.getPrototypeOf, Object);

  var nativeGetSymbols$1 = Object.getOwnPropertySymbols;


  var getSymbolsIn = !nativeGetSymbols$1 ? stubArray : function(object) {
    var result = [];
    while (object) {
      arrayPush(result, getSymbols(object));
      object = getPrototype(object);
    }
    return result;
  };

  function copySymbolsIn(source, object) {
    return copyObject(source, getSymbolsIn(source), object);
  }

  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray$1(object) ? result : arrayPush(result, symbolsFunc(object));
  }

  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }

  function getAllKeysIn(object) {
    return baseGetAllKeys(object, keysIn$1, getSymbolsIn);
  }

  var DataView = getNative(root, 'DataView');

  var Promise$1 = getNative(root, 'Promise');

  var Set$1 = getNative(root, 'Set');

  var WeakMap = getNative(root, 'WeakMap');

  var mapTag$1 = '[object Map]',
      objectTag$1 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$1 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';

  var dataViewTag$1 = '[object DataView]';


  var dataViewCtorString = toSource(DataView),
      mapCtorString = toSource(Map$1),
      promiseCtorString = toSource(Promise$1),
      setCtorString = toSource(Set$1),
      weakMapCtorString = toSource(WeakMap);


  var getTag = baseGetTag;


  if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
      (Map$1 && getTag(new Map$1) != mapTag$1) ||
      (Promise$1 && getTag(Promise$1.resolve()) != promiseTag) ||
      (Set$1 && getTag(new Set$1) != setTag$1) ||
      (WeakMap && getTag(new WeakMap) != weakMapTag$1)) {
    getTag = function(value) {
      var result = baseGetTag(value),
          Ctor = result == objectTag$1 ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$1;
          case mapCtorString: return mapTag$1;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$1;
          case weakMapCtorString: return weakMapTag$1;
        }
      }
      return result;
    };
  }

  var getTag$1 = getTag;

  var objectProto$12 = Object.prototype;


  var hasOwnProperty$9 = objectProto$12.hasOwnProperty;


  function initCloneArray(array) {
    var length = array.length,
        result = new array.constructor(length);

    
    if (length && typeof array[0] == 'string' && hasOwnProperty$9.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }

  var Uint8Array = root.Uint8Array;

  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }

  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }

  var reFlags = /\w*$/;


  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }

  var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolValueOf = symbolProto$1 ? symbolProto$1.valueOf : undefined;


  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }

  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      mapTag$2 = '[object Map]',
      numberTag$1 = '[object Number]',
      regexpTag$1 = '[object RegExp]',
      setTag$2 = '[object Set]',
      stringTag$1 = '[object String]',
      symbolTag$1 = '[object Symbol]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$2 = '[object DataView]',
      float32Tag$1 = '[object Float32Array]',
      float64Tag$1 = '[object Float64Array]',
      int8Tag$1 = '[object Int8Array]',
      int16Tag$1 = '[object Int16Array]',
      int32Tag$1 = '[object Int32Array]',
      uint8Tag$1 = '[object Uint8Array]',
      uint8ClampedTag$1 = '[object Uint8ClampedArray]',
      uint16Tag$1 = '[object Uint16Array]',
      uint32Tag$1 = '[object Uint32Array]';


  function initCloneByTag(object, tag, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag$1:
        return cloneArrayBuffer(object);

      case boolTag$1:
      case dateTag$1:
        return new Ctor(+object);

      case dataViewTag$2:
        return cloneDataView(object, isDeep);

      case float32Tag$1: case float64Tag$1:
      case int8Tag$1: case int16Tag$1: case int32Tag$1:
      case uint8Tag$1: case uint8ClampedTag$1: case uint16Tag$1: case uint32Tag$1:
        return cloneTypedArray(object, isDeep);

      case mapTag$2:
        return new Ctor;

      case numberTag$1:
      case stringTag$1:
        return new Ctor(object);

      case regexpTag$1:
        return cloneRegExp(object);

      case setTag$2:
        return new Ctor;

      case symbolTag$1:
        return cloneSymbol(object);
    }
  }

  var objectCreate = Object.create;


  var baseCreate = (function() {
    function object() {}
    return function(proto) {
      if (!isObject$1(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());

  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object))
      ? baseCreate(getPrototype(object))
      : {};
  }

  var mapTag$3 = '[object Map]';


  function baseIsMap(value) {
    return isObjectLike(value) && getTag$1(value) == mapTag$3;
  }

  var nodeIsMap = nodeUtil && nodeUtil.isMap;


  var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;

  var setTag$3 = '[object Set]';


  function baseIsSet(value) {
    return isObjectLike(value) && getTag$1(value) == setTag$3;
  }

  var nodeIsSet = nodeUtil && nodeUtil.isSet;


  var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;

  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;


  var argsTag$2 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$2 = '[object Boolean]',
      dateTag$2 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag$2 = '[object Function]',
      genTag$1 = '[object GeneratorFunction]',
      mapTag$4 = '[object Map]',
      numberTag$2 = '[object Number]',
      objectTag$2 = '[object Object]',
      regexpTag$2 = '[object RegExp]',
      setTag$4 = '[object Set]',
      stringTag$2 = '[object String]',
      symbolTag$2 = '[object Symbol]',
      weakMapTag$2 = '[object WeakMap]';

  var arrayBufferTag$2 = '[object ArrayBuffer]',
      dataViewTag$3 = '[object DataView]',
      float32Tag$2 = '[object Float32Array]',
      float64Tag$2 = '[object Float64Array]',
      int8Tag$2 = '[object Int8Array]',
      int16Tag$2 = '[object Int16Array]',
      int32Tag$2 = '[object Int32Array]',
      uint8Tag$2 = '[object Uint8Array]',
      uint8ClampedTag$2 = '[object Uint8ClampedArray]',
      uint16Tag$2 = '[object Uint16Array]',
      uint32Tag$2 = '[object Uint32Array]';


  var cloneableTags = {};
  cloneableTags[argsTag$2] = cloneableTags[arrayTag$1] =
  cloneableTags[arrayBufferTag$2] = cloneableTags[dataViewTag$3] =
  cloneableTags[boolTag$2] = cloneableTags[dateTag$2] =
  cloneableTags[float32Tag$2] = cloneableTags[float64Tag$2] =
  cloneableTags[int8Tag$2] = cloneableTags[int16Tag$2] =
  cloneableTags[int32Tag$2] = cloneableTags[mapTag$4] =
  cloneableTags[numberTag$2] = cloneableTags[objectTag$2] =
  cloneableTags[regexpTag$2] = cloneableTags[setTag$4] =
  cloneableTags[stringTag$2] = cloneableTags[symbolTag$2] =
  cloneableTags[uint8Tag$2] = cloneableTags[uint8ClampedTag$2] =
  cloneableTags[uint16Tag$2] = cloneableTags[uint32Tag$2] = true;
  cloneableTags[errorTag$1] = cloneableTags[funcTag$2] =
  cloneableTags[weakMapTag$2] = false;


  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG;

    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject$1(value)) {
      return value;
    }
    var isArr = isArray$1(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag$1(value),
          isFunc = tag == funcTag$2 || tag == genTag$1;

      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag$2 || tag == argsTag$2 || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat
            ? copySymbolsIn(value, baseAssignIn(result, value))
            : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, isDeep);
      }
    }
    
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);

    if (isSet(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });

      return result;
    }

    if (isMap(value)) {
      value.forEach(function(subValue, key) {
        result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
      });

      return result;
    }

    var keysFunc = isFull
      ? (isFlat ? getAllKeysIn : getAllKeys)
      : (isFlat ? keysIn : keys);

    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      
      assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }

  var CLONE_SYMBOLS_FLAG$1 = 4;


  function clone(value) {
    return baseClone(value, CLONE_SYMBOLS_FLAG$1);
  }

  var CLONE_DEEP_FLAG$1 = 1,
      CLONE_SYMBOLS_FLAG$2 = 4;


  function cloneDeepWith(value, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    return baseClone(value, CLONE_DEEP_FLAG$1 | CLONE_SYMBOLS_FLAG$2, customizer);
  }

  var now = function() {
    return root.Date.now();
  };

  var NAN = 0 / 0;


  var reTrim = /^\s+|\s+$/g;


  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;


  var reIsBinary = /^0b[01]+$/i;


  var reIsOctal = /^0o[0-7]+$/i;


  var freeParseInt = parseInt;


  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject$1(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject$1(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var FUNC_ERROR_TEXT = 'Expected a function';


  var nativeMax = Math.max,
      nativeMin = Math.min;


  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject$1(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      
      lastInvokeTime = time;
      
      timerId = setTimeout(timerExpired, wait);
      
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          timeWaiting = wait - timeSinceLastCall;

      return maxing
        ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      
      
      
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      
      
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now());
    }

    function debounced() {
      var time = now(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
      reIsPlainProp = /^\w*$/;


  function isKey(value, object) {
    if (isArray$1(value)) {
      return false;
    }
    var type = typeof value;
    if (type == 'number' || type == 'symbol' || type == 'boolean' ||
        value == null || isSymbol(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
      (object != null && value in Object(object));
  }

  var FUNC_ERROR_TEXT$1 = 'Expected a function';


  function memoize(func, resolver) {
    if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
      throw new TypeError(FUNC_ERROR_TEXT$1);
    }
    var memoized = function() {
      var args = arguments,
          key = resolver ? resolver.apply(this, args) : args[0],
          cache = memoized.cache;

      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache);
    return memoized;
  }


  memoize.Cache = MapCache;

  var MAX_MEMOIZE_SIZE = 500;


  function memoizeCapped(func) {
    var result = memoize(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });

    var cache = result.cache;
    return result;
  }

  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;


  var reEscapeChar = /\\(\\)?/g;


  var stringToPath = memoizeCapped(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46 ) {
      result.push('');
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
    });
    return result;
  });

  function castPath(value, object) {
    if (isArray$1(value)) {
      return value;
    }
    return isKey(value, object) ? [value] : stringToPath(toString(value));
  }

  var INFINITY$1 = 1 / 0;


  function toKey(value) {
    if (typeof value == 'string' || isSymbol(value)) {
      return value;
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY$1) ? '-0' : result;
  }

  function baseGet(object, path) {
    path = castPath(path, object);

    var index = 0,
        length = path.length;

    while (object != null && index < length) {
      object = object[toKey(path[index++])];
    }
    return (index && index == length) ? object : undefined;
  }

  function get(object, path, defaultValue) {
    var result = object == null ? undefined : baseGet(object, path);
    return result === undefined ? defaultValue : result;
  }

  var HASH_UNDEFINED$2 = '__lodash_hash_undefined__';


  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED$2);
    return this;
  }

  function setCacheHas(value) {
    return this.__data__.has(value);
  }

  function SetCache(values) {
    var index = -1,
        length = values == null ? 0 : values.length;

    this.__data__ = new MapCache;
    while (++index < length) {
      this.add(values[index]);
    }
  }


  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;

  function arraySome(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }

  function cacheHas(cache, key) {
    return cache.has(key);
  }

  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;


  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
        arrLength = array.length,
        othLength = other.length;

    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    
    var stacked = stack.get(array);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var index = -1,
        result = true,
        seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

    stack.set(array, other);
    stack.set(other, array);

    
    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, arrValue, index, other, array, stack)
          : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== undefined) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      
      if (seen) {
        if (!arraySome(other, function(othValue, othIndex) {
              if (!cacheHas(seen, othIndex) &&
                  (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                return seen.push(othIndex);
              }
            })) {
          result = false;
          break;
        }
      } else if (!(
            arrValue === othValue ||
              equalFunc(arrValue, othValue, bitmask, customizer, stack)
          )) {
        result = false;
        break;
      }
    }
    stack['delete'](array);
    stack['delete'](other);
    return result;
  }

  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }

  var COMPARE_PARTIAL_FLAG$1 = 1,
      COMPARE_UNORDERED_FLAG$1 = 2;


  var boolTag$3 = '[object Boolean]',
      dateTag$3 = '[object Date]',
      errorTag$2 = '[object Error]',
      mapTag$5 = '[object Map]',
      numberTag$3 = '[object Number]',
      regexpTag$3 = '[object RegExp]',
      setTag$5 = '[object Set]',
      stringTag$3 = '[object String]',
      symbolTag$3 = '[object Symbol]';

  var arrayBufferTag$3 = '[object ArrayBuffer]',
      dataViewTag$4 = '[object DataView]';


  var symbolProto$2 = Symbol$1 ? Symbol$1.prototype : undefined,
      symbolValueOf$1 = symbolProto$2 ? symbolProto$2.valueOf : undefined;


  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag$4:
        if ((object.byteLength != other.byteLength) ||
            (object.byteOffset != other.byteOffset)) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;

      case arrayBufferTag$3:
        if ((object.byteLength != other.byteLength) ||
            !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
          return false;
        }
        return true;

      case boolTag$3:
      case dateTag$3:
      case numberTag$3:
        
        
        return eq(+object, +other);

      case errorTag$2:
        return object.name == other.name && object.message == other.message;

      case regexpTag$3:
      case stringTag$3:
        
        
        
        return object == (other + '');

      case mapTag$5:
        var convert = mapToArray;

      case setTag$5:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1;
        convert || (convert = setToArray);

        if (object.size != other.size && !isPartial) {
          return false;
        }
        
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG$1;

        
        stack.set(object, other);
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack['delete'](object);
        return result;

      case symbolTag$3:
        if (symbolValueOf$1) {
          return symbolValueOf$1.call(object) == symbolValueOf$1.call(other);
        }
    }
    return false;
  }

  var COMPARE_PARTIAL_FLAG$2 = 1;


  var objectProto$13 = Object.prototype;


  var hasOwnProperty$10 = objectProto$13.hasOwnProperty;


  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2,
        objProps = getAllKeys(object),
        objLength = objProps.length,
        othProps = getAllKeys(other),
        othLength = othProps.length;

    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty$10.call(other, key))) {
        return false;
      }
    }
    
    var stacked = stack.get(object);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);

    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key];

      if (customizer) {
        var compared = isPartial
          ? customizer(othValue, objValue, key, other, object, stack)
          : customizer(objValue, othValue, key, object, other, stack);
      }
      
      if (!(compared === undefined
            ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
            : compared
          )) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;

      
      if (objCtor != othCtor &&
          ('constructor' in object && 'constructor' in other) &&
          !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
            typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack['delete'](object);
    stack['delete'](other);
    return result;
  }

  var COMPARE_PARTIAL_FLAG$3 = 1;


  var argsTag$3 = '[object Arguments]',
      arrayTag$2 = '[object Array]',
      objectTag$3 = '[object Object]';


  var objectProto$14 = Object.prototype;


  var hasOwnProperty$11 = objectProto$14.hasOwnProperty;


  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray$1(object),
        othIsArr = isArray$1(other),
        objTag = objIsArr ? arrayTag$2 : getTag$1(object),
        othTag = othIsArr ? arrayTag$2 : getTag$1(other);

    objTag = objTag == argsTag$3 ? objectTag$3 : objTag;
    othTag = othTag == argsTag$3 ? objectTag$3 : othTag;

    var objIsObj = objTag == objectTag$3,
        othIsObj = othTag == objectTag$3,
        isSameTag = objTag == othTag;

    if (isSameTag && isBuffer(object)) {
      if (!isBuffer(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack);
      return (objIsArr || isTypedArray(object))
        ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
        : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG$3)) {
      var objIsWrapped = objIsObj && hasOwnProperty$11.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty$11.call(other, '__wrapped__');

      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;

        stack || (stack = new Stack);
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack);
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }

  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }

  var COMPARE_PARTIAL_FLAG$4 = 1,
      COMPARE_UNORDERED_FLAG$2 = 2;


  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length,
        length = index,
        noCustomizer = !customizer;

    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if ((noCustomizer && data[2])
            ? data[1] !== object[data[0]]
            : !(data[0] in object)
          ) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0],
          objValue = object[key],
          srcValue = data[1];

      if (noCustomizer && data[2]) {
        if (objValue === undefined && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack;
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === undefined
              ? baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$4 | COMPARE_UNORDERED_FLAG$2, customizer, stack)
              : result
            )) {
          return false;
        }
      }
    }
    return true;
  }

  function isStrictComparable(value) {
    return value === value && !isObject$1(value);
  }

  function getMatchData(object) {
    var result = keys(object),
        length = result.length;

    while (length--) {
      var key = result[length],
          value = object[key];

      result[length] = [key, value, isStrictComparable(value)];
    }
    return result;
  }

  function matchesStrictComparable(key, srcValue) {
    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue &&
        (srcValue !== undefined || (key in Object(object)));
    };
  }

  function baseMatches(source) {
    var matchData = getMatchData(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || baseIsMatch(object, source, matchData);
    };
  }

  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }

  function hasPath(object, path, hasFunc) {
    path = castPath(path, object);

    var index = -1,
        length = path.length,
        result = false;

    while (++index < length) {
      var key = toKey(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength(length) && isIndex(key, length) &&
      (isArray$1(object) || isArguments(object));
  }

  function hasIn(object, path) {
    return object != null && hasPath(object, path, baseHasIn);
  }

  var COMPARE_PARTIAL_FLAG$5 = 1,
      COMPARE_UNORDERED_FLAG$3 = 2;


  function baseMatchesProperty(path, srcValue) {
    if (isKey(path) && isStrictComparable(srcValue)) {
      return matchesStrictComparable(toKey(path), srcValue);
    }
    return function(object) {
      var objValue = get(object, path);
      return (objValue === undefined && objValue === srcValue)
        ? hasIn(object, path)
        : baseIsEqual(srcValue, objValue, COMPARE_PARTIAL_FLAG$5 | COMPARE_UNORDERED_FLAG$3);
    };
  }

  function identity(value) {
    return value;
  }

  function baseProperty(key) {
    return function(object) {
      return object == null ? undefined : object[key];
    };
  }

  function basePropertyDeep(path) {
    return function(object) {
      return baseGet(object, path);
    };
  }

  function property(path) {
    return isKey(path) ? baseProperty(toKey(path)) : basePropertyDeep(path);
  }

  function baseIteratee(value) {
    
    
    if (typeof value == 'function') {
      return value;
    }
    if (value == null) {
      return identity;
    }
    if (typeof value == 'object') {
      return isArray$1(value)
        ? baseMatchesProperty(value[0], value[1])
        : baseMatches(value);
    }
    return property(value);
  }

  function createFind(findIndexFunc) {
    return function(collection, predicate, fromIndex) {
      var iterable = Object(collection);
      if (!isArrayLike(collection)) {
        var iteratee = baseIteratee(predicate, 3);
        collection = keys(collection);
        predicate = function(key) { return iteratee(iterable[key], key, iterable); };
      }
      var index = findIndexFunc(collection, predicate, fromIndex);
      return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
    };
  }

  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length,
        index = fromIndex + (fromRight ? 1 : -1);

    while ((fromRight ? index-- : ++index < length)) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }

  var INFINITY$2 = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308;


  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY$2 || value === -INFINITY$2) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }

  function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;

    return result === result ? (remainder ? result - remainder : result) : 0;
  }

  var nativeMax$1 = Math.max;


  function findIndex$1(array, predicate, fromIndex) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return -1;
    }
    var index = fromIndex == null ? 0 : toInteger(fromIndex);
    if (index < 0) {
      index = nativeMax$1(length + index, 0);
    }
    return baseFindIndex(array, baseIteratee(predicate, 3), index);
  }

  var find = createFind(findIndex$1);

  function isMatch(object, source) {
    return object === source || baseIsMatch(object, source, getMatchData(source));
  }

  function assignMergeValue(object, key, value) {
    if ((value !== undefined && !eq(object[key], value)) ||
        (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }

  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  var baseFor = createBaseFor();

  function isArrayLikeObject(value) {
    return isObjectLike(value) && isArrayLike(value);
  }

  var objectTag$4 = '[object Object]';


  var funcProto$2 = Function.prototype,
      objectProto$15 = Object.prototype;


  var funcToString$2 = funcProto$2.toString;


  var hasOwnProperty$12 = objectProto$15.hasOwnProperty;


  var objectCtorString = funcToString$2.call(Object);


  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag$4) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty$12.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor &&
      funcToString$2.call(Ctor) == objectCtorString;
  }

  function safeGet(object, key) {
    if (key == '__proto__') {
      return;
    }

    return object[key];
  }

  function toPlainObject(value) {
    return copyObject(value, keysIn$1(value));
  }

  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = safeGet(object, key),
        srcValue = safeGet(source, key),
        stacked = stack.get(srcValue);

    if (stacked) {
      assignMergeValue(object, key, stacked);
      return;
    }
    var newValue = customizer
      ? customizer(objValue, srcValue, (key + ''), object, source, stack)
      : undefined;

    var isCommon = newValue === undefined;

    if (isCommon) {
      var isArr = isArray$1(srcValue),
          isBuff = !isArr && isBuffer(srcValue),
          isTyped = !isArr && !isBuff && isTypedArray(srcValue);

      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (isArray$1(objValue)) {
          newValue = objValue;
        }
        else if (isArrayLikeObject(objValue)) {
          newValue = copyArray(objValue);
        }
        else if (isBuff) {
          isCommon = false;
          newValue = cloneBuffer(srcValue, true);
        }
        else if (isTyped) {
          isCommon = false;
          newValue = cloneTypedArray(srcValue, true);
        }
        else {
          newValue = [];
        }
      }
      else if (isPlainObject(srcValue) || isArguments(srcValue)) {
        newValue = objValue;
        if (isArguments(objValue)) {
          newValue = toPlainObject(objValue);
        }
        else if (!isObject$1(objValue) || isFunction$1(objValue)) {
          newValue = initCloneObject(srcValue);
        }
      }
      else {
        isCommon = false;
      }
    }
    if (isCommon) {
      
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack['delete'](srcValue);
    }
    assignMergeValue(object, key, newValue);
  }

  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    baseFor(source, function(srcValue, key) {
      if (isObject$1(srcValue)) {
        stack || (stack = new Stack);
        baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
      }
      else {
        var newValue = customizer
          ? customizer(safeGet(object, key), srcValue, (key + ''), object, source, stack)
          : undefined;

        if (newValue === undefined) {
          newValue = srcValue;
        }
        assignMergeValue(object, key, newValue);
      }
    }, keysIn$1);
  }

  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  var nativeMax$2 = Math.max;


  function overRest(func, start, transform) {
    start = nativeMax$2(start === undefined ? (func.length - 1) : start, 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax$2(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply(func, this, otherArgs);
    };
  }

  function constant(value) {
    return function() {
      return value;
    };
  }

  var baseSetToString = !defineProperty ? identity : function(func, string) {
    return defineProperty(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant(string),
      'writable': true
    });
  };

  var HOT_COUNT = 800,
      HOT_SPAN = 16;


  var nativeNow = Date.now;


  function shortOut(func) {
    var count = 0,
        lastCalled = 0;

    return function() {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }

  var setToString = shortOut(baseSetToString);

  function baseRest(func, start) {
    return setToString(overRest(func, start, identity), func + '');
  }

  function isIterateeCall(value, index, object) {
    if (!isObject$1(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return eq(object[index], value);
    }
    return false;
  }

  function createAssigner(assigner) {
    return baseRest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = (assigner.length > 3 && typeof customizer == 'function')
        ? (length--, customizer)
        : undefined;

      if (guard && isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  var merge = createAssigner(function(object, source, srcIndex) {
    baseMerge(object, source, srcIndex);
  });

  var mergeWith = createAssigner(function(object, source, srcIndex, customizer) {
    baseMerge(object, source, srcIndex, customizer);
  });

  function baseSet(object, path, value, customizer) {
    if (!isObject$1(object)) {
      return object;
    }
    path = castPath(path, object);

    var index = -1,
        length = path.length,
        lastIndex = length - 1,
        nested = object;

    while (nested != null && ++index < length) {
      var key = toKey(path[index]),
          newValue = value;

      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : undefined;
        if (newValue === undefined) {
          newValue = isObject$1(objValue)
            ? objValue
            : (isIndex(path[index + 1]) ? [] : {});
        }
      }
      assignValue(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }

  function basePickBy(object, paths, predicate) {
    var index = -1,
        length = paths.length,
        result = {};

    while (++index < length) {
      var path = paths[index],
          value = baseGet(object, path);

      if (predicate(value, path)) {
        baseSet(result, castPath(path, object), value);
      }
    }
    return result;
  }

  function basePick(object, paths) {
    return basePickBy(object, paths, function(value, path) {
      return hasIn(object, path);
    });
  }

  var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : undefined;


  function isFlattenable(value) {
    return isArray$1(value) || isArguments(value) ||
      !!(spreadableSymbol && value && value[spreadableSymbol]);
  }

  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1,
        length = array.length;

    predicate || (predicate = isFlattenable);
    result || (result = []);

    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }

  function flatten(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten(array, 1) : [];
  }

  function flatRest(func) {
    return setToString(overRest(func, undefined, flatten), func + '');
  }

  var pick = flatRest(function(object, paths) {
    return object == null ? {} : basePick(object, paths);
  });

  function setWith(object, path, value, customizer) {
    customizer = typeof customizer == 'function' ? customizer : undefined;
    return object == null ? object : baseSet(object, path, value, customizer);
  }

  function baseIsNaN(value) {
    return value !== value;
  }

  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1,
        length = array.length;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  function baseIndexOf(array, value, fromIndex) {
    return value === value
      ? strictIndexOf(array, value, fromIndex)
      : baseFindIndex(array, baseIsNaN, fromIndex);
  }

  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf(array, value, 0) > -1;
  }

  function arrayIncludesWith(array, value, comparator) {
    var index = -1,
        length = array == null ? 0 : array.length;

    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }

  function noop() {
    
  }

  var INFINITY$3 = 1 / 0;


  var createSet = !(Set$1 && (1 / setToArray(new Set$1([,-0]))[1]) == INFINITY$3) ? noop : function(values) {
    return new Set$1(values);
  };

  var LARGE_ARRAY_SIZE$1 = 200;


  function baseUniq(array, iteratee, comparator) {
    var index = -1,
        includes = arrayIncludes,
        length = array.length,
        isCommon = true,
        result = [],
        seen = result;

    if (comparator) {
      isCommon = false;
      includes = arrayIncludesWith;
    }
    else if (length >= LARGE_ARRAY_SIZE$1) {
      var set = iteratee ? null : createSet(array);
      if (set) {
        return setToArray(set);
      }
      isCommon = false;
      includes = cacheHas;
      seen = new SetCache;
    }
    else {
      seen = iteratee ? [] : result;
    }
    outer:
    while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value) : value;

      value = (comparator || value !== 0) ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      }
      else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
    return result;
  }

  function uniq(array) {
    return (array && array.length) ? baseUniq(array) : [];
  }

  function last$1(array) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
  }

  function parent$1(object, path) {
    return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
  }

  function baseUnset(object, path) {
    path = castPath(path, object);
    object = parent$1(object, path);
    return object == null || delete object[toKey(last$1(path))];
  }

  function unset(object, path) {
    return object == null ? true : baseUnset(object, path);
  }

  var LARGE_ARRAY_SIZE$2 = 200;


  function baseDifference(array, values, iteratee, comparator) {
    var index = -1,
        includes = arrayIncludes,
        isCommon = true,
        length = array.length,
        result = [],
        valuesLength = values.length;

    if (!length) {
      return result;
    }
    if (iteratee) {
      values = arrayMap(values, baseUnary(iteratee));
    }
    if (comparator) {
      includes = arrayIncludesWith;
      isCommon = false;
    }
    else if (values.length >= LARGE_ARRAY_SIZE$2) {
      includes = cacheHas;
      isCommon = false;
      values = new SetCache(values);
    }
    outer:
    while (++index < length) {
      var value = array[index],
          computed = iteratee == null ? value : iteratee(value);

      value = (comparator || value !== 0) ? value : 0;
      if (isCommon && computed === computed) {
        var valuesIndex = valuesLength;
        while (valuesIndex--) {
          if (values[valuesIndex] === computed) {
            continue outer;
          }
        }
        result.push(value);
      }
      else if (!includes(values, computed, comparator)) {
        result.push(value);
      }
    }
    return result;
  }

  var without = baseRest(function(array, values) {
    return isArrayLikeObject(array)
      ? baseDifference(array, values)
      : [];
  });

  function baseForOwn(object, iteratee) {
    return object && baseFor(object, iteratee, keys);
  }

  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length,
          index = fromRight ? length : -1,
          iterable = Object(collection);

      while ((fromRight ? index-- : ++index < length)) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }

  var baseEach = createBaseEach(baseForOwn);

  function baseMap(collection, iteratee) {
    var index = -1,
        result = isArrayLike(collection) ? Array(collection.length) : [];

    baseEach(collection, function(value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }

  function baseSortBy(array, comparer) {
    var length = array.length;

    array.sort(comparer);
    while (length--) {
      array[length] = array[length].value;
    }
    return array;
  }

  function compareAscending(value, other) {
    if (value !== other) {
      var valIsDefined = value !== undefined,
          valIsNull = value === null,
          valIsReflexive = value === value,
          valIsSymbol = isSymbol(value);

      var othIsDefined = other !== undefined,
          othIsNull = other === null,
          othIsReflexive = other === other,
          othIsSymbol = isSymbol(other);

      if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
          (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
          (valIsNull && othIsDefined && othIsReflexive) ||
          (!valIsDefined && othIsReflexive) ||
          !valIsReflexive) {
        return 1;
      }
      if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
          (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
          (othIsNull && valIsDefined && valIsReflexive) ||
          (!othIsDefined && valIsReflexive) ||
          !othIsReflexive) {
        return -1;
      }
    }
    return 0;
  }

  function compareMultiple(object, other, orders) {
    var index = -1,
        objCriteria = object.criteria,
        othCriteria = other.criteria,
        length = objCriteria.length,
        ordersLength = orders.length;

    while (++index < length) {
      var result = compareAscending(objCriteria[index], othCriteria[index]);
      if (result) {
        if (index >= ordersLength) {
          return result;
        }
        var order = orders[index];
        return result * (order == 'desc' ? -1 : 1);
      }
    }
    
    
    
    
    
    
    
    return object.index - other.index;
  }

  function baseOrderBy(collection, iteratees, orders) {
    var index = -1;
    iteratees = arrayMap(iteratees.length ? iteratees : [identity], baseUnary(baseIteratee));

    var result = baseMap(collection, function(value, key, collection) {
      var criteria = arrayMap(iteratees, function(iteratee) {
        return iteratee(value);
      });
      return { 'criteria': criteria, 'index': ++index, 'value': value };
    });

    return baseSortBy(result, function(object, other) {
      return compareMultiple(object, other, orders);
    });
  }

  function orderBy(collection, iteratees, orders, guard) {
    if (collection == null) {
      return [];
    }
    if (!isArray$1(iteratees)) {
      iteratees = iteratees == null ? [] : [iteratees];
    }
    orders = guard ? undefined : orders;
    if (!isArray$1(orders)) {
      orders = orders == null ? [] : [orders];
    }
    return baseOrderBy(collection, iteratees, orders);
  }

  function cloneDeep (val) {
    return cloneDeepWith(val, value => {
      if (platform.inBrowser && value instanceof window.File) {
        return value
      }
    })
  }

  function isPlainObject$1 (o) {
    return Boolean(o) && o.constructor === {}.constructor
  }

  function isEqual (a, b) {
    if (a === b) return true
    if (isArray(a) && isArray(b)) {
      if (a.length !== b.length) return false
      for (let i = 0; i < a.length; i++) {
        if (!isEqual(a[i], b[i])) return false
      }
      return true
    }
    if (isPlainObject$1(a) && isPlainObject$1(b)) {
      let akeys = Object.keys(a).sort();
      let bkeys = Object.keys(b).sort();
      if (!isEqual(akeys, bkeys)) return false
      for (let i = 0; i < akeys.length; i++) {
        let key = akeys[i];
        if (!isEqual(a[key], b[key])) return false
      }
      return true
    }
    return false
  }

  class CustomSelection extends Selection {
    constructor (customType, data, nodeId, surfaceId) {
      super();

      if (arguments.length === 1) {
        let _data = arguments[0];
        customType = _data.customType;
        data = _data.data;
        nodeId = _data.nodeId;
        surfaceId = _data.surfaceId;
      }

      if (!customType) { throw new Error("'customType' is required") }
      if (!nodeId) { throw new Error("'nodeId' is required") }

      this.customType = customType;
      this.data = data || {};
      this.nodeId = nodeId;
      this.surfaceId = surfaceId;
    }

    isCustomSelection () {
      return true
    }

    getType () {
      return 'custom'
    }

    getCustomType () {
      return this.customType
    }

    
    getNodeId () {
      return this.nodeId
    }

    toJSON () {
      let res = {
        type: 'custom',
        customType: this.customType,
        nodeId: this.nodeId,
        data: cloneDeep(this.data)
      };
      if (this.surfaceId) {
        res.surfaceId = this.surfaceId;
      }
      return res
    }

    toString () {
      
      return [
        'CustomSelection(',
        this.customType, ', ',
        JSON.stringify(this.data),
        ')'
      ].join('')
    }

    equals (other) {
      return (
        Selection.prototype.equals.call(this, other) &&
        other.isCustomSelection() &&
        isEqual(this.data, other.data)
      )
    }

    _clone () {
      return new CustomSelection(this)
    }

    get _isCustomSelection () { return true }

    static fromJSON (data) {
      return new CustomSelection(data)
    }
  }

  function getContainerRoot (doc, containerPath, nodeId) {
    let current = doc.get(nodeId);
    let containerId = containerPath[0];
    while (current) {
      let parent = current.getParent();
      if (parent && parent.id === containerId) {
        return current
      }
      current = parent;
    }
  }

  function getContainerPosition (doc, containerPath, nodeId) {
    let node = getContainerRoot(doc, containerPath, nodeId);
    return node.getPosition()
  }

  function fromJSON (json) {
    if (!json) return Selection.nullSelection
    var type = json.type;
    switch (type) {
      case 'property':
        return PropertySelection.fromJSON(json)
      case 'container':
        return ContainerSelection.fromJSON(json)
      case 'node':
        return NodeSelection.fromJSON(json)
      case 'custom':
        return CustomSelection.fromJSON(json)
      default:
        
        return Selection.nullSelection
    }
  }


  function isFirst (doc, containerPath, coor) {
    if (coor.isNodeCoordinate()) {
      return coor.offset === 0
    }
    let node = getContainerRoot(doc, containerPath, coor.path[0]);
    if (node.isText()) {
      return coor.offset === 0
    }
    if (node.isList()) {
      let itemId = coor.path[0];
      return (node.items[0] === itemId && coor.offset === 0)
    }
    return false
  }


  function isLast (doc, containerPath, coor) {
    if (coor.isNodeCoordinate()) {
      return coor.offset > 0
    }
    let node = getContainerRoot(doc, containerPath, coor.path[0]);
    if (node.isText()) {
      return coor.offset >= node.getLength()
    }
    if (node.isList()) {
      let itemId = coor.path[0];
      let item = doc.get(itemId);
      return (last(node.items) === itemId && coor.offset === item.getLength())
    }
    return false
  }

  function isEntirelySelected (doc, node, start, end) {
    let { isEntirelySelected } = _getRangeInfo(doc, node, start, end);
    return isEntirelySelected
  }

  function _getRangeInfo (doc, node, start, end) {
    let isFirst = true;
    let isLast = true;
    if (node.isText() || node.isListItem()) {
      if (start && start.offset !== 0) isFirst = false;
      if (end && end.offset < node.getLength()) isLast = false;
    }
    let isEntirelySelected = isFirst && isLast;
    return {isFirst, isLast, isEntirelySelected}
  }

  function setCursor (tx, node, containerPath, mode) {
    if (node.isText()) {
      let offset = 0;
      if (mode === 'after') {
        let text = node.getText();
        offset = text.length;
      }
      tx.setSelection({
        type: 'property',
        path: node.getPath(),
        startOffset: offset,
        containerPath
      });
    } else if (node.isList()) {
      let item, offset;
      if (mode === 'after') {
        item = node.getLastItem();
        offset = item.getLength();
      } else {
        item = node.getFirstItem();
        offset = 0;
      }
      tx.setSelection({
        type: 'property',
        path: item.getPath(),
        startOffset: offset,
        containerPath
      });
    } else {
      tx.setSelection({
        type: 'node',
        containerPath,
        nodeId: node.id
        
        
        
      });
    }
  }

  function selectNode (tx, nodeId, containerPath) {
    tx.setSelection(createNodeSelection({ doc: tx, nodeId, containerPath }));
  }

  function createNodeSelection ({ doc, nodeId, containerPath, mode, reverse, surfaceId }) {
    let node = doc.get(nodeId);
    if (!node) return Selection.nullSelection
    node = getContainerRoot(doc, containerPath, nodeId);
    if (node.isText()) {
      return new PropertySelection({
        path: node.getPath(),
        startOffset: mode === 'after' ? node.getLength() : 0,
        endOffset: mode === 'before' ? 0 : node.getLength(),
        reverse,
        containerPath,
        surfaceId
      })
    } else if (node.isList() && node.getLength() > 0) {
      let first = node.getFirstItem();
      let last$$1 = node.getLastItem();
      let start = {
        path: first.getPath(),
        offset: 0
      };
      let end = {
        path: last$$1.getPath(),
        offset: last$$1.getLength()
      };
      if (mode === 'after') start = end;
      else if (mode === 'before') end = start;
      return new ContainerSelection({
        startPath: start.path,
        startOffset: start.offset,
        endPath: end.path,
        endOffset: end.offset,
        reverse,
        containerPath,
        surfaceId
      })
    } else {
      return new NodeSelection({ nodeId, mode, reverse, containerPath, surfaceId })
    }
  }

  function stepIntoIsolatedNode (editorSession, comp) {
    
    
    if (comp.grabFocus()) return true

    
    let surface = comp.find('.sc-surface');
    if (surface) {
      
      if (surface._isTextPropertyEditor) {
        const doc = editorSession.getDocument();
        const path = surface.getPath();
        const text = doc.get(path, 'strict');
        editorSession.setSelection({
          type: 'property',
          path: path,
          startOffset: text.length,
          surfaceId: surface.id
        });
        return true
      } else if (surface._isContainerEditor) {
        let doc = editorSession.getDocument();
        let containerPath = surface.getContainerPath();
        let nodeIds = doc.get();
        if (nodeIds.length > 0) {
          let first = doc.get(nodeIds[0]);
          setCursor(editorSession, first, containerPath, 'after');
        }
        return true
      }
    }
    return false
  }

  function augmentSelection (selData, oldSel) {
    
    if (selData && oldSel && !selData.surfaceId && !oldSel.isNull()) {
      selData.containerPath = selData.containerPath || oldSel.containerPath;
      selData.surfaceId = selData.surfaceId || oldSel.surfaceId;
    }
    return selData
  }


  function getNodeIdsCoveredByContainerSelection (doc, sel) {
    let containerPath = sel.containerPath;
    let startPos = getContainerPosition(doc, containerPath, sel.start.path[0]);
    let endPos = getContainerPosition(doc, containerPath, sel.end.path[0]);
    let nodeIds = doc.get(containerPath);
    return nodeIds.slice(startPos, endPos + 1)
  }

  var selectionHelpers = /*#__PURE__*/Object.freeze({
    fromJSON: fromJSON,
    isFirst: isFirst,
    isLast: isLast,
    isEntirelySelected: isEntirelySelected,
    setCursor: setCursor,
    selectNode: selectNode,
    createNodeSelection: createNodeSelection,
    stepIntoIsolatedNode: stepIntoIsolatedNode,
    augmentSelection: augmentSelection,
    getNodeIdsCoveredByContainerSelection: getNodeIdsCoveredByContainerSelection
  });

  class PathObject {
    
    constructor (root) {
      if (root) {
        this.__root__ = root;
      }
    }

    contains (id) {
      return Boolean(this.getRoot()[id])
    }

    getRoot () {
      if (this.__root__) {
        return this.__root__
      } else {
        return this
      }
    }

    
    get (path) {
      if (!path) {
        return undefined
      }
      if (isString(path)) {
        let id = path;
        return this.getRoot()[id]
      }
      if (arguments.length > 1) {
        path = Array.prototype.slice(arguments, 0);
      }
      if (!isArray(path)) {
        throw new Error('Illegal argument for PathObject.get()')
      }
      return get(this.getRoot(), path)
    }

    set (path, value) {
      if (!path) {
        throw new Error('Illegal argument: PathObject.set(>path<, value) - path is mandatory.')
      }
      if (isString(path)) {
        let id = path;
        this.getRoot()[id] = value;
      } else {
        setWith(this.getRoot(), path, value);
      }
    }

    delete (path) {
      if (isString(path)) {
        let id = path;
        delete this.getRoot()[id];
      } else if (path.length === 1) {
        delete this.getRoot()[path[0]];
      } else {
        var success = unset(this.getRoot(), path);
        if (!success) {
          throw new Error('Could not delete property at path' + path)
        }
      }
    }

    clear () {
      var root = this.getRoot();
      for (var key in root) {
        if (root.hasOwnProperty(key)) {
          delete root[key];
        }
      }
    }
  }

  PathObject.prototype._isPathObject = true;

  class Conflict extends Error {
    constructor (a, b) {
      super('Conflict: ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
      this.a = a;
      this.b = b;
    }
  }

  const INSERT = 'insert';
  const DELETE = 'delete';

  class TextOperation {
    constructor (data) {
      if (!data || data.type === undefined || data.pos === undefined || data.str === undefined) {
        throw new Error('Illegal argument: insufficient data.')
      }
      
      this.type = data.type;
      
      this.pos = data.pos;
      
      this.str = data.str;
      
      if (!this.isInsert() && !this.isDelete()) {
        throw new Error('Illegal type.')
      }
      if (!isString(this.str)) {
        throw new Error('Illegal argument: expecting string.')
      }
      if (!isNumber(this.pos) || this.pos < 0) {
        throw new Error('Illegal argument: expecting positive number as pos.')
      }
    }

    apply (str) {
      if (this.isEmpty()) return str
      if (this.type === INSERT) {
        if (str.length < this.pos) {
          throw new Error('Provided string is too short.')
        }
        if (str.splice) {
          return str.splice(this.pos, 0, this.str)
        } else {
          return str.slice(0, this.pos).concat(this.str).concat(str.slice(this.pos))
        }
      } else  {
        if (str.length < this.pos + this.str.length) {
          throw new Error('Provided string is too short.')
        }
        if (str.splice) {
          return str.splice(this.pos, this.str.length)
        } else {
          return str.slice(0, this.pos).concat(str.slice(this.pos + this.str.length))
        }
      }
    }

    clone () {
      return new TextOperation(this)
    }

    isNOP () {
      return this.type === 'NOP' || this.str.length === 0
    }

    isInsert () {
      return this.type === INSERT
    }

    isDelete () {
      return this.type === DELETE
    }

    getLength () {
      return this.str.length
    }

    invert () {
      var data = {
        type: this.isInsert() ? DELETE : INSERT,
        pos: this.pos,
        str: this.str
      };
      return new TextOperation(data)
    }

    hasConflict (other) {
      return _hasConflict(this, other)
    }

    isEmpty () {
      return this.str.length === 0
    }

    toJSON () {
      return {
        type: this.type,
        pos: this.pos,
        str: this.str
      }
    }

    toString () {
      return ['(', (this.isInsert() ? INSERT : DELETE), ',', this.pos, ",'", this.str, "')"].join('')
    }

    
    get _isOperation () { return true }
    get _isTextOperation () { return true }

    static transform (a, b, options) {
      return transform(a, b, options)
    }

    static hasConflict (a, b) {
      return _hasConflict(a, b)
    }

    

    static Insert (pos, str) {
      return new TextOperation({ type: INSERT, pos: pos, str: str })
    }

    static Delete (pos, str) {
      return new TextOperation({ type: DELETE, pos: pos, str: str })
    }

    static fromJSON (data) {
      return new TextOperation(data)
    }

    
    
    static get INSERT () { return INSERT }
    static get DELETE () { return DELETE }
  }

  function _hasConflict (a, b) {
    
    
    
    if (a.type === INSERT && b.type === INSERT) return (a.pos === b.pos)
    
    
    
    if (a.type === DELETE && b.type === DELETE) {
      
      return !(a.pos >= b.pos + b.str.length || b.pos >= a.pos + a.str.length)
    }
    
    
    
    var del, ins;
    if (a.type === DELETE) {
      del = a; ins = b;
    } else {
      del = b; ins = a;
    }
    return (ins.pos >= del.pos && ins.pos < del.pos + del.str.length)
  }




  function transformInsertInsert (a, b) {
    if (a.pos === b.pos) {
      b.pos += a.str.length;
    } else if (a.pos < b.pos) {
      b.pos += a.str.length;
    } else {
      a.pos += b.str.length;
    }
  }





  function transformDeleteDelete (a, b, first) {
    
    if (a.pos > b.pos) {
      return transformDeleteDelete(b, a, !first)
    }
    if (a.pos === b.pos && a.str.length > b.str.length) {
      return transformDeleteDelete(b, a, !first)
    }
    
    if (b.pos < a.pos + a.str.length) {
      var s = b.pos - a.pos;
      var s1 = a.str.length - s;
      var s2 = s + b.str.length;
      a.str = a.str.slice(0, s) + a.str.slice(s2);
      b.str = b.str.slice(s1);
      b.pos -= s;
    } else {
      b.pos -= a.str.length;
    }
  }





  function transformInsertDelete (a, b) {
    if (a.type === DELETE) {
      return transformInsertDelete(b, a)
    }
    
    
    if (a.pos <= b.pos) {
      b.pos += a.str.length;
    
    } else if (a.pos >= b.pos + b.str.length) {
      a.pos -= b.str.length;
    
    
    
    } else {
      var s = a.pos - b.pos;
      b.str = b.str.slice(0, s) + a.str + b.str.slice(s);
      a.str = '';
    }
  }

  function transform (a, b, options) {
    options = options || {};
    if (options['no-conflict'] && _hasConflict(a, b)) {
      throw new Conflict(a, b)
    }
    if (a.type === INSERT && b.type === INSERT) {
      transformInsertInsert(a, b);
    } else if (a.type === DELETE && b.type === DELETE) {
      transformDeleteDelete(a, b, true);
    } else {
      transformInsertDelete(a, b);
    }
    return [a, b]
  }

  const NOP = 'NOP';
  const DELETE$1 = 'delete';
  const INSERT$1 = 'insert';

  class ArrayOperation {
    constructor (data) {
      if (!data || !data.type) {
        throw new Error('Illegal argument: insufficient data.')
      }
      this.type = data.type;
      if (this.type === NOP) return

      if (this.type !== INSERT$1 && this.type !== DELETE$1) {
        throw new Error('Illegal type.')
      }
      
      this.pos = data.pos;
      
      this.val = data.val;
      if (!isNumber(this.pos) || this.pos < 0) {
        throw new Error('Illegal argument: expecting positive number as pos.')
      }
    }

    apply (array) {
      if (this.type === NOP) {
        return array
      }
      if (this.type === INSERT$1) {
        if (array.length < this.pos) {
          throw new Error('Provided array is too small.')
        }
        array.splice(this.pos, 0, this.val);
        return array
      
      } else  {
        if (array.length < this.pos) {
          throw new Error('Provided array is too small.')
        }
        if (!isEqual(array[this.pos], this.val)) {
          throw Error('Unexpected value at position ' + this.pos + '. Expected ' + this.val + ', found ' + array[this.pos])
        }
        array.splice(this.pos, 1);
        return array
      }
    }

    clone () {
      var data = {
        type: this.type,
        pos: this.pos,
        val: cloneDeep(this.val)
      };
      return new ArrayOperation(data)
    }

    invert () {
      var data = this.toJSON();
      if (this.type === NOP) data.type = NOP;
      else if (this.type === INSERT$1) data.type = DELETE$1;
      else  data.type = INSERT$1;
      return new ArrayOperation(data)
    }

    hasConflict (other) {
      return ArrayOperation.hasConflict(this, other)
    }

    toJSON () {
      var result = {
        type: this.type
      };
      if (this.type === NOP) return result
      result.pos = this.pos;
      result.val = cloneDeep(this.val);
      return result
    }

    isInsert () {
      return this.type === INSERT$1
    }

    isDelete () {
      return this.type === DELETE$1
    }

    getOffset () {
      return this.pos
    }

    getValue () {
      return this.val
    }

    isNOP () {
      return this.type === NOP
    }

    toString () {
      return ['(', (this.isInsert() ? INSERT$1 : DELETE$1), ',', this.getOffset(), ",'", this.getValue(), "')"].join('')
    }

    

    get _isOperation () { return true }

    get _isArrayOperation () { return true }

    static transform (a, b, options) {
      return transform$1(a, b, options)
    }

    static hasConflict (a, b) {
      return hasConflict(a, b)
    }

    
    static Insert (pos, val) {
      return new ArrayOperation({type: INSERT$1, pos: pos, val: val})
    }

    static Delete (pos, val) {
      return new ArrayOperation({ type: DELETE$1, pos: pos, val: val })
    }

    static Nop () {
      return new ArrayOperation({type: NOP})
    }

    static fromJSON (data) {
      return new ArrayOperation(data)
    }

    
    static get NOP () { return NOP }

    static get DELETE () { return DELETE$1 }

    static get INSERT () { return INSERT$1 }
  }

  function hasConflict (a, b) {
    if (a.type === NOP || b.type === NOP) return false
    if (a.type === INSERT$1 && b.type === INSERT$1) {
      return a.pos === b.pos
    } else {
      return false
    }
  }

  function transformInsertInsert$1 (a, b) {
    if (a.pos === b.pos) {
      b.pos += 1;
    
    } else if (a.pos < b.pos) {
      b.pos += 1;
    
    } else {
      a.pos += 1;
    }
  }

  function transformDeleteDelete$1 (a, b, options = {}) {
    
    if (a.pos === b.pos) {
      
      
      if (a.val !== b.val) {
        console.error('FIXME: transforming array delete-delete at the same position but with different values.');
      }
      if (!options.rebase) {
        b.type = NOP;
        a.type = NOP;
      }
    } else if (a.pos < b.pos) {
      b.pos -= 1;
    } else {
      a.pos -= 1;
    }
  }

  function transformInsertDelete$1 (a, b, options = {}) {
    
    if (a.type === DELETE$1) {
      ([a, b] = [b, a]);
    }
    
    
    
    
    if (options.rebase) {
      if (a.pos < b.pos) {
        b.pos += 1;
      } else if (a.pos > b.pos) {
        a.pos -= 1;
      }
    } else {
      if (a.pos <= b.pos) {
        b.pos += 1;
      } else {
        a.pos -= 1;
      }
    }
  }

  var transform$1 = function (a, b, options = {}) {
    
    
    if (options['no-conflict'] && hasConflict(a, b)) {
      throw new Conflict(a, b)
    }
    if (a.type === NOP || b.type === NOP) ; else if (a.type === INSERT$1 && b.type === INSERT$1) {
      transformInsertInsert$1(a, b, options);
    } else if (a.type === DELETE$1 && b.type === DELETE$1) {
      transformDeleteDelete$1(a, b, options);
    } else {
      transformInsertDelete$1(a, b, options);
    }
    return [a, b]
  };

  const SHIFT = 'shift';

  class CoordinateOperation {
    constructor (data) {
      if (!data || data.type === undefined) {
        throw new Error('Illegal argument: insufficient data.')
      }
      
      this.type = data.type;
      
      this.val = data.val;
      
      if (!this.isShift()) {
        throw new Error('Illegal type.')
      }
      if (!isNumber(this.val)) {
        throw new Error('Illegal argument: expecting number as shift value.')
      }
    }

    apply (coor) {
      coor.offset = coor.offset + this.val;
      return coor
    }

    isShift () {
      return this.type === SHIFT
    }

    isNOP () {
      switch (this.type) {
        case SHIFT: {
          return this.val === 0
        }
        default:
          return false
      }
    }

    clone () {
      return new CoordinateOperation(this)
    }

    invert () {
      let data;
      switch (this.type) {
        case SHIFT:
          data = {
            type: SHIFT,
            val: -this.val
          };
          break
        default:
          throw new Error('Invalid type.')
      }
      return new CoordinateOperation(data)
    }

    hasConflict () {
      
      return false
    }

    toJSON () {
      return {
        type: this.type,
        val: this.val
      }
    }

    toString () {
      return ['(', (this.type), ',', this.val, "')"].join('')
    }

    
    get _isOperation () { return true }

    get _isCoordinateOperation () { return true }

    static transform (a, b, options) {
      return transform$2(a, b, options)
    }

    static fromJSON (data) {
      return new CoordinateOperation(data)
    }

    static Shift (val) {
      return new CoordinateOperation({
        type: SHIFT,
        val: val
      })
    }

    static get SHIFT () { return SHIFT }
  }

  function transformShiftShift (a, b, options) {
    if (options.rebase) ; else {
      a.val += b.val;
      b.val += a.val;
    }
  }

  function transform$2 (a, b, options = {}) {
    if (a.type === SHIFT && b.type === SHIFT) {
      transformShiftShift(a, b, options);
    } else {
      throw new Error('Illegal type')
    }
    return [a, b]
  }

  const NOP$1 = 'NOP';
  const CREATE = 'create';
  const DELETE$2 = 'delete';
  const UPDATE = 'update';
  const SET = 'set';

  class ObjectOperation {
    constructor (data) {
      
      if (!data) {
        throw new Error('Data of ObjectOperation is missing.')
      }
      
      if (!data.type) {
        throw new Error('Invalid data: type is mandatory.')
      }
      this.type = data.type;
      if (data.type === NOP$1) {
        return
      }
      this.path = data.path;
      if (!data.path) {
        throw new Error('Invalid data: path is mandatory.')
      }
      if (this.type === CREATE || this.type === DELETE$2) {
        if (!data.val) {
          throw new Error('Invalid data: value is missing.')
        }
        this.val = data.val;
      } else if (this.type === UPDATE) {
        if (data.diff) {
          this.diff = data.diff;
          if (data.diff._isTextOperation) {
            this.propertyType = 'string';
          } else if (data.diff._isArrayOperation) {
            this.propertyType = 'array';
          } else if (data.diff._isCoordinateOperation) {
            this.propertyType = 'coordinate';
          } else {
            throw new Error('Invalid data: unsupported operation type for incremental update.')
          }
        } else {
          throw new Error('Invalid data: diff is mandatory for update operation.')
        }
      } else if (this.type === SET) {
        this.val = data.val;
        this.original = data.original;
      } else {
        throw new Error('Invalid type: ' + data.type)
      }
    }

    apply (obj) {
      if (this.type === NOP$1) return obj
      var adapter;
      if (obj._isPathObject) {
        adapter = obj;
      } else {
        adapter = new PathObject(obj);
      }
      if (this.type === CREATE) {
        adapter.set(this.path, cloneDeep(this.val));
        return obj
      }
      if (this.type === DELETE$2) {
        adapter.delete(this.path, 'strict');
      } else if (this.type === UPDATE) {
        var diff = this.diff;
        switch (this.propertyType) {
          case 'array': {
            let arr = adapter.get(this.path);
            diff.apply(arr);
            break
          }
          case 'string': {
            let str = adapter.get(this.path);
            if (isNil(str)) str = '';
            str = diff.apply(str);
            adapter.set(this.path, str);
            break
          }
          case 'coordinate': {
            let coor = adapter.get(this.path);
            if (!coor) throw new Error('No coordinate with path ' + this.path)
            diff.apply(coor);
            break
          }
          default:
            throw new Error('Unsupported property type for incremental update: ' + this.propertyType)
        }
      } else if (this.type === SET) {
        
        adapter.set(this.path, cloneDeep(this.val));
      } else {
        throw new Error('Invalid type.')
      }
      return obj
    }

    clone () {
      var data = {
        type: this.type,
        path: this.path
      };
      if (this.val) {
        data.val = cloneDeep(this.val);
      }
      if (this.diff) {
        data.diff = this.diff.clone();
      }
      return new ObjectOperation(data)
    }

    isNOP () {
      if (this.type === NOP$1) return true
      else if (this.type === UPDATE) return this.diff.isNOP()
    }

    isCreate () {
      return this.type === CREATE
    }

    isDelete () {
      return this.type === DELETE$2
    }

    isUpdate (propertyType) {
      if (propertyType) {
        return (this.type === UPDATE && this.propertyType === propertyType)
      } else {
        return this.type === UPDATE
      }
    }

    isSet () {
      return this.type === SET
    }

    invert () {
      if (this.type === NOP$1) {
        return new ObjectOperation({ type: NOP$1 })
      }
      var result = new ObjectOperation(this);
      if (this.type === CREATE) {
        result.type = DELETE$2;
      } else if (this.type === DELETE$2) {
        result.type = CREATE;
      } else if (this.type === UPDATE) {
        result.diff = this.diff.clone().invert();
      } else  {
        result.val = this.original;
        result.original = this.val;
      }
      return result
    }

    hasConflict (other) {
      return ObjectOperation.hasConflict(this, other)
    }

    toJSON () {
      if (this.type === NOP$1) {
        return { type: NOP$1 }
      }
      var data = {
        type: this.type,
        path: this.path
      };
      if (this.type === CREATE || this.type === DELETE$2) {
        data.val = this.val;
      } else if (this.type === UPDATE) {
        if (this.diff._isTextOperation) {
          data.propertyType = 'string';
        } else if (this.diff._isArrayOperation) {
          data.propertyType = 'array';
        } else if (this.diff._isCoordinateOperation) {
          data.propertyType = 'coordinate';
        } else {
          throw new Error('Invalid property type.')
        }
        data.diff = this.diff.toJSON();
      } else  {
        data.val = this.val;
        data.original = this.original;
      }
      return data
    }

    getType () {
      return this.type
    }

    getPath () {
      return this.path
    }

    getValue () {
      return this.val
    }

    getOldValue () {
      return this.original
    }

    getValueOp () {
      return this.diff
    }

    
    toString () {
      switch (this.type) {
        case CREATE:
          return ['(+,', JSON.stringify(this.path), JSON.stringify(this.val), ')'].join('')
        case DELETE$2:
          return ['(-,', JSON.stringify(this.path), JSON.stringify(this.val), ')'].join('')
        case UPDATE:
          return ['(>>,', JSON.stringify(this.path), this.propertyType, this.diff.toString(), ')'].join('')
        case SET:
          return ['(=,', JSON.stringify(this.path), this.val, this.original, ')'].join('')
        case NOP$1:
          return 'NOP'
        default:
          throw new Error('Invalid type')
      }
    }

    static transform (a, b, options) {
      return transform$3(a, b, options)
    }

    static hasConflict (a, b) {
      return hasConflict$1(a, b)
    }

    

    static Create (idOrPath, val) {
      var path;
      if (isString(idOrPath)) {
        path = [idOrPath];
      } else {
        path = idOrPath;
      }
      return new ObjectOperation({type: CREATE, path: path, val: val})
    }

    static Delete (idOrPath, val) {
      var path;
      if (isString(idOrPath)) {
        path = [idOrPath];
      } else {
        path = idOrPath;
      }
      return new ObjectOperation({type: DELETE$2, path: path, val: val})
    }

    static Update (path, op) {
      return new ObjectOperation({
        type: UPDATE,
        path: path,
        diff: op
      })
    }

    static Set (path, oldVal, newVal) {
      return new ObjectOperation({
        type: SET,
        path: path,
        val: cloneDeep(newVal),
        original: cloneDeep(oldVal)
      })
    }

    static fromJSON (data) {
      data = cloneDeep(data);
      if (data.type === 'update') {
        data.diff = _deserializeDiffOp(data.propertyType, data.diff);
      }
      let op = new ObjectOperation(data);
      return op
    }

    
    
    static get NOP () { return NOP$1 }
    static get CREATE () { return CREATE }
    static get DELETE () { return DELETE$2 }
    static get UPDATE () { return UPDATE }
    static get SET () { return SET }

    
    get _isOperation () { return true }
    get _isObjectOperation () { return true }
  }



  function hasConflict$1 (a, b) {
    if (a.type === NOP$1 || b.type === NOP$1) return false
    return isEqual(a.path, b.path)
  }

  function transformDeleteDelete$2 (a, b, options = {}) {
    
    if (!options.rebase) {
      
      
      a.type = NOP$1;
      b.type = NOP$1;
    }
  }

  function transformCreateCreate (a, b, options = {}) {
    if (!options.rebase) {
      throw new Error('Can not transform two concurring creates of the same property')
    }
  }

  function transformDeleteCreate (a, b, options = {}) {
    if (!options.rebase) {
      throw new Error('Illegal state: can not create and delete a value at the same time.')
    }
  }

  function _transformDeleteUpdate (a, b, flipped, options = {}) {
    
    if (!options.rebase) {
      if (a.type !== DELETE$2) {
        return _transformDeleteUpdate(b, a, true, options)
      }
      let op = _deserializeDiffOp(b.propertyType, b.diff);
      
      if (!flipped) {
        a.type = NOP$1;
        b.type = CREATE;
        b.val = op.apply(a.val);
      
      } else {
        a.val = op.apply(a.val);
        b.type = NOP$1;
      }
    }
  }

  function transformDeleteUpdate (a, b, options = {}) {
    return _transformDeleteUpdate(a, b, false, options)
  }

  function transformCreateUpdate () {
    
    throw new Error('Can not transform a concurring create and update of the same property')
  }

  function transformUpdateUpdate (a, b, options = {}) {
    
    let opA = _deserializeDiffOp(a.propertyType, a.diff);
    let opB = _deserializeDiffOp(b.propertyType, b.diff);
    let t;
    switch (b.propertyType) {
      case 'string':
        t = TextOperation.transform(opA, opB, options);
        break
      case 'array':
        t = ArrayOperation.transform(opA, opB, options);
        break
      case 'coordinate':
        t = CoordinateOperation.transform(opA, opB, options);
        break
      default:
        throw new Error('Unsupported property type for incremental update')
    }
    a.diff = t[0];
    b.diff = t[1];
  }

  function _deserializeDiffOp (propertyType, diff) {
    if (diff._isOperation) return diff
    switch (propertyType) {
      case 'string':
        return TextOperation.fromJSON(diff)
      case 'array':
        return ArrayOperation.fromJSON(diff)
      case 'coordinate':
        return CoordinateOperation.fromJSON(diff)
      default:
        throw new Error('Unsupported property type for incremental update.')
    }
  }

  function transformCreateSet (a, b, options = {}) {
    if (!options.rebase) {
      throw new Error('Illegal state: can not create and set a value at the same time.')
    }
  }

  function _transformDeleteSet (a, b, flipped, options = {}) {
    if (a.type !== DELETE$2) return _transformDeleteSet(b, a, true, options)
    
    if (!options.rebase) {
      if (!flipped) {
        a.type = NOP$1;
        b.type = CREATE;
        b.original = undefined;
      } else {
        a.val = b.val;
        b.type = NOP$1;
      }
    }
  }

  function transformDeleteSet (a, b, options = {}) {
    return _transformDeleteSet(a, b, false, options)
  }

  function transformUpdateSet (a, b, options = {}) {
    if (!options.rebase) {
      throw new Error('Unresolvable conflict: update + set.')
    }
  }

  function transformSetSet (a, b, options = {}) {
    
    if (!options.rebase) {
      a.type = NOP$1;
      b.original = a.val;
    }
  }

  const _NOP = 0;
  const _CREATE = 1;
  const _DELETE = 2;
  const _UPDATE = 4;
  const _SET = 8;

  const CODE = (() => {
    const c = {};
    c[NOP$1] = _NOP;
    c[CREATE] = _CREATE;
    c[DELETE$2] = _DELETE;
    c[UPDATE] = _UPDATE;
    c[SET] = _SET;
    return c
  })();

  const __transform__ = (() => {
    
    const t = {};
    t[_DELETE | _DELETE] = transformDeleteDelete$2;
    t[_DELETE | _CREATE] = transformDeleteCreate;
    t[_DELETE | _UPDATE] = transformDeleteUpdate;
    t[_CREATE | _CREATE] = transformCreateCreate;
    t[_CREATE | _UPDATE] = transformCreateUpdate;
    t[_UPDATE | _UPDATE] = transformUpdateUpdate;
    t[_CREATE | _SET] = transformCreateSet;
    t[_DELETE | _SET] = transformDeleteSet;
    t[_UPDATE | _SET] = transformUpdateSet;
    t[_SET    | _SET] = transformSetSet;
    
    return t
  })();

  function transform$3 (a, b, options = {}) {
    if (options['no-conflict'] && hasConflict$1(a, b)) {
      throw new Conflict(a, b)
    }
    if (a.isNOP() || b.isNOP()) {
      return [a, b]
    }
    var sameProp = isEqual(a.path, b.path);
    
    if (sameProp) {
      __transform__[CODE[a.type] | CODE[b.type]](a, b, options);
    }
    return [a, b]
  }

  function transformDocumentChange (A, B, options = {}) {
    _transformBatch(A, B, options);
  }

  function transformSelection (sel, a, options) {
    let newSel = sel.clone();
    let hasChanged = _transformSelectionInplace(newSel, a, options);
    if (hasChanged) {
      return newSel
    } else {
      return sel
    }
  }

  function _transformSingle (a, b, options = {}) {
    
    
    let immutableLeft = options.immutableLeft;
    let immutableRight = options.immutableRight;
    for (let i = 0; i < a.ops.length; i++) {
      for (let j = 0; j < b.ops.length; j++) {
        let opA = a.ops[i];
        let opB = b.ops[j];
        if (immutableLeft) {
          opA = opA.clone();
        }
        if (immutableRight) {
          opB = opB.clone();
        }
        
        
        ObjectOperation.transform(opA, opB, options);
      }
    }
    if (!immutableLeft) {
      if (a.before) {
        _transformSelectionInplace(a.before.selection, b, options);
      }
      if (a.after) {
        _transformSelectionInplace(a.after.selection, b, options);
      }
    }
    if (!immutableRight) {
      if (b.before) {
        _transformSelectionInplace(b.before.selection, a, options);
      }
      if (b.after) {
        _transformSelectionInplace(b.after.selection, a, options);
      }
    }
  }

  function _transformBatch (A, B, options = {}) {
    if (!isArray(A)) {
      A = [A];
    }
    if (!isArray(B)) {
      B = [B];
    }
    for (let i = 0; i < A.length; i++) {
      let a = A[i];
      for (let j = 0; j < B.length; j++) {
        let b = B[j];
        _transformSingle(a, b, options);
      }
    }
  }

  function _transformSelectionInplace (sel, a, options = {}) {
    if (!sel || (!sel.isPropertySelection() && !sel.isContainerSelection())) {
      return false
    }
    let ops = a.ops;
    let hasChanged = false;
    let isCollapsed = sel.isCollapsed();
    for (let i = 0; i < ops.length; i++) {
      let op = ops[i];
      hasChanged |= _transformCoordinateInplace(sel.start, op, options);
      if (!isCollapsed) {
        hasChanged |= _transformCoordinateInplace(sel.end, op, options);
      } else {
        if (sel.isContainerSelection()) {
          sel.end.path = sel.start.path;
        }
        sel.end.offset = sel.start.offset;
      }
    }
    return hasChanged
  }

  function _transformCoordinateInplace (coor, op, options) {
    if (!isEqual(op.path, coor.path)) return false
    let hasChanged = false;
    if (op.type === 'update' && op.propertyType === 'string') {
      let diff = op.diff;
      let newOffset;
      if (diff.isInsert() && diff.pos <= coor.offset) {
        newOffset = coor.offset + diff.str.length;
        
        coor.offset = newOffset;
        hasChanged = true;
      } else if (diff.isDelete() && diff.pos <= coor.offset) {
        newOffset = Math.max(diff.pos, coor.offset - diff.str.length);
        
        coor.offset = newOffset;
        hasChanged = true;
      }
    }
    return hasChanged
  }

  var operationHelpers = /*#__PURE__*/Object.freeze({
    transformDocumentChange: transformDocumentChange,
    transformSelection: transformSelection
  });

  var annotationHelpers = {
    insertedText,
    deletedText,
    transferAnnotations,
    expandAnnotation,
    fuseAnnotation,
    truncateAnnotation
  }

  function insertedText (doc, coordinate, length) {
    if (!length) return
    var index = doc.getIndex('annotations');
    var annotations = index.get(coordinate.path);
    for (let i = 0; i < annotations.length; i++) {
      let anno = annotations[i];
      var pos = coordinate.offset;
      var start = anno.start.offset;
      var end = anno.end.offset;
      var newStart = start;
      var newEnd = end;
      if ((pos < start) ||
           (pos === start)) {
        newStart += length;
      }
      
      if ((pos < end) ||
           (pos === end && !anno.isInlineNode())) {
        newEnd += length;
      }
      
      if (newStart !== start) {
        doc.set([anno.id, 'start', 'offset'], newStart);
      }
      if (newEnd !== end) {
        doc.set([anno.id, 'end', 'offset'], newEnd);
      }
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
  }

  function deletedText (doc, path, startOffset, endOffset) {
    if (startOffset === endOffset) return
    var index = doc.getIndex('annotations');
    var annotations = index.get(path);
    var length = endOffset - startOffset;
    for (let i = 0; i < annotations.length; i++) {
      let anno = annotations[i];
      var pos1 = startOffset;
      var pos2 = endOffset;
      var start = anno.start.offset;
      var end = anno.end.offset;
      var newStart = start;
      var newEnd = end;
      if (pos2 <= start) {
        newStart -= length;
        newEnd -= length;
        doc.set([anno.id, 'start', 'offset'], newStart);
        doc.set([anno.id, 'end', 'offset'], newEnd);
      } else {
        if (pos1 <= start) {
          newStart = start - Math.min(pos2 - pos1, start - pos1);
        }
        if (pos1 <= end) {
          newEnd = end - Math.min(pos2 - pos1, end - pos1);
        }
        
        if (start !== end && newStart === newEnd) {
          doc.delete(anno.id);
        } else {
          
          if (start !== newStart) {
            doc.set([anno.id, 'start', 'offset'], newStart);
          }
          if (end !== newEnd) {
            doc.set([anno.id, 'end', 'offset'], newEnd);
          }
        }
      }
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
  }


  function transferAnnotations (doc, path, offset, newPath, newOffset) {
    var index = doc.getIndex('annotations');
    var annotations = index.get(path, offset);
    for (let i = 0; i < annotations.length; i++) {
      let a = annotations[i];
      var isInside = (offset > a.start.offset && offset < a.end.offset);
      var start = a.start.offset;
      var end = a.end.offset;
      
      if (isInside) {
        
        if (a.canSplit()) {
          let newAnno = a.toJSON();
          newAnno.id = uuid(a.type + '_');
          newAnno.start.path = newPath;
          newAnno.start.offset = newOffset;
          newAnno.end.path = newPath;
          newAnno.end.offset = newOffset + a.end.offset - offset;
          doc.create(newAnno);
        }
        
        let newStartOffset = a.start.offset;
        let newEndOffset = offset;
        
        if (newEndOffset === newStartOffset) {
          doc.delete(a.id);
        
        } else {
          
          if (newStartOffset !== start) {
            doc.set([a.id, 'start', 'offset'], newStartOffset);
          }
          if (newEndOffset !== end) {
            doc.set([a.id, 'end', 'offset'], newEndOffset);
          }
        }
      
      } else if (a.start.offset >= offset) {
        
        
        
        doc.set([a.id, 'start', 'path'], newPath);
        doc.set([a.id, 'start', 'offset'], newOffset + a.start.offset - offset);
        doc.set([a.id, 'end', 'path'], newPath);
        doc.set([a.id, 'end', 'offset'], newOffset + a.end.offset - offset);
      }
    }

    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
  }


  function truncateAnnotation (tx, anno, sel) {
    if (!sel || !sel._isSelection) throw new Error('Argument "selection" is required.')
    if (!anno || !anno.isAnnotation()) throw new Error('Argument "anno" is required and must be an annotation.')
    let annoSel = anno.getSelection();
    let newAnnoSel = annoSel.truncateWith(sel);
    anno._updateRange(tx, newAnnoSel);
    return anno
  }


  function expandAnnotation (tx, anno, sel) {
    if (!sel || !sel._isSelection) throw new Error('Argument "selection" is required.')
    if (!anno || !anno.isAnnotation()) throw new Error('Argument "anno" is required and must be an annotation.')
    let annoSel = anno.getSelection();
    let newAnnoSel = annoSel.expand(sel);
    anno._updateRange(tx, newAnnoSel);
    return anno
  }


  function fuseAnnotation (tx, annos) {
    if (!isArray(annos) || annos.length < 2) {
      throw new Error('fuseAnnotation(): at least two annotations are necessary.')
    }
    let sel, annoType;
    annos.forEach(function (anno, idx) {
      if (idx === 0) {
        sel = anno.getSelection();
        annoType = anno.type;
      } else {
        if (anno.type !== annoType) {
          throw new Error('fuseAnnotation(): all annotations must be of the same type.')
        }
        sel = sel.expand(anno.getSelection());
      }
    });
    
    for (var i = 1; i < annos.length; i++) {
      tx.delete(annos[i].id);
    }
    expandAnnotation(tx, annos[0], sel);
    tx.setSelection(sel);
  }

  class NodeIndex {
    
    select (node) { 
      throw new Error('This method is abstract.')
    }

    clear () {
      throw new Error('This method is abstract')
    }

    
    create (node) { 
      throw new Error('This method is abstract.')
    }

    
    delete (node) { 
      throw new Error('This method is abstract.')
    }

    set (node, path, newValue, oldValue) {
      this.update(node, path, newValue, oldValue);
    }

    
    update (node, path, newValue, oldValue) { 
      throw new Error('This method is abstract.')
    }

    
    reset (data) {
      this.clear();
      this._initialize(data);
    }

    
    clone () {
      var NodeIndexClass = this.constructor;
      var clone = new NodeIndexClass();
      return clone
    }

    _initialize (data) {
      forEach(data.getNodes(), function (node) {
        if (this.select(node)) {
          this.create(node);
        }
      }.bind(this));
    }
  }


  NodeIndex.create = function (prototype) {
    var index = Object.assign(new NodeIndex(), prototype);
    index.clone = function () {
      return NodeIndex.create(prototype)
    };
    return index
  };


  NodeIndex.filterByType = function (type) {
    return function (node) {
      return node.isInstanceOf(type)
    }
  };

  class DocumentIndex extends NodeIndex {}

  function filter (iteratee, fn) {
    if (!iteratee) return []
    if (iteratee.constructor.prototype.filter && isFunction(iteratee.constructor.prototype.filter)) {
      return iteratee.filter(fn)
    }
    let result = [];
    forEach(iteratee, (val, key) => {
      if (fn(val, key)) {
        result.push(val);
      }
    });
    return result
  }

  function flatten$1 (arr) {
    return Array.prototype.concat.apply([], arr)
  }

  function flattenOften (arr, max) {
    if (!(max > 0)) throw new Error("'max' must be a positive number")
    let l = arr.length;
    arr = flatten$1(arr);
    let round = 1;
    while (round < max && l < arr.length) {
      l = arr.length;
      arr = flatten$1(arr);
      round++;
    }
    return arr
  }

  function getPropertyAnnotationsForSelection (doc, sel, options) {
    options = options || {};
    if (!sel.isPropertySelection()) {
      return []
    }
    let path = sel.getPath();
    let annotations = doc.getIndex('annotations').get(path, sel.start.offset, sel.end.offset);
    if (options.type) {
      annotations = filter(annotations, DocumentIndex.filterByType(options.type));
    }
    return annotations
  }


  function getContainerAnnotationsForSelection (doc, sel, containerPath, options) {
    
    
    
    
    
    if (!containerPath) {
      throw new Error("'containerPath' is required.")
    }
    options = options || {};
    let index = doc.getIndex('container-annotations');
    let annotations = [];
    if (index) {
      annotations = index.get(containerPath, options.type);
      annotations = filter(annotations, function (anno) {
        return sel.overlaps(anno.getSelection())
      });
    }
    return annotations
  }


  function isContainerAnnotation (doc, type) {
    let schema = doc.getSchema();
    return schema.isInstanceOf(type, '@container-annotation')
  }


  function getTextForSelection (doc, sel) {
    if (!sel || sel.isNull()) {
      return ''
    } else if (sel.isPropertySelection()) {
      let text = doc.get(sel.start.path);
      return text.substring(sel.start.offset, sel.end.offset)
    } else if (sel.isContainerSelection()) {
      let result = [];
      let nodeIds = getNodeIdsCoveredByContainerSelection(doc, sel);
      let L = nodeIds.length;
      for (let i = 0; i < L; i++) {
        let id = nodeIds[i];
        let node = doc.get(id);
        if (node.isText()) {
          let text = node.getText();
          if (i === L - 1) {
            text = text.slice(0, sel.end.offset);
          }
          if (i === 0) {
            text = text.slice(sel.start.offset);
          }
          result.push(text);
        }
      }
      return result.join('\n')
    }
  }

  function getMarkersForSelection (doc, sel) {
    
    if (!sel || !sel.isPropertySelection()) return []
    const path = sel.getPath();
    
    let markers = doc.getIndex('markers').get(path);
    const filtered = filter(markers, function (m) {
      return m.containsSelection(sel)
    });
    return filtered
  }

  function deleteNode (doc, node) {
    console.error('DEPRECATED: use documentHelpers.deepDeleteNode() instead');
    return deepDeleteNode(doc, node)
  }


  function deepDeleteNode (doc, node) {
    
    if (!node) {
      console.warn('Invalid arguments');
      return
    }
    if (isString(node)) {
      node = doc.get(node);
    }
    
    if (node.isText()) {
      
      let annos = doc.getIndex('annotations').get(node.id);
      for (let i = 0; i < annos.length; i++) {
        doc.delete(annos[i].id);
      }
    }
    let nodeSchema = node.getSchema();
    
    
    
    
    for (let prop of nodeSchema) {
      if (prop.isText()) {
        let annos = doc.getAnnotations([node.id, prop.name]);
        for (let anno of annos) {
          deepDeleteNode(doc, anno);
        }
      }
    }
    doc.delete(node.id);
    
    
    
    for (let prop of nodeSchema) {
      if (prop.isOwned()) {
        let value = node[prop.name];
        if (prop.isArray()) {
          let ids = value;
          if (ids.length > 0) {
            
            if (isArray(ids[0])) ids = flattenOften(ids, 2);
            ids.forEach((id) => {
              deepDeleteNode(doc, doc.get(id));
            });
          }
        } else {
          deepDeleteNode(doc, doc.get(value));
        }
      }
    }
  }


  function copyNode (node) {
    let nodes = [];
    
    let doc = node.getDocument();
    let nodeSchema = node.getSchema();
    for (let prop of nodeSchema) {
      
      
      if ((prop.isReference() && prop.isOwned()) || (prop.type === 'file')) {
        let val = node[prop.name];
        nodes.push(_copyChildren(val));
      }
    }
    nodes.push(node.toJSON());
    let annotationIndex = node.getDocument().getIndex('annotations');
    let annotations = annotationIndex.get([node.id]);
    forEach(annotations, function (anno) {
      nodes.push(anno.toJSON());
    });
    let result = flatten$1(nodes).filter(Boolean);
    
    return result

    function _copyChildren (val) {
      if (!val) return null
      if (isArray(val)) {
        return flatten$1(val.map(_copyChildren))
      } else {
        let id = val;
        if (!id) return null
        let child = doc.get(id);
        if (!child) return
        return copyNode(child)
      }
    }
  }


  function deleteTextRange (doc, start, end) {
    if (!start) {
      start = {
        path: end.path,
        offset: 0
      };
    }
    let path = start.path;
    let text = doc.get(path);
    if (!end) {
      end = {
        path: start.path,
        offset: text.length
      };
    }
    
    if (!isArrayEqual(start.path, end.path)) {
      throw new Error('start and end must be on one property')
    }
    let startOffset = start.offset;
    if (startOffset < 0) throw new Error('start offset must be >= 0')
    let endOffset = end.offset;
    if (endOffset > text.length) throw new Error('end offset must be smaller than the text length')

    doc.update(path, { type: 'delete', start: startOffset, end: endOffset });
    
    let annos = doc.getAnnotations(path);
    annos.forEach(function (anno) {
      let annoStart = anno.start.offset;
      let annoEnd = anno.end.offset;
      
      if (annoEnd <= startOffset) ; else if (annoStart >= endOffset) {
        doc.update([anno.id, 'start'], { type: 'shift', value: startOffset - endOffset });
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset - endOffset });
      
      } else if (annoStart >= startOffset && annoEnd <= endOffset) {
        doc.delete(anno.id);
      
      } else if (annoStart >= startOffset && annoEnd >= endOffset) {
        if (annoStart > startOffset) {
          doc.update([anno.id, 'start'], { type: 'shift', value: startOffset - annoStart });
        }
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset - endOffset });
      
      } else if (annoStart <= startOffset && annoEnd <= endOffset) {
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset - annoEnd });
      
      } else if (annoStart < startOffset && annoEnd >= endOffset) {
        doc.update([anno.id, 'end'], { type: 'shift', value: startOffset - endOffset });
      } else {
        console.warn('TODO: handle annotation update case.');
      }
    });
  }

  function deleteListRange (doc, list, start, end, options = {}) {
    
    
    if (doc !== list.getDocument()) {
      list = doc.get(list.id);
    }
    let startItem, endItem;
    if (!start) {
      startItem = list.getItemAt(0);
      start = {
        path: startItem.getPath(),
        offset: 0
      };
    } else {
      startItem = doc.get(start.path[0]);
    }
    if (!end) {
      endItem = list.getLastItem();
      end = {
        path: endItem.getPath(),
        offset: endItem.getLength()
      };
    } else {
      endItem = doc.get(end.path[0]);
    }
    let startPos = list.getItemPosition(startItem);
    let endPos = list.getItemPosition(endItem);
    
    if (startPos === endPos) {
      deleteTextRange(doc, start, end);
      return
    }
    
    if (startPos > endPos) {
      [start, end] = [end, start];
      [startPos, endPos] = [endPos, startPos];
      [startItem, endItem] = [endItem, startItem];
    }
    let firstEntirelySelected = isEntirelySelected(doc, startItem, start, null);
    let lastEntirelySelected = isEntirelySelected(doc, endItem, null, end);

    
    if (lastEntirelySelected) {
      list.removeItemAt(endPos);
      deepDeleteNode(doc, endItem);
    } else {
      deleteTextRange(doc, null, end);
    }

    
    let items = list.getItems();
    for (let i = endPos - 1; i > startPos; i--) {
      let item = items[i];
      list.removeItemAt(i);
      deepDeleteNode(doc, item);
    }

    
    if (firstEntirelySelected) {
      
      
      
      
      if (options.deleteEmptyFirstItem) {
        list.removeItemAt(startPos);
        deepDeleteNode(doc, startItem);
      } else {
        deleteTextRange(doc, start, null);
      }
    } else {
      deleteTextRange(doc, start, null);
    }

    if (!firstEntirelySelected && !lastEntirelySelected) {
      mergeListItems(doc, list.id, startPos);
    }
  }

  function setText (doc, textPath, text) {
    const oldText = doc.get(textPath);
    if (oldText.length > 0) {
      deleteTextRange(doc, { path: textPath, offset: 0 });
    }
    doc.update(textPath, { type: 'insert', start: 0, text });
    return this
  }

  function mergeListItems (doc, listId, itemPos) {
    
    let list = doc.get(listId);
    let targetItem = list.getItemAt(itemPos);
    let targetPath = targetItem.getPath();
    let targetLength = targetItem.getLength();
    let sourceItem = list.getItemAt(itemPos + 1);
    let sourcePath = sourceItem.getPath();
    
    list.removeItemAt(itemPos + 1);
    
    doc.update(targetPath, { type: 'insert', start: targetLength, text: sourceItem.getText() });
    
    annotationHelpers.transferAnnotations(doc, sourcePath, 0, targetPath, targetLength);
    deepDeleteNode(doc, sourceItem);
  }


  const SNIPPET_ID = 'snippet';
  const TEXT_SNIPPET_ID = 'text-snippet';

  function insertAt (doc, containerPath, pos, id) {
    doc.update(containerPath, { type: 'insert', pos, value: id });
  }

  function append (doc, containerPath, id) {
    insertAt(doc, containerPath, doc.get(containerPath).length, id);
  }


  function removeAt (doc, containerPath, pos) {
    let op = doc.update(containerPath, { type: 'delete', pos });
    if (op && op.diff) {
      return op.diff.val
    }
  }

  function removeFromCollection (doc, containerPath, id) {
    let index = doc.get(containerPath).indexOf(id);
    if (index >= 0) {
      return removeAt(doc, containerPath, index)
    }
    return false
  }

  function getNodesForPath (doc, containerPath) {
    let ids = doc.get(containerPath);
    return getNodesForIds(doc, ids)
  }

  function getNodesForIds (doc, ids) {
    return ids.map(id => doc.get(id, 'strict'))
  }

  function getNodeAt (doc, containerPath, nodePos) {
    let ids = doc.get(containerPath);
    return doc.get(ids[nodePos])
  }

  function getPreviousNode (doc, containerPath, nodePos) {
    if (nodePos > 0) {
      return getNodeAt(doc, containerPath, nodePos - 1)
    }
  }

  function getNextNode (doc, containerPath, nodePos) {
    return getNodeAt(doc, containerPath, nodePos + 1)
  }



  function getChildren (node) {
    const doc = node.getDocument();
    const id = node.id;
    const schema = node.getSchema();
    let result = [];
    for (let p of schema) {
      const name = p.name;
      if (p.isText()) {
        let annos = doc.getAnnotations([id, name]);
        forEach(annos, a => result.push(a));
      } else if (p.isReference() && p.isOwned()) {
        let val = node[name];
        if (val) {
          if (p.isArray()) {
            result = result.concat(val.map(id => doc.get(id)));
          } else {
            result.push(doc.get(val));
          }
        }
      }
    }
    return result
  }

  function getParent (node) {
    
    if (node._isAnnotation) {
      let anno = node;
      let nodeId = anno.start.path[0];
      return anno.getDocument().get(nodeId)
    } else {
      return node.getParent()
    }
  }


  function createNodeFromJson (doc, data) {
    if (!data) throw new Error("'data' is mandatory")
    if (!data.type) throw new Error("'data.type' is mandatory")
    if (!isFunction(doc.create)) throw new Error('First argument must be document or tx')
    let type = data.type;
    let nodeSchema = doc.getSchema().getNodeSchema(type);
    let nodeData = {
      type,
      id: data.id
    };
    for (let p of nodeSchema) {
      const name = p.name;
      if (!data.hasOwnProperty(name)) continue
      let val = data[name];
      if (p.isReference()) {
        if (p.isArray()) {
          nodeData[name] = val.map(childData => createNodeFromJson(doc, childData).id);
        } else {
          let child = createNodeFromJson(doc, val);
          nodeData[name] = child.id;
        }
      } else {
        nodeData[p.name] = val;
      }
    }
    return doc.create(nodeData)
  }

  var documentHelpers = /*#__PURE__*/Object.freeze({
    getPropertyAnnotationsForSelection: getPropertyAnnotationsForSelection,
    getContainerAnnotationsForSelection: getContainerAnnotationsForSelection,
    isContainerAnnotation: isContainerAnnotation,
    getTextForSelection: getTextForSelection,
    getMarkersForSelection: getMarkersForSelection,
    deleteNode: deleteNode,
    deepDeleteNode: deepDeleteNode,
    copyNode: copyNode,
    deleteTextRange: deleteTextRange,
    deleteListRange: deleteListRange,
    setText: setText,
    mergeListItems: mergeListItems,
    SNIPPET_ID: SNIPPET_ID,
    TEXT_SNIPPET_ID: TEXT_SNIPPET_ID,
    insertAt: insertAt,
    append: append,
    removeAt: removeAt,
    removeFromCollection: removeFromCollection,
    getNodesForPath: getNodesForPath,
    getNodesForIds: getNodesForIds,
    getNodeAt: getNodeAt,
    getPreviousNode: getPreviousNode,
    getNextNode: getNextNode,
    getChildren: getChildren,
    getParent: getParent,
    createNodeFromJson: createNodeFromJson,
    compareCoordinates: compareCoordinates,
    isCoordinateBefore: isCoordinateBefore,
    getContainerRoot: getContainerRoot,
    getContainerPosition: getContainerPosition
  });

  function map$1 (iteratee, func) {
    if (!iteratee) return []
    if (!func) func = function (item) { return item };
    if (Array.isArray(iteratee)) {
      return iteratee.map(func)
    }
    if (iteratee instanceof Map) {
      let result = [];
      for (let [name, val] of iteratee) {
        result.push(func(val, name));
      }
      return result
    }
    if (iteratee instanceof Set) {
      let result = [];
      let idx = 0;
      iteratee.forEach(item => {
        result.push(func(item, idx++));
      });
      return result
    }
    return Object.keys(iteratee).map(function (key) {
      return func(iteratee[key], key)
    })
  }

  function deleteFromArray (array, value) {
    if (!array) return
    for (var i = 0; i < array.length; i++) {
      if (array[i] === value) {
        array.splice(i, 1);
        i--;
      }
    }
  }

  class TreeNode {}


  class TreeIndex {
    
    get (path) {
      if (arguments.length > 1) {
        path = Array.prototype.slice(arguments, 0);
      }
      path = _pathify(path);
      return get(this, path)
    }

    getAll (path) {
      if (arguments.length > 1) {
        path = Array.prototype.slice(arguments, 0);
      }
      path = _pathify(path);
      if (!isArray(path)) {
        throw new Error('Illegal argument for TreeIndex.get()')
      }
      let node = get(this, path);
      return this._collectValues(node)
    }

    set (path, value) {
      path = _pathify(path);
      setWith(this, path, value, function (val) {
        if (!val) return new TreeNode()
      });
    }

    delete (path) {
      path = _pathify(path);
      if (path.length === 1) {
        delete this[path[0]];
      } else {
        let key = path[path.length - 1];
        path = path.slice(0, -1);
        let parent = get(this, path);
        if (parent) {
          delete parent[key];
        }
      }
    }

    clear () {
      let root = this;
      for (let key in root) {
        if (root.hasOwnProperty(key)) {
          delete root[key];
        }
      }
    }

    traverse (fn) {
      this._traverse(this, [], fn);
    }

    forEach (...args) {
      this.traverse(...args);
    }

    _traverse (root, path, fn) {
      let id;
      for (id in root) {
        if (!root.hasOwnProperty(id)) continue
        let child = root[id];
        let childPath = path.concat([id]);
        if (child instanceof TreeNode) {
          this._traverse(child, childPath, fn);
        } else {
          fn(child, childPath);
        }
      }
    }

    _collectValues (root) {
      
      
      let vals = {};
      this._traverse(root, [], function (val, path) {
        let key = path[path.length - 1];
        vals[key] = val;
      });
      return vals
    }
  }

  function _pathify (path) {
    if (isString(path)) {
      return [path]
    } else {
      return path
    }
  }

  class TreeIndexArrays extends TreeIndex {
    contains (path) {
      let val = super.get(path);
      return Boolean(val)
    }

    get (path) {
      let val = super.get(path);
      if (val instanceof TreeNode) {
        val = val.__values__ || [];
      }
      return val
    }

    set (path, arr) {
      let val = super.get(path);
      val.__values__ = arr;
    }

    add (path, value) {
      path = _pathify(path);
      if (!isArray(path)) {
        throw new Error('Illegal arguments.')
      }
      let arr;

      
      
      
      
      
      
      setWith(this, path.concat(['__values__', '__dummy__']), undefined, function (val, key) {
        if (key === '__values__') {
          if (!val) val = [];
          arr = val;
        } else if (!val) {
          val = new TreeNode();
        }
        return val
      });
      delete arr.__dummy__;
      arr.push(value);
    }

    remove (path, value) {
      let arr = get(this, path);
      if (arr instanceof TreeNode) {
        if (arguments.length === 1) {
          delete arr.__values__;
        } else {
          deleteFromArray(arr.__values__, value);
        }
      }
    }

    _collectValues (root) {
      let vals = [];
      this._traverse(root, [], function (val) {
        vals.push(val);
      });
      vals = Array.prototype.concat.apply([], vals);
      return vals
    }
  }

  TreeIndex.Arrays = TreeIndexArrays;

  class AnnotationIndex extends DocumentIndex {
    constructor () {
      super();

      this.byPath = new TreeIndex();
      this.byType = new TreeIndex();
    }

    select (node) {
      return node.isPropertyAnnotation() || node.isInlineNode()
    }

    clear () {
      this.byPath.clear();
      this.byType.clear();
    }

    
    get (path, start, end, type) {
      var annotations;
      if (isString(path) || path.length === 1) {
        annotations = this.byPath.getAll(path) || {};
      } else {
        annotations = this.byPath.get(path);
      }
      annotations = map$1(annotations);
      if (isNumber(start)) {
        annotations = filter(annotations, AnnotationIndex.filterByRange(start, end));
      }
      if (type) {
        annotations = filter(annotations, DocumentIndex.filterByType(type));
      }
      return annotations
    }

    create (anno) {
      const path = anno.start.path;
      this.byType.set([anno.type, anno.id], anno);
      if (path && path.length > 0) {
        this.byPath.set(anno.start.path.concat([anno.id]), anno);
      }
    }

    delete (anno) {
      this._delete(anno.type, anno.id, anno.start.path);
    }

    _delete (type, id, path) {
      this.byType.delete([type, id]);
      if (path && path.length > 0) {
        this.byPath.delete(path.concat([id]));
      }
    }

    update (node, path, newValue, oldValue) {
      
      if (this.select(node) && path[1] === 'start' && path[2] === 'path') {
        this._delete(node.type, node.id, oldValue);
        this.create(node);
      }
    }
  }

  AnnotationIndex.filterByRange = function (start, end) {
    return function (anno) {
      var aStart = anno.start.offset;
      var aEnd = anno.end.offset;
      var overlap = (aEnd >= start);
      
      if (isNumber(end)) {
        overlap = overlap && (aStart <= end);
      }
      return overlap
    }
  };

  const OPEN = 1;
  const CLOSE = -1;
  const ANCHOR = -2;

  class Fragmenter {
    onText (context, text, fragment) {}

    onOpen (fragment, parentContext) { return {} }

    onClose (fragment, context, parentContext) {}

    start (rootContext, text, annotations) {
      if (!isString(text)) {
        throw new Error("Illegal argument: 'text' must be a String, but was " + text)
      }
      let state = this._init(rootContext, text, annotations);
      let B = state.boundaries;
      let S = state.stack;
      let TOP = () => S[S.length - 1];
      let currentPos = 0;
      let __runs = 0;
      let MAX_RUNS = B.length * 2;
      while (B.length > 0) {
        __runs++;
        if (__runs > MAX_RUNS) throw new Error('FIXME: infinity loop in Fragmenter implementation')
        let b = B.shift();
        let topContext = TOP().context;
        if (b.offset > currentPos) {
          let textFragment = text.slice(currentPos, b.offset);
          this.onText(topContext, textFragment);
          currentPos = b.offset;
        }
        switch (b.type) {
          case ANCHOR: {
            let parentContext = topContext;
            let anchorContext = this.onOpen(b, parentContext);
            this._close(b, anchorContext, parentContext);
            break
          }
          case CLOSE: {
            
            let { context, entry } = TOP();
            if (entry.node !== b.node) {
              B.unshift(b);
              this._fixOrderOfClosers(S, B, 0);
              
              continue
            }
            S.pop();
            let parentContext = TOP().context;
            this._close(b, context, parentContext);
            break
          }
          case OPEN: {
            let a = TOP().entry;
            if (!a || a.endOffset >= b.endOffset) {
              b.stackLevel = S.length;
              let context = this.onOpen(b, topContext);
              S.push({ context, entry: b });
            } else {
              
              if (b.weight <= a.weight) {
                b.stackLevel = S.length;
                
                let closer = {
                  type: CLOSE,
                  offset: a.endOffset,
                  node: b.node,
                  opener: b
                };
                
                let opener = {
                  type: OPEN,
                  offset: a.endOffset,
                  node: b.node,
                  fragmentCount: b.fragmentCount + 1,
                  endOffset: b.endOffset,
                  weight: b.weight,
                  
                  closer: b.closer
                };
                
                b.closer.opener = opener;
                
                b.closer = closer;
                b.endOffset = a.endOffset;
                this._insertBoundary(B, closer);
                this._insertBoundary(B, opener);
                let context = this.onOpen(b, topContext);
                S.push({ context, entry: b });
              
              } else {
                
                
                B.unshift(b);
                
                let closer = {
                  type: CLOSE,
                  offset: b.offset,
                  node: a.node,
                  opener: a
                };
                
                let opener = {
                  type: OPEN,
                  offset: b.offset,
                  node: a.node,
                  fragmentCount: a.fragmentCount + 1,
                  endOffset: a.endOffset,
                  weight: a.weight,
                  
                  closer: a.closer
                };
                
                a.closer.opener = opener;
                
                a.closer = closer;
                a.endOffset = b.offset;
                this._insertBoundary(B, closer);
                this._insertBoundary(B, opener);
                continue
              }
            }
            break
          }
          default:
            
        }
      }
      
      let trailingText = text.substring(currentPos);
      if (trailingText) {
        this.onText(rootContext, trailingText);
      }
    }

    _init (rootContext, text, annotations) {
      let boundaries = [];
      annotations.forEach(a => {
        if (a.isAnchor() || a.start.offset === a.end.offset) {
          boundaries.push({
            type: ANCHOR,
            offset: a.start.offset,
            endOffset: a.start.offset,
            length: 0,
            node: a
          });
        } else {
          let opener = {
            type: OPEN,
            offset: a.start.offset,
            node: a,
            fragmentCount: 0,
            endOffset: a.end.offset,
            weight: a._getFragmentWeight()
          };
          let closer = {
            type: CLOSE,
            offset: a.end.offset,
            node: a,
            opener
          };
          opener.closer = closer;
          boundaries.push(opener);
          boundaries.push(closer);
        }
      });
      boundaries.sort(this._compareBoundaries.bind(this));
      let state = {
        stack: [{context: rootContext, entry: null}],
        boundaries
      };
      return state
    }

    _close (fragment, context, parentContext) {
      if (fragment.type === CLOSE) {
        fragment = fragment.opener;
        fragment.length = fragment.endOffset - fragment.offset;
      }
      this.onClose(fragment, context, parentContext);
    }

    _compareBoundaries (a, b) {
      if (a.offset < b.offset) return -1
      if (a.offset > b.offset) return 1
      if (a.type < b.type) return -1
      if (a.type > b.type) return 1
      if (a.type === OPEN) {
        if (a.endOffset > b.endOffset) return -1
        if (a.endOffset < b.endOffset) return 1
        if (a.weight > b.weight) return -1
        if (a.weight < b.weight) return 1
        if (a.stackLevel && b.stackLevel) {
          return a.stackLevel - b.stackLevel
        }
        return 0
      } else if (a.type === CLOSE) {
        return -this._compareBoundaries(a.opener, b.opener)
      } else {
        return 0
      }
    }

    _insertBoundary (B, b, startIndex = 0) {
      for (let idx = startIndex, l = B.length; idx < l; idx++) {
        if (this._compareBoundaries(b, B[idx]) === -1) {
          B.splice(idx, 0, b);
          return idx
        }
      }
      
      B.push(b);
      return B.length - 1
    }

    
    
    _fixOrderOfClosers (S, B, startIndex) {
      let activeOpeners = {};
      let first = B[startIndex];
      let closers = [first];
      for (let idx = startIndex + 1, l = B.length; idx < l; idx++) {
        let b = B[startIndex + idx];
        if (b.type !== CLOSE || b.offset !== first.offset) break
        closers.push(b);
      }
      for (let idx = S.length - 1; idx >= 1; idx--) {
        let opener = S[idx].entry;
        activeOpeners[opener.node.id] = opener;
      }
      for (let idx = 0, l = closers.length; idx < l; idx++) {
        let closer = closers[idx];
        let opener = activeOpeners[closer.node.id];
        if (!opener) {
          throw new Error('Fragmenter Error: there is no opener for closer')
        }
        closer.opener = opener;
      }
      closers.sort(this._compareBoundaries.bind(this));

      const _checkClosers = () => {
        for (let idx = 0; idx < closers.length; idx++) {
          if (S[S.length - 1 - idx].entry.node !== closers[idx].node) return false
        }
        return true
      };
      console.assert(_checkClosers(), 'Fragmenter: closers should be alligned with the current stack of elements');

      B.splice(startIndex, closers.length, ...closers);
    }
  }



  Fragmenter.MUST_NOT_SPLIT = Number.MAX_VALUE;
  Fragmenter.SHOULD_NOT_SPLIT = 1000;
  Fragmenter.NORMAL = 100;
  Fragmenter.ALWAYS_ON_TOP = 0;

  function AnnotationMixin (DocumentNode) {
    class AbstractAnnotation extends DocumentNode {
      constructor (doc, props) {
        super(doc, _normalizedProps(props));

        
        this._properties.start = new Coordinate(this.start);
        this._properties.end = new Coordinate(this.end);
      }

      

      get path () {
        console.warn('DEPRECATED: use annotation.start.path instead');
        return this.start.path
      }

      getPath () {
        return this.start.path
      }

      get startPath () {
        console.warn('DEPRECATED: use annotation.start.path instead.');
        return this.start.path
      }

      set startPath (path) {
        console.warn('DEPRECATED: use annotation.start.path instead.');
        this.start.path = path;
      }

      get startOffset () {
        console.warn('DEPRECATED: use annotation.start.offset instead.');
        return this.start.offset
      }

      set startOffset (offset) {
        console.warn('DEPRECATED: use annotation.start.offset instead.');
        this.start.offset = offset;
      }

      get endPath () {
        console.warn('DEPRECATED: use annotation.end.path instead.');
        return this.end.path
      }

      set endPath (path) {
        console.warn('DEPRECATED: use annotation.end.path instead.');
        this.end.path = path;
      }

      get endOffset () {
        console.warn('DEPRECATED: use annotation.end.offset instead.');
        return this.end.offset
      }

      set endOffset (offset) {
        console.warn('DEPRECATED: use annotation.end.offset instead.');
        this.end.offset = offset;
      }

      

      
      getText () {
        var doc = this.getDocument();
        if (!doc) {
          console.warn('Trying to use a Annotation which is not attached to the document.');
          return ''
        }
        return getTextForSelection(doc, this.getSelection())
      }

      isAnnotation () {
        return true
      }

      
      canSplit () {
        return true
      }

      
      getSelection () {
        const doc = this.getDocument();
        
        if (!doc) {
          console.warn('Trying to use a ContainerAnnotation which is not attached to the document.');
          return Selection.nullSelection()
        }
        if (this.isContainerAnnotation()) {
          return doc.createSelection({
            type: 'container',
            containerPath: this.containerPath,
            startPath: this.start.path,
            startOffset: this.start.offset,
            endPath: this.end.path,
            endOffset: this.end.offset
          })
        } else {
          return this.getDocument().createSelection({
            type: 'property',
            path: this.start.path,
            startOffset: this.start.offset,
            endOffset: this.end.offset
          })
        }
      }

      _updateRange (tx, sel) {
        if (sel.isContainerSelection()) {
          
          if (!isEqual(this.start.path, sel.start.path)) {
            tx.set([this.id, 'start', 'path'], sel.start.path);
          }
          if (this.start.offset !== sel.start.offset) {
            tx.set([this.id, 'start', 'offset'], sel.start.offset);
          }
          if (!isEqual(this.end.path, sel.end.path)) {
            tx.set([this.id, 'end', 'path'], sel.end.path);
          }
          if (this.end.offset !== sel.end.offset) {
            tx.set([this.id, 'end', 'offset'], sel.end.offset);
          }
        } else if (sel.isPropertySelection()) {
          if (!isArrayEqual(this.start.path, sel.start.path)) {
            tx.set([this.id, 'path'], sel.start.path);
          }
          
          if (this.start.offset !== sel.start.offset) {
            tx.set([this.id, 'start', 'offset'], sel.start.offset);
          }
          if (this.end.offset !== sel.end.offset) {
            tx.set([this.id, 'end', 'offset'], sel.end.offset);
          }
        } else {
          throw new Error('Invalid selection.')
        }
      }

      mustNotBeSplit () { return false }

      shouldNotBeSplit () { return false }

      _getFragmentWeight () {
        if (this.mustNotBeSplit()) return Fragmenter.MUST_NOT_SPLIT
        if (this.shouldNotBeSplit()) return Fragmenter.SHOULD_NOT_SPLIT
        if (this.getFragmentWeight) return this.getFragmentWeight()
        return Fragmenter.NORMAL
      }

      static isAnnotation () { return true }
    }

    AbstractAnnotation.schema = {
      start: { type: 'coordinate', default: { path: [], offset: 0 } },
      end: { type: 'coordinate', default: { path: [], offset: 0 } }
    };

    return AbstractAnnotation
  }

  function _normalizedProps (props) {
    
    
    if (!props.hasOwnProperty('start')) {
      
      
      
      let start, end;
      if (props.hasOwnProperty('startPath') || props.hasOwnProperty('path')) {
        start = {
          path: props.startPath || props.path,
          offset: props.startOffset
        };
      }
      if (props.hasOwnProperty('endPath') || props.hasOwnProperty('endOffset')) {
        end = {
          path: props.endPath || props.path,
          offset: props.endOffset
        };
      }
      if (start && !end) {
        end = cloneDeep(start);
      }
      if (start) {
        props = Object.assign({}, props);
        delete props.path;
        delete props.startPath;
        delete props.endPath;
        delete props.startOffset;
        delete props.endOffset;
        props.start = start;
        props.end = end;
      }
    } else if (props.hasOwnProperty('end') && !props.end.path) {
      props.end.path = props.start.path;
    }
    return props
  }

  function series (tasks, cb, i) {
    i = i || 0;
    tasks[i](function (err, ...args) {
      
      if (err) return cb(err)
      if (i === tasks.length - 1) {
        cb(err, ...args); 
      } else {
        series(tasks, cb, i + 1);
      }
    });
  }

  var async = /*#__PURE__*/Object.freeze({
    series: series
  });

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function getColumnLabel (colIdx) {
    if (!isNumber(colIdx)) {
      throw new Error('Illegal argument.')
    }
    let label = '';
    while(true) { 
      let mod = colIdx % ALPHABET.length;
      colIdx = Math.floor(colIdx / ALPHABET.length);
      label = ALPHABET[mod] + label;
      if (colIdx > 0) colIdx--;
      else if (colIdx === 0) break
    }
    return label
  }

  function getRowCol (cellLabel) {
    var match = /^([A-Z]+)([1-9][0-9]*)$/.exec(cellLabel);
    return [
      parseInt(match[2], 10) - 1,
      getColumnIndex(match[1])
    ]
  }

  const A = 'A'.charCodeAt(0);
  const ALPHABET_LENGTH = ALPHABET.length;

  function getColumnIndex (colStr) {
    let index = 0;
    let rank = 0;
    for (let i = colStr.length - 1; i >= 0; i--) {
      let idx = colStr.charCodeAt(i) - A;
      if (idx < 0 || idx >= ALPHABET_LENGTH) throw new Error('Illegal column label: ' + colStr)
      
      index += Math.pow(ALPHABET_LENGTH, rank) * (idx + 1);
      rank++;
    }
    
    return index - 1
  }

  function getCellLabel (rowIdx, colIdx) {
    let colLabel = getColumnLabel(colIdx);
    let rowLabel = rowIdx + 1;
    return colLabel + rowLabel
  }

  function getIndexesFromRange (start, end) {
    let [startRow, startCol] = getRowCol(start);
    let endRow, endCol;
    if (end) {
      ([endRow, endCol] = getRowCol(end));
      if (startRow > endRow) ([startRow, endRow] = [endRow, startRow]);
      if (startCol > endCol) ([startCol, endCol] = [endCol, startCol]);
    } else {
      ([endRow, endCol] = [startRow, startCol]);
    }
    return { startRow, startCol, endRow, endCol }
  }

  function getRangeFromMatrix (cells, startRow, startCol, endRow, endCol, force2D) {
    if (!force2D) {
      if (startRow === endRow && startCol === endCol) {
        let row = cells[startRow];
        if (row) return row[startCol]
        else return undefined
      }
      if (startRow === endRow) {
        let row = cells[startRow];
        if (row) return row.slice(startCol, endCol + 1)
        else return []
      }
      if (startCol === endCol) {
        let res = [];
        for (let i = startRow; i <= endRow; i++) {
          let row = cells[i];
          if (row) res.push(row[startCol]);
        }
        return res
      }
    }
    let res = [];
    for (var i = startRow; i < endRow + 1; i++) {
      let row = cells[i];
      if (row) res.push(row.slice(startCol, endCol + 1));
    }
    return res
  }

  var tableHelpers = /*#__PURE__*/Object.freeze({
    ALPHABET: ALPHABET,
    getColumnLabel: getColumnLabel,
    getRowCol: getRowCol,
    getColumnIndex: getColumnIndex,
    getCellLabel: getCellLabel,
    getIndexesFromRange: getIndexesFromRange,
    getRangeFromMatrix: getRangeFromMatrix
  });

  function getKeyForPath (path) {
    if (path._key === undefined) {
      Object.defineProperty(path, '_key', {
        value: path.join('.'),
        writable: false,
        enumerable: false
      });
    }
    return path._key
  }

  class ArrayTree {
    add (path, val) {
      let key = this._getKey(path);
      if (!this[key]) {
        this[key] = [];
      }
      this[key].push(val);
    }
    remove (path, val) {
      let key = this._getKey(path);
      if (this[key]) {
        deleteFromArray(this[key], val);
      }
    }
    get (path) {
      let key = this._getKey(path);
      return this[key] || []
    }

    _getKey (path) {
      if (isString) {
        return path
      } else {
        return getKeyForPath(path)
      }
    }
  }

  function array2table (keys) {
    return keys.reduce((obj, key) => {
      obj[key] = true;
      return obj
    }, {})
  }

  function createCountingIdGenerator () {
    var counters = {};
    return function uuid (prefix) {
      if (!counters.hasOwnProperty(prefix)) {
        counters[prefix] = 1;
      }
      var result = [prefix, '-', counters[prefix]++].join('');
      return result
    }
  }

  function levenshtein (a, b) {
    let m = [];
    for (let i = 0; i <= b.length; i++) {
      m[i] = [i];
      if (i === 0) continue
      let ib = i - 1;
      for (let j = 0; j <= a.length; j++) {
        m[0][j] = j;
        if (j === 0) continue
        let jb = j - 1;
        m[i][j] = b.charAt(ib) === a.charAt(jb) ? m[ib][jb] : Math.min(
          m[ib][jb] + 1,
          m[i][jb] + 1,
          m[ib][j] + 1
        );
      }
    }
    return m
  }

  function diff (a, b, offset) {
    if (!isString(a) || !isString(b)) {
      throw new Error('Illegal arguments.')
    }
    offset = offset || 0;
    let changes = [];
    if (a || b) {
      if (!a && b) {
        changes.push({ type: 'insert', start: offset, text: b });
      } else if (a && !b) {
        changes.push({ type: 'delete', start: offset, end: offset + a.length });
      } else {
        let m = levenshtein(a, b);
        changes = _diff(a, b, m, offset);
      }
    }
    return changes
  }

  function _diff (a, b, m, offset) {
    let i = b.length;
    let j = a.length;
    let changes = [];
    let current;
    while (i > 0 && j > 0) {
      _next();
    }
    _commit();
    return changes

    function _next () {
      let d = m[i][j];
      let ib = i - 1;
      let jb = j - 1;
      
      if (m[ib][jb] < d) {
        if (current && current.type === 'replace') {
          current.start--;
          current.text.unshift(b.charAt(ib));
        } else {
          _commit();
          current = { type: 'replace', start: jb, end: j, text: [b.charAt(ib)] };
        }
        i--;
        j--;
      
      } else if (m[ib][j] < d) {
        if (current && current.type === 'insert') {
          current.start--;
          current.text.unshift(b.charAt(ib));
        } else {
          _commit();
          current = { type: 'insert', start: jb, text: [b.charAt(ib)] };
        }
        i--;
      
      } else if (m[i][jb] < d) {
        if (current && current.type === 'delete') {
          current.start--;
        } else {
          _commit();
          current = { type: 'delete', start: jb, end: j };
        }
        j--;
      
      } else {
        _commit();
        i--;
        j--;
      }
    }

    function _commit () {
      if (current) {
        switch (current.type) {
          case 'insert':
            current.start += offset;
            current.text = current.text.join('');
            break
          case 'delete':
            current.start += offset;
            current.end += offset;
            break
          case 'replace':
            current.start += offset;
            current.end += offset;
            current.text = current.text.join('');
            break
          default:
            throw new Error('Invalid state')
        }
        changes.push(current);
        current = null;
      }
    }
  }

  function encodeXMLEntities (str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  const DEBUG = false;
  let count = 0;
  const COUNT_MSG = '%s listeners registered in the whole system.';


  class EventEmitter {
    
    emit (event) {
      if (event in this.__events__) {
        
        
        var bindings = this.__events__[event].slice();
        var args = Array.prototype.slice.call(arguments, 1);
        for (var i = 0, len = bindings.length; i < len; i++) {
          var binding = bindings[i];
          
          binding.method.apply(binding.context, args);
        }
        return true
      }
      return false
    }

    
    on (event, method, context) {
      
      _on.call(this, event, method, context);
    }

    
    off (event, method, context) { 
      if (arguments.length === 1 && isObject(arguments[0])) {
        _disconnect.call(this, arguments[0]);
      } else {
        _off.apply(this, arguments);
      }
    }

    _debugEvents () {
      
      console.log('### EventEmitter: ', this);
      forEach(this.__events__, (handlers, name) => {
        console.log('- %s listeners for %s: ', handlers.length, name, handlers);
      });
      
    }

    get __events__ () {
      if (!this.___events___) {
        this.___events___ = {};
      }
      return this.___events___
    }
  }


  function _on (event, method, context) {
    
    var bindings;
    validateMethod(method, context);
    if (this.__events__.hasOwnProperty(event)) {
      bindings = this.__events__[event];
    } else {
      
      bindings = this.__events__[event] = [];
    }
    
    bindings.push({
      method: method,
      context: context || null
    });
    if (DEBUG) {
      count++;
      console.info('_on()', event, method.name, context, this);
      console.info(COUNT_MSG, count);
    }
    return this
    
  }


  function _off (event, method, context) {
    
    if (arguments.length === 0) {
      if (DEBUG) {
        forEach(this.__events__, (bindings) => {
          bindings.forEach((b) => {
            console.info('_off()', b.method.name, b.context, this);
          });
          count -= bindings.length;
        });
        console.info(COUNT_MSG, count);
      }
      this.___events___ = {};
      return this
    }
    if (arguments.length === 1) {
      
      if (DEBUG) {
        count -= (this.__events__[event] || []).length;
        console.info(COUNT_MSG, count);
      }
      delete this.__events__[event];
      return this
    }
    validateMethod(method, context);
    if (!(event in this.__events__) || !this.__events__[event].length) {
      if (DEBUG) console.info('NO MATCHING BINDINGS');
      
      return this
    }
    
    if (arguments.length < 3) {
      context = null;
    }
    
    let bindings = this.__events__[event];
    for (let i = bindings.length - 1; i >= 0; i--) {
      const b = bindings[i];
      if (b.method === method && b.context === context) {
        bindings.splice(i, 1);
        if (DEBUG) count--;
      }
    }
    
    if (bindings.length === 0) {
      delete this.__events__[event];
    }
    if (DEBUG) console.info(COUNT_MSG, count);
    return this
    
  }


  function _disconnect (context) {
    
    
    forEach(this.__events__, (bindings, event) => {
      for (let i = bindings.length - 1; i >= 0; i--) {
        
        
        if (bindings[i] && bindings[i].context === context) {
          _off.call(this, event, bindings[i].method, context);
        }
      }
    });
    return this
    
  }

  function validateMethod (method, context) {
    
    if (typeof method === 'string') {
      
      if (context === undefined || context === null) {
        throw new Error('Method name "' + method + '" has no context.')
      }
      if (!(method in context)) {
        
        
        throw new Error('Method not found: "' + method + '"')
      }
      if (typeof context[method] !== 'function') {
        
        
        throw new Error('Property "' + method + '" is not a function')
      }
    } else if (typeof method !== 'function') {
      throw new Error('Invalid callback. Function or method name expected.')
    }
  }

  function extend (...args) {
    return Object.assign(...args)
  }

  const PLAINOBJ = {};


  class DeprecatedRegistry {
    constructor (entries, validator) {
      this.entries = {};
      this.names = [];
      this.validator = validator;

      if (entries) {
        forEach(entries, function (entry, name) {
          this.add(name, entry);
        }.bind(this));
      }
    }

    
    contains (name) {
      return this.entries.hasOwnProperty(name)
    }

    
    add (name, entry) {
      if (this.validator) {
        this.validator(entry);
      }
      if (PLAINOBJ[name]) {
        throw new Error('Illegal key: "' + name + '" is a property of Object which is thus not allowed as a key.')
      }
      if (this.contains(name)) {
        this.remove(name);
      }
      this.entries[name] = entry;
      this.names.push(name);
    }

    
    remove (name) {
      let pos = this.names.indexOf(name);
      if (pos >= 0) {
        this.names.splice(pos, 1);
      }
      delete this.entries[name];
    }

    
    clear () {
      this.names = [];
      this.entries = {};
    }

    
    get (name, strict) {
      let result = this.entries[name];
      if (strict && !result) {
        throw new Error('No entry registered for name ' + name)
      }
      return result
    }

    
    forEach (callback) {
      for (let i = 0; i < this.names.length; i++) {
        let name = this.names[i];
        let _continue = callback(this.entries[name], name);
        if (_continue === false) {
          break
        }
      }
    }

    map (callback) {
      let result = [];
      this.forEach((entry, name) => {
        result.push(callback(entry, name));
      });
      return result
    }

    filter (callback) {
      let result = [];
      this.forEach(function (entry, name) {
        if (callback(entry, name)) {
          result.push(entry);
        }
      });
      return result
    }

    values () {
      return this.filter(() => { return true })
    }

    get _isRegistry () { return true }
  }

  class Factory extends DeprecatedRegistry {
    
    create (name) {
      var clazz = this.get(name);
      if (!clazz) {
        throw new Error('No class registered by that name: ' + name)
      }
      
      var args = Array.prototype.slice.call(arguments, 1);
      var obj = Object.create(clazz.prototype);
      clazz.apply(obj, args);
      return obj
    }
  }

  function getRangeFromMatrix$1 (cells, startRow, startCol, endRow, endCol, force2D) {
    if (!force2D) {
      if (startRow === endRow && startCol === endCol) {
        let row = cells[startCol];
        if (row) return row[endCol]
        else return undefined
      }
      if (startRow === endRow) {
        let row = cells[startRow];
        if (row) return row.slice(startCol, endCol + 1)
        else return []
      }
      if (startCol === endCol) {
        let res = [];
        for (let i = startRow; i <= endRow; i++) {
          let row = cells[i];
          if (row) res.push(row[startCol]);
        }
        return res
      }
    }
    let res = [];
    for (var i = startRow; i < endRow + 1; i++) {
      let row = cells[i];
      if (row) res.push(row.slice(startCol, endCol + 1));
    }
    return res
  }

  function getRelativeBoundingRect (els, containerEl) {
    let nativeCotainerEl;
    if (containerEl._isDOMElement) {
      nativeCotainerEl = containerEl.getNativeElement();
    } else {
      nativeCotainerEl = containerEl;
    }
    if (!isArray(els)) els = [els];
    let elRects = els.map((el) => {
      let nativeEl;
      if (el._isDOMElement) {
        nativeEl = el.getNativeElement();
      } else {
        nativeEl = el;
      }
      return _getBoundingOffsetsRect(nativeEl, nativeCotainerEl)
    });

    let elsRect = _getBoundingRect(elRects);
    let containerElRect = nativeCotainerEl.getBoundingClientRect();
    return {
      left: elsRect.left,
      top: elsRect.top,
      right: containerElRect.width - elsRect.left - elsRect.width,
      bottom: containerElRect.height - elsRect.top - elsRect.height,
      width: elsRect.width,
      height: elsRect.height
    }
  }


  function _getBoundingRect (rects) {
    var bounds = {
      left: Number.POSITIVE_INFINITY,
      top: Number.POSITIVE_INFINITY,
      right: Number.NEGATIVE_INFINITY,
      bottom: Number.NEGATIVE_INFINITY,
      width: Number.NaN,
      height: Number.NaN
    };

    forEach(rects, function (rect) {
      if (rect.left < bounds.left) {
        bounds.left = rect.left;
      }
      if (rect.top < bounds.top) {
        bounds.top = rect.top;
      }
      if (rect.left + rect.width > bounds.right) {
        bounds.right = rect.left + rect.width;
      }
      if (rect.top + rect.height > bounds.bottom) {
        bounds.bottom = rect.top + rect.height;
      }
    });
    bounds.width = bounds.right - bounds.left;
    bounds.height = bounds.bottom - bounds.top;
    return bounds
  }


  function _getBoundingOffsetsRect (el, relativeParentEl) {
    var relativeParentElRect = relativeParentEl.getBoundingClientRect();
    var elRect = _getBoundingRect(el.getClientRects());

    var left = elRect.left - relativeParentElRect.left;
    var top = elRect.top - relativeParentElRect.top;
    return {
      left: left,
      top: top,
      right: relativeParentElRect.width - left - elRect.width,
      bottom: relativeParentElRect.height - top - elRect.height,
      width: elRect.width,
      height: elRect.height
    }
  }

  function getRelativeMouseBounds (mouseEvent, containerEl) {
    let containerElRect = containerEl.getBoundingClientRect();
    let left = mouseEvent.clientX - containerElRect.left;
    let top = mouseEvent.clientY - containerElRect.top;
    let res = {
      left: left,
      right: containerElRect.width - left,
      top: top,
      bottom: containerElRect.height - top
    };
    return res
  }

  function includes (arr, val) {
    if (!arr) return false
    return (arr.indexOf(val) >= 0)
  }

  function isBoolean (val) {
    return (val === true || val === false || (val && val.constructor === Boolean))
  }

  let keys$1 = {
    UNDEFINED: 0,
    BACKSPACE: 8,
    DELETE: 46,
    INSERT: 45,
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    ENTER: 13,
    RETURN: 13,
    END: 35,
    HOME: 36,
    TAB: 9,
    PAGEUP: 33,
    PAGEDOWN: 34,
    ESCAPE: 27,
    ESC: 27,
    SHIFT: 16,
    SPACE: 32,
    PLUS: 171,
    VOLUMEUP: 183,
    VOLUMEDOWN: 182,
    VOLUMEMUTE: 181,
    PRINTSCREEN: 44
  };


  for (let i = 1; i <= 24; i++) {
    keys$1['F' + i] = 111 + i;
  }

  function merge$1 (a, b, options) {
    options = options || {};
    var _with = null;
    if (options.array === 'replace') {
      _with = _replaceArrays;
    } else if (options.array === 'concat') {
      _with = _concatArrays;
    }
    if (_with) {
      return mergeWith(a, b, _with)
    } else {
      return merge(a, b)
    }
  }

  function _concatArrays (objValue, srcValue) {
    if (isArray(objValue)) {
      return objValue.concat(srcValue)
    } else {
      return null
    }
  }

  function _replaceArrays (objValue, srcValue) {
    if (isArray(objValue)) {
      return srcValue
    } else {
      return null
    }
  }

  function parseKeyCombo (combo) {
    let frags = combo.split('+');
    let keyEvent = {
      keyCode: -1
    };
    for (var i = 0; i < frags.length; i++) {
      let frag = frags[i].toUpperCase();
      switch (frag) {
        case 'ALT': {
          keyEvent.altKey = true;
          break
        }
        case 'ALTGR': {
          keyEvent.altKey = true;
          keyEvent.code = 'AltRight';
          break
        }
        case 'CMD': {
          keyEvent.metaKey = true;
          break
        }
        case 'CTRL': {
          keyEvent.ctrlKey = true;
          break
        }
        case 'COMMANDORCONTROL': {
          if (platform.isMac) {
            keyEvent.metaKey = true;
          } else {
            keyEvent.ctrlKey = true;
          }
          break
        }
        case 'MEDIANEXTTRACK': {
          keyEvent.code = 'MediaTrackNext';
          break
        }
        case 'MEDIAPLAYPAUSE': {
          keyEvent.code = 'MediaPlayPause';
          break
        }
        case 'MEDIAPREVIOUSTRACK': {
          keyEvent.code = 'MediaPreviousTrack';
          break
        }
        case 'MEDIASTOP': {
          keyEvent.code = 'MediaStop';
          break
        }
        case 'SHIFT': {
          keyEvent.shiftKey = true;
          break
        }
        case 'SUPER': {
          keyEvent.metaKey = true;
          break
        }
        default:
          if (frag.length === 1) {
            keyEvent.keyCode = frag.charCodeAt(0);
          } else if (keys$1.hasOwnProperty(frag)) {
            keyEvent.keyCode = keys$1[frag];
          } else {
            throw new Error('Unsupported keyboard command: ' + combo)
          }
      }
    }
    return keyEvent
  }

  function parseKeyEvent (event, onlyModifiers) {
    let frags = [];
    if (event.altKey) {
      if (event.code === 'AltRight') {
        frags.push('ALTGR');
      } else {
        frags.push('ALT');
      }
    }
    if (event.ctrlKey) frags.push('CTRL');
    if (event.metaKey) frags.push('META');
    if (event.shiftKey) frags.push('SHIFT');
    if (!onlyModifiers) {
      frags.push(event.keyCode);
    }
    return frags.join('+')
  }

  function percentage (ratio) {
    return String(Math.floor(ratio * 100 * 100) / 100) + ' %'
  }

  function pluck (collection, prop) {
    return map$1(collection, function (item) { return item[prop] })
  }

  function printStacktrace () {
    try {
      throw new Error()
    } catch (err) {
      console.error(err.stack);
    }
  }

  function request (method, url, data, cb) {
    var request = new XMLHttpRequest();
    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        var res = request.responseText;
        if (isJson(res)) res = JSON.parse(res);
        cb(null, res);
      } else {
        return cb(new Error('Request failed. Returned status: ' + request.status))
      }
    };

    if (data) {
      request.send(JSON.stringify(data));
    } else {
      request.send();
    }
  }

  function isJson (str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false
    }
    return true
  }

  function renderListNode (listNode, $$) {
    let items = listNode.getItems();
    let stack = [$$(_getTagName(1))];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      const level = item.getLevel();
      if (level < stack.length) {
        for (let j = stack.length; j > level; j--) {
          stack.pop();
        }
      } else if (level > stack.length) {
        for (let j = stack.length; j < level; j++) {
          let list = stack[j - 1];
          let childCount = list.getChildCount();
          let item;
          if (childCount === 0) {
            item = $$('li');
            list.append(item);
          } else {
            item = list.getChildAt(childCount - 1);
          }
          let sublist = $$(_getTagName(j + 1));
          item.append(sublist);
          stack.push(sublist);
        }
      }
      console.assert(level === stack.length, 'item.level should now be the same as stack.length');
      
      last(stack).append(
        $$(item)
      );
    }
    for (let j = stack.length; j > 1; j--) {
      stack.pop();
    }

    return stack[0]

    function _getTagName (level) {
      let listType = listNode.getListType(level);
      return listType === 'order' ? 'ol' : 'ul'
    }
  }

  function sendRequest (params, cb) {
    return new Promise(function (resolve, reject) {
      var method = (params.method || 'GET').toUpperCase();
      var url = params.url;
      if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) < 0) {
        throw new Error("Parameter 'method' must be 'GET', 'POST', 'PUT', or 'DELETE'.")
      }
      if (!url) {
        throw new Error("Parameter 'url' is required.")
      }
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        
        
        if (xmlhttp.readyState === 4) return _done()
      };
      xmlhttp.open(method, url, true);
      if (params.header) {
        forEach(params.header, function (val, key) {
          xmlhttp.setRequestHeader(key, val);
        });
      }
      if (params.data instanceof FormData) { 
        xmlhttp.send(params.data);
      } else if (params.data) {
        xmlhttp.send(JSON.stringify(params.data));
      } else {
        xmlhttp.send();
      }

      function _done () {
        if (xmlhttp.status === 200) {
          var response = xmlhttp.responseText;
          if (cb) cb(null, response);
          resolve(response);
        } else {
          console.error(xmlhttp.statusText);
          let err = new Error(xmlhttp.statusText);
          if (cb) cb(err);
          reject(err);
        }
      }
    })
  }

  function startsWith (str, prefix) {
    if (!isString(str)) return false
    if (str.startsWith) return str.startsWith(prefix)
    if (!isString(prefix)) prefix = String(prefix);
    return str.slice(0, prefix.length) === prefix
  }

  class SubstanceError extends Error {
    constructor (name, options) {
      super(name, options);
      this.name = name;
      this.message = options.message;
      this.info = options.info;
      this.errorCode = options.errorCode;
      this.cause = options.cause;

      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, (SubstanceError));
      }
    }

    inspect () {
      var parts = [];

      
      parts.push(this.stack);

      
      if (this.info) {
        parts.push(this.info + '. ');
      }

      
      if (this.cause) {
        parts.push('\nCaused by: ');

        if (this.cause.inspect) {
          
          parts.push(this.cause.inspect());
        } else {
          
          parts.push(this.cause.toString());
        }
      }
      return parts.join('')
    }
  }

  SubstanceError.fromJSON = function (err) {
    if (!err) return null
    var error = new SubstanceError(err.name, {
      message: err.message,
      info: err.info,
      errorCode: err.errorCode,
      cause: SubstanceError.fromJSON(err.cause)
    });
    return error
  };

  function times$2 (num, fn, ctx) {
    for (let i = 0; i < num; i++) {
      fn.call(ctx);
    }
  }

  function toUnixLineEndings (str) {
    return str.replace(/\r?\n/g, '\n')
  }

  function getDOMRangeFromEvent (evt) {
    let range;
    let x = evt.clientX;
    let y = evt.clientY;
    
    if (document.body.createTextRange) {
      range = document.body.createTextRange();
      range.moveToPoint(x, y);
    } else if (!isNil(document.createRange)) {
      
      
      if (!isNil(evt.rangeParent)) {
        range = document.createRange();
        range.setStart(evt.rangeParent, evt.rangeOffset);
        range.collapse(true);
      
      } else if (document.caretPositionFromPoint) {
        let pos = document.caretPositionFromPoint(x, y);
        range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
      
      } else if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(x, y);
      }
    }
    return range
  }

  function getRelativeRect (parentRect, childRect) {
    var left = childRect.left - parentRect.left;
    var top = childRect.top - parentRect.top;
    return {
      left: left,
      top: top,
      right: parentRect.width - left - childRect.width,
      bottom: parentRect.height - top - childRect.height,
      width: childRect.width,
      height: childRect.height
    }
  }

  function getSelectionRect (parentRect) {
    if (platform.inBrowser) {
      const wsel = window.getSelection();
      if (wsel.rangeCount === 0) return
      const wrange = wsel.getRangeAt(0);
      let contentRect = parentRect;
      let selectionRect = wrange.getBoundingClientRect();

      if (selectionRect.top === 0 && selectionRect.bottom === 0) {
        let fixed = _fixCorruptDOMSelection(wsel, wrange);
        if (fixed) selectionRect = fixed;
      }
      return getRelativeRect(contentRect, selectionRect)
    }
  }


  function _fixCorruptDOMSelection (wsel, wrange) {
    let anchorNode = wsel.anchorNode;
    if (!anchorNode || !anchorNode.getBoundingClientRect) return
    let rect = anchorNode.getBoundingClientRect();
    return {
      left: rect.left,
      top: rect.top,
      width: 0,
      height: rect.height,
      right: rect.width,
      bottom: rect.bottom
    }
  }

  function isMouseInsideDOMSelection (event) {
    let wsel = window.getSelection();
    if (wsel.rangeCount === 0) {
      return false
    }
    let wrange = wsel.getRangeAt(0);
    let selectionRect = wrange.getBoundingClientRect();
    return event.clientX >= selectionRect.left &&
           event.clientX <= selectionRect.right &&
           event.clientY >= selectionRect.top &&
           event.clientY <= selectionRect.bottom
  }

  function getQueryStringParam (param, url) {
    if (typeof window === 'undefined') return null
    let href = url || window.location.href;
    let reg = new RegExp('[?&]' + param + '=([^&#]*)', 'i');
    let string = reg.exec(href);
    return string ? decodeURIComponent(string[1]) : null
  }

  function setDOMSelection (startNode, startOffset, endNode, endOffset) {
    let wsel = window.getSelection();
    let wrange = window.document.createRange();
    if (startNode._isDOMElement) {
      startNode = startNode.getNativeElement();
    }
    if (!endNode) {
      endNode = startNode;
      endOffset = startOffset;
    }
    if (endNode._isDOMElement) {
      endNode = endNode.getNativeElement();
    }
    wrange.setStart(startNode, startOffset);
    wrange.setEnd(endNode, endOffset);
    wsel.removeAllRanges();
    wsel.addRange(wrange);
  }

  function copySelection (doc, selection) {
    if (!selection) throw new Error("'selection' is mandatory.")
    let copy = null;
    if (!selection.isNull() && !selection.isCollapsed()) {
      
      if (selection.isPropertySelection()) {
        copy = _copyPropertySelection(doc, selection);
      } else if (selection.isContainerSelection()) {
        copy = _copyContainerSelection(doc, selection);
      } else if (selection.isNodeSelection()) {
        copy = _copyNodeSelection(doc, selection);
      } else {
        console.error('Copy is not yet supported for selection type.');
      }
    }
    return copy
  }

  function _copyPropertySelection (doc, selection) {
    let path = selection.start.path;
    let offset = selection.start.offset;
    let endOffset = selection.end.offset;
    let text = doc.get(path);
    let snippet = doc.createSnippet();
    let containerNode = snippet.getContainer();
    snippet.create({
      type: doc.schema.getDefaultTextType(),
      id: TEXT_SNIPPET_ID,
      content: text.substring(offset, endOffset)
    });
    containerNode.append(TEXT_SNIPPET_ID);
    let annotations = doc.getIndex('annotations').get(path, offset, endOffset);
    forEach(annotations, function (anno) {
      let data = cloneDeep(anno.toJSON());
      let path = [TEXT_SNIPPET_ID, 'content'];
      data.start = {
        path: path,
        offset: Math.max(offset, anno.start.offset) - offset
      };
      data.end = {
        path: path,
        offset: Math.min(endOffset, anno.end.offset) - offset
      };
      snippet.create(data);
    });
    return snippet
  }

  function _copyContainerSelection (tx, sel) {
    let containerPath = sel.containerPath;

    let snippet = tx.createSnippet();
    let targetContainer = snippet.getContainer();
    let targetContainerPath = targetContainer.getContentPath();

    let nodeIds = getNodeIdsCoveredByContainerSelection(tx, sel);
    let L = nodeIds.length;
    if (L === 0) return snippet

    let start = sel.start;
    let end = sel.end;

    let skippedFirst = false;
    let skippedLast = false;

    
    let created = {};
    for (let i = 0; i < L; i++) {
      let id = nodeIds[i];
      let node = tx.get(id);
      
      if (i === 0 && isLast(tx, containerPath, start)) {
        skippedFirst = true;
        continue
      }
      if (i === L - 1 && isFirst(tx, containerPath, end)) {
        skippedLast = true;
        continue
      }
      if (!created[id]) {
        copyNode(node).forEach((nodeData) => {
          let copy = snippet.create(nodeData);
          created[copy.id] = true;
        });
        append(snippet, targetContainerPath, id);
      }
    }
    if (!skippedFirst) {
      
      let startNode = getContainerRoot(snippet, targetContainerPath, start.getNodeId());
      if (startNode.isText()) {
        deleteTextRange(snippet, null, start);
      } else if (startNode.isList()) {
        deleteListRange(snippet, startNode, null, start, { deleteEmptyFirstItem: true });
      }
    }
    if (!skippedLast) {
      
      let endNode = getContainerRoot(snippet, targetContainerPath, end.getNodeId());
      if (endNode.isText()) {
        deleteTextRange(snippet, end, null);
      } else if (endNode.isList()) {
        deleteListRange(snippet, endNode, end, null);
      }
    }
    return snippet
  }

  function _copyNodeSelection (doc, selection) {
    let snippet = doc.createSnippet();
    let targetNode = snippet.getContainer();
    let targetPath = targetNode.getContentPath();
    let nodeId = selection.getNodeId();
    let node = doc.get(nodeId);
    copyNode(node).forEach((nodeData) => {
      snippet.create(nodeData);
    });
    append(snippet, targetPath, node.id);
    return snippet
  }

  function _transferWithDisambiguatedIds (sourceDoc, targetDoc, id, visited) {
    if (visited[id]) throw new Error('FIXME: dont call me twice')
    visited[id] = id;
    const node = sourceDoc.get(id, 'strict');
    const nodeData = node.toJSON();
    let oldId = id;
    let newId;
    if (targetDoc.contains(id)) {
      
      newId = uuid(node.type);
      nodeData.id = newId;
    }
    const annotationIndex = sourceDoc.getIndex('annotations');
    const nodeSchema = node.getSchema();
    
    let annos = [];
    
    
    
    for (let prop of nodeSchema) {
      const name = prop.name;
      if (name === 'id' || name === 'type') continue
      
      if ((prop.isReference() && prop.isOwned()) || (prop.type === 'file')) {
        
        
        if (prop.isArray()) {
          let ids = nodeData[name];
          nodeData[name] = _transferArrayOfReferences(sourceDoc, targetDoc, ids, visited);
        } else {
          let id = nodeData[name];
          if (!visited[id]) {
            nodeData[name] = _transferWithDisambiguatedIds(sourceDoc, targetDoc, id, visited);
          }
        }
      
      } else if (prop.isText()) {
        
        
        
        
        
        let _annos = annotationIndex.get([oldId, prop.name]);
        
        for (let i = 0; i < _annos.length; i++) {
          let anno = _annos[i];
          if (anno.start.path[0] === oldId && newId) {
            anno.start.path[0] = newId;
          }
          if (anno.end.path[0] === oldId && newId) {
            anno.end.path[0] = newId;
          }
          annos.push(anno);
        }
      }
    }
    targetDoc.create(nodeData);
    for (let i = 0; i < annos.length; i++) {
      _transferWithDisambiguatedIds(sourceDoc, targetDoc, annos[i].id, visited);
    }
    return nodeData.id
  }

  function _transferArrayOfReferences (sourceDoc, targetDoc, arr, visited) {
    let result = arr.slice(0);
    for (let i = 0; i < arr.length; i++) {
      let val = arr[i];
      
      if (isArray(val)) {
        result[i] = _transferArrayOfReferences(sourceDoc, targetDoc, val, visited);
      } else {
        let id = val;
        if (id && !visited[id]) {
          result[i] = _transferWithDisambiguatedIds(sourceDoc, targetDoc, id, visited);
        }
      }
    }
    return result
  }

  function paste (tx, args) {
    let sel = tx.selection;
    if (!sel || sel.isNull()) {
      throw new Error('Can not paste without selection.')
    }
    if (sel.isCustomSelection()) {
      throw new Error('Paste not implemented for custom selection.')
    }
    args = args || {};
    args.text = args.text || '';
    let pasteDoc = args.doc;
    
    let inContainer = Boolean(sel.containerPath);
    
    if (!sel.isCollapsed()) {
      tx.deleteSelection();
    }
    
    if (!pasteDoc) {
      
      if (!inContainer) {
        tx.insertText(args.text);
        return
      
      
      } else {
        pasteDoc = _convertPlainTextToDocument(tx, args);
      }
    }
    
    let snippet = pasteDoc.get(SNIPPET_ID);
    let L = snippet.getLength();
    if (L === 0) return
    let first = snippet.getNodeAt(0);
    
    if (!inContainer) {
      
      
      if (L === 1) {
        if (first.isText()) {
          _pasteAnnotatedText(tx, pasteDoc);
        }
      } else {
        pasteDoc = _convertIntoAnnotatedText(tx, pasteDoc);
        _pasteAnnotatedText(tx, pasteDoc);
      }
    } else {
      if (first.isText()) {
        _pasteAnnotatedText(tx, pasteDoc);
        
        
        
        snippet.removeAt(0);
        L--;
      }
      
      if (L > 0) {
        _pasteDocument(tx, pasteDoc);
      }
    }
    return args
  }


  function _convertPlainTextToDocument (tx, args) {
    let lines = args.text.split(/\s*\n\s*\n/);
    let pasteDoc = tx.getDocument().newInstance();
    let defaultTextType = pasteDoc.getSchema().getDefaultTextType();
    let container = pasteDoc.create({
      type: '@container',
      id: SNIPPET_ID,
      nodes: []
    });
    let node;
    if (lines.length === 1) {
      node = pasteDoc.create({
        id: TEXT_SNIPPET_ID,
        type: defaultTextType,
        content: lines[0]
      });
      container.append(node.id);
    } else {
      for (let i = 0; i < lines.length; i++) {
        node = pasteDoc.create({
          id: uuid(defaultTextType),
          type: defaultTextType,
          content: lines[i]
        });
        container.append(node.id);
      }
    }
    return pasteDoc
  }

  function _convertIntoAnnotatedText (tx, copy) {
    let sel = tx.selection;
    let path = sel.start.path;
    let snippet = tx.createSnippet();
    let defaultTextType = snippet.getSchema().getDefaultTextType();

    
    let container = copy.get('snippet');
    let nodeIds = container.getContent();
    
    let fragments = [];
    let offset = 0;
    let annos = [];
    for (let nodeId of nodeIds) {
      let node = copy.get(nodeId);
      if (node.isText()) {
        let text = node.getText();
        if (fragments.length > 0) {
          fragments.push(' ');
          offset += 1;
        }
        
        let _annos = map$1(node.getAnnotations(), anno => {
          let data = anno.toJSON();
          data.start.path = path.slice(0);
          data.start.offset += offset;
          data.end.offset += offset;
          return data
        });
        fragments.push(text);
        annos = annos.concat(_annos);
        offset += text.length;
      }
    }
    snippet.create({
      id: TEXT_SNIPPET_ID,
      type: defaultTextType,
      content: fragments.join('')
    });
    annos.forEach(anno => snippet.create(anno));
    snippet.getContainer().append(TEXT_SNIPPET_ID);
    return snippet
  }

  function _pasteAnnotatedText (tx, copy) {
    let sel = tx.selection;
    const nodes = copy.get(SNIPPET_ID).nodes;
    const firstId = nodes[0];
    const first = copy.get(firstId);
    const textPath = first.getPath();
    const text = copy.get(textPath);
    const annotations = copy.getIndex('annotations').get(textPath);
    
    let path = sel.start.path;
    let offset = sel.start.offset;
    tx.insertText(text);
    let targetProp = tx.getProperty(path);
    if (targetProp.isText()) {
      
      let annos = map$1(annotations);
      
      let allowedTypes = targetProp.targetTypes;
      if (allowedTypes && allowedTypes.size > 0) {
        annos = annos.filter(anno => allowedTypes.has(anno.type));
      }
      for (let anno of annos) {
        let data = anno.toJSON();
        data.start.path = path.slice(0);
        data.start.offset += offset;
        data.end.offset += offset;
        
        if (tx.get(data.id)) data.id = uuid(data.type);
        tx.create(data);
      }
    }
  }

  function _pasteDocument (tx, pasteDoc) {
    let snippet = pasteDoc.get(SNIPPET_ID);
    if (snippet.getLength() === 0) return

    let sel = tx.selection;
    let containerPath = sel.containerPath;
    let insertPos;
    
    
    
    
    if (sel.isPropertySelection()) {
      let startPath = sel.start.path;
      let node = getContainerRoot(tx, containerPath, sel.start.getNodeId());
      
      
      
      if (node.isText()) {
        let startPos = node.getPosition();
        let text = tx.get(startPath);
        if (text.length === 0) {
          insertPos = startPos;
          removeAt(tx, containerPath, insertPos);
          deepDeleteNode(tx, tx.get(node.id));
        } else if (text.length === sel.start.offset) {
          insertPos = startPos + 1;
        } else {
          tx.break();
          insertPos = startPos + 1;
        }
      
      
      
      
      
      } else if (node.isList()) {
        let list = node;
        let listItem = tx.get(sel.start.getNodeId());
        let first = snippet.getNodeAt(0);
        if (first.isList()) {
          if (first.getLength() > 0) {
            let itemPos = listItem.getPosition();
            if (listItem.getLength() === 0) {
              
              removeAt(tx, list.getItemsPath(), itemPos);
              deepDeleteNode(tx, listItem);
              _pasteListItems(tx, list, first, itemPos);
            } else if (sel.start.offset === 0) {
              
              _pasteListItems(tx, list, first, itemPos);
            } else if (sel.start.offset >= listItem.getLength()) {
              
              _pasteListItems(tx, list, first, itemPos + 1);
            } else {
              tx.break();
              _pasteListItems(tx, list, first, itemPos + 1);
            }
            
            
            if (snippet.getLength() > 1) {
              _breakListApart(tx, containerPath, list);
            }
          }
          
          snippet.removeAt(0);
          insertPos = list.getPosition() + 1;
        } else {
          
          if (list.getLength() === 1 && listItem.getLength() === 0) {
            insertPos = list.getPosition();
            removeAt(tx, containerPath, insertPos);
            deepDeleteNode(tx, list);
          
          } else if (listItem.getPosition() === 0 && sel.start.offset === 0) {
            insertPos = list.getPosition();
          
          } else if (listItem.getPosition() === list.getLength() - 1 && sel.end.offset >= listItem.getLength()) {
            insertPos = list.getPosition() + 1;
          
          } else {
            insertPos = list.getPosition() + 1;
            _breakListApart(tx, containerPath, list);
          }
        }
      }
    } else if (sel.isNodeSelection()) {
      let nodePos = getContainerPosition(tx, containerPath, sel.getNodeId());
      if (sel.isBefore()) {
        insertPos = nodePos;
      } else if (sel.isAfter()) {
        insertPos = nodePos + 1;
      } else {
        throw new Error('Illegal state: the selection should be collapsed.')
      }
    }

    _pasteContainerNodes(tx, pasteDoc, containerPath, insertPos);
  }

  function _pasteContainerNodes (tx, pasteDoc, containerPath, insertPos) {
    
    let nodeIds = pasteDoc.get(SNIPPET_ID).nodes;
    let insertedNodes = [];
    let visited = {};
    let nodes = nodeIds.map(id => pasteDoc.get(id));

    
    let containerProperty = tx.getProperty(containerPath);
    let targetTypes = containerProperty.targetTypes;
    
    if (targetTypes && targetTypes.size > 0) {
      nodes = nodes.filter(node => targetTypes.has(node.type));
    }
    for (let node of nodes) {
      
      
      
      
      let newId = _transferWithDisambiguatedIds(node.getDocument(), tx, node.id, visited);
      
      node = tx.get(newId);
      insertAt(tx, containerPath, insertPos++, newId);
      insertedNodes.push(node);
    }

    if (insertedNodes.length > 0) {
      let lastNode = last(insertedNodes);
      setCursor(tx, lastNode, containerPath, 'after');
    }
  }

  function _pasteListItems (tx, list, otherList, insertPos) {
    let sel = tx.getSelection();
    let items = otherList.resolve('items');
    let visited = {};
    let lastItem;
    for (let item of items) {
      let newId = _transferWithDisambiguatedIds(item.getDocument(), tx, item.id, visited);
      insertAt(tx, list.getItemsPath(), insertPos++, newId);
      lastItem = tx.get(newId);
    }
    tx.setSelection({
      type: 'property',
      path: lastItem.getPath(),
      startOffset: lastItem.getLength(),
      surfaceId: sel.surfaceId,
      containerPath: sel.containerPath
    });
  }

  function _breakListApart (tx, containerPath, list) {
    
    let nodePos = list.getPosition();
    
    let oldSel = tx.selection;
    tx.break();
    let listItem = tx.get(tx.selection.start.getNodeId());
    
    
    if (listItem.getLength() > 0) {
      tx.setSelection(oldSel);
      tx.break();
    }
    console.assert(tx.get(tx.selection.start.getNodeId()).getLength() === 0, 'at this point the current list-item should be empty');
    
    
    
    tx.break();
    let p = removeAt(tx, containerPath, nodePos + 1);
    deepDeleteNode(tx, p);
  }

  class Editing {
    
    annotate (tx, annotation) {
      let sel = tx.selection;
      let schema = tx.getSchema();
      let AnnotationClass = schema.getNodeClass(annotation.type);
      if (!AnnotationClass) throw new Error('Unknown annotation type', annotation)
      let start = sel.start;
      let end = sel.end;
      let containerPath = sel.containerPath;
      let nodeData = { start, end, containerPath };
      
      
      if (sel.isPropertySelection()) {
        if (!AnnotationClass.isAnnotation()) {
          throw new Error('Annotation can not be created for a selection.')
        }
      } else if (sel.isContainerSelection()) {
        if (AnnotationClass.isPropertyAnnotation()) {
          console.warn('NOT SUPPORTED YET: creating property annotations for a non collapsed container selection.');
        }
      }
      Object.assign(nodeData, annotation);
      return tx.create(nodeData)
    }

    break (tx) {
      let sel = tx.selection;
      if (sel.isNodeSelection()) {
        let containerPath = sel.containerPath;
        let nodeId = sel.getNodeId();
        let nodePos = getContainerPosition(tx, containerPath, nodeId);
        let textNode = this.createTextNode(tx, containerPath);
        if (sel.isBefore()) {
          insertAt(tx, containerPath, nodePos, textNode.id);
          
        } else {
          insertAt(tx, containerPath, nodePos + 1, textNode.id);
          setCursor(tx, textNode, containerPath, 'before');
        }
      } else if (sel.isCustomSelection()) ; else if (sel.isCollapsed() || sel.isPropertySelection()) {
        let containerPath = sel.containerPath;
        if (!sel.isCollapsed()) {
          
          this._deletePropertySelection(tx, sel);
          tx.setSelection(sel.collapse('left'));
        }
        
        if (containerPath) {
          let nodeId = sel.start.path[0];
          let node = tx.get(nodeId);
          this._breakNode(tx, node, sel.start, containerPath);
        }
      } else if (sel.isContainerSelection()) {
        let start = sel.start;
        let containerPath = sel.containerPath;
        let startNodeId = start.path[0];
        let nodePos = getContainerPosition(tx, containerPath, startNodeId);
        this._deleteContainerSelection(tx, sel, { noMerge: true });
        setCursor(tx, getNextNode(tx, containerPath, nodePos), containerPath, 'before');
      }
    }

    createTextNode (tx, containerPath, text) { 
      let prop = tx.getProperty(containerPath);
      if (!prop.defaultTextType) {
        throw new Error('Container properties must have a "defaultTextType" defined in the schema')
      }
      return tx.create({
        type: prop.defaultTextType,
        content: text
      })
    }

    createListNode (tx, containerPath, params = {}) { 
      
      
      return tx.create({ type: 'list', items: [], listType: params.listType || 'bullet' })
    }

    delete (tx, direction) {
      let sel = tx.selection;
      
      
      
      
      if (sel.isNodeSelection()) {
        this._deleteNodeSelection(tx, sel, direction);
      
      } else if (sel.isCustomSelection()) ; else if (sel.isCollapsed()) {
        
        
        
        let path = sel.start.path;
        let nodeId = path[0];
        let containerPath = sel.containerPath;
        let text = tx.get(path);
        let offset = sel.start.offset;
        let needsMerge = (containerPath && (
          (offset === 0 && direction === 'left') ||
          (offset === text.length && direction === 'right')
        ));
        if (needsMerge) {
          
          
          
          
          
          
          
          let root = getContainerRoot(tx, containerPath, nodeId);
          if (root.isList() && offset === 0 && direction === 'left') {
            return this.toggleList(tx)
          } else {
            this._merge(tx, root, sel.start, direction, containerPath);
          }
        } else {
          
          if ((offset === 0 && direction === 'left') ||
            (offset === text.length && direction === 'right')) {
            return
          }
          let startOffset = (direction === 'left') ? offset - 1 : offset;
          let endOffset = startOffset + 1;
          let start = { path: path, offset: startOffset };
          let end = { path: path, offset: endOffset };
          deleteTextRange(tx, start, end);
          tx.setSelection({
            type: 'property',
            path: path,
            startOffset: startOffset,
            containerPath: sel.containerPath
          });
        }
      
      } else if (sel.isPropertySelection()) {
        deleteTextRange(tx, sel.start, sel.end);
        tx.setSelection(sel.collapse('left'));
      
      } else if (sel.isContainerSelection()) {
        this._deleteContainerSelection(tx, sel);
      } else {
        console.warn('Unsupported case: tx.delete(%)', direction, sel);
      }
    }

    _deleteNodeSelection (tx, sel, direction) {
      let nodeId = sel.getNodeId();
      let containerPath = sel.containerPath;
      let nodePos = getContainerPosition(tx, containerPath, nodeId);
      if (sel.isFull() ||
          (sel.isBefore() && direction === 'right') ||
          (sel.isAfter() && direction === 'left')) {
        
        removeAt(tx, containerPath, nodePos);
        deepDeleteNode(tx, tx.get(nodeId));
        let newNode = this.createTextNode(tx, sel.containerPath);
        insertAt(tx, containerPath, nodePos, newNode.id);
        tx.setSelection({
          type: 'property',
          path: newNode.getPath(),
          startOffset: 0,
          containerPath
        });
      } else {
        
        if (sel.isBefore() && direction === 'left') {
          if (nodePos > 0) {
            let previous = getPreviousNode(tx, containerPath, nodePos);
            if (previous.isText()) {
              tx.setSelection({
                type: 'property',
                path: previous.getPath(),
                startOffset: previous.getLength()
              });
              this.delete(tx, direction);
            } else {
              tx.setSelection({
                type: 'node',
                nodeId: previous.id,
                containerPath
              });
            }
          }
        } else if (sel.isAfter() && direction === 'right') {
          let nodeIds = tx.get(containerPath);
          if (nodePos < nodeIds.length - 1) {
            let next = getNextNode(tx, containerPath, nodePos);
            if (next.isText()) {
              tx.setSelection({
                type: 'property',
                path: next.getPath(),
                startOffset: 0
              });
              this.delete(tx, direction);
            } else {
              tx.setSelection({
                type: 'node',
                nodeId: next.id,
                containerPath
              });
            }
          }
        } else {
          console.warn('Unsupported case: delete(%s)', direction, sel);
        }
      }
    }

    _deletePropertySelection (tx, sel) {
      let path = sel.start.path;
      let start = sel.start.offset;
      let end = sel.end.offset;
      tx.update(path, { type: 'delete', start: start, end: end });
      annotationHelpers.deletedText(tx, path, start, end);
    }

    
    _deleteContainerSelection (tx, sel, options = {}) {
      let containerPath = sel.containerPath;
      let start = sel.start;
      let end = sel.end;
      let startId = start.getNodeId();
      let endId = end.getNodeId();
      let startPos = getContainerPosition(tx, containerPath, startId);
      let endPos = getContainerPosition(tx, containerPath, endId);
      
      if (startPos === endPos) {
        
        
        let node = getContainerRoot(tx, containerPath, startId);
        
        if (node.isText()) {
          deleteTextRange(tx, start, end);
        } else if (node.isList()) {
          deleteListRange(tx, node, start, end);
        } else {
          throw new Error('Not supported yet.')
        }
        tx.setSelection(sel.collapse('left'));
        return
      }

      

      let firstNodeId = start.getNodeId();
      let lastNodeId = end.getNodeId();
      let firstNode = tx.get(start.getNodeId());
      let lastNode = tx.get(end.getNodeId());
      let firstEntirelySelected = isEntirelySelected(tx, firstNode, start, null);
      let lastEntirelySelected = isEntirelySelected(tx, lastNode, null, end);

      
      if (lastEntirelySelected) {
        removeAt(tx, containerPath, endPos);
        deepDeleteNode(tx, lastNode);
      } else {
        
        let node = getContainerRoot(tx, containerPath, lastNodeId);
        
        if (node.isText()) {
          deleteTextRange(tx, null, end);
        } else if (node.isList()) {
          deleteListRange(tx, node, null, end);
        }
      }

      
      for (let i = endPos - 1; i > startPos; i--) {
        let nodeId = removeAt(tx, containerPath, i);
        deepDeleteNode(tx, tx.get(nodeId));
      }

      
      if (firstEntirelySelected) {
        removeAt(tx, containerPath, startPos);
        deepDeleteNode(tx, firstNode);
      } else {
        
        let node = getContainerRoot(tx, containerPath, firstNodeId);
        
        if (node.isText()) {
          deleteTextRange(tx, start, null);
        } else if (node.isList()) {
          deleteListRange(tx, node, start, null);
        }
      }

      
      if (firstEntirelySelected && lastEntirelySelected) {
        
        let textNode = this.createTextNode(tx, containerPath);
        insertAt(tx, containerPath, startPos, textNode.id);
        tx.setSelection({
          type: 'property',
          path: textNode.getPath(),
          startOffset: 0,
          containerPath: containerPath
        });
      } else if (!firstEntirelySelected && !lastEntirelySelected) {
        if (!options.noMerge) {
          let firstNodeRoot = getContainerRoot(tx, containerPath, firstNode.id);
          this._merge(tx, firstNodeRoot, sel.start, 'right', containerPath);
        }
        tx.setSelection(sel.collapse('left'));
      } else if (firstEntirelySelected) {
        setCursor(tx, lastNode, containerPath, 'before');
      } else {
        setCursor(tx, firstNode, containerPath, 'after');
      }
    }

    insertInlineNode (tx, nodeData) {
      let sel = tx.selection;
      let text = '\uFEFF';
      this.insertText(tx, text);
      sel = tx.selection;
      let endOffset = tx.selection.end.offset;
      let startOffset = endOffset - text.length;
      nodeData = Object.assign({}, nodeData, {
        start: {
          path: sel.path,
          offset: startOffset
        },
        end: {
          path: sel.path,
          offset: endOffset
        }
      });
      return tx.create(nodeData)
    }

    insertBlockNode (tx, nodeData) {
      let sel = tx.selection;
      let containerPath = sel.containerPath;
      
      let blockNode;
      if (!nodeData._isNode || !tx.get(nodeData.id)) {
        blockNode = tx.create(nodeData);
      } else {
        blockNode = tx.get(nodeData.id);
      }
      
      if (sel.isNodeSelection()) {
        let nodeId = sel.getNodeId();
        let nodePos = getContainerPosition(tx, containerPath, nodeId);
        
        if (sel.isBefore()) {
          insertAt(tx, containerPath, nodePos, blockNode.id);
        
        } else if (sel.isAfter()) {
          insertAt(tx, containerPath, nodePos + 1, blockNode.id);
          tx.setSelection({
            type: 'node',
            containerPath,
            nodeId: blockNode.id,
            mode: 'after'
          });
        } else {
          removeAt(tx, containerPath, nodePos);
          deepDeleteNode(tx, tx.get(nodeId));
          insertAt(tx, containerPath, nodePos, blockNode.id);
          tx.setSelection({
            type: 'node',
            containerPath,
            nodeId: blockNode.id,
            mode: 'after'
          });
        }
      } else if (sel.isPropertySelection()) {
        
        if (!containerPath) throw new Error('insertBlockNode can only be used within a container.')
        if (!sel.isCollapsed()) {
          this._deletePropertySelection(tx, sel);
          tx.setSelection(sel.collapse('left'));
        }
        let node = tx.get(sel.path[0]);
        
        if (!node) throw new Error('Invalid selection.')
        let nodePos = getContainerPosition(tx, containerPath, node.id);
        
        if (node.isText()) {
          let text = node.getText();
          
          if (text.length === 0) {
            removeAt(tx, containerPath, nodePos);
            deepDeleteNode(tx, node);
            insertAt(tx, containerPath, nodePos, blockNode.id);
            setCursor(tx, blockNode, containerPath, 'after');
          
          } else if (sel.start.offset === 0) {
            insertAt(tx, containerPath, nodePos, blockNode.id);
          
          } else if (sel.start.offset === text.length) {
            insertAt(tx, containerPath, nodePos + 1, blockNode.id);
            setCursor(tx, blockNode, containerPath, 'before');
          
          } else {
            this.break(tx);
            insertAt(tx, containerPath, nodePos + 1, blockNode.id);
            setCursor(tx, blockNode, containerPath, 'after');
          }
        } else {
          console.error('Not supported: insertBlockNode() on a custom node');
        }
      } else if (sel.isContainerSelection()) {
        if (sel.isCollapsed()) {
          let start = sel.start;
          
          if (start.isPropertyCoordinate()) {
            tx.setSelection({
              type: 'property',
              path: start.path,
              startOffset: start.offset,
              containerPath
            });
          } else if (start.isNodeCoordinate()) {
            tx.setSelection({
              type: 'node',
              containerPath,
              nodeId: start.path[0],
              mode: start.offset === 0 ? 'before' : 'after'
            });
          } else {
            throw new Error('Unsupported selection for insertBlockNode')
          }
          return this.insertBlockNode(tx, blockNode)
        } else {
          this.break(tx);
          return this.insertBlockNode(tx, blockNode)
        }
      }
      return blockNode
    }

    insertText (tx, text) {
      let sel = tx.selection;
      
      
      
      if (sel.isNodeSelection()) {
        let containerPath = sel.containerPath;
        let nodeId = sel.getNodeId();
        let nodePos = getContainerPosition(tx, containerPath, nodeId);
        let textNode = this.createTextNode(tx, containerPath, text);
        if (sel.isBefore()) {
          insertAt(tx, containerPath, nodePos, textNode.id);
        } else if (sel.isAfter()) {
          insertAt(tx, containerPath, nodePos + 1, textNode.id);
        } else {
          removeAt(tx, containerPath, nodePos);
          deepDeleteNode(tx, tx.get(nodeId));
          insertAt(tx, containerPath, nodePos, textNode.id);
        }
        setCursor(tx, textNode, containerPath, 'after');
      } else if (sel.isCustomSelection()) ; else if (sel.isCollapsed() || sel.isPropertySelection()) {
        
        this._insertText(tx, sel, text);
        
      } else if (sel.isContainerSelection()) {
        this._deleteContainerSelection(tx, sel);
        this.insertText(tx, text);
      }
    }

    paste (tx, content) {
      if (!content) return
      
      if (isString(content)) {
        paste(tx, {text: content});
      } else if (content._isDocument) {
        paste(tx, {doc: content});
      } else {
        throw new Error('Illegal content for paste.')
      }
    }

    
    switchTextType (tx, data) {
      let sel = tx.selection;
      
      if (!sel.isPropertySelection()) {
        throw new Error('Selection must be a PropertySelection.')
      }
      let containerPath = sel.containerPath;
      
      if (!containerPath) {
        throw new Error('Selection must be within a container.')
      }
      let path = sel.path;
      let nodeId = path[0];
      let node = tx.get(nodeId);
      
      if (!(node.isText())) {
        throw new Error('Trying to use switchTextType on a non text node.')
      }
      const newId = uuid(data.type);
      
      const oldPath = node.getPath();
      console.assert(oldPath.length === 2, 'Currently we assume that TextNodes store the plain-text on the first level');
      const textProp = oldPath[1];
      let newPath = [newId, textProp];
      
      let newNodeData = Object.assign({
        id: newId,
        type: data.type,
        direction: node.direction
      }, data);
      newNodeData[textProp] = node.getText();

      let newNode = tx.create(newNodeData);
      annotationHelpers.transferAnnotations(tx, path, 0, newPath, 0);

      
      let pos = getContainerPosition(tx, containerPath, nodeId);
      removeAt(tx, containerPath, pos);
      deepDeleteNode(tx, node);
      insertAt(tx, containerPath, pos, newNode.id);

      tx.setSelection({
        type: 'property',
        path: newPath,
        startOffset: sel.start.offset,
        endOffset: sel.end.offset,
        containerPath
      });

      return newNode
    }

    toggleList (tx, params) {
      let sel = tx.selection;
      let containerPath = sel.containerPath;
      
      if (!containerPath) {
        throw new Error('Selection must be within a container.')
      }
      if (sel.isPropertySelection()) {
        let nodeId = sel.start.path[0];
        
        let node = getContainerRoot(tx, containerPath, nodeId);
        let nodePos = node.getPosition();
        
        if (node.isText()) {
          removeAt(tx, containerPath, nodePos);
          let newList = this.createListNode(tx, containerPath, params);
          let newItem = newList.createListItem(node.getText());
          annotationHelpers.transferAnnotations(tx, node.getPath(), 0, newItem.getPath(), 0);
          newList.appendItem(newItem);
          deepDeleteNode(tx, node);
          insertAt(tx, containerPath, nodePos, newList.id);
          tx.setSelection({
            type: 'property',
            path: newItem.getPath(),
            startOffset: sel.start.offset,
            containerPath
          });
        } else if (node.isList()) {
          let itemId = sel.start.path[0];
          let item = tx.get(itemId);
          let itemPos = node.getItemPosition(item);
          let newTextNode = this.createTextNode(tx, containerPath, item.getText());
          annotationHelpers.transferAnnotations(tx, item.getPath(), 0, newTextNode.getPath(), 0);
          
          node.removeItemAt(itemPos);
          if (node.isEmpty()) {
            removeAt(tx, containerPath, nodePos);
            deepDeleteNode(tx, node);
            insertAt(tx, containerPath, nodePos, newTextNode.id);
          } else if (itemPos === 0) {
            insertAt(tx, containerPath, nodePos, newTextNode.id);
          } else if (node.getLength() <= itemPos) {
            insertAt(tx, containerPath, nodePos + 1, newTextNode.id);
          } else {
            
            let tail = [];
            const items = node.getItems();
            const L = items.length;
            for (let i = L - 1; i >= itemPos; i--) {
              tail.unshift(items[i]);
              node.removeItemAt(i);
            }
            let newList = this.createListNode(tx, containerPath, node);
            for (let i = 0; i < tail.length; i++) {
              newList.appendItem(tail[i]);
            }
            insertAt(tx, containerPath, nodePos + 1, newTextNode.id);
            insertAt(tx, containerPath, nodePos + 2, newList.id);
          }
          tx.setSelection({
            type: 'property',
            path: newTextNode.getPath(),
            startOffset: sel.start.offset,
            containerPath
          });
        }
      } else if (sel.isContainerSelection()) {
        console.error('TODO: support toggleList with ContainerSelection');
      }
    }

    indent (tx) {
      let sel = tx.selection;
      let containerPath = sel.containerPath;
      if (sel.isPropertySelection()) {
        let nodeId = sel.start.getNodeId();
        
        let node = getContainerRoot(tx, containerPath, nodeId);
        if (node.isList()) {
          let itemId = sel.start.path[0];
          let item = tx.get(itemId);
          let level = item.getLevel();
          
          if (item && level < 3) {
            item.setLevel(item.level + 1);
            
            tx.set([node.id, '_itemsChanged'], true);
          }
        }
      } else if (sel.isContainerSelection()) {
        console.error('TODO: support toggleList with ContainerSelection');
      }
    }

    dedent (tx) {
      let sel = tx.selection;
      let containerPath = sel.containerPath;
      if (sel.isPropertySelection()) {
        let nodeId = sel.start.getNodeId();
        
        let node = getContainerRoot(tx, containerPath, nodeId);
        if (node.isList()) {
          let itemId = sel.start.path[0];
          let item = tx.get(itemId);
          let level = item.getLevel();
          if (item) {
            if (level > 1) {
              item.setLevel(item.level - 1);
              
              tx.set([node.id, '_itemsChanged'], true);
            }
            
            
            
            
            
          }
        }
      } else if (sel.isContainerSelection()) {
        console.error('TODO: support toggleList with ContainerSelection');
      }
    }

    
    _insertText (tx, sel, text) {
      let start = sel.start;
      let end = sel.end;
      
      if (!isArrayEqual(start.path, end.path)) {
        throw new Error('Unsupported state: range should be on one property')
      }
      let path = start.path;
      let startOffset = start.offset;
      let endOffset = end.offset;
      let typeover = !sel.isCollapsed();
      let L = text.length;
      
      if (typeover) {
        tx.update(path, { type: 'delete', start: startOffset, end: endOffset });
      }
      
      tx.update(path, { type: 'insert', start: startOffset, text: text });
      
      let annos = tx.getAnnotations(path);
      annos.forEach(function (anno) {
        let annoStart = anno.start.offset;
        let annoEnd = anno.end.offset;

        
        
        if (annoEnd < startOffset) ; else if (annoStart >= endOffset) {
          tx.update([anno.id, 'start'], { type: 'shift', value: startOffset - endOffset + L });
          tx.update([anno.id, 'end'], { type: 'shift', value: startOffset - endOffset + L });
        
        
        
        
        } else if (
          (annoStart >= startOffset && annoEnd < endOffset) ||
          (anno.isInlineNode() && annoStart >= startOffset && annoEnd <= endOffset)
        ) {
          tx.delete(anno.id);
        
        } else if (annoStart >= startOffset && annoEnd >= endOffset) {
          
          if (annoStart > startOffset || !typeover) {
            tx.update([anno.id, 'start'], { type: 'shift', value: startOffset - annoStart + L });
          }
          tx.update([anno.id, 'end'], { type: 'shift', value: startOffset - endOffset + L });
        
        } else if (annoStart < startOffset && annoEnd < endOffset) {
          
          tx.update([anno.id, 'end'], { type: 'shift', value: startOffset - annoEnd + L });
        
        } else if (annoEnd === startOffset && !anno.constructor.autoExpandRight) ; else if (annoStart < startOffset && annoEnd >= endOffset) {
          if (anno.isInlineNode()) ; else {
            tx.update([anno.id, 'end'], { type: 'shift', value: startOffset - endOffset + L });
          }
        } else {
          console.warn('TODO: handle annotation update case.');
        }
      });
      let offset = startOffset + text.length;
      tx.setSelection({
        type: 'property',
        path: start.path,
        startOffset: offset,
        containerPath: sel.containerPath,
        surfaceId: sel.surfaceId
      });
    }

    _breakNode (tx, node, coor, containerPath) {
      
      node = getContainerRoot(tx, containerPath, node.id);
      
      if (node.isText()) {
        this._breakTextNode(tx, node, coor, containerPath);
      } else if (node.isList()) {
        this._breakListNode(tx, node, coor, containerPath);
      } else {
        console.error('FIXME: _breakNode() not supported for type', node.type);
      }
    }

    _breakTextNode (tx, node, coor, containerPath) {
      let path = coor.path;
      let offset = coor.offset;
      let nodePos = node.getPosition();
      let text = node.getText();

      
      
      if (offset === 0) {
        let newNode = tx.create({
          type: node.type,
          content: ''
        });
        
        insertAt(tx, containerPath, nodePos, newNode.id);
        tx.setSelection({
          type: 'property',
          path: path,
          startOffset: 0,
          containerPath
        });
      
      } else {
        const textPath = node.getPath();
        const textProp = textPath[1];
        const newId = uuid(node.type);
        let newNodeData = node.toJSON();
        newNodeData.id = newId;
        newNodeData[textProp] = text.substring(offset);
        
        if (offset === text.length) {
          newNodeData.type = tx.getSchema().getDefaultTextType();
        }
        let newNode = tx.create(newNodeData);
        
        if (offset < text.length) {
          
          annotationHelpers.transferAnnotations(tx, path, offset, newNode.getPath(), 0);
          
          tx.update(path, { type: 'delete', start: offset, end: text.length });
        }
        
        insertAt(tx, containerPath, nodePos + 1, newNode.id);
        
        tx.setSelection({
          type: 'property',
          path: newNode.getPath(),
          startOffset: 0,
          containerPath
        });
      }
    }

    _breakListNode (tx, node, coor, containerPath) {
      let path = coor.path;
      let offset = coor.offset;
      let listItem = tx.get(path[0]);

      let L = node.length;
      let itemPos = node.getItemPosition(listItem);
      let text = listItem.getText();
      let textProp = listItem.getPath()[1];
      let newItemData = listItem.toJSON();
      delete newItemData.id;
      if (offset === 0) {
        
        if (!text) {
          
          
          let nodePos = node.getPosition();
          let newTextNode = this.createTextNode(tx, containerPath);
          
          if (L < 2) {
            removeAt(tx, containerPath, nodePos);
            deepDeleteNode(tx, node);
            insertAt(tx, containerPath, nodePos, newTextNode.id);
          
          } else if (itemPos === 0) {
            node.removeItem(listItem);
            deepDeleteNode(tx, listItem);
            insertAt(tx, containerPath, nodePos, newTextNode.id);
          
          } else if (itemPos >= L - 1) {
            node.removeItem(listItem);
            deepDeleteNode(tx, listItem);
            insertAt(tx, containerPath, nodePos + 1, newTextNode.id);
          
          } else {
            let tail = [];
            const items = node.getItems().slice();
            for (let i = L - 1; i > itemPos; i--) {
              tail.unshift(items[i]);
              node.removeItem(items[i]);
            }
            node.removeItem(items[itemPos]);
            let newList = this.createListNode(tx, containerPath, node);
            for (let i = 0; i < tail.length; i++) {
              newList.appendItem(tail[i]);
            }
            insertAt(tx, containerPath, nodePos + 1, newTextNode.id);
            insertAt(tx, containerPath, nodePos + 2, newList.id);
          }
          tx.setSelection({
            type: 'property',
            path: newTextNode.getPath(),
            startOffset: 0
          });
        
        } else {
          newItemData[textProp] = '';
          let newItem = tx.create(newItemData);
          node.insertItemAt(itemPos, newItem);
          tx.setSelection({
            type: 'property',
            path: listItem.getPath(),
            startOffset: 0
          });
        }
      
      } else {
        newItemData[textProp] = text.substring(offset);
        let newItem = tx.create(newItemData);
        
        if (offset < text.length) {
          
          annotationHelpers.transferAnnotations(tx, path, offset, newItem.getPath(), 0);
          
          tx.update(path, { type: 'delete', start: offset, end: text.length });
        }
        node.insertItemAt(itemPos + 1, newItem);
        tx.setSelection({
          type: 'property',
          path: newItem.getPath(),
          startOffset: 0
        });
      }
    }

    _merge (tx, node, coor, direction, containerPath) {
      
      
      if (node.isList()) {
        let list = node;
        let itemId = coor.path[0];
        let item = tx.get(itemId);
        let itemPos = list.getItemPosition(item);
        let withinListNode = (
          (direction === 'left' && itemPos > 0) ||
          (direction === 'right' && itemPos < list.items.length - 1)
        );
        if (withinListNode) {
          itemPos = (direction === 'left') ? itemPos - 1 : itemPos;
          let target = list.getItemAt(itemPos);
          let targetLength = target.getLength();
          mergeListItems(tx, list.id, itemPos);
          tx.setSelection({
            type: 'property',
            path: target.getPath(),
            startOffset: targetLength,
            containerPath
          });
          return
        }
      }
      
      let nodeIds = tx.get(containerPath);
      let nodePos = node.getPosition();
      if (direction === 'left' && nodePos > 0) {
        this._mergeNodes(tx, containerPath, nodePos - 1, direction);
      } else if (direction === 'right' && nodePos < nodeIds.length - 1) {
        this._mergeNodes(tx, containerPath, nodePos, direction);
      }
    }

    _mergeNodes (tx, containerPath, pos, direction) {
      let nodeIds = tx.get(containerPath);
      let first = tx.get(nodeIds[pos]);
      let secondPos = pos + 1;
      let second = tx.get(nodeIds[secondPos]);
      if (first.isText()) {
        
        if (first.isEmpty()) {
          removeAt(tx, containerPath, pos);
          secondPos--;
          deepDeleteNode(tx, first);
          
          
          setCursor(tx, second, containerPath, 'before');
          return
        }
        let target = first;
        let targetPath = target.getPath();
        let targetLength = target.getLength();
        if (second.isText()) {
          let source = second;
          let sourcePath = source.getPath();
          removeAt(tx, containerPath, secondPos);
          
          tx.update(targetPath, { type: 'insert', start: targetLength, text: source.getText() });
          
          annotationHelpers.transferAnnotations(tx, sourcePath, 0, targetPath, targetLength);
          deepDeleteNode(tx, source);
          tx.setSelection({
            type: 'property',
            path: targetPath,
            startOffset: targetLength,
            containerPath
          });
        } else if (second.isList()) {
          let list = second;
          if (!second.isEmpty()) {
            let source = list.getFirstItem();
            let sourcePath = source.getPath();
            
            list.removeItemAt(0);
            
            tx.update(targetPath, { type: 'insert', start: targetLength, text: source.getText() });
            
            annotationHelpers.transferAnnotations(tx, sourcePath, 0, targetPath, targetLength);
            
            deepDeleteNode(tx, source);
          }
          if (list.isEmpty()) {
            removeAt(tx, containerPath, secondPos);
            deepDeleteNode(tx, list);
          }
          tx.setSelection({
            type: 'property',
            path: targetPath,
            startOffset: targetLength,
            containerPath
          });
        } else {
          selectNode(tx, direction === 'left' ? first.id : second.id, containerPath);
        }
      } else if (first.isList()) {
        if (second.isText()) {
          let target = first.getLastItem();
          let targetPath = target.getPath();
          let targetLength = target.getLength();
          let third = (nodeIds.length > pos + 2) ? tx.get(nodeIds[pos + 2]) : null;
          if (second.getLength() === 0) {
            removeAt(tx, containerPath, secondPos);
            deepDeleteNode(tx, second);
          } else {
            let source = second;
            let sourcePath = source.getPath();
            removeAt(tx, containerPath, secondPos);
            tx.update(targetPath, { type: 'insert', start: targetLength, text: source.getText() });
            annotationHelpers.transferAnnotations(tx, sourcePath, 0, targetPath, targetLength);
            deepDeleteNode(tx, source);
          }
          
          if (third && third.type === first.type) {
            this._mergeTwoLists(tx, containerPath, first, third);
          }
          tx.setSelection({
            type: 'property',
            path: target.getPath(),
            startOffset: targetLength,
            containerPath
          });
        } else if (second.isList()) {
          
          if (direction !== 'right') {
            
            
            throw new Error('Illegal state')
          }
          let item = first.getLastItem();
          this._mergeTwoLists(tx, containerPath, first, second);
          tx.setSelection({
            type: 'property',
            path: item.getPath(),
            startOffset: item.getLength(),
            containerPath
          });
        } else {
          selectNode(tx, direction === 'left' ? first.id : second.id, containerPath);
        }
      } else {
        if (second.isText() && second.isEmpty()) {
          removeAt(tx, containerPath, secondPos);
          deepDeleteNode(tx, second);
          setCursor(tx, first, containerPath, 'after');
        } else {
          selectNode(tx, direction === 'left' ? first.id : second.id, containerPath);
        }
      }
    }

    _mergeTwoLists (tx, containerPath, first, second) {
      let secondPos = second.getPosition();
      removeAt(tx, containerPath, secondPos);
      let secondItems = second.getItems().slice();
      for (let i = 0; i < secondItems.length; i++) {
        second.removeItemAt(0);
        first.appendItem(secondItems[i]);
      }
      deepDeleteNode(tx, second);
    }
  }

  class EditingInterface {
    constructor (doc, options = {}) {
      this._document = doc;
      this._selection = null;
      this._impl = options.editing || new Editing();
      this._direction = null;
    }

    dispose () {}

    getDocument () {
      return this._document
    }

    

    get (...args) {
      return this._document.get(...args)
    }

    getProperty (...args) {
      return this._document.getProperty(...args)
    }

    contains (id) {
      return this._document.contains(id)
    }

    find (cssSelector) {
      return this._document.find(cssSelector)
    }

    findAll (cssSelector) {
      return this._document.findAll(cssSelector)
    }

    create (nodeData) {
      return this._document.create(nodeData)
    }

    delete (nodeId) {
      return this._document.delete(nodeId)
    }

    deepDeleteNode (nodeId) {
      return deepDeleteNode(this._document.get(nodeId))
    }

    set (path, value) {
      return this._document.set(path, value)
    }

    update (path, diffOp) {
      return this._document.update(path, diffOp)
    }

    updateNode (id, newProps) {
      return this._document.updateNode(id, newProps)
    }

    

    createSelection (selData) {
      
      
      
      
      
      
      
      selData = augmentSelection(selData, this._selection);
      return this._document.createSelection(selData)
    }

    setSelection (sel) {
      if (!sel) {
        sel = Selection.nullSelection;
      } else if (isPlainObject$1(sel)) {
        sel = this.createSelection(sel);
      } else if (!sel.isNull()) {
        sel = augmentSelection(sel, this._selection);
      }
      this._selection = sel;
      return sel
    }

    getSelection () {
      return this._selection
    }

    get selection () {
      return this._selection
    }

    set selection (sel) {
      this.setSelection(sel);
    }

    
    get textDirection () {
      return this._direction
    }

    set textDirection (dir) {
      this._direction = dir;
    }

    

    annotate (annotationData) {
      const sel = this._selection;
      if (sel && (sel.isPropertySelection() || sel.isContainerSelection())) {
        return this._impl.annotate(this, annotationData)
      }
    }

    break () {
      if (this._selection && !this._selection.isNull()) {
        this._impl.break(this);
      }
    }

    copySelection () {
      const doc = this.getDocument();
      const sel = this._selection;
      if (sel && !sel.isNull() && !sel.isCollapsed()) {
        return copySelection(doc, this._selection)
      }
    }

    deleteSelection (options) {
      const sel = this._selection;
      if (sel && !sel.isNull() && !sel.isCollapsed()) {
        this._impl.delete(this, 'right', options);
      }
    }

    deleteCharacter (direction) {
      const sel = this._selection;
      if (!sel || sel.isNull()) ; else if (!sel.isCollapsed()) {
        this.deleteSelection();
      } else {
        this._impl.delete(this, direction);
      }
    }

    insertText (text) {
      const sel = this._selection;
      if (sel && !sel.isNull()) {
        this._impl.insertText(this, text);
      }
    }

    
    insertInlineNode (inlineNode) {
      const sel = this._selection;
      if (sel && !sel.isNull() && sel.isPropertySelection()) {
        return this._impl.insertInlineNode(this, inlineNode)
      }
    }

    insertBlockNode (blockNode) {
      const sel = this._selection;
      if (sel && !sel.isNull()) {
        return this._impl.insertBlockNode(this, blockNode)
      }
    }

    paste (content) {
      const sel = this._selection;
      if (sel && !sel.isNull() && !sel.isCustomSelection()) {
        return this._impl.paste(this, content)
      }
    }

    switchTextType (nodeData) {
      const sel = this._selection;
      if (sel && !sel.isNull()) {
        return this._impl.switchTextType(this, nodeData)
      }
    }

    toggleList (params) {
      const sel = this._selection;
      if (sel && !sel.isNull()) {
        return this._impl.toggleList(this, params)
      }
    }

    indent () {
      const sel = this._selection;
      if (sel && !sel.isNull()) {
        return this._impl.indent(this)
      }
    }

    dedent () {
      const sel = this._selection;
      if (sel && !sel.isNull()) {
        return this._impl.dedent(this)
      }
    }

    

    getIndex (...args) {
      return this._document.getIndex(...args)
    }

    getAnnotations (...args) {
      return this._document.getAnnotations(...args)
    }

    getSchema () {
      return this._document.getSchema()
    }

    createSnippet () {
      return this._document.createSnippet()
    }
  }

  class OperationSerializer {
    constructor () {
      this.SEPARATOR = '\t';
    }

    serialize (op) {
      var out = [];
      switch (op.type) {
        case 'create':
          out.push('c');
          out.push(op.val.id);
          out.push(op.val);
          break
        case 'delete':
          out.push('d');
          out.push(op.val.id);
          out.push(op.val);
          break
        case 'set':
          out.push('s');
          out.push(op.path.join('.'));
          out.push(op.val);
          out.push(op.original);
          break
        case 'update':
          out.push('u');
          out.push(op.path.join('.'));
          Array.prototype.push.apply(out, this.serializePrimitiveOp(op.diff));
          break
        default:
          throw new Error('Unsupported operation type.')
      }
      return out
    }

    serializePrimitiveOp (op) {
      var out = [];
      if (op._isTextOperation) {
        if (op.isInsert()) {
          out.push('t+');
        } else if (op.isDelete()) {
          out.push('t-');
        }
        out.push(op.pos);
        out.push(op.str);
      } else if (op._isArrayOperation) {
        if (op.isInsert()) {
          out.push('a+');
        } else if (op.isDelete()) {
          out.push('a-');
        }
        out.push(op.pos);
        out.push(op.val);
      } else if (op._isCoordinateOperation) {
        if (op.isShift()) {
          out.push('c>>');
        } else {
          throw new Error('Unsupported CoordinateOperation type.')
        }
        out.push(op.pos);
        out.push(op.val);
      } else {
        throw new Error('Unsupported operation type.')
      }
      return out
    }

    deserialize (str, tokenizer) {
      if (!tokenizer) {
        tokenizer = new Tokenizer$2(str, this.SEPARATOR);
      }
      var type = tokenizer.getString();
      var op, path, val, oldVal, diff;
      switch (type) {
        case 'c':
          path = tokenizer.getPath();
          val = tokenizer.getObject();
          op = ObjectOperation.Create(path, val);
          break
        case 'd':
          path = tokenizer.getPath();
          val = tokenizer.getObject();
          op = ObjectOperation.Delete(path, val);
          break
        case 's':
          path = tokenizer.getPath();
          val = tokenizer.getAny();
          oldVal = tokenizer.getAny();
          op = ObjectOperation.Set(path, oldVal, val);
          break
        case 'u':
          path = tokenizer.getPath();
          diff = this.deserializePrimitiveOp(str, tokenizer);
          op = ObjectOperation.Update(path, diff);
          break
        default:
          throw new Error('Illegal type for ObjectOperation: ' + type)
      }
      return op
    }

    deserializePrimitiveOp (str, tokenizer) {
      if (!tokenizer) {
        tokenizer = new Tokenizer$2(str, this.SEPARATOR);
      }
      var type = tokenizer.getString();
      var op, pos, val;
      switch (type) {
        case 't+':
          pos = tokenizer.getNumber();
          val = tokenizer.getString();
          op = TextOperation.Insert(pos, val);
          break
        case 't-':
          pos = tokenizer.getNumber();
          val = tokenizer.getString();
          op = TextOperation.Delete(pos, val);
          break
        case 'a+':
          pos = tokenizer.getNumber();
          val = tokenizer.getAny();
          op = ArrayOperation.Insert(pos, val);
          break
        case 'a-':
          pos = tokenizer.getNumber();
          val = tokenizer.getAny();
          op = ArrayOperation.Delete(pos, val);
          break
        case 'c>>':
          val = tokenizer.getNumber();
          op = CoordinateOperation.Shift(val);
          break
        default:
          throw new Error('Unsupported operation type: ' + type)
      }
      return op
    }
  }

  class Tokenizer$2 {
    constructor (str, sep) {
      if (isArray(arguments[0])) {
        this.tokens = arguments[0];
      } else {
        this.tokens = str.split(sep);
      }
      this.pos = -1;
    }

    error (msg) {
      throw new Error('Parsing error: ' + msg + '\n' + this.tokens[this.pos])
    }

    getString () {
      this.pos++;
      var str = this.tokens[this.pos];
      if (str[0] === '"') {
        str = str.slice(1, -1);
      }
      return str
    }

    getNumber () {
      this.pos++;
      var number;
      var token = this.tokens[this.pos];
      try {
        if (isNumber(token)) {
          number = token;
        } else {
          number = parseInt(this.tokens[this.pos], 10);
        }
        return number
      } catch (err) {
        this.error('expected number');
      }
    }

    getObject () {
      this.pos++;
      var obj;
      var token = this.tokens[this.pos];
      try {
        if (isObject(token)) {
          obj = token;
        } else {
          obj = JSON.parse(this.tokens[this.pos]);
        }
        return obj
      } catch (err) {
        this.error('expected object');
      }
    }

    getAny () {
      this.pos++;
      var token = this.tokens[this.pos];
      return token
    }

    getPath () {
      var str = this.getString();
      return str.split('.')
    }
  }

  OperationSerializer.Tokenizer = Tokenizer$2;

  class DocumentChange {
    constructor (ops, before, after) {
      if (arguments.length === 1 && isPlainObject$1(arguments[0])) {
        let data = arguments[0];
        
        this.sha = data.sha;
        
        this.timestamp = data.timestamp;
        
        this.before = data.before || {};
        
        this.ops = data.ops;
        this.info = data.info; 
        
        this.after = data.after || {};
      } else if (arguments.length === 3) {
        this.sha = uuid();
        this.info = {};
        this.timestamp = Date.now();
        this.ops = ops.slice(0);
        this.before = before || {};
        this.after = after || {};
      } else {
        throw new Error('Illegal arguments.')
      }
      
      this.updated = null;
      
      this.created = null;
      
      this.deleted = null;
    }

    
    _extractInformation (doc) {
      
      
      if (this._extracted) return

      let ops = this.ops;
      let created = {};
      let deleted = {};
      let updated = {};
      let affectedContainerAnnos = [];

      
      function _checkAnnotation (op) {
        switch (op.type) {
          case 'create':
          case 'delete': {
            let node = op.val;
            if (node.hasOwnProperty('start') && node.start.path) {
              updated[getKeyForPath(node.start.path)] = true;
            }
            if (node.hasOwnProperty('end') && node.end.path) {
              updated[getKeyForPath(node.end.path)] = true;
            }
            break
          }
          case 'update':
          case 'set': {
            
            let node = doc.get(op.path[0]);
            if (node) {
              if (node.isPropertyAnnotation()) {
                updated[getKeyForPath(node.start.path)] = true;
              } else if (node.isContainerAnnotation()) {
                affectedContainerAnnos.push(node);
              }
            }
            break
          }
          default:
            
            
        }
      }

      for (let i = 0; i < ops.length; i++) {
        let op = ops[i];
        if (op.type === 'create') {
          created[op.val.id] = op.val;
          delete deleted[op.val.id];
        }
        if (op.type === 'delete') {
          delete created[op.val.id];
          deleted[op.val.id] = op.val;
        }
        if (op.type === 'set' || op.type === 'update') {
          updated[getKeyForPath(op.path)] = true;
          
          updated[op.path[0]] = true;
        }
        _checkAnnotation(op);
      }

      affectedContainerAnnos.forEach(anno => {
        let startPos = getContainerPosition(doc, anno.containerPath, anno.start.path[0]);
        let endPos = getContainerPosition(doc, anno.containerPath, anno.end.path[0]);
        let nodeIds = doc.get(anno.containerPath);
        for (let pos = startPos; pos <= endPos; pos++) {
          let node = doc.get(nodeIds[pos]);
          let path;
          if (node.isText()) {
            path = node.getPath();
          } else {
            path = [node.id];
          }
          if (!deleted[node.id]) {
            updated[getKeyForPath(path)] = true;
          }
        }
      });

      
      if (Object.keys(deleted).length > 0) {
        forEach(updated, function (_, key) {
          let nodeId = key.split('.')[0];
          if (deleted[nodeId]) {
            delete updated[key];
          }
        });
      }

      this.created = created;
      this.deleted = deleted;
      this.updated = updated;

      this._extracted = true;
    }

    invert () {
      
      let copy = this.toJSON();
      copy.ops = [];
      
      let tmp = copy.before;
      copy.before = copy.after;
      copy.after = tmp;
      let inverted = DocumentChange.fromJSON(copy);
      let ops = [];
      for (let i = this.ops.length - 1; i >= 0; i--) {
        ops.push(this.ops[i].invert());
      }
      inverted.ops = ops;
      return inverted
    }

    hasUpdated (path) {
      let key;
      if (isString(path)) {
        key = path;
      } else {
        key = getKeyForPath(path);
      }
      return this.updated[key]
    }

    hasDeleted (id) {
      return this.deleted[id]
    }

    serialize () {
      
      

      let opSerializer = new OperationSerializer();
      let data = this.toJSON();
      data.ops = this.ops.map(function (op) {
        return opSerializer.serialize(op)
      });
      return JSON.stringify(data)
    }

    clone () {
      return DocumentChange.fromJSON(this.toJSON())
    }

    toJSON () {
      let data = {
        
        sha: this.sha,
        
        before: clone(this.before),
        ops: map$1(this.ops, function (op) {
          return op.toJSON()
        }),
        info: this.info,
        
        after: clone(this.after)
      };

      
      
      data.after.selection = undefined;
      data.before.selection = undefined;

      let sel = this.before.selection;
      if (sel && sel._isSelection) {
        data.before.selection = sel.toJSON();
      }
      sel = this.after.selection;
      if (sel && sel._isSelection) {
        data.after.selection = sel.toJSON();
      }
      return data
    }
  }

  DocumentChange.deserialize = function (str) {
    let opSerializer = new OperationSerializer();
    let data = JSON.parse(str);
    data.ops = data.ops.map(function (opData) {
      return opSerializer.deserialize(opData)
    });
    if (data.before.selection) {
      data.before.selection = fromJSON(data.before.selection);
    }
    if (data.after.selection) {
      data.after.selection = fromJSON(data.after.selection);
    }
    return new DocumentChange(data)
  };

  DocumentChange.fromJSON = function (data) {
    
    let change = cloneDeep(data);
    change.ops = data.ops.map(function (opData) {
      return ObjectOperation.fromJSON(opData)
    });
    change.before.selection = fromJSON(data.before.selection);
    change.after.selection = fromJSON(data.after.selection);
    return new DocumentChange(change)
  };

  class ChangeRecorder extends EditingInterface {
    constructor (doc) {
      super(doc.clone());
    }

    generateChange () {
      const doc = this.getDocument();
      const ops = doc._ops.slice();
      doc._ops.length = 0;
      let change = new DocumentChange(ops, {}, {});
      change._extractInformation(doc);
      return change
    }
  }

  class NodeProperty {
    constructor (name, definition) {
      this.name = name;
      this.definition = definition;

      Object.freeze(this);
      Object.freeze(definition);
    }

    isArray () {
      return isArray(this.definition.type)
    }

    isReference () {
      if (this.isArray()) {
        return last(this.definition.type) === 'id'
      } else {
        return this.definition.type === 'id'
      }
    }

    isText () {
      return Boolean(this.definition._isText)
    }

    isContainer () {
      return Boolean(this.definition._isContainer)
    }

    isOwned () {
      return Boolean(this.definition.owned)
    }

    isOptional () {
      return this.definition.optional || this.hasDefault()
    }

    isNotNull () {
      return Boolean(this.definition.notNull)
    }

    hasDefault () {
      return this.definition.hasOwnProperty('default')
    }

    getDefault () {
      return this.definition.default
    }

    createDefaultValue () {
      if (isArray(this.definition.type)) {
        return []
      }
      switch (this.definition.type) {
        case 'boolean':
          return false
        case 'string':
          return ''
        case 'number':
          return -1
        case 'object':
          return {}
        case 'coordinate':
          return new Coordinate([], 0)
        default:
          return null
      }
    }

    get type () {
      return this.definition.type
    }

    get targetTypes () {
      return this.definition.targetTypes
    }

    get defaultTextType () {
      return this.definition.defaultTextType
    }

    get values () {
      return this.definition.values
    }
  }

  class NodeSchema {
    constructor (properties, superTypes) {
      this._properties = properties;
      this._superTypes = superTypes;
      
      
      
      
      
      this._ownedPropNames = new Set();
      this._ownedProps = [];
      for (let prop of properties.values()) {
        if ((prop.isReference() && prop.isOwned()) || (prop.type === 'file')) {
          this._ownedPropNames.add(prop.name);
          this._ownedProps.push(prop);
        }
      }
    }

    getProperty (name) {
      return this._properties.get(name)
    }

    hasOwnedProperties () {
      return this._ownedPropNames.size > 0
    }

    getOwnedProperties () {
      return this._ownedProps.slice()
    }

    isOwned (name) {
      return this._ownedPropNames.has(name)
    }

    getSuperType () {
      return this._superTypes[0]
    }

    getSuperTypes () {
      return this._superTypes.slice()
    }

    [Symbol.iterator] () {
      return this._properties.values()
    }
  }

  const VALUE_TYPES = new Set(['id', 'string', 'number', 'boolean', 'enum', 'object', 'array', 'coordinate']);


  class Node extends EventEmitter {
    
    constructor (...args) {
      super();

      
      this._properties = {};

      
      
      this._initialize(...args);
    }

    _initialize (data) {
      const NodeClass = this.constructor;

      let schema = NodeClass.schema;
      for (let property of schema) {
        let name = property.name;
        
        
        const propIsGiven = (data[name] !== undefined);
        const isOptional = property.isOptional();
        const hasDefault = property.hasDefault();
        if (!isOptional && !propIsGiven) {
          throw new Error('Property ' + name + ' is mandatory for node type ' + this.type)
        }
        if (propIsGiven) {
          this._properties[name] = _checked(property, data[name]);
        } else if (hasDefault) {
          this._properties[name] = cloneDeep(_checked(property, property.getDefault()));
        }
      }
    }

    dispose () {
      this._disposed = true;
    }

    isDisposed () {
      return Boolean(this._disposed)
    }

    
    isInstanceOf (typeName) {
      return Node.isInstanceOf(this.constructor, typeName)
    }

    getSchema () {
      return this.constructor.schema
    }

    
    getTypeNames () {
      let NodeClass = this.constructor;
      let typeNames = this.schema.getSuperTypes();
      if (NodeClass.hasOwnProperty('type')) {
        typeNames.unshift(NodeClass.type);
      }
      return typeNames
    }

    
    getPropertyType (propertyName) {
      return this.constructor.schema.getProperty(propertyName).type
    }

    
    toJSON () {
      var data = {
        type: this.type
      };
      const schema = this.getSchema();
      for (let prop of schema) {
        let val = this[prop.name];
        if (prop.isOptional() && val === undefined) continue
        if (isArray(val) || isObject(val)) {
          val = cloneDeep(val);
        }
        data[prop.name] = val;
      }
      return data
    }

    get type () {
      return this.constructor.type
    }

    _set (propName, value) {
      this._properties[propName] = value;
    }

    
    static isInstanceOf (NodeClass, typeName) {
      let schema = NodeClass.schema;
      if (!schema) return false
      if (NodeClass.type === typeName) return true
      for (let superType of schema._superTypes) {
        if (superType === typeName) return true
      }
      return false
    }

    get _isNode () { return true }

    
    static _defineSchema (schema) {
      Node.schema = schema;
    }
  }


  Object.defineProperty(Node, 'schema', {
    get () {
      let NodeClass = this;
      
      if (!NodeClass.hasOwnProperty('_schema')) {
        let ParentNodeClass = _getParentClass(NodeClass);
        let parentSchema = ParentNodeClass.schema;
        NodeClass._schema = new NodeSchema(parentSchema._properties, _getSuperTypes(NodeClass));
      }
      return NodeClass._schema
    },
    set (schema) {
      let NodeClass = this;
      
      
      if (schema.type) {
        NodeClass.type = schema.type;
      }
      
      
      
      NodeClass._schema = compileSchema(NodeClass, schema);
    }
  });

  Node.schema = {
    type: '@node',
    id: 'string'
  };



  function _assign (maps) {
    let result = new Map();
    for (let m of maps) {
      for (let [key, value] of m) {
        if (result.has(key)) result.delete(key);
        result.set(key, value);
      }
    }
    return result
  }

  function compileSchema (NodeClass, schema) {
    let compiledSchema = _compileSchema(schema);
    let schemas = [compiledSchema];
    let Clazz = _getParentClass(NodeClass);
    while (Clazz) {
      if (Clazz && Clazz._schema) {
        schemas.unshift(Clazz._schema._properties);
      }
      Clazz = _getParentClass(Clazz);
    }
    let superTypes = _getSuperTypes(NodeClass);
    let _schema = new NodeSchema(_assign(schemas), superTypes);

    
    for (let prop of _schema) {
      let name = prop.name;
      Object.defineProperty(NodeClass.prototype, name, {
        get () {
          return this._properties[name]
        },
        set (val) {
          this.set(name, val);
        },
        enumerable: true,
        configurable: true
      });
    }

    return _schema
  }

  function _compileSchema (schema) {
    let compiledSchema = new Map();
    forEach(schema, function (definition, name) {
      
      if (name === 'type') return
      if (isString(definition) || isArray(definition)) {
        definition = { type: definition };
      } else {
        definition = cloneDeep(definition);
      }
      definition = _compileDefintion(definition);
      definition.name = name;
      compiledSchema.set(name, new NodeProperty(name, definition));
    });
    return compiledSchema
  }

  function _isValueType (t) {
    return VALUE_TYPES.has(t)
  }

  function _compileDefintion (definition) {
    let result = Object.assign({}, definition);
    let type = definition.type;
    if (isArray(type)) {
      
      
      
      
      let defs = type;
      let lastIdx = defs.length - 1;
      let first = defs[0];
      let last = defs[lastIdx];
      let isCanonical = first === 'array';
      if (isCanonical) {
        result.type = defs.slice();
        
        if (last !== 'id' && !_isValueType(last)) {
          result.targetTypes = [last];
          result.type[lastIdx] = 'id';
        }
      } else {
        if (defs.length > 1) {
          defs.forEach(t => {
            if (_isValueType(t)) {
              throw new Error('Multi-types must consist of node types.')
            }
          });
          result.type = [ 'array', 'id' ];
          result.targetTypes = defs;
        } else {
          if (_isValueType(first)) {
            result.type = [ 'array', first ];
          } else {
            result.type = [ 'array', 'id' ];
            result.targetTypes = defs;
          }
        }
      }
    } else if (type === 'text') {
      result = {
        type: 'string',
        default: '',
        _isText: true,
        targetTypes: definition.targetTypes
      };
    
    } else if (type !== 'id' && !_isValueType(type)) {
      result.type = 'id';
      result.targetTypes = [type];
    }

    
    if (result.targetTypes) {
      result.targetTypes = new Set(result.targetTypes);
    }

    return result
  }

  function _checked (prop, value) {
    let type;
    let name = prop.name;
    if (prop.isArray()) {
      type = 'array';
    } else {
      type = prop.type;
    }
    if (value === null) {
      if (prop.isNotNull()) {
        throw new Error('Value for property ' + name + ' is null.')
      } else {
        return value
      }
    }
    if (value === undefined) {
      throw new Error('Value for property ' + name + ' is undefined.')
    }
    if ((type === 'string' && !isString(value)) ||
        (type === 'enum' && !isString(value)) ||
        (type === 'boolean' && !isBoolean(value)) ||
        (type === 'number' && !isNumber(value)) ||
        (type === 'array' && !isArray(value)) ||
        (type === 'id' && !isString(value)) ||
        (type === 'object' && !isObject(value))) {
      throw new Error('Illegal value type for property ' + name + ': expected ' + type + ', was ' + (typeof value))
    }
    return value
  }

  function _getSuperTypes (NodeClass) {
    var typeNames = [];
    let SuperClass = _getParentClass(NodeClass);
    while (SuperClass && SuperClass.type !== '@node') {
      if (SuperClass.hasOwnProperty('type')) {
        typeNames.push(SuperClass.type);
      }
      SuperClass = _getParentClass(SuperClass);
    }
    return typeNames
  }

  function _getParentClass (Clazz) {
    var parentProto = Object.getPrototypeOf(Clazz.prototype);
    if (parentProto) {
      return parentProto.constructor
    }
  }

  class XPathNode {
    constructor (id, type) {
      this.id = id;
      this.type = type;
      this.prev = null;
      this.property = null;
      this.pos = null;
    }

    toJSON () {
      let data = { id: this.id, type: this.type };
      if (this.property) data.property = this.property;
      if (isNumber(this.pos)) data.pos = this.pos;
      return data
    }

    toArray () {
      let result = [this.toJSON()];
      let current = this;
      while (current.prev) {
        current = current.prev;
        result.unshift(current.toJSON());
      }
      return result
    }
  }

  class DocumentNodeSelectAdapter extends domUtils.DomUtils {
    
    isTag () {
      return true
    }

    getChildren (node) {
      return getChildren(node)
    }

    getParent (node) {
      return getParent(node)
    }

    getAttributeValue (node, name) {
      return node[name]
    }

    getAttributes (node) {
      
      
      return ['id', node.id]
    }

    hasAttrib (node, name) {
      if (name === 'id') {
        return true
      } else {
        return node.hasOwnProperty(name)
      }
    }

    getName (node) {
      return node.type
    }

    getNameWithoutNS (node) {
      return this.getName(node)
    }

    getText (node) {
      
      if (node.isText()) {
        return node.getText()
      }
      return ''
    }
  }

  const cssSelectAdapter = new DocumentNodeSelectAdapter();


  class DocumentNode extends Node {
    _initialize (doc, props) {
      this.document = doc;

      super._initialize(props);

      
      this._xpath = new XPathNode(this.id, this.type);
    }

    
    getDocument () {
      return this.document
    }

    resolve (propName) {
      let val = this[propName];
      if (val) {
        let doc = this.getDocument();
        if (isArray(val)) {
          return val.map(id => doc.get(id))
        } else {
          return doc.get(val)
        }
      }
    }

    
    set (propName, value) {
      this.getDocument().set([this.id, propName], value);
    }

    
    assign (props) {
      if (!props) return
      Object.keys(props).forEach(propName => {
        this.set(propName, props[propName]);
      });
    }

    
    hasParent () {
      return Boolean(this.parent)
    }

    
    getParent () {
      if (isString(this.parent)) return this.document.get(this.parent)
      return this.parent
    }

    setParent (parent) {
      if (isString(parent)) parent = this.document.get(parent);
      this.parent = parent;
    }

    
    getRoot () {
      let node = this;
      while (node.parent) {
        node = node.parent;
      }
      return node
    }

    find (cssSelector) {
      return cssSelect.selectOne(cssSelector, this, { xmlMode: true, adapter: cssSelectAdapter })
    }

    findAll (cssSelector) {
      return cssSelect.selectAll(cssSelector, this, { xmlMode: true, adapter: cssSelectAdapter })
    }

    
    getXpath () {
      return this._xpath
    }

    
    getPosition () {
      return this._xpath.pos
    }

    
    

    
    isAnchor () {
      return this.constructor.isAnchor()
    }

    
    isAnnotation () {
      return this.constructor.isAnnotation()
    }

    
    isContainer () {
      return this.constructor.isContainer()
    }

    
    isContainerAnnotation () {
      return this.constructor.isContainerAnnotation()
    }

    
    isInlineNode () {
      return this.constructor.isInlineNode()
    }

    
    isList () {
      return this.constructor.isList()
    }

    
    isListItem () {
      return this.constructor.isListItem()
    }

    
    isPropertyAnnotation () {
      return this.constructor.isPropertyAnnotation()
    }

    
    isText () {
      return this.constructor.isText()
    }

    

    static isAnchor () { return false }

    static isAnnotation () { return false }

    
    static isBlock () { return false }

    static isContainer () { return false }

    
    static isContainerAnnotation () { return false }

    
    static isInlineNode () { return false }

    static isList () { return false }

    static isListItem () { return false }

    
    static isPropertyAnnotation () { return false }

    
    static isText () { return false }

    
    get _isDocumentNode () { return true }
  }

  function ContainerMixin (DocumentNode) {
    class AbstractContainer extends DocumentNode {
      getContentPath () {
        throw new Error('This method is abstract')
      }

      getContent () {
        let doc = this.getDocument();
        return doc.get(this.getContentPath())
      }

      contains (nodeId) {
        return this.getChildIndex(nodeId) >= 0
      }

      getNodeAt (idx) {
        const nodeId = this._getNodeIdAt(idx);
        if (nodeId) {
          return this.getDocument().get(nodeId)
        }
      }

      getNodes () {
        const doc = this.getDocument();
        return this.getContent().map(id => doc.get(id)).filter(Boolean)
      }

      getNodeIndex (id) {
        return this.getContent().indexOf(id)
      }

      getPath () {
        return this.getContentPath()
      }

      append (nodeId) {
        
        const arg1 = arguments[0];
        if (!isString(arg1)) {
          if (arg1._isNode) {
            nodeId = arg1.id;
          }
        }
        return this.insertAt(this.length, nodeId)
      }

      insertAt (pos, nodeId) {
        const doc = this.getDocument();
        const length = this.length;
        if (!isNumber(pos) || pos < 0 || pos > length) {
          throw new Error('Index out of bounds')
        }
        if (!isString(nodeId)) {
          if (nodeId._isNode) {
            nodeId = nodeId.id;
          } else {
            throw new Error('Invalid argument.')
          }
        }
        doc.update(this.getContentPath(), { type: 'insert', pos: pos, value: nodeId });
      }

      remove (nodeId) {
        const pos = getContainerPosition(this.getDocument(), this.getContentPath(), nodeId);
        this.removeAt(pos);
      }

      removeAt (pos) {
        const length = this.length;
        if (pos >= 0 && pos < length) {
          const doc = this.getDocument();
          doc.update(this.getContentPath(), { type: 'delete', pos: pos });
        } else {
          throw new Error('Index out of bounds.')
        }
      }

      get length () {
        return this.getLength()
      }

      getLength () {
        return this.getContent().length
      }

      _getNodeIdAt (idx) {
        let content = this.getContent();
        if (idx < 0 || idx >= content.length) {
          
          return undefined
        } else {
          return content[idx]
        }
      }

      static isContainer () {
        return true
      }
    }
    return AbstractContainer
  }

  class Container extends ContainerMixin(DocumentNode) {
    getContentPath () {
      return [this.id, 'nodes']
    }

    getContent () {
      return this.nodes
    }
  }

  Container.schema = {
    type: '@container',
    nodes: { type: ['array', 'id'], default: [], owned: true }
  };

  class ContainerAnnotation extends AnnotationMixin(DocumentNode) {
    setHighlighted (highlighted, scope) {
      if (this.highlighted !== highlighted) {
        this.highlighted = highlighted;
        this.highlightedScope = scope;
        this.emit('highlighted', highlighted, scope);
        forEach(this.fragments, function (frag) {
          frag.emit('highlighted', highlighted, scope);
        });
      }
    }

    static isAnnotation () { return true }

    static isContainerAnnotation () { return true }
  }

  ContainerAnnotation.schema = {
    type: '@container-annotation',
    containerPath: { type: ['array', 'id'] },
    start: 'coordinate',
    end: 'coordinate'
  };

  class ContainerAnnotationIndex extends DocumentIndex {
    constructor () {
      super();
      this.byId = new TreeIndex();
    }

    select (node) {
      return node.isContainerAnnotation()
    }

    clear () {
      this.byId.clear();
    }

    get (containerPath, type) {
      var annotations = map$1(this.byId.get(String(containerPath)));
      if (isString(type)) {
        annotations = filter(annotations, DocumentIndex.filterByType);
      }
      return annotations
    }

    create (anno) {
      this.byId.set([String(anno.containerPath), anno.id], anno);
    }

    delete (anno) {
      this.byId.delete([String(anno.containerPath), anno.id]);
    }

    update(node, path, newValue, oldValue) { 
      
    }
  }

  class CoordinateAdapter extends Coordinate {
    constructor (owner, pathProperty, offsetProperty) {
      super('SKIP');

      this._owner = owner;
      this._pathProp = pathProperty;
      this._offsetProp = offsetProperty;
      Object.freeze(this);
    }

    equals (other) {
      return (other === this ||
        (isArrayEqual(other.path, this.path) && other.offset === this.offset))
    }

    get path () {
      return this._owner[this._pathProp]
    }

    set path (path) {
      this._owner[this._pathProp] = path;
    }

    get offset () {
      return this._owner[this._offsetProp]
    }

    set offset (offset) {
      this._owner[this._offsetProp] = offset;
    }

    toJSON () {
      return {
        path: this.path,
        offset: this.offset
      }
    }

    toString () {
      return '(' + this.path.join('.') + ', ' + this.offset + ')'
    }
  }

  function createDocumentFactory (ArticleClass, create) {
    return {
      ArticleClass: ArticleClass,
      createEmptyArticle: function () {
        const doc = new ArticleClass();
        return doc
      },
      createArticle: function () {
        const doc = new ArticleClass();
        create(doc);
        return doc
      },
      createChangeset: function () {
        const doc = new ArticleClass();
        const tx = new ChangeRecorder(doc);
        create(tx);
        const change = tx.generateChange();
        return [change.toJSON()]
      }
    }
  }

  class Data extends EventEmitter {
    
    constructor (schema, nodeFactory) {
      super();

      
      if (!schema) {
        throw new Error('schema is mandatory')
      }
      if (!nodeFactory) {
        throw new Error('nodeFactory is mandatory')
      }
      

      this.schema = schema;
      this.nodeFactory = nodeFactory;
      this.nodes = {};
      this.indexes = {};

      
      
      this.__QUEUE_INDEXING__ = false;
      this.queue = [];
    }

    
    contains (id) {
      return Boolean(this.nodes[id])
    }

    
    get (path, strict) {
      let result = this._get(path);
      if (strict && result === undefined) {
        if (isString(path)) {
          throw new Error("Could not find node with id '" + path + "'.")
        } else if (!this.contains(path[0])) {
          throw new Error("Could not find node with id '" + path[0] + "'.")
        } else {
          throw new Error("Property for path '" + path + "' us undefined.")
        }
      }
      return result
    }

    _get (path) {
      if (!path) return undefined
      let result;
      if (isString(path)) {
        let id = path;
        result = this.nodes[id];
      } else if (path.length === 1) {
        let id = path[0];
        result = this.nodes[id];
      } else if (path.length > 1) {
        let id = path[0];
        let obj = this.nodes[id];
        for (let i = 1; i < path.length - 1; i++) {
          if (!obj) return undefined
          obj = obj[path[i]];
        }
        if (!obj) return undefined
        result = obj[path[path.length - 1]];
      }
      return result
    }

    
    getNodes () {
      return this.nodes
    }

    
    create (nodeData) {
      var node = this.nodeFactory.create(nodeData.type, nodeData);
      if (!node) {
        throw new Error('Illegal argument: could not create node for data:', nodeData)
      }
      if (this.contains(node.id)) {
        throw new Error('Node already exists: ' + node.id)
      }
      if (!node.id || !node.type) {
        throw new Error('Node id and type are mandatory.')
      }
      this.nodes[node.id] = node;

      var change = {
        type: 'create',
        node: node
      };

      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }

      return node
    }

    
    delete (nodeId) {
      var node = this.nodes[nodeId];
      if (!node) return
      node.dispose();
      delete this.nodes[nodeId];

      var change = {
        type: 'delete',
        node: node
      };

      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }

      return node
    }

    
    set (path, newValue) {
      let node = this.get(path[0]);
      let oldValue = this._set(path, newValue);
      var change = {
        type: 'set',
        node: node,
        path: path,
        newValue: newValue,
        oldValue: oldValue
      };
      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }
      return oldValue
    }

    _set (path, newValue) {
      let oldValue = _setValue(this.nodes, path, newValue);
      return oldValue
    }

    
    update (path, diff) {
      let node = this.get(path[0]);
      let oldValue = this._get(path);
      let newValue;
      if (diff._isOperation) {
        
        if (diff._isArrayOperation) {
          let tmp = oldValue;
          oldValue = Array.from(oldValue);
          newValue = diff.apply(tmp);
        
        } else if (diff._isCoordinateOperation) {
          let tmp = oldValue;
          oldValue = oldValue.clone();
          newValue = diff.apply(tmp);
        } else {
          newValue = diff.apply(oldValue);
        }
      } else {
        diff = this._normalizeDiff(oldValue, diff);
        if (isString(oldValue)) {
          switch (diff.type) {
            case 'delete': {
              newValue = oldValue.split('').splice(diff.start, diff.end - diff.start).join('');
              break
            }
            case 'insert': {
              newValue = [oldValue.substring(0, diff.start), diff.text, oldValue.substring(diff.start)].join('');
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (isArray(oldValue)) {
          newValue = oldValue.slice(0);
          switch (diff.type) {
            case 'delete': {
              newValue.splice(diff.pos, 1);
              break
            }
            case 'insert': {
              newValue.splice(diff.pos, 0, diff.value);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (oldValue._isCoordinate) {
          switch (diff.type) {
            case 'shift': {
              
              oldValue = { path: oldValue.path, offset: oldValue.offset };
              newValue = oldValue;
              newValue.offset += diff.value;
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else {
          throw new Error('Diff is not supported:', JSON.stringify(diff))
        }
      }
      this._set(path, newValue);

      var change = {
        type: 'update',
        node: node,
        path: path,
        newValue: newValue,
        oldValue: oldValue
      };

      if (this.__QUEUE_INDEXING__) {
        this.queue.push(change);
      } else {
        this._updateIndexes(change);
      }

      return oldValue
    }

    
    _normalizeDiff (value, diff) {
      if (isString(value)) {
        
        if (diff['delete']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"delete", start:s, end: e}) instead');
          diff = {
            type: 'delete',
            start: diff['delete'].start,
            end: diff['delete'].end
          };
        } else if (diff['insert']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"insert", start:s, text: t}) instead');
          diff = {
            type: 'insert',
            start: diff['insert'].offset,
            text: diff['insert'].value
          };
        }
      } else if (isArray(value)) {
        
        if (diff['delete']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"delete", pos:1}) instead');
          diff = {
            type: 'delete',
            pos: diff['delete'].offset
          };
        } else if (diff['insert']) {
          console.warn('DEPRECATED: use doc.update(path, {type:"insert", pos:1, value: "foo"}) instead');
          diff = {
            type: 'insert',
            pos: diff['insert'].offset,
            value: diff['insert'].value
          };
        }
      } else if (value._isCoordinate) {
        if (diff.hasOwnProperty('shift')) {
          console.warn('DEPRECATED: use doc.update(path, {type:"shift", value:2}) instead');
          diff = {
            type: 'shift',
            value: diff['shift']
          };
        }
      }
      return diff
    }

    
    toJSON () {
      let nodes = {};
      forEach(this.nodes, (node) => {
        nodes[node.id] = node.toJSON();
      });
      return {
        schema: [this.schema.id, this.schema.version],
        nodes: nodes
      }
    }

    reset () {
      this.clear();
    }

    
    clear () {
      this.nodes = {};
      forEach(this.indexes, index => index.clear());
    }

    
    addIndex (name, index) {
      if (this.indexes[name]) {
        console.error('Index with name %s already exists.', name);
      }
      index.reset(this);
      this.indexes[name] = index;
      return index
    }

    
    getIndex (name) {
      return this.indexes[name]
    }

    
    _updateIndexes (change) {
      if (!change || this.__QUEUE_INDEXING__) return
      forEach(this.indexes, function (index) {
        if (index.select(change.node)) {
          if (!index[change.type]) {
            console.error('Contract: every NodeIndex must implement ' + change.type);
          }
          switch (change.type) {
            case 'create':
              index.create(change.node);
              break
            case 'delete':
              index.delete(change.node);
              break
            case 'set':
              index.set(change.node, change.path, change.newValue, change.oldValue);
              break
            case 'update':
              index.update(change.node, change.path, change.newValue, change.oldValue);
              break
            default:
              throw new Error('Illegal state.')
          }
        }
      });
    }

    
    _stopIndexing () {
      this.__QUEUE_INDEXING__ = true;
    }

    
    _startIndexing () {
      this.__QUEUE_INDEXING__ = false;
      while (this.queue.length > 0) {
        var change = this.queue.shift();
        this._updateIndexes(change);
      }
    }
  }

  function _setValue (root, path, newValue) {
    
    if (isArray(newValue)) newValue = newValue.slice();
    else if (isPlainObject$1(newValue)) newValue = cloneDeep(newValue);

    let ctx = root;
    let L = path.length;
    for (let i = 0; i < L - 1; i++) {
      ctx = ctx[path[i]];
      if (!ctx) throw new Error('Can not set value.')
    }
    let propName = path[L - 1];
    let oldValue = ctx[propName];
    if (ctx._isNode) {
      ctx._set(propName, newValue);
    } else {
      
      ctx[propName] = newValue;
    }
    return oldValue
  }

  class FileProxy {
    constructor (fileNode, context) {
      this.fileNode = fileNode;
      this.context = context;
      fileNode.setProxy(this);
    }

    get id () {
      return this.fileNode.id
    }

    
    triggerUpdate () {
      let fileId = this.fileNode.id;
      this.context.editorSession.transaction((tx) => {
        tx.set([fileId, '__changed__'], '');
      }, { history: false });
    }

    getUrl () {
      return ''
    }

    sync () {
      return Promise.reject(new Error('sync method not implemented'))
    }
  }

  FileProxy.match = function(fileNode, context) { 
    return false
  };

  class DefaultFileProxy extends FileProxy {
    constructor (fileNode, context) {
      super(fileNode, context);

      
      this.file = fileNode.sourceFile;
      if (this.file) {
        this._fileUrl = URL.createObjectURL(this.file);
      }
      this.url = fileNode.url;
    }

    getUrl () {
      
      if (this.url) {
        return this.url
      }
      
      if (this._fileUrl) {
        return this._fileUrl
      }
      
      return ''
    }

    sync () {
      if (!this.url) {
        console.info('Simulating file upload. Creating blob url instead.', this._fileUrl);
        this.url = this._fileUrl;
      }
      return Promise.resolve()
    }
  }

  class PropertyIndex extends NodeIndex {
    constructor (property) {
      super();

      this._property = property || 'id';
      this.index = new TreeIndex();
    }

    
    get (path) {
      return this.index.get(path) || {}
    }

    
    getAll (path) {
      return this.index.getAll(path)
    }

    clear () {
      this.index.clear();
    }

    
    select(node) { 
      return true
    }

    
    create (node) {
      var values = node[this._property];
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function (value) {
        this.index.set([value, node.id], node);
      }.bind(this));
    }

    
    delete (node) {
      var values = node[this._property];
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function (value) {
        this.index.delete([value, node.id]);
      }.bind(this));
    }

    
    update (node, path, newValue, oldValue) {
      if (!this.select(node) || path[1] !== this._property) return
      var values = oldValue;
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function (value) {
        this.index.delete([value, node.id]);
      }.bind(this));
      values = newValue;
      if (!isArray(values)) {
        values = [values];
      }
      forEach(values, function (value) {
        this.index.set([value, node.id], node);
      }.bind(this));
    }

    set (node, path, newValue, oldValue) {
      this.update(node, path, newValue, oldValue);
    }

    _initialize (data) {
      forEach(data.getNodes(), function (node) {
        if (this.select(node)) {
          this.create(node);
        }
      }.bind(this));
    }
  }

  class IncrementalData extends Data {
    
    create (nodeData) {
      if (nodeData._isNode) {
        nodeData = nodeData.toJSON();
      }
      let op = ObjectOperation.Create([nodeData.id], nodeData);
      this.apply(op);
      return op
    }

    
    delete (nodeId) {
      var op = null;
      var node = this.get(nodeId);
      if (node) {
        var nodeData = node.toJSON();
        op = ObjectOperation.Delete([nodeId], nodeData);
        this.apply(op);
      }
      return op
    }

    
    update (path, diff) {
      var diffOp = this._getDiffOp(path, diff);
      var op = ObjectOperation.Update(path, diffOp);
      this.apply(op);
      return op
    }

    
    set (path, newValue) {
      var oldValue = this.get(path);
      var op = ObjectOperation.Set(path, oldValue, newValue);
      this.apply(op);
      return op
    }

    
    apply (op) {
      if (op.type === ObjectOperation.NOP) return
      else if (op.type === ObjectOperation.CREATE) {
        
        super.create(cloneDeep(op.val));
      } else if (op.type === ObjectOperation.DELETE) {
        super.delete(op.val.id);
      } else if (op.type === ObjectOperation.UPDATE) {
        let diff = op.diff;
        super.update(op.path, diff);
      } else if (op.type === ObjectOperation.SET) {
        super.set(op.path, op.val);
      } else {
        throw new Error('Illegal state.')
      }
      this.emit('operation:applied', op, this);
    }

    
    _getDiffOp (path, diff) {
      var diffOp = null;
      if (diff._isOperation) {
        diffOp = diff;
      } else {
        var value = this.get(path);
        diff = this._normalizeDiff(value, diff);
        if (value === null || value === undefined) {
          throw new Error('Property has not been initialized: ' + JSON.stringify(path))
        } else if (isString(value)) {
          switch (diff.type) {
            case 'delete': {
              diffOp = TextOperation.Delete(diff.start, value.substring(diff.start, diff.end));
              break
            }
            case 'insert': {
              diffOp = TextOperation.Insert(diff.start, diff.text);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (isArray(value)) {
          switch (diff.type) {
            case 'delete': {
              diffOp = ArrayOperation.Delete(diff.pos, value[diff.pos]);
              break
            }
            case 'insert': {
              diffOp = ArrayOperation.Insert(diff.pos, diff.value);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        } else if (value._isCoordinate) {
          switch (diff.type) {
            case 'shift': {
              diffOp = CoordinateOperation.Shift(diff.value);
              break
            }
            default:
              throw new Error('Unknown diff type')
          }
        }
      }
      if (!diffOp) {
        throw new Error('Unsupported diff: ' + JSON.stringify(diff))
      }
      return diffOp
    }
  }

  class DocumentNodeFactory {
    constructor (doc) {
      this.doc = doc;
    }

    create (nodeType, nodeData) {
      var NodeClass = this.doc.schema.getNodeClass(nodeType);
      if (!NodeClass) {
        throw new Error('No node registered by that name: ' + nodeType)
      }
      return new NodeClass(this.doc, nodeData)
    }
  }

  class JSONConverter {
    importDocument (doc, json) {
      if (!json.nodes) {
        throw new Error('Invalid JSON format.')
      }
      
      var nodes = json.nodes;
      doc.import(tx => {
        nodes.forEach(node => tx.create(node));
      });
      return doc
    }

    exportDocument (doc) {
      var schema = doc.getSchema();
      var json = {
        schema: {
          name: schema.name
        },
        nodes: []
      };
      let visited = {};

      function _export (node) {
        if (!node) return
        if (visited[node.id]) return
        visited[node.id] = true;
        let nodeSchema = node.getSchema();
        nodeSchema.getOwnedProperties().forEach(prop => {
          let val = node[prop.name];
          if (isArray(val)) {
            val.forEach(id => {
              _export(doc.get(id));
            });
          } else {
            _export(doc.get(val));
          }
        });
        json.nodes.push(node.toJSON());
      }

      forEach(doc.getNodes(), node => _export(node));

      return json
    }
  }

  class ParentNodeHook {
    constructor (doc) {
      this.doc = doc;

      
      
      this.parents = {};

      doc.data.on('operation:applied', this._onOperationApplied, this);
    }

    _onOperationApplied (op) {
      const doc = this.doc;
      let node = doc.get(op.path[0]);
      let hasOwnedProperties = false;
      let isAnnotation = false;
      let nodeSchema;
      if (node) {
        nodeSchema = node.getSchema();
        hasOwnedProperties = nodeSchema.hasOwnedProperties();
        isAnnotation = node.isAnnotation();
      }
      switch (op.type) {
        case 'create': {
          if (hasOwnedProperties) {
            for (let p of nodeSchema.getOwnedProperties()) {
              let isChildren = p.isArray();
              let refs = node[p.name];
              if (refs) {
                this._setParent(node, refs, p.name, isChildren);
              }
              if (isChildren) this._updateContainerPositions([node.id, p.name]);
            }
          }
          if (isAnnotation) {
            this._setAnnotationParent(node);
          }
          this._setRegisteredParent(node);
          break
        }
        case 'update': {
          if (hasOwnedProperties) {
            let propName = op.path[1];
            if (nodeSchema.isOwned(propName)) {
              let update = op.diff;
              let isChildren = update._isArrayOperation;
              if (update.isDelete()) {
                this._setParent(null, update.getValue(), propName, isChildren);
              } else {
                this._setParent(node, update.getValue(), propName, isChildren);
              }
              if (isChildren) this._updateContainerPositions(op.path);
            }
          }
          break
        }
        case 'set': {
          if (hasOwnedProperties) {
            let propName = op.path[1];
            if (nodeSchema.isOwned(propName)) {
              let prop = nodeSchema.getProperty(propName);
              let isChildren = prop.isArray();
              let oldValue = op.getOldValue();
              let newValue = op.getValue();
              
              this._setParent(null, oldValue, propName, isChildren);
              this._setParent(node, newValue, propName, isChildren);
              if (isChildren) this._updateContainerPositions(op.path);
            }
          }
          if (isAnnotation && op.path[1] === 'start' && op.path[2] === 'path') {
            this._setAnnotationParent(node);
          }
          break
        }
        default:
          
      }
    }

    _setParent (parent, ids, property, isChildren) {
      if (ids) {
        if (isArray(ids)) {
          ids.forEach(id => this.__setParent(parent, id, property, isChildren));
        } else {
          this.__setParent(parent, ids, property, isChildren);
        }
      }
    }

    __setParent (parent, id, property, isChildren) {
      let child = this.doc.get(id);
      if (child) {
        this._setParentAndXpath(parent, child, property);
      } else {
        
        
        
        
        
        
        this.parents[id] = { parent, property, isChildren };
      }
    }

    _setRegisteredParent (child) {
      let entry = this.parents[child.id];
      if (entry) {
        let { parent, property, isChildren } = entry;
        this._setParentAndXpath(parent, child, property);
        if (isChildren) {
          child._xpath.pos = parent[property].indexOf(child.id);
        }
        delete this.parents[child.id];
      }
    }

    _setParentAndXpath (parent, child, property) {
      child.setParent(parent);
      let xpath = child._xpath;
      if (parent) {
        xpath.prev = parent._xpath;
        xpath.property = property;
      } else {
        xpath.prev = null;
        xpath.property = null;
        
        
        xpath.pos = null;
      }
    }

    _updateContainerPositions (containerPath) {
      let doc = this.doc;
      let ids = doc.get(containerPath);
      if (ids) {
        for (let pos = 0; pos < ids.length; pos++) {
          let id = ids[pos];
          let child = doc.get(id);
          if (child) {
            child._xpath.pos = pos;
          }
        }
      }
    }

    _setAnnotationParent (anno) {
      let doc = anno.getDocument();
      let path = anno.start.path;
      let annoParent = doc.get(path[0]);
      this._setParent(annoParent, anno.id, path[1]);
    }
  }

  ParentNodeHook.register = function (doc) {
    return new ParentNodeHook(doc)
  };

  const converter = new JSONConverter();



  class Document extends EventEmitter {
    
    constructor (schema, ...args) {
      super();

      this.schema = schema;
      
      if (!schema) {
        throw new Error('A document needs a schema for reflection.')
      }

      
      this._ops = [];

      this._initialize(...args);
    }

    _initialize () {
      this.__id__ = uuid();
      this.nodeFactory = new DocumentNodeFactory(this);
      this.data = new IncrementalData(this.schema, this.nodeFactory);
      
      this.addIndex('type', new PropertyIndex('type'));
      
      this.addIndex('annotations', new AnnotationIndex());
      
      
      
      this.addIndex('container-annotations', new ContainerAnnotationIndex());
      
      
      ParentNodeHook.register(this);
    }

    dispose () {
      this.off();
      this.data.off();
    }

    get id () {
      return this.__id__
    }

    
    getSchema () {
      return this.schema
    }

    
    contains (id) {
      return this.data.contains(id)
    }

    
    get (path, strict) {
      return this.data.get(path, strict)
    }

    resolve (path, strict) {
      let prop = this.getProperty(path);
      if (!prop) {
        if (strict) {
          throw new Error('Invalid path')
        } else {
          return undefined
        }
      }
      let val = this.get(path, strict);
      if (prop.isReference()) {
        if (prop.isArray()) {
          return val.map(id => this.get(id))
        } else {
          return this.get(val)
        }
      } else {
        return val
      }
    }

    
    getNodes () {
      return this.data.getNodes()
    }

    getAnnotations (path) {
      return this.getIndex('annotations').get(path)
    }
    
    getProperty (path) {
      if (path.length !== 2) {
        throw new Error('path must have length=2')
      }
      let [nodeId, propName] = path;
      let node = this.get(nodeId);
      if (node) {
        return node.getSchema().getProperty(propName)
      } else {
        throw new Error('Invalid path.')
      }
    }

    
    import (importer) {
      try {
        this.data._stopIndexing();
        importer(this);
        this.data._startIndexing();
      } finally {
        this.data.queue = [];
        this.data._startIndexing();
      }
    }

    
    create (nodeData) {
      if (!nodeData.id) {
        nodeData.id = uuid(nodeData.type);
      }
      if (!nodeData.type) {
        throw new Error('No node type provided')
      }
      const op = this._create(nodeData);
      if (op) {
        this._ops.push(op);
        this._emitInternalChange(op);
        return this.get(nodeData.id)
      }
    }

    createDefaultTextNode (text, dir) {
      return this.create({
        type: this.getSchema().getDefaultTextType(),
        content: text || '',
        direction: dir
      })
    }

    
    delete (nodeId) {
      const node = this.get(nodeId);
      const op = this._delete(nodeId);
      if (op) {
        this._ops.push(op);
        this._emitInternalChange(op);
      }
      return node
    }

    
    set (path, value) {
      const oldValue = this.get(path);
      const op = this._set(path, value);
      if (op) {
        this._ops.push(op);
        this._emitInternalChange(op);
      }
      return oldValue
    }

    
    update (path, diff) {
      const op = this._update(path, diff);
      if (op) {
        this._ops.push(op);
        this._emitInternalChange(op);
      }
      return op
    }

    
    updateNode (id, newProps) {
      let node = this.get(id);
      forEach(newProps, (value, key) => {
        if (!isEqual(node[key], newProps[key])) {
          this.set([id, key], value);
        }
      });
    }

    
    addIndex (name, index) {
      return this.data.addIndex(name, index)
    }

    
    getIndex (name) {
      return this.data.getIndex(name)
    }

    
    createSelection (data) {
      let sel;
      if (isNil(data)) return Selection.nullSelection
      if (arguments.length !== 1 || !isPlainObject$1(data)) {
        throw new Error('Illegal argument: call createSelection({ type: ... }')
      } else {
        switch (data.type) {
          case 'property': {
            if (isNil(data.endOffset)) {
              data.endOffset = data.startOffset;
            }
            if (!data.hasOwnProperty('reverse')) {
              if (data.startOffset > data.endOffset) {
                [data.startOffset, data.endOffset] = [data.endOffset, data.startOffset];
                data.reverse = !data.reverse;
              }
            }
            
            let text = this.get(data.path, 'strict');
            if (data.startOffset < 0 || data.startOffset > text.length) {
              throw new Error('Invalid startOffset: target property has length ' + text.length + ', given startOffset is ' + data.startOffset)
            }
            if (data.endOffset < 0 || data.endOffset > text.length) {
              throw new Error('Invalid startOffset: target property has length ' + text.length + ', given endOffset is ' + data.endOffset)
            }
            sel = new PropertySelection(data);
            break
          }
          case 'container': {
            let containerPath = data.containerPath;
            let ids = this.get(containerPath);
            if (!ids) throw new Error('Can not create ContainerSelection: container "' + containerPath + '" does not exist.')
            let start = this._normalizeCoor({ path: data.startPath, offset: data.startOffset, containerPath });
            let end = this._normalizeCoor({ path: data.endPath, offset: data.endOffset, containerPath });
            if (!data.hasOwnProperty('reverse')) {
              if (compareCoordinates(this, containerPath, start, end) > 0) {
                [start, end] = [end, start];
                data.reverse = true;
              }
            }
            sel = new ContainerSelection(containerPath, start.path, start.offset, end.path, end.offset, data.reverse, data.surfaceId);
            break
          }
          case 'node': {
            sel = createNodeSelection({
              doc: this,
              nodeId: data.nodeId,
              mode: data.mode,
              containerPath: data.containerPath,
              reverse: data.reverse,
              surfaceId: data.surfaceId
            });
            break
          }
          case 'custom': {
            sel = CustomSelection.fromJSON(data);
            break
          }
          default:
            throw new Error('Illegal selection type', data)
        }
      }
      if (!sel.isNull()) {
        sel.attach(this);
      }
      return sel
    }

    newInstance () {
      var DocumentClass = this.constructor;
      return new DocumentClass(this.schema)
    }

    
    createSnippet () {
      var snippet = this.newInstance();
      var snippetContainer = snippet.create({
        type: '@container',
        id: SNIPPET_ID
      });
      snippet.getContainer = function () {
        return snippetContainer
      };
      return snippet
    }

    rebase (change, onto) {
      if (onto.length > 0) {
        
        
        
        transformDocumentChange(onto, change, { rebase: true, immutableLeft: true });
      }
      return change
    }

    createFromDocument (doc) {
      
      this.clear();

      
      
      
      
      
      
      
      let nodes = Object.values(doc.getNodes());
      let levels = {};
      let visited = new Set();
      nodes.forEach(n => {
        if (!visited.has(n)) this._computeDependencyLevel(n, levels, visited);
      });
      
      nodes.sort((a, b) => {
        return levels[b.id] - levels[a.id]
      });
      nodes.forEach(n => this.create(n));
      return this
    }

    _computeDependencyLevel (node, levels, visited) {
      if (!node) throw new Error('node was nil')
      if (visited.has(node)) throw new Error('Cyclic node dependency')
      visited.add(node);
      
      
      
      let level = 0;
      if (node.isAnnotation() || node.isInlineNode()) {
        level = -1;
      } else {
        let parent = node.getParent();
        if (parent) {
          let parentLevel;
          if (levels.hasOwnProperty(parent.id)) {
            parentLevel = levels[parent.id];
          } else {
            parentLevel = this._computeDependencyLevel(parent, levels, visited);
          }
          level = parentLevel + 1;
        }
      }
      levels[node.id] = level;
      return level
    }

    
    toJSON () {
      return converter.exportDocument(this)
    }

    clone () {
      let copy = this.newInstance();
      copy.createFromDocument(this);
      return copy
    }

    clear () {
      this.data.clear();
      this._ops.length = 0;
    }

    
    createEditingInterface () {
      return new EditingInterface(this)
    }

    invert (change) {
      return change.invert()
    }

    _apply (documentChange) {
      let ops = documentChange.ops;
      for (let op of ops) {
        this._applyOp(op);
      }
      
      documentChange._extractInformation(this);
    }

    _applyOp (op) {
      this.data.apply(op);
      this.emit('operation:applied', op);
    }

    _create (nodeData) {
      return this.data.create(nodeData)
    }

    _delete (nodeId) {
      return this.data.delete(nodeId)
    }

    _set (path, value) {
      return this.data.set(path, value)
    }

    _update (path, diff) {
      return this.data.update(path, diff)
    }

    _emitInternalChange (op) {
      const change = new DocumentChange([op], {}, {});
      change._extractInformation(this);
      this.emit('document:changed:internal', change, this);
    }

    _notifyChangeListeners (change, info = {}) {
      this.emit('document:changed', change, info, this);
    }

    
    _createSelectionFromRange (range) {
      if (!range) return Selection.nullSelection
      let inOneNode = isEqual(range.start.path, range.end.path);
      if (inOneNode) {
        if (range.start.isNodeCoordinate()) {
          
          
          return new NodeSelection(range.containerPath, range.start.getNodeId(), 'full', range.reverse, range.surfaceId)
        } else {
          return this.createSelection({
            type: 'property',
            path: range.start.path,
            startOffset: range.start.offset,
            endOffset: range.end.offset,
            reverse: range.reverse,
            containerPath: range.containerPath,
            surfaceId: range.surfaceId
          })
        }
      } else {
        return this.createSelection({
          type: 'container',
          startPath: range.start.path,
          startOffset: range.start.offset,
          endPath: range.end.path,
          endOffset: range.end.offset,
          reverse: range.reverse,
          containerPath: range.containerPath,
          surfaceId: range.surfaceId
        })
      }
    }

    _normalizeCoor ({ path, offset, containerPath }) {
      
      if (path.length === 1) {
        
        
        let node = getContainerRoot(this, containerPath, path[0]);
        if (node.isText()) {
          
          return new Coordinate(node.getPath(), offset === 0 ? 0 : node.getLength())
        } else if (node.isList()) {
          
          if (offset === 0) {
            let item = node.getItemAt(0);
            return new Coordinate(item.getPath(), 0)
          } else {
            let item = this.get(last(node.items));
            return new Coordinate(item.getPath(), item.getLength())
          }
        }
      }
      return new Coordinate(path, offset)
    }

    get _isDocument () { return true }
  }

  class NodeRegistry extends DeprecatedRegistry {
    
    register (nodeClazz) {
      var type = nodeClazz.prototype.type;
      if (!isString(type) || !type) {
        throw new Error('Node type must be string and not empty')
      }
      if (!(nodeClazz.prototype._isNode)) {
        throw new Error('Nodes must be subclasses of Substance.Data.Node')
      }
      if (this.contains(type)) {
        
        console.info('Overriding node type', type);
        this.remove(type);
      }
      this.add(type, nodeClazz);
    }
  }

  class Schema {
    
    constructor (options) {
      
      
      
      if (arguments.length > 1) {
        console.warn('DEPRECATED: use "new Schema(options)" instead');
        options = { name: arguments[0], version: arguments[1] };
      }

      
      this.name = options.name;
      
      this.version = options.version;
      
      this.nodeRegistry = new NodeRegistry();

      
      this.addNodes(this.getBuiltIns());

      if (options.nodes) {
        this.addNodes(options.nodes);
      }
    }

    
    addNodes (nodes) {
      if (!nodes) return
      forEach(nodes, NodeClass => {
        if (!NodeClass.prototype._isNode) {
          console.error('Illegal node class: ', NodeClass);
        } else {
          this.addNode(NodeClass);
        }
      });
    }

    addNode (NodeClass) {
      this.nodeRegistry.register(NodeClass);
    }

    
    getNodeClass (name, strict) {
      return this.nodeRegistry.get(name, strict)
    }

    
    getBuiltIns () {
      return []
    }

    
    isInstanceOf (type, parentType) {
      var NodeClass = this.getNodeClass(type);
      if (NodeClass) {
        return Node.isInstanceOf(NodeClass, parentType)
      }
      return false
    }

    
    each (...args) {
      return this.nodeRegistry.each(...args)
    }

    
    getDefaultTextType () {
      throw new Error('Schmema.prototype.getDefaultTextType() must be overridden.')
    }

    getNodeSchema (type) {
      var NodeClass = this.getNodeClass(type);
      if (!NodeClass) {
        console.error('Unknown node type ', type);
        return null
      }
      return NodeClass.schema
    }
  }

  class PropertyAnnotation extends AnnotationMixin(DocumentNode) {
    
    get _isAnnotation () { return true }

    get _isPropertyAnnotation () { return true }

    static isPropertyAnnotation () { return true }

    static get autoExpandRight () { return true }
  }

  PropertyAnnotation.schema = {
    type: '@annotation',
    
    
    _content: { type: 'string', optional: true }
  };

  class DocumentSchema extends Schema {
    constructor (schemaSpec) {
      super(schemaSpec);
      
      if (!schemaSpec.DocumentClass) {
        throw new Error('DocumentClass is mandatory')
      }
      Object.assign(this, schemaSpec);
    }

    getDocumentClass () {
      return this.DocumentClass
    }

    
    getDefaultTextType () {
      return this.defaultTextType
    }

    
    getBuiltIns () {
      return [DocumentNode, PropertyAnnotation, Container, ContainerAnnotation]
    }
  }

  class DOMExporter {
    constructor (params, options = {}) {
      if (!params.converters) {
        throw new Error('params.converters is mandatory')
      }
      
      
      if (!params.elementFactory) {
        throw new Error("'elementFactory' is mandatory")
      }
      this.converters = new DeprecatedRegistry();
      params.converters.forEach(Converter => {
        let converter = isFunction(Converter) ? new Converter() : Converter;
        if (!converter.type) {
          console.error('Converter must provide the type of the associated node.', converter);
          return
        }
        this.converters.add(converter.type, converter);
      });
      this.elementFactory = params.elementFactory;
      this.idAttribute = params.idAttribute || 'id';
      this.state = { doc: null };
      this.options = options;
      this.$$ = this.createElement.bind(this);
    }

    exportDocument (doc) {
      
      
      
      
      return this.convertDocument(doc)
    }

    
    convertDocument(doc) { 
      throw new Error('This method is abstract')
    }

    convertContainer (doc, containerPath) {
      if (!containerPath) {
        throw new Error('Illegal arguments: containerPath is mandatory.')
      }
      this.state.doc = doc;
      let ids = doc.get(containerPath);
      let elements = ids.map(id => {
        let node = doc.get(id);
        return this.convertNode(node)
      });
      return elements
    }

    convertNode (node) {
      this.state.doc = node.getDocument();
      let converter = this.getNodeConverter(node);
      
      
      if (node.isPropertyAnnotation() && (!converter || !converter.export)) {
        return this._convertPropertyAnnotation(node)
      }
      if (!converter) {
        converter = this.getDefaultBlockConverter();
      }
      let el;
      if (converter.tagName) {
        el = this.$$(converter.tagName);
      } else {
        el = this.$$('div');
      }
      el.attr(this.idAttribute, node.id);
      if (converter.export) {
        el = converter.export(node, el, this) || el;
      } else {
        el = this.getDefaultBlockConverter().export(node, el, this) || el;
      }
      return el
    }

    convertProperty (doc, path, options) {
      this.state.doc = doc;
      this.initialize(doc, options);
      let wrapper = this.$$('div')
        .append(this.annotatedText(path));
      return wrapper.innerHTML
    }

    annotatedText (path, doc) {
      doc = doc || this.state.doc;
      let text = doc.get(path);
      let annotations = doc.getIndex('annotations').get(path);
      return this._annotatedText(text, annotations)
    }

    getNodeConverter (node) {
      return this.converters.get(node.type)
    }

    getDefaultBlockConverter () {
      throw new Error('This method is abstract.')
    }

    getDefaultPropertyAnnotationConverter () {
      throw new Error('This method is abstract.')
    }

    getDocument () {
      return this.state.doc
    }

    createElement (str) {
      return this.elementFactory.createElement(str)
    }

    _annotatedText (text, annotations) {
      let annotator = new Fragmenter();
      annotator.onText = (context, text) => {
        if (text) {
          
          
          if (this.options.ENCODE_ENTITIES_IN_TEXT) {
            text = encodeXMLEntities(text);
          }
          context.children.push(text);
        }
      };
      annotator.onOpen = function (fragment) {
        return {
          children: []
        }
      };
      annotator.onClose = (fragment, context, parentContext) => {
        let anno = fragment.node;
        let converter = this.getNodeConverter(anno);
        if (!converter) {
          converter = this.getDefaultPropertyAnnotationConverter();
        }
        let el;
        if (converter.tagName) {
          el = this.$$(converter.tagName);
        } else {
          el = this.$$('span');
        }
        el.attr(this.idAttribute, anno.id);
        
        
        
        
        if (anno.isInlineNode()) {
          if (converter.export) {
            el = converter.export(anno, el, this) || el;
          } else {
            el = this.convertNode(anno) || el;
          }
        } else if (anno.isAnnotation()) {
          
          
          if (converter.export) {
            el = converter.export(anno, el, this) || el;
            if (el.children.length) {
              throw new Error('A converter for an annotation type must not convert children. The content of an annotation is owned by their TextNode.')
            }
          }
          el.append(context.children);
        } else {
          
          throw new Error('Illegal element type: only inline nodes and annotations are allowed within a TextNode')
        }
        parentContext.children.push(el);
      };
      let wrapper = { children: [] };
      annotator.start(wrapper, text, annotations);
      return wrapper.children
    }

    
    _convertPropertyAnnotation (anno) {
      
      let wrapper = this.$$('div').append(this.annotatedText(anno.path));
      let el = wrapper.find('[' + this.idAttribute + '="' + anno.id + '"]');
      return el
    }
  }

  const WS_LEFT = /^\s+/g;


  const WS_RIGHT = /\s+$/g;
  const WS_ALL = /\s+/g;


  const SPACE = ' ';
  const TABS_OR_NL = /[\t\n\r]+/g;

  const INVISIBLE_CHARACTER = '\u200B';


  class DOMImporter {
    constructor (params, doc, options = {}) {
      if (!params.converters) {
        throw new Error('"params.converters" is mandatory')
      }
      if (!doc) {
        throw new Error('"doc" is mandatory')
      }
      this.converters = params.converters;
      this.idAttribute = params.idAttribute || 'id';
      this.options = options;

      this._defaultBlockConverter = null;
      this._allConverters = [];
      this._blockConverters = [];
      this._propertyAnnotationConverters = [];

      this.state = new DOMImporter.State();
      
      this.state.doc = doc;

      this._initialize();
    }

    
    _initialize () {
      const schema = this._getSchema();
      const converters = this.converters;
      
      const defaultTextType = schema.getDefaultTextType();
      for (let i = 0; i < converters.length; i++) {
        let converter;
        if (typeof converters[i] === 'function') {
          const Converter = converters[i];
          converter = new Converter();
        } else {
          converter = converters[i];
        }
        if (!converter.type) {
          throw new Error('Converter must provide the type of the associated node.')
        }
        if (!converter.matchElement && !converter.tagName) {
          throw new Error('Converter must provide a matchElement function or a tagName property.')
        }
        if (!converter.matchElement) {
          converter.matchElement = this._defaultElementMatcher.bind(converter);
        }
        const NodeClass = schema.getNodeClass(converter.type);
        if (!NodeClass) {
          throw new Error('No node type defined for converter')
        }
        
        
        if (defaultTextType && !this._defaultBlockConverter && defaultTextType === converter.type) {
          this._defaultBlockConverter = converter;
        }
        this._allConverters.push(converter);
        
        
        
        if (NodeClass.isPropertyAnnotation() || NodeClass.isInlineNode()) {
          this._propertyAnnotationConverters.push(converter);
        } else {
          this._blockConverters.push(converter);
        }
      }
    }

    dispose () {
      if (this.state.doc) {
        this.state.doc.dispose();
      }
    }

    
    reset () {
      if (this.state.doc) {
        this.state.doc.dispose();
      }
      this.state.reset();
      this.state.doc = this._createDocument();
    }

    getDocument () {
      return this.state.doc
    }

    
    convertContainer (elements, containerId) {
      if (!this.state.doc) this.reset();
      const state = this.state;
      const iterator = new ArrayIterator(elements);
      const nodeIds = [];
      while (iterator.hasNext()) {
        const el = iterator.next();
        let node;
        const blockTypeConverter = this._getConverterForElement(el, 'block');
        if (blockTypeConverter) {
          state.pushContext(el.tagName, blockTypeConverter);
          let nodeData = this._createNodeData(el, blockTypeConverter.type);
          nodeData = blockTypeConverter.import(el, nodeData, this) || nodeData;
          node = this._createNode(nodeData);
          let context = state.popContext();
          context.annos.forEach((a) => {
            this._createNode(a);
          });
        } else if (el.isCommentNode()) {
          continue
        } else {
          
          if (el.isTextNode() && /^\s*$/.exec(el.textContent)) continue
          
          
          iterator.back();
          node = this._wrapInlineElementsIntoBlockElement(iterator);
        }
        if (node) {
          nodeIds.push(node.id);
        }
      }
      return this._createNode({
        type: '@container',
        id: containerId,
        nodes: nodeIds
      })
    }

    
    convertElement (el) {
      const schema = this._getSchema();
      if (!this.state.doc) this.reset();
      let isTopLevel = !this.state.isConverting;
      if (isTopLevel) {
        this.state.isConverting = true;
      }

      let nodeData, annos;
      const converter = this._getConverterForElement(el);
      if (converter) {
        const NodeClass = schema.getNodeClass(converter.type);
        nodeData = this._createNodeData(el, converter.type);
        this.state.pushContext(el.tagName, converter);
        
        
        
        
        
        if (NodeClass.isInlineNode()) {
          nodeData = this._convertInlineNode(el, nodeData, converter);
        } else if (NodeClass.isPropertyAnnotation()) {
          nodeData = this._convertPropertyAnnotation(el, nodeData);
        } else {
          nodeData = converter.import(el, nodeData, this) || nodeData;
        }
        let context = this.state.popContext();
        annos = context.annos;
      } else {
        throw new Error('No converter found for ' + el.tagName)
      }
      
      const node = this._createNode(nodeData);
      
      annos.forEach((a) => {
        this._createNode(a);
      });

      
      
      if (this.options['stand-alone'] && isTopLevel) {
        this.state.isConverting = false;
        this.reset();
      }
      return node
    }

    
    annotatedText (el, path, options = {}) {
      if (!path) {
        throw new Error('path is mandatory')
      }
      const state = this.state;
      const context = last(state.contexts);
      
      
      if (!context) {
        throw new Error('This should be called from within an element converter.')
      }
      
      const oldPreserveWhitespace = state.preserveWhitespace;
      if (options.preserveWhitespace) {
        state.preserveWhitespace = true;
      }
      state.stack.push({ path: path, offset: 0, text: '', annos: [] });
      
      
      
      this.state.lastChar = '';
      const iterator = this.getChildNodeIterator(el);
      const text = this._annotatedText(iterator);
      
      
      const top = state.stack.pop();
      context.annos = context.annos.concat(top.annos);

      
      state.preserveWhitespace = oldPreserveWhitespace;

      return text
    }

    
    plainText (el) {
      var state = this.state;
      var text = el.textContent;
      if (state.stack.length > 0) {
        var context = last(state.stack);
        context.offset += text.length;
        context.text += context.text.concat(text);
      }
      return text
    }

    
    _customText (text) {
      var state = this.state;
      if (state.stack.length > 0) {
        var context = last(state.stack);
        context.offset += text.length;
        context.text += context.text.concat(text);
      }
      return text
    }

    
    nextId (prefix) {
      
      
      
      
      return this.state.uuid(prefix)
    }

    _getNextId (dom, type) {
      let id = this.nextId(type);
      while (this.state.ids[id] || dom.find('#' + id)) {
        id = this.nextId(type);
      }
      return id
    }

    _getIdForElement (el, type) {
      let id = el.getAttribute(this.idAttribute);
      if (id && !this.state.ids[id]) return id
      return this._getNextId(el.getOwnerDocument(), type)
    }

    _getSchema () {
      return this.state.doc.getSchema()
    }

    _createDocument () {
      return this.state.doc.newInstance()
    }

    _convertPropertyAnnotation (el, nodeData) {
      const path = [nodeData.id, '_content'];
      
      
      
      nodeData._content = this.annotatedText(el, path);
      nodeData.start = { path, offset: 0 };
      nodeData.end = { offset: nodeData._content.length };
      return nodeData
    }

    _convertInlineNode (el, nodeData, converter) {
      const path = [nodeData.id, '_content'];
      if (converter.import) {
        nodeData = converter.import(el, nodeData, this) || nodeData;
      }
      nodeData._content = '$';
      nodeData.start = { path, offset: 0 };
      nodeData.end = { offset: 1 };
      return nodeData
    }

    _createNodeData (el, type) {
      if (!type) {
        throw new Error('type is mandatory.')
      }
      let nodeData = {
        type,
        id: this._getIdForElement(el, type)
      };
      this.state.ids[nodeData.id] = true;
      return nodeData
    }

    _createNode (nodeData) {
      let doc = this.state.doc;
      
      
      
      let node = doc.get(nodeData.id);
      if (node) {
        
        doc.delete(node.id);
      }
      return doc.create(nodeData)
    }

    getChildNodeIterator (el) {
      return el.getChildNodeIterator()
    }

    _defaultElementMatcher (el) {
      return el.is(this.tagName)
    }

    
    _annotatedText (iterator) {
      const schema = this._getSchema();
      const state = this.state;
      const context = last(state.stack);
      
      if (!context) {
        throw new Error('Illegal state: context is null.')
      }
      while (iterator.hasNext()) {
        var el = iterator.next();
        var text = '';
        
        
        if (el.isTextNode()) {
          text = this._prepareText(el.textContent);
          if (text.length) {
            
            
            context.text = context.text.concat(text);
            context.offset += text.length;
          }
        } else if (el.isCommentNode()) {
          
          continue
        } else if (el.isElementNode()) {
          const annoConverter = this._getConverterForElement(el, 'inline');
          
          if (!annoConverter) {
            
            if (!this.IGNORE_DEFAULT_WARNINGS) {
              console.warn('Unsupported inline element. We will not create an annotation for it, but process its children to extract annotated text.', el.outerHTML);
            }
            
            
            const iterator = this.getChildNodeIterator(el);
            this._annotatedText(iterator);
            continue
          }
          
          
          
          var startOffset = context.offset;
          const annoType = annoConverter.type;
          const AnnoClass = schema.getNodeClass(annoType);
          if (!AnnoClass) {
            throw new Error(`No Node class registered for type ${annoType}.`)
          }
          let annoData = this._createNodeData(el, annoType);
          
          let stackFrame = {
            path: context.path,
            offset: startOffset,
            text: '',
            annos: []
          };
          state.stack.push(stackFrame);
          
          if (annoConverter.import) {
            state.pushContext(el.tagName, annoConverter);
            annoData = annoConverter.import(el, annoData, this) || annoData;
            state.popContext();
          }
          
          
          
          
          if (AnnoClass.isInlineNode()) {
            this._customText(INVISIBLE_CHARACTER);
            
            
            
            state.lastChar = '';
          } else {
            
            
            
            const iterator = this.getChildNodeIterator(el);
            this._annotatedText(iterator);
          }
          
          state.stack.pop();
          context.offset = stackFrame.offset;
          context.text = context.text.concat(stackFrame.text);
          
          const endOffset = context.offset;
          annoData.start = {
            path: context.path.slice(0),
            offset: startOffset
          };
          annoData.end = {
            offset: endOffset
          };
          
          let parentFrame = last(state.stack);
          parentFrame.annos = parentFrame.annos.concat(stackFrame.annos, annoData);
        } else {
          console.warn('Unknown element type. Taking plain text.', el.outerHTML);
          text = this._prepareText(el.textContent);
          context.text = context.text.concat(text);
          context.offset += text.length;
        }
      }
      
      return context.text
    }

    _getConverterForElement (el, mode) {
      let converters;
      if (mode === 'block') {
        if (!el.tagName) return null
        converters = this._blockConverters;
      } else if (mode === 'inline') {
        converters = this._propertyAnnotationConverters;
      } else {
        converters = this._allConverters;
      }
      let converter = null;
      for (let i = 0; i < converters.length; i++) {
        if (this._converterCanBeApplied(converters[i], el)) {
          converter = converters[i];
          break
        }
      }
      
      if (!converter) {
        if (mode === 'inline') {
          return this._getUnsupportedInlineElementConverter()
        } else {
          return this._getUnsupportedElementConverter()
        }
      }

      return converter
    }

    _getUnsupportedElementConverter () {}

    _getUnsupportedInlineElementConverter () {}

    _converterCanBeApplied (converter, el) {
      return converter.matchElement(el, this)
    }

    
    _wrapInlineElementsIntoBlockElement (childIterator) {
      if (!childIterator.hasNext()) return

      const schema = this._getSchema();
      const converter = this._defaultBlockConverter;
      if (!converter) {
        throw new Error('Wrapping inline elements automatically is not supported in this schema.')
      }

      let dom = childIterator.peek().getOwnerDocument();
      let wrapper = dom.createElement('wrapper');
      while (childIterator.hasNext()) {
        const el = childIterator.next();
        
        const blockTypeConverter = this._getConverterForElement(el, 'block');
        if (blockTypeConverter) {
          childIterator.back();
          break
        }
        wrapper.append(el.clone());
      }
      const type = schema.getDefaultTextType();
      const id = this._getNextId(dom, type);
      let nodeData = { type, id };
      this.state.pushContext('wrapper', converter);
      nodeData = converter.import(wrapper, nodeData, this) || nodeData;
      let context = this.state.popContext();
      let annos = context.annos;
      
      const node = this._createNode(nodeData);
      
      annos.forEach((a) => {
        this._createNode(a);
      });
      return node
    }

    
    
    
    
    _prepareText (text) {
      const state = this.state;
      if (state.preserveWhitespace) {
        return text
      }
      var repl = SPACE;
      
      text = text.replace(TABS_OR_NL, '');
      
      
      
      
      
      if (state.lastChar === SPACE) {
        
        text = text.replace(WS_LEFT, '');
      } else {
        text = text.replace(WS_LEFT, repl);
      }
      text = text.replace(WS_RIGHT, repl);
      
      
      
      if (this.options.REMOVE_INNER_WS || state.removeInnerWhitespace) {
        text = text.replace(WS_ALL, SPACE);
      }
      state.lastChar = text[text.length - 1] || state.lastChar;
      return text
    }

    
    _trimTextContent (el) {
      var nodes = el.getChildNodes();
      var firstNode = nodes[0];
      var lastNode = last(nodes);
      var text, trimmed;
      
      if (firstNode && firstNode.isTextNode()) {
        text = firstNode.textContent;
        trimmed = this._trimLeft(text);
        firstNode.textContent = trimmed;
      }
      if (lastNode && lastNode.isTextNode()) {
        text = lastNode.textContent;
        trimmed = this._trimRight(text);
        lastNode.textContent = trimmed;
      }
      return el
    }

    _trimLeft (text) {
      return text.replace(WS_LEFT, '')
    }

    _trimRight (text) {
      return text.replace(WS_RIGHT, '')
    }
  }

  class DOMImporterState {
    constructor () {
      this.reset();
    }

    reset () {
      this.preserveWhitespace = false;
      this.nodes = [];
      this.annotations = [];
      this.containerPath = null;
      this.container = [];
      this.ids = {};
      
      this.contexts = [];
      
      this.stack = [];
      this.lastChar = '';
      this.skipTypes = {};
      this.ignoreAnnotations = false;
      this.isConverting = false;

      
      
      this.uuid = createCountingIdGenerator();
    }

    pushContext (tagName, converter) {
      this.contexts.push({ tagName, converter, annos: [] });
    }

    popContext () {
      return this.contexts.pop()
    }

    getCurrentContext () {
      return last(this.contexts)
    }
  }

  DOMImporter.State = DOMImporterState;

  DOMImporter.INVISIBLE_CHARACTER = INVISIBLE_CHARACTER;

  class FileNode extends DocumentNode {
    getUrl () {
      if (this.proxy) {
        return this.proxy.getUrl()
      } else {
        
        console.warn('No file proxy attached to ', this.id);
        return ''
      }
    }

    setProxy (proxy) {
      this.proxy = proxy;
    }

    
    get _isFileNode () { return true }

    static get _isFileNode () { return true }
  }

  FileNode.schema = {
    type: 'file',
    url: { type: 'string', optional: true },
    fileType: { type: 'string', optional: true },
    mimeType: { type: 'string', optional: true },
    sourceFile: { type: 'object', optional: true }
  };

  function getChangeFromDocument (doc) {
    let recorder = new ChangeRecorder(doc);
    return recorder.generateChange()
  }

  class HTMLExporter extends DOMExporter {
    constructor (params, options = {}) {
      super(_defaultParams(params, options), options);
    }

    exportDocument (doc) {
      let htmlEl = DefaultDOMElement.parseHTML('<html><head></head><body></body></html>');
      return this.convertDocument(doc, htmlEl)
    }

    getDefaultBlockConverter () {
      return defaultBlockConverter 
    }

    getDefaultPropertyAnnotationConverter () {
      return defaultAnnotationConverter 
    }
  }

  function _defaultParams (params, options) {
    params = Object.assign({
      idAttribute: 'data-id'
    }, params, options);
    if (!params.elementFactory) {
      params.elementFactory = DefaultDOMElement.createDocument('html');
    }
    return params
  }

  const defaultAnnotationConverter = {
    tagName: 'span',
    export: function (node, el) {
      el.tagName = 'span';
      el.attr('data-type', node.type);
      var properties = node.toJSON();
      forEach(properties, function (value, name) {
        if (name === 'id' || name === 'type') return
        if (isString(value) || isNumber(value) || isBoolean(value)) {
          el.attr('data-' + name, value);
        }
      });
    }
  };

  const defaultBlockConverter = {
    export: function (node, el, converter) {
      el.attr('data-type', node.type);
      const nodeSchema = node.getSchema();
      for (let prop of nodeSchema) {
        const name = prop.name;
        if (name === 'id' || name === 'type') continue
        
        let propEl = converter.$$('div').attr('property', name);
        let value = node[name];
        if (prop.isText()) {
          propEl.append(converter.annotatedText([node.id, name]));
        } else if (prop.isReference()) {
          if (prop.isOwned()) {
            value = node.resolve(name);
            if (prop.isArray()) {
              propEl.append(value.map(child => converter.convertNode(child)));
            } else {
              propEl.append(converter.convertNode(value));
            }
          } else {
            
            
            
            continue
          }
        } else {
          propEl.append(String(value));
        }
        el.append(propEl);
      }
    }
  };

  class HTMLImporter extends DOMImporter {
    constructor (params, doc, options) {
      super(_defaultParams$1(params, options), doc, options);

      
      this.IGNORE_DEFAULT_WARNINGS = true;
      
      this._el = DefaultDOMElement.parseHTML('<html></html>');
    }

    importDocument (html) {
      this.reset();
      let parsed = DefaultDOMElement.parseHTML(html);
      this.convertDocument(parsed);
      return this.state.doc
    }

    
    convertDocument(documentEl) { 
      throw new Error('This method is abstract')
    }
  }

  function _defaultParams$1 (params, options) {
    return Object.assign({ idAttribute: 'data-id' }, params, options)
  }

  function importNodeIntoDocument (targetDoc, node) {
    let sourceDoc = node.getDocument();
    let newId = _transferWithDisambiguatedIds(sourceDoc, targetDoc, node.id, {});
    return targetDoc.get(newId)
  }

  class InlineNode extends AnnotationMixin(DocumentNode) {
    mustNotBeSplit () { return true }
    static isInlineNode () { return true }
  }

  const ERR_ABSTRACT = 'This method is abstract!';

  function ListMixin (DocumentNode) {
    class AbstractList extends DocumentNode {
      createListItem (text) {
        throw new Error(ERR_ABSTRACT)
      }

      getItemsPath () {
        throw new Error(ERR_ABSTRACT)
      }

      getListTypeString () {
        throw new Error(ERR_ABSTRACT)
      }

      setListTypeString (listTypeStr) {
        throw new Error(ERR_ABSTRACT)
      }

      getItems () {
        return getNodesForPath(this.getDocument(), this.getItemsPath())
      }

      getItemAt (idx) {
        return this.getItems()[idx]
      }

      getItemPosition (item) {
        return this.getItems().indexOf(item)
      }

      getLength () {
        return this.getItems().length
      }

      getFirstItem () {
        return this.getItemAt(0)
      }

      getLastItem () {
        return this.getItemAt(this.getLength() - 1)
      }

      appendItem (item) {
        this.insertItemAt(this.getLength(), item);
      }

      removeItem (item) {
        const pos = this.getItemPosition(item);
        if (pos >= 0) {
          this.removeItemAt(pos);
        }
      }

      insertItemAt (pos, item) {
        insertAt(this.getDocument(), this.getItemsPath(), pos, item.id);
      }

      removeItemAt (pos) {
        removeAt(this.getDocument(), this.getItemsPath(), pos);
      }

      isEmpty () {
        return this.getLength() === 0
      }

      get length () {
        return this.getLength()
      }

      getListType (level) {
        
        let idx = level - 1;
        let listTypes = this._getListTypes();
        return listTypes[idx] || 'bullet'
      }

      setListType (level, listType) {
        let idx = level - 1;
        let listTypes = this._getListTypes();
        if (listTypes.length < level) {
          for (let i = 0; i < idx; i++) {
            if (!listTypes[i]) listTypes[i] = 'bullet';
          }
        }
        listTypes[idx] = listType;
        this._setListTypes(listTypes);
      }

      _getListTypes () {
        let listTypeString = this.getListTypeString();
        return listTypeString ? listTypeString.split(',').map(s => s.trim()) : []
      }

      _setListTypes (listTypeString) {
        if (isArray(listTypeString)) {
          listTypeString = listTypeString.join(',');
        }
        let oldListTypeString = this.getListTypeString();
        if (oldListTypeString !== listTypeString) {
          this.setListTypeString(listTypeString);
        }
      }

      static isList () {
        return true
      }
    }

    return AbstractList
  }

  class Marker extends PropertyAnnotation {
    _initialize (doc, props) {
      this.document = doc;
      this.type = props.type;
      if (!props.type) {
        throw new Error("'type' is mandatory")
      }
      if (!props.start) {
        throw new Error("'start' is mandatory")
      }
      if (!props.end) {
        throw new Error("'end' is mandatory")
      }
      Object.assign(this._properties, props);
    }

    
    containsSelection (sel) {
      if (sel.isNull()) return false
      if (sel.isPropertySelection()) {
        return (isArrayEqual(this.start.path, sel.start.path) &&
          this.start.offset <= sel.start.offset &&
          this.end.offset >= sel.end.offset)
      } else {
        console.warn('Marker.contains() does not support other selection types.');
      }
    }

    get type () {
      return this._type
    }

    set type (type) {
      this._type = type;
    }

    
    
    get _isPropertyAnnotation () { return false }
    get _isMarker () { return true }
  }

  class Range {
    constructor (start, end, reverse, containerPath, surfaceId) {
      
      if (arguments[0] === 'SKIP') return
      if (arguments.length === 1 && isPlainObject$1(arguments[0])) {
        let data = arguments[0];
        this.start = data.start;
        this.end = data.end;
        this.reverse = Boolean(data.reverse);
        this.containerPath = data.containerPath;
        this.surfaceId = data.surfaceId;
      } else {
        this.start = start;
        this.end = end;
        this.reverse = Boolean(reverse);
        this.containerPath = containerPath;
        this.surfaceId = surfaceId;
      }
    }

    isCollapsed () {
      return this.start.equals(this.end)
    }

    equals (other) {
      if (this === other) return true
      else {
        return (
          isArrayEqual(this.containerPath, other.containerPath) &&
          this.start.equals(other.start) &&
          this.end.equals(other.end)
        )
      }
    }

    isReverse () {
      return this.reverse
    }

    toString () {
      let str = [this.start.toString(), '->', this.end.toString()];
      if (this.isReverse()) {
        str.push('[reverse]');
      }
      if (this.containerPath) {
        str.push('[container=' + this.containerPath + ']');
      }
      if (this.surfaceId) {
        str.push('[surface=' + this.surfaceId + ']');
      }
      return str.join('')
    }

    
    get _isRange () { return true }
  }

  const STRING = { type: 'string', default: '' };

  function TEXT$1 (...targetTypes) {
    targetTypes = flatten$1(targetTypes);
    return { type: 'text', targetTypes }
  }

  const PLAIN_TEXT = Object.freeze(TEXT$1());

  const STRING_ARRAY = { type: ['array', 'string'], default: [] };

  const BOOLEAN = { type: 'boolean', default: false };

  function ENUM (values, opts = {}) {
    let def = { type: 'enum', values };
    Object.assign(def, opts);
    return def
  }

  function MANY (...nodeTypes) {
    nodeTypes = flatten$1(nodeTypes);
    return { type: ['array', 'id'], targetTypes: nodeTypes, default: [] }
  }

  function ONE (...nodeTypes) {
    nodeTypes = flatten$1(nodeTypes);
    return { type: 'id', targetTypes: nodeTypes, default: null }
  }

  function CHILDREN (...nodeTypes) {
    nodeTypes = flatten$1(nodeTypes);
    return { type: ['array', 'id'], targetTypes: nodeTypes, default: [], owned: true }
  }



  function CHILD$1 (...nodeTypes) {
    nodeTypes = flatten$1(nodeTypes);
    return { type: 'id', targetTypes: nodeTypes, owned: true }
  }

  function CONTAINER (spec) {
    let nodeTypes, defaultTextType;
    
    if (isString(spec)) {
      nodeTypes = [spec];
      defaultTextType = spec;
    
    } else {
      ({ nodeTypes, defaultTextType } = spec);
    }
    if (!nodeTypes) throw new Error('CONTAINER({ nodeTypes: [...] }) is mandatory.')
    if (!defaultTextType) throw new Error('CONTAINER({ defaultTextType: [...] }) is mandatory.')
    let def = CHILDREN(...nodeTypes);
    def.defaultTextType = defaultTextType;
    def._isContainer = true;
    return def
  }

  function OPTIONAL (type) {
    type.optional = true;
    return type
  }

  function TextNodeMixin (SuperClass) {
    class TextNodeMixin extends SuperClass {
      getTextPath () {
        
        console.warn('DEPRECATED: use node.getPath()');
        return this.getPath()
      }

      getText () {
        return this.content
      }

      setText (text) {
        setText(this.getDocument(), this.getPath(), text);
        return this
      }

      isEmpty () {
        return !this.getText()
      }

      getLength () {
        return this.getText().length
      }

      getAnnotations () {
        return this.getDocument().getIndex('annotations').get(this.getPath())
      }
    }
    return TextNodeMixin
  }

  class TextNode extends TextNodeMixin(DocumentNode) {
    getPath () {
      return [this.id, 'content']
    }

    getText () {
      return this.content
    }

    static isText () { return true }
  }

  TextNode.schema = {
    type: 'text-node',
    content: 'text',
    direction: { type: 'enum', optional: true, values: ['left', 'right'] },
    textAlign: { type: 'enum', default: 'left', values: ['left', 'right'] }
  };

  class XMLExporter extends DOMExporter {
    constructor (params, options = {}) {
      super(_defaultParams$2(params, options), options);
    }

    getDefaultBlockConverter () {
      return defaultBlockConverter$1 
    }

    getDefaultPropertyAnnotationConverter () {
      return defaultAnnotationConverter$1 
    }
  }

  function _defaultParams$2 (params, options) {
    params = Object.assign({
      idAttribute: 'id'
    }, params, options);
    if (!params.elementFactory) {
      let xmlParams = {
        version: options.xmlVersion || '1.0',
        encoding: options.xmlEncoding || 'UTF-8'
      };
      params.elementFactory = DefaultDOMElement.createDocument('xml', xmlParams);
    }
    return params
  }

  const defaultAnnotationConverter$1 = {
    tagName: 'annotation',
    export: function (node, el) {
      el.attr('type', node.type);
      const properties = node.toJSON();
      forEach(properties, function (value, name) {
        if (name === 'id' || name === 'type') return
        if (isString(value) || isNumber(value) || isBoolean(value)) {
          el.attr(name, value);
        }
      });
    }
  };

  const defaultBlockConverter$1 = {
    tagName: 'block',
    export: function (node, el, converter) {
      el.attr('type', node.type);
      const properties = node.toJSON();
      forEach(properties, function (value, name) {
        if (name === 'id' || name === 'type') {
          return
        }
        const prop = converter.$$(name);
        if (node.getPropertyType(name) === 'string') {
          prop.append(converter.annotatedText([node.id, name]));
        } else {
          prop.text(value);
        }
        el.append(prop);
      });
    }
  };

  class XMLImporter extends DOMImporter {
    constructor (params, doc, options = {}) {
      super(_defaultParams$3(params, options), doc, options);
    }

    importDocument (xml) {
      this.reset();
      let dom = DefaultDOMElement.parseXML(xml);
      this.convertDocument(dom);
      return this.state.doc
    }

    convertDocument (xmlDocument) {
      let rootNode = xmlDocument.children[0];
      if (!rootNode) throw new Error('XML Root node could not be found.')
      this.convertElement(rootNode);
    }
  }

  function _defaultParams$3 (params, options) {
    return Object.assign({ idAttribute: 'id' }, params, options)
  }

  const IMPL = Symbol('__AppStateImpl__');

  class AbstractAppState {
    constructor (...args) {
      this[IMPL] = new AppStateImpl();
      

      this._initialize(...args);
      this._reset();
    }

    _initialize () {
      
    }

    dispose () {}

    isDirty (name) {
      return this._getImpl().isDirty(name)
    }

    get (name) {
      return this._getImpl().get(name)
    }

    set (name, value, propagateImmediately) {
      const impl = this._getImpl();
      let oldVal = impl.get(name);
      let hasChanged;
      if (isObject(value)) {
        hasChanged = true;
      } else {
        hasChanged = oldVal !== value;
      }
      if (hasChanged) {
        impl.set(name, value);
        impl.setDirty(name);
        if (propagateImmediately) {
          this.propagateUpdates();
        }
      }
    }

    getUpdate (name) {
      return this._getImpl().getUpdate(name)
    }

    addObserver (deps, handler, observer, options = {}) { 
      throw new Error('This method is abstract.')
    }

    removeObserver (observer) { 
      throw new Error('This method is abstract.')
    }

    off (observer) {
      this.removeObserver(observer);
    }

    propagateUpdates () {
      throw new Error('This method is abstract.')
    }

    _getImpl () {
      return this[IMPL]
    }

    _addProperty (name, initialValue) {
      const impl = this._getImpl();
      if (impl.has(name)) {
        throw new Error(`State variable '${name}' is already declared.`)
      }
      impl.set(name, initialValue);
      Object.defineProperty(this, name, {
        configurable: false,
        enumerable: false,
        get: () => { return this.get(name) },
        set: (value) => { this.set(name, value); }
      });
    }

    
    
    _setDirty (name) {
      this._getImpl().setDirty(name);
    }

    _setUpdate (name, update) {
      const impl = this._getImpl();
      impl.setUpdate(name, update);
      impl.setDirty(name);
    }

    _reset () {
      this._getImpl().reset();
    }
  }

  class AppStateImpl {
    constructor () {
      this.id = uuid();
      this.values = new Map();
      this.dirty = {};
      this.updates = {};
    }

    get (name) {
      return this.values.get(name)
    }

    set (name, newValue) {
      this.values.set(name, newValue);
    }

    has (name) {
      return this.values.has(name)
    }

    setDirty (name) {
      this.dirty[name] = true;
    }

    isDirty (name) {
      return Boolean(this.dirty[name])
    }

    getUpdate (name) {
      return this.updates[name]
    }

    setUpdate (name, update) {
      this.updates[name] = update;
    }

    reset () {
      this.dirty = {};
      this.updates = {};
    }
  }

  const ANY = '@any';
  const STAGES = ['update', 'pre-render', 'render', 'post-render', 'pre-position', 'position', 'finalize'];
  const DEFAULT_STAGE = 'update';
  const STAGE_IDX = STAGES.reduce((m, s, idx) => {
    m[s] = idx;
    return m
  }, {});

  class AppState extends AbstractAppState {
    _initialize (initialState = {}) {
      super._initialize();

      const impl = this._getImpl();
      impl.slots = new Map();
      impl.schedule = null;
      impl.isFlowing = false;

      const names = Object.keys(initialState);
      names.forEach(name => {
        const initialValue = initialState[name];
        this._addProperty(name, initialValue);
      });
    }

    getId () {
      return this._getImpl().id
    }

    addObserver (deps, handler, observer, options = {}) {
      if (isNil(handler)) throw new Error('Provided handler function is nil')
      if (!isFunction(handler)) throw new Error('Provided handler is not a function')
      handler = handler.bind(observer);

      const impl = this._getImpl();
      const ID = impl.id;
      if (!options.stage) options.stage = DEFAULT_STAGE;
      const stage = options.stage;
      const slotId = this._getSlotId(stage, deps.slice());
      let slot = impl.slots.get(slotId);
      if (!slot) {
        slot = this._createSlot(slotId, stage, deps);
        impl.slots.set(slotId, slot);
      }
      if (!observer[ID]) observer[ID] = new Map();
      
      slot.addObserver(observer, {
        stage,
        deps,
        handler,
        options
      });
    }

    removeObserver (observer) {
      const impl = this._getImpl();
      const ID = impl.id;
      let entries = observer[ID] || [];
      entries.forEach(e => {
        e.slot.removeObserver(observer);
      });
      delete observer[ID];
    }

    propagateUpdates () {
      const impl = this._getImpl();
      
      if (impl.isFlowing) throw new Error('Already updating.')
      impl.isFlowing = true;
      try {
        const schedule = this._getSchedule();
        for (let slot of schedule) {
          if (slot.needsUpdate()) {
            slot.notifyObservers();
          }
        }
        this._reset();
      } finally {
        impl.isFlowing = false;
      }
    }

    _getSlotId (stage, deps) {
      deps.sort();
      return `@${stage}:${deps.join(',')}`
    }

    _createSlot (id, stage, deps) {
      const impl = this._getImpl();
      impl.schedule = null;
      return new Slot(this, id, stage, deps)
    }

    
    _getSchedule () {
      const impl = this._getImpl();
      let schedule = impl.schedule;
      if (!schedule) {
        schedule = [];
        impl.slots.forEach(s => schedule.push(s));
        schedule.sort((a, b) => STAGE_IDX[a.stage] - STAGE_IDX[b.stage]);
        impl.schedule = schedule;
      }
      return schedule
    }

    _isUpdating () {
      return this._getImpl().isFlowing
    }

    _reset () {
      super._reset();
      this._setDirty(ANY);
    }
  }

  class Slot {
    constructor (appState, id, stage, deps) {
      this._id = appState._getImpl().id;
      this.id = id;
      this.appState = appState;
      this.stage = stage;
      this.deps = deps;

      this.observers = new Set();
    }

    addObserver (observer, spec) {
      observer[this._id].set(this.id, {
        slot: this,
        spec
      });
      this.observers.add(observer);
    }

    removeObserver (observer) {
      this._deleteEntry(observer);
      this.observers.delete(observer);
    }

    needsUpdate () {
      const state = this.appState;
      for (let dep of this.deps) {
        if (state.isDirty(dep)) return true
      }
      return false
    }

    notifyObservers () {
      let observers = this._getObservers();
      for (let o of observers) {
        let entry = this._getEntryForObserver(o);
        
        if (!entry) continue
        this._notifyObserver(entry);
      }
    }

    _getObservers () {
      return this.observers
    }

    _getEntryForObserver (observer) {
      let map = observer[this._id];
      if (map) {
        return map.get(this.id)
      }
    }

    _deleteEntry (observer) {
      let map = observer[this._id];
      if (map) {
        map.delete(this.id);
      }
    }

    _notifyObserver (entry) {
      entry.spec.handler();
    }
  }

  class SelectionStateReducer {
    constructor (editorState) {
      this.editorState = editorState;
      editorState.addObserver(['document', 'selection'], this.update, this, { stage: 'update' });
    }

    update () {
      const editorState = this.editorState;
      let doc = editorState.get('document');
      let sel = editorState.get('selection');
      let newState = this.deriveState(doc, sel);
      editorState.set('selectionState', newState);
    }

    deriveState (doc, sel) {
      let state = this.createState(sel);
      this.deriveContext(state, doc, sel);
      this.deriveContainerSelectionState(state, doc, sel);
      this.deriveAnnoState(state, doc, sel);
      if (doc.getIndex('markers')) {
        this.deriveMarkerState(state, doc, sel);
      }
      this.deriveSelectedText(state, doc, sel);

      return state
    }

    deriveContext (state, doc, sel) {
      if (!sel || sel.isNull()) return
      if (sel.isPropertySelection() || sel.isNodeSelection() || sel.isCustomSelection()) {
        let nodeId = sel.getNodeId();
        let node = doc.get(nodeId);
        if (node) {
          state.xpath = node.getXpath().toArray();
          state.node = node;
          if (sel.isPropertySelection()) {
            state.property = node.getSchema().getProperty(sel.getPropertyName());
          }
        }
      }
    }

    deriveContainerSelectionState (state, doc, sel) {
      let containerPath = sel.containerPath;
      if (containerPath) {
        state.containerPath = containerPath;
        let nodeIds = doc.get(containerPath);
        let startId = sel.start.getNodeId();
        let endId = sel.end.getNodeId();
        let startNode = getContainerRoot(doc, containerPath, startId);
        
        
        if (!startNode) {
          console.error('FIXME: invalid ContainerSelection');
          return
        }
        let startPos = startNode.getPosition();
        if (startPos > 0) {
          state.previousNode = getPreviousNode(doc, containerPath, startPos);
        }
        state.isFirst = isFirst(doc, containerPath, sel.start);
        let endPos;
        if (endId === startId) {
          endPos = startPos;
        } else {
          let endNode = getContainerRoot(doc, containerPath, endId);
          endPos = endNode.getPosition();
        }
        if (endPos < nodeIds.length - 1) {
          state.nextNode = getNextNode(doc, containerPath, endPos);
        }
        state.isLast = isLast(doc, containerPath, sel.end);
      }
    }

    deriveAnnoState (state, doc, sel) {
      
      let annosByType = {};
      function _add (anno) {
        if (!annosByType[anno.type]) {
          annosByType[anno.type] = [];
        }
        annosByType[anno.type].push(anno);
      }
      const propAnnos = getPropertyAnnotationsForSelection(doc, sel);
      propAnnos.forEach(_add);
      if (propAnnos.length === 1) {
        let firstAnno = propAnnos[0];
        if (firstAnno.isInlineNode()) {
          state.isInlineNodeSelection = firstAnno.getSelection().equals(sel);
          state.node = firstAnno;
        }
      }
      state.annos = propAnnos;

      const containerPath = sel.containerPath;
      if (containerPath) {
        const containerAnnos = getContainerAnnotationsForSelection(doc, sel, containerPath);
        containerAnnos.forEach(_add);
      }
      state.annosByType = annosByType;
    }

    deriveMarkerState (state, doc, sel) {
      let markers = getMarkersForSelection(doc, sel);
      state.markers = markers;
    }

    deriveSelectedText (state, doc, sel) {
      if (sel && sel.isPropertySelection() && !sel.isCollapsed()) {
        const text = getTextForSelection(doc, sel);
        state.selectedText = text;
      }
    }

    createState (sel) {
      return new SelectionState(sel)
    }
  }

  class SelectionState {
    constructor (sel) {
      this.selection = sel || Selection.null;

      Object.assign(this, {
        
        annosByType: null,
        
        markers: null,
        
        isInlineNodeSelection: false,
        
        containerPath: null,
        
        node: null,
        previousNode: null,
        nextNode: null,
        
        annos: [],
        
        isFirst: false,
        
        isLast: false,
        
        xpath: [],
        property: null,
        
        selectedText: ''
      });
    }
  }

  class DocumentObserver {
    constructor (doc, editorState) {
      
      this.editorState = editorState;
      this.doc = doc;
      this.dirty = new Set();

      this.init();
    }

    init () {
      const doc = this.doc;
      this.dirty.clear();
      if (!doc.getIndex('relationships')) {
        doc.addIndex('relationships', new RelationshipIndex());
      }
      doc.on('document:changed', this._onDocumentChanged, this);
    }

    dispose () {
      this.doc.off(this);
    }

    
    reset () {
      this.dirty = new Set();
    }

    setDirty (path) {
      this.dirty.add(getKeyForPath(path));
    }

    
    
    
    _onDocumentChanged (change, info = {}) {
      
      if (!change._extracted) change._extractInformation(this.doc);

      
      let dirty = this.dirty;
      Object.keys(change.updated).forEach(id => {
        dirty.add(id);
      });
    }
  }

  const ONE$1 = Symbol('ONE');
  const MANY$1 = Symbol('MANY');

  class RelationshipIndex extends NodeIndex {
    constructor () {
      super();
      
      this._relationsByType = {};
      
      this._byTarget = new ValuesById();
    }

    get (targetId) {
      return this._byTarget.get(targetId)
    }

    select (node) { 
      return true
    }

    clear () {
      this._byTarget.clear();
    }

    create (node) { 
      let relations = this._getRelations(node);
      if (!relations) return
      for (let [name, type] of relations) {
        const val = node[name];
        if (!val) continue
        if (type === ONE$1) {
          this._add(val, node.id);
        } else {
          val.forEach(targetId => this._add(targetId, node.id));
        }
      }
    }

    delete (node) {
      let relations = this._getRelations(node);
      if (!relations) return
      for (let [name, type] of relations) {
        const val = node[name];
        if (!val) continue
        if (type === ONE$1) {
          this._remove(val, node.id);
        } else {
          val.forEach(targetId => this._remove(targetId, node.id));
        }
      }
    }

    update (node, path, newValue, oldValue) {
      let relations = this._getRelations(node);
      if (!relations) return
      let type = relations.get(path[1]);
      if (!type) return
      if (type === ONE$1) {
        this._remove(oldValue, node.id);
        this._add(newValue, node.id);
      } else {
        oldValue.forEach(targetId => this._remove(targetId, node.id));
        newValue.forEach(targetId => this._add(targetId, node.id));
      }
    }

    _getRelations (node) {
      let relations = this._relationsByType[node.type];
      if (relations === undefined) {
        relations = getRelations(node);
        if (relations.size === 0) relations = false;
        this._relationsByType[node.type] = relations;
      }
      return relations
    }

    _add (targetId, sourceId) {
      this._byTarget.add(targetId, sourceId);
    }

    _remove (targetId, sourceId) {
      this._byTarget.remove(targetId, sourceId);
    }
  }

  function getRelations (node) {
    let relations = new Map();
    let nodeSchema = node.getSchema();
    for (let property of nodeSchema) {
      if (property.isReference()) {
        const name = property.name;
        const type = property.isArray() ? MANY$1 : ONE$1;
        relations.set(name, type);
      }
    }
    return relations
  }

  class ValuesById {
    constructor () {
      this._index = new Map();
    }
    get (key) {
      return this._index.get(key)
    }
    add (key, val) {
      let vals = this._index.get(key);
      if (!vals) {
        vals = new Set();
        this._index.set(key, vals);
      }
      vals.add(val);
    }
    remove (key, val) {
      let vals = this._index.get(key);
      if (vals) {
        vals.delete(val);
        if (vals.size === 0) {
          this._index.delete(key);
        }
      }
    }
    clear () {
      this._index = new Map();
    }
  }

  const ANY$1 = '@any';
  const NOP$2 = new DocumentChange({
    ops: [],
    info: { action: 'nop' }
  });

  class EditorState extends AppState {
    _initialize (initialState) {
      super._initialize(initialState);

      if (!initialState.document) {
        throw new Error("'document' is required")
      }
      let doc = initialState.document;
      let impl = this._getImpl();
      
      
      
      let documentObserver = new DocumentObserver(doc, this);
      impl.documentObserver = documentObserver;

      let selectionStateReducer = new SelectionStateReducer(this);
      selectionStateReducer.update();
      impl._selectionStateReducer = selectionStateReducer;
    }

    
    init () {
      this._getImpl().documentObserver.init();
    }

    dispose () {
      super.dispose();

      this._getImpl().documentObserver.dispose();
    }

    getUpdate (name) {
      let update = super.getUpdate(name);
      
      
      
      if (!update && name === 'document') {
        let change = NOP$2;
        change._extractInformation();
        update = { change, info: change.info };
      }
      return update
    }

    _createSlot (id, stage, deps) {
      const impl = this._getImpl();
      impl.schedule = null;
      if (deps.indexOf('document') !== -1) {
        return new DocumentSlot(this, id, stage, deps, impl.documentObserver)
      } else {
        return new Slot$1(this, id, stage, deps)
      }
    }

    _reset () {
      super._reset();
      this._getImpl().documentObserver.reset();
    }

    _getDocumentObserver () {
      return this._getImpl().documentObserver
    }
  }

  class Slot$1 {
    constructor (editorState, id, stage, deps) {
      this._id = editorState._getImpl().id;
      this.id = id;
      this.editorState = editorState;
      this.stage = stage;
      this.deps = deps;

      this.observers = new Set();
    }

    addObserver (observer, spec) {
      observer[this._id].set(this.id, {
        slot: this,
        spec
      });
      this.observers.add(observer);
    }

    removeObserver (observer) {
      this._deleteEntry(observer);
      this.observers.delete(observer);
    }

    needsUpdate () {
      const state = this.editorState;
      for (let dep of this.deps) {
        if (state.isDirty(dep)) return true
      }
      return false
    }

    notifyObservers () {
      let observers = this._getObservers();
      
      for (let o of observers) {
        let entry = this._getEntryForObserver(o);
        
        if (!entry) continue
        this._notifyObserver(entry);
      }
    }

    _getObservers () {
      return this.observers
    }

    _getEntryForObserver (observer) {
      let entries = observer[this._id];
      if (entries) {
        return entries.get(this.id)
      }
    }

    _deleteEntry (observer) {
      let entries = observer[this._id];
      if (entries) {
        entries.delete(this.id);
      }
    }

    _getDocumentChange () {
      let { change, info } = this._updates['document'];
      change.info = info;
      return change
    }

    _notifyObserver (entry) {
      const state = this.editorState;
      let spec = entry.spec;
      
      
      
      if (spec.deps.length === 1) {
        let name = spec.deps[0];
        switch (name) {
          case 'document': {
            let update = state.getUpdate('document') || {};
            spec.handler(update.change, update.info);
            break
          }
          default:
            spec.handler(state.get(name));
        }
      } else {
        spec.handler();
      }
    }
  }

  class DocumentSlot extends Slot$1 {
    constructor (editorState, id, stage, deps, documentObserver) {
      super(editorState, id, stage, deps);

      this.documentObserver = documentObserver;
      this.byPath = { '@any': new Set() };
    }

    addObserver (observer, spec) {
      super.addObserver(observer, spec);

      const index = this.byPath;
      let docSpec = spec.options.document;
      if (docSpec && docSpec.path) {
        let key = getKeyForPath(docSpec.path);
        let records = index[key];
        if (!records) {
          records = index[key] = new Set();
        }
        records.add(observer);
      } else {
        index[ANY$1].add(observer);
      }
    }

    removeObserver (observer) {
      const entries = observer[this._id];
      if (entries) {
        const entry = entries.get(this.id);
        const index = this.byPath;
        super.removeObserver(observer);
        let docSpec = entry.spec.options.document;
        if (docSpec && docSpec.path) {
          let key = getKeyForPath(docSpec.path);
          let records = index[key];
          records.delete(observer);
        } else {
          index[ANY$1].delete(observer);
        }
      }
    }

    _getObservers () {
      const state = this.editorState;
      if (!state.isDirty('document')) return this.observers

      
      const index = this.byPath;
      let { change } = state.getUpdate('document');

      if (!change) {
        console.error('FIXME: expected to find a document change as update for document');
        return index[ANY$1]
      }

      let updated = this.documentObserver.dirty;
      let sets = [];
      
      sets.push(index[ANY$1]);
      updated.forEach(id => {
        let set = index[id];
        if (set) sets.push(set);
      });
      let observers = new Set();
      sets.forEach(s => {
        s.forEach(o => observers.add(o));
      });
      return observers
    }
  }

  class SimpleChangeHistory {
    constructor (editorSession) {
      this._editorSession = editorSession;
      this._done = [];
      this._undone = [];
    }

    canUndo () {
      return this._done.length > 0
    }

    canRedo () {
      return this._undone.length > 0
    }

    getChanges () {
      return this._done.slice()
    }

    addChange (change) {
      this._done.push(change);
      
      if (this._undone.length > 0) {
        this._undone.length = 0;
      }
    }

    undo () {
      let change = last(this._done);
      if (change) {
        let inverted = this._editorSession.getDocument().invert(change);
        this._editorSession.applyChange(inverted, { replay: true });
        this._done.pop();
        this._undone.push(change);
        return inverted
      }
    }

    redo () {
      let change = last(this._undone);
      if (change) {
        this._editorSession.applyChange(change, { replay: true });
        this._undone.pop();
        this._done.push(change);
        return change
      }
    }
  }

  class AbstractEditorSession extends EventEmitter {
    constructor (id, document, initialEditorState = {}) {
      super();

      this._id = id;
      this._document = document;
      this._history = this._createChangeHistory();

      this._tx = document.createEditingInterface();
      this._txOps = [];

      let editorState = new EditorState(this._createEditorState(document, initialEditorState));
      this.editorState = editorState;
    }

    _createChangeHistory () {
      return new SimpleChangeHistory(this)
    }

    _createEditorState (document, initialState = {}) {
      return Object.assign({
        document,
        history: this._history,
        selection: Selection.nullSelection,
        selectionState: {},
        hasUnsavedChanges: false,
        isBlurred: false
      }, initialState)
    }

    
    initialize () {
      
      this.editorState.document.on('document:changed', this._onDocumentChange, this);
    }

    dispose () {
      let editorState = this.editorState;
      editorState.document.off(this);
      editorState.off(this);
      editorState.dispose();
    }

    canUndo () {
      return this._history.canUndo()
    }

    canRedo () {
      return this._history.canRedo()
    }

    getChanges () {
      return this._history.getChanges()
    }

    getDocument () {
      return this._document
    }

    getEditorState () {
      return this.editorState
    }

    getFocusedSurface () {
      
      
      
    }

    getSelection () {
      return this._getSelection()
    }

    getSelectionState () {
      return this.editorState.selectionState
    }

    getSurface (surfaceId) {
      
    }

    hasUnsavedChanges () {
      return Boolean(this.editorState.hasUnsavedChanges)
    }

    isBlurred () {
      return Boolean(this.editorState.isBlurred)
    }

    setSelection (sel) {
      
      if (!sel) sel = Selection.nullSelection;
      if (sel && isPlainObject$1(sel)) {
        sel = this.getDocument().createSelection(sel);
      }
      if (sel && !sel.isNull()) {
        if (!sel.surfaceId) {
          let fs = this.getFocusedSurface();
          if (fs) {
            sel.surfaceId = fs.id;
          }
        }
      }
      
      
      
      
      
      if (!sel.isCustomSelection()) {
        if (!sel.surfaceId) {
          _addSurfaceId(sel, this);
        }
        if (!sel.containerPath) {
          _addContainerPath(sel, this);
        }
      }
      const editorState = this.editorState;
      if (editorState.isBlurred) {
        editorState.isBlurred = false;
      }
      this._setSelection(this._normalizeSelection(sel));
      editorState.propagateUpdates();

      return sel
    }

    transaction (transformation, info = {}) {
      let doc = this._document;
      let selBefore = this._getSelection();
      let tx = this._tx;
      let ops = doc._ops;
      ops.length = 0;
      tx.selection = selBefore;
      let transformationCaptured = false;
      try {
        transformation(tx);
        transformationCaptured = true;
      } finally {
        if (!transformationCaptured) {
          this._revert(ops);
        }
      }
      let change = null;
      if (transformationCaptured) {
        let selAfter = tx.selection;
        if (ops.length > 0) {
          change = new DocumentChange(ops, {
            selection: selBefore
          }, {
            selection: selAfter
          });
          change.info = info;
        }
        this._setSelection(this._normalizeSelection(selAfter));
      }
      if (change) {
        let changeApplied = false;
        try {
          this._commit(change, info);
          changeApplied = true;
        } finally {
          if (!changeApplied) {
            change = null;
            this._revert(ops);
            this._setSelection(selBefore);
            
            this.emit('rescue');
          }
        }
      }
      ops.length = 0;

      this.editorState.propagateUpdates();

      return change
    }

    _commit (change, info = {}) {
      let after = change.after;
      let selAfter = after.selection;
      this._setSelection(this._normalizeSelection(selAfter));
      this._document._notifyChangeListeners(change, info);
      this.emit('change', change, info);
      this._history.addChange(change);
    }

    
    
    updateNodeStates (tuples, options = {}) {
      
      const doc = this._document;
      let change = new DocumentChange([], {}, {});
      let info = { action: 'node-state-update' };
      change._extractInformation();
      change.info = info;
      for (let [id, state] of tuples) {
        let node = doc.get(id);
        if (!node) continue
        if (!node.state) node.state = {};
        Object.assign(node.state, state);
        change.updated[id] = true;
      }
      if (!options.silent) {
        doc._notifyChangeListeners(change, info);
        this.emit('change', change, info);
      }
      if (options.propagate) {
        this.editorState.propagateUpdates();
      }
    }

    undo () {
      let change = this._history.undo();
      if (change) {
        this._setSelection(this._normalizeSelection(change.after.selection));
        this.editorState.propagateUpdates();
      }
    }

    redo () {
      let change = this._history.redo();
      if (change) {
        this._setSelection(this._normalizeSelection(change.after.selection));
        this.editorState.propagateUpdates();
      }
    }

    
    resetHistory () {
      this._history.reset();
    }

    applyChange (change, info = {}) {
      if (!change) throw new Error('Invalid change')
      const doc = this.getDocument();
      doc._apply(change);
      if (!info.replay) {
        this._history.addChange(change);
      }
      
      doc._notifyChangeListeners(change, info);
      this.emit('change', change, info);
      if (info.replay) {
        this._setSelection(this._normalizeSelection(change.after.selection));
      }
    }

    _normalizeSelection (sel) {
      const doc = this.getDocument();
      if (!sel) {
        sel = Selection.nullSelection;
      } else {
        sel.attach(doc);
      }
      return sel
    }

    _getSelection () {
      return this.editorState.selection
    }

    _setSelection (sel) {
      this.editorState.selection = sel;
    }

    _onDocumentChange (change, info) {
      
      const editorState = this.editorState;
      
      
      
      
      if (editorState.isDirty('document') && info.action === 'node-state-update') {
        let propagatedChange = editorState.getUpdate('document').change;
        Object.assign(propagatedChange.updated, change.updated);
      } else {
        this.editorState._setUpdate('document', { change, info });
        this.editorState.hasUnsavedChanges = true;
      }
    }

    _onTxOperation (op) {
      this._txOps.push(op);
    }

    _revert () {
      let doc = this._document;
      for (let idx = this._txOps.length - 1; idx--; idx > 0) {
        let op = this._txOps[idx];
        let inverted = op.invert();
        doc._applyOp(inverted);
      }
    }

    _transformSelection (change) {
      var oldSelection = this.getSelection();
      var newSelection = transformSelection(oldSelection, change);
      return newSelection
    }
  }

  function _addSurfaceId (sel, editorSession) {
    if (sel && !sel.isNull() && !sel.surfaceId) {
      
      let surface = editorSession.getFocusedSurface();
      if (surface) {
        sel.surfaceId = surface.id;
      }
    }
  }

  function _addContainerPath (sel, editorSession) {
    if (sel && !sel.isNull() && sel.surfaceId && !sel.containerPath) {
      let surface = editorSession.getSurface(sel.surfaceId);
      if (surface) {
        let containerPath = surface.getContainerPath();
        if (containerPath) {
          
          sel.containerPath = containerPath;
        }
      }
    }
  }

  class VirtualElement extends DOMElement {
    constructor (owner) {
      super();

      
      this.parent = null;
      
      this._owner = owner;
      
      this._ref = null;
    }

    getParent () {
      return this.parent
    }

    get childNodes () {
      return this.getChildNodes()
    }

    getChildCount () {
      return this.children.length
    }

    getChildAt (idx) {
      return this.children[idx]
    }

    
    getComponent () {
      return this._comp
    }

    
    ref (ref) {
      if (!ref) throw new Error('Illegal argument')
      
      
      if (this._ref) throw new Error('A VirtualElement can only be referenced once.')
      this._ref = ref;
      if (this._context) {
        const refs = this._context.refs;
        if (refs.has(ref)) {
          throw new Error('An item with reference "' + ref + '" already exists.')
        }
        refs.set(ref, this);
      }
      return this
    }

    isInDocument () {
      return false
    }

    get _isVirtualElement () { return true }
  }


  class VirtualHTMLElement extends VirtualElement {
    constructor (tagName) {
      super();

      this._tagName = tagName;
      this.classNames = null;
      this.attributes = null;
      this.htmlProps = null;
      this.style = null;
      this.eventListeners = null;

      
      this.children = [];
    }

    getTagName () {
      return this._tagName
    }

    setTagName (tagName) {
      this._tagName = tagName;
      return this
    }

    hasClass (className) {
      if (this.classNames) {
        return this.classNames.indexOf(className) > -1
      }
      return false
    }

    addClass (className) {
      if (!this.classNames) {
        this.classNames = [];
      }
      this.classNames.push(className);
      return this
    }

    removeClass (className) {
      if (this.classNames) {
        this.classNames = without(this.classNames, className);
      }
      return this
    }

    removeAttribute (name) {
      if (this.attributes) {
        this.attributes.delete(name);
      }
      return this
    }

    getAttribute (name) {
      if (this.attributes) {
        return this.attributes.get(name)
      }
    }

    setAttribute (name, value) {
      if (!this.attributes) {
        this.attributes = new Map();
      }
      this.attributes.set(name, value);
      return this
    }

    getAttributes () {
      
      
      
      
      
      let entries = [];
      if (this.attributes) {
        entries = Array.from(this.attributes);
      }
      if (this.classNames) {
        entries.push(['class', this.classNames.join(' ')]);
      }
      if (this.style) {
        entries.push(['style', map$1(this.style, function (val, key) {
          return key + ':' + val
        }).join(';')]);
      }
      return new Map(entries)
    }

    getId () {
      return this.getAttribute('id')
    }

    setId (id) {
      this.setAttribute('id', id);
      return this
    }

    setTextContent (text) {
      text = String(text || '');
      this.empty();
      this.appendChild(text);
      return this
    }

    setInnerHTML (html) {
      html = html || '';
      this.empty();
      this._innerHTMLString = html;
      return this
    }

    getInnerHTML () {
      if (!this.hasOwnProperty('_innerHTMLString')) {
        throw new Error('Not supported.')
      } else {
        return this._innerHTMLString
      }
    }

    getValue () {
      return this.htmlProp('value')
    }

    setValue (value) {
      this.htmlProp('value', value);
      return this
    }

    getChildNodes () {
      return this.children
    }

    getChildren () {
      return this.children.filter(function (child) {
        return child.getNodeType() !== 'text'
      })
    }

    isTextNode () {
      return false
    }

    isElementNode () {
      return true
    }

    isCommentNode () {
      return false
    }

    isDocumentNode () {
      return false
    }

    append () {
      if (this._innerHTMLString) {
        throw Error('It is not possible to mix $$.html() with $$.append(). You can call $$.empty() to reset this virtual element.')
      }
      this._append(this.children, arguments);
      return this
    }

    appendChild (child) {
      if (this._innerHTMLString) {
        throw Error('It is not possible to mix $$.html() with $$.append(). You can call $$.empty() to reset this virtual element.')
      }
      this._appendChild(this.children, child);
      return this
    }

    insertAt (pos, child) {
      child = this._normalizeChild(child);
      if (!child) {
        throw new Error('Illegal child: ' + child)
      }
      if (!child._isVirtualElement) {
        throw new Error('Illegal argument for $$.insertAt():' + child)
      }
      if (pos < 0 || pos > this.children.length) {
        throw new Error('insertAt(): index out of bounds.')
      }
      this._insertAt(this.children, pos, child);
      return this
    }

    insertBefore (child, before) {
      var pos = this.children.indexOf(before);
      if (pos > -1) {
        this.insertAt(pos, child);
      } else {
        throw new Error('insertBefore(): reference node is not a child of this element.')
      }
      return this
    }

    removeAt (pos) {
      if (pos < 0 || pos >= this.children.length) {
        throw new Error('removeAt(): Index out of bounds.')
      }
      this._removeAt(pos);
      return this
    }

    removeChild (child) {
      if (!child || !child._isVirtualElement) {
        throw new Error('removeChild(): Illegal arguments. Expecting a CheerioDOMElement instance.')
      }
      var idx = this.children.indexOf(child);
      if (idx < 0) {
        throw new Error('removeChild(): element is not a child.')
      }
      this.removeAt(idx);
      return this
    }

    replaceChild (oldChild, newChild) {
      if (!newChild || !oldChild ||
          !newChild._isVirtualElement || !oldChild._isVirtualElement) {
        throw new Error('replaceChild(): Illegal arguments. Expecting BrowserDOMElement instances.')
      }
      var idx = this.children.indexOf(oldChild);
      if (idx < 0) {
        throw new Error('replaceChild(): element is not a child.')
      }
      this.removeAt(idx);
      this.insertAt(idx, newChild);
      return this
    }

    empty () {
      var children = this.children;
      while (children.length) {
        var child = children.pop();
        child.parent = null;
      }
      delete this._innerHTMLString;
      return this
    }

    getProperty (name) {
      if (this.htmlProps) {
        return this.htmlProps.get(name)
      }
    }

    setProperty (name, value) {
      if (!this.htmlProps) {
        this.htmlProps = new Map();
      }
      this.htmlProps.set(name, value);
      return this
    }

    removeProperty (name) {
      if (this.htmlProps) {
        this.htmlProps.delete(name);
      }
      return this
    }

    getStyle (name) {
      if (this.style) {
        return this.style.get(name)
      }
    }

    setStyle (name, value) {
      if (!this.style) {
        this.style = new Map();
      }
      if (DOMElement.pxStyles[name] && isNumber(value)) value = value + 'px';
      this.style.set(name, value);
      return this
    }

    _createEventListener (eventName, handler, options) {
      options.context = options.context || this._owner._comp;
      return super._createEventListener(eventName, handler, options)
    }

    getNodeType () {
      return 'element'
    }

    hasInnerHTML () {
      return Boolean(this._innerHTMLString)
    }

    _normalizeChild (child) {
      if (isNil(child)) ; else if (child._isVirtualElement) {
        return child
      } else if (isString(child) || isBoolean(child) || isNumber(child)) {
        return new VirtualTextNode(String(child))
      } else {
        throw new Error('Unsupported child type')
      }
    }

    _append (outlet, args) {
      if (args.length === 1 && !isArray(args[0])) {
        this._appendChild(outlet, args[0]);
        return
      }
      var children;
      if (isArray(args[0])) {
        children = args[0];
      } else if (arguments.length > 1) {
        children = Array.prototype.slice.call(args, 0);
      } else {
        return
      }
      children.forEach(this._appendChild.bind(this, outlet));
    }

    _appendChild (outlet, child) {
      child = this._normalizeChild(child);
      
      
      if (!child) return
      outlet.push(child);
      this._attach(child);
      return child
    }

    _insertAt (outlet, pos, child) {
      if (!child) return
      outlet.splice(pos, 0, child);
      this._attach(child);
    }

    _removeAt (outlet, pos) {
      var child = outlet[pos];
      outlet.splice(pos, 1);
      this._detach(child);
    }

    _attach (child) {
      child.parent = this;
      if (this._context) {
        
        
        if (child._owner !== this._owner && child._isVirtualComponent) {
          this._context.injectedComponents.push(child);
        }
        if (child._owner !== this._owner && child._ref) {
          this._context.foreignRefs[child._ref] = child;
        }
      }
    }

    _detach (child) {
      child.parent = null;
      if (this._context) {
        if (child._isVirtualComponent) {
          deleteFromArray(this._context.injectedComponents, child);
        }
        if (child._owner !== this._owner && child._ref) {
          this._context.foreignRefs.delete(child._ref);
        }
      }
    }

    _copy () {
      if (this.classNames || this.attributes || this.eventListeners || this.htmlProps || this.style) {
        let copy = {};
        if (this.classNames) {
          copy.classNames = this.classNames.slice();
        }
        if (this.attributes) {
          copy.attributes = new Map(this.attributes);
        }
        if (this.eventListeners) {
          copy.eventListeners = this.eventListeners.slice();
        }
        if (this.htmlProps) {
          copy.htmlProps = new Map(this.htmlProps);
        }
        if (this.style) {
          copy.style = new Map(this.style);
        }
        return copy
      }
    }

    _clear () {
      this.classNames = null;
      this.attributes = null;
      this.htmlProps = null;
      this.style = null;
      this.eventListeners = null;
    }

    _merge (other) {
      if (!other) return
      const ARRAY_TYPE_VALS = ['classNames', 'eventListeners'];
      for (let name of ARRAY_TYPE_VALS) {
        let otherVal = other[name];
        if (otherVal) {
          let thisVal = this[name];
          if (!thisVal) {
            this[name] = otherVal.slice();
          } else {
            this[name] = thisVal.concat(otherVal);
          }
        }
      }
      const MAP_TYPE_VALS = ['attributes', 'htmlProps', 'style'];
      for (let name of MAP_TYPE_VALS) {
        let otherVal = other[name];
        if (otherVal) {
          let thisVal = this[name];
          if (!thisVal) {
            this[name] = new Map(otherVal);
          } else {
            this[name] = new Map([...thisVal, ...otherVal]);
          }
        }
      }
    }

    get _isVirtualHTMLElement () { return true }
  }


  class VirtualComponent extends VirtualHTMLElement {
    constructor (ComponentClass, props) {
      super();

      props = props || {};

      this.ComponentClass = ComponentClass;
      this.props = props;
      if (!props.children) {
        props.children = [];
      }
      this.children = props.children;
    }

    getComponent () {
      return this._comp
    }

    
    
    getChildren () {
      return this.props.children
    }

    getNodeType () {
      return 'component'
    }

    
    
    outlet (name) {
      return new Outlet(this, name)
    }

    setInnerHTML () {
      throw new Error('Can not set innerHTML of a Component')
    }

    _attach (child) {
      child._preliminaryParent = this;
    }

    _detach (child) {
      child._preliminaryParent = null;
    }

    get _isVirtualHTMLElement () { return false }

    get _isVirtualComponent () { return true }
  }

  class Outlet {
    constructor (virtualEl, name) {
      this.virtualEl = virtualEl;
      this.name = name;
      Object.freeze(this);
    }

    _getOutlet () {
      var outlet = this.virtualEl.props[this.name];
      if (!outlet) {
        outlet = [];
        this.virtualEl.props[this.name] = outlet;
      }
      return outlet
    }

    append () {
      var outlet = this._getOutlet();
      this.virtualEl._append(outlet, arguments);
      return this
    }

    empty () {
      var arr = this.virtualEl.props[this.name];
      arr.forEach(function (el) {
        this._detach(el);
      }.bind(this));
      arr.splice(0, arr.length);
      return this
    }
  }

  class VirtualTextNode extends VirtualElement {
    constructor (text) {
      super();
      this.text = text;
    }

    get _isVirtualTextNode () { return true }
  }

  VirtualElement.Component = VirtualComponent;
  VirtualElement.TextNode = VirtualTextNode;


  VirtualElement.createElement = function () {
    var content;
    var _first = arguments[0];
    var _second = arguments[1];
    var type;
    if (isString(_first)) {
      type = 'element';
    } else if (isFunction(_first) && _first.prototype._isComponent) {
      type = 'component';
    } else if (isNil(_first)) {
      throw new Error('$$(null): provided argument was null or undefined.')
    } else {
      throw new Error('Illegal usage of $$()')
    }
    
    var props = {};
    var classNames, ref;
    var eventHandlers = [];
    for (var key in _second) {
      if (!_second.hasOwnProperty(key)) continue
      var val = _second[key];
      switch (key) {
        case 'class':
          classNames = val;
          break
        case 'ref':
          ref = val;
          break
        default:
          props[key] = val;
      }
    }
    if (type === 'element') {
      content = new VirtualHTMLElement(_first);
      
      
      content.attr(props);
    } else {
      content = new VirtualComponent(_first, props);
    }
    
    
    content._owner = this.owner;
    if (classNames) {
      content.addClass(classNames);
    }
    if (ref) {
      content.ref(ref);
    }
    eventHandlers.forEach(function (h) {
      if (isFunction(h.handler)) {
        content.on(h.name, h.handler);
      } else if (isPlainObject$1(h.handler)) {
        var params = h.handler;
        content.on(h.name, params.handler, params.context, params);
      } else {
        throw new Error('Illegal arguments for $$(_,{ on' + h.name + '})')
      }
    });
    
    
    if (arguments.length > 2) {
      content.append(flattenOften(Array.prototype.slice.call(arguments, 2), 3));
    }
    return content
  };

  VirtualElement.Context = class VirtualElementContext {
    constructor (owner) {
      this.owner = owner;
      
      this.refs = new Map();
      
      
      this.foreignRefs = new Map();
      
      this.elements = [];
      
      this.components = [];
      
      this.injectedComponents = [];
      this.$$ = this._createComponent.bind(this);
      this.$$.capturing = true;
    }

    _createComponent () {
      let vel = VirtualElement.createElement.apply(this, arguments);
      vel._context = this;
      vel._owner = this.owner;
      if (vel._isVirtualComponent) {
        
        this.components.push(vel);
      }
      this.elements.push(vel);
      return vel
    }
  };

  const TOP_LEVEL_ELEMENT = Symbol('TOP_LEVEL_ELEMENT');


  class RenderingEngine {
    constructor (options = {}) {
      this.componentFactory = options.componentFactory;
      if (!this.componentFactory) throw new Error("'componentFactory' is mandatory")
      this.elementFactory = options.elementFactory || DefaultDOMElement.createDocument('html');
      if (!this.elementFactory) throw new Error("'elementFactory' is mandatory")
    }

    _render (comp, oldProps, oldState) {
      if (substanceGlobals.VERBOSE_RENDERING_ENGINE) {
        console.group('RenderingEngine');
        if (!comp.el) {
          console.log('Rendering Engine: initial render of %s', comp.constructor.name);
        } else {
          console.log('Rendering Engine: re-render of %s', comp.constructor.name);
        }
        console.time('rendering (total)');
      }
      let vel = _createWrappingVirtualComponent(comp);
      let state = this._createState();
      if (oldProps) {
        state.set(OLDPROPS, vel, oldProps);
      }
      if (oldState) {
        state.set(OLDSTATE, vel, oldState);
      }
      try {
        if (substanceGlobals.VERBOSE_RENDERING_ENGINE) {
          console.time('capturing');
        }
        
        _capture(state, vel, TOP_LEVEL_ELEMENT);
        if (substanceGlobals.VERBOSE_RENDERING_ENGINE) {
          console.timeEnd('capturing');
        }

        if (substanceGlobals.VERBOSE_RENDERING_ENGINE) {
          console.time('updating');
        }
        _update(state, vel);
        if (substanceGlobals.VERBOSE_RENDERING_ENGINE) {
          console.timeEnd('updating');
        }

        _triggerDidUpdate(state, vel);
      } finally {
        if (substanceGlobals.VERBOSE_RENDERING_ENGINE) {
          console.timeEnd('rendering (total)');
          console.groupEnd('RenderingEngine');
        }
        state.dispose();
      }
    }

    
    
    
    
    _renderChild (comp, vel) {
      
      
      let state = this._createState();
      vel.parent = { _comp: comp, _isFake: true };
      try {
        _capture(state, vel);
        _update(state, vel);
        return vel._comp
      } finally {
        state.dispose();
      }
    }

    _createState () {
      return new RenderingState(this.componentFactory, this.elementFactory)
    }

    static createContext (comp) {
      let vel = _createWrappingVirtualComponent(comp);
      return new VirtualElement.Context(vel)
    }
  }


  function _capture (state, vel, mode) {
    if (state.is(CAPTURED, vel)) {
      return vel
    }
    
    let comp = vel._comp;
    if (!comp) {
      comp = _create(state, vel);
      state.set(NEW, vel);
    }
    if (vel._isVirtualComponent) {
      let needRerender;
      
      
      
      if (mode === TOP_LEVEL_ELEMENT) {
        needRerender = true;
        
        console.assert(vel._comp === comp, 'top-level element and component should be linked already');
        state.set(MAPPED, vel);
        state.set(MAPPED, comp);
        state.set(LINKED, vel);
        state.set(LINKED, comp);
        let compData = _getInternalComponentData(comp);
        vel.elementProps = compData.elementProps;
      } else {
        
        needRerender = !comp.el || comp.shouldRerender(vel.props, comp.state);
        
        
        
        
        
        vel.elementProps = vel._copy();
        vel._clear();
        state.set(OLDPROPS, vel, comp.props);
        state.set(OLDSTATE, vel, comp.state);
        
        comp._setProps(vel.props);
        if (!state.is(NEW, vel)) {
          state.set(UPDATED, vel);
        }
      }
      if (needRerender) {
        let context = new VirtualElement.Context(vel);
        let content = comp.render(context.$$);
        if (!content) {
          throw new Error('Component.render() returned nil.')
        } else if (content._isVirtualComponent) {
          
          
          vel._forwardedEl = content;
          vel._isForwarding = true;
          content._isForwarded = true;
          content.parent = vel;
          vel.children = [content];
        } else if (content._isVirtualHTMLElement) {
          
          vel.tagName = content.tagName;
          vel._merge(content);
          if (content.hasInnerHTML()) {
            vel._innerHTMLString = content._innerHTMLString;
            vel.children = [];
          } else {
            vel.children = content.children;
            
            vel.children.forEach(child => {
              child.parent = vel;
            });
          }
        } else {
          throw new Error('render() must return a plain element or a Component')
        }
        
        vel._context = content._context;

        
        
        if (vel.elementProps) {
          vel._merge(vel.elementProps);
          
          
          if (vel._isForwarding) {
            vel._forwardedEl._merge(vel);
          }
        }

        
        if (!state.is(NEW, vel) && comp.isMounted()) {
          state.set(UPDATED, vel);
        }

        
        
        
        _forEachComponent(state, comp, vel, _linkComponent);

        
        if (substanceGlobals.DEBUG_RENDERING) {
          
          
          
          
          let stack = vel.children.slice(0);
          while (stack.length) {
            let child = stack.shift();
            if (state.is(CAPTURED, child)) continue
            
            if (child._isVirtualComponent) continue
            if (!child._comp) {
              _create(state, child);
            }
            if (child._isVirtualHTMLElement && child.children.length > 0) {
              stack = stack.concat(child.children);
            }
            state.set(CAPTURED, child);
          }
          
          
          let descendingContext = new DescendingContext(state, context);
          while (descendingContext.hasPendingCaptures()) {
            descendingContext.reset();
            comp.render(descendingContext.$$);
          }
          
          
          for (let child of context.injectedComponents) {
            _capture(state, child);
          }
          
          
          
          if (vel._forwardedEl) {
            _capture(state, vel._forwardedEl);
          }
        } else {
          
          
          
          
          
          if (vel._forwardedEl) {
            _capture(state, vel._forwardedEl);
          } else {
            for (let child of vel.children) {
              _capture(state, child);
            }
          }
        }
        _forEachComponent(state, comp, vel, _propagateLinking);
      } else {
        
        state.set(SKIPPED, vel);
      }
    } else if (vel._isVirtualHTMLElement) {
      for (let child of vel.children) {
        _capture(state, child);
      }
    }

    state.set(CAPTURED, vel);
    return vel
  }



  function _create (state, vel) {
    let comp = vel._comp;
    console.assert(!comp, 'Component instance should not exist when this method is used.');
    let parent = vel.parent._comp;
    
    if (!parent) {
      parent = _create(state, vel.parent);
    }
    
    if (vel._isVirtualComponent) {
      console.assert(parent, 'A Component should have a parent.');
      comp = state.componentFactory.createComponent(vel.ComponentClass, parent, vel.props);
      
      
      vel.props = comp.props;
      if (vel._forwardedEl) {
        let forwardedEl = vel._forwardedEl;
        let forwardedComp = state.componentFactory.createComponent(forwardedEl.ComponentClass, comp, forwardedEl.props);
        
        forwardedEl.props = forwardedComp.props;
        comp._forwardedComp = forwardedComp;
      }
    } else if (vel._isVirtualHTMLElement) {
      comp = state.componentFactory.createElementComponent(parent, vel);
    } else if (vel._isVirtualTextNode) {
      comp = state.componentFactory.createTextNodeComponent(parent, vel);
    }
    if (vel._ref) {
      comp._ref = vel._ref;
    }
    if (vel._owner) {
      comp._owner = vel._owner._comp;
    }
    vel._comp = comp;
    return comp
  }


  function _forEachComponent (state, comp, vc, hook) {
    console.assert(vc._isVirtualComponent, 'this method is intended for VirtualComponents only');
    if (!vc.__components__) {
      let context = vc._context;
      console.assert(context, 'there should be a capturing context on the VirtualComponent');
      
      let newRefs = context.refs;
      
      let newForeignRefs = context.foreignRefs;
      
      if (!context.internalRefs) {
        context.internalRefs = _extractInternalRefs(context, vc);
      }
      let newInternalRefs = context.internalRefs;
      let entries = [];
      let compData = _getInternalComponentData(comp);
      let oldRefs = compData.refs;
      let oldForeignRefs = compData.foreignRefs;
      
      let oldInternalRefs = compData.internalRefs || new Map();
      let _addEntries = (_newRefs, _oldRefs) => {
        for (let [ref, vc] of _newRefs) {
          let oldVc = _oldRefs.get(ref);
          let comp;
          if (oldVc) {
            comp = oldVc._comp;
          }
          entries.push({ vc, comp });
        }
      };
      if (newRefs.size > 0) _addEntries(newRefs, oldRefs);
      if (newForeignRefs.size > 0) _addEntries(newForeignRefs, oldForeignRefs);
      if (newInternalRefs.size > 0) _addEntries(newInternalRefs, oldInternalRefs);
      vc.__components__ = entries;
    }
    if (vc.__components__.length > 0) {
      for (let entry of vc.__components__) {
        hook(state, entry.comp, entry.vc);
      }
    }
  }

  function _linkComponent (state, comp, vc) {
    
    if (!comp) {
      _reject(state, comp, vc);
      return
    }
    if (_isMapped(state, comp, vc)) return
    if (_isLinked(state, comp, vc)) return
    if (_isOfSameType(comp, vc)) {
      _link(state, comp, vc);
    } else {
      _reject(state, comp, vc);
    }
  }

  function _link (state, comp, vc) {
    vc._comp = comp;
    state.set(MAPPED, vc);
    state.set(MAPPED, comp);
    state.set(LINKED, vc);
    state.set(LINKED, comp);
  }

  function _reject (state, comp, vc) {
    vc._comp = null;
    state.set(MAPPED, vc);
    if (comp) state.set(MAPPED, comp);
  }

  function _isMapped (state, comp, vc) {
    const vcIsMapped = state.is(MAPPED, vc);
    const compIsMapped = state.is(MAPPED, comp);
    if (vcIsMapped || compIsMapped) {
      return true
    }
    return false
  }

  function _isLinked (state, comp, vc) {
    let compIsLinked = state.is(LINKED, comp);
    let vcIsLinked = state.is(LINKED, vc);
    if (vc._comp === comp) {
      if (!vcIsLinked) {
        console.error('FIXME: comp is linked, but not virtual component');
        state.set(LINKED, vc);
      }
      if (!compIsLinked) {
        console.error('FIXME: virtual comp is linked, but not component');
        state.set(LINKED, vc);
      }
      return true
    }
    return false
  }


  function _propagateLinking (state, comp, vel, stopIfMapped) {
    if (!vel) {
      console.error('DOCUMENT WHY THIS IS NEEDED');
      return false
    }
    
    
    if (!comp) {
      return false
    }
    
    if (stopIfMapped && _isMapped(state, comp, vel)) {
      return _isLinked(state, comp, vel)
    }

    
    
    if (!vel._isVirtualComponent) {
      if (!_isOfSameType(comp, vel)) {
        _reject(state, comp, vel);
        
        return false
      } else {
        _link(state, comp, vel);
      }
    }

    
    let canLinkParent = false;
    let parent = comp.getParent();
    if (vel.parent) {
      canLinkParent = _propagateLinking(state, parent, vel.parent, true);
    
    
    
    
    } else if (vel._preliminaryParent) {
      while (parent && parent._isElementComponent) {
        parent = parent.getParent();
      }
      canLinkParent = _propagateLinking(state, parent, vel._preliminaryParent, true);
    }
    
    
    
    
    
    if (vel._isVirtualComponent && !canLinkParent) {
      if (substanceGlobals.VERBOSE_RENDERING_ENGINE) {
        console.info('Component has been relocated: ' + comp.constructor.name);
      }
      state.set(RELOCATED, vel);
      state.set(RELOCATED, comp);
    }
    return canLinkParent
  }

  function _isOfSameType (comp, vc) {
    return (
      (comp._isElementComponent && vc._isVirtualHTMLElement) ||
      (comp._isComponent && vc._isVirtualComponent && comp.constructor === vc.ComponentClass) ||
      (comp._isTextNodeComponent && vc._isVirtualTextNode)
    )
  }


  function _update (state, vel) {
    
    
    

    if (state.is(SKIPPED, vel)) return
    

    let comp = vel._comp;

    
    
    
    
    
    
    
    if (!comp) {
      if (vel._ref && vel._preliminaryParent !== vel._owner) {
        _capture(state, vel);
      }
    }
    console.assert(comp && comp._isComponent, 'A captured VirtualElement must have a component instance attached.');

    
    
    if (vel._isForwarding) {
      _update(state, vel._forwardedEl);
    } else {
      
      if (!comp.el) {
        comp.el = _createDOMElement(state, vel);
      } else {
        let el = comp.el;
        console.assert(el, "Component's element should exist at this point.");
        _updateDOMElement(el, vel);
      }

      
      
      
      

      
      if ((vel._isVirtualComponent || vel._isVirtualHTMLElement) && !vel.hasInnerHTML()) {
        let newChildren = vel.children;

        
        
        
        
        
        let _childNodes = comp.el.getChildNodes();
        let oldChildren = _childNodes.map(child => {
          let childComp = child._comp;
          
          if (!childComp) {
            comp.el.removeChild(child);
            return null
          }
          
          
          
          
          
          if (childComp._isForwarded()) {
            childComp = _findForwardingChildOfComponent(comp, childComp);
          }
          
          if (!childComp || state.is(RELOCATED, childComp)) {
            comp.el.removeChild(child);
            return null
          } else {
            return childComp
          }
        }).filter(Boolean);

        
        
        
        
        let pos1 = 0; let pos2 = 0;
        while (pos1 < oldChildren.length || pos2 < newChildren.length) {
          let oldComp;
          
          
          
          
          
          do {
            oldComp = oldChildren[pos1++];
          } while (oldComp && (state.is(DETACHED, oldComp)))

          let newVel = newChildren[pos2++];
          
          if (oldComp && !newVel) {
            while (oldComp) {
              _removeChild(state, comp, oldComp);
              oldComp = oldChildren[pos1++];
            }
            break
          }

          
          if (oldComp && oldComp.el.isTextNode() &&
              newVel && newVel._isVirtualTextNode &&
              oldComp.el.textContent === newVel.text) {
            continue
          }

          
          
          
          
          
          if (oldComp && oldComp._isElementComponent &&
              newVel._isVirtualHTMLElement &&
              !state.is(MAPPED, oldComp) && !state.is(MAPPED, newVel) &&
              oldComp.tagName === newVel.tagName) {
            
            newVel._comp = oldComp;
            state.set(LINKED, newVel);
            state.set(LINKED, oldComp);
            _update(state, newVel);
            continue
          }

          
          if (!state.is(RENDERED, newVel)) {
            _update(state, newVel);
          }

          let newComp = newVel._comp;
          
          if (newComp === oldComp) {
            continue
          }
          
          
          if (state.is(RELOCATED, newComp)) {
            newComp._setParent(comp);
          }
          console.assert(newComp, 'Component instance should now be available.');

          
          if (newVel && !oldComp) {
            _appendChild(state, comp, newComp);
            continue
          }

          
          if (state.is(LINKED, newVel)) {
            if (state.is(LINKED, oldComp)) {
              
              state.set(DETACHED, oldComp);
              _removeChild(state, comp, oldComp);
              pos2--;
            
            } else {
              _removeChild(state, comp, oldComp);
              pos2--;
            }
          } else if (state.is(LINKED, oldComp)) {
            _insertChildBefore(state, comp, newComp, oldComp);
            pos1--;
          } else {
            
            
            
            
            
            _replaceChild(state, comp, oldComp, newComp);
          }
        }
      }
    }

    if (vel._isVirtualComponent) {
      _storeInternalData(comp, vel);

      
      if (vel._forwardedEl) {
        let forwardedComp = vel._forwardedEl._comp;
        
        
        
        if (!comp.el) {
          comp.el = forwardedComp.el;
          
          
        } else {
          
          let oldForwardedComp = comp.el._comp;
          if (oldForwardedComp !== forwardedComp) {
            oldForwardedComp.triggerDispose();
            comp.el.parentNode.replaceChild(comp.el, forwardedComp.el);
            comp.el = forwardedComp.el;
            forwardedComp.triggerDidMount();
          }
        }
      }
    }

    state.set(RENDERED, vel);
    state.set(RENDERED, comp);
  }

  function _getInternalComponentData (comp) {
    if (!comp.__internal__) {
      comp.__internal__ = new InternalComponentData();
    }
    return comp.__internal__
  }

  function _storeInternalData (comp, vc) {
    let context = vc._context;
    let compData = _getInternalComponentData(comp);
    compData.elementProps = vc.elementProps;
    compData.refs = context.refs;
    compData.foreignRefs = context.foreignRefs;
    compData.internalRefs = context.internalRefs;
    
    comp.refs = Array.from(context.refs).reduce((refs, [key, vc]) => {
      
      
      
      let comp = vc._comp;
      if (comp) {
        refs[key] = vc._comp;
      } else {
        console.warn(`Warning: component with reference '${key}' has not been used`);
      }
      return refs
    }, {});
  }

  function _extractInternalRefs (context, root) {
    let idCounts = new Map();
    let refs = new Map();
    for (let vc of context.components) {
      
      if (vc._ref) continue
      let ref = _getVirtualComponentTrace(vc, root);
      
      if (idCounts.has(ref)) {
        let count = idCounts.get(ref) + 1;
        idCounts.set(ref, count);
        ref = ref + '@' + count;
      } else {
        idCounts.set(ref, 1);
      }
      refs.set(ref, vc);
    }
    return refs
  }

  function _getVirtualComponentTrace (vc, root) {
    let frags = [vc.ComponentClass.name];
    
    if (!vc._isForwarded) {
      let parent = vc.getParent();
      while (parent) {
        if (parent === root) break
        
        if (parent._isFake) break
        
        console.assert(parent._isVirtualHTMLElement);
        frags.unshift(parent.tagName);
        parent = parent.parent;
      }
    }
    return frags.join('/')
  }

  function _triggerDidUpdate (state, vel) {
    if (vel._isVirtualComponent) {
      if (!state.is(SKIPPED, vel)) {
        vel.children.forEach(_triggerDidUpdate.bind(null, state));
      }
      if (state.is(UPDATED, vel)) {
        vel._comp.didUpdate(state.get(OLDPROPS, vel), state.get(OLDSTATE, vel));
      }
    } else if (vel._isVirtualHTMLElement) {
      vel.children.forEach(_triggerDidUpdate.bind(null, state));
    }
  }

  function _appendChild (state, parent, child) {
    parent.el.appendChild(child.el);
    _triggerDidMount(state, parent, child);
  }

  function _replaceChild (state, parent, oldChild, newChild) {
    parent.el.replaceChild(oldChild.el, newChild.el);
    if (!state.is(DETACHED, oldChild)) {
      oldChild.triggerDispose();
    }
    _triggerDidMount(state, parent, newChild);
  }

  function _insertChildBefore (state, parent, child, before) {
    parent.el.insertBefore(child.el, before.el);
    _triggerDidMount(state, parent, child);
  }

  function _removeChild (state, parent, child) {
    parent.el.removeChild(child.el);
    if (!state.is(DETACHED, child)) {
      child.triggerDispose();
    }
  }

  function _triggerDidMount (state, parent, child) {
    if (!state.is(DETACHED, child) &&
        parent.isMounted() && !child.isMounted()) {
      child.triggerDidMount(true);
    }
  }

  function _createDOMElement (state, vel) {
    let el;
    if (vel._isVirtualTextNode) {
      el = state.elementFactory.createTextNode(vel.text);
    } else {
      el = state.elementFactory.createElement(vel.tagName);
    }
    if (vel._comp) {
      el._comp = vel._comp;
    }
    _updateDOMElement(el, vel);
    return el
  }

  function _updateDOMElement (el, vel) {
    
    if (vel._isVirtualTextNode) {
      el.setTextContent(vel.text);
      return
    }
    let tagName = el.getTagName();
    if (vel.tagName.toLowerCase() !== tagName) {
      el.setTagName(vel.tagName);
    }
    _updateHash({
      oldHash: el.getAttributes(),
      newHash: vel.getAttributes(),
      update: function (key, val) {
        el.setAttribute(key, val);
      },
      remove: function (key) {
        el.removeAttribute(key);
      }
    });
    _updateHash({
      oldHash: el.htmlProps,
      newHash: vel.htmlProps,
      update: function (key, val) {
        el.setProperty(key, val);
      },
      remove: function (key) {
        el.removeProperty(key);
      }
    });
    _updateListeners({
      el,
      oldListeners: el.getEventListeners(),
      newListeners: vel.getEventListeners()
    });

    
    if (vel.hasInnerHTML()) {
      if (!el._hasInnerHTML) {
        el.empty();
        el.setInnerHTML(vel.getInnerHTML());
      } else {
        let oldInnerHTML = el.getInnerHTML();
        let newInnerHTML = vel.getInnerHTML();
        if (oldInnerHTML !== newInnerHTML) {
          el.setInnerHTML(newInnerHTML);
        }
      }
      el._hasInnerHTML = true;
    }
  }

  function _hashGet (hash, key) {
    if (hash instanceof Map) {
      return hash.get(key)
    } else {
      return hash[key]
    }
  }

  function _updateHash ({ newHash, oldHash, update, remove }) {
    if (!newHash && !oldHash) return
    
    if (!newHash) {
      newHash = new Map();
    }
    
    if (!oldHash) {
      oldHash = new Map();
    }
    let updatedKeys = {};
    
    
    
    for (let key of newHash.keys()) {
      let oldVal = _hashGet(oldHash, key);
      let newVal = _hashGet(newHash, key);
      updatedKeys[key] = true;
      if (oldVal !== newVal) {
        update(key, newVal);
      }
    }
    
    
    
    if (isFunction(oldHash.keys) && oldHash.size > 0) {
      let keys = Array.from(oldHash.keys());
      keys.forEach((key) => {
        if (!updatedKeys[key]) {
          remove(key);
        }
      });
    } else {
      for (let key in oldHash) {
        if (oldHash.hasOwnProperty(key) && !updatedKeys[key]) {
          remove(key);
        }
      }
    }
  }

  function _updateListeners (args) {
    let el = args.el;
    
    
    
    let newListeners = args.newListeners || [];
    el.removeAllEventListeners();
    for (let i = 0; i < newListeners.length; i++) {
      el.addEventListener(newListeners[i]);
    }
  }

  function _findForwardingChildOfComponent (comp, forwarded) {
    let current = forwarded.getParent();
    while (current) {
      let parent = current.getParent();
      if (parent === comp) {
        return current
      }
      current = parent;
    }
  }


  class DescendingContext {
    constructor (state, captureContext) {
      this.state = state;
      this.owner = captureContext.owner;
      this.refs = new Map();
      this.foreignRefs = new Map();
      this.internalRefs = null;
      this.elements = captureContext.elements;
      this.pos = 0;
      this.updates = captureContext.components.length;
      this.remaining = this.updates;
      this.injectedComponents = captureContext.injectedComponents;

      this.$$ = this._$$.bind(this);
    }

    _$$ () {
      let state = this.state;
      let vel = this.elements[this.pos++];
      
      
      
      if (!state.is(CAPTURED, vel) && vel._isVirtualComponent) {
        let parent = vel.parent;
        if (parent && (parent === this.owner || state.is(CAPTURED, vel.parent))) {
          _capture(state, vel);
          this.updates++;
          this.remaining--;
        }
      }
      
      
      
      
      vel = VirtualElement.createElement.apply(this, arguments);
      
      vel._context = this;
      vel._owner = this.owner;
      
      
      vel._attach = function () {};
      vel._detach = function () {};
      return vel
    }

    hasPendingCaptures () {
      return this.updates > 0 && this.remaining > 0
    }

    reset () {
      this.pos = 0;
      this.updates = 0;
      this.refs.clear();
    }
  }

  function _createWrappingVirtualComponent (comp) {
    let vel = new VirtualElement.Component(comp.constructor);
    vel._comp = comp;
    return vel
  }

  const CAPTURED = Symbol('CAPTURED');
  const DETACHED = Symbol('DETACHED');
  const LINKED = Symbol('LINKED');
  const MAPPED = Symbol('MAPPED');
  const NEW = Symbol('NEW');
  const OLDPROPS = Symbol('OLDPROPS');
  const OLDSTATE = Symbol('OLDSTATE');


  const RELOCATED = Symbol('RELOCATED');
  const RENDERED = Symbol('RENDERED');
  const SKIPPED = Symbol('SKIPPED');
  const UPDATED = Symbol('UPDATED');

  class RenderingState {
    constructor (componentFactory, elementFactory) {
      this.componentFactory = componentFactory;
      this.elementFactory = elementFactory;
      this.polluted = [];
      this.id = '__' + uuid();
    }

    dispose () {
      let id = this.id;
      this.polluted.forEach(function (obj) {
        delete obj[id];
      });
    }

    set (key, obj, val = true) {
      let info = obj[this.id];
      if (!info) {
        info = {};
        obj[this.id] = info;
        this.polluted.push(obj);
      }
      info[key] = val;
    }

    get (key, obj) {
      let info = obj[this.id];
      if (info) {
        return info[key]
      }
    }

    is (key, obj) {
      return Boolean(this.get(key, obj))
    }
  }

  class InternalComponentData {
    constructor () {
      this.refs = new Map();
      this.foreignRefs = new Map();
      this.internalRefs = new Map();
      this.elementProps = null;
    }
  }


  RenderingEngine._INTERNAL_API = {
    _capture,
    _wrap: _createWrappingVirtualComponent,
    _update,
    CAPTURED,
    DETACHED,
    LINKED,
    MAPPED,
    NEW,
    RELOCATED,
    RENDERED,
    SKIPPED,
    TOP_LEVEL_ELEMENT,
    UPDATED
  };

  const COMPONENT_FACTORY = {
    createComponent (ComponentClass, parent, props) {
      return new ComponentClass(parent, props)
    },
    createElementComponent (parent, virtualElement) {
      return new ElementComponent(parent, virtualElement)
    },
    createTextNodeComponent (parent, virtualElement) {
      return new TextNodeComponent(parent, virtualElement)
    }
  };

  class Component extends EventEmitter {
    
    constructor (parent, props = {}, options = {}) {
      super();

      
      
      
      
      

      this.parent = (parent && parent._isComponent) ? parent : null;

      
      this.el = options.el;

      
      
      let context;
      if (isFunction(this.defineContext)) {
        context = this.defineContext(props, parent);
      } else {
        context = options.context || this._getContext();
      }
      this.context = context || {};
      

      
      
      
      this.renderingEngine = (parent && parent.renderingEngine) || options.renderingEngine || new RenderingEngine({
        componentFactory: COMPONENT_FACTORY
      });

      
      
      if (this._SKIP_COMPONENT_INIT) return

      this.__id__ = uuid();

      
      this.refs = {};
      
      
      
      this.__foreignRefs__ = {};

      
      this._actionHandlers = this.getActionHandlers();

      
      this.props = props;
      

      
      this.state = this.getInitialState() || {};
      
    }

    getId () {
      return this.__id__
    }

    setId () {
      throw new Error("'id' is readonly")
    }

    getActionHandlers () {
      return {}
    }

    
    getChildContext () {
      return {}
    }

    
    getInitialState () {
      return {}
    }

    
    getParent () {
      return this.parent
    }

    
    getRoot () {
      let comp = this;
      let parent = comp;
      while (parent) {
        comp = parent;
        parent = comp.getParent();
      }
      return comp
    }

    getElement () {
      return this.el
    }

    getNativeElement () {
      return this.el.getNativeElement()
    }

    
    getLabel (name, ...args) {
      let labelProvider = this.getLabelProvider();
      if (!labelProvider) throw new Error('Missing labelProvider.')
      return labelProvider.getLabel(name, ...args)
    }

    getLabelProvider () {
      return this.context.labelProvider
    }

    
    getComponent (componentName, maybe) {
      let componentRegistry = this.getComponentRegistry();
      if (!componentRegistry) throw new Error('Missing componentRegistry.')
      const ComponentClass = componentRegistry.get(componentName);
      if (!maybe && !ComponentClass) {
        throw new Error('No Component registered with name ' + componentName)
      }
      return ComponentClass
    }

    getComponentRegistry () {
      return this.context.componentRegistry
    }

    
    render ($$) {
      
      return $$('div')
    }

    
    mount (el) {
      if (!el) {
        throw new Error('Element is required.')
      }
      el = DefaultDOMElement.wrap(el);
      
      this.el = null;
      this.renderingEngine = Component.createRenderingEngine(el.getOwnerDocument());
      this._render();
      el.appendChild(this.el);
      if (el.isInDocument()) {
        this.triggerDidMount();
      }
      return this
    }

    
    shouldRerender(newProps, newState) { 
      return true
    }

    
    rerender () {
      this._rerender(this.props, this.state);
    }

    _rerender (oldProps, oldState) {
      this._render(oldProps, oldState);
      
      if (!this.isMounted()) {
        this.didUpdate(oldProps, oldState);
      }
    }

    _render (oldProps, oldState) {
      if (this.__isRendering__) {
        throw new Error('Component is rendering already.')
      }
      this.__isRendering__ = true;
      try {
        this.renderingEngine._render(this, oldProps, oldState);
      } finally {
        delete this.__isRendering__;
      }
    }

    
    triggerDidMount () {
      
      

      
      
      
      if (this._isForwarded()) {
        this.getParent().triggerDidMount();
      }

      
      const children = this.getChildren();
      for (let child of children) {
        
        
        child.triggerDidMount();
      }

      
      
      
      if (!this.__isMounted__) {
        this.__isMounted__ = true;
        this.didMount();
      }
    }

    
    triggerDispose () {
      if (this._isForwarding()) {
        this.el._comp.triggerDispose();
      } else {
        this.getChildren().forEach(function (child) {
          child.triggerDispose();
        });
      }
      this.dispose();
      this.__isMounted__ = false;
    }

    
    didMount () {}

    
    didUpdate () {}

    
    isMounted () {
      return this.__isMounted__
    }

    
    dispose () {}

    
    
    
    
    
    _isForwarding () {
      if (this.el) {
        return this.el._comp !== this
      } else {
        return false
      }
    }

    _isForwarded () {
      let parent = this.getParent();
      return (parent && parent._isForwarding())
    }

    _getForwardedComponent () {
      if (this.el) {
        return this.el._comp
      }
    }

    
    _setParent (newParent) {
      this.parent = newParent;
      this.context = this._getContext() || {};
      Object.freeze(this.context);
    }

    
    send (action) {
      
      let comp = this;
      while (comp) {
        if (comp._actionHandlers && comp._actionHandlers[action]) {
          comp._actionHandlers[action].apply(comp, Array.prototype.slice.call(arguments, 1));
          return true
        }
        comp = comp.getParent();
      }
      console.warn('Action', action, 'was not handled.');
      return false
    }

    
    handleActions (actionHandlers) {
      forEach(actionHandlers, function (method, actionName) {
        this.handleAction(actionName, method);
      }.bind(this));
      return this
    }

    
    handleAction (name, handler) {
      if (!name || !handler || !isFunction(handler)) {
        throw new Error('Illegal arguments.')
      }
      handler = handler.bind(this);
      this._actionHandlers[name] = handler;
    }

    
    getState () {
      return this.state
    }

    
    setState (newState) {
      let oldProps = this.props;
      let oldState = this.state;
      
      
      let needRerender = !this.__isSettingProps__ &&
        this.shouldRerender(this.getProps(), newState);
      
      this.willUpdateState(newState);
      this.state = newState || {};
      Object.freeze(this.state);
      if (needRerender) {
        this._rerender(oldProps, oldState);
      } else if (!this.__isSettingProps__) {
        this.didUpdate(oldProps, oldState);
      }
    }

    
    extendState (newState) {
      newState = extend({}, this.state, newState);
      this.setState(newState);
    }

    
    willUpdateState(newState) { 
    }

    
    getProps () {
      return this.props
    }

    
    setProps (newProps) {
      let oldProps = this.props;
      let oldState = this.state;
      let needRerender = this.shouldRerender(newProps, this.state);
      this._setProps(newProps);
      if (needRerender) {
        this._rerender(oldProps, oldState);
      } else {
        this.didUpdate(oldProps, oldState);
      }
    }

    _setProps (newProps) {
      newProps = newProps || {};
      
      this.__isSettingProps__ = true;
      try {
        this.willReceiveProps(newProps);
        this.props = newProps || {};
        Object.freeze(newProps);
      } finally {
        delete this.__isSettingProps__;
      }
    }

    
    extendProps (updatedProps) {
      let newProps = extend({}, this.props, updatedProps);
      this.setProps(newProps);
    }

    
    willReceiveProps(newProps) { 
    }

    getTextContent () {
      if (this.el) {
        return this.el.textContent
      }
    }

    get textContent () {
      return this.getTextContent()
    }

    getInnerHTML () {
      if (this.el) {
        return this.el.getInnerHTML()
      }
    }

    get innerHTML () {
      return this.getInnerHTML()
    }

    getOuterHTML () {
      if (this.el) {
        return this.el.getOuterHTML()
      }
    }

    get outerHTML () {
      return this.getOuterHTML()
    }

    getAttribute (name) {
      if (this.el) {
        return this.el.getAttribute(name)
      }
    }

    setAttribute (name, val) {
      if (this.el) {
        this.el.setAttribute(name, val);
      }
      return this
    }

    getProperty (name) {
      if (this.el) {
        return this.el.getProperty(name)
      }
    }

    setProperty (name, val) {
      if (this.el) {
        this.el.setProperty(name, val);
      }
      return this
    }

    get tagName () {
      if (this.el) {
        return this.el.tagName
      }
    }

    hasClass (name) {
      if (this.el) {
        return this.el.hasClass(name)
      }
    }

    addClass (name) {
      if (this.el) {
        this.el.addClass(name);
      }
      return this
    }

    removeClass (name) {
      if (this.el) {
        this.el.removeClass(name);
      }
      return this
    }

    getStyle (name) {
      if (this.el) {
        return this.el.getStyle(name)
      }
    }

    setStyle (name, val) {
      if (this.el) {
        return this.el.setStyle(name, val)
      }
      return this
    }

    getValue () {
      if (this.el) {
        return this.el.getValue()
      }
    }

    setValue (val) {
      if (this.el) {
        this.el.setValue(val);
      }
      return this
    }

    getChildCount () {
      if (!this.el) return 0
      return this.el.getChildCount()
    }

    get childNodes () {
      return this.getChildNodes()
    }

    getChildNodes () {
      if (!this.el) return []
      let childNodes = this.el.getChildNodes();
      childNodes = childNodes.map(_unwrapComp).filter(Boolean);
      return childNodes
    }

    getChildren () {
      if (!this.el) return []
      let children = this.el.getChildren();
      children = children.map(_unwrapComp).filter(Boolean);
      return children
    }

    getChildAt (pos) {
      let child = this.el.getChildAt(pos);
      if (child) {
        return _unwrapCompStrict(child)
      }
    }

    find (cssSelector) {
      let el = this.el.find(cssSelector);
      return _unwrapComp(el)
    }

    findAll (cssSelector) {
      let els = this.el.findAll(cssSelector);
      return els.map(_unwrapComp).filter(Boolean)
    }

    appendChild (child) {
      this.insertAt(this.getChildCount(), child);
    }

    insertAt (pos, childEl) {
      if (isString(childEl)) {
        childEl = new VirtualElement.TextNode(childEl);
      }
      if (!childEl._isVirtualElement) {
        throw new Error('Invalid argument: "child" must be a VirtualElement.')
      }
      let child = this.renderingEngine._renderChild(this, childEl);
      this.el.insertAt(pos, child.el);
      _mountChild(this, child);
    }

    removeAt (pos) {
      let childEl = this.el.getChildAt(pos);
      if (childEl) {
        let child = _unwrapCompStrict(childEl);
        _disposeChild(child);
        this.el.removeAt(pos);
      }
    }

    removeChild (child) {
      if (!child || !child._isComponent) {
        throw new Error('removeChild(): Illegal arguments. Expecting a Component instance.')
      }
      
      _disposeChild(child);
      this.el.removeChild(child.el);
    }

    replaceChild (oldChild, newVirtualChild) {
      if (!oldChild || !oldChild._isComponent) {
        throw new Error('replaceChild(): oldChild must be a child component.')
      }
      if (!newVirtualChild || !newVirtualChild._isVirtualElement || newVirtualChild._owner._comp !== this) {
        throw new Error('replaceChild(): newVirtualChild must be a VirtualElement instance created with a rendering context for this component.')
      }
      let newChild = this.renderingEngine._renderChild(this, newVirtualChild);
      
      _disposeChild(oldChild);
      this.el.replaceChild(oldChild.el, newChild.el);
      if (this.isMounted()) {
        newChild.triggerDidMount();
      }
    }

    
    
    
    
    
    
    empty () {
      this._clear();
      return this
    }

    _clear () {
      let el = this.el;
      if (el) {
        this.getChildNodes().forEach(function (child) {
          _disposeChild(child);
        });
        el.empty();
      }
      this.refs = {};
      this.__foreignRefs__ = {};
    }

    remove () {
      _disposeChild(this);
      this.el.remove();
    }

    addEventListener () {
      throw new Error('Not supported.')
    }

    removeEventListener () {
      throw new Error('Not supported.')
    }

    insertBefore () {
      throw new Error('Not supported.')
    }

    click () {
      if (this.el) {
        
        
        return this.el.click()
      }
      return false
    }

    getComponentPath () {
      let path = [];
      let comp = this;
      while (comp) {
        path.unshift(comp);
        comp = comp.getParent();
      }
      return path
    }

    _getContext () {
      let context = {};
      let parent = this.getParent();
      if (parent) {
        context = extend(context, parent.context);
        if (parent.getChildContext) {
          return extend(context, parent.getChildContext())
        }
      }
      return context
    }

    get _isComponent () { return true }

    

    attr () {
      return DOMElement.prototype.attr.apply(this, arguments)
    }

    htmlProp () {
      return DOMElement.prototype.htmlProp.apply(this, arguments)
    }

    val () {
      return DOMElement.prototype.val.apply(this, arguments)
    }

    css () {
      return DOMElement.prototype.css.apply(this, arguments)
    }

    text () {
      return DOMElement.prototype.text.apply(this, arguments)
    }

    append () {
      return DOMElement.prototype.append.apply(this, arguments)
    }

    static unwrap () {
      return _unwrapComp.apply(this, arguments)
    }

    static render (props) {
      props = props || {};
      let ComponentClass = this;
      let comp = new ComponentClass(null, props);
      comp._render();
      return comp
    }

    static mount (props, el, options = {}) {
      if (arguments.length === 1) {
        el = props;
        props = {};
      }
      if (!el) throw new Error("'el' is required.")
      if (isString(el)) {
        let selector = el;
        if (platform.inBrowser) {
          el = window.document.querySelector(selector);
        } else {
          throw new Error('This selector is not supported on server side.')
        }
      }
      el = DefaultDOMElement.wrap(el);
      const ComponentClass = this;
      let comp = new ComponentClass(null, props, options);
      comp.mount(el);
      return comp
    }

    static getComponentForDOMElement (el) {
      return _unwrapComp(el)
    }

    static unwrapDOMElement (el) {
      console.warn('DEPRECATED: Use Component.getComponentForDOMElement');
      return Component.getComponentForDOMElement(el)
    }

    static getComponentFromNativeElement (nativeEl) {
      
      
      
      return _unwrapComp(DefaultDOMElement.wrap(nativeEl))
    }

    static createRenderingEngine (elementFactory) {
      return new RenderingEngine({
        componentFactory: COMPONENT_FACTORY,
        elementFactory
      })
    }

    
    static get Element () { return ElementComponent }
    static get TextNode () { return TextNodeComponent }
  }


  function _disposeChild (child) {
    child.triggerDispose();
    if (child._owner && child._ref) {
      console.assert(child._owner.refs[child._ref] === child, "Owner's ref should point to this child instance.");
      delete child._owner.refs[child._ref];
    }
  }


  function _mountChild (parent, child) {
    if (parent.isMounted()) {
      child.triggerDidMount();
    }
    if (child._owner && child._ref) {
      child._owner.refs[child._ref] = child;
    }
  }


  function _unwrapComp (el) {
    if (el) {
      if (!el._isDOMElement) el = DefaultDOMElement.unwrap(el);
      if (el) return el._comp
    }
  }

  function _unwrapCompStrict (el) {
    let comp = _unwrapComp(el);
    if (!comp) throw new Error('Expecting a back-link to the component instance.')
    return comp
  }

  class ElementComponent extends Component {
    get _isElementComponent () { return true }
    get _SKIP_COMPONENT_INIT () { return true }
  }

  class TextNodeComponent extends Component {
    setTextContent (text) {
      if (!this.el) {
        throw new Error('Component must be rendered first.')
      }
      if (this.el.textContent !== text) {
        this.el.textContent = text;
      }
    }

    getChildNodes () {
      return []
    }

    getChildren () {
      return []
    }

    get _isTextNodeComponent () { return true }
    get _SKIP_COMPONENT_INIT () { return true }
  }

  class AbstractIsolatedNodeComponent extends Component {
    constructor (...args) {
      super(...args);

      this.name = this.props.node.id;
      this._state = { selectionFragment: null };

      this.handleAction('escape', this.escape);
      this.ContentClass = this._getContentClass();

      
      let useBlocker = platform.isFF || !this.ContentClass.noBlocker;
      this.blockingMode = useBlocker ? 'closed' : 'open';
    }

    getInitialState () {
      let sel = this.getEditorSession().getSelection();
      let selState = this.getEditorSession().getSelectionState();
      return this._deriveStateFromSelectionState(sel, selState)
    }

    getChildContext () {
      return {
        parentSurfaceId: this.getId(),
        isolatedNodeComponent: this,
        
        
        surface: undefined
      }
    }

    didMount () {
      let editorState = this.context.editorSession.getEditorState();
      editorState.addObserver(['selection'], this._onSelectionChanged, this, { stage: 'render' });
    }

    dispose () {
      let editorState = this.context.editorSession.getEditorState();
      editorState.removeObserver(this);
    }

    renderContent ($$, node, options = {}) {
      let ComponentClass = this.ContentClass;
      if (!ComponentClass) {
        console.error('Could not resolve a component for type: ' + node.type);
        return $$(this.__elementTag)
      } else {
        let props = Object.assign(this._getContentProps(), options);
        return $$(ComponentClass, props)
      }
    }

    getId () {
      
      
      if (!this._id) {
        this._id = this.context.parentSurfaceId + '/' + this.name;
      }
      return this._id
    }

    get id () { return this.getId() }

    getMode () {
      return this.state.mode
    }

    escape () {
      
      this.selectNode();
    }

    isOpen () {
      return this.blockingMode === 'open'
    }

    isClosed () {
      return this.blockingMode === 'closed'
    }

    isNotSelected () {
      return !this.state.mode
    }

    isSelected () {
      return this.state.mode === 'selected'
    }

    isCoSelected () {
      return this.state.mode === 'co-selected'
    }

    isFocused () {
      return this.state.mode === 'focused'
    }

    isCoFocused () {
      return this.state.mode === 'co-focused'
    }

    getParentSurface () {
      return this.context.surface
    }

    getEditorSession () {
      return this.context.editorSession
    }

    getSurfaceManager () {
      return this.context.surfaceManager
    }

    _onSelectionChanged () {
      const editorSession = this.getEditorSession();
      const sel = editorSession.getSelection();
      const selState = editorSession.getSelectionState();
      const newState = this._deriveStateFromSelectionState(sel, selState);
      if (!newState && this.state.mode) {
        this.extendState({ mode: null });
      } else if (newState && newState.mode !== this.state.mode) {
        this.extendState(newState);
      }
    }

    onKeydown (event) {
      
      
      
      
      if (event.keyCode === keys$1.ESCAPE && this.state.mode === 'focused') {
        event.stopPropagation();
        event.preventDefault();
        this.escape();
      }
    }

    _getContentClass () {
      const node = this.props.node;
      let ComponentClass;
      
      ComponentClass = this.getComponent(node.type, true);
      
      if (!ComponentClass) ComponentClass = Component;

      return ComponentClass
    }

    _getContentProps () {
      return {
        disabled: this.props.disabled,
        node: this.props.node,
        isolatedNodeState: this.state.mode,
        focused: (this.state.mode === 'focused')
      }
    }

    _getSurfaceForSelection (sel, selState) {
      
      
      
      let surface = selState.surface;
      if (!surface) {
        if (sel && sel.surfaceId) {
          const surfaceManager = this.getSurfaceManager();
          surface = surfaceManager.getSurface(sel.surfaceId);
        } else {
          surface = null;
        }
        selState.surface = surface;
      }
      return surface
    }

    
    
    _getIsolatedNodes (sel, selState) {
      
      
      
      let isolatedNodes = selState.isolatedNodes;
      if (!isolatedNodes) {
        isolatedNodes = [];
        if (sel && sel.surfaceId) {
          let surfaceManager = this.getSurfaceManager();
          let surface = surfaceManager.getSurface(sel.surfaceId);
          if (surface) {
            isolatedNodes = surface.getComponentPath().filter(comp => comp._isAbstractIsolatedNodeComponent);
          }
        }
        selState.isolatedNodes = isolatedNodes;
      }
      return isolatedNodes
    }

    _shouldConsumeEvent (event) {
      let comp = Component.unwrap(event.currentTarget);
      let isolatedNodeComponent = this._getIsolatedNode(comp);
      return (isolatedNodeComponent === this)
    }

    _getIsolatedNode (comp) {
      if (comp._isAbstractIsolatedNodeComponent) {
        return this
      } else if (comp.context.isolatedNodeComponent) {
        return comp.context.isolatedNodeComponent
      } else if (comp.context.surface) {
        return comp.context.surface.context.isolatedNodeComponent
      }
    }

    get _isAbstractIsolatedNodeComponent () { return true }
  }

  class AbstractScrollPane extends Component {
    
    getChildContext () {
      return {
        scrollPane: this
      }
    }

    didMount () {
      if (platform.inBrowser) {
        this.windowEl = DefaultDOMElement.wrapNativeElement(window);
        this.windowEl.on('resize', this.onSelectionPositioned, this);
      }
    }

    dispose () {
      if (this.windowEl) {
        this.windowEl.off(this);
      }
    }

    getName () {
      return this.props.name
    }

    
    onSelectionPositioned () {
      let contentRect = this._getContentRect();
      let selectionRect = this._getSelectionRect();
      if (!selectionRect) return
      let hints = {
        contentRect,
        selectionRect
      };
      this._emitSelectionPositioned(hints);
      this._scrollSelectionIntoView(selectionRect);
    }

    _emitSelectionPositioned (hints) {
      
      
      this.emit('selection:positioned', hints);
      
      this.emit('dom-selection:rendered', hints);
    }

    
    _onContextMenu (e) {
      e.preventDefault();
      let mouseBounds = this._getMouseBounds(e);
      this.emit('context-menu:opened', {
        mouseBounds: mouseBounds
      });
    }

    _scrollSelectionIntoView (selectionRect) {
      let upperBound = this.getScrollPosition();
      let lowerBound = upperBound + this.getHeight();
      let selTop = selectionRect.top;
      let selBottom = selectionRect.top + selectionRect.height;
      if ((selTop < upperBound && selBottom < upperBound) ||
          (selTop > lowerBound && selBottom > lowerBound)) {
        this.setScrollPosition(selTop);
      }
    }

    
    getHeight () {
      throw new Error('Abstract method')
    }

    
    getContentHeight () {
      throw new Error('Abstract method')
    }

    getContentElement () {
      
      throw new Error('Abstract method')
    }

    
    getScrollableElement () {
      throw new Error('Abstract method')
    }

    
    getScrollPosition () {
      throw new Error('Abstract method')
    }

    setScrollPosition () {
      throw new Error('Abstract method')
    }

    
    getPanelOffsetForElement(el) { 
      throw new Error('Abstract method')
    }

    
    scrollTo(componentId, onlyIfNotVisible) { 
      throw new Error('Abstract method')
    }

    _getContentRect () {
      return this.getContentElement().getNativeElement().getBoundingClientRect()
    }

    
    _getSelectionRect () {
      return getSelectionRect(this._getContentRect())
    }

    _getMouseBounds (e) {
      return getRelativeMouseBounds(e, this.getContentElement().getNativeElement())
    }
  }

  const events = [ 'keydown', 'keyup', 'keypress', 'mousedown', 'mouseup', 'copy' ];

  class AbstractGlobalEventHandler {
    constructor () {
      this.listeners = [];
      this.initialize();
    }

    initialize () {
      if (platform.inBrowser) {
        let document = DefaultDOMElement.wrapNativeElement(window.document);
        events.forEach(function (name) {
          document.on(name, this._dispatch.bind(this, name), this);
        }.bind(this));
      }
    }

    dispose () {
      if (platform.inBrowser) {
        let document = DefaultDOMElement.wrapNativeElement(window.document);
        document.off(this);
      }
    }

    addEventListener (eventName, handler, options) {
      if (!options.id) {
        throw new Error("GlobalEventHandler can only be used with option 'id'")
      }
      let listener = new DOMEventListener(eventName, handler, options);
      this.listeners.push(listener);
    }

    removeEventListener (listener) {
      let idx = this.listeners.indexOf(listener);
      if (idx > -1) {
        this.listeners.splice(idx, 1);
      }
    }

    getEventListeners () {
      return this.listeners
    }

    _getActiveListener (eventName) {
      const sel = this.getSelection();
      if (sel) {
        let surfaceId = sel.surfaceId;
        for (let i = 0; i < this.listeners.length; i++) {
          let listener = this.listeners[i];
          if (listener.eventName === eventName && listener.options.id === surfaceId) {
            return listener
          }
        }
      }
    }

    _dispatch (eventName, e) {
      const listener = this._getActiveListener(eventName);
      if (listener) {
        listener.handler(e);
      }
    }

    on (...args) {
      return DOMElement.prototype.on.apply(this, args)
    }

    off (...args) {
      return DOMElement.prototype.off.apply(this, args)
    }
  }

  class HandlerParams {
    constructor (context) {
      const editorSession = context.editorSession;
      if (editorSession) {
        this.editorSession = editorSession;
        this.selection = editorSession.getSelection();
        this.selectionState = editorSession.getSelectionState();
        this.surface = editorSession.getFocusedSurface();
      }
    }
  }

  class AbstractKeyboardManager {
    onKeydown (event, context) {
      let key = parseKeyEvent(event);
      let hooks = this._getBindings('keydown', key);
      if (hooks) {
        context = context || this._getContext();
        let params = this._getParams(context);
        let hasExecuted = false;
        for (let i = 0; i < hooks.length && !hasExecuted; i++) {
          const hook = hooks[i];
          hasExecuted = hook(params, context);
        }
        if (hasExecuted) {
          event.preventDefault();
          event.stopPropagation();
        }
        return hasExecuted
      }
    }

    onTextInput (text, context) {
      let hooks = this._getBindings('textinput', text);
      if (hooks) {
        context = context || this._getContext();
        let params = this._getParams(context);
        let hasExecuted = false;
        for (let i = 0; i < hooks.length && !hasExecuted; i++) {
          const hook = hooks[i];
          hasExecuted = hook(params, context);
        }
        return hasExecuted
      }
    }

    _getParams (context) {
      return new HandlerParams(context)
    }

    _getBindings (type, key) {
      throw new Error('This method is abstract')
    }

    _getContext () {
      throw new Error('This method is abstract')
    }
  }

  class AnnotatedTextComponent extends Component {
    render ($$) {
      let el = this._renderContent($$)
        .addClass('sc-annotated-text')
        .css({ whiteSpace: 'pre-wrap' });
      return el
    }

    getPath () {
      return this.props.path
    }

    getText () {
      return this.getDocument().get(this.props.path) || ''
    }

    isEmpty () {
      return !(this.getText())
    }

    getAnnotations () {
      return this.getDocument().getIndex('annotations').get(this.props.path)
    }

    getDocument () {
      return this.props.doc || this.context.doc
    }

    _getTagName () {
      return this.props.tagName
    }

    _renderContent ($$) {
      let text = this.getText();
      let annotations = this.getAnnotations();
      let el = $$(this._getTagName() || 'span');
      if (annotations && annotations.length > 0) {
        let fragmenter = new Fragmenter();
        fragmenter.onText = this._renderTextNode.bind(this);
        fragmenter.onOpen = this._renderFragment.bind(this, $$);
        fragmenter.onClose = this._finishFragment.bind(this);
        fragmenter.start(el, text, annotations);
      } else {
        el.append(text);
      }
      return el
    }

    _renderTextNode (context, text) {
      if (text && text.length > 0) {
        context.append(text);
      }
    }

    _renderFragment ($$, fragment) {
      let node = fragment.node;

      
      
      
      
      
      
      
      
      
      
      
      
      

      let ComponentClass = this._getFragmentComponentClass(node);
      let props = this._getFragmentProps(node);
      let el = $$(ComponentClass, props);
      return el
    }

    _getFragmentComponentClass (node, noDefault) {
      let ComponentClass = this.getComponent(node.type, 'not-strict');
      if (node.isInlineNode() &&
          
          !ComponentClass.prototype._isInlineNodeComponent &&
          
          !ComponentClass.isCustom) {
        ComponentClass = this.getComponent('inline-node');
      }
      if (!ComponentClass && !noDefault) {
        if (node._isAnnotation) {
          ComponentClass = this._getUnsupportedAnnotationComponentClass();
        } else {
          ComponentClass = this._getUnsupportedInlineNodeComponentClass();
        }
      }
      return ComponentClass
    }

    _getUnsupportedAnnotationComponentClass () {
      return this.getComponent('annotation')
    }

    _getUnsupportedInlineNodeComponentClass () {
      return this.getComponent('annotation')
    }

    _getFragmentProps (node) {
      return { node }
    }

    _finishFragment (fragment, context, parentContext) {
      parentContext.append(context);
    }
  }

  class Command {
    
    constructor (config) {
      this.config = config || {};
      this.name = this.config.name;
      if (!this.name) {
        throw new Error("'name' is required")
      }
    }

    
    get isAsync () {
      return false
    }

    
    getName () {
      return this.name
    }

    
    getCommandState(params, context) { 
      throw new Error('Command.getCommandState() is abstract.')
    }

    
    execute(params, context) { 
      throw new Error('Command.execute() is abstract.')
    }

    
    isAnnotationCommand () {
      return false
    }

    
    isInsertCommand () {
      return false
    }

    
    isSwitchTypeCommand () {
      return false
    }

    getParams (context) {
      return new HandlerParams(context)
    }

    get _isCommand () { return true }
  }

  Command.DISABLED = Object.freeze({ disabled: true, active: false });

  class AnnotationCommand extends Command {
    constructor (config) {
      super(config);

      if (!this.config.nodeType) {
        throw new Error("'nodeType' is required")
      }
    }

    
    getAnnotationType () {
      return this.config.nodeType
    }

    getType () {
      return this.getAnnotationType()
    }

    
    getAnnotationData () {
      return {}
    }

    
    isDisabled (sel, params) {
      let selectionState = params.selectionState;
      let isBlurred = params.editorSession.isBlurred();
      
      
      if (isBlurred || !sel || sel.isNull() || !sel.isAttached() || sel.isCustomSelection() ||
          sel.isNodeSelection() || sel.isContainerSelection() || selectionState.isInlineNodeSelection) {
        return true
      }
      return false
    }

    
    showInContext (sel) {
      return !sel.isCollapsed()
    }

    
    
    canCreate (annos, sel, context) {
      
      if (sel.isCollapsed()) return false
      
      if (annos.length === 0) return true
      
      for (let anno of annos) {
        if (sel.overlaps(anno.getSelection(), 'strict')) return false
      }
      return true
    }

    
    canFuse (annos, sel) {
      
      return (annos.length >= 2 && !sel.isCollapsed())
    }

    
    canDelete (annos, sel) {
      
      if (annos.length !== 1) return false
      let annoSel = annos[0].getSelection();
      return sel.isInsideOf(annoSel)
    }

    
    canExpand (annos, sel) {
      
      if (annos.length !== 1) return false
      let annoSel = annos[0].getSelection();
      return sel.overlaps(annoSel, 'strict') && !sel.isInsideOf(annoSel)
    }

    
    canTruncate (annos, sel) {
      if (annos.length !== 1) return false
      let annoSel = annos[0].getSelection();

      return (sel.isLeftAlignedWith(annoSel) || sel.isRightAlignedWith(annoSel)) &&
             !sel.contains(annoSel) &&
             !sel.isCollapsed()
    }

    
    getCommandState (params, context) { 
      const sel = params.selection;
      
      
      
      if (this.isDisabled(sel, params, context)) {
        return {
          disabled: true
        }
      }
      let annos = this._getAnnotationsForSelection(params);
      let newState = {
        disabled: false,
        active: false,
        mode: null
      };
      if (this.canCreate(annos, sel, context)) {
        newState.mode = 'create';
      } else if (this.canFuse(annos, sel)) {
        newState.mode = 'fuse';
      } else if (this.canTruncate(annos, sel)) {
        newState.active = true;
        newState.mode = 'truncate';
      } else if (this.canExpand(annos, sel)) {
        newState.mode = 'expand';
      } else if (this.canDelete(annos, sel)) {
        newState.active = true;
        newState.mode = 'delete';
      } else {
        newState.disabled = true;
      }
      newState.showInContext = this.showInContext(sel, params, context);

      return newState
    }

    
    
    execute (params, context) { 
      let commandState = params.commandState;

      if (commandState.disabled) return false
      switch (commandState.mode) {
        case 'create':
          return this.executeCreate(params, context)
        case 'fuse':
          return this.executeFuse(params, context)
        case 'truncate':
          return this.executeTruncate(params, context)
        case 'expand':
          return this.executeExpand(params, context)
        case 'delete':
          return this.executeDelete(params, context)
        default:
          console.warn('Command.execute(): unknown mode', commandState.mode);
          return false
      }
    }

    executeCreate (params, context) {
      const editorSession = params.editorSession;
      const annos = this._getAnnotationsForSelection(params, context);
      this._checkPrecondition(params, context, annos, this.canCreate);
      let annoData = this.getAnnotationData();
      annoData.type = this.getAnnotationType();
      let anno;
      editorSession.transaction(tx => {
        anno = tx.annotate(annoData);
      });
      return {
        mode: 'create',
        anno: anno
      }
    }

    executeFuse (params, context) {
      let annos = this._getAnnotationsForSelection(params);
      this._checkPrecondition(params, context, annos, this.canFuse);
      this._applyTransform(params, tx => {
        annotationHelpers.fuseAnnotation(tx, annos);
      });
      return {
        mode: 'fuse',
        anno: annos[0]
      }
    }

    executeTruncate (params, context) {
      let annos = this._getAnnotationsForSelection(params);
      let anno = annos[0];
      this._checkPrecondition(params, context, annos, this.canTruncate);
      this._applyTransform(params, tx => {
        annotationHelpers.truncateAnnotation(tx, anno, params.selection);
      });
      return {
        mode: 'truncate',
        anno: anno
      }
    }

    executeExpand (params, context) {
      let annos = this._getAnnotationsForSelection(params);
      let anno = annos[0];
      this._checkPrecondition(params, context, annos, this.canExpand);
      this._applyTransform(params, tx => {
        annotationHelpers.expandAnnotation(tx, anno, params.selection);
      });
      return {
        mode: 'expand',
        anno: anno
      }
    }

    executeDelete (params, context) {
      let annos = this._getAnnotationsForSelection(params);
      let anno = annos[0];
      this._checkPrecondition(params, context, annos, this.canDelete);
      this._applyTransform(params, tx => {
        return tx.delete(anno.id)
      });
      return {
        mode: 'delete',
        annoId: anno.id
      }
    }

    isAnnotationCommand () { return true }

    _checkPrecondition (params, context, annos, checker) {
      let sel = params.selection;
      if (!checker.call(this, annos, sel, context)) {
        throw new Error("AnnotationCommand: can't execute command for selection " + sel.toString())
      }
    }

    _getAnnotationsForSelection (params) {
      const selectionState = params.selectionState;
      return selectionState.annosByType[this.getAnnotationType()] || []
    }

    
    _applyTransform (params, transformFn) {
      const editorSession = params.editorSession;
      const sel = params.selection;
      if (sel.isNull()) return
      let result; 
      editorSession.setSelection(sel);
      editorSession.transaction(function (tx) {
        let out = transformFn(tx, params);
        if (out) result = out.result;
      });
      return result
    }
  }

  class AnnotationComponent extends Component {
    
    didMount () {
      let node = this.props.node;
      node.on('highlighted', this.onHighlightedChanged, this);
    }

    
    dispose () {
      let node = this.props.node;
      node.off(this);
    }

    render ($$) {
      let el = $$(this.getTagName())
        .attr('data-id', this.props.node.id)
        .addClass(this.getClassNames());
      if (this.props.node.highlighted) {
        el.addClass('sm-highlighted');
      }
      el.append(this.props.children);
      return el
    }

    getClassNames () {
      return `sc-annotation sm-${this.props.node.type}`
    }

    onHighlightedChanged () {
      if (this.props.node.highlighted) {
        this.el.addClass('sm-highlighted');
      } else {
        this.el.removeClass('sm-highlighted');
      }
    }

    getTagName () {
      return 'span'
    }
  }

  const BRACKET = 'X';
  const SLASH = '/'.charCodeAt(0);


  class IsolatedNodeComponent extends AbstractIsolatedNodeComponent {
    render ($$) {
      const node = this.props.node;
      const ContentClass = this.ContentClass;
      const disabled = this.props.disabled;

      
      let el = $$('div');
      el.addClass(this.getClassNames())
        .addClass('sc-isolated-node')
        .addClass('sm-' + this.props.node.type)
        .attr('data-id', node.id);
      if (disabled) {
        el.addClass('sm-disabled');
      }
      if (this.state.mode) {
        el.addClass('sm-' + this.state.mode);
      }
      if (!ContentClass.noStyle) {
        el.addClass('sm-default-style');
      }
      
      el.on('keydown', this.onKeydown);

      
      const shouldRenderBlocker = (
        this.blockingMode === 'closed' &&
        !this.state.unblocked
      );

      
      
      el.append(
        $$('div').addClass('se-bracket sm-left').ref('left')
          .append(BRACKET)
      );

      let content = this.renderContent($$, node, {
        disabled: this.props.disabled || shouldRenderBlocker
      }).ref('content');
      content.attr('contenteditable', false);

      el.append(content);
      el.append($$(Blocker).ref('blocker'));
      el.append(
        $$('div').addClass('se-bracket sm-right').ref('right')
          .append(BRACKET)
      );

      if (!shouldRenderBlocker) {
        el.addClass('sm-no-blocker');
        el.on('click', this.onClick)
          .on('dblclick', this.onDblClick);
      }
      el.on('mousedown', this._reserveMousedown, this);

      return el
    }

    getClassNames () {
      return ''
    }

    getContent () {
      return this.refs.content
    }

    selectNode () {
      
      const editorSession = this.getEditorSession();
      const nodeId = this.props.node.id;
      let selData = {
        type: 'node',
        nodeId: nodeId
      };
      const surface = this.getParentSurface();
      if (surface) {
        Object.assign(selData, {
          containerPath: surface.getContainerPath(),
          surfaceId: surface.id
        });
      }
      editorSession.setSelection(selData);
    }

    
    
    onClick (event) {
      event.stopPropagation();
      event.preventDefault();
      this.selectNode();
    }

    onDblClick (event) {
      
      event.stopPropagation();
    }

    grabFocus (event) {
      let content = this.refs.content;
      if (content.grabFocus) {
        content.grabFocus(event);
        return true
      }
    }

    
    
    _reserveMousedown (event) {
      if (event.__reserved__) ; else {
        
        event.__reserved__ = this;
      }
    }

    
    
    _deriveStateFromSelectionState (sel, selState) {
      const surface = this._getSurfaceForSelection(sel, selState);
      const parentSurface = this.getParentSurface();
      let newState = { mode: null, unblocked: null };
      if (!surface) return newState
      
      if (surface === parentSurface) {
        let nodeId = this.props.node.id;
        if (sel.isNodeSelection() && sel.getNodeId() === nodeId) {
          if (sel.isFull()) {
            newState.mode = 'selected';
            newState.unblocked = true;
          } else if (sel.isBefore()) {
            newState.mode = 'cursor';
            newState.position = 'before';
          } else if (sel.isAfter()) {
            newState.mode = 'cursor';
            newState.position = 'after';
          }
        }
        if (sel.isContainerSelection() && sel.containsNode(nodeId)) {
          newState.mode = 'co-selected';
        }
      } else {
        let surfaceId = sel.surfaceId;
        let id = this.getId();
        if (id.length < surfaceId.length && surfaceId.startsWith(id) && surfaceId.charCodeAt(id.length) === SLASH) {
          let tail = surfaceId.slice(id.length + 1);
          if (tail.indexOf('/') > 0) {
            newState.mode = 'co-focused';
            newState.unblocked = true;
          } else {
            newState.mode = 'focused';
            newState.unblocked = true;
          }
        }
      }
      return newState
    }

    get _isIsolatedNodeComponent () { return true }

    static getDOMCoordinate (comp, coor) {
      let { start, end } = IsolatedNodeComponent.getDOMCoordinates(comp);
      if (coor.offset === 0) return start
      else return end
    }

    static getDOMCoordinates (comp) {
      const left = comp.refs.left;
      const right = comp.refs.right;
      return {
        start: {
          container: left.getNativeElement(),
          offset: 0
        },
        end: {
          container: right.getNativeElement(),
          offset: right.getChildCount()
        }
      }
    }

    static getCoordinate (nodeEl, options) {
      let comp = Component.unwrap(nodeEl, 'strict').context.isolatedNodeComponent;
      let offset = null;
      if (options.direction === 'left' || nodeEl === comp.refs.left.el) {
        offset = 0;
      } else if (options.direction === 'right' || nodeEl === comp.refs.right.el) {
        offset = 1;
      }
      let coor;
      if (offset !== null) {
        coor = new Coordinate([comp.props.node.id], offset);
        coor._comp = comp;
      }
      return coor
    }
  }

  class Blocker extends Component {
    render ($$) {
      return $$('div').addClass('sc-isolated-node-blocker')
        .attr('draggable', true)
        .attr('contenteditable', false)
        .on('click', this.onClick)
        .on('dblclick', this.onDblClick)
    }

    onClick (event) {
      if (event.target !== this.getNativeElement()) return
      
      event.stopPropagation();
      const comp = this._getIsolatedNodeComponent();
      comp.extendState({ mode: 'selected', unblocked: true });
      comp.selectNode();
    }

    onDblClick (event) {
      
      event.stopPropagation();
    }

    _getIsolatedNodeComponent () {
      return this.context.isolatedNodeComponent
    }
  }

  class SelectionFragmentComponent extends Component {
    render ($$) {
      
      let el = $$('span').addClass('se-selection-fragment');
      if (this.props.collaborator) {
        let collaboratorIndex = this.props.collaborator.colorIndex;
        el.addClass('sm-collaborator-' + collaboratorIndex);
      } else {
        el.addClass('sm-local-user');
      }
      el.append(this.props.children);
      return el
    }
  }

  class TextPropertyComponent extends AnnotatedTextComponent {
    didMount () {
      this.context.editorSession.getEditorState().addObserver(['document'], this._onDocumentChange, this, { stage: 'render', document: { path: this.getPath() } });
    }

    dispose () {
      this.context.editorSession.getEditorState().removeObserver(this);
    }

    render ($$) {
      let path = this.getPath();

      let el = this._renderContent($$)
        .addClass('sc-text-property')
        .attr({
          'data-path': getKeyForPath(path)
        })
        .css({
          'white-space': 'pre-wrap'
        });

      if (this.isEmpty()) {
        el.addClass('sm-empty');
        if (this.props.placeholder) {
          el.setAttribute('data-placeholder', this.props.placeholder);
        }
      }

      if (!this.props.withoutBreak) {
        el.append($$('br'));
      }

      return el
    }

    getAnnotations () {
      let path = this.getPath();
      let annos = this.getDocument().getAnnotations(path) || [];
      let markersManager = this.context.markersManager;
      if (markersManager) {
        annos = annos.concat(markersManager.getMarkers(path));
      }
      return annos
    }

    _renderFragment ($$, fragment) {
      let node = fragment.node;
      let id = node.id;
      let el;
      if (node.type === 'selection-fragment') {
        el = $$(SelectionFragmentComponent, { collaborator: node.collaborator });
      } else {
        el = super._renderFragment.apply(this, arguments);
        if (id) {
          el.ref(id + '@' + fragment.counter);
        }
      }
      el.attr('data-offset', fragment.offset);
      return el
    }

    getSurface () {
      return this.props.surface || this.context.surface
    }

    getSurfaceId () {
      let surface = this.getSurface();
      return surface ? surface.id : null
    }

    getContainerPath () {
      let surface = this.getSurface();
      return surface ? surface.getContainerPath() : null
    }

    isEditable () {
      const surface = this.getSurface();
      return surface ? surface.isEditable() : false
    }

    isReadonly () {
      const surface = this.getSurface();
      return surface ? surface.isReadonly() : true
    }

    getDOMCoordinate (charPos) {
      return this._getDOMCoordinate(this.el, charPos)
    }

    _finishFragment (fragment, context, parentContext) {
      context.attr('data-length', fragment.length);
      parentContext.append(context);
    }

    _getDOMCoordinate (el, charPos) {
      let l;
      let idx = 0;
      if (charPos === 0) {
        return {
          container: el.getNativeElement(),
          offset: 0
        }
      }
      for (let child = el.getFirstChild(); child; child = child.getNextSibling(), idx++) {
        if (child.isTextNode()) {
          l = child.textContent.length;
          if (l >= charPos) {
            return {
              container: child.getNativeElement(),
              offset: charPos
            }
          } else {
            charPos -= l;
          }
        } else if (child.isElementNode()) {
          let length = child.getAttribute('data-length');
          if (length) {
            l = parseInt(length, 10);
            if (l >= charPos) {
              
              if (child.attr('data-inline')) {
                let nextSibling = child.getNextSibling();
                if (nextSibling && nextSibling.isTextNode()) {
                  return {
                    container: nextSibling.getNativeElement(),
                    offset: 0
                  }
                } else {
                  return {
                    container: el.getNativeElement(),
                    offset: el.getChildIndex(child) + 1
                  }
                }
              }
              return this._getDOMCoordinate(child, charPos, idx)
            } else {
              charPos -= l;
            }
          } else {
            console.error('FIXME: Can not map to DOM coordinates.');
            return null
          }
        }
      }
    }

    _onDocumentChange () {
      this.rerender();
    }

    _getUnsupportedInlineNodeComponentClass () {
      return this.getComponent('unsupported-inline-node')
    }

    get _isTextPropertyComponent () { return true }

    

    
    static getCoordinate (root, el, offset) {
      let context = this._getPropertyContext(root, el, offset);
      if (!context) {
        return null
      }
      let textPropertyComp = context.comp;
      
      
      let charPos = textPropertyComp._getCharPos(context.node, context.offset);
      if (isNumber(charPos)) {
        let coor = new Coordinate(context.path, charPos);
        
        coor._comp = textPropertyComp;
        return coor
      } else {
        return null
      }
    }

    static _getPropertyContext (root, node, offset) {
      let result = {
        comp: null,
        el: null,
        path: null,
        node: node,
        offset: offset
      };
      while (node && node !== root) {
        if (node.isElementNode()) {
          let comp = Component.unwrap(node);
          if (comp && comp._isTextPropertyComponent) {
            result.comp = comp;
            result.el = node;
            result.path = comp.getPath();
            return result
          }
          
          
          
          if (node.getAttribute('data-inline')) {
            result.node = node;
            if (offset > 0) {
              result.offset = 1;
            }
          }
        }
        node = node.getParent();
      }
      return null
    }

    _getCharPos (node, offset) {
      let charPos = offset;
      let parent, childIdx;

      

      parent = node.getParent();
      if (node.isTextNode()) {
        
        if (node === parent.firstChild) {
          
          let parentPath = parent.getAttribute('data-path');
          let parentOffset = parent.getAttribute('data-offset');
          if (parentPath) {
            charPos = offset;
          
          } else if (parentOffset) {
            charPos = parseInt(parentOffset, 10) + offset;
          
          } else {
            charPos = this._getCharPos(parent, 0) + offset;
          }
        } else {
          
          childIdx = parent.getChildIndex(node);
          charPos = this._getCharPos(parent, childIdx) + offset;
        }
      } else if (node.isElementNode()) {
        let pathStr = node.getAttribute('data-path');
        let offsetStr = node.getAttribute('data-offset');
        
        
        if (pathStr) {
          charPos = this._countCharacters(node, offset);
        
        
        } else if (offsetStr) {
          childIdx = parent.getChildIndex(node);
          charPos = parseInt(offsetStr, 10) + this._countCharacters(node, offset);
        
        
        } else {
          childIdx = parent.getChildIndex(node);
          charPos = this._getCharPos(parent, childIdx) + this._countCharacters(node, offset);
        }
      } else {
        
        return null
      }
      return charPos
    }

    _countCharacters (el, maxIdx) {
      let charPos = 0;
      
      if (el.getAttribute('data-inline')) {
        return maxIdx === 0 ? 0 : 1
      }
      let l = el.getChildCount();
      if (arguments.length === 1) {
        maxIdx = l;
      }
      maxIdx = Math.min(l, maxIdx);
      for (let i = 0, child = el.getFirstChild(); i < maxIdx; child = child.getNextSibling(), i++) {
        if (child.isTextNode()) {
          charPos += child.getTextContent().length;
        } else if (child.isElementNode()) {
          let length = child.getAttribute('data-length');
          if (child.getAttribute('data-inline')) {
            charPos += 1;
          } else if (length) {
            charPos += parseInt(length, 10);
          } else {
            charPos += this._countCharacters(child);
          }
        }
      }
      return charPos
    }
  }

  const INLINENODES = ['a', 'b', 'big', 'i', 'small', 'tt', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'time', 'var', 'bdo', 'br', 'img', 'map', 'object', 'q', 'script', 'span', 'sub', 'sup', 'button', 'input', 'label', 'select', 'textarea'].reduce((m, n) => { m[n] = true; return m }, {});


  class Clipboard {
    copy (clipboardData, context) {
      
      let editorSession = context.editorSession;
      let snippet = editorSession.copy();
      this._setClipboardData(clipboardData, context, snippet);
    }

    cut (clipboardData, context) {
      let editorSession = context.editorSession;
      let snippet = editorSession.cut();
      this._setClipboardData(clipboardData, context, snippet);
    }

    paste (clipboardData, context, options = {}) {
      let types = {};
      for (let i = 0; i < clipboardData.types.length; i++) {
        types[clipboardData.types[i]] = true;
      }
      let html = types['text/html'] ? clipboardData.getData('text/html') : '';
      let success = false;
      if (html && !options.plainTextOnly) {
        success = this._pasteHtml(html, context, options);
      }
      if (!success) {
        
        let plainText = types['text/plain'] ? clipboardData.getData('text/plain') : '';
        this._pasteText(plainText, context, options);
      }
    }

    _setClipboardData (clipboardData, context, snippet) {
      let plainText = this._createClipboardText(context, snippet);
      let html = this._createClipboardHtml(context, snippet);
      clipboardData.setData('text/plain', plainText);
      clipboardData.setData('text/html', html);
    }

    _createClipboardText (context, snippet) {
      let config = context.config;
      let textExporter = config.createExporter('text');
      if (textExporter) {
        return textExporter.exportNode(snippet.getContainer())
      } else {
        return ''
      }
    }

    _createClipboardHtml (context, snippet) {
      let htmlExporter = context.config.createExporter('html');
      let elements = htmlExporter.convertContainer(snippet, snippet.getContainer().getPath());
      
      let snippetHtml;
      if (elements.length === 1 && elements[0].attr('data-id') === TEXT_SNIPPET_ID) {
        snippetHtml = elements[0].innerHTML;
      } else {
        snippetHtml = elements.map(el => {
          return el.outerHTML
        }).join('');
      }
      let jsonConverter = new JSONConverter();
      let jsonStr = JSON.stringify(jsonConverter.exportDocument(snippet));
      let substanceContent = `<script id="substance-clipboard" type="application/json">${jsonStr}</script>`;
      let html = '<html><head>' + substanceContent + '</head><body>' + snippetHtml + '</body></html>';
      return html
    }

    _pasteHtml (html, context, options = {}) {
      let htmlDoc;
      try {
        htmlDoc = DefaultDOMElement.parseHTML(html);
      } catch (err) {
        console.error('Could not parse HTML received from the clipboard', err);
        return false
      }

      
      
      
      let snippet;
      if (html.search(/script id=.substance-clipboard./) >= 0) {
        let substanceData = htmlDoc.find('#substance-clipboard');
        if (substanceData) {
          let jsonStr = substanceData.textContent;
          try {
            snippet = this._importFromJSON(context, jsonStr);
          } finally {
            if (!snippet) {
              console.error('Could not convert clipboard content.');
            }
          }
        }
      }
      if (!snippet) {
        let state = {};
        Object.assign(state, this._detectApplicationType(html, htmlDoc));
        
        
        if (platform.isWindows || state.isMicrosoftWord) {
          
          
          
          const START_FRAGMENT = '<!--StartFragment-->';
          const END_FRAGMENT = '<!--EndFragment-->';
          let mStart = html.indexOf(START_FRAGMENT);
          if (mStart >= 0) {
            let mEnd = html.indexOf(END_FRAGMENT);
            let fragment = html.slice(mStart + START_FRAGMENT.length, mEnd);
            htmlDoc = DefaultDOMElement.parseHTML(fragment);
          }
        }
        
        
        
        
        
        let bodyEl = htmlDoc.find('body');
        bodyEl = this._sanitizeBody(state, bodyEl);
        if (!bodyEl) {
          console.error('Invalid HTML.');
          return false
        }
        bodyEl = this._wrapIntoParagraph(bodyEl);
        snippet = context.editorSession.getDocument().createSnippet();
        let htmlImporter = context.config.createImporter('html', snippet);
        let container = snippet.get(SNIPPET_ID);
        bodyEl.getChildren().forEach(el => {
          let node = htmlImporter.convertElement(el);
          if (node) {
            container.append(node.id);
          }
        });
      }
      return context.editorSession.paste(snippet, options)
    }

    _pasteText (text, context) {
      context.editorSession.insertText(text);
    }

    _importFromJSON (context, jsonStr) {
      let snippet = context.editorSession.getDocument().newInstance();
      let jsonData = JSON.parse(jsonStr);
      let converter = new JSONConverter();
      converter.importDocument(snippet, jsonData);
      return snippet
    }

    _detectApplicationType (html, htmlDoc) {
      let state = {};
      let generatorMeta = htmlDoc.find('meta[name="generator"]');
      let xmnlsw = htmlDoc.find('html').getAttribute('xmlns:w');
      if (generatorMeta) {
        let generator = generatorMeta.getAttribute('content');
        if (generator.indexOf('LibreOffice') > -1) {
          state.isLibreOffice = true;
        }
      } else if (xmnlsw) {
        if (xmnlsw.indexOf('office:word') > -1) {
          state.isMicrosoftWord = true;
        }
      } else if (html.indexOf('docs-internal-guid') > -1) {
        state.isGoogleDoc = true;
      }
      return state
    }

    _sanitizeBody (state, body) {
      
      body.findAll('meta').forEach(el => el.remove());
      
      
      if (state.isLibreOffice || state.isMicrosoftWord) {
        let bodyHtml = body.getInnerHTML();
        body.setInnerHTML(bodyHtml.replace(/\r\n|\r|\n/g, ' '));
      }
      if (state.isGoogleDoc) {
        body = this._fixupGoogleDocsBody(state, body);
      }
      return body
    }

    _fixupGoogleDocsBody (state, body) {
      if (!body) return
      
      
      
      
      let bold = body.find('b');
      if (bold && /^docs-internal/.exec(bold.id)) {
        body = bold;
      }
      
      
      body.findAll('span').forEach(span => {
        
        
        
        
        
        
        
        
        let nodeTypes = [];
        if (span.getStyle('font-weight') === '700') nodeTypes.push('b');
        if (span.getStyle('font-style') === 'italic') nodeTypes.push('i');
        if (span.getStyle('vertical-align') === 'super') nodeTypes.push('sup');
        if (span.getStyle('vertical-align') === 'sub') nodeTypes.push('sub');
        
        span.removeAttribute('style');
        createInlineNodes(span.getParent(), true);

        function createInlineNodes (parentEl, isRoot) {
          if (nodeTypes.length > 0) {
            let el = parentEl.createElement(nodeTypes[0]);
            if (nodeTypes.length === 1) el.append(span.textContent);
            if (isRoot) {
              parentEl.replaceChild(span, el);
            } else {
              parentEl.appendChild(el);
            }
            nodeTypes.shift();
            createInlineNodes(el);
          }
        }
      });

      
      
      let tags = ['b', 'i', 'sup', 'sub'];
      tags.forEach(tag => {
        body.findAll(tag).forEach(el => {
          let previousSiblingEl = el.getPreviousSibling();
          if (previousSiblingEl && el.tagName === previousSiblingEl.tagName) {
            let parentEl = el.getParent();
            let newEl = parentEl.createElement(tag);
            newEl.setInnerHTML(previousSiblingEl.getInnerHTML() + el.getInnerHTML());
            parentEl.replaceChild(el, newEl);
            parentEl.removeChild(previousSiblingEl);
          }

          
          
          
          
          if (previousSiblingEl && previousSiblingEl.tagName && el.getChildCount() > 0 && el.getChildAt(0).tagName === previousSiblingEl.tagName) {
            let parentEl = el.getParent();
            let childEl = el.getChildAt(0);
            let newEl = parentEl.createElement(previousSiblingEl.tagName);
            let newChildEl = newEl.createElement(tag);
            newChildEl.setTextContent(childEl.textContent);
            newEl.appendChild(newChildEl);
            parentEl.replaceChild(el, newEl);
          }
        });
      });

      return body
    }

    
    _wrapIntoParagraph (bodyEl) {
      let childNodes = bodyEl.getChildNodes();
      let shouldWrap = false;
      for (let i = 0; i < childNodes.length; i++) {
        const c = childNodes[i];
        if (c.isTextNode()) {
          if (!(/^\s+$/.exec(c.textContent))) {
            shouldWrap = true;
            break
          }
        } else if (INLINENODES[c.tagName]) {
          shouldWrap = true;
          break
        }
      }
      if (shouldWrap) {
        let p = bodyEl.createElement('p');
        p.append(childNodes);
        bodyEl.append(p);
      }
      return bodyEl
    }
  }

  const DEBUG$1 = false;


  class DOMSelection {
    
    constructor (editor) {
      this.editor = editor;
      if (platform.inBrowser) {
        this.wRange = window.document.createRange();
      }
      
      
      this.state = { dom: null, model: null };
    }

    
    getSelection (options) {
      
      if (!platform.inBrowser) return
      let range = this.mapDOMSelection(options);
      let doc = this.editor.getDocument();
      
      return doc._createSelectionFromRange(range)
    }

    getSelectionForDOMRange (wrange) {
      let range = this.mapDOMRange(wrange);
      let doc = this.editor.getDocument();
      return doc._createSelectionFromRange(range)
    }

    
    mapDOMSelection (options) {
      let wSel = window.getSelection();
      let state = this.state;
      let range;
      
      
      if (DEBUG$1) console.info('DOM->Model: ', wSel.anchorNode, wSel.anchorOffset, wSel.focusNode, wSel.focusOffset);
      if (wSel.rangeCount === 0) return _null()
      let anchorNode = DefaultDOMElement.wrapNativeElement(wSel.anchorNode);
      if (wSel.isCollapsed) {
        let coor = this._getCoordinate(anchorNode, wSel.anchorOffset, options);
        if (!coor) return _null()
        range = _createRange({
          start: coor,
          end: coor
        });
      } else {
        let focusNode = DefaultDOMElement.wrapNativeElement(wSel.focusNode);
        range = this._getRange(anchorNode, wSel.anchorOffset, focusNode, wSel.focusOffset, options);
      }
      if (DEBUG$1) console.info('DOM->Model: range ', range ? range.toString() : null);
      state.model = range;
      return range

      function _null () {
        state.dom = null;
        state.model = null;
        return null
      }
    }

    
    setSelection (sel) {
      
      if (!platform.inBrowser) return
      let state = this.state;
      let wSel = window.getSelection();
      let wRange = this.wRange;
      if (!sel || sel.isNull()) return this.clear()
      
      let {start, end} = this.mapModelToDOMCoordinates(sel);
      if (!start) return this.clear()
      if (sel.isReverse()) {
        [start, end] = [end, start];
      }
      state.dom = {
        anchorNode: start.container,
        anchorOffset: start.offset,
        focusNode: end.container,
        focusOffset: end.offset
      };
      
      
      try {
        _set(state.dom);
      } finally {}

      function _set ({anchorNode, anchorOffset, focusNode, focusOffset}) {
        wSel.removeAllRanges();
        wRange.setStart(anchorNode, anchorOffset);
        wRange.setEnd(anchorNode, anchorOffset);
        wSel.addRange(wRange);
        if (focusNode !== anchorOffset || focusOffset !== anchorOffset) {
          wSel.extend(focusNode, focusOffset);
        }
      }
    }

    mapModelToDOMCoordinates (sel) {
      if (DEBUG$1) console.info('Model->DOM: sel =', sel.toString());
      let rootEl;
      let surface = this.editor.getSurfaceManager().getSurface(sel.surfaceId);
      if (!surface) {
        console.warn('No surface:', sel.surfaceId);
        rootEl = this.editor.getElement();
      } else {
        rootEl = surface.el;
      }
      if (sel.isNull() || sel.isCustomSelection()) {
        return {}
      }

      let start, end;
      if (sel.isPropertySelection() || sel.isContainerSelection()) {
        start = this._getDOMCoordinate(rootEl, sel.start);
        if (!start) {
          console.warn('FIXME: selection seems to be invalid.');
          return {}
        }
        if (sel.isCollapsed()) {
          end = start;
        } else {
          end = this._getDOMCoordinate(rootEl, sel.end);
          if (!end) {
            console.warn('FIXME: selection seems to be invalid.');
            return {}
          }
        }
      } else if (sel.isNodeSelection()) {
        let comp = Component.unwrap(rootEl.find('*[data-id="' + sel.getNodeId() + '"]'));
        if (!comp) {
          console.error('Could not find component with id', sel.getNodeId());
          return {}
        }
        if (comp._isIsolatedNodeComponent) {
          let coors = IsolatedNodeComponent.getDOMCoordinates(comp, sel);
          start = coors.start;
          end = coors.end;
          
          
          
        } else {
          let _nodeEl = comp.el;
          start = {
            container: _nodeEl.getNativeElement(),
            offset: 0
          };
          end = {
            container: _nodeEl.getNativeElement(),
            offset: _nodeEl.getChildCount()
          };
        }
      }
      if (DEBUG$1) console.info('Model->DOM:', start.container, start.offset, end.container, end.offset, 'isReverse?', sel.isReverse());
      return {start, end}
    }

    _getDOMCoordinate (rootEl, coor) {
      let domCoor = null;
      let comp;
      if (coor.isNodeCoordinate()) {
        comp = Component.unwrap(rootEl.find('*[data-id="' + coor.getNodeId() + '"]'));
        if (comp) {
          if (comp._isIsolatedNodeComponent) {
            domCoor = IsolatedNodeComponent.getDOMCoordinate(comp, coor);
          } else {
            let domOffset = 0;
            if (coor.offset > 0) {
              domOffset = comp.getChildCount();
            }
            domCoor = {
              container: comp.getNativeElement(),
              offset: domOffset
            };
          }
        }
      } else {
        comp = Component.unwrap(rootEl.find('.sc-text-property[data-path="' + coor.path.join('.') + '"]'));
        if (comp) {
          domCoor = comp.getDOMCoordinate(coor.offset);
        }
      }
      return domCoor
    }

    
    mapDOMRange (wRange, options) {
      return this._getRange(
        DefaultDOMElement.wrapNativeElement(wRange.startContainer),
        wRange.startOffset,
        DefaultDOMElement.wrapNativeElement(wRange.endContainer),
        wRange.endOffset, options)
    }

    
    clear () {
      window.getSelection().removeAllRanges();
      this.state.dom = null;
      this.state.model = null;
    }

    collapse (dir) {
      let wSel = window.getSelection();
      let wRange;
      if (wSel.rangeCount > 0) {
        wRange = wSel.getRangeAt(0);
        wRange.collapse(dir === 'left');
        wSel.removeAllRanges();
        wSel.addRange(wRange);
      }
    }

    select (el) {
      let wSel = window.getSelection();
      let wRange = window.document.createRange();
      wRange.selectNode(el.getNativeElement());
      wSel.removeAllRanges();
      wSel.addRange(wRange);
    }

    extend (el, offset) {
      let wSel = window.getSelection();
      wSel.extend(el.getNativeElement(), offset);
    }

    setCursor (el, offset) {
      let wSel = window.getSelection();
      let wRange = window.document.createRange();
      wRange.setStart(el.getNativeElement(), offset);
      wSel.removeAllRanges();
      wSel.addRange(wRange);
    }

    
    _getRange (anchorNode, anchorOffset, focusNode, focusOffset, options = {}) {
      let isReverse = DefaultDOMElement.isReverse(anchorNode, anchorOffset, focusNode, focusOffset);
      let isCollapsed = (anchorNode === focusNode && anchorOffset === focusOffset);
      let start, end;
      if (isCollapsed) {
        start = end = this._getCoordinate(anchorNode, anchorOffset, options);
      } else {
        start = this._getCoordinate(anchorNode, anchorOffset, { direction: isReverse ? 'right' : 'left' });
        end = this._getCoordinate(focusNode, focusOffset, options);
      }
      if (start && end) {
        return _createRange({ start, end, isReverse })
      } else {
        return null
      }
    }

    
    _getCoordinate (nodeEl, offset, options = {}) {
      let coor = null;
      
      if (!coor) {
        coor = TextPropertyComponent.getCoordinate(this.editor.getElement(), nodeEl, offset);
      }
      let comp = Component.unwrap(nodeEl);
      if (!coor && comp) {
        
        if (comp.context.isolatedNodeComponent) {
          coor = IsolatedNodeComponent.getCoordinate(nodeEl, options);
        }
      }
      
      
      if (!coor) {
        
        if (comp && comp._isContainerEditor) {
          let childIdx = (offset === 0) ? 0 : offset - 1;
          let isBefore = (offset === 0);
          let doc = comp.getDocument();
          let containerPath = comp.getContainerPath();
          let nodeIds = doc.get(containerPath);
          let childNode = doc.get(nodeIds[childIdx]);
          let childComp = comp.getChildAt(childIdx);
          coor = new Coordinate([childNode.id], isBefore ? 0 : 1);
          coor._comp = childComp;
        
        } else if (nodeEl.isElementNode() && nodeEl.getChildCount() > 0) {
          let child = (offset > 0) ? nodeEl.getChildAt(offset - 1) : nodeEl.firstChild;
          let prop;
          let childComp = Component.unwrap(child);
          if (childComp && childComp._isTextPropertyComponent) {
            prop = child;
          }
          if (prop) {
            coor = TextPropertyComponent.getCoordinate(nodeEl, prop, (offset > 0) ? prop.getChildCount() : 0);
          }
        }
      }
      return coor
    }
  }


  function _createRange ({start, end, isReverse}) {
    if (isReverse) {
      [start, end] = [end, start];
    }
    if (!start._comp || !end._comp) {
      console.error('FIXME: getCoordinate() should provide a component instance');
      return null
    }
    let surface = start._comp.context.surface;
    if (!surface) {
      console.error('FIXME: Editable components should have their surface in the context');
      return null
    }
    if (surface !== end._comp.context.surface) {
      console.error('Coordinates are within two different surfaces. Can not create a selection.');
      return null
    }
    return new Range(start, end, isReverse, surface.getContainerPath(), surface.id)
  }

  const BROWSER_DELAY = platform.isFF ? 1 : 0;


  class Surface extends Component {
    constructor (...args) {
      super(...args);

      this._initialize();
    }

    _initialize () {
      const editorSession = this.getEditorSession();
      if (!editorSession) throw new Error('editorSession is mandatory')
      this.name = this.props.name;
      if (!this.name) throw new Error('Surface must have a name.')
      if (this.name.indexOf('/') > -1) {
        
        throw new Error("Surface.name must not contain '/'")
      }
      
      this._surfaceId = Surface.createSurfaceId(this);

      this.clipboard = this.context.clipboard || this._initializeClipboard();
      this.domSelection = this.context.domSelection || this._initializeDOMSelection();

      this._state = {
        
        skipNextFocusEvent: false
      };
    }

    _initializeClipboard () {
      return new Clipboard()
    }

    _initializeDOMSelection () {
      return new DOMSelection(this)
    }

    getChildContext () {
      return {
        surface: this,
        parentSurfaceId: this.getId(),
        doc: this.getDocument(),
        
        
        isolatedNodeComponent: null
      }
    }

    didMount () {
      const surfaceManager = this.getSurfaceManager();
      if (surfaceManager && this.isEditable()) {
        surfaceManager.registerSurface(this);
      }
      const globalEventHandler = this.getGlobalEventHandler();
      if (globalEventHandler) {
        globalEventHandler.addEventListener('keydown', this._muteNativeHandlers, this);
      }
    }

    dispose () {
      const surfaceManager = this.getSurfaceManager();
      
      surfaceManager.unregisterSurface(this);
      const globalEventHandler = this.getGlobalEventHandler();
      if (globalEventHandler) {
        globalEventHandler.removeEventListener('keydown', this._muteNativeHandlers);
      }
    }

    didUpdate () {
      this._updateContentEditableState();
    }

    render ($$) {
      let tagName = this.props.tagName || 'div';
      let el = $$(tagName)
        .addClass(this._getClassNames())
        .attr('tabindex', 2)
        .attr('data-surface-id', this.id);

      if (!this.isDisabled()) {
        if (this.isEditable()) {
          
          el.on('keydown', this.onKeyDown);
          
          if (!platform.isIE) {
            el.on('compositionstart', this.onCompositionStart);
            el.on('compositionend', this.onCompositionEnd);
          }
          
          
          
          
          if (platform.isChromium || platform.isOpera) {
            el.on('input', this.onTextInput);
          } else {
            el.on('keypress', this.onTextInputShim);
          }
          el.on('paste', this._onPaste);
          el.on('cut', this._onCut);
        }
        if (!this.isReadonly()) {
          
          el.on('mousedown', this.onMouseDown);
          el.on('contextmenu', this.onContextMenu);
          
          
          el.on('focus', this.onNativeFocus);
          el.on('blur', this.onNativeBlur);
          
          el.on('click', this.onClick);
        }
        el.on('copy', this._onCopy);
      }

      return el
    }

    _getClassNames () {
      return `sc-surface sm-${this.name}`
    }

    getName () {
      return this.name
    }

    getId () {
      return this._surfaceId
    }

    getSurfaceId () {
      return this._surfaceId
    }

    isDisabled () {
      return this.props.disabled
    }

    isEditable () {
      return !this.isReadonly()
    }

    isReadonly () {
      return (this.props.editable === false || !this.parent.context.editable)
    }

    getElement () {
      return this.el
    }

    getDocument () {
      return this.getEditorSession().getDocument()
    }

    getComponentRegistry () {
      return this.context.componentRegistry
    }

    getConfig () {
      return this.context.config
    }

    getEditorSession () {
      return this.context.editorSession
    }

    getSurfaceManager () {
      return this.context.surfaceManager
    }

    getGlobalEventHandler () {
      return this.context.globalEventHandler
    }

    getKeyboardManager () {
      return this.context.keyboardManager
    }

    isEnabled () {
      return !this.state.disabled
    }

    isContainerEditor () {
      return false
    }

    isCustomEditor () {
      return false
    }

    hasNativeSpellcheck () {
      return this.props.spellcheck === 'native'
    }

    getContainerPath () {
      return null
    }

    focus () {
      const editorSession = this.getEditorSession();
      const sel = editorSession.getSelection();
      if (sel.surfaceId !== this.getId()) {
        this.selectFirst();
      }
    }

    blur () {
      const editorSession = this.getEditorSession();
      const sel = editorSession.getSelection();
      if (sel.surfaceId === this.getId()) {
        editorSession.setSelection(null);
      }
    }

    selectFirst () {
      
    }

    type (ch) {
      const editorSession = this.getEditorSession();
      editorSession.transaction((tx) => {
        tx.insertText(ch);
      }, { action: 'type' });
    }

    
    rerenderDOMSelection () {
      if (this.isDisabled()) return
      if (platform.inBrowser) {
        
        let sel = this.getEditorSession().getSelection();
        if (sel.surfaceId === this.getId()) {
          this.domSelection.setSelection(sel);
          
          const scrollPane = this.context.scrollPane;
          if (scrollPane && scrollPane.onSelectionPositioned) {
            console.error('DEPRECATED: you should manage the scrollPane yourself');
            scrollPane.onSelectionPositioned();
          }
        }
      }
    }

    getDomNodeForId (nodeId) {
      return this.el.getNativeElement().querySelector('*[data-id="' + nodeId + '"]')
    }

    

    
    onKeyDown (event) {
      if (!this._shouldConsumeEvent(event)) return
      

      
      if (event.key === 'Dead') return

      
      const keyboardManager = this.getKeyboardManager();
      if (!keyboardManager || !keyboardManager.onKeydown(event)) {
        
        switch (event.keyCode) {
          
          case keys$1.LEFT:
          case keys$1.RIGHT:
            return this._handleLeftOrRightArrowKey(event)
          case keys$1.UP:
          case keys$1.DOWN:
            return this._handleUpOrDownArrowKey(event)
          case keys$1.HOME:
          case keys$1.END:
            return this._handleHomeOrEndKey(event)
          case keys$1.PAGEUP:
          case keys$1.PAGEDOWN:
            return this._handlePageUpOrDownKey(event)
          
          case keys$1.ENTER:
            return this._handleEnterKey(event)
          case keys$1.TAB:
            return this._handleTabKey(event)
          case keys$1.BACKSPACE:
          case keys$1.DELETE:
            return this._handleDeleteKey(event)
          case keys$1.ESCAPE:
            return this._handleEscapeKey(event)
          case keys$1.SPACE:
            return this._handleSpaceKey(event)
          default:
            break
        }
      }
    }

    onTextInput (event) {
      if (!this._shouldConsumeEvent(event)) return
      
      event.preventDefault();
      event.stopPropagation();
      if (!event.data) return
      let ch = event.data;
      const keyboardManager = this.getKeyboardManager();
      if (!keyboardManager || !keyboardManager.onTextInput(ch)) {
        this.type(ch);
      }
    }

    
    onCompositionStart (event) {
      if (!this._shouldConsumeEvent(event)) return
      
      
      
      
      
      
      
      if (event.data) {
        const editorSession = this.getEditorSession();
        let l = event.data.length;
        let sel = editorSession.getSelection();
        if (sel.isPropertySelection() && sel.isCollapsed()) {
          
          let offset = sel.start.offset;
          editorSession.setSelection(sel.createWithNewRange(offset - l, offset));
        }
      }
    }

    onCompositionEnd (event) {
      if (!this._shouldConsumeEvent(event)) return
      
      
      
      if (platform.isFF) {
        event.preventDefault();
        event.stopPropagation();
        if (!event.data) return
        this._delayed(() => {
          let ch = event.data;
          const keyboardManager = this.getKeyboardManager();
          if (!keyboardManager || !keyboardManager.onTextInput(ch)) {
            this.type(ch);
          }
        });
      }
    }

    
    
    onTextInputShim (event) {
      if (!this._shouldConsumeEvent(event)) return
      
      if (
        
        event.which === 0 || event.charCode === 0 ||
        
        event.keyCode === keys$1.TAB || event.keyCode === keys$1.ESCAPE ||
        
        Boolean(event.metaKey) || (Boolean(event.ctrlKey) ^ Boolean(event.altKey))
      ) {
        return
      }
      let ch = String.fromCharCode(event.which);
      if (!event.shiftKey) {
        ch = ch.toLowerCase();
      }
      event.preventDefault();
      event.stopPropagation();
      const keyboardManager = this.getKeyboardManager();
      if (!keyboardManager || !keyboardManager.onTextInput(ch)) {
        if (ch.length > 0) {
          this.type(ch);
        }
      }
    }

    onClick (event) {
      if (!this._shouldConsumeEvent(event)) {
        
        return false
      }
      
      event.stopPropagation();
    }

    
    
    
    
    
    onMouseDown (event) {
      if (!this._shouldConsumeEvent(event)) {
        
        return false
      }
      
      event.stopPropagation();

      
      
      
      
      
      if (event.__reserved__) {
        
        return
      } else {
        
        event.__reserved__ = this;
      }

      
      
      
      if (this.isEditable()) {
        this.el.setAttribute('contenteditable', true);
      }

      
      if (event.button !== 0) {
        return
      }

      
      if (!(platform.isIE && platform.version < 12) && event.detail >= 3) {
        let sel = this.getEditorSession().getSelection();
        if (sel.isPropertySelection()) {
          this._selectProperty(sel.path);
          event.preventDefault();
          event.stopPropagation();
          return
        } else if (sel.isContainerSelection()) {
          this._selectProperty(sel.startPath);
          event.preventDefault();
          event.stopPropagation();
          return
        }
      }
      
      
      
      
      this._state.skipNextFocusEvent = true;

      
      this.el.on('mouseup', this.onMouseUp, this);
      
      
      if (platform.inBrowser) {
        let documentEl = DefaultDOMElement.wrapNativeElement(window.document);
        documentEl.on('mouseup', this.onMouseUp, this);
      }
    }

    onMouseUp (e) {
      
      this.el.off('mouseup', this.onMouseUp, this);
      if (platform.inBrowser) {
        let documentEl = DefaultDOMElement.wrapNativeElement(window.document);
        documentEl.off('mouseup', this.onMouseUp, this);
      }
      
      
      
      
      
      e.stopPropagation();
      
      
      
      
      this._delayed(() => {
        let sel = this.domSelection.getSelection();
        this._setSelection(sel);
      });
    }

    
    
    
    onContextMenu (event) {
      if (!this._shouldConsumeEvent(event)) return
      let sel = this.domSelection.getSelection();
      this._setSelection(sel);
    }

    onNativeBlur () {
      
      let _state = this._state;
      _state.hasNativeFocus = false;
    }

    onNativeFocus () {
      
      let _state = this._state;
      _state.hasNativeFocus = true;
    }

    _onCopy (e) {
      e.preventDefault();
      e.stopPropagation();
      let clipboardData = e.clipboardData;
      this.clipboard.copy(clipboardData, this.context);
    }

    _onCut (e) {
      e.preventDefault();
      e.stopPropagation();
      let clipboardData = e.clipboardData;
      this.clipboard.cut(clipboardData, this.context);
    }

    _onPaste (e) {
      e.preventDefault();
      e.stopPropagation();
      let clipboardData = e.clipboardData;
      
      this.clipboard.paste(clipboardData, this.context);
    }

    

    _onSelectionChanged (selection) {
      let newMode = this._deriveModeFromSelection(selection);
      if (this.state.mode !== newMode) {
        this.extendState({
          mode: newMode
        });
      }
    }

    
    _deriveModeFromSelection (sel) {
      if (!sel) return null
      let surfaceId = sel.surfaceId;
      let id = this.getId();
      let mode;
      if (startsWith(surfaceId, id)) {
        if (surfaceId.length === id.length) {
          mode = 'focused';
        } else {
          mode = 'co-focused';
        }
      }
      return mode
    }

    _updateContentEditableState () {
      
      
      
      
      
      
      function isInsideOpenIsolatedNode (editorSession, surfaceManager) {
        if (surfaceManager) {
          let sel = editorSession.getSelection();
          let surface = surfaceManager.getSurface(sel.surfaceId);
          if (surface) {
            let isolatedNodeComponent = surface.context.isolatedNodeComponent;
            if (isolatedNodeComponent) {
              return isolatedNodeComponent.isOpen()
            }
          }
        }
      }

      
      let enableContenteditable = this.isEditable() && !this.props.disabled;
      if (enableContenteditable && this.state.mode === 'co-focused') {
        enableContenteditable = isInsideOpenIsolatedNode(this.getEditorSession(), this.getSurfaceManager());
      }
      if (enableContenteditable) {
        this.el.setAttribute('contenteditable', true);
      } else {
        
        this.el.removeAttribute('contenteditable');
      }
    }

    _blur () {
      if (this.el) {
        this.el.blur();
      }
    }

    _focus () {
      if (this.isDisabled()) return
      
      
      
      if (platform.isFF) {
        this.domSelection.clear();
        this.el.getNativeElement().blur();
      }
      this._focusElement();
    }

    _focusElement () {
      this._state.hasNativeFocus = true;
      
      
      
      
      if (this.el && !platform.isWebkit) {
        this._state.skipNextFocusEvent = true;
        
        
        this.el.focus({ preventScroll: true });
        this._state.skipNextFocusEvent = false;
      }
    }

    _handleLeftOrRightArrowKey (event) {
      event.stopPropagation();
      let direction = (event.keyCode === keys$1.LEFT) ? 'left' : 'right';
      
      
      this._delayed(() => {
        this._updateModelSelection({direction});
      });
    }

    _handleUpOrDownArrowKey (event) {
      event.stopPropagation();
      
      
      this._delayed(() => {
        let options = {
          direction: (event.keyCode === keys$1.UP) ? 'left' : 'right'
        };
        this._updateModelSelection(options);
      });
    }

    _handleHomeOrEndKey (event) {
      event.stopPropagation();
      
      
      this._delayed(() => {
        let options = {
          direction: (event.keyCode === keys$1.HOME) ? 'left' : 'right'
        };
        this._updateModelSelection(options);
      });
    }

    _handlePageUpOrDownKey (event) {
      event.stopPropagation();
      
      
      this._delayed(() => {
        let options = {
          direction: (event.keyCode === keys$1.PAGEUP) ? 'left' : 'right'
        };
        this._updateModelSelection(options);
      });
    }

    _handleSpaceKey (event) {
      event.stopPropagation();
      event.preventDefault();
      const ch = ' ';
      const keyboardManager = this.getKeyboardManager();
      if (!keyboardManager || !keyboardManager.onTextInput(ch)) {
        this.type(ch);
      }
    }

    _handleTabKey (event) {
      event.stopPropagation();
      this.el.emit('tab', {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        code: event.code
      });
      if (this.props.handleTab === false) {
        event.preventDefault();
      } else {
        this.__handleTab(event);
      }
    }

    __handleTab () {
      
      
      this._delayed(() => {
        this._updateModelSelection();
      });
    }

    _handleEnterKey (event) {
      event.preventDefault();
      event.stopPropagation();
      this.getEditorSession().transaction((tx) => {
        tx.break();
      }, { action: 'break' });
    }

    _handleEscapeKey () {}

    _handleDeleteKey (event) {
      event.preventDefault();
      event.stopPropagation();
      let direction = (event.keyCode === keys$1.BACKSPACE) ? 'left' : 'right';
      this.getEditorSession().transaction((tx) => {
        tx.deleteCharacter(direction);
      }, { action: 'delete' });
    }

    _hasNativeFocus () {
      return Boolean(this._state.hasNativeFocus)
    }

    _setSelection (sel) {
      
      
      
      
      
      
      
      
      if (!sel.isNull() && sel.surfaceId === this.id && platform.isFF) {
        this._focusElement();
      }
      this.getEditorSession().setSelection(sel);
    }

    _updateModelSelection (options) {
      let sel = this.domSelection.getSelection(options);
      
      
      
      this._setSelection(sel);
    }

    _selectProperty (path) {
      let doc = this.getDocument();
      let text = doc.get(path);
      this._setSelection(doc.createSelection({
        type: 'property',
        path: path,
        startOffset: 0,
        endOffset: text.length
      }));
    }

    _renderNode ($$, nodeId) {
      let doc = this.getDocument();
      let node = doc.get(nodeId);
      let ComponentClass = this.getComponent(node.type, true);
      if (!ComponentClass) {
        console.error('Could not resolve a component for type: ' + node.type);
        ComponentClass = this.getComponent('unsupported-node');
      }
      return $$(ComponentClass, this._getNodeProps(node))
    }

    _getNodeProps (node) {
      return {
        node,
        placeholder: this.props.placeholder,
        disabled: this.props.disabled
      }
    }

    
    _shouldConsumeEvent (event) {
      
      let comp = Component.unwrap(event.target);
      return (comp && (comp === this || comp.context.surface === this))
    }

    
    getSelectionFromEvent (event) {
      let domRange = getDOMRangeFromEvent(event);
      let sel = this.domSelection.getSelectionForDOMRange(domRange);
      sel.surfaceId = this.getId();
      return sel
    }

    setSelectionFromEvent (event) {
      let sel = this.getSelectionFromEvent(event);
      if (sel) {
        this._state.skipNextFocusEvent = true;
        this._setSelection(sel);
      } else {
        console.error('Could not create a selection from event.');
      }
    }

    get id () {
      return this._surfaceId
    }

    _delayed (fn) {
      if (platform.inBrowser) {
        window.setTimeout(fn, BROWSER_DELAY);
      }
    }

    
    _muteNativeHandlers (event) {
      let contentEditableShortcuts;

      if (platform.isMac) {
        contentEditableShortcuts = [
          'META+66', 
          'META+73', 
          'META+85' 
        ];
      } else {
        contentEditableShortcuts = [
          'CTRL+66', 
          'CTRL+73', 
          'CTRL+85' 
        ];
      }

      const key = parseKeyEvent(event);
      if (contentEditableShortcuts.indexOf(key) > -1) {
        event.preventDefault();
      }
    }
  }

  Surface.prototype._isSurface = true;


  Surface.createSurfaceId = function (surface) {
    let parentSurfaceId = surface.context.parentSurfaceId;
    if (parentSurfaceId) {
      return parentSurfaceId + '/' + surface.name
    } else {
      return surface.name
    }
  };

  class TextPropertyEditor extends Surface {
    constructor (parent, props) {
      
      props.name = props.name || props.path.join('.');
      super(parent, props);

      if (!props.path) {
        throw new Error("Property 'path' is mandatory.")
      }
    }

    didMount () {
      super.didMount();

      let editorState = this.context.editorSession.getEditorState();
      editorState.addObserver(['selection'], this._onSelectionChanged, this, {
        stage: 'render'
      });
    }

    dispose () {
      super.dispose();

      let editorState = this.context.editorSession.getEditorState();
      editorState.removeObserver(this);
    }

    render ($$) {
      const TextPropertyComponent = this.getComponent('text-property');

      let el = super.render.apply(this, arguments);

      if (!this.props.disabled) {
        el.addClass('sm-enabled');
        el.attr('contenteditable', true);
        
        el.attr('spellcheck', this.props.spellcheck === 'native');
      }

      el.append(
        $$(TextPropertyComponent, {
          doc: this.getDocument(),
          placeholder: this.props.placeholder,
          tagName: this.props.tagName || 'div',
          path: this.props.path,
          markers: this.props.markers,
          withoutBreak: this.props.withoutBreak
        }).ref('property')
      );

      if (this.isEditable()) {
        el.addClass('sm-editable');
      } else {
        el.addClass('sm-readonly');
        
        
        el.setAttribute('contenteditable', false);
      }

      return el
    }

    _getClassNames () {
      return 'sc-text-property-editor sc-surface'
    }

    selectFirst () {
      this.editorSession.setSelection({
        type: 'property',
        path: this.getPath(),
        startOffset: 0,
        surfaceId: this.id
      });
    }

    getPath () {
      return this.props.path
    }

    _handleEnterKey (event) {
      event.stopPropagation();
      event.preventDefault();
      if (this.props.multiLine) {
        this.type('\n');
      }
    }

    _handleEscapeKey (event) {
      this.el.emit('escape', {
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
        code: event.code
      });
    }

    get _isTextPropertyEditor () { return true }
  }

  class TextNodeComponent$1 extends Component {
    
    didMount () {}

    render ($$) {
      let parentSurface = this.context.surface;
      let TextPropertyComponent;
      
      if (parentSurface && parentSurface.isContainerEditor()) {
        
        TextPropertyComponent = this.getComponent('text-property');
      } else {
        TextPropertyComponent = this.getComponent('text-property-editor');
      }
      const node = this.props.node;
      const tagName = this.getTagName();
      const path = node.getPath();
      let el = $$(tagName)
        .addClass(this.getClassNames())
        .attr('data-id', node.id);
      el.append(
        $$(TextPropertyComponent, {
          doc: node.getDocument(),
          name: getKeyForPath(path),
          path,
          placeholder: this.props.placeholder
        })
      );
      
      return el
    }

    getTagName () {
      return 'div'
    }

    getClassNames () {
      
      return 'sc-text-node sm-' + this.props.node.type
    }
  }

  class UnsupportedNodeComponent extends IsolatedNodeComponent {
    _getContentClass () {
      return UnsupportedContentComponent
    }
  }

  class UnsupportedContentComponent extends Component {
    render ($$) {
      const node = this.props.node;
      let data;
      if (node._isXMLNode) {
        data = node.toXML().serialize();
      } else if (node.data) {
        data = node.data;
      } else {
        data = JSON.stringify(node.toJSON());
      }
      let el = $$('div').addClass('sc-unsupported').append(
        $$('pre').text(data)
      ).attr({
        'data-id': node.id,
        'contenteditable': false
      });

      return el
    }
  }

  var BasePackage = {
    configure (config) {
      config.addComponent('annotation', AnnotationComponent);
      config.addComponent('isolated-node', IsolatedNodeComponent);
      config.addComponent('text-node', TextNodeComponent$1);
      config.addComponent('text-property', TextPropertyComponent);
      config.addComponent('text-property-editor', TextPropertyEditor);
      config.addComponent('unsupported-node', UnsupportedNodeComponent);
    }
  }

  const DISABLED = Object.freeze({
    disabled: true
  });

  class CommandManager {
    constructor (editorSession, deps, commands) {
      this.editorSession = editorSession;
      
      
      
      this._allCommands = commands;
      this._commands = null;

      editorSession.getEditorState().addObserver(deps, this.reduce, this, { stage: 'update' });
    }

    dispose () {
      this.editorSession.getEditorState().off(this);
    }

    initialize () {
      this._initializeCommands();
      this.reduce();
    }

    reduce () {
      const commandStates = this._getCommandStates();
      this.editorSession.getEditorState().set('commandStates', commandStates);
    }

    executeCommand (commandName, params = {}) {
      const editorState = this.editorSession.getEditorState();
      const cmdState = editorState.commandStates[commandName];
      if (!cmdState || cmdState.disabled) {
        return false
      } else {
        const commands = this._getCommands();
        const cmd = commands.get(commandName);
        const context = this.editorSession.getContext();
        params = Object.assign(new HandlerParams(context), params);
        params.commandState = cmdState;
        cmd.execute(params, context);
        return true
      }
    }

    _getCommandStates () {
      if (!this._commands) this._initializeCommands();

      const editorState = this.editorSession.getEditorState();
      const context = this.editorSession.getContext();
      const params = new HandlerParams(context);
      const doc = editorState.document;
      const sel = editorState.selection;
      const selectionState = editorState.selectionState;
      const isBlurred = editorState.isBlurred;
      const noSelection = !sel || sel.isNull() || !sel.isAttached();

      const commandStates = Object.assign({}, this._allDisabled);
      
      
      
      
      if (!isBlurred && !noSelection && !sel.isCustomSelection()) {
        const path = sel.start.path;
        const node = doc.get(path[0]);

        
        
        
        
        if (!node) {
          throw new Error('FIXME: explain when this happens')
        }

        const nodeProp = _getNodeProp(node, path);
        const isInsideText = nodeProp ? nodeProp.isText() : false;

        
        
        if (isInsideText && sel.isPropertySelection() && !selectionState.isInlineNodeSelection) {
          Object.assign(commandStates, _disabledIfDisallowedTargetType(this._annotationCommands, nodeProp.targetTypes, params, context));
        }

        
        let containerPath = selectionState.containerPath;
        if (containerPath) {
          let containerProp = doc.getProperty(containerPath);
          if (containerProp) {
            let targetTypes = containerProp.targetTypes;
            Object.assign(commandStates, _disabledIfDisallowedTargetType(this._insertCommands, targetTypes, params, context));
            Object.assign(commandStates, _disabledIfDisallowedTargetType(this._switchTypeCommands, targetTypes, params, context));
          }
        }
      }

      
      Object.assign(commandStates, _getCommandStates(this._otherCommands, params, context));

      return commandStates
    }

    _getCommands () {
      if (!this._commands) {
        this._initializeCommands();
      }
      return this._commands
    }

    _initializeCommands () {
      const context = this.editorSession.getContext();
      const allCommands = Array.from(this._allCommands);
      
      let commands = new Map(allCommands.filter(([name, command]) => {
        
        return !command.shouldBeEnabled || command.shouldBeEnabled(context)
      }));
      const annotationCommands = [];
      const insertCommands = [];
      const switchTypeCommands = [];
      const otherCommands = [];
      commands.forEach(command => {
        if (command.isAnnotationCommand()) {
          annotationCommands.push(command);
        } else if (command.isInsertCommand()) {
          insertCommands.push(command);
        } else if (command.isSwitchTypeCommand()) {
          switchTypeCommands.push(command);
        } else {
          otherCommands.push(command);
        }
      });
      this._commands = commands;
      this._annotationCommands = annotationCommands;
      this._insertCommands = insertCommands;
      this._switchTypeCommands = switchTypeCommands;
      this._otherCommands = otherCommands;
      this._allDisabled = _disabled(Array.from(commands.values()));
    }
  }

  function _getNodeProp (node, path) {
    if (path.length === 2) {
      let propName = last(path);
      let prop = node.getSchema().getProperty(propName);
      if (!prop) console.error('Could not find property for path', path, node);
      return prop
    }
  }

  function _disabled (commands) {
    return commands.reduce((m, c) => {
      m[c.getName()] = DISABLED;
      return m
    }, {})
  }

  const EMPTY_SET = new Set();

  function _disabledIfDisallowedTargetType (commands, targetTypes, params, context) {
    targetTypes = targetTypes || EMPTY_SET;
    return commands.reduce((m, cmd) => {
      const type = cmd.getType();
      const name = cmd.getName();
      if (targetTypes.has(type)) {
        m[name] = cmd.getCommandState(params, context);
      } else {
        m[name] = DISABLED;
      }
      return m
    }, {})
  }

  function _getCommandStates (commands, params, context) {
    return commands.reduce((m, command) => {
      m[command.getName()] = command.getCommandState(params, context);
      return m
    }, {})
  }

  function findParentComponent (el) {
    while (el) {
      const comp = Component.unwrap(el);
      if (comp) return comp
      el = el.parentNode;
    }
  }

  class ComponentRegistry extends DeprecatedRegistry {
    constructor (entries) {
      super(entries, function (ComponentClass) {
        if (!ComponentClass.prototype._isComponent) {
          throw new Error('Component registry: wrong type. Expected a ComponentClass. Was: ' + String(ComponentClass))
        }
      });
    }
  }

  class ContainerEditor extends Surface {
    constructor (parent, props, el) {
      
      props.containerPath = props.containerPath || props.node.getContentPath();
      props.name = props.name || props.containerPath.join('.') || props.node.id;

      super(parent, props, el);
    }

    _initialize () {
      super._initialize();

      this.containerPath = this.props.containerPath;
      if (!isArray(this.containerPath)) {
        throw new Error("Property 'containerPath' is mandatory.")
      }

      this._deriveInternalState(this.props);
    }

    
    shouldRerender (newProps) {
      if (newProps.disabled !== this.props.disabled) return true
      
      
      return false
    }

    willReceiveProps (newProps) {
      super.willReceiveProps.apply(this, arguments);
      this._deriveInternalState(newProps);
    }

    didMount () {
      super.didMount();

      let editorState = this.context.editorSession.getEditorState();
      editorState.addObserver(['selection'], this._onSelectionChanged, this, {
        stage: 'render'
      });
      editorState.addObserver(['document'], this._onContainerChanged, this, {
        stage: 'render',
        document: {
          path: this.containerPath
        }
      });
    }

    dispose () {
      super.dispose();

      let editorState = this.context.editorSession.getEditorState();
      editorState.removeObserver(this);
    }

    render ($$) {
      let el = super.render($$);

      let doc = this.getDocument();
      let containerPath = this.getContainerPath();
      el.attr('data-id', containerPath.join('.'));

      
      el.attr('spellcheck', this.props.spellcheck === 'native');

      let ids = doc.get(containerPath);
      el.append(
        ids.map((id, index) => {
          return this._renderNode($$, doc.get(id), index)
        })
      );

      
      if (!this.props.disabled && !this.isEmpty()) {
        el.addClass('sm-enabled');
        el.setAttribute('contenteditable', true);
      }

      if (this.isEditable()) {
        el.addClass('sm-editable');
      } else {
        el.addClass('sm-readonly');
        
        
        el.setAttribute('contenteditable', false);
      }

      return el
    }

    _getClassNames () {
      return 'sc-container-editor sc-surface'
    }

    selectFirst () {
      let doc = this.getDocument();
      let containerPath = this.getContainerPath();
      let nodeIds = doc.get();
      if (nodeIds.length > 0) {
        const editorSession = this.getEditorSession();
        const first = doc.get(nodeIds[0]);
        setCursor(editorSession, first, containerPath, 'before');
      }
    }

    _renderNode ($$, node, nodeIndex) {
      if (!node) throw new Error('Illegal argument')
      let ComponentClass = this._getNodeComponentClass(node);
      let props = this._getNodeProps(node);
      return $$(ComponentClass, props).ref(node.id)
    }

    _getNodeComponentClass (node) {
      let ComponentClass = this.getComponent(node.type, 'not-strict');
      if (ComponentClass) {
        
        if (node.isText() || this.props.disabled) {
          return ComponentClass
        
        
        } else if (ComponentClass.prototype._isCustomNodeComponent || ComponentClass.prototype._isIsolatedNodeComponent) {
          return ComponentClass
        } else {
          return this.getComponent('isolated-node')
        }
      } else {
        
        
        if (node.isText()) {
          return this.getComponent('text-node')
        
        } else {
          return this.getComponent('unsupported-node')
        }
      }
    }

    _deriveInternalState (props) {
      let _state = this._state;
      if (!props.hasOwnProperty('enabled') || props.enabled) {
        _state.enabled = true;
      } else {
        _state.enabled = false;
      }
    }

    _selectNextIsolatedNode (direction) {
      let selState = this.getEditorSession().getSelectionState();
      let node = (direction === 'left') ? selState.previousNode : selState.nextNode;
      let isIsolatedNode = !node.isText() && !node.isList();
      if (!node || !isIsolatedNode) return false
      if (
        (direction === 'left' && selState.isFirst) ||
        (direction === 'right' && selState.isLast)
      ) {
        this.getEditorSession().setSelection({
          type: 'node',
          nodeId: node.id,
          containerPath: this.getContainerPath(),
          surfaceId: this.id
        });
        return true
      }
      return false
    }

    _softBreak () {
      let editorSession = this.getEditorSession();
      let sel = editorSession.getSelection();
      if (sel.isPropertySelection()) {
        editorSession.transaction(tx => {
          tx.insertText('\n');
        }, { action: 'soft-break' });
      } else {
        editorSession.transaction((tx) => {
          tx.break();
        }, { action: 'break' });
      }
    }

    _handleEnterKey (event) {
      
      if (event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        this._softBreak();
      } else {
        super._handleEnterKey(event);
      }
    }

    _handleLeftOrRightArrowKey (event) {
      event.stopPropagation();
      const doc = this.getDocument();
      const sel = this.getEditorSession().getSelection();
      const left = (event.keyCode === keys$1.LEFT);
      const right = !left;
      const direction = left ? 'left' : 'right';

      if (sel && !sel.isNull()) {
        let containerPath = sel.containerPath;
        
        if (sel.isNodeSelection()) {
          let nodeIds = doc.get(containerPath);
          let nodePos = getContainerPosition(doc, containerPath, sel.getNodeId());
          if ((left && nodePos === 0) || (right && nodePos === nodeIds.length - 1)) {
            event.preventDefault();
            return
          }
        }
        if (sel.isNodeSelection() && !event.shiftKey) {
          this.domSelection.collapse(direction);
        }
      }

      this._delayed(() => {
        this._updateModelSelection({ direction });
      });
    }

    _handleUpOrDownArrowKey (event) {
      event.stopPropagation();
      const doc = this.getDocument();
      const sel = this.getEditorSession().getSelection();
      const up = (event.keyCode === keys$1.UP);
      const down = !up;
      const direction = up ? 'left' : 'right';

      if (sel && !sel.isNull()) {
        let containerPath = sel.containerPath;
        
        if (sel.isNodeSelection()) {
          let nodeIds = doc.get(containerPath);
          let nodePos = getContainerPosition(doc, containerPath, sel.getNodeId());
          if ((up && nodePos === 0) || (down && nodePos === nodeIds.length - 1)) {
            event.preventDefault();
            return
          }
          
          
          let editorSession = this.getEditorSession();
          
          
          
          if (!event.shiftKey) {
            event.preventDefault();
            if (up) {
              let prev = doc.get(nodeIds[nodePos - 1]);
              setCursor(editorSession, prev, containerPath, 'after');
              return
            } else {
              let next = doc.get(nodeIds[nodePos + 1]);
              setCursor(editorSession, next, containerPath, 'before');
              return
            }
          }
        }
      }

      this._delayed(() => {
        this._updateModelSelection({ direction });
      });
    }

    _handleTabKey (event) {
      const editorSession = this.getEditorSession();
      const sel = editorSession.getSelection();
      
      if (sel.isNodeSelection() && sel.isFull()) {
        const comp = this.refs[sel.getNodeId()];
        if (comp && stepIntoIsolatedNode(editorSession, comp)) {
          event.preventDefault();
          event.stopPropagation();
          return
        }
      }
      super._handleTabKey(event);
    }

    __handleTab (e) {
      e.preventDefault();
      if (e.shiftKey) {
        this.getEditorSession().transaction((tx) => {
          tx.dedent();
        }, { action: 'dedent' });
      } else {
        this.getEditorSession().transaction((tx) => {
          tx.indent();
        }, { action: 'indent' });
      }
    }

    
    isContainerEditor () {
      return true
    }

    
    getContainerPath () {
      return this.containerPath
    }

    isEmpty () {
      let ids = this.getDocument().get(this.containerPath);
      return (!ids || ids.length === 0)
    }

    isEditable () {
      return super.isEditable.call(this) && !this.isEmpty()
    }

    
    _onContainerChanged (change) {
      let doc = this.getDocument();
      
      let renderContext = RenderingEngine.createContext(this);
      let $$ = renderContext.$$;
      let containerPath = this.getContainerPath();
      for (let i = 0; i < change.ops.length; i++) {
        let op = change.ops[i];
        if (isArrayEqual(op.path, containerPath)) {
          if (op.type === 'update') {
            let diff = op.diff;
            if (diff.type === 'insert') {
              let nodeId = diff.getValue();
              let node = doc.get(nodeId);
              let nodeEl;
              if (node) {
                nodeEl = this._renderNode($$, node);
              } else {
                
                
                
                nodeEl = $$('div');
              }
              this.insertAt(diff.getOffset(), nodeEl);
            } else if (diff.type === 'delete') {
              this.removeAt(diff.getOffset());
            }
          } else {
            this.empty();
            this.rerender();
          }
        }
      }
    }

    get _isContainerEditor () { return true }
  }

  class DefaultLabelProvider {
    constructor (labels, lang) {
      this.lang = lang || 'en';
      this.labels = labels;
    }

    getLabel (name, params) {
      let labels = this.labels[this.lang];
      if (!labels) return name
      let rawLabel = labels[name] || name;
      
      if (params) {
        return this._evalTemplate(rawLabel, params)
      } else {
        return rawLabel
      }
    }

    setLanguage (lang) {
      this.lang = lang || 'en';
    }

    _evalTemplate (label, params) {
      let vars = this._extractVariables(label);
      vars.forEach((varName) => {
        let searchExp = new RegExp(`\\\${${varName}}`, 'g');
        let replaceStr = params[varName];
        label = label.replace(searchExp, replaceStr);
      });
      return label
    }

    _extractVariables (rawLabel) {
      let qualityRegex = /\${(\w+)}/g;
      let matches;
      let vars = [];
      while (matches = qualityRegex.exec(rawLabel)) { 
        vars.push(matches[1]);
      }
      return vars
    }
  }

  class FontAwesomeIcon extends Component {
    render ($$) {
      if (this.props.stack) {
        return $$('span').addClass('fa-stack')
          .append(this.props.stack.map(faClass => {
            return $$('i').addClass('fa ' + faClass + ' fa-stack')
          }))
      } else {
        return $$('i').addClass('fa ' + this.props.icon)
      }
    }
  }

  class SwitchTextTypeCommand extends Command {
    constructor (config) {
      super(config);
      if (!config.spec) {
        throw new Error("'config.spec' is mandatory")
      }
      if (!config.spec.type) {
        throw new Error("'config.spec.type' is mandatory")
      }
    }

    getType () {
      return this.config.spec.type
    }

    getCommandState (params) {
      const editorSession = params.editorSession;
      const doc = editorSession.getDocument();
      const sel = params.selection;
      const isBlurred = editorSession.isBlurred();
      let commandState = {
        disabled: false
      };
      if (sel.isPropertySelection() && !isBlurred) {
        let path = sel.getPath();
        let node = doc.get(path[0]);
        if (node && node.isText()) {
          commandState.active = isMatch(node, this.config.spec);
        } else {
          commandState.disabled = true;
        }
      } else {
        
        commandState.disabled = true;
      }
      return commandState
    }

    
    execute (params) {
      const editorSession = params.editorSession;
      editorSession.transaction((tx) => {
        return tx.switchTextType(this.config.spec)
      });
    }

    isSwitchTypeCommand () {
      return true
    }
  }

  class Configurator {
    constructor (parent, name) {
      this.parent = parent;
      this.name = name;

      this._subConfigurations = new Map();
      this._values = new Map();
      this._commands = new Map();
      this._commandGroups = new Map();
      this._components = new Map();
      this._converters = new Map();
      this._documentLoaders = new Map();
      this._documentSerializers = new Map();
      this._dropHandlers = [];
      this._exporters = new Map();
      this._icons = new Map();
      this._importers = new Map();
      this._keyboardShortcuts = [];
      this._keyboardShortcutsByCommandName = new Map();
      this._labels = new Map();
      this._nodes = new Map();
      this._toolPanels = new Map();
      this._services = new Map();

      
      this._valuesRegistry = new HierarchicalRegistry(this, '_values');
      this._commandRegistry = new HierarchicalRegistry(this, '_commands');
      this._componentRegistry = new HierarchicalRegistry(this, '_components');
      this._iconRegistry = new HierarchicalRegistry(this, '_icons');
      this._labelRegistry = new HierarchicalRegistry(this, '_labels');
      this._serviceRegistry = new HierarchicalRegistry(this, '_services');
      this._toolPanelRegistry = new HierarchicalRegistry(this, '_toolPanels');
      this._keyboardShortcutsByCommandNameRegistry = new HierarchicalRegistry(this, '_keyboardShortcutsByCommandName');
      this._commandGroupRegistry = new HierarchicalRegistry(this, '_commandGroups');

      
      this._compiledToolPanels = new Map();
    }

    import (pkg, options) {
      pkg.configure(this, options || {});
      return this
    }

    createSubConfiguration (name, options = {}) {
      let ConfiguratorClass = options.ConfiguratorClass || this.constructor;
      let subConfig = new ConfiguratorClass(this, name);
      this._subConfigurations.set(name, subConfig);
      return subConfig
    }

    getConfiguration (path) {
      
      if (isString(path)) {
        path = path.split('.');
      }
      let subConfig = this._subConfigurations.get(path[0]);
      if (path.length === 1) {
        return subConfig
      } else {
        if (subConfig) {
          return subConfig.getConfiguration(path.slice(1))
        }
      }
    }

    getValue (key) {
      return this._valuesRegistry.get(key)
    }

    setValue (key, value) {
      this._values.set(key, value);
    }

    addCommand (name, CommandClass, options = {}) {
      if (this._commands.has(name) && !options.force) throw new Error(`Command with name '${name}' already registered`)
      this._commands.set(name, new CommandClass(Object.assign({ name }, options)));
      if (options.commandGroup) {
        this._addCommandToCommandGroup(name, options.commandGroup);
      }
      if (options.accelerator) {
        this.addKeyboardShortcut(options.accelerator, { command: name });
      }
    }

    addComponent (name, ComponentClass, options = {}) {
      if (this._components.has(name) && !options.force) throw new Error(`Component with name '${name}' already registered`)
      this._components.set(name, ComponentClass);
    }

    addConverter (format, converter) {
      let converters = this._converters.get(format);
      if (!converters) {
        converters = new Map();
        this._converters.set(format, converters);
      }
      if (isFunction(converter)) {
        let ConverterClass = converter;
        converter = new ConverterClass();
      }
      if (!converter.type) {
        throw new Error('A converter needs an associated type.')
      }
      converters.set(converter.type, converter);
    }

    addDropHandler (dropHandler) {
      this._dropHandlers.push(dropHandler);
    }

    addExporter (format, ExporterClass, spec = {}) {
      if (this._exporters.has(format)) throw new Error(`Exporter already registered for '${format}'`)
      this._exporters.set(format, {
        ExporterClass,
        spec
      });
    }

    addIcon (iconName, options) {
      if (!this._icons.has(iconName)) {
        this._icons.set(iconName, {});
      }
      let iconConfig = this._icons.get(iconName);
      Object.assign(iconConfig, options);
    }

    addImporter (format, ImporterClass, spec = {}) {
      if (this._importers.has(format)) throw new Error(`Importer already registered for '${format}'`)
      this._importers.set(format, {
        ImporterClass,
        spec
      });
    }

    addLabel (labelName, label, options = {}) {
      if (this._labels.has(labelName) && !options.force) throw new Error(`Label with name '${labelName}' already registered.`)
      let labels;
      if (isString(label)) {
        labels = { en: label };
      } else {
        labels = label;
      }
      this._labels.set(labelName, labels);
    }

    addNode (NodeClass, options = {}) {
      let type = NodeClass.type;
      if (this._nodes.has(type) && !options.force) {
        throw new Error(`Node class for type '${type}' already registered`)
      }
      this._nodes.set(type, NodeClass);
    }

    addKeyboardShortcut (combo, spec) {
      let label = combo.toUpperCase();
      if (platform.isMac) {
        label = label.replace(/CommandOrControl/i, '⌘');
        label = label.replace(/Ctrl/i, '^');
        label = label.replace(/Shift/i, '⇧');
        label = label.replace(/Enter/i, '↵');
        label = label.replace(/Alt/i, '⌥');
        label = label.replace(/\+/g, '');
      } else {
        label = label.replace(/CommandOrControl/i, 'Ctrl');
      }
      let entry = {
        key: combo,
        label,
        spec
      };
      this._keyboardShortcuts.push(entry);
      if (spec.command) {
        this._keyboardShortcutsByCommandName.set(spec.command, entry);
      }
    }

    
    addTextTypeTool (spec) {
      this.addCommand(spec.name, SwitchTextTypeCommand, {
        spec: spec.nodeSpec,
        commandGroup: 'text-types'
      });
      this.addIcon(spec.name, { 'fontawesome': spec.icon });
      this.addLabel(spec.name, spec.label);
      if (spec.accelerator) {
        this.addKeyboardShortcut(spec.accelerator, { command: spec.name });
      }
    }

    addToolPanel (name, spec, options = {}) {
      if (this._toolPanels.has(name) && !options.force) {
        throw new Error(`ToolPanel '${name}' is already defined`)
      }
      this._toolPanels.set(name, spec);
    }

    
    
    extendToolPanel (name, extensionCb) {
      extensionCb(this._toolPanels.get(name));
    }

    addService (serviceId, factory, options = {}) {
      if (this._services.has(serviceId) && !options.force) {
        throw new Error(`Service '${serviceId}' is already defined`)
      }
      this._services.set(serviceId, {
        factory,
        instance: null
      });
    }

    getService (serviceId, context) {
      let entry = this._serviceRegistry.get(serviceId);
      if (entry) {
        if (entry.instance) {
          return Promise.resolve(entry.instance)
        } else {
          let res = entry.factory(context);
          if (res instanceof Promise) {
            return res.then(service => {
              entry.instance = service;
              return service
            })
          } else {
            entry.instance = res;
            return Promise.resolve(res)
          }
        }
      } else {
        return Promise.reject(new Error(`Unknown service: ${serviceId}`))
      }
    }

    registerDocumentLoader (docType, LoaderClass, spec = {}, options = {}) {
      if (this._documentLoaders.has(docType) && !options.force) {
        throw new Error(`Loader for docType '${docType}' is already defined`)
      }
      this._documentLoaders.set(docType, {
        LoaderClass,
        spec
      });
    }

    registerDocumentSerializer (docType, SerializerClass, spec = {}, options = {}) {
      if (this._documentSerializers.has(docType) && !options.force) {
        throw new Error(`Serializer for docType '${docType}' is already defined`)
      }
      this._documentSerializers.set(docType, {
        SerializerClass,
        spec
      });
    }

    getCommands (options = {}) {
      if (options.inherit) {
        return this._commandRegistry.getAll()
      } else {
        return this._commands
      }
    }

    getCommandGroup (name) {
      
      
      let records = this._commandGroupRegistry.getRecords(name);
      let flattened = flatten$1(records);
      let set = new Set(flattened);
      return Array.from(set)
    }

    getComponent (name) {
      return this.getComponentRegistry().get(name, 'strict')
    }

    getComponentRegistry () {
      return this._componentRegistry
    }

    getConverters (type) {
      if (this._converters.has(type)) {
        return Array.from(this._converters.get(type).values())
      } else {
        return []
      }
    }

    getDocumentLoader (type) {
      if (this._documentLoaders.has(type)) {
        let { LoaderClass, spec } = this._documentLoaders.get(type);
        return new LoaderClass(spec)
      }
    }

    getDocumentSerializer (type) {
      if (this._documentSerializers.has(type)) {
        let { SerializerClass, spec } = this._documentSerializers.get(type);
        return new SerializerClass(spec)
      }
    }

    getIconProvider () {
      return new IconProvider(this)
    }

    
    
    getLabelProvider () {
      return new LabelProvider(this)
    }

    createImporter (type, doc, options = {}) {
      if (this._importers.has(type)) {
        let { ImporterClass, spec } = this._importers.get(type);
        let converters = [];
        if (spec.converterGroups) {
          for (let key of spec.converterGroups) {
            converters = converters.concat(this.getConverters(key));
          }
        } else {
          converters = this.getConverters(type);
        }
        return new ImporterClass({ converters }, doc, options, this)
      } else if (this.parent) {
        return this.parent.createImporter(type, doc, options)
      }
    }

    createExporter (type, doc, options = {}) {
      if (this._exporters.has(type)) {
        let { ExporterClass, spec } = this._exporters.get(type);
        let converters = [];
        if (spec.converterGroups) {
          for (let key of spec.converterGroups) {
            converters = converters.concat(this.getConverters(key));
          }
        } else {
          converters = this.getConverters(type);
        }
        return new ExporterClass({ converters }, doc, options, this)
      } else if (this.parent) {
        return this.parent.createExporter(type, doc, options)
      }
    }

    getKeyboardShortcuts (options = {}) {
      if (options.inherit) {
        return Array.from(this._keyboardShortcutsByCommandNameRegistry.getAll().values())
      } else {
        return this._keyboardShortcuts
      }
    }

    
    getKeyboardShortcutsByCommandName (commandName) {
      return this._keyboardShortcutsByCommandNameRegistry.get(commandName)
    }

    getNodes () {
      return this._nodes
    }

    getToolPanel (name, strict) {
      let toolPanelSpec = this._toolPanelRegistry.get(name);
      if (toolPanelSpec) {
        
        if (this._compiledToolPanels.has(name)) return this._compiledToolPanels.get(name)
        let toolPanel = toolPanelSpec.map(itemSpec => this._compileToolPanelItem(itemSpec));
        this._compiledToolPanels.set(name, toolPanel);
        return toolPanel
      } else if (strict) {
        throw new Error(`No toolpanel configured with name ${name}`)
      }
    }

    _addCommandToCommandGroup (commandName, commandGroupName) {
      if (!this._commandGroups.has(commandGroupName)) {
        this._commandGroups.set(commandGroupName, []);
      }
      let commands = this._commandGroups.get(commandGroupName);
      commands.push(commandName);
    }

    _compileToolPanelItem (itemSpec) {
      let item = Object.assign({}, itemSpec);
      let type = itemSpec.type;
      switch (type) {
        case 'command': {
          if (!itemSpec.name) throw new Error("'name' is required for type 'command'")
          break
        }
        case 'command-group':
          return this.getCommandGroup(itemSpec.name).map(commandName => {
            return {
              type: 'command',
              name: commandName
            }
          })
        case 'prompt':
        case 'group':
        case 'dropdown':
          item.items = flatten$1(itemSpec.items.map(itemSpec => this._compileToolPanelItem(itemSpec)));
          break
        case 'custom':
        case 'separator':
        case 'spacer':
          break
        default:
          throw new Error('Unsupported tool panel item type: ' + type)
      }
      return item
    }
  }

  class HierarchicalRegistry {
    constructor (config, key) {
      this._config = config;
      this._key = key;
    }

    get (name, strict) {
      let config = this._config;
      const key = this._key;
      while (config) {
        let registry = config[key];
        if (registry.has(name)) {
          return registry.get(name)
        } else {
          config = config.parent;
        }
      }
      if (strict) throw new Error(`No value registered for name '${name}'`)
    }

    getAll () {
      let config = this._config;
      let registries = [];
      const key = this._key;
      while (config) {
        let registry = config[key];
        if (registry) {
          registries.unshift(registry);
        }
        config = config.parent;
      }
      return new Map([].concat(...registries.map(r => Array.from(r.entries()))))
    }

    getRecords (name) {
      let config = this._config;
      let records = [];
      const key = this._key;
      while (config) {
        let registry = config[key];
        if (registry) {
          let record = registry.get(name);
          if (record) {
            records.unshift(record);
          }
        }
        config = config.parent;
      }
      return records
    }
  }

  class LabelProvider extends DefaultLabelProvider {
    constructor (config) {
      super();
      this.config = config;
    }

    getLabel (name, params) {
      const lang = this.lang;
      let spec = this.config._labelRegistry.get(name);
      if (!spec) return name
      let rawLabel = spec[lang] || name;
      
      if (params) {
        return this._evalTemplate(rawLabel, params)
      } else {
        return rawLabel
      }
    }
  }

  class IconProvider {
    constructor (config) {
      this.config = config;
    }

    renderIcon ($$, name) {
      let spec = this._getIconDef(name);
      if (!spec) {
        throw new Error(`No icon found for name '${name}'`)
      } else {
        if (spec['fontawesome']) {
          return $$(FontAwesomeIcon, { icon: spec['fontawesome'] })
        } else {
          throw new Error('Unsupported icon spec')
        }
      }
    }

    _getIconDef (name) {
      return this.config._iconRegistry.get(name)
    }
  }

  function createComponentContext (config) {
    return {
      componentRegistry: config.getComponentRegistry(),
      labelProvider: config.getLabelProvider(),
      iconProvider: config.getIconProvider()
    }
  }

  function createEditorContext (config, editorSession) {
    return Object.assign(createComponentContext(config), {
      config,
      editorSession: editorSession,
      editorState: editorSession.getEditorState(),
      surfaceManager: editorSession.surfaceManager,
      markersManager: editorSession.markersManager,
      globalEventHandler: editorSession.globalEventHandler,
      keyboardManager: editorSession.keyboardManager,
      findAndReplaceManager: editorSession.findAndReplaceManager
    })
  }

  class CustomSurface extends Component {
    constructor (...args) {
      super(...args);

      this._name = this._getCustomResourceId();
      this._surfaceId = this._createSurfaceId();
    }

    getChildContext () {
      return {
        surface: this,
        parentSurfaceId: this.getId()
      }
    }

    didMount () {
      const surfaceManager = this._getSurfaceManager();
      surfaceManager.registerSurface(this);
    }

    dispose () {
      const surfaceManager = this._getSurfaceManager();
      surfaceManager.unregisterSurface(this);
    }

    rerenderDOMSelection () {
      
    }

    get name () {
      return this._name
    }

    getId () {
      return this._surfaceId
    }

    getSurfaceId () {
      return this.getId()
    }

    getContainer () {
      return undefined
    }

    getContainerId () {
      return undefined
    }

    isContainerEditor () {
      return false
    }

    isCustomEditor () {
      return true
    }

    isDisabled () {
      return Boolean(this.props.disabled)
    }

    selectFirst () {
      
    }

    _focus () {
      
    }

    _blur () {
      
    }

    _createSurfaceId () {
      let isolatedNodeComponent = this.context.isolatedNodeComponent;
      if (isolatedNodeComponent) {
        let parentSurface = isolatedNodeComponent.context.surface;
        return parentSurface.id + '/' + isolatedNodeComponent.props.node.id + '/' + this._name
      } else {
        return this._name
      }
    }

    _getCustomResourceId () {
      throw new Error('This method needs to be implemented by a CustomSurface')
    }

    _getSurfaceManager () {
      return this.context.surfaceManager
    }
  }

  class DragAndDropHandler {
    match(dragState, context) { 
      return false
    }

    drop(dragState, context) { 
      
    }

    get _isDragAndDropHandler () {
      return true
    }
  }

  class GlobalEventHandler extends AbstractGlobalEventHandler {
    constructor (editorState) {
      super();

      this.editorState = editorState;
    }

    getSelection () {
      return this.editorState.selection
    }
  }

  const DEBUG$2 = false;

  class SurfaceManager {
    constructor (editorState) {
      this.editorState = editorState;
      this.surfaces = new Map();

      editorState.addObserver(['selection', 'document'], this._onSelectionOrDocumentChange, this, { stage: 'pre-position' });
      editorState.addObserver(['selection', 'document'], this._scrollSelectionIntoView, this, { stage: 'finalize' });
    }

    dispose () {
      this.editorState.off(this);
    }

    getSurface (name) {
      if (name) {
        return this.surfaces.get(name)
      }
    }

    getFocusedSurface () {
      console.error("DEPRECATED: use 'context.editorState.focusedSurface instead");
      return this.editorState.focusedSurface
    }

    registerSurface (surface) {
      const id = surface.getId();
      if (DEBUG$2) console.log(`Registering surface ${id}.`, surface.__id__);
      if (this.surfaces.has(id)) {
        throw new Error(`A surface with id ${id} has already been registered.`)
      }
      this.surfaces.set(id, surface);
    }

    unregisterSurface (surface) {
      let id = surface.getId();
      if (DEBUG$2) console.log(`Unregistering surface ${id}.`, surface.__id__);
      let registeredSurface = this.surfaces.get(id);
      if (registeredSurface === surface) {
        this.surfaces.delete(id);
      }
    }

    
    _getSurfaceForProperty (path) {
      
      let canonicalId = getKeyForPath(path);
      if (this.surfaces.has(canonicalId)) {
        return this.surfaces.get(canonicalId)
      }
      for (let surface of this.surfaces.values()) {
        let surfacePath = null;
        if (surface._isContainerEditor) {
          surfacePath = surface.getContainerPath();
        } else if (surface.getPath) {
          surfacePath = surface.getPath();
        }
        if (surfacePath && isArrayEqual(path, surfacePath)) {
          return surface
        }
      }
    }

    _onSelectionOrDocumentChange () {
      

      
      if (this.editorState.isDirty('selection')) {
        const selection = this.editorState.selection;
        if (!selection || selection.isNull()) {
          
          
          
          let focusedSurface = this.editorState.focusedSurface;
          if (focusedSurface && focusedSurface._blur) {
            focusedSurface._blur();
          }
        }
        
        this._reduceFocusedSurface(selection);
        
        
        
        if (selection && selection.isCustomSelection() && platform.inBrowser) {
          window.getSelection().removeAllRanges();
          window.document.activeElement.blur();
        }
      }

      
      this._recoverDOMSelection();
    }

    _reduceFocusedSurface (sel) {
      const editorState = this.editorState;
      let surface = null;
      if (sel && sel.surfaceId) {
        surface = this.surfaces.get(sel.surfaceId);
      }
      editorState.focusedSurface = surface;
    }

    
    _recoverDOMSelection () {
      
      const editorState = this.editorState;
      
      
      
      if (editorState.isBlurred) return
      let focusedSurface = editorState.focusedSurface;
      
      if (focusedSurface && !focusedSurface.isDisabled()) {
        
        focusedSurface._focus();
        focusedSurface.rerenderDOMSelection();
      }
    }

    _scrollSelectionIntoView () {
      const editorState = this.editorState;
      let focusedSurface = editorState.focusedSurface;
      if (focusedSurface && !focusedSurface.isDisabled()) {
        focusedSurface.send('scrollSelectionIntoView');
      }
    }
  }

  class MarkersManager extends EventEmitter {
    constructor (editorState) {
      super();

      this._editorState = editorState;
      this._markers = new MarkersIndex();

      editorState.addObserver(['document'], this._onDocumentChange, this, { stage: 'update' });
    }

    dispose () {
      this._editorState.removeObserver(this);
    }

    addMarker (marker) {
      let path = marker.getPath();
      this._markers.add(path, marker);
      this._setDirty(path);
    }

    removeMarker (marker) {
      let path = marker.getPath();
      this._markers.remove(path, marker);
      this._setDirty(path);
    }

    clearMarkers (path, filter$$1) {
      this._markers.clearMarkers(path, filter$$1);
      this._setDirty(path);
    }

    getMarkers (path) {
      return this._markers.get(path)
    }

    _getDocumentObserver () {
      return this._editorState._getDocumentObserver()
    }

    _setDirty (path) {
      this._editorState._setDirty('document');
      this._getDocumentObserver().setDirty(path);
    }

    
    _onDocumentChange (change) {
      for (let op of change.ops) {
        if (op.type === 'update' && op.diff._isTextOperation) {
          let markers = this._markers.get(op.path);
          if (!markers || markers.length === 0) continue
          let diff$$1 = op.diff;
          switch (diff$$1.type) {
            case 'insert':
              markers.forEach(m => this._transformInsert(m, diff$$1));
              break
            case 'delete':
              markers.forEach(m => this._transformDelete(m, diff$$1));
              break
            default:
            
          }
        }
      }
    }

    _transformInsert (marker, op) {
      const pos = op.pos;
      const length = op.str.length;
      if (length === 0) return
      
      let start = marker.start.offset;
      let end = marker.end.offset;
      let newStart = start;
      let newEnd = end;
      if (pos >= end) return
      if (pos <= start) {
        newStart += length;
        newEnd += length;
        marker.start.offset = newStart;
        marker.end.offset = newEnd;
        return
      }
      if (pos < end) {
        newEnd += length;
        marker.end.offset = newEnd;
        
        
        
        this._remove(marker);
      }
    }

    _transformDelete (marker, op) {
      const pos1 = op.pos;
      const length = op.str.length;
      const pos2 = pos1 + length;
      if (pos1 === pos2) return
      var start = marker.start.offset;
      var end = marker.end.offset;
      var newStart = start;
      var newEnd = end;
      if (pos2 <= start) {
        newStart -= length;
        newEnd -= length;
        marker.start.offset = newStart;
        marker.end.offset = newEnd;
      } else if (pos1 >= end) ; else {
        if (pos1 <= start) {
          newStart = start - Math.min(pos2 - pos1, start - pos1);
        }
        if (pos1 <= end) {
          newEnd = end - Math.min(pos2 - pos1, end - pos1);
        }
        
        if (start !== end && newStart === newEnd) {
          this._remove(marker);
          return
        }
        if (start !== newStart) {
          marker.start.offset = newStart;
        }
        if (end !== newEnd) {
          marker.end.offset = newEnd;
        }
        this._remove(marker);
      }
    }

    _remove (marker) {
      this.removeMarker(marker);
    }
  }


  class MarkersIndex {
    add (path, val) {
      let key = getKeyForPath(path);
      if (!this[key]) {
        this[key] = [];
      }
      this[key].push(val);
    }
    remove (path, val) {
      let key = getKeyForPath(path);
      if (this[key]) {
        deleteFromArray(this[key], val);
      }
    }
    get (path) {
      let key = getKeyForPath(path);
      return this[key] || []
    }
    clearMarkers (path, filter$$1) {
      let key = getKeyForPath(path);
      let arr = this[key];
      if (arr) {
        for (let i = arr.length - 1; i >= 0; i--) {
          if (filter$$1(arr[i])) {
            arr.splice(i, 1);
          }
        }
      }
    }
  }

  class KeyboardManager extends AbstractKeyboardManager {
    constructor (bindings, commandCallback, contextProvider) {
      super();

      this.contextProvider = contextProvider;
      this.bindings = {};

      bindings.forEach(({ key, spec }) => {
        if (!spec.command) throw new Error("'spec.command' is required")
        let hook = () => {
          return commandCallback(spec.command)
        };
        const type = spec.type || 'keydown';
        if (type !== 'textinput') {
          key = parseKeyEvent(parseKeyCombo(key));
        }
        
        if (!this.bindings[type]) { this.bindings[type] = {}; }
        if (!this.bindings[type][key]) { this.bindings[type][key] = []; }
        this.bindings[type][key].push(hook);
      });
    }

    _getBindings (type, key) {
      let bindingsByType = this.bindings[type];
      if (bindingsByType) {
        return bindingsByType[key]
      }
    }

    _getContext () {
      return this.contextProvider.context
    }
  }

  const UPDATE_DELAY = 200;

  class FindAndReplaceManager {
    constructor (editorSession) {
      this._editorSession = editorSession;
      this._doc = editorSession.getDocument();
      this._dirty = new Set();

      
      
      this._updateSearchDebounced = debounce(this._updateSearch.bind(this, true), UPDATE_DELAY);

      let editorState = this._editorSession.getEditorState();
      
      
      editorState.addObserver(['document'], this._onUpdate, this, { stage: 'update' });
      
      
      editorState.addObserver(['document'], this._onRender, this, { stage: 'render' });
    }

    dispose () {
      this._editorSession.getEditorState().removeObserver(this);
    }

    openDialog (enableReplace) {
      enableReplace = Boolean(enableReplace);
      let state = this._getState();
      if (state.enabled) {
        
        if (state.showReplace !== enableReplace) {
          state.showReplace = Boolean(enableReplace);
          this._updateState(state);
        }
      } else {
        state.enabled = true;
        state.showReplace = Boolean(enableReplace);
        
        this._dirty = new Set();
        this._performSearch();
      }
      this._propgateUpdates();
    }

    closeDialog () {
      let state = this._getState();
      if (!state.enabled) return
      state.enabled = false;
      this._clearHighlights();
      
      this._updateState(state, 'recoverSelection');
      this._propgateUpdates();
    }

    next () {
      this._next();
      this._propgateUpdates();
    }

    previous () {
      let state = this._getState();
      this._nav('back');
      this._updateState(state);
      this._propgateUpdates();
    }

    setSearchPattern (pattern) {
      let state = this._getState();
      if (state.pattern !== pattern) {
        state.pattern = pattern;
        this._performSearch();
        this._propgateUpdates();
      }
    }

    setReplacePattern (replacePattern) {
      let state = this._getState();
      if (state.replacePattern !== replacePattern) {
        state.replacePattern = replacePattern;
        this._updateState(state);
        this._propgateUpdates();
      }
    }

    replaceNext () {
      let state = this._getState();
      
      
      if (state._forceNav) {
        state._forceNav = false;
        this._next();
        return
      }
      if (state.replacePattern) {
        let hasReplaced = false;
        if (state.cursor >= 0) {
          let m = this._getMatchAt(state.cursor);
          if (m) {
            this._editorSession.transaction(tx => {
              this._replace(tx, m, state);
            }, { action: 'replace' });
            
            
            
            
            this._updateSearchForProperty(getKeyForPath(m.path));
            this._editorSession.getEditorState().propagateUpdates();
            
            state.cursor--;
            this._nav('forward');
            this._updateState(state);
            hasReplaced = true;
          }
        }
        if (!hasReplaced) {
          
          this._next();
        }
        this._propgateUpdates();
      }
    }

    replaceAll () {
      let state = this._getState();
      if (!state.matches) return
      let allMatches = [];
      state.matches.forEach(_matches => {
        allMatches = allMatches.concat(_matches);
      });
      this._editorSession.transaction(tx => {
        for (let idx = allMatches.length - 1; idx >= 0; idx--) {
          this._replace(tx, allMatches[idx], state);
        }
      }, { action: 'replace-all' });
      state.matches = new Map();
      state.count = 0;
      state.cursor = -1;
      this._updateState(state);
      this._propgateUpdates();
    }

    toggleCaseSensitivity () {
      this._toggleOption('caseSensitive');
      this._propgateUpdates();
    }

    toggleRegexSearch () {
      this._toggleOption('regexSearch');
      this._propgateUpdates();
    }

    toggleFullWordSearch () {
      this._toggleOption('fullWord');
      this._propgateUpdates();
    }

    _getMarkersManager () {
      return this._editorSession.markersManager
    }

    _getState () {
      return this._editorSession.getEditorState().get('findAndReplace') || FindAndReplaceManager.defaultState()
    }

    _toggleOption (optionName) {
      let state = this._getState();
      state[optionName] = !state[optionName];
      this._performSearch();
    }

    _performSearch () {
      let state = this._getState();
      if (state.pattern) {
        this._searchAndHighlight();
      } else {
        this._clear();
      }
      state.cursor = -1;
      this._updateState(state);
      
      
      
      if (state.count > 0) {
        this._next();
      }
    }

    _next () {
      let state = this._getState();
      this._nav('forward');
      this._updateState(state);
    }

    _updateState (state, recoverSelection) {
      const editorState = this._editorSession.getEditorState();
      
      if (recoverSelection) {
        editorState._setDirty('selection');
      }
      
      editorState.set('findAndReplace', state);
    }

    _propgateUpdates () {
      const editorState = this._editorSession.getEditorState();
      
      
      
      
      if (!editorState._isUpdating()) {
        editorState.propagateUpdates();
      }
    }

    _searchAndHighlight () {
      
      this._clearHighlights();
      this._search();
      this._addHighlights();
      this._propgateUpdates();
    }

    _search () {
      let state = this._getState();
      let matches = new Map();
      let count = 0;
      let pattern = state.pattern;
      let opts = state;
      if (pattern) {
        let tps = this._getTextProperties();
        for (let tp of tps) {
          
          let _matches = this._searchInProperty(tp, pattern, opts);
          
          count += _matches.length;
          if (_matches.length > 0) {
            matches.set(getKeyForPath(tp.getPath()), _matches);
          }
        }
      }
      state.matches = matches;
      state.count = count;
    }

    _updateSearch (propagate) {
      let state = this._getState();
      if (!state.enabled || !state.pattern || this._dirty.size === 0) return

      for (let key of this._dirty) {
        
        this._updateSearchForProperty(key);
      }
      
      this._updateState(state, 'recoverSelection');
      this._dirty = new Set();
      if (propagate) {
        this._propgateUpdates();
      }
    }

    _updateSearchForProperty (key) {
      let markersManager = this._getMarkersManager();
      let state = this._getState();
      let matches = state.matches;
      let count = state.count;
      let _matches = matches.get(key);
      if (_matches) {
        count -= _matches.length;
      }
      let path = key.split('.');
      markersManager.clearMarkers(path, m => m.type === 'find-marker');
      let tp = this._getTextProperty(key);
      if (tp) {
        _matches = this._searchInProperty(tp, state.pattern, state);
        count += _matches.length;
        matches.set(key, _matches);
        this._addHighlightsForProperty(path, _matches);
      } else {
        matches.delete(key);
      }
      state.count = count;
    }

    _searchInProperty (tp, pattern, opts) {
      let path = tp.getPath();
      return _findInText(tp.getText(), pattern, opts).map(m => {
        
        m.id = uuid();
        m.path = path;
        m.textProperty = tp;
        return m
      })
    }

    
    _replace (tx, m, options) {
      tx.setSelection({
        type: 'property',
        path: m.path,
        startOffset: m.start,
        endOffset: m.end
      });
      let newText;
      
      
      
      if (options.regexSearch) {
        let text = getTextForSelection(tx, tx.selection);
        let findRe = new RegExp(options.pattern);
        newText = text.replace(findRe, options.replacePattern);
      } else {
        newText = options.replacePattern;
      }
      tx.insertText(newText);
    }

    _clear () {
      let state = this._getState();
      this._clearHighlights();
      state.matches = new Map();
      state.count = 0;
    }

    _clearHighlights () {
      const markersManager = this._getMarkersManager();
      const state = this._getState();
      if (state.matches) {
        state.matches.forEach((_, key) => {
          let path = key.split('.');
          markersManager.clearMarkers(path, m => m.type === 'find-marker');
        });
      }
    }

    _addHighlights () {
      const state = this._getState();
      if (state.matches) {
        state.matches.forEach((matches, key) => {
          let path = key.split('.');
          this._addHighlightsForProperty(path, matches);
        });
      }
    }

    
    _addHighlightsForProperty (path, matches) {
      let markersManager = this._getMarkersManager();
      matches.forEach(m => {
        markersManager.addMarker(new Marker(this._doc, {
          type: 'find-marker',
          id: m.id,
          start: {
            path,
            offset: m.start
          },
          end: {
            path,
            offset: m.end
          }
        }));
      });
    }

    _getTextProperties () {
      let rootComponent = this._editorSession.getRootComponent();
      if (rootComponent) {
        
        
        
        return rootComponent.findAll('.sc-text-property')
      } else {
        console.error('FindAndReplaceManager: no root component has been assigned yet.');
      }
    }

    _getTextProperty (id) {
      let rootComponent = this._editorSession.getRootComponent();
      if (rootComponent) {
        
        return rootComponent.find(`.sc-text-property[data-path="${id}"]`)
      } else {
        console.error('FindAndReplaceManager: no root component has been assigned yet.');
      }
    }

    _nav (direction) {
      let state = this._getState();
      let [cursor, match] = this._getNext(direction);
      if (match) {
        state.cursor = cursor;
        this._scrollToMatch(match);
      }
    }

    _getNext (direction) {
      
      
      let state = this._getState();
      let idx;
      if (direction === 'forward') {
        idx = Math.min(state.count - 1, state.cursor + 1);
      } else {
        idx = Math.max(0, state.cursor - 1);
      }
      return [ idx, this._getMatchAt(idx) ]
    }

    _getMatchAt (idx) {
      
      
      let state = this._getState();
      if (state.matches) {
        for (let [, matches] of state.matches) {
          if (idx >= matches.length) {
            idx -= matches.length;
          } else {
            return matches[idx]
          }
        }
      }
    }

    _scrollToMatch (match) {
      let state = this._getState();
      
      
      if (state.marker) state.marker.el.removeClass('sm-active');
      let tp = match.textProperty;
      let marker = tp.find(`.sm-find-marker[data-id="${match.id}"]`);
      
      
      if (marker) {
        marker.el.addClass('sm-active');
        state.marker = marker;
        tp.send('scrollElementIntoView', marker.el);
      }
    }

    _onUpdate (change) {
      
      if (
        change.info.action === 'replace' ||
        change.info.action === 'replace-all' ||
        change.info.action === 'nop'
      ) return
      for (let op of change.ops) {
        if (op.isUpdate() && op.diff._isTextOperation) {
          this._dirty.add(getKeyForPath(op.path));
        }
      }
      let state = this._getState();
      if (!state.enabled) return

      
      
      state._forceNav = true;
      
      if (platform.test) {
        this._updateSearch();
      } else {
        
        this._updateSearchDebounced();
      }
    }

    _onRender (change) {
      
      
      
      
    }

    static defaultState () {
      return {
        enabled: false,
        pattern: '',
        showReplace: false,
        replacePattern: '',
        caseSensitive: false,
        fullWord: false,
        regexSearch: false,
        matches: null,
        count: 0,
        cursor: 0
      }
    }
  }

  function _createRegExForPattern (pattern) {
    return pattern.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&') 
  }

  function _findInText (text, pattern, opts = {}) {
    if (!opts.regexSearch) {
      pattern = _createRegExForPattern(pattern);
    }
    if (opts.fullWord) {
      pattern = '\\b' + pattern + '\\b';
    }
    let matches = [];
    try {
      let matcher = new RegExp(pattern, opts.caseSensitive ? 'g' : 'gi');
      let match;
      while ((match = matcher.exec(text))) {
        matches.push({
          start: match.index,
          end: matcher.lastIndex
        });
      }
    } catch (err) {}
    return matches
  }

  function EditorSessionMixin (AbstractEditorSession) {
    class BaseEditorSession extends AbstractEditorSession {
      
      _setup (config, options = {}) {
        this.config = config;
        const editorState = this.editorState;

        let surfaceManager = new SurfaceManager(editorState);
        let markersManager = new MarkersManager(editorState);
        let keyboardManager = new KeyboardManager(config.getKeyboardShortcuts(options), (commandName, params) => {
          return this.executeCommand(commandName, params)
        }, this);
        let commandManager = new CommandManager(this,
          
          
          ['document', 'selection'],
          config.getCommands(options)
        );
        let findAndReplaceManager = new FindAndReplaceManager(this);
        this.surfaceManager = surfaceManager;
        this.markersManager = markersManager;
        this.keyboardManager = keyboardManager;
        this.commandManager = commandManager;
        this.findAndReplaceManager = findAndReplaceManager;

        
        this.context = null;

        
        
        
        
        
        
        this._rootComponent = null;
      }

      initialize () {
        super.initialize();

        
        this.editorState.addObserver(['selection'], this._resetOverlayId, this, { stage: 'update' });
        this.commandManager.initialize();
      }

      dispose () {
        super.dispose();
        this.editorState.removeObserver(this);
        this.surfaceManager.dispose();
        this.markersManager.dispose();
        this.commandManager.dispose();
        this.findAndReplaceManager.dispose();
      }

      _createEditorState (document, initialState = {}) {
        return Object.assign(super._createEditorState(document, initialState), {
          focusedSurface: null,
          commandStates: {},
          overlayId: null,
          findAndReplace: FindAndReplaceManager.defaultState()
        })
      }

      copy () {
        const sel = this.getSelection();
        const doc = this.getDocument();
        if (sel && !sel.isNull() && !sel.isCollapsed()) {
          return copySelection(doc, sel)
        }
      }

      cut () {
        const sel = this.getSelection();
        if (sel && !sel.isNull() && !sel.isCollapsed()) {
          let snippet = this.copy();
          this.deleteSelection();
          return snippet
        }
      }

      deleteSelection (options) {
        const sel = this.getSelection();
        if (sel && !sel.isNull() && !sel.isCollapsed()) {
          this.transaction(tx => {
            tx.deleteSelection(options);
          }, { action: 'deleteSelection' });
        }
      }

      paste (content, options) {
        this.transaction(tx => {
          tx.paste(content, options);
        }, { action: 'paste' });
        return true
      }

      insertText (text) {
        const sel = this.getSelection();
        if (sel && !sel.isNull()) {
          this.transaction(tx => {
            tx.insertText(text);
          }, { action: 'insertText' });
        }
      }

      executeCommand (commandName, params) {
        return this.commandManager.executeCommand(commandName, params)
      }

      getCommandStates () {
        return this.editorState.commandStates
      }

      getConfig () {
        return this.config
      }

      getContext () {
        return this.context
      }

      setContext (context) {
        this.context = context;
      }

      getFocusedSurface () {
        return this.editorState.focusedSurface
      }

      getSurface (surfaceId) {
        return this.surfaceManager.getSurface(surfaceId)
      }

      getSurfaceForProperty (path) {
        return this.surfaceManager._getSurfaceForProperty(path)
      }

      setRootComponent (rootComponent) {
        this._rootComponent = rootComponent;
      }

      getRootComponent () {
        return this._rootComponent
      }

      _resetOverlayId () {
        const overlayId = this.editorState.overlayId;
        
        
        
        let sel = this.getSelection();
        if (sel && sel.customType === 'value') {
          let valueId = getKeyForPath(sel.data.path);
          if (overlayId !== valueId) {
            this.editorState.set('overlayId', valueId);
          }
        } else {
          this.editorState.set('overlayId', null);
        }
      }
    }
    return BaseEditorSession
  }

  class EditorSession extends EditorSessionMixin(AbstractEditorSession) {
    
    constructor (id, document, config, initialEditorState = {}) {
      super(id, document, initialEditorState);

      this._setup(config);
    }

    _setup (config) {
      super._setup(config);

      this.globalEventHandler = new GlobalEventHandler(this.editorState);
    }

    dispose () {
      super.dispose();

      this.globalEventHandler.dispose();
    }
  }

  const ENABLED = Object.freeze({ disabled: false });

  class FindAndReplaceCommand extends Command {
    getCommandState (params, context) {
      let fnr = context.findAndReplaceManager;
      if (!fnr) return { disabled: true }

      switch (this.config.action) {
        case 'open-find':
        case 'open-replace': {
          return ENABLED
        }
      }
    }

    execute (params, context) {
      let fnr = context.findAndReplaceManager;
      switch (this.config.action) {
        case 'open-find': {
          fnr.openDialog();
          break
        }
        case 'open-replace': {
          fnr.openDialog('replace');
          break
        }
      }
    }
  }

  const UPDATE_DELAY$1 = 300;

  class FindAndReplaceDialog extends Component {
    constructor (...args) {
      super(...args);

      
      if (!platform.test) {
        this._updatePattern = debounce(this._updatePattern.bind(this), UPDATE_DELAY$1);
        this._updateReplacePattern = debounce(this._updateReplacePattern.bind(this), UPDATE_DELAY$1);
      }
    }

    didMount () {
      this.context.editorState.addObserver(['findAndReplace'], this._onUpdate, this, { stage: 'render' });
    }

    dispose () {
      this.context.editorState.removeObserver(this);
    }

    render ($$) {
      let state = this._getState();
      let el = $$('div').addClass('sc-find-and-replace-dialog');
      el.append(
        this._renderHeader($$),
        this._renderFindSection($$),
        this._renderReplaceSection($$)
      );
      if (!state.enabled) {
        el.addClass('sm-hidden');
      }
      el.on('keydown', this._onKeydown);
      return el
    }

    _renderTitle ($$) {
      const state = this._getState();
      let title = state.showReplace ? this.getLabel(`find-replace-title-${this.props.viewName}`) : this.getLabel(`find-title-${this.props.viewName}`);
      let options = [];
      if (state.caseSensitive) options.push('case-sensitive-title');
      if (state.fullWord) options.push('whole-word-title');
      if (state.regexSearch) options.push('regex-title');
      if (options.length > 0) title += ' (' + options.map(o => this.getLabel(o)).join(', ') + ')';
      return $$('div').addClass('se-title').append(title)
    }

    _renderHeader ($$) {
      const state = this._getState();
      const Button = this.getComponent('button');
      return $$('div').addClass('se-header').append(
        this._renderTitle($$),
        $$('div').addClass('se-group sm-options').append(
          $$(Button, {
            tooltip: this.getLabel('find-case-sensitive'),
            active: state.caseSensitive,
            theme: this.props.theme
          }).addClass('sm-case-sensitive').append('Aa')
            .on('click', this._toggleCaseSensitivity),
          $$(Button, {
            tooltip: this.getLabel('find-whole-word'),
            active: state.fullWord,
            theme: this.props.theme
          }).addClass('sm-whole-word').append('Abc|')
            .on('click', this._toggleFullWordSearch),
          $$(Button, {
            tooltip: this.getLabel('find-regex'),
            active: state.regexSearch,
            theme: this.props.theme
          }).addClass('sm-regex-search').append('.*')
            .on('click', this._toggleRegexSearch),
          $$(Button, {
            tooltip: this.getLabel('close'),
            theme: this.props.theme
          }).addClass('sm-close')
            .append(
              this.context.iconProvider.renderIcon($$, 'close')
            )
            .on('click', this._close)
        )
      )
    }

    _renderFindSection ($$) {
      const state = this._getState();
      const Button = this.getComponent('button');
      return $$('div').addClass('se-section').addClass('sm-find').append(
        $$('div').addClass('se-group sm-input').append(
          this._renderPatternInput($$),
          this._renderStatus($$)
        ),
        $$('div').addClass('se-group sm-actions').append(
          $$(Button, {
            tooltip: this.getLabel('find-next'),
            theme: this.props.theme,
            disabled: state.count < 1
          }).addClass('sm-next')
            .append(this.getLabel('next'))
            .on('click', this._findNext),
          $$(Button, {
            tooltip: this.getLabel('find-previous'),
            theme: this.props.theme,
            disabled: state.count < 1
          }).addClass('sm-previous')
            .append(this.getLabel('previous'))
            .on('click', this._findPrevious)
        )
      )
    }

    _renderReplaceSection ($$) {
      let state = this._getState();
      if (state.showReplace) {
        const Button = this.getComponent('button');
        return $$('div').addClass('se-section').addClass('sm-replace').append(
          $$('div').addClass('se-group sm-input').append(
            this._renderReplacePatternInput($$)
          ),
          $$('div').addClass('se-group sm-actions').append(
            $$(Button, {
              tooltip: this.getLabel('replace'),
              theme: this.props.theme,
              disabled: state.count < 1
            }).addClass('sm-replace')
              .append(this.getLabel('replace'))
              .on('click', this._replaceNext),
            $$(Button, {
              tooltip: this.getLabel('replace-all'),
              theme: this.props.theme,
              disabled: state.count < 1
            }).addClass('sm-replace-all')
              .append(this.getLabel('replace-all'))
              .on('click', this._replaceAll)
          )
        )
      }
    }

    _renderPatternInput ($$) {
      let state = this._getState();
      return $$('input').ref('pattern').addClass('sm-find')
        .attr({
          type: 'text',
          placeholder: this.getLabel('find'),
          'tabindex': 500
        })
        .val(state.pattern)
        .on('keydown', this._onPatternKeydown)
        .on('input', this._updatePattern)
        .on('focus', this._onFocus)
    }

    _renderReplacePatternInput ($$) {
      let state = this._getState();
      return $$('input').ref('replacePattern').addClass('sm-replace')
        .attr({
          type: 'text',
          placeholder: this.getLabel('replace'),
          'tabindex': 500
        })
        .val(state.replacePattern)
        .on('keydown', this._onReplacePatternKeydown)
        .on('input', this._updateReplacePattern)
    }

    _renderStatus ($$) {
      let state = this._getState();
      let el = $$('span').addClass('se-status');
      if (state.count > 0) {
        let current = state.cursor === -1 ? '?' : String(state.cursor + 1);
        el.append(`${current} of ${state.count}`);
      } else if (state.pattern) {
        el.append(this.getLabel('no-result'));
      }
      return el
    }

    _grabFocus () {
      let state = this._getState();
      let input = state.showReplace ? this.refs.replacePattern : this.refs.pattern;
      input.el.focus();
    }

    _getState () {
      return this.context.editorSession.getEditorState().get('findAndReplace')
    }

    _getManager () {
      return this.context.findAndReplaceManager
    }

    _close () {
      this._getManager().closeDialog();
    }

    _findNext () {
      this._getManager().next();
    }

    _findPrevious () {
      this._getManager().previous();
    }

    _replaceNext () {
      this._getManager().replaceNext();
    }

    _replaceAll () {
      this._getManager().replaceAll();
    }

    _updatePattern () {
      
      this._getManager().setSearchPattern(this.refs.pattern.val());
    }

    _updateReplacePattern () {
      this._getManager().setReplacePattern(this.refs.replacePattern.val());
    }

    _toggleCaseSensitivity () {
      this._getManager().toggleCaseSensitivity();
    }

    _toggleFullWordSearch () {
      this._getManager().toggleFullWordSearch();
    }

    _toggleRegexSearch () {
      this._getManager().toggleRegexSearch();
    }

    _onUpdate () {
      
      
      let wasHidden = this.el.hasClass('sm-hidden');
      this.rerender();
      let isHidden = this.el.hasClass('sm-hidden');
      if (wasHidden && !isHidden) {
        this._grabFocus();
      }
    }

    _onKeydown (e) {
      if (e.keyCode === keys$1.ESCAPE) {
        e.stopPropagation();
        e.preventDefault();
        this._close();
      }
    }

    _onFocus (e) {
      e.stopPropagation();
      
      this.context.editorState.set('isBlurred', true);
    }

    _onPatternKeydown (e) {
      e.stopPropagation();
      if (e.keyCode === keys$1.ENTER) {
        e.preventDefault();
        this._findNext();
      }
    }

    _onReplacePatternKeydown (e) {
      e.stopPropagation();
      if (e.keyCode === keys$1.ENTER) {
        e.preventDefault();
        this._replaceNext();
      }
    }
  }

  var FindAndReplacePackage = {
    name: 'find-and-replace',
    configure: function (config, userConfig) {
      config.addComponent('find-and-replace-dialog', FindAndReplaceDialog);
      config.addComponent('find-marker', AnnotationComponent);

      config.addCommand('open-find', FindAndReplaceCommand, {
        commandGroup: 'find-and-replace',
        action: 'open-find'
      });
      config.addCommand('open-replace', FindAndReplaceCommand, {
        commandGroup: 'find-and-replace',
        action: 'open-replace'
      });
      config.addKeyboardShortcut('CommandOrControl+F', { command: 'open-find' });
      
      if (platform.isMac) {
        config.addKeyboardShortcut('CommandOrControl+Alt+F', { command: 'open-replace' });
      } else {
        config.addKeyboardShortcut('CommandOrControl+H', { command: 'open-replace' });
      }
      config.addLabel('find-and-replace-title', {
        en: 'Find and replace'
      });
      config.addLabel('find', {
        en: 'Find'
      });
      config.addLabel('find-next', {
        en: 'Next match'
      });
      config.addLabel('find-previous', {
        en: 'Previous match'
      });
      config.addLabel('find-case-sensitive', {
        en: 'Match Case'
      });
      config.addLabel('find-whole-word', {
        en: 'Match Whole Word'
      });
      config.addLabel('find-regex', {
        en: 'Use Regular Expression'
      });
      config.addLabel('replace', {
        en: 'Replace'
      });
      config.addLabel('replace-all', {
        en: 'Replace All'
      });
      config.addLabel('next', {
        en: 'Next'
      });
      config.addLabel('previous', {
        en: 'Previous'
      });
      config.addLabel('find-title-manuscript', {
        en: 'Find in Article'
      });
      config.addLabel('find-title-metadata', {
        en: 'Find in Metadata'
      });
      config.addLabel('no-result', {
        en: 'No results'
      });
      config.addLabel('find-replace-title-manuscript', {
        en: 'Find and replace in article'
      });
      config.addLabel('find-replace-title-metadata', {
        en: 'Find and replace in metadata'
      });
      config.addLabel('case-sensitive-title', {
        en: 'Case Sensitive'
      });
      config.addLabel('whole-word-title', {
        en: 'Whole Word'
      });
      config.addLabel('regex-title', {
        en: 'Regex'
      });
      config.addIcon('close', { 'fontawesome': 'fa-close' });
    }
  }

  class FontAwesomeIconProvider {
    constructor (icons) {
      this.faMap = {};
      this.textMap = {};
      forEach(icons, (config, name) => {
        let faConfig = config['fontawesome'];
        if (faConfig) {
          if (isString(faConfig)) {
            faConfig = { icon: faConfig };
          }
          this.addFAIcon(name, faConfig);
        }
        let text = config['text'];
        if (text) {
          this.addTextIcon(name, text);
        }
      });
    }

    renderIcon ($$, name) {
      let faProps = this.faMap[name];
      let text = this.textMap[name];
      if (faProps) {
        return $$(FontAwesomeIcon, faProps)
      } else if (text) {
        return text
      }
    }

    addFAIcon (name, faClass) {
      this.faMap[name] = faClass;
    }

    addTextIcon (name, text) {
      this.textMap[name] = text;
    }
  }

  class IndentListCommand extends Command {
    getCommandState (params) {
      let editorSession = params.editorSession;
      let doc = editorSession.getDocument();
      let sel = editorSession.getSelection();
      if (sel && sel.isPropertySelection()) {
        let path = sel.path;
        let node = doc.get(path[0]);
        if (node) {
          if (node.isListItem()) {
            return {
              disabled: false
            }
          }
        }
      }
      return { disabled: true }
    }

    execute (params) {
      let commandState = params.commandState;
      const { disabled } = commandState;

      if (disabled) return

      let editorSession = params.editorSession;
      let action = this.config.spec.action;
      switch (action) {
        case 'indent': {
          editorSession.transaction((tx) => {
            tx.indent();
          }, { action: 'indent' });
          break
        }
        case 'dedent': {
          editorSession.transaction((tx) => {
            tx.dedent();
          }, { action: 'dedent' });
          break
        }
        default:
          
      }
    }
  }

  class InsertInlineNodeCommand extends Command {
    
    getCommandState (params, context) {
      let sel = params.selection;
      let newState = {
        disabled: this.isDisabled(params, context),
        active: false,
        showInContext: this.showInContext(sel, params, context)
      };
      return newState
    }

    
    showInContext (sel, context) { 
      return !sel.isCollapsed()
    }

    isDisabled (params, context) { 
      const editorSession = this.getEditorSession(params, context);
      let sel = editorSession.getSelection();
      let selectionState = editorSession.getSelectionState();
      if (!sel.isPropertySelection()) {
        return true
      }
      
      
      if (selectionState.isInlineNodeSelection) {
        return true
      }
      return false
    }

    
    isAnnotationCommand () {
      return true
    }

    
    execute (params, context) {
      let state = params.commandState;
      let editorSession = params.editorSession;
      if (state.disabled) return
      editorSession.transaction((tx) => {
        let nodeData = this.createNodeData(tx, params, context);
        tx.insertInlineNode(nodeData);
      });
    }

    createNodeData (tx, params, context) { 
      throw new Error('This method is abstract')
    }
  }

  class InsertNodeCommand extends Command {
    constructor (config) {
      super(config);

      
      
      
      if (!this.config.nodeType) {
        console.error("'config.nodeType' should be provided for InsertNodeCommand");
      }
    }

    getType () {
      return this.config.nodeType
    }

    getCommandState (params, context) { 
      let sel = params.selection;
      let newState = {
        disabled: true,
        active: false
      };
      if (sel && !sel.isNull() && !sel.isCustomSelection() && sel.containerPath) {
        newState.disabled = false;
      }
      newState.showInContext = this.showInContext(sel, params, context);
      return newState
    }

    showInContext (sel, params, context) { 
      const editorSession = params.editorSession;
      let selectionState = editorSession.getSelectionState();
      return sel.isCollapsed() && selectionState.isFirst && selectionState.isLast
    }

    isInsertCommand () {
      return true
    }

    execute (params, context) {
      var state = params.commandState;
      if (state.disabled) return
      let editorSession = params.editorSession;
      editorSession.transaction((tx) => {
        let nodeData = this.createNodeData(tx, params, context);
        let node = tx.insertBlockNode(nodeData);
        this.setSelection(tx, node);
      });
    }

    createNodeData (tx, params, context) {
      const type = params.type;
      if (!type) throw new Error("'type' is mandatory")
      const editorSession = params.editorSession;
      const doc = editorSession.getDocument();
      const nodeSchema = doc.getSchema().getNodeSchema(type);
      let nodeData = {type};
      for (let property of nodeSchema) {
        nodeData[property.name] = params[property.name];
      }
      return nodeData
    }

    setSelection (tx, node) {
      if (node.isText()) {
        tx.selection = {
          type: 'property',
          path: node.getPath(),
          startOffset: 0
        };
      }
    }
  }

  class IsolatedInlineNodeComponent extends AbstractIsolatedNodeComponent {
    render ($$) {
      const node = this.props.node;
      const ContentClass = this.ContentClass;
      const state = this.state;

      let el = $$('span');
      el.addClass(this.getClassNames())
        .addClass('sc-inline-node')
        .addClass('sm-' + node.type)
        .attr('data-id', node.id)
        .attr('data-inline', '1');

      let disabled = this.isDisabled();

      if (state.mode) {
        el.addClass('sm-' + state.mode);
      } else {
        el.addClass('sm-not-selected');
      }

      if (!ContentClass.noStyle) {
        el.addClass('sm-default-style');
      }

      
      
      
      el.on('keydown', this.onKeydown);

      el.append(
        this.renderContent($$, node)
          .ref('content')
          .addClass('se-content')
      );

      el.on('click', this.onClick);

      if (disabled) {
        el.addClass('sm-disabled')
          .attr('contenteditable', false);
      }

      
      
      
      
      
      
      
      if (node.shouldBeDraggable) {
        el.attr('draggable', true);
      }

      return el
    }

    isDisabled () {
      return !this.state.mode || ['co-selected', 'cursor'].indexOf(this.state.mode) > -1
    }

    getClassNames () {
      return ''
    }

    onClick (event) {
      if (this._shouldConsumeEvent(event)) {
        event.stopPropagation();
        event.preventDefault();
        this.selectNode();
      }
    }

    selectNode () {
      
      const editorSession = this.getEditorSession();
      const node = this.props.node;
      let selData = {
        type: 'property',
        path: node.start.path,
        startOffset: node.start.offset,
        endOffset: node.end.offset
      };
      const surface = this.getParentSurface();
      if (surface) {
        Object.assign(selData, {
          containerPath: surface.getContainerPath(),
          surfaceId: surface.id
        });
      }
      editorSession.setSelection(selData);
    }

    _getContentClass () {
      const node = this.props.node;
      let ComponentClass;
      
      ComponentClass = this.getComponent(node.type, true);
      
      
      if (!ComponentClass) {
        ComponentClass = this.getComponent('unsupported-inline-node', true);
      }
      
      
      
      if (!ComponentClass) {
        console.error(`No component registered for inline node '${node.type}'.`);
        ComponentClass = StubInlineNodeComponent;
      }
      return ComponentClass
    }

    
    
    _deriveStateFromSelectionState (sel, selState) {
      const surface = this._getSurfaceForSelection(sel, selState);
      const parentSurface = this.getParentSurface();
      if (!surface) return null
      
      if (surface === parentSurface) {
        const node = this.props.node;
        if (sel.isPropertySelection() && !sel.isCollapsed() && isEqual(sel.start.path, node.start.path)) {
          const nodeSel = node.getSelection();
          if (nodeSel.equals(sel)) {
            return { mode: 'selected' }
          }
          if (sel.contains(nodeSel)) {
            return { mode: 'co-selected' }
          }
        }
      }
      let isolatedNodeComponent = surface.context.isolatedNodeComponent;
      if (!isolatedNodeComponent) return null
      if (isolatedNodeComponent === this) {
        return { mode: 'focused' }
      }
      let isolatedNodes = this._getIsolatedNodes(sel, selState);
      if (isolatedNodes.indexOf(this) > -1) {
        return { mode: 'co-focused' }
      }
      return null
    }

    get _isInlineNodeComponent () { return true }
  }

  class StubInlineNodeComponent extends Component {
    render ($$) {
      const node = this.props.node;
      return $$('span').text('???').attr('data-id', node.id).attr('data-type', node.type)
    }
  }

  class StageSession extends AbstractEditorSession {
    constructor (id, parentEditorSession, initialEditorState) {
      super(id, parentEditorSession.getDocument().clone(), initialEditorState);

      this.parentEditorSession = parentEditorSession;

      
      
    }

    commitChanges (options = {}) {
      
      let changes = this.getChanges();
      if (changes.length > 0) {
        let ops = flatten$1(changes.map(c => c.ops));
        let oldSel = this.parentEditorSession.getSelection();
        let newSel = options.selection || oldSel;
        let mergedChange = new DocumentChange(ops, { selection: oldSel }, { selection: newSel });
        this.parentEditorSession.applyChange(mergedChange);
      }
    }
  }

  class ModalEditorSession extends EditorSessionMixin(StageSession) {
    constructor (id, parentEditorSession, config, initialEditorState) {
      super(id, parentEditorSession, initialEditorState);

      this._setup(config, { inherit: true });
    }
  }

  class Redo extends Command {
    getCommandState (params) {
      let editorSession = params.editorSession;
      return {
        disabled: !editorSession.canRedo(),
        active: false
      }
    }

    execute (params) {
      let editorSession = params.editorSession;
      if (editorSession.canRedo()) {
        editorSession.redo();
        return true
      } else {
        return false
      }
    }
  }

  class Router extends EventEmitter {
    constructor (...args) {
      super(...args);
      this.__isStarted__ = false;
    }

    
    start () {
      let window = DefaultDOMElement.getBrowserWindow();
      window.on('hashchange', this._onHashChange, this);
      this.__isStarted__ = true;
    }

    
    readRoute () {
      if (!this.__isStarted__) this.start();
      return this.parseRoute(this.getRouteString())
    }

    
    writeRoute (route, opts = {}) {
      let routeString = this.stringifyRoute(route);
      if (!routeString) {
        this.clearRoute(opts);
      } else {
        this._writeRoute(routeString, opts);
      }
    }

    dispose () {
      let window = DefaultDOMElement.getBrowserWindow();
      window.off(this);
    }

    
    parseRoute (routeString) {
      return Router.routeStringToObject(routeString)
    }

    
    stringifyRoute (route) {
      return Router.objectToRouteString(route)
    }

    getRouteString () {
      let window = DefaultDOMElement.getBrowserWindow().getNativeElement();
      return window.location.hash.slice(1)
    }

    _writeRoute (route, opts) {
      let window = DefaultDOMElement.getBrowserWindow().getNativeElement();
      this.__isSaving__ = true;
      try {
        if (opts.replace) {
          window.history.replaceState({}, '', `#${route}`);
        } else {
          window.history.pushState({}, '', `#${route}`);
        }
      } finally {
        this.__isSaving__ = false;
      }
    }

    clearRoute (opts = {}) {
      this._writeRoute('', opts);
    }

    _onHashChange () {
      
      if (this.__isSaving__) {
        return
      }
      if (this.__isLoading__) {
        console.error('FIXME: router is currently applying a route.');
        return
      }
      this.__isLoading__ = true;
      try {
        let routeString = this.getRouteString();
        let route = this.parseRoute(routeString);
        this.emit('route:changed', route);
      } finally {
        this.__isLoading__ = false;
      }
    }

    static objectToRouteString (obj) {
      let frags = [];
      forEach(obj, (val, key) => {
        if (!isNil(val)) {
          frags.push(`${key}=${val}`);
        }
      });
      return frags.join(',')
    }

    static routeStringToObject (routeStr) {
      let obj = {};
      
      if (!routeStr) return obj
      let params = routeStr.split(',');
      for (let param of params) {
        if (param.indexOf('=') >= 0) {
          let tuple = param.split('=');
          if (tuple.length !== 2) {
            throw new Error('Illegal route.')
          }
          obj[tuple[0].trim()] = tuple[1].trim();
        } else {
          obj[param] = true;
        }
      }
      return obj
    }
  }

  class SelectAllCommand extends Command {
    getCommandState (params) {
      let editorSession = params.editorSession;
      let isBlurred = editorSession.isBlurred();
      let sel = editorSession.getSelection();
      let disabled = (
        isBlurred ||
        !sel || sel.isNull()
      );
      return { disabled }
    }

    execute (params, context) {
      let editorSession = context.editorSession;
      let doc = editorSession.getDocument();
      let editorState = editorSession.getEditorState();
      let focusedSurface = editorState.focusedSurface;
      if (focusedSurface) {
        let sel = null;
        let surfaceId = focusedSurface.id;
        if (focusedSurface._isContainerEditor) {
          let containerPath = focusedSurface.getContainerPath();
          let nodeIds = doc.get(containerPath);
          if (nodeIds.length === 0) return false
          let firstNodeId = nodeIds[0];
          let lastNodeId = last(nodeIds);
          sel = {
            type: 'container',
            startPath: [firstNodeId],
            startOffset: 0,
            endPath: [lastNodeId],
            endOffset: 1,
            containerPath,
            surfaceId
          };
        } else if (focusedSurface._isTextPropertyEditor) {
          let path = focusedSurface.getPath();
          let text = doc.get(path);
          sel = {
            type: 'property',
            path: path,
            startOffset: 0,
            endOffset: text.length,
            surfaceId
          };
        }
        if (sel) {
          editorSession.setSelection(sel);
        }
        return true
      }
      return false
    }
  }

  class Undo extends Command {
    getCommandState (params) {
      let editorSession = params.editorSession;
      return {
        disabled: !editorSession.canUndo(),
        active: false
      }
    }

    execute (params) {
      let editorSession = params.editorSession;
      if (editorSession.canUndo()) {
        editorSession.undo();
      }
      return true
    }
  }

  exports.cssSelect = cssSelect;
  exports.DomUtils = domUtils;
  exports.domHelpers = domHelpers;
  exports.BrowserDOMElement = BrowserDOMElement;
  exports.compareDOMElementPosition = compareDOMElementPosition;
  exports.DefaultDOMElement = DefaultDOMElement;
  exports.DOMElement = DOMElement;
  exports.DOMEventListener = DOMEventListener;
  exports.MemoryDOMElement = MemoryDOMElement;
  exports.nameWithoutNS = nameWithoutNS$1;
  exports.prettyPrintXML = prettyPrintXML;
  exports.sanitizeHTML = sanitizeHTML;
  exports.documentHelpers = documentHelpers;
  exports.operationHelpers = operationHelpers;
  exports.selectionHelpers = selectionHelpers;
  exports.annotationHelpers = annotationHelpers;
  exports.AnnotationIndex = AnnotationIndex;
  exports.AnnotationMixin = AnnotationMixin;
  exports.ArrayOperation = ArrayOperation;
  exports.ChangeRecorder = ChangeRecorder;
  exports.Conflict = Conflict;
  exports.Container = Container;
  exports.ContainerAnnotation = ContainerAnnotation;
  exports.ContainerAnnotationIndex = ContainerAnnotationIndex;
  exports.ContainerMixin = ContainerMixin;
  exports.ContainerSelection = ContainerSelection;
  exports.Coordinate = Coordinate;
  exports.CoordinateAdapter = CoordinateAdapter;
  exports.CoordinateOperation = CoordinateOperation;
  exports.copySelection = copySelection;
  exports.createDocumentFactory = createDocumentFactory;
  exports.CustomSelection = CustomSelection;
  exports.Data = Data;
  exports.DefaultFileProxy = DefaultFileProxy;
  exports.Document = Document;
  exports.DocumentChange = DocumentChange;
  exports.DocumentIndex = DocumentIndex;
  exports.DocumentNode = DocumentNode;
  exports.DocumentNodeFactory = DocumentNodeFactory;
  exports.DocumentSchema = DocumentSchema;
  exports.DOMExporter = DOMExporter;
  exports.DOMImporter = DOMImporter;
  exports.Editing = Editing;
  exports.EditingInterface = EditingInterface;
  exports.FileNode = FileNode;
  exports.FileProxy = FileProxy;
  exports.Fragmenter = Fragmenter;
  exports.getChangeFromDocument = getChangeFromDocument;
  exports.HTMLExporter = HTMLExporter;
  exports.HTMLImporter = HTMLImporter;
  exports.importNodeIntoDocument = importNodeIntoDocument;
  exports.IncrementalData = IncrementalData;
  exports.InlineNode = InlineNode;
  exports.JSONConverter = JSONConverter;
  exports.ListMixin = ListMixin;
  exports.Marker = Marker;
  exports.Node = Node;
  exports.NodeIndex = NodeIndex;
  exports.NodeProperty = NodeProperty;
  exports.NodeRegistry = NodeRegistry;
  exports.NodeSelection = NodeSelection;
  exports.ObjectOperation = ObjectOperation;
  exports.OperationSerializer = OperationSerializer;
  exports.ParentNodeHook = ParentNodeHook;
  exports.paste = paste;
  exports.PropertyAnnotation = PropertyAnnotation;
  exports.PropertyIndex = PropertyIndex;
  exports.PropertySelection = PropertySelection;
  exports.Range = Range;
  exports.Schema = Schema;
  exports.Selection = Selection;
  exports.TextNode = TextNode;
  exports.TextNodeMixin = TextNodeMixin;
  exports.TextOperation = TextOperation;
  exports.XMLExporter = XMLExporter;
  exports.XMLImporter = XMLImporter;
  exports.STRING = STRING;
  exports.TEXT = TEXT$1;
  exports.PLAIN_TEXT = PLAIN_TEXT;
  exports.STRING_ARRAY = STRING_ARRAY;
  exports.BOOLEAN = BOOLEAN;
  exports.ENUM = ENUM;
  exports.MANY = MANY;
  exports.ONE = ONE;
  exports.CHILDREN = CHILDREN;
  exports.CHILD = CHILD$1;
  exports.CONTAINER = CONTAINER;
  exports.OPTIONAL = OPTIONAL;
  exports.AbstractAppState = AbstractAppState;
  exports.AbstractEditorSession = AbstractEditorSession;
  exports.AbstractIsolatedNodeComponent = AbstractIsolatedNodeComponent;
  exports.AbstractScrollPane = AbstractScrollPane;
  exports.AbstractGlobalEventHandler = AbstractGlobalEventHandler;
  exports.AbstractKeyboardManager = AbstractKeyboardManager;
  exports.AnnotatedTextComponent = AnnotatedTextComponent;
  exports.AnnotationCommand = AnnotationCommand;
  exports.AnnotationComponent = AnnotationComponent;
  exports.AppState = AppState;
  exports.BasePackage = BasePackage;
  exports.Clipboard = Clipboard;
  exports.Command = Command;
  exports.CommandManager = CommandManager;
  exports.Component = Component;
  exports.ComponentRegistry = ComponentRegistry;
  exports.ContainerEditor = ContainerEditor;
  exports.Configurator = Configurator;
  exports.createComponentContext = createComponentContext;
  exports.createEditorContext = createEditorContext;
  exports.CustomSurface = CustomSurface;
  exports.DefaultLabelProvider = DefaultLabelProvider;
  exports.DocumentObserver = DocumentObserver;
  exports.DOMSelection = DOMSelection;
  exports.DragAndDropHandler = DragAndDropHandler;
  exports.EditorSession = EditorSession;
  exports.EditorState = EditorState;
  exports.FindAndReplaceCommand = FindAndReplaceCommand;
  exports.FindAndReplaceDialog = FindAndReplaceDialog;
  exports.FindAndReplaceManager = FindAndReplaceManager;
  exports.FindAndReplacePackage = FindAndReplacePackage;
  exports.FontAwesomeIcon = FontAwesomeIcon;
  exports.FontAwesomeIconProvider = FontAwesomeIconProvider;
  exports.GlobalEventHandler = GlobalEventHandler;
  exports.HandlerParams = HandlerParams;
  exports.IndentListCommand = IndentListCommand;
  exports.InsertInlineNodeCommand = InsertInlineNodeCommand;
  exports.InsertNodeCommand = InsertNodeCommand;
  exports.IsolatedNodeComponent = IsolatedNodeComponent;
  exports.IsolatedInlineNodeComponent = IsolatedInlineNodeComponent;
  exports.KeyboardManager = KeyboardManager;
  exports.MarkersManager = MarkersManager;
  exports.ModalEditorSession = ModalEditorSession;
  exports.RedoCommand = Redo;
  exports.RenderingEngine = RenderingEngine;
  exports.Router = Router;
  exports.SelectAllCommand = SelectAllCommand;
  exports.SelectionFragmentComponent = SelectionFragmentComponent;
  exports.SelectionStateReducer = SelectionStateReducer;
  exports.SimpleChangeHistory = SimpleChangeHistory;
  exports.StageSession = StageSession;
  exports.Surface = Surface;
  exports.SurfaceManager = SurfaceManager;
  exports.SwitchTextTypeCommand = SwitchTextTypeCommand;
  exports.TextNodeComponent = TextNodeComponent$1;
  exports.TextPropertyComponent = TextPropertyComponent;
  exports.TextPropertyEditor = TextPropertyEditor;
  exports.UndoCommand = Undo;
  exports.VirtualElement = VirtualElement;
  exports.findParentComponent = findParentComponent;
  exports.async = async;
  exports.tableHelpers = tableHelpers;
  exports.ArrayIterator = ArrayIterator;
  exports.ArrayTree = ArrayTree;
  exports.array2table = array2table;
  exports.camelCase = camelCase;
  exports.capitalize = capitalize;
  exports.clone = clone;
  exports.cloneDeep = cloneDeep;
  exports.createCountingIdGenerator = createCountingIdGenerator;
  exports.debounce = debounce;
  exports.deleteFromArray = deleteFromArray;
  exports.deterministicId = deterministicId;
  exports.diff = diff;
  exports.encodeXMLEntities = encodeXMLEntities;
  exports.EventEmitter = EventEmitter;
  exports.extend = extend;
  exports.Factory = Factory;
  exports.filter = filter;
  exports.find = find;
  exports.findIndex = findIndex;
  exports.flatten = flatten$1;
  exports.flattenOften = flattenOften;
  exports.forEach = forEach;
  exports.getKeyForPath = getKeyForPath;
  exports.getRangeFromMatrix = getRangeFromMatrix$1;
  exports.getRelativeBoundingRect = getRelativeBoundingRect;
  exports.getRelativeMouseBounds = getRelativeMouseBounds;
  exports.inBrowser = inBrowser;
  exports.includes = includes;
  exports.isArray = isArray;
  exports.isArrayEqual = isArrayEqual;
  exports.isBoolean = isBoolean;
  exports.isEqual = isEqual;
  exports.isFunction = isFunction;
  exports.isMatch = isMatch;
  exports.isNil = isNil;
  exports.isNumber = isNumber;
  exports.isObject = isObject;
  exports.isPlainObject = isPlainObject$1;
  exports.isString = isString;
  exports.keys = keys$1;
  exports.last = last;
  exports.levenshtein = levenshtein;
  exports.makeMap = array2table;
  exports.map = map$1;
  exports.merge = merge$1;
  exports.parseKeyCombo = parseKeyCombo;
  exports.parseKeyEvent = parseKeyEvent;
  exports.PathObject = PathObject;
  exports.percentage = percentage;
  exports.pick = pick;
  exports.platform = platform;
  exports.pluck = pluck;
  exports.printStacktrace = printStacktrace;
  exports.request = request;
  exports.renderListNode = renderListNode;
  exports.sendRequest = sendRequest;
  exports.startsWith = startsWith;
  exports.SubstanceError = SubstanceError;
  exports.substanceGlobals = substanceGlobals;
  exports.times = times$2;
  exports.toUnixLineEndings = toUnixLineEndings;
  exports.TreeIndex = TreeIndex;
  exports.uniq = uniq;
  exports.uuid = uuid;
  exports.without = without;
  exports.orderBy = orderBy;
  exports.getDOMRangeFromEvent = getDOMRangeFromEvent;
  exports.getRelativeRect = getRelativeRect;
  exports.getSelectionRect = getSelectionRect;
  exports.isMouseInsideDOMSelection = isMouseInsideDOMSelection;
  exports.getQueryStringParam = getQueryStringParam;
  exports.setDOMSelection = setDOMSelection;

  Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=./substance.js.map
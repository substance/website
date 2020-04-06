import { f as forEach } from './Footer-8f9b3fea.js';

// TODO: we need to improve substance.sendRequest

function sendRequest (params, cb) {
  return new Promise(function (resolve, reject) {
    const method = (params.method || 'GET').toUpperCase();
    const url = params.url;
    if (['GET', 'POST', 'PUT', 'DELETE'].indexOf(method) < 0) {
      throw new Error("Parameter 'method' must be 'GET', 'POST', 'PUT', or 'DELETE'.")
    }
    if (!url) {
      throw new Error("Parameter 'url' is required.")
    }
    // default content type for requests
    const header = {};
    if (params.form) {
      header['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (params.json) {
      header['Content-Type'] = 'application/json';
    } else if (params.multiPart) ;
    if (params.header) {
      Object.assign(header, params.header);
    }
    let data = params.data;
    if (params.json) {
      data = JSON.stringify(data);
    }

    const xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      // TODO: we could support more states here to give feedback
      // e.g. about progress of an upload
      if (xmlhttp.readyState === 4) return _done()
    };
    xmlhttp.open(method, url, true);
    if (header) {
      forEach(header, function (val, key) {
        xmlhttp.setRequestHeader(key, val);
      });
    }
    // TODO: this should be changed in substance.sendRequest
    // i.e. just pass the JSON object as data here
    // and let the server parse the body accordingly
    xmlhttp.send(data);

    function _done () {
      if (xmlhttp.status === 200) {
        let response = xmlhttp.responseText;
        if (params.json) {
          response = JSON.parse(response);
        }
        if (cb) cb(null, response);
        resolve(response);
      } else {
        console.error(xmlhttp.statusText);
        const err = new Error(xmlhttp.statusText);
        if (cb) cb(err);
        reject(err);
      }
    }
  })
}

export { sendRequest as s };
//# sourceMappingURL=_sendRequest-aee5ea34.js.map

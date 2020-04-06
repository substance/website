// DB stored document props
const DOCUMENT_TITLE = 'title';
const DOCUMENT_AUTHORS = 'authors';
const DOCUMENT_UPDATED_AT = 'updatedAt';
const DOCUMENT_PUBLISHED_AT = 'publishedAt';
const DOCUMENT_STATE = 'state';
const DOCUMENT_SIZE = 'fileSize';
const DOCUMENT_OWNER = 'owner';
const DOCUMENT_SLUG = 'name';

const DOCUMENT_DB_TO_INTERNAL = {
  title: DOCUMENT_TITLE,
  authors: DOCUMENT_AUTHORS,
  modified: DOCUMENT_UPDATED_AT,
  published: DOCUMENT_PUBLISHED_AT,
  state: DOCUMENT_STATE,
  size: DOCUMENT_SIZE,
  owner: DOCUMENT_OWNER,
  slug: DOCUMENT_SLUG
};

const DOCUMENT_STATE_ICONS = {
  published: 'globe-americas',
  private: 'key'
};

function GetRelativeTime (timestamp) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const current = Date.now();
  const elapsed = current - timestamp;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed / 1000) + ' seconds ago'
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + ' minutes ago'
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + ' hours ago'
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + ' days ago'
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + ' months ago'
  } else {
    return Math.round(elapsed / msPerYear) + ' years ago'
  }
}

function FormatBytes (bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

// A helper to obtain document props for avoiding problems with different names of properties inside DB,
// using constant with map from DB to clientside impl
function GetDocumentProps (document) {
  return Object.keys(DOCUMENT_DB_TO_INTERNAL).reduce((acc, item) => {
    let val;
    // ATTENTION: fileSize is a future feature
    if (item === 'size') {
      val = 1234;
    // TODO: we will not have multi-authors for quite a time
    // and then this will have a different format, i.e. public user records
    // not just plain strings
    } else if (item === 'authors') {
      val = [];
    // TODO: 'private' vs 'public' is not in the db, but needs to be provided as a derived
    // property from the versions
    } else if (item === 'state') {
      val = document.hasPublicVersion ? 'public' : 'private';
    } else {
      val = document[DOCUMENT_DB_TO_INTERNAL[item]];
    }
    acc[item] = val;
    return acc
  }, {})
}

// A helper to build urls different document urls
// e.g. for document editing, previewing
function GetDocumentLink (document, type) {
  const slug = document[DOCUMENT_DB_TO_INTERNAL.slug];
  const owner = document[DOCUMENT_DB_TO_INTERNAL.owner];

  let url = `/${owner}/${slug}`;

  if (type === 'preview') {
    url += '?preview=true';
  }

  return url
}

export { DOCUMENT_STATE_ICONS as D, FormatBytes as F, GetDocumentProps as G, GetDocumentLink as a, GetRelativeTime as b };
//# sourceMappingURL=utils-e939ecca.js.map

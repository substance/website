import { $ as $$, C as Component, T as Title, b as Link, I as Icon, H as HorizontalStack, D as DropdownMenu, d as Divider, a as StackFill, L as Limiter, c as BasePage, F as Footer } from './Footer-8f9b3fea.js';
import { M as MobileHeader } from './MobileHeader-495e59c5.js';
import './LoginStatus-aa15daae.js';
import { B as Background } from './Background-d477736a.js';
import { D as DashboardHeader } from './DashboardHeader-6ecc2335.js';
import { D as DOCUMENT_STATE_ICONS, G as GetDocumentProps, a as GetDocumentLink, b as GetRelativeTime, F as FormatBytes } from './utils-e939ecca.js';

function MultiColumnLayout (props) {
  return $$('div', { className: 'sc-multi-column' }, props.children)
}

function Column (props) {
  const size = props.size;
  const el = $$('div', { className: 'sc-column' }, props.children);
  if (size) el.setStyle('flex', `0 0 ${size}`);
  return el
}

function Card (props) {
  return (
    $$('div', { className: 'sc-card' },
      props.children
    )
  )
}

function Subtitle (props) {
  return (
    $$('div', { className: 'sc-subtitle' },
      props.children
    )
  )
}

function Prose (props) {
  return (
    $$('div', { className: 'sc-prose' },
      props.children
    )
  )
}

class Badge extends Component {
  render () {
    const { image, displayName, name, bio, website } = this.props.user;

    const cardEl = $$(Card).append(
      $$(Title).append(displayName),
      $$(Subtitle).append(name)
    );

    if (bio) {
      cardEl.append(
        $$(Prose).append(bio)
      );
    }

    if (website) {
      cardEl.append(
        $$(Prose).append(
          $$(Link, { href: website, target: '_blank' }).append(website)
        )
      );
    }

    return $$('div').addClass('sc-badge').append(
      $$('div').addClass('se-badge-image').append(
        $$(Link, { href: '/settings ' }).append(
          $$('img', { src: image })
        )
      ),
      cardEl
    )
  }
}

function Meta (props) {
  return (
    $$('div', { className: 'sc-meta' },
      props.children
    )
  )
}

function PublishState (props) {
  const state = props.state;
  return (
    $$('div', { className: 'sc-publish-state sm-' + state },
      $$(Icon, { icon: DOCUMENT_STATE_ICONS[state] }),
      $$('div').addClass('se-state-name').text(state.charAt(0).toUpperCase() + state.slice(1))
    )
  )
}

const DASHBOARD_ITEM_MENU = (document) => ({
  items: [
    { url: GetDocumentLink(document, 'edit'), label: 'Edit', icon: 'pencil-alt' },
    { url: GetDocumentLink(document, 'preview'), newTab: true, label: 'Preview', icon: 'eye' },
    // { action: 'rename', label: 'Rename' },
    { action: 'deleteDocument', label: 'Delete', icon: 'trash' },
    { action: 'downloadDocument', label: 'Download', icon: 'file-download' }
  ]
});

class DashboardItem extends Component {
  render () {
    const { document, isOwner } = this.props;
    const { title, authors, modified, state, size } = GetDocumentProps(document);

    const titleEl = $$(HorizontalStack).append(
      $$(Title).append(
        $$(Link, { href: GetDocumentLink(document, 'edit') }, title)
      )
    );

    // Ellipsis menu and its content is only available for document's owner
    if (isOwner) {
      titleEl.append(
        $$(DropdownMenu, DASHBOARD_ITEM_MENU(document),
          $$(Icon, { icon: 'ellipsis-v' })
        )
      );
    }

    return $$('div').addClass('sc-dashboard-item').append(
      $$(Card).append(
        titleEl,
        $$(Prose).append(authors.join(', ')),
        $$(Divider),
        $$(HorizontalStack, {},
          $$(Meta).text('Edited ' + GetRelativeTime(modified)),
          // Taking too much space, disabled published on for now
          // state === 'published' ? $$(Meta).text('Published on ' + new Date(published).toDateString()) : '',
          $$(Meta).text(FormatBytes(size * 1024)),
          $$(StackFill),
          $$(PublishState, { state })
        )
      )
    )
  }
}

function Dashboard (props) {
  const documents = props.documents || [];
  const user = props.user;
  const isOwner = props.isOwner;
  const el = $$('div').addClass('sc-dashboard');

  el.append(
    $$(Limiter, {},
      $$(MultiColumnLayout).append(
        $$(Column, { size: '225px' }).append(
          $$(Badge, { user })
        ),
        $$(Column).append(
          ...documents.map(document => $$(DashboardItem, { document, isOwner }))
        )
      )
    )
  );
  return el
}

class MobileDashboard extends Component {
  render () {
    const documents = this.props.documents || [];
    const el = $$('div', { class: 'sc-mobile-dashboard sc-dashboard' });
    el.append(
      $$(Limiter, {},
        ...documents.map(document => $$(DashboardItem, { document }))
      )
    );
    return el
  }
}

// NOTE: the UserProfilePage is sent prerendered to the client
// so there is no need to fetch data
class UserProfilePage extends BasePage {
  get title () { return 'Documents' }

  renderBodyContent () {
    const { user, profile, documents } = this.props;
    const { isMobile } = this.state;
    const isOwner = user && user.id === profile.id;
    return [
      isMobile
        ? $$(MobileHeader, { user })
        : $$(DashboardHeader, { user, profile }),
      $$(Background, { style: 'light' },
        isMobile
          ? $$(MobileDashboard, { documents })
          : $$(Dashboard, { documents, user: profile, isOwner })
      ),
      $$(Footer, { isMobile })
    ]
  }
}

export default UserProfilePage;
//# sourceMappingURL=user-profile.page.js.map

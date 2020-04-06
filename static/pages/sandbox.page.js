import { C as Component, $ as $$, I as Icon, B as Button, al as keys, ai as debounce, h as Input, r as platform, e as Form, g as FormRow, d as Divider, P as Modal, c as BasePage, F as Footer } from './Footer-8f9b3fea.js';
import { M as MobileHeader } from './MobileHeader-495e59c5.js';
import { L as LogoOnlyHeader } from './LogoOnlyHeader-e4c4a388.js';
import './LoginStatus-aa15daae.js';
import { W as WebsiteHeader, T as Teaser } from './Teaser-04f0cf42.js';
import { B as Background } from './Background-d477736a.js';
import { C as ContentBody } from './ContentBody-fe80f7b3.js';
import { b as GetRelativeTime } from './utils-e939ecca.js';

class Collaborator extends Component {
  render () {
    const { existingUser, id, name, status } = this.props;
    const icon = existingUser ? 'user' : 'envelope';
    return $$('div', { class: 'sc-collaborator' },
      $$('div', { class: 'se-user-icon' },
        $$(Icon, { icon })
      ),
      $$('div', { class: 'se-name' },
        name
      ),
      $$('div', { class: 'se-status' + (!existingUser ? ' sm-invited' : '') },
        status
      ),
      $$('div', { class: 'se-action' },
        $$(Button, { style: 'plain', size: 'default', action: 'removeCollaborator', args: [id] },
          $$(Icon, { icon: 'trash' })
        )
      )
    )
  }
}

class ListGroup extends Component {
  getInitialState () {
    return {
      selected: 0
    }
  }

  didMount () {
    const globalEventHandler = this.context.globalEventHandler;
    if (globalEventHandler) {
      globalEventHandler.addEventListener('keydown', this._onKeydown, this);
    }
  }

  willReceiveProps () {
    this.setState({ selected: 0 });
  }

  dispose () {
    const globalEventHandler = this.context.globalEventHandler;
    if (globalEventHandler) {
      globalEventHandler.removeEventListener(this);
    }
  }

  render () {
    const { itemClass, items } = this.props;
    const { selected } = this.state;
    return $$('div', { class: 'sc-list-group' },
      ...items.map((item, key) => {
        const listItem = $$(itemClass, item).on('click', this._onItemClick.bind(this, item));
        if (key === selected) listItem.addClass('sm-selected');
        return listItem
      })
    )
  }

  _onItemClick (item) {
    this.send('item:selected', item);
  }

  _onMoveUp () {
    const { selected } = this.state;
    if (selected > 0) {
      this.extendState({ selected: selected - 1 });
    }
  }

  _onMoveDown () {
    const { items } = this.props;
    const { selected } = this.state;
    if (items.length - 1 > selected) {
      this.extendState({ selected: selected + 1 });
    }
  }

  _onSelectItem () {
    const { items } = this.props;
    const { selected } = this.state;
    this.send('item:selected', items[selected]);
  }

  _onKeydown (event) {
    event.stopPropagation();
    switch (event.keyCode) {
      case keys.UP: {
        this._onMoveUp();
        break
      }
      case keys.DOWN: {
        this._onMoveDown();
        break
      }
      case keys.ENTER: {
        this._onSelectItem();
        break
      }
        //
    }
  }
}

class AutoComplete extends Component {
  constructor (...args) {
    super(...args);
    // TODO: experiment with different cases
    // it might make sense to use throttled function for small strings
    // e.g. throttle is good when the user type something for observing and
    // debounce is good when the user type something specific (e.g. email or complete username)
    // For in memory cases we can don't need this at all
    this._debouncedAutocompleteSearch = debounce(this.autocompleteSearch.bind(this), 500);
  }

  getInitialState () {
    return {
      searchResults: [],
      searchString: ''
    }
  }

  render () {
    const { placeholder } = this.props;
    const el = $$('div', { class: 'sc-autocomplete' });
    el.append(
      $$(Input, { placeholder })
        .ref('input')
        .on('input', this._debouncedAutocompleteSearch.bind(this))
    );
    return el
  }

  renderNotFound () {
    const { notFound } = this.props;
    const { searchString } = this.state;
    return $$('div', { class: 'sc-autocomplete-no-results' },
      notFound(searchString)
    ).on('click', this._onNotFoundClick.bind(this, searchString))
  }

  renderSearchResults () {
    const { searchResults } = this.state;
    const { itemClass } = this.props;
    const { width } = this._getInputRect();
    if (searchResults.length === 0) {
      return this.renderNotFound().css('width', width)
    }
    return $$(ListGroup, { itemClass, items: searchResults }).css('width', width)
  }

  async autocompleteSearch () {
    const searchString = this.refs.input.val();
    const { search } = this.props;
    this._hideSearchResults();
    this.setState({ searchString });
    const searchResults = await search(searchString);
    // We care only about results of latest search string
    if (this.state.searchString === searchString) {
      this.extendState({ searchResults });
      this._showSearchResults();
    }
  }

  reset () {
    this._hideSearchResults();
    this.refs.input.val('');
    this.setState(this.getInitialState());
  }

  _onNotFoundClick (searchString) {
    this.send('item:notfoundaction', searchString);
  }

  _hideSearchResults () {
    this.send('releasePopover', this);
  }

  _showSearchResults () {
    this.send('requestPopover', {
      requester: this,
      desiredPos: this._getDesiredPopoverPos(),
      content: () => {
        return this.renderSearchResults()
      },
      position: 'relative'
    });
  }

  _getInputRect () {
    if (platform.inBrowser) {
      const input = this.refs.input;
      return input.el.getNativeElement().getBoundingClientRect()
    }
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  _getDesiredPopoverPos () {
    const inputRect = this._getInputRect();
    if (inputRect) {
      let { left: x, top: y, height, width } = inputRect;
      y = y + height + 10;
      x = x + width / 2;
      return { x, y }
    }
  }
}

// If we are sure about user statuses, then it is probably better
// to have some system wide mapping of status id to labels
const COLLABORATORS_STUB = [
  { id: 'michael', name: 'Michael Aufreiter', status: 'Owner', existingUser: true },
  { id: 'oliver', name: 'Oliver Buchtala', status: 'Collaborator', existingUser: true },
  { id: 'daniel', name: 'Daniel Beilinson', status: 'Collaborator', existingUser: true },
  { id: 'ticket_123', name: 'beilinson@gmail.com', status: 'Invited', existingUser: false }
];

class Collaborators extends Component {
  getInitialState () {
    return {
      collaborators: COLLABORATORS_STUB
    }
  }

  getActionHandlers () {
    return {
      'item:selected': this._addCollaborator,
      'item:notfoundaction': this._inviteCollaborator,
      removeCollaborator: this._removeCollaborator
    }
  }

  render () {
    const { collaborators } = this.state;
    return $$('div', { class: 'sc-collaborators' },
      $$('div', { class: 'se-collaborators-list' },
        ...collaborators.map(collaborator => $$(Collaborator, collaborator))
      ),
      $$(Form, { class: 'se-add-collaborator' },
        $$(FormRow, { label: 'Invite Collaborator' },
          $$(AutoComplete, {
            placeholder: 'Enter name/username to select Substance user or an email address to invite a new user',
            notFound: (searchString) => 'Invite ' + searchString + ' via email',
            search: this._search.bind(this),
            itemClass: _renderUser
          }).ref('autocomplete')
        )
      )
    )
  }

  // In a real world async scenario here would be an API call
  // and state update upon success
  _addCollaborator (item) {
    const { collaborators } = this.state;
    collaborators.push(item);
    this.extendState({ collaborators });
    this.refs.autocomplete.reset();
  }

  _inviteCollaborator (email) {
    console.log('Invite collaborator:', email);
    this._addCollaborator({ id: 'ticket_x', name: email, status: 'Invited', existingUser: false });
  }

  // In a real world async scenario here would be an API call
  // and state update upon success
  _removeCollaborator (collaboratorId) {
    console.log('Removing collaborator:', collaboratorId);
    const { collaborators } = this.state;
    const collaboratorIdx = collaborators.findIndex(collaborator => collaborator.id === collaboratorId);
    collaborators.splice(collaboratorIdx, 1);
    this.extendState({ collaborators });
  }

  _search (searchString) {
    console.log('Searching for:', searchString);
    if (!searchString.length) { return }
    const regexp = new RegExp(searchString, 'i');
    return Promise.resolve(COLLABORATORS_STUB.filter(u => regexp.test(u.name) && u.existingUser))
  }
}

function _renderUser (props) {
  return (
    $$('div', { class: 'sc-user-search-item' },
      $$('div', { class: 'se-user-icon' },
        $$(Icon, { icon: 'user' })
      ),
      $$('div', { class: 'se-user-info' },
        $$('div', { class: 'se-name' },
          props.name
        ),
        $$('div', { class: 'se-username' },
          props.id
        )
      )
    )
  )
}

class Comment extends Component {
  render () {
    const { username, timestamp, text } = this.props;

    return $$('div', { class: 'sc-comment' },
      $$('div', { class: 'se-user-icon' },
        $$(Icon, { icon: 'user' })
      ),
      $$('div', { class: 'se-comment-wrapper' },
        $$('div', { class: 'se-comment-header' },
          $$('div', { class: 'se-username' }, username),
          $$('div', { class: 'se-divider' }, '·'),
          $$('div', { class: 'se-datetime' }, GetRelativeTime(timestamp))
        ),
        $$('div', { class: 'se-comment' }, text)
      )
    )
  }
}

const COMMENTS_STUB = [
  { id: 'comment_2', username: 'Michael Aufreiter', timestamp: '1583927861447', text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam vel tortor ut justo malesuada vestibulum vel eu eros. Morbi nisl mi, ultricies vitae maximus eu, auctor eget ipsum. Nam pharetra, diam a faucibus mollis, lectus lectus tincidunt augue, ac faucibus magna tortor non nibh. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec vitae consequat orci.' },
  { id: 'comment_1', username: 'Oliver Buchtala', timestamp: '1583921860447', text: 'Etiam ut risus rhoncus, fermentum sapien ut, consectetur lectus. Ut porttitor molestie varius. Aenean nec sapien ut elit condimentum lacinia ac ut tellus. In hac habitasse platea dictumst.' }
];

const COMMENT_CONTEXT = $$('div', {},
  'Using Substance, you can ',
  $$('span', { class: 'sm-highlight' }, 'focus 100%'),
  ' on your content, while we make sure it looks great.'
);

class Discussion extends Component {
  render () {
    const discussionEl = $$('div', { class: 'sc-discussion' },
      $$('div', { class: 'se-comment-context' }, COMMENT_CONTEXT),
      ...COMMENTS_STUB.map(comment => [$$(Comment, comment), $$(Divider)]),
      $$('div', { class: 'se-footer' },
        'Please ',
        $$('span', { class: 'sm-login' }, 'log in').on('click', this._requestLogin),
        ' to Substance to add a reply.'
      )
    );

    return discussionEl
  }

  _requestLogin () {
    this.send('requestLogin');
  }
}

class Sandbox extends Component {
  render () {
    return $$('div', { class: 'sc-sandbox' },
      $$(ContentBody, {},
        $$(Modal, { title: 'Collaborators', confirmLabel: 'Done' },
          $$(Collaborators)
        ),
        $$(Modal, { title: 'Public Discussion', disableFooter: true },
          $$(Discussion)
        )
      )
    )
  }
}

class SandboxPage extends BasePage {
  get title () { return 'Sandbox' }

  renderBodyContent () {
    const { user, preLaunch } = this.props;
    const { isMobile } = this.state;
    return [
      $$(Background, { style: 'bluesky' },
        preLaunch
          ? $$(LogoOnlyHeader, { inverted: true })
          : isMobile
            ? $$(MobileHeader, { inverted: true, user })
            : $$(WebsiteHeader, { inverted: true, user }),
        $$(Teaser, { isMobile, text: 'Sandbox', size: 'small' })
      ),
      $$(Sandbox, { isMobile }),
      $$(Footer, { isMobile, compact: true })
    ]
  }
}

export default SandboxPage;
//# sourceMappingURL=sandbox.page.js.map

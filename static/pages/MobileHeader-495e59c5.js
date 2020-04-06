import { C as Component, $ as $$, L as Limiter, H as HorizontalStack, S as SubstanceLogo, a as StackFill, b as Link, B as Button, s as siteMap } from './Footer-8f9b3fea.js';

class MobileHeader extends Component {
  getInitialState () {
    return {
      menuOpened: false
    }
  }

  render () {
    const state = this.state;
    const { inverted } = this.props;

    const el = $$('div', { className: 'sc-mobile-header' },
      $$(Limiter, {},
        $$(HorizontalStack, {},
          $$(SubstanceLogo, { inverted }),
          $$(StackFill),
          state.menuOpened
            ? $$('button').addClass('se-hamburger').on('click', this.toggleMobileMenu).append($$('i').addClass('fas fa-times'))
            : $$('button').addClass('se-close').on('click', this.toggleMobileMenu).append($$('i').addClass('fas fa-bars'))
        ),
        state.menuOpened ? this.renderMenu() : null
      )
    );
    if (inverted) el.addClass('sm-inverted');
    return el
  }

  renderMenu () {
    const el = $$('div', { class: 'se-menu' });
    const { user, inverted, preLaunch } = this.props;

    if (preLaunch) {
      el.append(
        $$('div', { class: 'se-menu-header' }, ''),
        $$('div', { class: 'se-menu-item' }).append(
          $$(Link, { href: '/contact', inverted }).text('Contact')
        )
      );

      return el
    }

    if (user) {
      el.append($$('div', { class: 'se-login-status' },
        $$(HorizontalStack, {},
          $$('div', {}, 'Signed in as michael'),
          $$(StackFill),
          $$(Button, { url: '/logout', inverted }, 'Log out')
        )
      ));
      el.append(
        $$('div', { class: 'se-menu-header' }, 'Account'),
        $$('div', { class: 'se-menu-item' }).append(
          $$(Link, { href: '/dashboard', inverted }).text('My Documents')
        ),
        $$('div', { class: 'se-menu-item' }).append(
          $$(Link, { href: '/settings', inverted }).text('User Settings')
        )
      );
    } else {
      el.append($$('div', { class: 'se-login-status' },
        $$(HorizontalStack, {},
          $$('div', {}, 'Not logged in'),
          $$(StackFill),
          $$(Button, { url: '/login', inverted }, 'Log in')
        )
      ));
    }
    siteMap.forEach(category => {
      el.append(
        $$('div', { class: 'se-menu-header' }, category.label)
      );
      category.items.forEach(item => {
        el.append(
          $$('div', { class: 'se-menu-item' }).append(
            $$(Link, { href: item.url, inverted }).text(item.label)
          )
        );
      });
    });
    return el
  }

  toggleMobileMenu () {
    this.extendState({ menuOpened: !this.state.menuOpened });
  }
}

export { MobileHeader as M };
//# sourceMappingURL=MobileHeader-495e59c5.js.map

import { C as Component, $ as $$, D as DropdownMenu, B as Button } from './Footer-8f9b3fea.js';

const USER_MENU = {
  items: [
    { url: '/dashboard', label: 'My documents', icon: 'bars' },
    { url: '/settings', label: 'Account settings', icon: 'cogs' },
    { url: '/logout', label: 'Log out', icon: 'sign-out-alt' }
  ]
};

class LoginStatus extends Component {
  render () {
    const user = this.props.user;
    if (user) {
      const { image } = this.props.user;
      return (
        $$(DropdownMenu, USER_MENU,
          $$('img', { class: 'se-user-icon', src: image })
        ).addClass('sc-login-status')
      )
    } else {
      return $$(Button, { style: 'primary', size: 'small', url: '/login' }, 'Login')
    }
  }
}

export { LoginStatus as L };
//# sourceMappingURL=LoginStatus-aa15daae.js.map

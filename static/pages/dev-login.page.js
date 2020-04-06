import { $ as $$, e as Form, g as FormRow, h as Input, B as Button } from './Footer-8f9b3fea.js';
import './LogoOnlyHeader-e4c4a388.js';
import './Background-d477736a.js';
import './Paragraph-905d0db4.js';
import './Strong-b67f02c8.js';
import './_sendRequest-aee5ea34.js';
import { P as PageDialog } from './PageDialog-da83ce37.js';
import './SignupForm-789a17ff.js';
import LoginPage from './login.page.js';

function DevLoginForm () {
  return (
    $$('form', { className: 'sc-login', method: 'POST', action: '/login' },
      $$(PageDialog, { size: 'small', title: 'Log in', hint: 'If you are not registered yet, the login link will take you to the account setup.' },
        $$(Form, {},
          $$(FormRow, { label: 'Email' },
            $$(Input, { name: 'email', autofocus: true })
          ),
          $$(Button, { style: 'primary' }, 'Request login link')
        )
      )
    )
  )
}

class DevLoginPage extends LoginPage {
  getLoginForm () {
    return $$(DevLoginForm)
  }
}

export default DevLoginPage;
//# sourceMappingURL=dev-login.page.js.map

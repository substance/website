import { c as BasePage, $ as $$, F as Footer } from './Footer-8f9b3fea.js';
import { L as LogoOnlyHeader } from './LogoOnlyHeader-e4c4a388.js';
import { B as Background } from './Background-d477736a.js';
import './Paragraph-905d0db4.js';
import './Strong-b67f02c8.js';
import './_sendRequest-aee5ea34.js';
import './PageDialog-da83ce37.js';
import { S as SignupForm } from './SignupForm-789a17ff.js';

class LoginForm extends SignupForm {
  getFormIntroduction () {
    return 'Please specify your email, you\'ll receive a link to log in.'
  }

  getFormName () {
    return 'Log in'
  }

  getFormUrl () {
    return '/api/requestLogin'
  }
}

class LoginPage extends BasePage {
  getLoginForm () {
    return $$(LoginForm)
  }

  renderBodyContent () {
    const { isMobile } = this.state;
    return [
      $$(Background, { style: 'bluesky' },
        $$(LogoOnlyHeader, { inverted: true }),
        this.getLoginForm()
      ),
      $$(Footer, { isMobile })
    ]
  }
}

export default LoginPage;
//# sourceMappingURL=login.page.js.map

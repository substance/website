import { c as BasePage, $ as $$, F as Footer } from './Footer-8f9b3fea.js';
import { L as LogoOnlyHeader } from './LogoOnlyHeader-e4c4a388.js';
import './Paragraph-905d0db4.js';
import './Strong-b67f02c8.js';
import './_sendRequest-aee5ea34.js';
import './PageDialog-da83ce37.js';
import { S as SignupForm } from './SignupForm-789a17ff.js';

class SignupPage extends BasePage {
  renderBodyContent () {
    const { isMobile } = this.state;
    return [
      $$(LogoOnlyHeader),
      $$(SignupForm),
      $$(Footer, { isMobile })
    ]
  }
}

export default SignupPage;
//# sourceMappingURL=signup.page.js.map

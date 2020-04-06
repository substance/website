import { C as Component, $ as $$, e as Form, g as FormRow, h as Input, B as Button } from './Footer-8f9b3fea.js';
import { P as Paragraph } from './Paragraph-905d0db4.js';
import { S as Strong } from './Strong-b67f02c8.js';
import { s as sendRequest } from './_sendRequest-aee5ea34.js';
import { P as PageDialog } from './PageDialog-da83ce37.js';

class SignupForm extends Component {
  getFormIntroduction () {
    return 'Please specify your email, you\'ll be able to sign in later using this address.'
  }

  getFormName () {
    return 'Sign Up'
  }

  getFormUrl () {
    return '/api/signUp'
  }

  render () {
    return $$('form', { class: 'sc-signup-form' },
      this.state.success
        ? this.renderSuccessMessage()
        : this.renderForm()
    )
  }

  renderForm () {
    return $$(PageDialog, { size: 'small', title: this.getFormName(), hint: 'We will send you an email with further information.' },
      $$(Form, {},
        $$(FormRow, {},
          $$(Paragraph, {}, this.getFormIntroduction())
        ),
        $$(FormRow, { label: 'Email', error: this.state.message },
          $$(Input, { ref: 'email', name: 'email', autofocus: true })
        ),
        $$(Button, { style: 'primary', disabled: this.state.saving }, this.getFormName())
          .on('click', this.submitForm)
      )
    )
  }

  renderSuccessMessage () {
    return $$(PageDialog, { size: 'small', title: 'Thank you!' },
      $$(Paragraph, {},
        'We sent you a temporary login link.',
        $$('br'),
        'Please check you email at'
      ),
      $$(Paragraph, {},
        $$(Strong, {}, this.state.email)
      )
    )
  }

  async submitForm () {
    const email = this.refs.email.val();

    this.setState({
      error: false,
      success: false,
      saving: true
    });

    const result = await sendRequest({
      method: 'POST',
      url: this.getFormUrl(),
      json: true,
      data: {
        email
      }
    });
    if (result.fail) {
      this.setState({
        fail: true,
        message: result.message,
        saving: false
      });
    } else {
      this.setState({
        fail: false,
        success: true,
        saving: false,
        email
      });
    }
  }
}

export { SignupForm as S };
//# sourceMappingURL=SignupForm-789a17ff.js.map

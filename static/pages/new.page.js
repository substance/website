import { c as BasePage, $ as $$, F as Footer, C as Component, ai as debounce, e as Form, g as FormRow, h as Input, B as Button } from './Footer-8f9b3fea.js';
import './LoginStatus-aa15daae.js';
import { P as Paragraph } from './Paragraph-905d0db4.js';
import { S as Strong } from './Strong-b67f02c8.js';
import { D as DashboardHeader } from './DashboardHeader-6ecc2335.js';
import { s as sendRequest } from './_sendRequest-aee5ea34.js';
import { P as PageDialog } from './PageDialog-da83ce37.js';

class NewDocumentPage extends BasePage {
  renderBodyContent () {
    const { user } = this.props;
    return [
      $$(DashboardHeader, { user }),
      $$(NewDocument, { user }),
      $$(Footer)
    ]
  }
}

class NewDocument extends Component {
  getInitialState () {
    return {
      valid: false
    }
  }

  didMount () {
    this._debouncedValidateDocumentName = debounce(this._validateDocumentName.bind(this), 500);
  }

  render () {
    return $$('form', { class: 'sc-new-document', method: 'POST', action: '/api/createNewDocument' },
      $$(PageDialog, { size: 'small', title: 'Create a new document', hint: 'Only you can access the document until a public version is created' },
        $$(Form, {},
          $$(FormRow, {},
            $$(Paragraph, {},
              'Take a moment to give your new document a ',
              $$(Strong, {}, 'short name'),
              '. It will be used to create a memorable URL that you can share.'
            )
          ),
          $$(FormRow, { label: 'Document name', error: this.state.error },
            $$(Input, { name: 'documentName', type: 'text', placeholder: 'short-and-memorable-document-name', autocomplete: 'off' })
              .ref('input')
              .on('input', this._onInput)
          ),
          $$(Button, { style: 'primary', disabled: !this.state.valid }, 'Create Document')
        )
      )
    )
  }

  _onInput () {
    // After each input consider state invalid
    this.setState({ valid: false });
    // ... until the doc has been validated again
    this._debouncedValidateDocumentName();
  }

  async _validateDocumentName () {
    const documentName = this.refs.input.val();
    if (documentName) {
      // TODO: we could add some convenience for json based requests
      // i.e. set Content-Type header and parse result
      const result = await sendRequest({
        method: 'POST',
        url: '/api/checkDocumentName',
        json: true,
        data: {
          documentName
        }
      });
      if (result.wrongFormat) {
        this.setState({
          error: 'Use at least 3 characters and only a-z 0-9 - _'
        });
      } else if (result.documentExists) {
        this.setState({
          error: 'Document already exists'
        });
      } else {
        this.setState({ valid: true });
      }
    }
  }
}

export default NewDocumentPage;
//# sourceMappingURL=new.page.js.map

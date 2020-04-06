import { C as Component, $ as $$, B as Button, e as Form, g as FormRow, h as Input, H as HorizontalStack, c as BasePage, F as Footer } from './Footer-8f9b3fea.js';
import { M as MobileHeader } from './MobileHeader-495e59c5.js';
import './LoginStatus-aa15daae.js';
import { D as DashboardHeader } from './DashboardHeader-6ecc2335.js';
import { s as sendRequest } from './_sendRequest-aee5ea34.js';
import { P as PageDialog } from './PageDialog-da83ce37.js';

/* global FormData */

class PictureSelector extends Component {
  getInitialState () {
    return {
      value: this.props.image
    }
  }

  render () {
    const { value } = this.state;
    return $$('div').addClass('sc-picture-selector').append(
      $$('div').addClass('se-badge-image').append(
        $$('img', { src: value }).on('click', this.openFileUploadDialog),
        $$('input', { className: 'se-file-upload', type: 'file', accept: 'image/*', ref: 'fileUpload' })
          .on('change', this.onFileSelect)
      ),
      $$(Button, { size: 'small', style: 'primary' }, value ? 'Replace image' : 'Upload image')
        .on('click', this.openFileUploadDialog)
    )
  }

  onFileSelect (e) {
    const files = e.currentTarget.files;
    this.uploadFile(files[0]);
  }

  openFileUploadDialog (e) {
    e.preventDefault();
    this.refs.fileUpload.click();
  }

  val (value) {
    if (value) {
      this.setState({ value });
    } else {
      return this.state.value
    }
  }

  uploadFile (file) {
    const form = new FormData();
    form.append('asset', file);
    sendRequest({
      method: 'PUT',
      url: '/api/uploadProfilePicture',
      multiPart: true,
      data: form
    }).then(response => {
      const data = JSON.parse(response);
      const assets = data.assets;
      if (assets) {
        this.val(assets[0]);
      }
    }).catch(err => {
      this.setState({ error: err.message });
    });
  }
}

class ErrorMessage extends Component {
  render () {
    return $$('div', { class: 'sc-error-message' }).append(this.props.children)
  }
}

class SuccessMessage extends Component {
  render () {
    return $$('div', { class: 'sc-success-message' }).append(this.props.children)
  }
}

class Settings extends Component {
  render () {
    const { displayName, email, image, bio, website } = this.props.user;
    const formEl = $$(Form);

    if (this.state.error) {
      formEl.append(
        $$(FormRow, {},
          $$(ErrorMessage, {}, this.state.error)
        )
      );
    } else if (this.state.success) {
      formEl.append(
        $$(FormRow, {},
          $$(SuccessMessage, {}, 'Your settings succefully updated')
        )
      );
    }

    formEl.append(
      $$(FormRow, { label: 'Profile picture' },
        $$(PictureSelector, { image })
      ),
      $$(FormRow, { label: 'Your name' },
        $$(Input, { ref: 'displayName', autofocus: true, value: displayName })
      ),
      $$(FormRow, { label: 'Email' },
        $$(Input, { ref: 'email', value: email, type: 'email', disabled: true })
      ),
      $$(FormRow, { label: 'Bio' },
        $$(Input, { ref: 'bio', value: bio })
      ),
      $$(FormRow, { label: 'Website' },
        $$(Input, { ref: 'website', value: website })
      ),
      $$(HorizontalStack, {},
        $$(Button, { style: 'primary', disabled: Boolean(this.state.saving) }, 'Update Profile')
          .on('click', this.saveUserSettings),
        $$(Button, { style: 'danger', size: 'small' }, 'Delete Account')
          .on('click', this.deleteAccount)
      )
    );

    return (
      $$('div', { className: 'sc-settings' },
        $$(PageDialog, { size: 'small', title: 'Account Settings' },
          formEl
        )
      )
    )
  }

  async deleteAccount () {
    if (window.confirm('Are you really sure? You will not be able to bring your data back.')) {
      console.info('TODO: implement account deletion.');
    }
  }

  async saveUserSettings () {
    const data = Object.keys(this.refs).reduce((data, ref) => {
      data[ref] = this.refs[ref].val();
      return data
    }, {});

    this.setState({
      error: false,
      success: false,
      saving: true
    });

    const result = await sendRequest({
      method: 'POST',
      url: '/api/updateUser',
      json: true,
      data
    });
    if (result.error) {
      this.setState({
        error: result.error,
        saving: false
      });
    } else {
      this.setState({
        error: false,
        success: true,
        saving: false
      });
      this.extendProps({ user: result });
    }
  }
}

class SettingsPage extends BasePage {
  get title () { return 'Settings' }

  renderBodyContent () {
    const { user } = this.props;
    const { isMobile } = this.state;
    return [
      isMobile
        ? $$(MobileHeader, { user })
        : $$(DashboardHeader, { user, profile: user }),
      $$(Settings, { user }),
      $$(Footer, { isMobile })
    ]
  }
}

export default SettingsPage;
//# sourceMappingURL=settings.page.js.map

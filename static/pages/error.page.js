import { c as BasePage, $ as $$, F as Footer } from './Footer-8f9b3fea.js';
import { M as MobileHeader } from './MobileHeader-495e59c5.js';
import { L as LogoOnlyHeader } from './LogoOnlyHeader-e4c4a388.js';
import './LoginStatus-aa15daae.js';
import { W as WebsiteHeader, T as Teaser } from './Teaser-04f0cf42.js';
import { B as Background } from './Background-d477736a.js';

class ContactPage extends BasePage {
  getMessage () {
    return this.props.status === 404 ? 'Page not found' : 'Internal error'
  }

  get title () { return this.getMessage() }

  renderBodyContent () {
    const { user, message, status, preLaunch } = this.props;
    const { isMobile } = this.state;
    return [
      $$(Background, { style: 'bluesky' },
        preLaunch
          ? $$(LogoOnlyHeader, { inverted: true })
          : isMobile
            ? $$(MobileHeader, { inverted: true, user })
            : $$(WebsiteHeader, { inverted: true, user }),
        $$(Teaser, {
          isMobile,
          text: [
            status,
            ': ',
            message
          ],
          size: 'large'
        })
      ),
      $$(Footer, { isMobile, compact: true })
    ]
  }
}

export default ContactPage;
//# sourceMappingURL=error.page.js.map

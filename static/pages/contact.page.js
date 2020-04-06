import { C as Component, $ as $$, c as BasePage, F as Footer } from './Footer-8f9b3fea.js';
import { M as MobileHeader } from './MobileHeader-495e59c5.js';
import { L as LogoOnlyHeader } from './LogoOnlyHeader-e4c4a388.js';
import './LoginStatus-aa15daae.js';
import { W as WebsiteHeader, T as Teaser } from './Teaser-04f0cf42.js';
import { B as Background } from './Background-d477736a.js';
import { H as Heading } from './Heading-207573c0.js';
import { P as Paragraph } from './Paragraph-905d0db4.js';
import { C as ContentBody } from './ContentBody-fe80f7b3.js';

class Contact extends Component {
  render () {
    return $$('div', { class: 'sc-contact' },
      $$(ContentBody, { centered: true },
        // $$(Heading, { level: 1 }, 'Contact'),
        $$(Paragraph, {},
          'Please contact us via ',
          $$('a', { href: 'mailto:team@substance.io' }, 'team@substance.io'),
          '.'
        ),
        $$(Heading, { level: 1 }, 'Our office'),
        $$(Paragraph, {},
          'Substance Software GmbH',
          $$('br'),
          'Mozartstraße 56',
          $$('br'),
          '4020 Linz, Austria'
        ),
        $$(Paragraph, {},
          'Substance Software GmbH is registered in Linz, No. FN 408728x',
          $$('br'),
          'VAT Reg.No.: ATU68395257'
        )
      )
    )
  }
}

class ContactPage extends BasePage {
  get title () { return 'Contact us' }

  renderBodyContent () {
    const { user, preLaunch } = this.props;
    const { isMobile } = this.state;
    return [
      $$(Background, { style: 'bluesky' },
        preLaunch
          ? $$(LogoOnlyHeader, { inverted: true })
          : isMobile
            ? $$(MobileHeader, { inverted: true, preLaunch, user })
            : $$(WebsiteHeader, { inverted: true, preLaunch, user }),
        $$(Teaser, { isMobile, text: 'Contact', size: 'small' })
      ),
      $$(Contact, { isMobile }),
      $$(Footer, { isMobile, compact: true })
    ]
  }
}

export default ContactPage;
//# sourceMappingURL=contact.page.js.map

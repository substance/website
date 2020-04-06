import { C as Component, $ as $$, L as Limiter, H as HorizontalStack, b as Link, S as SubstanceLogo, a as StackFill, B as Button } from './Footer-8f9b3fea.js';
import { L as LoginStatus } from './LoginStatus-aa15daae.js';

class WebsiteHeader extends Component {
  render () {
    // ATTENTION: only when the user is logged in the document tools should be visible
    const { user, inverted, preLaunch } = this.props;
    const el = $$('div', { class: 'sc-header sm-website-header' },
      $$(Limiter, {},
        $$(HorizontalStack, {},
          $$(Link, { href: '/' },
            $$(SubstanceLogo, { inverted })
          ),
          $$(StackFill),
          $$(Link, { inverted, href: '/t-shirt', style: 'header' }, 'T-Shirts'),
          $$(Link, { inverted, href: '/our-story', style: 'header' }, 'Our Story'),
          $$(Link, { inverted, href: '/contact', style: 'header' }, 'Contact'),
          preLaunch
            ? ''
            : user
              ? $$(LoginStatus, { user })
              : $$(Button, { inverted, style: 'primary', size: 'small', url: '/login' }, 'Login')
        )
      )
    );
    if (inverted) {
      el.addClass('sm-inverted');
    }
    return el
  }
}

class Teaser extends Component {
  render () {
    const { isMobile } = this.props;
    const size = this.props.size || 'default';
    const el = $$('div', { class: 'sc-teaser' });
    if (isMobile) el.addClass('sm-mobile');
    el.addClass('sm-size-' + size);
    const content = this.props.text || ['Self-publish your ', $$('span', { class: 'se-highlight' }, 'research')];
    return el.append(
      $$(Limiter, {},
        $$('h1', { class: 'se-page-heading' },
          content
        )
      )
    )
  }
}

export { Teaser as T, WebsiteHeader as W };
//# sourceMappingURL=Teaser-04f0cf42.js.map

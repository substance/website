import { C as Component, $ as $$, L as Limiter, b as Link, S as SubstanceLogo } from './Footer-8f9b3fea.js';

class LogoOnlyHeader extends Component {
  render () {
    return $$('div', { class: 'sc-logo-only-header' },
      $$(Limiter, {},
        $$(Link, { inlineBlock: true, href: '/' },
          $$(SubstanceLogo, { size: 'large', inverted: this.props.inverted })
        )
      )
    )
  }
}

export { LogoOnlyHeader as L };
//# sourceMappingURL=LogoOnlyHeader-e4c4a388.js.map

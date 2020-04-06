import { C as Component, $ as $$, L as Limiter, H as HorizontalStack, b as Link, S as SubstanceLogo, a as StackFill, B as Button, I as Icon } from './Footer-8f9b3fea.js';
import { L as LoginStatus } from './LoginStatus-aa15daae.js';

class DashboardHeader extends Component {
  render () {
    const { user, profile } = this.props;
    return $$('div', { class: 'sc-header sc-dashboard-header' },
      $$(Limiter, {},
        $$(HorizontalStack, {},
          $$(Link, { href: '/' + profile.name },
            $$(SubstanceLogo)
          ),
          $$(StackFill),
          $$(Button, { style: 'plain', size: 'default', url: '/new' },
            $$(Icon, { icon: 'plus' })
          ),
          $$(LoginStatus, { user })
        )
      )
    )
  }
}

export { DashboardHeader as D };
//# sourceMappingURL=DashboardHeader-6ecc2335.js.map

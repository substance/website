import { C as Component, $ as $$, I as Icon } from './Footer-8f9b3fea.js';

class Hint extends Component {
  render () {
    return $$('div', { class: 'sc-hint' }).append(
      $$(Icon, { icon: 'info' }),
      $$('div', { class: 'se-hint' }, this.props.children)
    )
  }
}

function PageDialog (props) {
  const { title, hint, children } = props;
  const el = $$('div', { className: 'sc-page-dialog' },
    $$('div', { className: 'se-title' }, title),
    $$('div', { className: 'se-body' }, children)
  );
  if (hint) {
    el.append(
      $$(Hint, {}, hint)
    );
  }
  return el
}

export { PageDialog as P };
//# sourceMappingURL=PageDialog-da83ce37.js.map

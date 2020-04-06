import { C as Component, $ as $$ } from './Footer-8f9b3fea.js';

class Background extends Component {
  render () {
    const style = this.props.style || 'light';
    const size = this.props.size || 'default';
    const el = $$('div', { class: 'sc-background' });
    el.addClass('sm-' + style);
    el.addClass('sm-size-' + size);
    el.append(this.props.children);
    return el
  }
}

export { Background as B };
//# sourceMappingURL=Background-d477736a.js.map

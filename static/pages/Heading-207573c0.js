import { $ as $$ } from './Footer-8f9b3fea.js';

function Heading (props) {
  const level = props.level;
  return (
    $$('h' + level, { class: 'sc-heading' },
      props.children
    ).addClass('sm-level-' + level)
  )
}

export { Heading as H };
//# sourceMappingURL=Heading-207573c0.js.map

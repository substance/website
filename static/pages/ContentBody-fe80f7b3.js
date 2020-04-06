import { $ as $$, L as Limiter } from './Footer-8f9b3fea.js';

function ContentBody (props) {
  const { centered } = props;
  const el = $$('div', { className: 'sc-content-body' });
  if (centered) el.addClass('sm-centered');
  return (
    el.append(
      $$(Limiter, {},
        props.children
      )
    )
  )
}

export { ContentBody as C };
//# sourceMappingURL=ContentBody-fe80f7b3.js.map

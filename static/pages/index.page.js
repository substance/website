import { C as Component, $ as $$, L as Limiter, B as Button, b as Link, c as BasePage, F as Footer } from './Footer-8f9b3fea.js';
import { M as MobileHeader } from './MobileHeader-495e59c5.js';
import { L as LogoOnlyHeader } from './LogoOnlyHeader-e4c4a388.js';
import './LoginStatus-aa15daae.js';
import { W as WebsiteHeader, T as Teaser } from './Teaser-04f0cf42.js';
import { B as Background } from './Background-d477736a.js';
import { H as Heading } from './Heading-207573c0.js';
import { P as Paragraph } from './Paragraph-905d0db4.js';
import { S as Strong } from './Strong-b67f02c8.js';

class Feature extends Component {
  render () {
    const { image, isMobile } = this.props;
    const el = $$('div', { class: 'sc-feature' },
      $$(Limiter, {},
        $$('img', { src: '/static/images/' + image }),
        $$('div', { class: 'se-description' }, this.props.children)
      )
    );
    if (isMobile) el.addClass('sm-mobile');
    return el
  }
}

class FAQ extends Component {
  render () {
    const { children, isMobile } = this.props;
    const el = $$('div', { class: 'sc-faq' },
      $$(Limiter, {},
        children
      )
    );
    if (isMobile) el.addClass('sm-mobile');
    return el
  }
}

class Question extends Component {

  render () {
    const { label, children } = this.props;
    const el = $$('div', { class: 'sc-question' },
      $$(Heading, { level: 4 }, label)
    );
    el.append(
      $$('div', { class: 'se-answer' }, children)
    );
    return el
  }

  _renderArrow () {
    const { opened } = this.state;
    const arrowEl = $$('div', { class: 'se-arrow' },
      $$('span'),
      $$('span')
    );
    if (opened) arrowEl.addClass('sm-opened');
    return arrowEl
  }
}

class JoinUs extends Component {
  render () {
    const el = $$('div', { class: 'sc-join-us' },
      $$(Limiter, {},
        $$('div', { class: 'se-intro' },
          this.props.message
        ),
        $$(Button, { style: 'primary', size: 'large', url: 'https://www.facebook.com/groups/SubstanceForResearch' }, 'Join us')
      )
    );
    return el
  }
}

class Home extends Component {
  render () {
    const { isMobile } = this.props;
    const el = $$('div', { class: 'sc-home' },
      $$(Feature, { isMobile, class: 'sm-shifted', image: 'just-write.png' },
        $$(Heading, { level: 1 }, 'Just write'),
        $$(Paragraph, {},
          'Did you know authors often spend as much time formatting as for writing content?'
        ),
        $$(Paragraph, {},
          'Using Substance, you can ',
          $$(Strong, {}, 'focus 100% on your writing'),
          ', while the system enforces structure and form of a scientific article automatically.'
        )
      ),
      $$(Feature, { isMobile, image: 'collaboration.png' },
        $$(Heading, { level: 1 }, 'Collaborate'),
        $$(Paragraph, {}, 'Co-authoring, reviewing and copy editing is difficult today:'),
        $$(Paragraph, {},
          $$(Strong, {}, '“I received PDFs from five people with corrections, how should I put all of these together? 🙀”')
        ),
        $$(Paragraph, {},
          'In Substance, contributing is as simple as editing a draft together in real-time.'
        )
      ),
      $$(Feature, { isMobile, image: 'revisions.png' },
        $$(Heading, { level: 1 }, 'Revisions'),
        $$(Paragraph, {},
          'Writing is a creative act. Content is continuously ',
          $$(Strong, {}, 'rewritten and moved around'),
          '.'
        ),
        $$(Paragraph, {},
          'With Revisions, you can create ',
          $$(Strong, {}, 'memorable snapshots of your work'),
          ' to access it later. Use them when you want to try out a radically new idea. Create a new revision and then delete the section you want to rewrite.'
        )
      ),
      $$(Feature, { isMobile, image: 'share.png' },
        $$(Heading, { level: 1 }, 'Share your work'),
        $$(Paragraph, {},
          'The production of a web publication conforming to scientific standards is expensive and usually done by a publisher.'
        ),
        $$(Paragraph, {},
          'With Substance you can now do this yourself with just a click. Your work will be available at ',
          $$(Strong, {}, 'substance.io/your-name/your-article'),
          ' in all common formats.'
        )
      ),
      $$(Feature, { isMobile, image: 'no-ads.png' },
        $$(Heading, { level: 1 }, 'Just read'),
        $$(Paragraph, {},
          'Why do many people prefer printed content? Reading a print keeps you focused and relaxed. In contrast, ',
          $$(Strong, {}, 'web sites draw away your attention'),
          ' with ads and links to related content.'
        ),
        $$(Paragraph, {},
          'Substance displays ',
          $$(Strong, {}, 'the content and nothing else'),
          ' to provide you with a reading experience matching that of a print as closely as possible.'
        )
      ),
      $$(Feature, { isMobile, image: 'discuss.png' },
        $$(Heading, { level: 1 }, 'Discuss'),
        $$(Paragraph, {}, 'Today, research is discussed in external channels separate from the content.'),
        $$(Paragraph, {},
          'On Substance readers can ',
          $$(Strong, {}, ' leave comments'),
          ' right inside the article. Authors can respond to those and share new revisions as they receive feedback.'
        )
      ).addClass('sm-last'),
      $$(JoinUs, {
        message: [
          'Are you ready to take sharing of research into your own hands?'
        ]
      }),
      $$(FAQ, { isMobile },
        $$(Question, { label: 'Who is Substance for?' },
          $$(Paragraph, {},
            'We designed Substance for ',
            $$(Strong, {}, 'scientists'),
            ' who want to self-publish their findings rapidly, ',
            $$(Strong, {}, 'researchers'),
            ' in the private sector, as well as ',
            $$(Strong, {}, 'students'),
            ' for writing a thesis or seminar paper. You can use Substance for any other content too. It is not limited to research.'
          )
        ),
        $$(Question, { label: 'When will it be ready?' },
          $$(Paragraph, {},
            'Soon. While most parts are in place, we need a couple of months more to work out the kinks. If you would like to be informed about the latest developments and be among the first to be invited for beta testing, please join our ',
            $$(Link, { href: 'https://www.facebook.com/groups/SubstanceForResearch', target: '_blank' }, 'Facebook group'),
            '.'
          )
        ),
        $$(Question, { label: 'How much will it cost?' },
          $$(Paragraph, {},
            'We expect a monthly subscription to cost ',
            $$(Strong, {}, '10€ per user'),
            '. There are no additional publishing or processing fees, and you can share as many articles as you want.'
          )
        ),
        $$(Question, { label: 'What sets Substance apart?' },
          $$(Paragraph, {},
            'Substance is the first self-publishing solution for research. It supports all stages, from ',
            $$(Strong, {}, 'writing'),
            ' the manuscript, to ',
            $$(Strong, {}, 'reviewing'),
            ' and ',
            $$(Strong, {}, 'editing'),
            ' to rapid ',
            $$(Strong, {}, 'sharing'),
            ' and public ',
            $$(Strong, {}, 'discussion'),
            '.'
          ),
          $$(Paragraph, {},
            'Our minimal user interface provides an excellent experience for editing and reading. Changes to an article are available in ',
            $$(Strong, {}, 'real-time'),
            '. The system allows instant ',
            $$(Strong, {}, 'collaboration'),
            ' during authoring and after publication as well as frequent ',
            $$(Strong, {}, 'publishing'),
            ' of corrections.'
          )
        ),
        $$(Question, { label: 'Who is behind Substance?' },
          $$(Paragraph, {},
            'Michael Aufreiter, Oliver Buchtala and Daniel Beilinson have been working in the field for the past seven years and developed ',
            $$(Strong, {}, 'open-source editor software'),
            ' to help open access journals speed up their publishing process.'
          ),
          $$(Paragraph, {},
            'We realised that this is not enough. Researchers want to become genuinely independent, so they can establish a new friendly way for ',
            $$(Strong, {}, 'sharing'),
            ' and ',
            $$(Strong, {}, 'discussing'),
            ' their findings ',
            $$(Strong, {}, 'ahead of journal publication'),
            '. We want to take out all the annoying bits and make communicating science fun and productive. That’s our mission!'
          )
        ),
        $$(Question, { label: 'Is Substance a scientific journal?' },
          $$(Paragraph, {},
            'No. Substance is more like an interactive preprint server, but holding ',
            $$(Strong, {}, 'dynamic web publications'),
            ' rather than static PDF’s. We provide the technical solution, while authors are responsible for the content.'
          )
        ),
        $$(Question, { label: 'Can I use Substance for peer review?' },
          $$(Paragraph, {},
            'In Substance, you invite reviewers and editors openly. You can reach high-quality content by publishing corrected revisions as you receive feedback.'
          ),
          $$(Paragraph, {},
            'Publishers can benefit from Substance too. Instead of discussing a PDF submission, they can assess an article directly on Substance and have their editors and reviewers interact with the content directly.'
          )
        ),
        $$(Question, { label: 'Can I export my content?' },
          $$(Paragraph, {},
            'Yes. You can download any revision of an article in a variety of established formats, including ',
            $$(Strong, {}, 'JATS-XML'),
            ', ',
            $$(Strong, {}, 'DOCX'),
            ', ',
            $$(Strong, {}, 'PDF'),
            ' and ',
            $$(Strong, {}, 'HTML'),
            '.'
          )
        ),
        $$(Question, { label: 'Can I submit to a traditional journal too?' },
          $$(Paragraph, {},
            'Absolutely. Once you finish writing, you can download a ',
            $$(Strong, {}, 'PDF'),
            ' and submit it to a journal as usual.'
          )
        )
      ),
      $$(JoinUs, { message: 'We want your help to get this right.' })
    );
    if (isMobile) el.addClass('sm-mobile');
    return el
  }
}

class IndexPage extends BasePage {
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
        $$(Teaser, { isMobile })
      ),
      $$(Home, { isMobile }),
      $$(Footer, { isMobile, compact: true })
    ]
  }
}

export default IndexPage;
//# sourceMappingURL=index.page.js.map

import Link from 'next/link'
import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'
import { List, ListItem } from '../components/List'
import Partners from '../components/Partners'

export default function Consortium () {
  return (
    <Layout title='Substance Consortium' activeMenu='company'>
      <Teaser title='Substance Consortium'>
        <div className='se-teaser-quote'>
          <div className='se-teaser-quote-content'>“We recognize that web-based multi-party editing of structured documents is needed in the authoring, editing, and production workflows of knowledge creation, and believe that we can best ensure Substance serves all these needs by coming together to support them. We hope that by making this commitment, others will recognize that there is more to gain from jointly supporting Substance’s work rather than building local or custom solutions that cannot easily be used by others.”</div>
          <div className='se-teaser-quote-author'>– Juan Pablo Alperin</div>
        </div>
      </Teaser>
      <Body>
        <Section>
          <p>In 2016 a diverse group of organizations joined to create a consortium responsible for supporting the development and maintenance of Substance.js and Texture. The consortium is currently made up of an open source software development group (the <Link href='https://pkp.sfu.ca'><a>Public Knowledge Project</a></Link>; PKP), two journal aggregation and dissemination platforms (<Link href='https://erudit.org'><a>Erudit</a></Link> and <Link href='https://scielo.org'><a>SciELO</a></Link>), an innovative publisher (<Link href='https://elifesciences.org'><a>eLife</a></Link>), and a data discovery platform (<Link href='https://sourcedata.embo.org'><a>EMBO SourceData</a></Link>). Despite their differences, the Substance Consortium operates under the shared belief that a robust open source XML editor will be beneficial for the scholarly community at large.</p>
        </Section>
        <Section>
          <Partners texture='true' />
        </Section>
        <Section headline='Goals'>
          <p>The goal of the Substance Consortium is simple: to ensure the continued development and support of Substance by creating a community of stakeholders who will support and engage with Substance on an ongoing basis. By ensuring the long-term support of Substance, organizations that want to use Substance-based tools can be confident that it will be properly supported in the future. And, the Consortium is an acknowledgement that the organizations who use these tools as critical infrastructure have a responsibility to contribute to their upkeep.</p>
          <p>In July 2016 the members met in Montreal to discuss the goals, structure, and principles of the Substance Consortium. The group articulated these foundational principles:</p>
          <List>
            <ListItem headline='Open Source'>
              Substance.js and Texture will continue to be licensed as open source.
            </ListItem>
            <ListItem headline='Reliability'>
              Reliability: Ensure ongoing support and maintenance of Texture and Substance.js.
            </ListItem>
            <ListItem headline='Support'>
              The tools will be supported with quality documentation and trainings.
            </ListItem>
            <ListItem headline='Persistence'>
              Substance.js and Texture will be hosted and available long-term.
            </ListItem>
            <ListItem headline='Transparency'>
              Done correctly, with an advisory board and reports on finances and key decisions
            </ListItem>
          </List>
        </Section>
        <Section headline='Become a member'>
          <p>We are very open to welcome new members who are commited to integrate Texture into their workflows and support its development. Please <Link href='/contact'><a>contact us</a></Link> and we’ll set up a call to discuss how to get you on board.</p>
        </Section>
      </Body>
    </Layout>
  )
}

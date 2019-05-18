import Link from 'next/link'
import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'
import Contributor from '../components/Contributor'

export default function Story () {
  return (
    <Layout title='Our Story' activeMenu='company'>
      <Teaser title='Our Story'>
        <div className='se-teaser-image sm-with-padding'>
          <img className='se-image' src='/static/images/texture-launch.png' />
        </div>
      </Teaser>
      <Body>
        <Section>
          <p>We are specialists for web-based editing solutions. Substance started as a side project in 2011 and since we are working on building the best tools to allow collaborative writing and sharing of structured content. We believe that communicating findings can be easy and technology can help us, instead of distracting us.</p>
        </Section>
        <Section headline='Founders'>
          <Contributor img='michael.jpeg'>
            In 2011 Michael Aufreiter started an effort to create an open source writing platform called Substance.io (<Link href='https://vimeo.com/27730207'><a>see video</a></Link>). He was dissatisfied with LaTeX, Microsoft Word and various Markdown flavours for writing his master thesis and decided to work on an alternative that puts semantics first, and lets the writer focus on content and structure while leaving formatting and style to the system entirely.
          </Contributor>
          <Contributor img='oliver.jpeg'>
            In the year 2013 Oliver Buchtala joined the project and together they started turning a then-hobby project into a real business. In 2014 Substance Software GmbH was founded to provide consulting around the open source project, which turned from a platform into a Javascript library for building web editors.
          </Contributor>
        </Section>
        <Section headline='Contributors'>
          <Contributor img='daniel.jpeg'>
            Daniel Beilinson is a Substance contributor since the very beginning. He used Substance himself to build <Link href='https://github.com/archivist/archivist'><a>Archivist</a></Link>, a platform to publish interactive historical documents. Today he helps us building Texture, as well as contributing to Substance.js.
          </Contributor>
        </Section>
      </Body>
    </Layout>
  )
}

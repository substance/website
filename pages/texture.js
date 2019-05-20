import Link from 'next/link'
import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'
import { Card, Cards } from '../components/Cards'
import ReadMore from '../components/ReadMore'

export default function Texture () {
  return (
    <Layout title='Texture' activeMenu='products'>
      <Teaser title='Texture' headline='A visual editor for research.'>
        <div className='se-teaser-image'>
          <img className='se-image' src='/static/images/texture-manuscript.png' />
        </div>
        <Link href='https://github.com/substance/texture/releases'>
          <a><button className='se-action-button'>Download latest development version</button></a>
        </Link>
        <p className='se-note'>* Texture is  currently in beta and optimised for publishers. <br />An updated version will add missing features to fully support scientific authoring.</p>
      </Teaser>
      <Body>
        <Section headline='A familiar editing experience'>
          <p>Texture feels like the word processor you are used to. It allows structured editing of scientific content and includes support for figures, tables, references, supplementary files and more.</p>
        </Section>
        <Section headline='Document Archive'>
          <p>Texture uses an <Link href='https://github.com/substance/texture/releases'><a>open file format</a></Link> (.dar) for storage. It is essentially a zip archive, containing the manuscript as a standard JATS XML file, as well as additional assets such as images and data files.</p>
        </Section>
        <Section headline='Supporting an end to end publishing workflow'>
          <p>Texture is the first scientific editor designed for publishers and authors. The idea is to facilitate seamless interaction between authors and journals, improving the overall speed of digital publishing.</p>
          <Cards>
            <Card title='Authoring'>
              Scientists use Texture to author modern web-ready publication.
            </Card>
            <Card title='Peer review'>
              Publishers receive submissions as a .dar file. Reviewers use Texture to add comments, after which authors submit a revised version.
            </Card>
            <Card title='Production'>
              Journal production teams use Texture to add metadata and perform assisted quality checking of the content.
            </Card>
            <Card title='Author proofing'>
              Authors log in through the publisher’s website and use Texture to respond to publisher queries, make final changes and approve it for publication.
            </Card>
          </Cards>
        </Section>
        <Section headline='Collaboratively designed by scientists and publishers'>
          <p>Scientists and publishers are helping us define the features that best support their daily needs. Their input will take Texture further and help remove the technical difficulties from publishing. That way scientists can focus their full attention on research and publishers can focus on ensuring high quality content.</p>
        </Section>
        <Section headline='Learn more'>
          <ReadMore href='/publishing' title='Texture for publishers' />
          <ReadMore href='/dar' title='DAR format' />
          <ReadMore href='/repro-docs' title='Reproducible documents with Texture and Stencila' />
        </Section>
      </Body>
    </Layout>
  )
}

import Link from 'next/link'
import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'
import { Card, Cards } from '../components/Cards'
import ReadMore from '../components/ReadMore'

export default function Texture () {
  return (
    <Layout title='Texture'>
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
          <p>Texture feels like the word processor you are used to. It allows structured editing of scientific content and includes support for Figures, Tables, References, Supplementary files and more.</p>
        </Section>
        <Section headline='Document Archive'>
          <p>Texture uses an open file format (.dar) for storage. It is essentially a zip archive, containing the manuscript as a standard JATS XML file, as well as additional assets such as images and data files.</p>
        </Section>
        <Section headline='Supporting an end to end publishing workflow'>
          <p>Texture is the first scientific editor, that is designed for publishers and authors. The idea is that interaction between authors and journals becomes seamless, improving the overall speed of digital publishing.</p>
          <Cards>
            <Card title='Authoring'>
              Scientist uses Texture to author modern web-ready publication.
            </Card>
            <Card title='Peer review'>
              Publisher receives submission as a .dar file. Texture is used by reviewers to add comments and by authors to submit a revised version.
            </Card>
            <Card title='Production'>
              Journal production team uses Texture to add metadata and perform assisted quality checking of the content.
            </Card>
            <Card title='Author proofing'>
              Author logs in at the publisher’s website and uses Texture to respond to publisher queries, make final changes and approve it for publication.
            </Card>
          </Cards>
        </Section>
        <Section headline='Co-designed by scientists and publishers'>
          <p>Scientists and publishers are helping us to define new features, that best support their daily use-cases. With their input we want to take Texture further and help remove the technical pain points from publishing. So that scientists can focus fully on their research, and publishers can focus on ensuring high quality content.</p>
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

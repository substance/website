import Link from 'next/link'
import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'
import { List, ListItem } from '../components/List'
import ReadMore from '../components/ReadMore'

export default function ReproDocs () {
  return (
    <Layout title='Reproducible Documents' activeMenu='solutions'>
      <Teaser title='Reproducible documents' headline='Realising reproducible documents with Texture and Stencila.'>
        <div className='se-teaser-image'>
          <img className='se-image' src='/static/images/reproducable-manuscript.png' />
        </div>
      </Teaser>
      <Body>
        <Section headline='Adding reproducibility to the academic manuscript'>
          <p>In science calls for transparency and reproducibility are becoming louder. Researchers want to share not only their final findings but the underlying data and the methods used to generate the results.</p>
          <p>Substance in collaboration with eLife and Stencila is addressing this by enabling reproducible elements in the Texture editor with the following goals in mind.</p>
        </Section>
        <Section>
          <List>
            <ListItem headline='Source data'>
              Source data is readily available in the publication and can be explored by the reader.
            </ListItem>
            <ListItem headline='Code cells'>
              Code cells allow live computations right in the document authoring environment and reveal the scientific methods used.
            </ListItem>
            <ListItem headline='Reproducible figures'>
              The code and data used to generate a figure can be revealed and changed.
            </ListItem>
          </List>
        </Section>
        <Section headline='An open standard for representing reproducible research documents'>
          The creation of an open standard for the exchange, submission and publication of reproducible documents is critical for widespread adoption by academic publishers, and will be beneficial for the discovery and persistence of research reported in this form. Therefore, Substance in collaboration with Stencila is developing an extension to the <Link href='/dar'><a>DAR</a></Link> format, which will allow the data, code and computed outputs (graphs, statistical results, tables) embedded in a reproducible document to be recognised and presented online as an enhanced version of the published research article. In order to do this, we are representing these assets in JATS XML, the publishing standard through which research manuscripts are processed through the publishing workflow.
        </Section>
        <Section headline='Stencila'>
          <Link href='https://stenci.la/'><a>Stencila</a></Link> is an open source platform, which provides easy-to-access computation environments for reproducible documents in the <Link href='/dar'><a>DAR</a></Link> format. Stencila makes reproducibility an integral part of a research publication (with live code execution) rather than attaching supplementary programming notebooks. Stencila however is capable of reading and writing existing well-established notebook formats such as Jupyter, RMarkdown etc.
        </Section>
        <Section headline='Stencila in Texture'>
        Substance is developing a Stencila plugin for Texture, which enables reproducible content types in the editor. It provides a seamless editing experience for both regular text and source code.
        </Section>
        <Section headline='Learn more'>
          <ReadMore href='https://www.nature.com/articles/d41586-019-00724-7' title='Pioneering ‘live-code’ article allows scientists to play with each other’s results' />
          <ReadMore href='https://elifesciences.org/labs/ad58f08d/introducing-elife-s-first-computationally-reproducible-article' title='Introducing eLife‘s first computationally reproducible research' />
          <ReadMore href='https://elifesciences.org/labs/7dbeb390/reproducible-document-stack-supporting-the-next-generation-research-article' title='Reproducible Document Stack - supporting the next generation research article' />
        </Section>
      </Body>
    </Layout>
  )
}

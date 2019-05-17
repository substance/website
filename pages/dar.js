import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'
import { List, ListItem } from '../components/List'
import ReadMore from '../components/ReadMore'

export default function DAR () {
  return (
    <Layout title='DAR'>
      <Teaser title='DAR' headline='A standards-compliant archive format for research.'>
        <div className='se-teaser-image'>
          <img className='se-image' src='/static/images/dar.png' />
        </div>
      </Teaser>
      <Body>
        <Section headline='Why?'>
          <p>Research is currently created using print-oriented file formats such as DOCX or LaTeX. A modern published article however requires structured metadata such as authors, affiliations, references and journal information to be available. Publishers typically make use of the JATS-XML standard to capture that information. As a result a costly and slow conversion process is needed to turn a DOCX submission into structured XML.</p>
          <p>If researchers and publishers could all use a shared file format, documents can be created and shared directly without friction. Furthermore submission, peer-review, editing and author proofing workflows can operate on the same source document, streamlining the entire publication process.</p>
        </Section>
        <Section headline='Introducing DAR'>
          <p>A Document ARchive (.dar) is essentially a zip archive, containing the manuscript as a standard JATS XML file, as well as additional assets such as images and data files. It is built around the following design goals:</p>
          <List>
            <ListItem headline='Standard-compliant'>
              Structured article content are stored as JATS, the de facto standard for archiving and interchange of scientific open-access contents with XML.
            </ListItem>
            <ListItem headline='Machine-readable'>
              DAR is designed for machine readability. This makes it easy for a range of tools to be developed (e.g. PDF conversion, MS Word import/export etc.)
            </ListItem>
            <ListItem headline='Self-contained'>
              All kinds of assets, such as images, data files, additional documents are directly included in a DAR file.
            </ListItem>
          </List>
        </Section>
        <Section headline='Learn more'>
          <ReadMore href='/texture' title='Texture editor' />
          <ReadMore href='https://github.com/substance/dar' title='DAR Technical Specification' />
        </Section>
      </Body>
    </Layout>
  )
}

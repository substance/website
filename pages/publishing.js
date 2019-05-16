import Link from 'next/link'
import Layout from '../components/MyLayout.js'
import Body from '../components/Body.js'
import Section from '../components/Section.js'
import Teaser from '../components/Teaser.js'
import { List, ListItem } from '../components/List.js'
import { FAQ, FAQItem } from '../components/FAQ.js'

export default function Publishing () {
  return (
    <Layout>
      <Teaser title='Journal publishing' headline='Make the switch to DAR and Texture.'>
        <div className='se-teaser-image'>
          <img className='se-image' src='/static/images/texture-cards.png' />
        </div>
      </Teaser>
      <Body>
        <Section headline='The benefits of DAR and Texture'>
          <p>With <Link href='/dar'><a>DAR</a></Link>, a standards-compliant archive format for journal articles and <Link href='/texture'><a >Texture</a></Link>, an open source visual editor for research, we aim to simultaneously streamline workflow processes and significantly reduce production costs at journals. Our editor resembles traditional word processing applications, but operates on an XML document in the background. By enabling a broad set of actors to work directly on the XML manuscript at all stages, Texture removes the need for XML experts and the need for the final content conversion step for which publishers today largely rely on expensive third-party support.</p>
        </Section>
        <Section headline='Enabling a modern end to end publishing workflow'>
          <List>
            <ListItem symbol='1' headline='Submission'>
              Article comes in as a DAR file directly, or it is converted from a DOCX file.
            </ListItem>
            <ListItem symbol='2' headline='Peer-review'>
              Multiple review iterations are done by reviewers and authors using Texture for commenting and re-submission.
            </ListItem>
            <ListItem symbol='3' headline='Initial production'>
              Production staff uses Texture to edit content and metadata of the document.
            </ListItem>
            <ListItem symbol='4' headline='Author proofing'>
              Authors log in at the publisher's website and use Texture to respond to queries, make final changes and approve the article for publication.
            </ListItem>
            <ListItem symbol='5' headline='Final production'>
              Final changes are made to the document by the production staff. A quality checking process is performed using Texture. Now the paper is ready for publication.
            </ListItem>
          </List>
        </Section>
        <Section headline='Advantages'>
          <List>
            <ListItem headline='Visual editing'>
              Full article can be edited in a familiar word processor interface. No longer manual changes to the JATS-XML source have to be made.
            </ListItem>
            <ListItem headline='Automatic formatting and label generation'>
              With Texture, references are formatted automatically. Furthermore, labels cross references,  figures, tables and footnotes are generated automatically. No longer those have to be manually checked.
            </ListItem>
            <ListItem headline='A single source of information'>
              Article is represented in DAR format through the whole publishing process. This makes costly conversion processes obsolete.
            </ListItem>
            <ListItem headline='Parallelised workflow'>
              Article can be received and selected earlier (during draft stage). A first quick review round can be done, and if accepted, the production team can already start with editing the content and metadata. In parallel a second review round can be started to finalise the content.
            </ListItem>
            <ListItem headline='Assisted assignment of IDs'>
              DOI, ORCID, FundRef can be done using the interface supporting a verification process.
            </ListItem>
            <ListItem headline='Semantic tagging of concepts'>
              Concepts, such as gene sequences can be tagged using the interface and even linked with a defined vocabulary.
            </ListItem>
            <ListItem headline='Community-led development'>
              Texture is open source software and development is supported by a consortium of publishers.
            </ListItem>
          </List>
        </Section>
        <Section headline='Frequently Asked Questions'>
          <FAQ>
            <FAQItem question='How can I use Texture at my journal?'>
              <p>Texture can be used stand-alone as a desktop application to read and write .dar files. However, journals can benefit the most from Texture when it is integrated into their journal management system. A journal management system provides an authentication system with permissions, workflows for different stages of the publishing process and an article overview page, the dashboard. Texture on the other hand takes care of all editing needs and can be configured to provide optimised interfaces for submission, production editing, author proofing, etc.</p>
              <p>With <Link href='https://pkp.sfu.ca/ojs'><a>Open Journal System</a></Link> (OJS) there is an existing solution that includes Texture for editing JATS XML articles. Texture has been integrated as a plugin. It activates visual authoring, editing and proofing within the OJS web platform.</p>
              <p>eLife is developing <Link href='https://libero.pub'><a>Libero</a></Link> a novel tool set enabling an end-to-end open source publishing process. Texture is being integrated to support different stages of the production process, including author proofing, production QC and peer review.</p>
              <p>Please <Link href='/contact'><a>contact us</a></Link> so we can discuss how a solution for your journal could look like.</p>
            </FAQItem>
            <FAQItem question='I’m missing a feature, how can I contribute?'>
              <p>At first please have a look at the existing <Link href='https://github.com/substance/texture/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request'><a>feature requests</a></Link> on Github. It’s likely your desired feature is already on the roadmap. If not, you can file a new feature request ticket. Please carefully follow the guidelines outlined in the template, it’s important to have correct user stories attached, so we are able to come up with a solution proposal quickly. Don’t hesitate to contact us, and we will explain you how the entire process works to</p>
            </FAQItem>
            <FAQItem question='How can I edit my existing JATS files?'>
              <p>In order to open a file in Texture it needs to be represented as a <Link href='/dar'><a>DAR</a></Link> file. The article contents are stored in a file manuscript.xml, that follows a stricter schema of JATS, called TextureJATS, which serves as a pure source format, optimised for machine readability. In order to make your existing files conform to that schema, you may need to provide a conversion step, which is usually trivial but necessary, since every journal uses a slightly different flavour of JATS. Please <Link href='/contact'><a>contact us</a></Link> to learn how a converter can be set up for your journal.</p>
            </FAQItem>
            <FAQItem question='Can I export a PDF version?'>
              <p>No, PDF Export is not a part of the Texture editor. Journals typically have different PDF layouts and most of them have a typesetting solution already, based on the JATS XML file.</p>
            </FAQItem>
          </FAQ>
        </Section>
      </Body>
    </Layout>
  )
}

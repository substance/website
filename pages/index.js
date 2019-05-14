import Layout from '../components/MyLayout.js'
import Body from '../components/Body.js'
import Teaser from '../components/Teaser.js'
import Link from 'next/link'

export default function Index () {
  return (
    <Layout>
      <Teaser headline='Substance fills the gap between writing and publishing research.'>
        <div className='se-main-figure'>
          <div className='se-circle'>Authors</div>
          <img className='se-logo-sign' src='/static/images/substance-sign.svg' height='75' />
          <div className='se-circle'>Publishers</div>
        </div>
      </Teaser>
      <Body>
        <h1 className='se-section-title'>Why?</h1>
        <p>We help rethink and redesign how people create and share scientific results. Because we believe anybody should be enabled to become a researcher and share their discoveries with ease.</p>
        <p>Much time and resources are spent to turn a submitted manuscript into a publication, due to incompatible formats, tools, and guidelines. It often takes many months until the content becomes available for readers.</p>
        <p>Substance helps bringing researchers and journals closer together to collaborate more efficiently. To achieve that, we are introducing <a href='/dar'>DAR</a>, a standard-compliant format to represent scientific publications and <a href='/texture'>Texture</a>, an open source editor that can be used for authoring, reviewing and copy-editing of web-first scientific publications. We believe that ultimately, this will lead to faster and more frequent sharing of results, as well as enabling a lively public discussion.</p>

        <h1 className='se-section-title'>How can we help you?</h1>
        <div className='se-main-help sm-columns'>
          <div className='se-col'>
            <div className='se-label'>For authors</div>
            <div className='se-title'>Create modern web <br />publications</div>
            <div className='se-description'>
              Use Texture to create <br />web-ready publications without worrying <br />about formatting, citation styles and other <br />submission guidelines.
            </div>
            <div className='se-coming-soon'>coming soon</div>
          </div>
          <div className='se-col'>
            <div className='se-label'>For publishers</div>
            <div className='se-title'>Modernise your <br />journal</div>
            <div className='se-description'>
              Make the switch to DAR and Texture <br />at your journal and increase the <br />speed and quality of your <br />production workflow.
            </div>
            <div className='se-read-more'><a href='/dar'>Learn more</a></div>
          </div>
        </div>
      </Body>
    </Layout>
  )
}

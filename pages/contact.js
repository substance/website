import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'

export default function Contact () {
  return (
    <Layout title='Contact' activeMenu='company'>
      <Teaser title='Contact' />
      <Body>
        <Section headline='Email'>
          <div className='sm-centered'>Please contact us via <a href='mailto:info@substance.io'>info@substance.io</a>.</div>
        </Section>
        <Section headline='Our office'>
          <p className='sm-centered'>Substance Software GmbH<br />
          Harrachstrasse 28<br />
          4020 Linz, Austria</p>
          <p className='sm-centered'>Substance Software GmbH is registered in Linz, No. FN 408728x<br />
          VAT Reg.No.: ATU68395257</p>
        </Section>
      </Body>
    </Layout>
  )
}

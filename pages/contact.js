import Body from '../components/Body'
import Layout from '../components/Layout'

export default function Contact () {
  return (
    <Layout title='Contact'>
      <Body>
        <div className='se-teaser'>
          <h1 className='se-title'>Contact</h1>
          <div className='sm-centered'>Please contact us via <a className='sm-email' href='mailto:team@substance.io'>team@substance.io</a>.</div>
          <h1 className='se-title'>Our office</h1>
          <p className='sm-centered'>Substance Software GmbH<br />
          Mozartstraße 56<br />
          4020 Linz, Austria</p>
          <p className='sm-centered'>Substance Software GmbH is registered in Linz, No. FN 408728x<br />
          VAT Reg.No.: ATU68395257</p>
        </div>
      </Body>
    </Layout>
  )
}

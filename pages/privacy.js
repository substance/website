import Layout from '../components/Layout'
import Body from '../components/Body'
import Section from '../components/Section'
import Teaser from '../components/Teaser'

export default function Privacy () {
  return (
    <Layout title='Privacy Policy'>
      <Teaser title='Privacy Policy' />
      <Body>
        <Section>
          <p>We do not collect, store, or share any personally identifiable user data, except what you voluntarily give to us via email or other direct contact from you. We will not sell or rent this information to anyone.</p>
          <p>We do collect IP addresses in our server logs, as well as information like your internet domain, the date and time of your visit, and the pages you access on substance.io. This information is collected solely for diagnostic and analytic purposes. We do not share any identifiable information about this information at any time, and use this information internally and only to better assess the services provided through substance.io.</p>
        </Section>
      </Body>
    </Layout>
  )
}

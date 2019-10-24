import Link from 'next/link'
import Layout from '../components/Layout'
import Body from '../components/Body'

export default function Index () {
  return (
    <Layout>
      <Body>
        <div className='se-badge'>Coming soon</div>
        <h1 className='se-title'>Purposeful writing</h1>
        <div className='se-teaser'>
          <p className='sm-centered'>We believe that you can make a difference in the world by expressing your ideas using words.</p>
          <p className='sm-centered'>Our mission is to remove the obstacles on the way. Writing together can be as seamless as writing alone. We are building Substance so you can “just write” and focus on what you want to say, and nothing else.</p>
          <p className='se-story sm-centered'>
            <Link href='https://medium.com/@_mql/the-fox-a-story-about-writing-a-story-a20f21492301'>
              <a><i className='fas fa-long-arrow-alt-right' /> Read the story</a>
            </Link>
          </p>
        </div>
        <div className='se-follow-us sm-centered'>
          Follow us on <Link href='https://twitter.com/_substance'><a>Twitter</a></Link> for updates.
        </div>
      </Body>
    </Layout>
  )
}

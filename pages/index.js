import Layout from '../components/MyLayout.js'
import Body from '../components/Body.js'
import Teaser from '../components/Teaser.js'
import Link from 'next/link'

function PostLink (props) {
  return (
    <li>
      <Link as={`/p/${props.id}`} href={`/post?title=${props.title}`}>
        <a>{props.title}</a>
      </Link>
    </li>
  )
}

export default function Index () {
  return (
    <Layout>
      <Teaser headline='Substance fills the gap between writing and publishing research.'>
        SPLASH_IMAGE
      </Teaser>
      <Body>
        <h1>My Blog</h1>
        <ul>
          <PostLink id='hello-nextjs' title='Hello Next.js' />
          <PostLink id='learn-nextjs' title='Learn Next.js is awesome' />
          <PostLink id='deploy-nextjs' title='Deploy apps with Zeit' />
        </ul>
      </Body>
    </Layout>
  )
}

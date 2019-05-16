import Link from 'next/link'

export default function ReadMore (props) {
  return (
    <div className='sc-read-more'>
      <Link href={props.href}>
        <a><i className='fa fa-long-arrow-alt-right' />{props.title}</a>
      </Link>
    </div>
  )
}

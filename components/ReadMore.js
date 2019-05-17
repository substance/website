import Link from 'next/link'

export default function ReadMore (props) {
  return (
    <div className='sc-read-more'>
      <Link href={props.href}>
        <a>
          <div className='se-link-title'>
            {props.title}
          </div>
          <div className='se-link-sign'>
            <i className='fa fa-long-arrow-alt-right' />
          </div>
        </a>
      </Link>
    </div>
  )
}

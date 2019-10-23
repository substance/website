import Link from 'next/link'

export default function Footer () {
  return (
    <div className='sc-footer'>
      <div className='se-footer-container'>
        <div className='se-footer-second-menu'>
          <div className='se-copyright-menu'>
            <div className='se-item'>
              © {new Date().getFullYear()} Substance
            </div>
            <div className='se-item'><Link href='/contact'><a>Contact</a></Link></div>
          </div>
          <div className='sm-spacer' />
          <div className='se-social-menu'>
            <div className='se-social-item'>
              <a href='https://github.com/substance'>
                <i className='fab fa-github-alt' />
              </a>
            </div>
            <div className='se-social-item'>
              <a href='https://twitter.com/_substance'>
                <i className='fab fa-twitter' />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

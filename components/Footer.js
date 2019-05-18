import Link from 'next/link'

export default function Footer () {
  return (
    <div className='sc-footer'>
      <div className='se-footer-container'>
        <div className='se-footer-menu sm-columns'>
          <div className='se-col'>
            <div className='sc-substance-logo sm-inverted'>
              <Link href='/'>
                <a><img src='/static/images/substance-logo.svg' /></a>
              </Link>
            </div>
          </div>
          <div className='se-col'>
            <div className='se-nav-header'>Products</div>
            <div className='se-nav-item'><Link href='/texture'><a>Texture</a></Link></div>
            <div className='se-nav-item'><Link href='/dar'><a>DAR</a></Link></div>
            <div className='se-nav-item'><Link href='https://github.com/substance/substance'><a>Substance.js</a></Link></div>
          </div>
          <div className='se-col'>
            <div className='se-nav-header'>Solutions</div>
            <div className='se-nav-item'><Link href='/publishing'><a>Journal Publishing</a></Link></div>
            <div className='se-nav-item'><Link href='/repro-docs'><a>Reproducible Documents</a></Link></div>
          </div>
          <div className='se-col'>
            <div className='se-nav-header'>Company</div>
            <div className='se-nav-item'><Link href='/story'><a>Our Story</a></Link></div>
            <div className='se-nav-item'><Link href='/consortium'><a>Consortium</a></Link></div>
            <div className='se-nav-item'><Link href='/contact'><a>Contact</a></Link></div>
          </div>
        </div>
        <div className='se-footer-second-menu'>
          <div className='se-copyright-menu'>
            <div className='se-item'>
              © {new Date().getFullYear()} Substance
            </div>
            <div className='se-item'><Link href='/terms'><a>Terms</a></Link></div>
            <div className='se-item'><Link href='/privacy'><a>Privacy</a></Link></div>
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

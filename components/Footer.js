import Link from 'next/link'

export default function Footer () {
  return (
    <div className='sc-footer'>
      <div className='se-footer-container'>
        <div className='se-footer-menu sm-columns'>
          <div className='se-col'>
            <div className='sc-substance-logo sm-inverted'>
              <Link href='/'>
                <a><img src='/static/images/substance-logo.svg' width='130' /></a>
              </Link>
            </div>
          </div>
          <div className='se-col'>
            <div className='nav-header'>Products</div>
            <div className='nav-item'><Link href='/texture'><a>Texture</a></Link></div>
            <div className='nav-item'><Link href='/dar'><a>DAR</a></Link></div>
            <div className='nav-item'><Link href='/substance-js'><a>Substance.js</a></Link></div>
          </div>
          <div className='se-col'>
            <div className='nav-header'>Solutions</div>
            <div className='nav-item'><Link href='/publishing'><a>Journal Publishing</a></Link></div>
            <div className='nav-item'><Link href='/repro-docs'><a>Reproducible Documents</a></Link></div>
          </div>
          <div className='se-col'>
            <div className='nav-header'>Company</div>
            <div className='nav-item'><Link href='/story'><a>Our Story</a></Link></div>
            <div className='nav-item'><Link href='/contact'><a>Contact</a></Link></div>
          </div>
        </div>
        <div className='se-footer-second-menu'>
          <div className='item'>
            ©{new Date().getFullYear()} Substance
          </div>
          <div className='item'><Link href='/terms'><a>Terms</a></Link></div>
          <div className='item'><Link href='/privacy'><a>Privacy</a></Link></div>
          <div className='sm-spacer' />
          <div className='social-item'>
            <a href='https://github.com/substance'>
              <i className='fab fa-github-alt' />
            </a>
          </div>
          <div className='social-item'>
            <a href='https://twitter.com/_substance'>
              <i className='fab fa-twitter' />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

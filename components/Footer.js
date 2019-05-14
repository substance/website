import Link from 'next/link'

export default function Footer () {
  return (
    <div className='sc-footer'>
      <div className='se-footer-container'>
        <div className='se-footer-menu sm-columns'>
          <div className='se-col'>
            <div className='sc-substance-logo'>
              <Link href='/'>
                <a><img src='/static/images/substance-logo.svg' width='130' /></a>
              </Link>
            </div>
          </div>
          <div className='se-col'>
            <div className='nav-header'>Products</div>
            <div className='nav-item'><a href='/texture'>Texture</a></div>
            <div className='nav-item'><a href='/dar'>DAR</a></div>
            <div className='nav-item'><a href='/substance-js'>Substance.js</a></div>
          </div>
          <div className='se-col'>
            <div className='nav-header'>Solutions</div>
            <div className='nav-item'><a href='/publishing'>Journal Publishing</a></div>
            <div className='nav-item'><a href='/repro-docs'>Reproducible Documents</a></div>
          </div>
          <div className='se-col'>
            <div className='nav-header'>Company</div>
            <div className='nav-item'><a href='/story'>Our Story</a></div>
            <div className='nav-item'><a href='/contact'>Contact</a></div>
          </div>
        </div>
        <div className='se-footer-second-menu'>
          <div className='item'>
            ©{new Date().getFullYear()} Substance
          </div>
          <div className='item'><a href='/terms'>Terms</a></div>
          <div className='item'><a href='/privacy'>Privacy</a></div>
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

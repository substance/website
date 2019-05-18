import Link from 'next/link'
import { Component } from 'react'

function SubstanceLogo (props) {
  return (
    <div className={'sc-substance-logo ' + (props.inverted ? 'sm-inverted' : '')}>
      <Link href='/'>
        <a><img src='/static/images/substance-logo.svg' height='30' /></a>
      </Link>
    </div>
  )
}

function SubstanceMenu () {
  return (
    <div className='sc-menu'>
      <div className='sc-menu-link'>
        <a href='#' className='se-menu-link'>Products</a>
        <div className='sc-menu-popover'>
          <div className='se-nav-header'>Products</div>
          <div className='se-nav-item'><Link href='/texture'><a>Texture</a></Link></div>
          <div className='se-nav-item'><Link href='/dar'><a>DAR</a></Link></div>
          <div className='se-nav-item'><Link href='https://github.com/substance/substance'><a>Substance.js</a></Link></div>
        </div>
      </div>
      <div className='sc-menu-link'>
        <a href='#' className='se-menu-link'>Solutions</a>
        <div className='sc-menu-popover'>
          <div className='se-nav-header'>Solutions</div>
          <div className='se-nav-item'><Link href='/publishing'><a>Journal Publishing</a></Link></div>
          <div className='se-nav-item'><Link href='/repro-docs'><a>Reproducible Documents</a></Link></div>
        </div>
      </div>
      <Link href='/story'>
        <a className='sc-menu-link'>Our Story</a>
      </Link>
      <Link href='/contact'>
        <a className='sc-menu-link'>Contact</a>
      </Link>
    </div>
  )
}

function SubstanceMobileMenu () {
  return (
    <div className='sc-menu'>
      <div className='se-first-row sm-columns'>
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
      </div>
      <div className='sm-divider' />
      <div className='se-second-row sm-columns'>
        <div className='se-col'>
          <div className='se-nav-item'><Link href='/story'><a>Our Story</a></Link></div>
          <div className='se-nav-item'><Link href='/terms'><a>Terms</a></Link></div>
        </div>
        <div className='se-col'>
          <div className='se-nav-item'><Link href='/contact'><a>Contact</a></Link></div>
          <div className='se-nav-item'><Link href='/privacy'><a>Privacy</a></Link></div>
        </div>
      </div>
    </div>
  )
}

export default class Header extends Component {
  constructor () {
    super()
    this.state = {
      expanded: false
    }
  }

  toggleMobileMenu () {
    const expanded = this.state.expanded
    this.setState({ expanded: !expanded })
  }

  render () {
    const { props, state } = this
    return (
      <div className={'sc-header ' + (state.expanded ? 'sm-expanded' : '')}>
        <div className='se-header-container'>
          <div className='se-header-navbar'>
            <SubstanceLogo inverted={state.expanded} />
            <div className='sm-spacer' />
            {props.isMobile ? (
              <div className='se-hamburger' onClick={this.toggleMobileMenu.bind(this)}><i className='fa fa-bars' /></div>
            ) : (
              <SubstanceMenu />
            )}
          </div>
          {(() => {
            if (state.expanded) {
              return <SubstanceMobileMenu />
            }
          })()}
        </div>
      </div>
    )
  }
}

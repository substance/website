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
      <Link href='/products'>
        <a className='sc-menu-link'>Products</a>
      </Link>
      <Link href='/about'>
        <a className='sc-menu-link'>Showcases</a>
      </Link>
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
      <Link href='/products'>
        <a className='sc-menu-link'>Products</a>
      </Link>
      <Link href='/about'>
        <a className='sc-menu-link'>Showcases</a>
      </Link>
      <Link href='/story'>
        <a className='sc-menu-link'>Our Story</a>
      </Link>
      <Link href='/contact'>
        <a className='sc-menu-link'>Contact</a>
      </Link>
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
      <div className='sc-header'>
        <div className='se-header-container'>
          <div className='se-header-navbar'>
            <SubstanceLogo />
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

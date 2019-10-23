import Link from 'next/link'
import { Component } from 'react'

function SubstanceLogo (props) {
  return (
    <div className='sc-substance-logo sm-inverted'>
      <Link href='/'>
        <a><img src='/static/images/substance-logo.svg' height='32' /></a>
      </Link>
    </div>
  )
}

export default class Header extends Component {
  render () {
    const props = this.props
    return (
      <div className='sc-header'>
        <div className='se-header-container'>
          <div className='se-header-navbar'>
            <SubstanceLogo inverted={props.expanded} />
          </div>
        </div>
      </div>
    )
  }
}

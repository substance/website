import Link from 'next/link'

function SubstanceLogo () {
  return (
    <div className='sc-substance-logo'>
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
      <Link href='/about'>
        <a className='sc-menu-link'>Our Story</a>
      </Link>
      <Link href='/about'>
        <a className='sc-menu-link'>Contact</a>
      </Link>
    </div>
  )
}

export default function Header () {
  return (
    <div className='sc-header'>
      <div className='se-header-container'>
        <SubstanceLogo />
        <SubstanceMenu />
      </div>
    </div>
  )
}

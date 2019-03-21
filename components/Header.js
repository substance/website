import Link from 'next/link'

function SubstanceLogo() {
  return (
    <div className="sc-substance-logo">
      LE SUBSTANCE LOGO
    </div>
  )
}

function SubstanceMenu() {
  return (
    <div className="sc-menu">
      <Link href="/">
        <a className="sc-menu-link">Products</a>
      </Link>
      <Link href="/about">
        <a className="sc-menu-link">Showcases</a>
      </Link>
      <Link href="/about">
        <a className="sc-menu-link">Our Story</a>
      </Link>
      <Link href="/about">
        <a className="sc-menu-link">Contact</a>
      </Link>
    </div>
  )
}

export default function Header() {
  return (
    <div className="sc-header">
      <div className="sc-header-content">
        <SubstanceLogo></SubstanceLogo>
        <SubstanceMenu></SubstanceMenu>
      </div>
    </div>
  )
}

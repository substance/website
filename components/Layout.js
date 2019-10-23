import Head from 'next/head'
import { Component } from 'react'
import Header from './Header'
import Footer from './Footer'
import '../styles/styles.css'
import 'reset-css/reset.css'

export default class Layout extends Component {
  constructor () {
    super()
    this.state = {
      isMobile: false,
      menuExpanded: false
    }
  }

  componentDidMount () {
    this.handleWindowSizeChange()
    window.addEventListener('resize', this.handleWindowSizeChange.bind(this))
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleWindowSizeChange.bind(this))
  }

  handleWindowSizeChange () {
    this.setState({ isMobile: window.innerWidth < 640 })
  }

  render () {
    const { props, state } = this
    return (
      <div className={'sc-layout ' + (state.isMobile ? 'sm-mobile' : '')}>
        <Head>
          <title>{props.title ? props.title + ' • Substance' : 'Substance'}</title>
          <meta charSet='utf-8' />
          <meta name='viewport' content='initial-scale=1.0, width=device-width' />
          <meta name='description' content='Purposeful writing' />
          <link rel='shortcut icon' href='/static/images/favicon.ico' type='image/x-icon' />
        </Head>
        <Header isMobile={state.isMobile} ref='header' />
        {props.children}
        <Footer />
      </div>
    )
  }
}

import { Component } from 'react'
import Header from './Header'
import Footer from './Footer'
import '../styles/styles.css'
import 'reset-css/reset.css'

export default class Layout extends Component {
  constructor () {
    super()
    this.state = {
      isMobile: false
    }
  }

  componentDidMount () {
    this.handleWindowSizeChange()
    window.addEventListener('resize', this.handleWindowSizeChange.bind(this))
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleWindowSizeChange)
  }

  handleWindowSizeChange () {
    this.setState({ isMobile: window.innerWidth < 640 })
  }

  render () {
    const { props, state } = this
    return (
      <div className={'sc-layout ' + (state.isMobile ? 'sm-mobile' : '')}>
        <Header isMobile={state.isMobile} />
        {props.children}
        <Footer />
      </div>
    )
  }
}

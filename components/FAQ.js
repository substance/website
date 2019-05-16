import { Component } from 'react'

export class FAQItem extends Component {
  state = {
    opened: false
  }
  
  render () {
    const { props, state } = this
    return (
      <div className='sc-faq-item'>
        <div className='se-faq-item-header' onClick={this.toggle.bind(this)}>
          <div className='se-faq-item-question'>
            {props.question}
          </div>
          <div className='se-faq-item-sign'>
            <i className={'fa fa-' + (this.state.opened ? 'minus' : 'plus')} />
          </div>
        </div>
        <div className={'se-faq-item-content ' + (this.state.opened ? 'sm-opened' : '')}>
          {props.children}
        </div>
      </div>
    )
  }

  toggle () {
    const opened = this.state.opened
    this.setState({ opened: !opened })
  }
}

export function FAQ (props) {
  return (
    <div className='sc-faq'>
      {props.children}
    </div>
  )
}

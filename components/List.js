export function ListItem (props) {
  return (
    <div className='sc-list-item'>
      <div className='se-list-item-symbol'>
        {(() => {
          if (props.symbol !== undefined) {
            return props.symbol
          } else {
            return <i className='fa fa-check-circle' />
          }
        })()}
      </div>
      <div className='se-list-item-content'>
        <div className='se-list-item-headline'>
          {props.headline}
        </div>
        <div className='se-list-item-text'>
          {props.children}
        </div>
      </div>
    </div>
  )
}

export function List (props) {
  return (
    <div className='sc-list'>
      {props.children}
    </div>
  )
}

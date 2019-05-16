export function Card (props) {
  return (
    <div className='sc-card se-col'>
      <div className='se-card-title'>
        {props.title}
      </div>
      <div className='se-card-content'>
        {props.children}
      </div>
    </div>
  )
}

export function Cards (props) {
  return (
    <div className='sc-cards sm-columns'>
      {props.children}
    </div>
  )
}

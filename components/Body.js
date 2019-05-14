export default function Body (props) {
  return (
    <div className='sc-body'>
      <div className='se-body-container'>
        {props.children}
      </div>
    </div>
  )
}

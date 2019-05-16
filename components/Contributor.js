export default function Contributor (props) {
  return (
    <div className='sc-contributor'>
      <div className='se-story'>
        {props.children}
      </div>
      <div className='se-image'>
        <img src={'/static/images/contributors/' + props.img} />
      </div>
    </div>
  )
}

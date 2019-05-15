
export default function Section (props) {
  return (
    <div className='sc-section'>
      <h1 className='se-section-headline'>
        {props.headline}
      </h1>
      <div className='se-section-content'>
        {props.children}
      </div>
    </div>
  )
}

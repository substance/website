
export default function Teaser(props) {
  return (
    <div className="sc-teaser">
      <div className="se-teaser-container">
        <div className="se-teaser-headline">
          {props.headline}
        </div>
        <div className="se-teaser-content">
          {props.children}
        </div>
      </div>
    </div>
  )
}

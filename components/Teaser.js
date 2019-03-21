
export default function Teaser(props) {
  return (
    <div className="sc-teaser">
      <div className="se-teaser-headline">
        
      </div>
      <div className="se-teaser-content">
        {props.children}
      </div>
      <style jsx>{`
      .sc-teaser {
        color: #fff;
      }
      .se-teaser-headline {
        
      }
    `}</style>
    </div>
  )
}

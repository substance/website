const PARTNERS = [
  {
    title: 'Collaborative Knowledge Foundation',
    url: 'https://coko.foundation',
    logo: 'coko-logo.png',
    texture: false
  }, {
    title: 'Shuttleworth Foundation',
    url: 'https://shuttleworthfoundation.org',
    logo: 'shuttleworth-logo.png',
    texture: false
  }, {
    title: 'Stencila',
    url: 'https://stenci.la',
    logo: 'stencila-logo.png',
    texture: false
  }, {
    title: 'Infomaker',
    url: 'https://infomaker.se',
    logo: 'infomaker-logo.png',
    texture: false
  }, {
    title: 'eLife Sciences Publications',
    url: 'https://elifesciences.org',
    logo: 'elife-logo.png',
    texture: true
  }, {
    title: 'Érudit Consortium',
    url: 'https://erudit.org',
    logo: 'erudit-logo.png',
    texture: true
  }, {
    title: 'SciELO',
    url: 'https://scielo.org',
    logo: 'scielo-logo.png',
    texture: true
  }, {
    title: 'Public Knowledge Project',
    url: 'https://pkp.sfu.ca',
    logo: 'pkp-logo.png',
    texture: true
  }, {
    title: 'HighWire Press',
    url: 'https://highwirepress.com',
    logo: 'highwire-logo.png',
    texture: true
  }, {
    title: 'University of California Curation Center',
    url: 'https://www.cdlib.org/services/uc3/index.html',
    logo: 'uc3-logo.png',
    texture: false
  }, {
    title: 'EMBO',
    url: 'https://embo.org',
    logo: 'embo-logo.png',
    texture: true
  }, {
    title: 'SourceData',
    url: 'https://sourcedata.embo.org',
    logo: 'sourcedata-logo.png',
    texture: true
  }
]

function PartnerLogo (props) {
  return (
    <div className='sc-partner-logo'>
      <a href={props.partner.url} title={props.partner.title} target='_blank'><img src={'/static/images/partners/' + props.partner.logo} /></a>
    </div>
  )
}

export default function Partners (props) {
  const partnersData = props.texture ? PARTNERS.filter(p => p.texture) : PARTNERS
  return (
    <div className='sc-partners'>
      {partnersData.map((p, key) =>
        <PartnerLogo partner={p} key={key} />
      )}
    </div>
  )
}

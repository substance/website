import Header from './Header'
import Footer from './Footer'
import '../styles/styles.css'
import 'reset-css/reset.css'

export default function Layout (props) {
  return (
    <div className='sc-layout'>
      <Header />
      {props.children}
      <Footer />
    </div>
  )
}

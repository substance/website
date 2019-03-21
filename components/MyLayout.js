import Header from './Header'
import Footer from './Footer'
import '../styles/styles.css'
import 'inter-ui/inter.css'
import 'reset-css/reset.css'

export default function Layout(props) {
  return (
    <div className="sc-layout">
      <Header></Header>
      {props.children}
      <Footer></Footer>
    </div>
  )
} 

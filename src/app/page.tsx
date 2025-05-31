
import Hero from './components/Hero'
import Footer from './components/Footer'
import MoreInfo from './components/MoreInfo';
import Account from './components/Account';


import Detail from './components/Detail';
import About from './about/page';


export default function Home() {
  return (
    <div>
   
    <Hero />
   
      <MoreInfo/>
      <Account/>
      <Detail />
      <Footer/>
    </div>
  );
}

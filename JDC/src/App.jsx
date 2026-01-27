import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Vehicles from './Pages/Vehicles'
import VehicleDetail from './Pages/VehicleDetail'
import TradeIn from './Pages/TradeIn'
import Contact from './Pages/Contact'
import Administrative from './Pages/Administrative'
import Layout from './Components/Layout'
import ScrollToTop from './Components/ScrollToTop'
import { Toaster } from './ui/sonner'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/vehicle-detail" element={<VehicleDetail />} />
          <Route path="/trade-in" element={<TradeIn />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/administrative" element={<Administrative />} />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  )
}

export default App

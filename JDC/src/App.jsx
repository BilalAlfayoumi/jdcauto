import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './Pages/Home'
import Vehicles from './Pages/Vehicles'
import VehicleDetail from './Pages/VehicleDetail'
import TradeIn from './Pages/TradeIn'
import Contact from './Pages/Contact'
import Administrative from './Pages/Administrative'
import AdminLanding from './Pages/AdminLanding'
import AdminVehicles from './Pages/AdminVehicles'
import AdminCarteGrise from './Pages/AdminCarteGrise'
import MentionsLegales from './Pages/MentionsLegales'
import CGV from './Pages/CGV'
import PolitiqueConfidentialite from './Pages/PolitiqueConfidentialite'
import Layout from './Components/Layout'
import AdminErrorBoundary from './Components/AdminErrorBoundary'
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
          <Route path="/admin" element={<AdminErrorBoundary><AdminLanding /></AdminErrorBoundary>} />
          <Route path="/admin/vehicles" element={<AdminErrorBoundary><AdminVehicles /></AdminErrorBoundary>} />
          <Route path="/admin/carte-grise" element={<AdminErrorBoundary><AdminCarteGrise /></AdminErrorBoundary>} />
          <Route path="/mentions-legales" element={<MentionsLegales />} />
          <Route path="/cgv" element={<CGV />} />
          <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
        </Routes>
      </Layout>
      <Toaster />
    </BrowserRouter>
  )
}

export default App

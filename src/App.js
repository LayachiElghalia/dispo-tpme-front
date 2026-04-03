// src/App.js
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';


import './Styles/globales.css';


import NavBar  from './Components/NavBar.jsx';
import Footer  from './Components/Footer.jsx';


import Acceuil     from './Components/Acceuil.jsx';
import Eligibilite from './Components/Eligibilite.jsx';
import CalculateurPrimes from './Components/CalculateurPrimes.jsx';
import Dossier     from './Components/Dossier.jsx';
import PrivateRoute from "./Components/PrivateRoute.jsx";
import Login from "./Components/Login.jsx";
import Register from "./Components/Register";
import { AuthProvider } from "./context/AuthContext.jsx";
import OAuth2RedirectHandler from "./Components/OAuth2RedirectHandler.jsx";
import Dashboard from './Components/Dashboard.jsx';
import VisitorDashboard from './Components/Visitordashboard.jsx';
import VisitorLogin from './Components/VisitorLogin.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <NavBar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"            element={<Acceuil />} />
            <Route path="/eligibilite" element={<Eligibilite />} />
            <Route path="/simulateur"   element={<CalculateurPrimes />} />
            <Route path="/dossier"     element={<Dossier />} />

            {/* Pages à venir */}
            <Route path="/etapes"  element={<Navigate to="/" replace />} />
            <Route path="/cri"     element={<Navigate to="/" replace />} />
            <Route path="/espace"  element={<Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/visitorques" element={<VisitorDashboard />} />
            <Route path="/visitorlogin" element={<VisitorLogin />} />
            

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />

             <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

           {/* Protected routes */}
          <Route path="/" element={
            <PrivateRoute><Acceuil /></PrivateRoute>
          } />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
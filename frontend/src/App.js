import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Auth from './user/signin';
import MainPage from './components/dashboard';
import { UserProvider } from './UserContext';
import './App.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import TaskSharePage from './components/sharetask';
import Settings from './pages/settings';
import Analytics from './pages/analytics';
import Sidebar from './components/sidebar';


function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}

function AppContent() {
  const location = useLocation();

  return (
    <div style={{ display: 'flex' }}>

      {location.pathname !== '/' && !location.pathname.startsWith('/share') && <Sidebar />}
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/board" element={<MainPage />} />
          <Route path="/share/:taskId" element={<TaskSharePage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </div>
  );
}



export default App;

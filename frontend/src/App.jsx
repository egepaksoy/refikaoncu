import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';
import ProjectDetail from './pages/ProjectDetail';
import PublicLayout from './pages/PublicLayout'; // Layout'u ekledik

function App() {
  const basename = window.location.pathname.startsWith('/refikacom') ? '/refikacom' : '/';

  return (
    <Router basename={basename}>
      <Routes>
        
        {/* Ziyaretçilerin göreceği sayfalar PublicLayout iskeleti içinde çalışır */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Resume />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
        </Route>
        
        {/* Yönetim sayfaları Layout'un dışında, kendi hallerindedir */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
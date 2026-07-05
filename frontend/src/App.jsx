import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';
import ProjectDetail from './pages/ProjectDetail';
import PublicLayout from './pages/PublicLayout'; // Layout'u ekledik

function App() {
  const getBasename = () => {
    const path = window.location.pathname;
    if (path === '/' || !window.location.hostname.endsWith('.github.io')) {
      return '/';
    }
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? `/${segments[0]}` : '/';
  };

  const basename = getBasename();

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
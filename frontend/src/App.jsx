import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Resume from './pages/Resume';

function App() {
  return (
    <Router>
      <Routes>
        {/* Sitenin ana sayfası artık Özgeçmiş ekranı */}
        <Route path="/" element={<Resume />} />
        
        {/* İleride yapacağımız public projeler sayfası (Şimdilik boş kalabilir) */}
        <Route path="/projects" element={<div style={{textAlign: 'center', marginTop: '50px'}}>Projeler sayfası yapım aşamasında...</div>} />
        
        {/* Yönetim ve Giriş rotaları */}
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
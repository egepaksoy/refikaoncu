import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // FastAPI'nin OAuth2 yapısı istekleri Form Data olarak bekler
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch('http://127.0.0.1:8000/token', {
        method: 'POST',
        body: formData, // Form verisini gönderiyoruz
      });

      if (response.ok) {
        const data = await response.json();
        // Backend'den gelen dijital anahtarı tarayıcı hafızasına kaydediyoruz
        localStorage.setItem('token', data.access_token);
        alert('Giriş Başarılı!');
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Giriş yapılamadı.');
      }
    } catch (err) {
      setError('Backend sunucusuna bağlanılamadı. Sunucunun açık olduğundan emin olun.');
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2>Yönetici Giriş Portalı</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', width: '300px', margin: '0 auto' }}>
        <input 
          type="text" 
          placeholder="Kullanıcı Adı" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={{ marginBottom: '10px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <input 
          type="password" 
          placeholder="Şifre" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ marginBottom: '15px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          required
        />
        <button type="submit" style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px' }}>
          Güvenli Giriş Yap
        </button>
      </form>
    </div>
  );
}
import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link, useLocation } from 'react-router-dom';

export default function Resume() {
  const [resumeData, setResumeData] = useState({ bio: '', education: [] });
  const [loading, setLoading] = useState(true);
  
  // Ekran genişliğini takip eden state (768px altı mobil kabul edilir)
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();

  useEffect(() => {
    // Ekran boyutu değiştiğinde isMobile durumunu güncelle
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/public/resume');
        if (response.ok) {
          const data = await response.json();
          setResumeData(data);
        }
      } catch (error) {
        console.error("Veri çekilirken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResume();
  }, []);

  // Menü linkleri için mobil uyumlu zarif stil ayarlaması
  const linkStyle = (path) => ({
    display: isMobile ? 'inline-block' : 'block',
    padding: isMobile ? '10px 15px' : '12px 20px',
    color: location.pathname === path ? '#E0A96D' : '#bdc3c7',
    textDecoration: 'none',
    fontSize: isMobile ? '15px' : '18px',
    letterSpacing: '1px',
    // Mobilde alt çizgi, masaüstünde sol çizgi vurgusu
    borderLeft: !isMobile && location.pathname === path ? '4px solid #E0A96D' : (!isMobile ? '4px solid transparent' : 'none'),
    borderBottom: isMobile && location.pathname === path ? '3px solid #E0A96D' : (isMobile ? '3px solid transparent' : 'none'),
    backgroundColor: location.pathname === path ? 'rgba(224, 169, 109, 0.05)' : 'transparent',
    transition: 'all 0.3s ease',
    marginBottom: isMobile ? '0' : '10px',
    marginRight: isMobile ? '10px' : '0',
    borderRadius: isMobile ? '4px 4px 0 0' : '0'
  });

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      minHeight: '100vh', 
      backgroundColor: '#FDFBF9', 
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" 
    }}>
      
      {/* Menü Alanı (Masaüstünde Sidebar, Mobilde Header) */}
      <aside style={{ 
        width: isMobile ? '100%' : '280px', 
        backgroundColor: '#1B263B', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        position: isMobile ? 'relative' : 'fixed', 
        height: isMobile ? 'auto' : '100vh',
        boxShadow: isMobile ? '0 4px 10px rgba(0,0,0,0.1)' : '4px 0 15px rgba(0,0,0,0.1)',
        zIndex: 10
      }}>
        <div style={{ padding: isMobile ? '30px 20px 10px' : '50px 30px', textAlign: 'center' }}>
          <div style={{ 
            width: isMobile ? '70px' : '100px', 
            height: isMobile ? '70px' : '100px', 
            backgroundColor: '#E0A96D', 
            borderRadius: '50%', 
            margin: '0 auto 15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? '28px' : '36px',
            color: '#1B263B',
            fontWeight: 'bold',
            fontFamily: "'Playfair Display', serif"
          }}>
            F
          </div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: isMobile ? '20px' : '24px', letterSpacing: '2px', fontFamily: "'Playfair Display', serif", fontWeight: 'normal' }}>
            Portfolyo
          </h1>
          <p style={{ margin: 0, color: '#E0A96D', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Fizikçi
          </p>
        </div>

        <nav style={{ 
          marginTop: isMobile ? '10px' : '30px', 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column',
          justifyContent: isMobile ? 'center' : 'flex-start',
          flexWrap: 'wrap',
          paddingBottom: isMobile ? '10px' : '0'
        }}>
          <Link to="/" style={linkStyle('/')}>Hakkımda</Link>
          <Link to="/projects" style={linkStyle('/projects')}>Çalışmalar & Yayınlar</Link>
        </nav>
        
        {!isMobile && (
          <div style={{ marginTop: 'auto', padding: '30px', color: '#7f8c8d', fontSize: '12px', textAlign: 'center' }}>
            © 2026 Tüm Hakları Saklıdır.
          </div>
        )}
      </aside>

      {/* Ana İçerik Alanı */}
      <main style={{ 
        marginLeft: isMobile ? '0' : '280px', 
        flex: 1, 
        padding: isMobile ? '30px 20px' : '80px', 
        maxWidth: '1000px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '18px', color: '#1B263B' }}>İçerik Yükleniyor...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '30px' : '50px' }}>
            
            <section>
              <h2 style={{ 
                color: '#1B263B', 
                fontFamily: "'Playfair Display', serif", 
                fontSize: isMobile ? '26px' : '32px', 
                borderBottom: '2px solid #E0A96D', 
                paddingBottom: '10px',
                display: 'inline-block',
                marginBottom: isMobile ? '20px' : '30px',
                fontWeight: 'normal'
              }}>
                Hakkımda
              </h2>
              <div style={{ 
                lineHeight: '1.8', 
                fontSize: isMobile ? '15px' : '17px', 
                color: '#4a4a4a', 
                backgroundColor: 'white', 
                padding: isMobile ? '25px' : '40px', 
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(27, 38, 59, 0.05)',
                overflowWrap: 'break-word'
              }}>
                <ReactMarkdown>{resumeData.bio}</ReactMarkdown>
              </div>
            </section>

            <section>
              <h2 style={{ 
                color: '#1B263B', 
                fontFamily: "'Playfair Display', serif", 
                fontSize: isMobile ? '26px' : '32px', 
                borderBottom: '2px solid #E0A96D', 
                paddingBottom: '10px',
                display: 'inline-block',
                marginBottom: isMobile ? '20px' : '30px',
                fontWeight: 'normal'
              }}>
                Akademik Geçmiş
              </h2>
              
              {resumeData.education && resumeData.education.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {resumeData.education.map((school) => (
                    <div key={school.id} style={{ 
                      backgroundColor: 'white', 
                      padding: isMobile ? '20px' : '30px', 
                      borderRadius: '12px', 
                      borderLeft: '4px solid #E0A96D', 
                      boxShadow: '0 5px 20px rgba(27, 38, 59, 0.03)'
                    }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#1B263B', fontSize: isMobile ? '18px' : '22px', fontFamily: "'Playfair Display', serif" }}>
                        {school.name}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', color: '#7f8c8d', fontSize: isMobile ? '14px' : '16px', gap: isMobile ? '10px' : '0' }}>
                        <span style={{ fontStyle: 'italic' }}>{school.department}</span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: '#E0A96D', 
                          backgroundColor: 'rgba(224, 169, 109, 0.1)', 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '14px',
                          alignSelf: isMobile ? 'flex-start' : 'center'
                        }}>
                          {school.year}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>Henüz akademik bilgi eklenmemiş.</p>
              )}
            </section>

          </div>
        )}

      </main>
    </div>
  );
}
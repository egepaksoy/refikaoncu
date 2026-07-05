import { useEffect, useState } from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';
import { API_BASE } from '../config';

export default function PublicLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [contact, setContact] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Temayı etkinleştirme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Akademik profilleri ve iletişim bilgilerini çekme
  useEffect(() => {
    fetch(`${API_BASE}/api/public/resume`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.contact) {
          setContact(data.contact);
        }
      })
      .catch(err => console.error("Profil bilgileri çekilemedi:", err));
  }, []);

  const isHomeActive = location.pathname === '/' && location.hash !== '#egitim' && location.hash !== '#calismalar';
  const isEducationActive = location.hash === '#egitim';
  const isProjectsActive = location.hash === '#calismalar' || location.pathname.startsWith('/project');

  const linkStyle = (isActive) => ({
    display: isMobile ? 'inline-block' : 'flex',
    alignItems: 'center',
    padding: isMobile ? '8px 16px' : '14px 24px',
    color: isActive ? 'var(--accent)' : '#94A3B8',
    textDecoration: 'none',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: '500',
    letterSpacing: '0.05em',
    borderLeft: !isMobile && isActive ? '4px solid var(--accent)' : (!isMobile ? '4px solid transparent' : 'none'),
    borderBottom: isMobile && isActive ? '3px solid var(--accent)' : (isMobile ? '3px solid transparent' : 'none'),
    backgroundColor: isActive ? 'rgba(194, 149, 110, 0.08)' : 'transparent',
    transition: 'all 0.25s ease',
    marginBottom: isMobile ? '0' : '8px',
    marginRight: isMobile ? '8px' : '0',
    borderRadius: isMobile ? '6px 6px 0 0' : '0 6px 6px 0',
    outline: 'none',
  });

  const getHomeLink = (hash) => {
    const isProdPages = window.location.hostname.endsWith('.github.io');
    const path = window.location.pathname;
    if (!isProdPages) {
      return `/${hash}`;
    }
    const segments = path.split('/').filter(Boolean);
    const repoName = segments.length > 0 ? segments[0] : '';
    return `/${repoName}/${hash}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', backgroundColor: 'var(--bg-main)', fontFamily: 'var(--font-sans)' }}>
      
      {/* Sabit Sol Menü */}
      <aside style={{ 
        width: isMobile ? '100%' : '300px', 
        backgroundColor: 'var(--sidebar-bg)', 
        color: 'white', 
        display: 'flex', 
        flexDirection: 'column',
        position: isMobile ? 'relative' : 'fixed', 
        height: isMobile ? 'auto' : '100vh',
        boxShadow: isMobile ? '0 4px 20px rgba(0,0,0,0.15)' : '6px 0 30px rgba(0,0,0,0.2)',
        zIndex: 10,
        borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.05)'
      }}>
        {/* Karanlık/Aydınlık Mod Toggle Butonu */}
        <button 
          onClick={() => setIsDark(!isDark)}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent)',
            transition: 'all 0.25s ease',
            outline: 'none',
            zIndex: 15
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)'}
          title={isDark ? "Aydınlık Mod" : "Karanlık Mod"}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>

        <div style={{ padding: isMobile ? '35px 20px 15px' : '65px 40px 40px', textAlign: 'center' }}>
          {/* Logo/Avatar Alanı */}
          <div style={{ 
            width: isMobile ? '65px' : '90px', 
            height: isMobile ? '65px' : '90px', 
            backgroundColor: 'var(--accent-light)', 
            border: '2px solid var(--accent)',
            borderRadius: '50%', 
            margin: '0 auto 20px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: isMobile ? '24px' : '32px', 
            color: 'var(--accent)', 
            fontWeight: '600', 
            fontFamily: 'var(--font-serif)',
            boxShadow: '0 0 20px rgba(194, 149, 110, 0.2)',
            transition: 'transform 0.3s ease'
          }}>
            R
          </div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: isMobile ? '20px' : '26px', 
            color: 'white',
            letterSpacing: '-0.01em', 
            fontFamily: 'var(--font-serif)', 
            fontWeight: 'normal' 
          }}>
            Refika Öncü
          </h1>
          <p style={{ 
            margin: 0, 
            color: 'var(--accent)', 
            fontSize: '11px', 
            letterSpacing: '0.15em', 
            textTransform: 'uppercase',
            fontWeight: '600',
            marginBottom: '20px'
          }}>
            Fizikçi & Araştırmacı
          </p>

          {/* Akademik Bağlantı İkonları */}
          {contact && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '15px' }}>
              {contact.email && (
                <a href={`mailto:${contact.email}`} title="E-posta Gönder" style={{ color: '#64748B', transition: 'color 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.color='#64748B'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </a>
              )}
              {contact.scholar && (
                <a href={contact.scholar} target="_blank" rel="noopener noreferrer" title="Google Scholar" style={{ color: '#64748B', transition: 'color 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.color='#64748B'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path>
                  </svg>
                </a>
              )}
              {contact.orcid && (
                <a href={contact.orcid} target="_blank" rel="noopener noreferrer" title="ORCID iD" style={{ color: '#64748B', transition: 'color 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.color='#64748B'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </a>
              )}
              {contact.github && (
                <a href={contact.github} target="_blank" rel="noopener noreferrer" title="GitHub" style={{ color: '#64748B', transition: 'color 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.color='#64748B'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
              )}
              {contact.linkedin && (
                <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" style={{ color: '#64748B', transition: 'color 0.2s' }} onMouseOver={(e)=>e.currentTarget.style.color='var(--accent)'} onMouseOut={(e)=>e.currentTarget.style.color='#64748B'}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        <nav style={{ 
          marginTop: isMobile ? '5px' : '15px', 
          display: 'flex', 
          flexDirection: isMobile ? 'row' : 'column', 
          justifyContent: isMobile ? 'center' : 'flex-start', 
          flexWrap: 'wrap', 
          paddingBottom: isMobile ? '10px' : '0',
          paddingRight: isMobile ? '0' : '20px'
        }}>
          <a href={getHomeLink('')} style={linkStyle(isHomeActive)}>Hakkımda</a>
          <a href={getHomeLink('#egitim')} style={linkStyle(isEducationActive)}>Akademik Geçmiş</a>
          <a href={getHomeLink('#calismalar')} style={linkStyle(isProjectsActive)}>Çalışmalar & Yayınlar</a>
        </nav>
        
        {!isMobile && (
          <div style={{ marginTop: 'auto', padding: '40px', color: '#64748B', fontSize: '12px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
            <div style={{ marginBottom: '10px' }}>
              <Link to="/login" style={{ color: '#64748B', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'} onMouseOut={(e) => e.currentTarget.style.color = '#64748B'}>Yönetici Paneli</Link>
            </div>
            © 2026 Refika Öncü.<br />Tüm Hakları Saklıdır.
          </div>
        )}
      </aside>

      {/* Dinamik İçerik Alanı */}
      <main style={{ 
        marginLeft: isMobile ? '0' : '300px', 
        flex: 1, 
        padding: isMobile ? '30px 20px' : '60px 80px', 
        maxWidth: '1200px', 
        width: '100%', 
        boxSizing: 'border-box' 
      }}>
        <Outlet />
      </main>
    </div>
  );
}
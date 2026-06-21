import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

export default function Dashboard() {
  const [backendMessage, setBackendMessage] = useState('');
  const [activeTab, setActiveTab] = useState('ozgecmis'); // Test için varsayılanı projeler yaptık
  const navigate = useNavigate();

  // --- ÖZGEÇMİŞ STATE'LERİ ---
  const [aboutMarkdown, setAboutMarkdown] = useState('# Merhaba, Ben Ege\n\nBuraya detayları yazabilirsin...');
  const [schools, setSchools] = useState([
    { id: 1, name: 'Ecole 42 Kocaeli', department: 'Yazılım', year: '2024 - Devam' }
  ]);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolDept, setNewSchoolDept] = useState('');
  const [newSchoolYear, setNewSchoolYear] = useState('');

  // --- PROJELER STATE'LERİ ---
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null); // Null ise kartlar görünür, doluysa detay sayfası açılır

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        const authResponse = await fetch('http://127.0.0.1:8000/api/dashboard-data', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (authResponse.ok) {
          const authData = await authResponse.json();
          setBackendMessage(authData.message);

          const resumeResponse = await fetch('http://127.0.0.1:8000/api/resume', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (resumeResponse.ok) {
            const resumeData = await resumeResponse.json();
            setAboutMarkdown(resumeData.bio);
            setSchools(resumeData.education);
          }
          
          const projectsResponse = await fetch('http://127.0.0.1:8000/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            if (projectsData.length > 0) setProjects(projectsData);
          }
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch (error) {
        console.error("Sunucuya ulaşılamadı:", error);
      }
    };
    checkAuth();
  }, [navigate]);

  // --- ÖZGEÇMİŞ FONKSİYONLARI ---
  const handleAddSchool = (e) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolYear) return alert('Okul adı ve dönem boş bırakılamaz!');
    setSchools([...schools, { id: Date.now(), name: newSchoolName, department: newSchoolDept, year: newSchoolYear }]);
    setNewSchoolName(''); setNewSchoolDept(''); setNewSchoolYear('');
  };

  const handleRemoveSchool = (id) => setSchools(schools.filter(school => school.id !== id));

  const handleSaveResume = async () => {
    const token = localStorage.getItem('token');
    const resumeData = { bio: aboutMarkdown, education: schools };
    try {
      const response = await fetch('http://127.0.0.1:8000/api/resume', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(resumeData)
      });
      if (response.ok) {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) { console.error("Hata:", error); }
  };

  // --- PROJE FONKSİYONLARI ---
  const handleCreateNewProject = () => {
    setEditingProject({
      id: Date.now(),
      name: '',
      date: '',
      contributors: '',
      content: '# Yeni Proje Başlığı\nProje detaylarını buraya yazın...',
      gallery: []
    });
  };

  const syncProjectsWithBackend = async (updatedProjects) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/projects', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProjects)
      });
      if (response.ok) {
        alert('Projeler başarıyla backend\'e kaydedildi!');
      }
    } catch (error) {
      console.error("Kayıt hatası:", error);
    }
  };

  const handleSaveProject = () => {
    const exists = projects.find(p => p.id === editingProject.id);
    let updatedProjects;
    if (exists) {
      updatedProjects = projects.map(p => p.id === editingProject.id ? editingProject : p);
    } else {
      updatedProjects = [...projects, editingProject];
    }
    
    setProjects(updatedProjects);
    setEditingProject(null);
    syncProjectsWithBackend(updatedProjects); // Backend'e gönder
  };

  const handleDeleteProject = async (id) => {
    if(window.confirm('Bu projeyi silmek istediğine emin misin? Projeye ait tüm görseller de kalıcı olarak silinecek!')) {
      const token = localStorage.getItem('token');
      
      try {
        // Backend'e projeyi ve fiziksel dosyalarını silmesi için özel istek atıyoruz
        const response = await fetch(`http://127.0.0.1:8000/api/projects/${id}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}` 
          }
        });

        if (response.ok) {
          // İşlem başarılıysa React arayüzündeki (state) listeyi güncelle
          const updatedProjects = projects.filter(p => p.id !== id);
          setProjects(updatedProjects);
          setEditingProject(null);
        } else {
          alert('Proje sunucudan silinirken bir hata oluştu.');
        }
      } catch (error) {
        console.error("Proje silme hatası:", error);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', editingProject.id); // YENİ: Proje ID'sini arka uca gönderiyoruz

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setEditingProject({
          ...editingProject,
          gallery: [...editingProject.gallery, data.url]
        });
      } else {
        alert("Fotoğraf yüklenirken hata oluştu.");
      }
    } catch (error) {
      console.error("Yükleme hatası:", error);
    }
  };

  const handleRemoveImage = async (indexToRemove) => {
    const imageUrl = editingProject.gallery[indexToRemove];
    const token = localStorage.getItem('token');

    // 1. Önce backend'den resmi fiziksel olarak silmek için istek atıyoruz
    try {
      const response = await fetch('http://127.0.0.1:8000/api/delete-image', {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ image_url: imageUrl })
      });

      if (response.ok) {
        // 2. Backend'den silindiyse, arayüzden (state) de temizle
        setEditingProject({
          ...editingProject,
          gallery: editingProject.gallery.filter((_, index) => index !== indexToRemove)
        });
      } else {
        alert("Görsel sunucudan silinemedi.");
      }
    } catch (error) {
      console.error("Silme hatası:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // --- STİLLER ---
  const tabStyle = (tabName) => ({
    padding: '12px 20px', cursor: 'pointer', backgroundColor: activeTab === tabName ? '#007BFF' : 'transparent',
    color: activeTab === tabName ? 'white' : '#bdc3c7', border: 'none', borderRadius: '4px', textAlign: 'left',
    fontSize: '16px', transition: '0.2s'
  });

  const inputStyle = { padding: '12px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px', width: '100%', marginBottom: '15px' };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', fontFamily: 'sans-serif', margin: 0, overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ borderBottom: '1px solid #34495e', paddingBottom: '15px', marginTop: 0 }}>Yönetim</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', flex: 1 }}>
          <button style={tabStyle('ozgecmis')} onClick={() => { setActiveTab('ozgecmis'); setEditingProject(null); }}>Özgeçmiş</button>
          <button style={tabStyle('projeler')} onClick={() => setActiveTab('projeler')}>Projelerim</button>
          <button style={tabStyle('notlar')} onClick={() => { setActiveTab('notlar'); setEditingProject(null); }}>Not & Soru Yükle</button>
        </div>
        <button onClick={handleLogout} style={{ padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Çıkış Yap</button>
      </div>

      {/* İçerik Alanı */}
      <div style={{ flex: 1, padding: '20px', backgroundColor: '#ecf0f1', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* ÖZGEÇMİŞ SEKMESİ */}
          {activeTab === 'ozgecmis' && (
             <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
             <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Özgeçmiş Yönetimi</h2>
             {/* ... Özgeçmiş Kodları (Aynı Kaldı) ... */}
             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
               <h3 style={{ marginBottom: '10px' }}>1. Kendinden Bahset</h3>
               <div style={{ display: 'flex', gap: '30px', flex: 1 }}>
                 <textarea value={aboutMarkdown} onChange={(e) => setAboutMarkdown(e.target.value)} style={{ flex: 1, padding: '20px', fontFamily: 'monospace', fontSize: '16px', borderRadius: '8px', border: '2px solid #ddd', resize: 'none' }} />
                 <div style={{ flex: 1, padding: '20px', border: '2px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', overflowY: 'auto', fontSize: '16px' }}><ReactMarkdown>{aboutMarkdown}</ReactMarkdown></div>
               </div>
             </div>
             <hr style={{ border: '0', height: '1px', backgroundColor: '#eee', margin: '30px 0' }} />
             <div>
               <h3>2. Okunulan Okullar</h3>
               <ul style={{ listStyleType: 'none', padding: 0, margin: '15px 0' }}>
                 {schools.map((s) => (
                   <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', padding: '12px 20px', borderRadius: '6px', marginBottom: '10px', borderLeft: '5px solid #007BFF' }}>
                     <div><strong style={{ fontSize: '18px' }}>{s.name}</strong> - {s.department || 'Bölüm Belirtilmedi'} <span style={{ color: '#7f8c8d' }}>({s.year})</span></div>
                     <button onClick={() => handleRemoveSchool(s.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>Sil</button>
                   </li>
                 ))}
               </ul>
               <form onSubmit={handleAddSchool} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                 <input type="text" placeholder="Okul Adı" value={newSchoolName} onChange={(e) => setNewSchoolName(e.target.value)} style={{ padding: '12px', flex: 2, borderRadius: '4px', border: '1px solid #ccc' }} />
                 <input type="text" placeholder="Bölüm" value={newSchoolDept} onChange={(e) => setNewSchoolDept(e.target.value)} style={{ padding: '12px', flex: 2, borderRadius: '4px', border: '1px solid #ccc' }} />
                 <input type="text" placeholder="Yıl" value={newSchoolYear} onChange={(e) => setNewSchoolYear(e.target.value)} style={{ padding: '12px', flex: 1, borderRadius: '4px', border: '1px solid #ccc' }} />
                 <button type="submit" style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Ekle</button>
               </form>
             </div>
             <div style={{ marginTop: '30px', textAlign: 'right' }}><button onClick={handleSaveResume} style={{ backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>Özgeçmişi Kaydet</button></div>
           </div>
          )}

          {/* PROJELER SEKMESİ */}
          {activeTab === 'projeler' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              
              {/* DURUM 1: LİSTE GÖRÜNÜMÜ */}
              {!editingProject ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>Projelerim</h2>
                    <button onClick={handleCreateNewProject} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>+ Yeni Proje Oluştur</button>
                  </div>
                  
                  {/* Proje Kartları Izgarası */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {projects.map(proj => (
                      <div 
                        key={proj.id} 
                        onClick={() => setEditingProject(proj)}
                        style={{ border: '1px solid #eee', borderRadius: '8px', padding: '20px', cursor: 'pointer', transition: '0.2s', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                        onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)'}
                        onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)'}
                      >
                        <div>
                          <h3 style={{ margin: '0 0 10px 0', color: '#34495e' }}>{proj.name || 'İsimsiz Proje'}</h3>
                          <span style={{ fontSize: '14px', color: '#7f8c8d', display: 'block', marginBottom: '10px' }}>📅 {proj.date || 'Tarih Yok'}</span>
                          <span style={{ fontSize: '14px', color: '#7f8c8d', display: 'block' }}>👥 {proj.contributors || 'Katkı Sağlayan Yok'}</span>
                        </div>
                        <div style={{ marginTop: '20px', color: '#007BFF', fontWeight: 'bold', fontSize: '14px' }}>Detayları Düzenle ➡️</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
              
              /* DURUM 2: PROJE DÜZENLEME EKRANI */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: '#2c3e50' }}>{editingProject.name ? "Projeyi Düzenle" : "Yeni Proje Ekle"}</h2>
                    <button onClick={() => setEditingProject(null)} style={{ backgroundColor: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>✖ Geri Dön</button>
                  </div>

                  {/* Üst Bilgiler */}
                  <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 2 }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Proje Adı</label>
                      <input style={inputStyle} type="text" value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} placeholder="Örn: Yer İstasyonu Yazılımı" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tarih</label>
                      <input style={inputStyle} type="text" value={editingProject.date} onChange={e => setEditingProject({...editingProject, date: e.target.value})} placeholder="Örn: 2026 Mayıs" />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Katkı Sağlayanlar</label>
                    <input style={inputStyle} type="text" value={editingProject.contributors} onChange={e => setEditingProject({...editingProject, contributors: e.target.value})} placeholder="Örn: Ege Paksoy, Ahmet Yılmaz" />
                  </div>

                  {/* Markdown İçerik Alanı */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '300px', marginTop: '10px' }}>
                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Proje İçeriği (Markdown)</label>
                    <div style={{ display: 'flex', gap: '20px', flex: 1 }}>
                      <textarea value={editingProject.content} onChange={e => setEditingProject({...editingProject, content: e.target.value})} style={{ flex: 1, padding: '15px', fontFamily: 'monospace', borderRadius: '8px', border: '2px solid #ddd', resize: 'none' }} placeholder="# Proje Amacı..." />
                      <div style={{ flex: 1, padding: '15px', border: '2px solid #eee', borderRadius: '8px', backgroundColor: '#fdfdfd', overflowY: 'auto' }}><ReactMarkdown>{editingProject.content}</ReactMarkdown></div>
                    </div>
                  </div>

                  {/* Resim Galerisi Yükleme Alanı */}
                  <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ccc' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Proje Galerisi (Görseller)</h3>
                    
                    {/* Yükleme Butonu */}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '20px' }} />
                    
                    {/* Küçük Resimler (Thumbnails) */}
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                      {editingProject.gallery.map((imgUrl, index) => (
                        <div key={index} style={{ position: 'relative', width: '120px', height: '100px', border: '1px solid #ddd', borderRadius: '4px', overflow: 'hidden' }}>
                          <img src={imgUrl} alt={`Galeri ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button onClick={() => handleRemoveImage(index)} style={{ position: 'absolute', top: '5px', right: '5px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projeyi Kaydet / Sil Butonları */}
                  <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => handleDeleteProject(editingProject.id)} style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Projeyi Sil</button>
                    <button onClick={handleSaveProject} style={{ backgroundColor: '#007BFF', color: 'white', border: 'none', padding: '15px 30px', borderRadius: '6px', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold' }}>💾 Projeyi Kaydet</button>
                  </div>

                </div>
              )}
            </div>
          )}

          {activeTab === 'notlar' && ( <div><h3>Not ve Soru Yükleme Sistemi</h3><p>Dosya yükleme arayüzü.</p></div> )}
        </div>
      </div>
    </div>
  );
}
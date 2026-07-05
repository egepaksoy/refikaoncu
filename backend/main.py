import hashlib
import os
import json
import shutil # Dosya kaydetmek için
import uuid   # Benzersiz dosya isimleri üretmek için
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Yüklenen fotoğrafları dışarı sunmak için
from pydantic import BaseModel
from typing import List
from jose import JWTError, jwt

# 1. Güvenlik Ayarları
SECRET_KEY = "REFIKA32PAKSOY06"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

app = FastAPI()

# Kalıcı Veri Depolama Dizinleri (Render Persistent Disk desteği için)
DATA_DIR = os.getenv("DATA_DIR", ".")
try:
    UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    RESUME_FILE = os.path.join(DATA_DIR, "resume_data.json")
    PROJECTS_FILE = os.path.join(DATA_DIR, "projects_data.json")
except PermissionError:
    # Eğer belirtilen DATA_DIR dizinine yazma yetkisi yoksa (Free plandaki /data gibi) yerel klasöre dön
    print(f"UYARI: {DATA_DIR} dizinine yazma yetkisi yok. Yerel dizine ('.') geri dönülüyor.")
    DATA_DIR = "."
    RESUME_FILE = "resume_data.json"
    PROJECTS_FILE = "projects_data.json"
    UPLOADS_DIR = "uploads"
    os.makedirs(UPLOADS_DIR, exist_ok=True)

# Bu klasörü dışarıya (frontend'e) statik olarak aç
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# 2. CORS Ayarları
allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://refikaoncu.github.io"
]
env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    allowed_origins.extend(env_origins.split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Yerel ve Güvenli Şifreleme Yardımcı Fonksiyonları (Passlib yerine hashlib)
def hash_password(password: str) -> str:
    """Şifreyi SHA-256 kullanarak güvenli bir şekilde hashler."""
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Girilen şifre ile hashlenmiş şifreyi karşılaştırır."""
    return hash_password(plain_password) == hashed_password


# Sabit Yönetici Bilgileri
ADMIN_USERNAME = "admin"
# Gerçek şifremiz "refika_oncu_32", bunu hashlib ile hashleyip saklıyoruz
ADMIN_PASSWORD_HASH = hash_password("refika_oncu_32")


# Token Üretme Fonksiyonu
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# 3. Giriş Yapma (Token Üretme) Endpoint'i
@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Kullanıcı adı kontrolü ve şifre doğrulaması
    if form_data.username != ADMIN_USERNAME or not verify_password(form_data.password, ADMIN_PASSWORD_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Hatalı kullanıcı adı veya şifre",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Bilgiler doğruysa JWT Token üret ve gönder
    access_token = create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}


# 4. Korumalı Örnek Bir Endpoint
@app.get("/api/dashboard-data")
async def get_dashboard_data(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Geçersiz token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Geçersiz token")
        
    return {
        "status": "authorized",
        "message": "Tebrikler Ege! Bu veri sadece backend tarafından doğrulanan yetkili kişiye gösterilir."
    }

# --- ÖZGEÇMİŞ API MODELLERİ VE ROTALARI ---

# React'ten gelecek verinin şablonunu (Pydantic ile) belirliyoruz
class School(BaseModel):
    id: int
    name: str
    department: str
    year: str

class ContactInfo(BaseModel):
    email: str | None = ""
    scholar: str | None = ""
    orcid: str | None = ""
    github: str | None = ""
    linkedin: str | None = ""

class StatItem(BaseModel):
    id: int
    value: str
    label: str

class ResumeData(BaseModel):
    bio: str
    education: List[School]
    contact: ContactInfo | None = None
    hero_title: str | None = ""
    hero_subtitle: str | None = ""
    stats: List[StatItem] | None = None

# Verileri kaydedeceğimiz basit yerel dosya
RESUME_FILE = "resume_data.json"

# 1. Özgeçmiş Verisini Getirme (GET)
@app.get("/api/resume")
async def get_resume(token: str = Depends(oauth2_scheme)):
    if os.path.exists(RESUME_FILE):
        with open(RESUME_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    
    return {
        "bio": "# Merhaba, Ben Ege\n\nBuraya detayları yazabilirsin...",
        "education": [],
        "contact": {
            "email": "",
            "scholar": "",
            "orcid": "",
            "github": "",
            "linkedin": ""
        },
        "hero_title": "Fizik Dünyasını Keşfetmek",
        "hero_subtitle": "Kuantum Hesaplama & Yüksek Enerji Fiziği Araştırmacısı",
        "stats": [
            {"id": 1, "value": "3+", "label": "Aktif Proje"},
            {"id": 2, "value": "5+", "label": "Akademik Yayın"},
            {"id": 3, "value": "CERN", "label": "Araştırma İşbirliği"},
            {"id": 4, "value": "PhD", "label": "Derecesi / Adaylığı"}
        ]
    }

# 2. Özgeçmiş Verisini Kaydetme (POST)
@app.post("/api/resume")
async def save_resume(resume: ResumeData, token: str = Depends(oauth2_scheme)):
    with open(RESUME_FILE, "w", encoding="utf-8") as f:
        json.dump(resume.model_dump(), f, ensure_ascii=False, indent=4)
        
    return {"message": "Özgeçmiş başarıyla sunucuya kaydedildi!"}

# --- PROJELER API MODELLERİ VE ROTALARI ---

class ProjectItem(BaseModel):
    id: int
    name: str
    date: str
    contributors: str
    content: str
    gallery: List[str]
    external_link: str | None = ""

PROJECTS_FILE = "projects_data.json"

# 1. Projeleri Getirme (GET)
@app.get("/api/projects")
async def get_projects(token: str = Depends(oauth2_scheme)):
    if os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return [] # Dosya yoksa boş liste dön

# 2. Projeleri Kaydetme (POST)
@app.post("/api/projects")
async def save_projects(projects: List[ProjectItem], token: str = Depends(oauth2_scheme)):
    with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
        json.dump([p.model_dump() for p in projects], f, ensure_ascii=False, indent=4)
    return {"message": "Projeler başarıyla sunucuya kaydedildi!"}

# 3. Fotoğraf Yükleme (POST) - GÜNCELLENDİ
@app.post("/api/upload-image")
async def upload_image(
    request: Request,
    project_id: str = Form(...), # React'ten gelecek Proje ID'si
    file: UploadFile = File(...), 
    token: str = Depends(oauth2_scheme)
):
    # Projeye özel klasör oluştur
    project_folder = os.path.join(UPLOADS_DIR, project_id)
    os.makedirs(project_folder, exist_ok=True)

    # Benzersiz dosya adı oluştur
    ext = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    
    # Dosyayı ilgili projenin klasörüne kaydet
    file_path = os.path.join(project_folder, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    base_url = str(request.base_url)
    return {"url": f"{base_url}uploads/{project_id}/{unique_filename}"}


# 4. Fotoğraf Silme (DELETE) - YENİ EKLENDİ
class DeleteImageRequest(BaseModel):
    image_url: str

@app.delete("/api/delete-image")
async def delete_image(request: DeleteImageRequest, token: str = Depends(oauth2_scheme)):
    # URL'den sunucudaki fiziksel dosya yolunu çıkar
    if "/uploads/" in request.image_url:
        relative_path = request.image_url.split("/uploads/")[-1]
        file_path = os.path.join(UPLOADS_DIR, relative_path)
        
        # Dosya fiziksel olarak varsa sunucudan sil
        if os.path.exists(file_path):
            os.remove(file_path)
            return {"message": "Görsel sunucudan başarıyla silindi."}
            
    raise HTTPException(status_code=404, detail="Görsel bulunamadı veya silinemedi.")

# 5. Projeyi ve Klasörünü Tamamen Silme (DELETE)
@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str, token: str = Depends(oauth2_scheme)):
    # 1. Projeyi JSON veritabanından (projects_data.json) bul ve çıkar
    if os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
            projects = json.load(f)
        
        # Silinecek proje hariç diğerlerini filtrele
        filtered_projects = [p for p in projects if str(p.get("id")) != project_id]
        
        # Güncel listeyi tekrar kaydet
        with open(PROJECTS_FILE, "w", encoding="utf-8") as f:
            json.dump(filtered_projects, f, ensure_ascii=False, indent=4)
            
    # 2. Projenin "uploads" altındaki klasörünü ve içindeki tüm görselleri fiziksel olarak yok et
    project_folder = os.path.join(UPLOADS_DIR, project_id)
    if os.path.exists(project_folder):
        shutil.rmtree(project_folder) 
        
    return {"message": "Proje ve tüm görselleri sunucudan başarıyla silindi."}

# --- HERKESE AÇIK (PUBLIC) ROTALAR ---

# Ziyaretçilerin özgeçmişi okuyabilmesi için şifresiz GET rotası
@app.get("/api/public/resume")
async def get_public_resume():
    if os.path.exists(RESUME_FILE):
        with open(RESUME_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "bio": "# Merhaba!\nHenüz bir özgeçmiş bilgisi girilmedi.",
        "education": [],
        "contact": {
            "email": "",
            "scholar": "",
            "orcid": "",
            "github": "",
            "linkedin": ""
        },
        "hero_title": "Fizik Dünyasını Keşfetmek",
        "hero_subtitle": "Kuantum Hesaplama & Yüksek Enerji Fiziği Araştırmacısı",
        "stats": [
            {"id": 1, "value": "3+", "label": "Aktif Proje"},
            {"id": 2, "value": "5+", "label": "Akademik Yayın"},
            {"id": 3, "value": "CERN", "label": "Araştırma İşbirliği"},
            {"id": 4, "value": "PhD", "label": "Derecesi / Adaylığı"}
        ]
    }

# Ziyaretçilerin projeleri listeleyebilmesi için şifresiz GET rotası
@app.get("/api/public/projects")
async def get_public_projects():
    if os.path.exists(PROJECTS_FILE):
        with open(PROJECTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []
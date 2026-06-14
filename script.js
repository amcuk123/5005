// --- 1. SEÇKİN GİRİŞ KEYLERİ KONTROLÜ ---
// Buradaki anahtarlardan herhangi biriyle giriş yapılabilir.
const OWNER_KEYS = ["5005_Xz9!mQp", "owner5005"]; // Sadece bu keyleri giren OWNER olur
const MEMBER_KEYS = ["member5005", "user5005"];   // Bunları giren normal ÜYE olur

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('usernameInput').value.trim();
    const key = document.getElementById('keyInput').value.trim();
    const errorMsg = document.getElementById('loginError');

    let isOwner = OWNER_KEYS.includes(key);
    let isMember = MEMBER_KEYS.includes(key);

    if (isOwner || isMember) {
        errorMsg.classList.add('hidden');
        
        // Kullanıcı ismini ekrana bas
        document.getElementById('displayUsername').innerText = username;
        
        // Rol Ayarlamaları
        const roleBadge = document.getElementById('userRoleBadge');
        const ownerElements = document.querySelectorAll('.owner-only-element');
        
        if (isOwner) {
            roleBadge.innerText = "OWNER";
            roleBadge.classList.add('owner');
            // Gizli Owner menülerini göster
            ownerElements.forEach(el => el.classList.remove('hidden'));
        } else {
            roleBadge.innerText = "ÜYE";
            roleBadge.classList.remove('owner');
            // Normal üyeyse owner alanlarını sakla
            ownerElements.forEach(el => el.classList.add('hidden'));
        }

        // Ekranları değiştir (Giriş kapat, Paneli aç)
        document.getElementById('loginWrapper').classList.add('hidden');
        document.getElementById('panelWrapper').classList.remove('hidden');
        
        // Varsayılan sekmeye dön
        switchTab('dashboard');
    } else {
        errorMsg.classList.remove('hidden');
    }
}

function handleLogout() {
    document.getElementById('panelWrapper').classList.add('hidden');
    document.getElementById('loginWrapper').classList.remove('hidden');
    document.getElementById('usernameInput').value = "";
    document.getElementById('keyInput').value = "";
    document.getElementById('loginError').classList.add('hidden');
}


// --- 2. AYRILABİLİR SEKME (TAB) SİSTEMİ KONTROLÜ ---
function switchTab(tabName) {
    // Tüm içerikleri gizle
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));
    
    // Tüm menü link aktifliklerini kaldır
    const menuItems = document.querySelectorAll('.menu-item, .sub-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
        item.classList.remove('activeSub');
    });

    // İlgili sekmeyi aç ve başlıkları güncelle
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    const pageTitle = document.getElementById('pageTitle');
    const breadCrumb = document.getElementById('breadCrumb');

    if (tabName === 'dashboard') {
        pageTitle.innerText = "Ana Panel";
        breadCrumb.innerText = "Ana Sayfa";
        document.getElementById('menu-dashboard').classList.add('active');
    } else if (tabName === 'tc-gsm') {
        pageTitle.innerText = "TC - GSM";
        breadCrumb.innerText = "Telefon Çözümleri / TC-GSM";
        document.getElementById('menu-tc-gsm').classList.add('activeSub');
    } else if (tabName === 'gsm-tc') {
        pageTitle.innerText = "GSM - TC";
        breadCrumb.innerText = "Telefon Çözümleri / GSM-TC";
        document.getElementById('menu-gsm-tc').classList.add('activeSub');
    } else if (tabName === 'owner-panel') {
        pageTitle.innerText = "Owner Kontrol Merkezi";
        breadCrumb.innerText = "Yönetim";
        document.getElementById('menu-owner').classList.add('active');
    }
}

// Sol menüdeki Telefon Çözümleri dropdown aç/kapat
function toggleDropdown() {
    const subNav = document.getElementById('phoneSubNav');
    const arrow = document.getElementById('dropdownArrow');
    
    if (subNav.classList.contains('hidden')) {
        subNav.classList.remove('hidden');
        arrow.style.transform = "rotate(180deg)";
    } else {
        subNav.classList.add('hidden');
        arrow.style.transform = "rotate(0deg)";
    }
}


// --- 3. GLOBAL CANLI DUYURU SİSTEMİ (OWNER ÖZEL) ---
function publishAnnouncement() {
    const text = document.getElementById('announcementInput').value.trim();
    if(text !== "") {
        document.getElementById('liveAnnouncement').innerHTML = `<strong>DUYURU:</strong> ${text}`;
        alert("Global duyuru tüm sisteme başarıyla yansıtıldı!");
    }
}


// --- 4. AKICI VE PÜRÜZSÜZ KAR YAĞIŞ EFEKTİ ---
const canvas = document.getElementById('snowCanvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const numFlakes = 100;
const flakes = [];

for (let i = 0; i < numFlakes; i++) {
    flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1,
        d: Math.random() * numFlakes,
        speed: Math.random() * 1 + 0.3
    });
}

function drawSnow() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    
    for (let i = 0; i < numFlakes; i++) {
        const f = flakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
    }
    ctx.fill();
    moveSnow();
}

function moveSnow() {
    for (let i = 0; i < numFlakes; i++) {
        const f = flakes[i];
        f.y += f.speed;
        f.x += Math.sin(f.d) * 0.4;

        if (f.y > height) {
            flakes[i] = { x: Math.random() * width, y: 0, r: f.r, d: f.d, speed: f.speed };
        }
    }
}

function animate() {
    drawSnow();
    requestAnimationFrame(animate);
}
animate();
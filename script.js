// --- GİRİŞ VE ROL AYARLARI ---
const OWNER_KEYS = ["5005_Xz9!mQp", "5005552749+"];
const MEMBER_KEYS = ["member5005", "user5005"];
let socket; // Canlı bağlantı objesi

function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('usernameInput').value.trim();
    const key = document.getElementById('keyInput').value.trim();
    const errorMsg = document.getElementById('loginError');

    let isOwner = OWNER_KEYS.includes(key);
    let isMember = MEMBER_KEYS.includes(key);

    if (isOwner || isMember) {
        errorMsg.classList.add('hidden');
        document.getElementById('displayUsername').innerText = username;
        
        const roleBadge = document.getElementById('userRoleBadge');
        const ownerElements = document.querySelectorAll('.owner-only-element');
        
        if (isOwner) {
            roleBadge.innerText = "OWNER";
            roleBadge.classList.add('owner');
            ownerElements.forEach(el => el.classList.remove('hidden'));
        } else {
            roleBadge.innerText = "ÜYE";
            roleBadge.classList.remove('owner');
            ownerElements.forEach(el => el.classList.add('hidden'));
        }

        document.getElementById('loginWrapper').classList.add('hidden');
        document.getElementById('panelWrapper').classList.remove('hidden');
        switchTab('dashboard');

        // GİRİŞ YAPILINCA CANLI SUNUCUYA BAĞLAN
        initLiveSystem();
    } else {
        errorMsg.classList.remove('hidden');
    }
}

function handleLogout() {
    if(socket) socket.disconnect();
    document.getElementById('panelWrapper').classList.add('hidden');
    document.getElementById('loginWrapper').classList.remove('hidden');
}

// --- SEKME DEĞİŞTİRME ---
function switchTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.add('hidden'));
    
    const menuItems = document.querySelectorAll('.menu-item, .sub-item');
    menuItems.forEach(item => {
        item.classList.remove('active', 'activeSub');
    });

    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    const pageTitle = document.getElementById('pageTitle');
    const breadCrumb = document.getElementById('breadCrumb');

    if (tabName === 'dashboard') {
        pageTitle.innerText = "Ana Panel"; breadCrumb.innerText = "Ana Sayfa";
        document.getElementById('menu-dashboard').classList.add('active');
    } else if (tabName === 'tc-gsm') {
        pageTitle.innerText = "TC - GSM"; breadCrumb.innerText = "Telefon Çözümleri / TC-GSM";
        document.getElementById('menu-tc-gsm').classList.add('activeSub');
    } else if (tabName === 'gsm-tc') {
        pageTitle.innerText = "GSM - TC"; breadCrumb.innerText = "Telefon Çözümleri / GSM-TC";
        document.getElementById('menu-gsm-tc').classList.add('activeSub');
    } else if (tabName === 'plaka-sorgu') {
        pageTitle.innerText = "Plaka Çözümleri"; breadCrumb.innerText = "Plaka Sorgu";
        document.getElementById('menu-plaka').classList.add('active');
    } else if (tabName === 'owner-panel') {
        pageTitle.innerText = "Owner Kontrol"; breadCrumb.innerText = "Yönetim";
        document.getElementById('menu-owner').classList.add('active');
    }
}

function toggleDropdown() {
    const subNav = document.getElementById('phoneSubNav');
    const arrow = document.getElementById('dropdownArrow');
    subNav.classList.toggle('hidden');
    arrow.style.transform = subNav.classList.contains('hidden') ? "rotate(0deg)" : "rotate(180deg)";
}

// --- YENİ: VERDİĞİN PLAKA API ENTEGRASYONU ---
async function sorgulaPlaka() {
    const plaka = document.getElementById('plakaInput').value.trim().toUpperCase();
    const resultBox = document.getElementById('plakaResult');

    if(!plaka) {
        alert("Lütfen bir plaka girin!");
        return;
    }

    resultBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color: #a855f7; font-size: 24px;"></i><br><br>Plaka API üzerinden çekiliyor...`;

    try {
        // Verdiğin API adresine istek atıyoruz
        const response = await fetch(`https://wazely.vercel.app/api/plaka?plate=${encodeURIComponent(plaka)}`);
        const result = await response.json();

        // API'den dönen veriyi ekrana basıyoruz (Gelen veri yapısına göre düzenlendi)
        if(result && result.status !== false) {
            resultBox.innerHTML = `
                <div class="result-card">
                    <h4><i class="fa-solid fa-car-side"></i> API Plaka Sorgu Sonucu</h4>
                    <div class="result-row"><strong>Plaka:</strong> <span>${plaka}</span></div>
                    <div class="result-row"><strong>Marka/Model:</strong> <span>${result.data?.brand || 'Bilinmiyor'}</span></div>
                    <div class="result-row"><strong>Renk:</strong> <span>${result.data?.color || 'Bilinmiyor'}</span></div>
                    <div class="result-row"><strong>Yıl:</strong> <span>${result.data?.year || 'Bilinmiyor'}</span></div>
                </div>
            `;
        } else {
            resultBox.innerHTML = `<span style="color: #ef4444;"><i class="fa-solid fa-circle-xclamation"></i> Plaka bulunamadı veya geçersiz!</span>`;
        }
    } catch (error) {
        resultBox.innerHTML = `<span style="color: #ef4444;"><i class="fa-solid fa-circle-exclamation"></i> API Sunucusu yanıt vermedi!</span>`;
    }
}

// --- GERÇEK ZAMANLI (LIVE) SUNUCU BAĞLANTISI ---
function initLiveSystem() {
    // Bilgisayarında açacağın Node.js sunucusuna bağlanır (Port: 3000)
    socket = io("http://localhost:3000");

    // Sunucudan gelen canlı aktif kullanıcı sayısını alır
    socket.on("updateUsers", (count) => {
        document.getElementById("liveActiveUsers").innerText = String(count).padStart(3, '0');
    });

    // Sunucudan gelen canlı küresel duyuruyu alır (Arkadaşında da anında değişir)
    socket.on("receiveAnnouncement", (text) => {
        document.getElementById('liveAnnouncement').innerHTML = `<strong>DUYURU:</strong> ${text}`;
    });
}

function publishAnnouncement() {
    const text = document.getElementById('announcementInput').value.trim();
    if(text !== "" && socket) {
        // Duyuruyu tüm odaya yayınlaması için sunucuya gönderir
        socket.emit("sendAnnouncement", text);
        document.getElementById('announcementInput').value = "";
        alert("Global duyuru canlı ağdaki tüm üyelere gönderildi!");
    }
}

// --- KAR EFEKTİ ---
const canvas = document.getElementById('snowCanvas'); const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth; let height = canvas.height = window.innerHeight;
const numFlakes = 60; const flakes = [];
for (let i = 0; i < numFlakes; i++) { flakes.push({ x: Math.random() * width, y: Math.random() * height, r: Math.random() * 2 + 1, d: Math.random() * numFlakes, speed: Math.random() * 1 + 0.3 }); }
function drawSnow() { ctx.clearRect(0, 0, width, height); ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; ctx.beginPath(); for (let i = 0; i < numFlakes; i++) { const f = flakes[i]; ctx.moveTo(f.x, f.y); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true); } ctx.fill(); moveSnow(); }
function moveSnow() { for (let i = 0; i < numFlakes; i++) { const f = flakes[i]; f.y += f.speed; f.x += Math.sin(f.d) * 0.4; if (f.y > height) { flakes[i] = { x: Math.random() * width, y: 0, r: f.r, d: f.d, speed: f.speed }; } } }
function animate() { drawSnow(); requestAnimationFrame(animate); } animate();

/* =========================================================
   kayıtçılar — main.js
   Sayfanın tüm etkileşimleri burada.
   Bölümler:
     1. Akan timecode (HUD'daki 00:00:00:00)
     2. Scene label (görünürdeki bölüme göre değişen sahne adı)
     3. Scroll reveal (kaydırınca beliren içerik)
     4. İşler — YouTube tıkla-oynat (lazy load)
   ========================================================= */

/* ---------- 1. Akan timecode (24fps) ---------- */
(function(){
  const el = document.getElementById('timecode');
  let f = 0;
  const start = performance.now();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // hareket azaltma açıksa timecode'u sabit tut
  if(reduce){ el.textContent = '00:00:00:00'; return; }
  function tick(now){
    const t = (now - start) / 1000;
    const fr = Math.floor((t % 1) * 24);   // kare (0–23)
    const s = Math.floor(t) % 60;
    const m = Math.floor(t / 60) % 60;
    const h = Math.floor(t / 3600);
    const p = n => String(n).padStart(2,'0');
    el.textContent = `${p(h)}:${p(m)}:${p(s)}:${p(fr)}`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* ---------- 2. Scene label ----------
   data-scene taşıyan bölüm ekrana girdikçe HUD'daki sahne etiketi
   yumuşak geçişle güncellenir. */
(function(){
  const label = document.getElementById('scene-label');
  const targets = document.querySelectorAll('[data-scene]');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        label.style.opacity = 0;
        setTimeout(()=>{ label.textContent = e.target.dataset.scene; label.style.opacity = 1; }, 200);
      }
    });
  }, {threshold:.4});
  targets.forEach(t=>obs.observe(t));
})();

/* ---------- 3. Scroll reveal ----------
   .reveal sınıflı öğeler görünür olunca .in eklenip belirir. */
(function(){
  const els = document.querySelectorAll('.reveal');
  const obs = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, {threshold:.15});
  els.forEach(el=>obs.observe(el));
})();

/* ---------- 4. İşler — YouTube tıkla-oynat (lazy load) ----------
   Her .work kartının .frame'ine HTML'de şunlar verilir:
     - data-youtube-id : oynatılacak videonun YouTube ID'si
     - data-cover       : (opsiyonel) kapak görseli yolu, örn assets/kapak1.jpg
   Mantık:
     - Sayfa açılırken iframe YOK -> hızlı yüklenir (lazy).
     - data-cover verilmişse kapak görseli arkaplana basılır;
       verilmemişse mevcut .f1–.f4 gradient'i fallback olarak kalır.
     - Karta tıklanınca (ya da Enter/Space) iframe autoplay ile gömülür. */
(function(){
  const frames = document.querySelectorAll('.work .frame[data-youtube-id]');

  frames.forEach(frame=>{
    // Kapak görseli verildiyse arkaplana bas (gradient'in üstüne gelir)
    const cover = frame.dataset.cover;
    if(cover){
      frame.style.backgroundImage = `url("${cover}")`;
    }

    // Videoyu gömen fonksiyon — sadece bir kez çalışır
    function play(){
      if(frame.dataset.loaded === 'true') return;   // zaten yüklendiyse çık
      const id = frame.dataset.youtubeId;
      if(!id) return;

      const iframe = document.createElement('iframe');
      // autoplay=1 -> tıklayınca hemen oynasın; diğerleri sade görünüm için
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = 'Video oynatıcı';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;

      frame.innerHTML = '';          // varsa eski içeriği temizle
      frame.appendChild(iframe);
      frame.dataset.loaded = 'true';
      // .playing -> CSS oynat tuşunu gizler
      frame.closest('.work').classList.add('playing');
    }

    // Fare tıklaması
    frame.addEventListener('click', play);
    // Klavye erişilebilirliği (frame <button> ise Enter/Space zaten tetikler,
    // değilse de güvene almak için)
    frame.addEventListener('keydown', e=>{
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); play(); }
    });
  });
})();

/* ---------- 5. Tema değiştirme (koyu / açık) ----------
   Sağ üstteki ☾/☀ düğmesi html[data-theme="light"]'ı açıp kapar.
   Tercih localStorage'da 'kc-theme' anahtarında tutulur. */
(function(){
  const btn = document.getElementById('theme-toggle');
  if(!btn) return;
  const root = document.documentElement;

  function apply(theme){
    const isLight = theme === 'light';
    if(isLight){ root.setAttribute('data-theme','light'); }
    else { root.removeAttribute('data-theme'); }
    btn.textContent = isLight ? '☀' : '☾';
    btn.setAttribute('aria-label', isLight ? 'Koyu moda geç' : 'Açık moda geç');
  }

  let saved = null;
  try{ saved = localStorage.getItem('kc-theme'); }catch(e){}
  // kayıtlı tercih yoksa sistem tercihine bak
  const initial = saved || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  apply(initial);

  btn.addEventListener('click', ()=>{
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    apply(next);
    try{ localStorage.setItem('kc-theme', next); }catch(e){}
  });
})();

/* ---------- 6. Dil değiştirme (TR / EN) ----------
   [data-i18n] taşıyan her öğenin TR içeriği sayfadan okunur (orijinal),
   EN sözlüğü aşağıda. Düğme hedef dili gösterir. Tercih: 'kc-lang'. */
(function(){
  const btn = document.getElementById('lang-toggle');
  if(!btn) return;
  const root = document.documentElement;

  const EN = {
    "nav.works":"work","nav.about":"about","nav.services":"services","nav.contact":"contact",
    "hero.eyebrow":"production collective · istanbul",
    "hero.sub":"We're the camera behind the set. A production collective that records the <strong>backstage of commercial shoots in a cinematic language</strong> — and shoots its own work too. The record is always rolling.",
    "hero.cta1":"let's start shooting","hero.cta2":"see our work","hero.scroll":"scroll down",
    "works.slate":"02 / SELECTED WORK","works.h2":"through the viewfinder",
    "role.director":"director","role.client":"client","role.producer":"producer","role.agency":"agency",
    "work.backstage":"Commercial set backstage film",
    "work.akkok":"Commercial shoot — starring national athlete Buse Çavuşoğlu",
    "about.slate":"03 / WHO WE ARE","about.h2":"Crew, Set, Record",
    "about.p1":"kayıtçılar is a collective of people obsessed with the rawest moments of commercial production. While the set is built, the lights flare, the director calls \"cut\" — we believe <strong>the real story happens behind the camera</strong>, and we record it in a cinematic language.",
    "about.p2":"Backstage is the heart of what we do; but we also shoot <strong>commercials, promos and brand videos</strong> as freelancers. With the speed of an agile collective and the discipline of a big production, we handle every frame: from concept to edit, from color to delivery.",
    "about.p3":"We work like a community — we do business with people, not brands.",
    "about.discipline":"Discipline","about.craft1":"camera & image",
    "about.craft1desc":"The eye behind the viewfinder. Composition, light and the reflex to catch that \"exact moment\".",
    "about.craft2":"edit & color",
    "about.craft2desc":"The hand that turns raw frames into a story. Rhythm, sound design and color grade.",
    "svc.slate":"04 / WHAT WE DO","svc.h2":"rolling, on three fronts",
    "svc1.title":"cinematic backstage",
    "svc1.desc":"We shoot the behind-the-scenes of commercial sets in a documentary-cinema blend. The crew's energy, the chaos of the set, the truth of the moment — not packaged, but lived.",
    "svc1.f1":"reels / shorts","svc1.f2":"long cut","svc1.f3":"set stills",
    "svc2.title":"commercial & brand film",
    "svc2.desc":"Brand and product videos: end-to-end production including concept development, shooting, editing and color. Agile collective, fast delivery, cinematic result.",
    "svc2.f1":"product","svc2.f2":"brand film","svc2.f3":"social media",
    "svc3.title":"freelance shoots",
    "svc3.desc":"Events, venues, music, portraits... We're wherever a camera is needed. We work flexibly, from single-day jobs to long-running projects.",
    "svc3.f1":"event","svc3.f2":"music video","svc3.f3":"venue film",
    "contact.slate":"05 / CONTACT","contact.h2":"got a project in mind?",
    "contact.p":"Backstage, a commercial, or a whole different idea — write to us, let's talk. We usually reply within 24 hours.",
    "contact.ig":"behind the scenes, set moments and our work — daily on Instagram",
    "contact.follow":"follow →",
    "footer.left":"© 2026 kayıtçılar — istanbul","footer.right":"always recording ●"
  };
  const TITLES = {
    tr:"kayıtçılar — setin arkasındaki kamera",
    en:"kayıtçılar — the camera behind the set"
  };

  // Orijinal (TR) içerikleri sayfadan yakala
  const nodes = document.querySelectorAll('[data-i18n]');
  const TR = {};
  nodes.forEach(n=>{ const k=n.dataset.i18n; if(!(k in TR)) TR[k]=n.innerHTML; });

  function apply(lang){
    nodes.forEach(n=>{
      const k = n.dataset.i18n;
      const val = lang === 'en' ? EN[k] : TR[k];
      if(val != null) n.innerHTML = val;
    });
    root.setAttribute('lang', lang);
    document.title = TITLES[lang] || document.title;
    btn.textContent = lang === 'en' ? 'TR' : 'EN';
    btn.setAttribute('aria-label', lang === 'en' ? 'Türkçe’ye geç' : 'Switch to English');
  }

  let saved = null;
  try{ saved = localStorage.getItem('kc-lang'); }catch(e){}
  apply(saved === 'en' ? 'en' : 'tr');

  btn.addEventListener('click', ()=>{
    const next = root.getAttribute('lang') === 'en' ? 'tr' : 'en';
    apply(next);
    try{ localStorage.setItem('kc-lang', next); }catch(e){}
  });
})();

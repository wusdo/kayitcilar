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

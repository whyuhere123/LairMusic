(function(){
  const grid = document.querySelector('.news-grid');
  if (!grid) return;

  function createCard(item){
    const hasLink = Boolean(item.link);
    const card = document.createElement(hasLink ? 'a' : 'article');
    card.className = hasLink ? 'news-card link-card reveal' : 'news-card reveal';
    if (hasLink) {
      card.href = item.link;
      card.target = '_blank';
      card.rel = 'noopener';
      card.setAttribute('aria-label', 'Открыть пост');
    }

    const media = document.createElement('div');
    media.className = 'news-media';
    const img = document.createElement('img');
    img.alt = item.title || 'Новость';
    img.src = item.image || 'assets/img/post-1.jpg';
    media.appendChild(img);
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = item.date || '';
    media.appendChild(tag);

    const body = document.createElement('div');
    body.className = 'news-body';
    const h3 = document.createElement('h3');
    h3.textContent = item.title || '';
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = item.description || '';
    body.appendChild(h3);
    body.appendChild(p);

    (hasLink ? card : media).appendChild(media);
    if (!hasLink) card.appendChild(body); else card.appendChild(body);
    return card;
  }

  function render(items){
    grid.innerHTML = '';
    items.forEach(item => grid.appendChild(createCard(item)));
    // attach reveal classes via existing IntersectionObserver
    if (window && typeof IntersectionObserver !== 'undefined'){
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target); } });
      }, { threshold: 0.15 });
      grid.querySelectorAll('.reveal').forEach(el => io.observe(el));
    }
  }

  function normalize(json){
    // Support format: { "23.09.2025": { title, description, link, image }, ... }
    // Or array of items
    if (Array.isArray(json)) return json;
    const out = [];
    Object.keys(json || {}).forEach(date => {
      const v = json[date] || {};
      out.push({
        date,
        title: v.title || '',
        description: v.description || '',
        link: v.url || v.link || '',
        image: v.image || v.img || ''
      });
    });
    // sort by date dd.mm.yyyy desc
    out.sort((a,b)=>{
      const pa = a.date.split('.').reverse().join('-');
      const pb = b.date.split('.').reverse().join('-');
      return pa < pb ? 1 : pa > pb ? -1 : 0;
    });
    return out;
  }

  fetch('assets/data/news.json', { cache: 'no-cache' })
    .then(r => r.json())
    .then(json => render(normalize(json)))
    .catch(() => {
      // fallback: static placeholder if fetch blocked (e.g., file:// CORS)
      const fallback = [
        { date: '31.12.2024', title: 'Новый год', description: 'Празднуем вместе.', image: 'assets/img/post-1.jpg', link: 'https://t.me/lair_music/243' },
      ];
      render(fallback);
    });
})();


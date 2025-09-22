(function(){
  const grid = document.querySelector('.stats');
  if (!grid) return;

  function update(stats){
    const wanted = ['PRODUCERS','SMM','MOTION-DESIGN','DESIGN','DISTRIBUTORS','EDITOR'];
    const map = {};
    (stats.roles||[]).forEach(r => { map[r.label] = r; });
    const cards = grid.querySelectorAll('.stat');
    cards.forEach(card => {
      const labelEl = card.querySelector('.stat-top span:first-child');
      const valueEl = card.querySelector('.stat-top span:last-child');
      const bar = card.querySelector('.bar span');
      const label = labelEl ? labelEl.textContent.trim() : '';
      const item = map[label];
      if (item){
        valueEl.textContent = item.percent + '%';
        bar.style.setProperty('--w', item.percent + '%');
      }
    });
  }

  fetch('/api/roles', { cache: 'no-cache' })
    .then(r => r.json())
    .then(update)
    .catch(err => console.warn('Failed to load roles', err));
})();


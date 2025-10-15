const API_BASE = '../backend'; // depuis frontend/

async function api(url, options = {}) {
  const res = await fetch(`${API_BASE}/${url}`, {
    headers: { 'Content-Type': 'application/json' , ...(options.headers||{}) },
    ...options
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

function el(tag, attrs={}, ...children){
  const n = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.append(c.nodeType ? c : document.createTextNode(c));
  return n;
}

// -------- Page: index.html --------
async function pageMatieres(){
  const list = document.getElementById('liste-matieres');
  const form = document.getElementById('form-matiere');
  if (!list || !form) return;

  async function refresh(){
    list.innerHTML = 'Chargement...';
    const res = await api('matieres.php');
    list.innerHTML = '';
    res.data.forEach(m => {
      const item = el('li', {class:'item'},
        el('span', {}, m.NOM_MATIERE),
        el('span', {},
          el('a', {href:`chapitres.html?id=${m.ID_MATIERE}&nom=${encodeURIComponent(m.NOM_MATIERE)}`}, 'Ouvrir'),
          ' ',
          el('button', {onclick: async () => {
            if (!confirm('Supprimer cette matière ? Les chapitres associés seront aussi supprimés.')) return;
            await fetch(`${API_BASE}/matieres.php?id=${m.ID_MATIERE}`, {method:'DELETE'});
            refresh();
          }}, 'Supprimer')
        )
      );
      list.appendChild(item);
    });
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nom = document.getElementById('nom_matiere').value.trim();
    if (!nom) return;
    await api('matieres.php', {method:'POST', body: JSON.stringify({nom_matiere: nom})});
    form.reset();
    refresh();
  });

  refresh();
}

// -------- Page: chapitres.html --------
async function pageChapitres(){
  const list = document.getElementById('liste-chapitres');
  const form = document.getElementById('form-chapitre');
  if (!list || !form) return;
  const params = new URLSearchParams(location.search);
  const id_matiere = Number(params.get('id'));

  async function refresh(){
    list.innerHTML = 'Chargement...';
    const res = await api(`chapitres.php?id_matiere=${id_matiere}`);
    list.innerHTML = '';
    res.data.forEach(c => {
      const item = el('li', {class:'item'},
        el('div', {}, el('img', {src:`../${c.CHEMIN_FICHIER}`, class:'thumb'})),
        el('div', {}, el('strong', {}, c.NOM_CHAPITRE), el('div', {class:'badge'}, `#${c.ID_CHAPITRE}`)),
        el('button', {onclick: async ()=>{
          if (!confirm('Supprimer ce chapitre ?')) return;
          await fetch(`${API_BASE}/chapitres.php?id=${c.ID_CHAPITRE}`, {method:'DELETE'});
          refresh();
        }}, 'Supprimer')
      );
      item.style.display = 'grid';
      item.style.gridTemplateColumns = '80px 1fr auto';
      item.style.gap = '10px';
      list.appendChild(item);
    });
  }

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nom = document.getElementById('nom_chapitre').value.trim();
    const file = document.getElementById('fichier').files[0];
    if (!nom || !file) return;

    // 1) Upload du fichier
    const fd = new FormData();
    fd.append('fichier', file);
    const upRes = await fetch(`${API_BASE}/upload.php`, { method: 'POST', body: fd });
    const upJson = await upRes.json();
    if (!upRes.ok || !upJson.ok) { alert('Erreur upload'); return; }

    // 2) Création du chapitre
    await api('chapitres.php', {
      method:'POST',
      body: JSON.stringify({
        nom_chapitre: nom,
        id_matiere,
        chemin_fichier: upJson.chemin_fichier
      })
    });

    form.reset();
    refresh();
  });

  refresh();
}

pageMatieres();
pageChapitres();

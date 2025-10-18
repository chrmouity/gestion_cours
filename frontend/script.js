// =========================
// frontend/script.js
// =========================

// IMPORTANT : comme la page est servie depuis /gestion_cours/frontend/,
// l'API est accessible en chemin RELATIF juste au-dessus :
const API_BASE = '../backend';

// Helper API JSON
async function api(url, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(options.headers || {}),
    ...(isFormData ? {} : { 'Content-Type': 'application/json' })
  };

  const res = await fetch(`${API_BASE}/${url}`, { ...options, headers });
  const text = await res.text().catch(() => '');
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  return json ?? {};
}

function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  for (const c of children) n.append(c?.nodeType ? c : document.createTextNode(String(c)));
  return n;
}

// ----------------------------------------------------
// Page: index.html (Matières)
// ----------------------------------------------------
async function pageMatieres() {
  const list = document.getElementById('liste-matieres');
  const form = document.getElementById('form-matiere');
  if (!list || !form) return;

  async function refresh() {
    list.textContent = 'Chargement...';
    const res = await api('matieres.php'); // { data: [...] }
    list.innerHTML = '';
    (res?.data || []).forEach(m => {
      const item = el('li', { class: 'item' },
        el('span', {}, m.NOM_MATIERE),
        el('span', {},
          // lien RELATIF vers chapitres.html
          el('a', { href: `chapitres.html?id=${m.ID_MATIERE}&nom=${encodeURIComponent(m.NOM_MATIERE)}` }, 'Ouvrir'),
          ' ',
          el('button', {
            onclick: async () => {
              if (!confirm('Supprimer cette matière ? Les chapitres associés seront aussi supprimés.')) return;
              await fetch(`${API_BASE}/matieres.php?id=${m.ID_MATIERE}`, { method: 'DELETE' });
              refresh();
            }
          }, 'Supprimer')
        )
      );
      list.appendChild(item);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('nom_matiere').value.trim();
    if (!nom) return;
    await api('matieres.php', { method: 'POST', body: JSON.stringify({ nom_matiere: nom }) });
    form.reset();
    refresh();
  });

  refresh();
}

// ----------------------------------------------------
// Page: chapitres.html (Chapitres)
// ----------------------------------------------------
async function pageChapitres() {
  const list = document.getElementById('liste-chapitres');
  const form = document.getElementById('form-chapitre');
  if (!list || !form) return;

  const params = new URLSearchParams(location.search);
  const id_matiere = Number(params.get('id'));

  async function refresh() {
    list.textContent = 'Chargement...';
    const res = await api(`chapitres.php?id_matiere=${id_matiere}`); // { data: [...] }
    list.innerHTML = '';

    (res?.data || []).forEach(c => {
      // si CHEMIN_FICHIER existe, on l'affiche (relatif: ../backend/uploads/xxx)
      const imgSrc = (c.CHEMIN_FICHIER && String(c.CHEMIN_FICHIER).trim() !== '')
        ? `../${c.CHEMIN_FICHIER}`
        : null;

      const blocImage = imgSrc
        ? el('img', { src: imgSrc, class: 'thumb', alt: c.NOM_CHAPITRE })
        : el('div', { class: 'thumb' }, '—');

      const item = el('li', { class: 'item' },
        el('div', {}, blocImage),
        el('div', {},
          el('strong', {}, c.NOM_CHAPITRE),
          el('div', { class: 'badge' }, `#${c.ID_CHAPITRE}`)
        ),
        el('button', {
          onclick: async () => {
            if (!confirm('Supprimer ce chapitre ?')) return;
            await fetch(`${API_BASE}/chapitres.php?id=${c.ID_CHAPITRE}`, { method: 'DELETE' });
            refresh();
          }
        }, 'Supprimer')
      );
      item.style.display = 'grid';
      item.style.gridTemplateColumns = '80px 1fr auto';
      item.style.gap = '10px';

      list.appendChild(item);
    });
  }

  // Ajout d'un chapitre (image OPTIONNELLE)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nom = document.getElementById('nom_chapitre').value.trim();
    const file = document.getElementById('fichier').files[0];
    if (!nom) { alert('Le nom du chapitre est obligatoire.'); return; }

    try {
      // 1) Upload seulement si un fichier est choisi
      let chemin_fichier = null;
      if (file) {
        const fd = new FormData();
        fd.append('fichier', file);
        const upRes = await fetch(`${API_BASE}/upload.php`, { method: 'POST', body: fd });
        const upTxt = await upRes.text();
        if (!upRes.ok) throw new Error(`upload.php ${upRes.status}: ${upTxt}`);
        const upJson = JSON.parse(upTxt);
        if (!upJson?.ok) throw new Error(`upload.php: ${upTxt}`);
        chemin_fichier = upJson.chemin_fichier; // ex: backend/uploads/xxx.png
      }

      // 2) Créer le chapitre (sans image si aucun fichier)
      const payload = { nom_chapitre: nom, id_matiere };
      if (chemin_fichier) payload.chemin_fichier = chemin_fichier;

      const res = await fetch(`${API_BASE}/chapitres.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const txt = await res.text();
      if (!res.ok) throw new Error(`chapitres.php ${res.status}: ${txt}`);

      form.reset();
      refresh();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  });

  refresh();
}

// Lance les pages en fonction des éléments présents
pageMatieres();
pageChapitres();

const BASE = 'http://localhost:8081/api';
const $ = id => document.getElementById(id);

// ─── API ────────────────────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const r = await fetch(BASE + path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  if (!r.ok) throw new Error(await r.text());
  return r.status === 204 ? null : r.json();
}
const GET    = path          => api(path);
const POST   = (path, body)  => api(path, { method: 'POST',   body: JSON.stringify(body) });
const PUT    = (path, body)  => api(path, { method: 'PUT',    body: JSON.stringify(body) });
const DELETE = path          => api(path, { method: 'DELETE' });

// ─── Tabs ────────────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  $(`tab-${name}`).classList.remove('hidden');
  document.querySelector(`.tab-btn[data-tab="${name}"]`).classList.add('active');
}
document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => switchTab(b.dataset.tab)));

// ─── Helpers ─────────────────────────────────────────────────────────────────
function card(content) {
  const d = document.createElement('div'); d.className = 'card';
  d.innerHTML = content; return d;
}
function actions(onEdit, onDel) {
  const d = document.createElement('div'); d.className = 'actions';
  const e = document.createElement('button'); e.textContent = 'Editar'; e.className = 'btn-sm'; e.onclick = onEdit;
  const x = document.createElement('button'); x.textContent = 'Eliminar'; x.className = 'btn-sm btn-danger'; x.onclick = onDel;
  d.appendChild(e); d.appendChild(x); return d;
}
function populateSelect(selId, items, valFn, txtFn, current = '') {
  const s = $(selId);
  const first = s.options[0].outerHTML;
  s.innerHTML = first;
  items.forEach(i => {
    const o = document.createElement('option');
    o.value = valFn(i); o.textContent = txtFn(i);
    if (String(o.value) === String(current)) o.selected = true;
    s.appendChild(o);
  });
}
function confirmDel(name, fn) {
  if (confirm(`¿Eliminar "${name}"?`)) fn();
}

// ─── CATEGORÍAS ──────────────────────────────────────────────────────────────
let cats = [];
async function loadCats() {
  cats = await GET('/categorias');
  // render lista
  const c = $('cat-list'); c.innerHTML = '';
  if (!cats.length) { c.innerHTML = '<p class="empty">Sin categorías aún.</p>'; return; }
  cats.forEach(cat => {
    const k = card(`<h3>${cat.nombre}</h3><p>${cat.descripcion}</p>`);
    k.appendChild(actions(
      () => fillCat(cat),
      () => confirmDel(cat.nombre, () => DELETE(`/categorias/${cat.id}`).then(loadCats).catch(alert))
    ));
    c.appendChild(k);
  });
  // actualiza select de videojuegos
  populateSelect('vj-categoriaId', cats, c => c.id, c => c.nombre);
}
function fillCat(c) {
  $('cat-form-title').textContent = 'Editar Categoría';
  $('cat-id').value = c.id; $('cat-nombre').value = c.nombre; $('cat-descripcion').value = c.descripcion;
}
function clearCat() {
  $('cat-form-title').textContent = 'Nueva Categoría';
  $('cat-id').value = ''; $('cat-nombre').value = ''; $('cat-descripcion').value = '';
}
$('cat-cancel').onclick = clearCat;
$('cat-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('cat-id').value;
  const body = { nombre: $('cat-nombre').value, descripcion: $('cat-descripcion').value };
  try {
    id ? await PUT(`/categorias/${id}`, body) : await POST('/categorias', body);
    clearCat(); await loadCats();
  } catch(err) { alert(err.message); }
});

// ─── VIDEOJUEGOS ─────────────────────────────────────────────────────────────
let vjs = [];
async function loadVJs() {
  vjs = await GET('/videojuegos');
  const c = $('vj-list'); c.innerHTML = '';
  if (!vjs.length) { c.innerHTML = '<p class="empty">Sin videojuegos aún.</p>'; return; }
  vjs.forEach(v => {
    let inner = v.imageUrl ? `<img src="${v.imageUrl}" alt="${v.nombre}">` : '';
    inner += `<h3>${v.nombre}</h3>
      <span class="tag">${v.categoria ? v.categoria.nombre : 'Sin categoría'}</span>
      <p>${v.descripcion}</p>`;
    const k = card(inner);
    k.appendChild(actions(
      () => fillVJ(v),
      () => confirmDel(v.nombre, () => DELETE(`/videojuegos/${v.id}`).then(loadVJs).catch(alert))
    ));
    c.appendChild(k);
  });
  // actualiza select de compras
  populateSelect('com-videojuegoId', vjs, v => v.id, v => v.nombre);
}
function fillVJ(v) {
  $('vj-form-title').textContent = 'Editar Videojuego';
  $('vj-id').value = v.id; $('vj-nombre').value = v.nombre;
  $('vj-descripcion').value = v.descripcion; $('vj-imageUrl').value = v.imageUrl || '';
  if (v.categoria) $('vj-categoriaId').value = v.categoria.id;
}
function clearVJ() {
  $('vj-form-title').textContent = 'Nuevo Videojuego';
  ['vj-id','vj-nombre','vj-descripcion','vj-imageUrl'].forEach(id => $(id).value = '');
  $('vj-categoriaId').value = '';
}
$('vj-cancel').onclick = clearVJ;
$('vj-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('vj-id').value;
  const catId = $('vj-categoriaId').value;
  if (!catId) { alert('Selecciona una categoría.'); return; }
  const body = { nombre: $('vj-nombre').value, descripcion: $('vj-descripcion').value,
                 imageUrl: $('vj-imageUrl').value, categoriaId: Number(catId) };
  try {
    id ? await PUT(`/videojuegos/${id}`, body) : await POST('/videojuegos', body);
    clearVJ(); await loadVJs();
  } catch(err) { alert(err.message); }
});

// ─── CLIENTES ────────────────────────────────────────────────────────────────
let clientes = [];
async function loadClientes() {
  clientes = await GET('/clientes');
  const c = $('cli-list'); c.innerHTML = '';
  if (!clientes.length) { c.innerHTML = '<p class="empty">Sin clientes aún.</p>'; return; }
  clientes.forEach(cl => {
    const k = card(`<h3>${cl.nombre}</h3><p>${cl.email}</p>`);
    k.appendChild(actions(
      () => fillCli(cl),
      () => confirmDel(cl.nombre, () => DELETE(`/clientes/${cl.id}`).then(loadClientes).catch(alert))
    ));
    c.appendChild(k);
  });
  // actualiza selects dependientes
  populateSelect('prf-clienteId', clientes, c => c.id, c => c.nombre);
  populateSelect('ped-clienteId', clientes, c => c.id, c => c.nombre);
  populateSelect('com-clienteId', clientes, c => c.id, c => c.nombre);
}
function fillCli(c) {
  $('cli-form-title').textContent = 'Editar Cliente';
  $('cli-id').value = c.id; $('cli-nombre').value = c.nombre; $('cli-email').value = c.email;
}
function clearCli() {
  $('cli-form-title').textContent = 'Nuevo Cliente';
  $('cli-id').value = ''; $('cli-nombre').value = ''; $('cli-email').value = '';
}
$('cli-cancel').onclick = clearCli;
$('cli-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('cli-id').value;
  const body = { nombre: $('cli-nombre').value, email: $('cli-email').value };
  try {
    id ? await PUT(`/clientes/${id}`, body) : await POST('/clientes', body);
    clearCli(); await loadClientes();
  } catch(err) { alert(err.message); }
});

// ─── PERFILES ────────────────────────────────────────────────────────────────
async function loadPerfiles() {
  const perfiles = await GET('/perfiles');
  const c = $('prf-list'); c.innerHTML = '';
  if (!perfiles.length) { c.innerHTML = '<p class="empty">Sin perfiles aún.</p>'; return; }
  perfiles.forEach(p => {
    const k = card(`<h3>@${p.usuario}</h3>
      <span class="tag tag-blue">${p.cliente ? p.cliente.nombre : '?'}</span>
      <p>${p.descripcion}</p>`);
    k.appendChild(actions(
      () => fillPrf(p),
      () => confirmDel(p.usuario, () => DELETE(`/perfiles/${p.id}`).then(loadPerfiles).catch(alert))
    ));
    c.appendChild(k);
  });
}
function fillPrf(p) {
  $('prf-form-title').textContent = 'Editar Perfil';
  $('prf-id').value = p.id; $('prf-usuario').value = p.usuario; $('prf-descripcion').value = p.descripcion;
  if (p.cliente) $('prf-clienteId').value = p.cliente.id;
}
function clearPrf() {
  $('prf-form-title').textContent = 'Nuevo Perfil';
  $('prf-id').value = ''; $('prf-usuario').value = ''; $('prf-descripcion').value = '';
  $('prf-clienteId').value = '';
}
$('prf-cancel').onclick = clearPrf;
$('prf-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('prf-id').value;
  const clienteId = $('prf-clienteId').value;
  if (!clienteId) { alert('Selecciona un cliente.'); return; }
  const body = { usuario: $('prf-usuario').value, descripcion: $('prf-descripcion').value, clienteId: Number(clienteId) };
  try {
    id ? await PUT(`/perfiles/${id}`, body) : await POST('/perfiles', body);
    clearPrf(); await loadPerfiles();
  } catch(err) { alert(err.message); }
});

// ─── PEDIDOS ─────────────────────────────────────────────────────────────────
let pedidos = [];
async function loadPedidos() {
  pedidos = await GET('/pedidos');
  const c = $('ped-list'); c.innerHTML = '';
  if (!pedidos.length) { c.innerHTML = '<p class="empty">Sin pedidos aún.</p>'; return; }
  pedidos.forEach(p => {
    const estadoClass = p.estado === 'COMPLETADO' ? 'tag-green' : p.estado === 'CANCELADO' ? '' : 'tag-blue';
    const k = card(`<h3>Pedido #${p.id}</h3>
      <span class="tag ${estadoClass}">${p.estado}</span>
      <p>📅 ${p.fechaPedido}<br>👤 ${p.cliente ? p.cliente.nombre : '?'}</p>`);
    k.appendChild(actions(
      () => fillPed(p),
      () => confirmDel(`Pedido #${p.id}`, () => DELETE(`/pedidos/${p.id}`).then(loadPedidos).catch(alert))
    ));
    c.appendChild(k);
  });
  // actualiza select de compras
  populateSelect('com-pedidoId', pedidos, p => p.id, p => `#${p.id} - ${p.estado}`);
}
function fillPed(p) {
  $('ped-form-title').textContent = 'Editar Pedido';
  $('ped-id').value = p.id; $('ped-fecha').value = p.fechaPedido; $('ped-estado').value = p.estado;
  if (p.cliente) $('ped-clienteId').value = p.cliente.id;
}
function clearPed() {
  $('ped-form-title').textContent = 'Nuevo Pedido';
  $('ped-id').value = ''; $('ped-fecha').value = ''; $('ped-estado').value = '';
  $('ped-clienteId').value = '';
}
$('ped-cancel').onclick = clearPed;
$('ped-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('ped-id').value;
  const clienteId = $('ped-clienteId').value;
  if (!clienteId) { alert('Selecciona un cliente.'); return; }
  const body = { fechaPedido: $('ped-fecha').value, estado: $('ped-estado').value, clienteId: Number(clienteId) };
  try {
    id ? await PUT(`/pedidos/${id}`, body) : await POST('/pedidos', body);
    clearPed(); await loadPedidos();
  } catch(err) { alert(err.message); }
});

// ─── COMPRAS ─────────────────────────────────────────────────────────────────
async function loadCompras() {
  const compras = await GET('/compras');
  const c = $('com-list'); c.innerHTML = '';
  if (!compras.length) { c.innerHTML = '<p class="empty">Sin compras aún.</p>'; return; }
  compras.forEach(co => {
    const k = card(`<h3>Compra #${co.id}</h3>
      <span class="tag">x${co.cantidad}</span>
      <p>🎮 ${co.videojuego ? co.videojuego.nombre : '?'}<br>
         👤 ${co.cliente ? co.cliente.nombre : '?'}<br>
         📦 Pedido #${co.pedido ? co.pedido.id : '?'}</p>`);
    k.appendChild(actions(
      () => fillCom(co),
      () => confirmDel(`Compra #${co.id}`, () => DELETE(`/compras/${co.id}`).then(loadCompras).catch(alert))
    ));
    c.appendChild(k);
  });
}
function fillCom(co) {
  $('com-form-title').textContent = 'Editar Compra';
  $('com-id').value = co.id; $('com-cantidad').value = co.cantidad;
  if (co.cliente)    $('com-clienteId').value    = co.cliente.id;
  if (co.pedido)     $('com-pedidoId').value      = co.pedido.id;
  if (co.videojuego) $('com-videojuegoId').value  = co.videojuego.id;
}
function clearCom() {
  $('com-form-title').textContent = 'Nueva Compra';
  ['com-id','com-cantidad'].forEach(id => $(id).value = '');
  ['com-clienteId','com-pedidoId','com-videojuegoId'].forEach(id => $(id).value = '');
}
$('com-cancel').onclick = clearCom;
$('com-form').addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('com-id').value;
  const body = {
    cantidad:     Number($('com-cantidad').value),
    clienteId:    Number($('com-clienteId').value),
    pedidoId:     Number($('com-pedidoId').value),
    videojuegoId: Number($('com-videojuegoId').value)
  };
  if (!body.clienteId || !body.pedidoId || !body.videojuegoId) { alert('Completa todos los campos.'); return; }
  try {
    id ? await PUT(`/compras/${id}`, body) : await POST('/compras', body);
    clearCom(); await loadCompras();
  } catch(err) { alert(err.message); }
});

// ─── INIT ────────────────────────────────────────────────────────────────────
(async () => {
  try { await loadCats();     } catch(e) { console.error('cats:', e); }
  try { await loadVJs();      } catch(e) { console.error('vjs:', e); }
  try { await loadClientes(); } catch(e) { console.error('clientes:', e); }
  try { await loadPerfiles(); } catch(e) { console.error('perfiles:', e); }
  try { await loadPedidos();  } catch(e) { console.error('pedidos:', e); }
  try { await loadCompras();  } catch(e) { console.error('compras:', e); }
})();

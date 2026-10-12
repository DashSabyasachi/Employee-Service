// One generic panel that works for BOTH services. Only the config differs.
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg, isError) {
  toastEl.textContent = msg;
  toastEl.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.className = 'toast'), 3000);
}

function esc(v) { // stop HTML injection when printing data
  return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function initPanel(cfg) {
  const root = document.getElementById(cfg.panelId);
  const form = root.querySelector('[data-form]');
  const body = root.querySelector('[data-body]');
  const empty = root.querySelector('[data-empty]');
  const badge = root.querySelector('[data-status]');
  const submitBtn = root.querySelector('[data-submit]');
  const cancelBtn = root.querySelector('[data-cancel]');
  let rows = [];

  function clearErrors() {
    form.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
  }
  function showFieldError(name, msg) {
    const input = form.elements[name];
    if (!input) return false;
    const field = input.closest('.field');
    field.classList.add('invalid');
    field.querySelector('.err').textContent = msg;
    return true;
  }
  function setStatus(online) {
    badge.textContent = online ? 'Online' : 'Offline';
    badge.className = 'badge ' + (online ? 'online' : 'offline');
  }

  async function load() {
    try {
      const res = await fetch(cfg.url);
      rows = await res.json();
      setStatus(true);
      render();
    } catch (e) {
      setStatus(false);
      rows = [];
      render();
    }
  }

  function render() {
    body.innerHTML = rows.map(r => `
      <tr>
        ${cfg.columns.map(c => `<td>${esc(r[c])}</td>`).join('')}
        <td class="btns">
          <button class="mini edit" data-edit="${r.id}">Edit</button>
          <button class="mini del" data-del="${r.id}">Delete</button>
        </td>
      </tr>`).join('');
    empty.hidden = rows.length > 0;
  }

  function resetForm() {
    form.reset();
    form.elements.id.value = '';
    clearErrors();
    submitBtn.textContent = 'Add ' + cfg.label;
    cancelBtn.hidden = true;
  }

  // Edit / Delete buttons inside the table
  body.addEventListener('click', async e => {
    const editId = e.target.dataset.edit;
    const delId = e.target.dataset.del;
    if (editId) {
      const r = rows.find(x => String(x.id) === editId);
      cfg.fields.forEach(f => (form.elements[f].value = r[f] ?? ''));
      form.elements.id.value = r.id;
      submitBtn.textContent = 'Update ' + cfg.label;
      cancelBtn.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (delId && confirm('Delete this ' + cfg.label.toLowerCase() + '?')) {
      try {
        const res = await fetch(`${cfg.url}/${delId}`, { method: 'DELETE' });
        if (res.ok) { toast(cfg.label + ' deleted'); load(); }
        else { const d = await res.json().catch(() => ({})); toast(d.message || 'Delete failed', true); }
      } catch (err) { toast('Cannot reach ' + cfg.label + ' service', true); }
    }
  });

  cancelBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();
    const id = form.elements.id.value;
    const payload = {};
    cfg.fields.forEach(f => {
      let v = form.elements[f].value.trim();
      if (f === 'departmentId') v = v === '' ? null : Number(v);
      payload[f] = v;
    });

    submitBtn.disabled = true;
    try {
      const res = await fetch(id ? `${cfg.url}/${id}` : cfg.url, {
        method: id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast(cfg.label + (id ? ' updated' : ' added'));
        resetForm();
        load();
      } else if (res.status === 400) {
        // backend sends { fieldName: "message" }
        Object.entries(data).forEach(([k, v]) => showFieldError(k, v));
        toast('Please fix the highlighted fields', true);
      } else {
        toast(data.message || 'Something went wrong', true);
      }
    } catch (err) {
      toast('Cannot reach ' + cfg.label + ' service. Is it running?', true);
    } finally {
      submitBtn.disabled = false;
    }
  });

  load();
}

initPanel({
  panelId: 'panel', label: 'Employee', url: '/employees',   // same service, so a relative URL is enough
  fields: ['name', 'email', 'designation', 'departmentId'],
  columns: ['id', 'name', 'email', 'designation', 'departmentId']
});

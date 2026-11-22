const form = document.getElementById('ticket-form');
const formError = document.getElementById('form-error');
const list = document.getElementById('ticket-list');
const empty = document.getElementById('empty');
const counts = document.getElementById('counts');
const filter = document.getElementById('status-filter');

const STATUS_LABELS = { open: 'Open', 'in-progress': 'In progress', closed: 'Closed' };

async function api(path, options = {}) {
  const res = await fetch(`/api/tickets${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error((data.errors || ['Something went wrong']).join(', '));
  return data;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderTicket(t) {
  const li = document.createElement('li');
  li.className = `ticket priority-${t.priority} status-${t.status}`;
  li.innerHTML = `
    <div class="ticket-top">
      <h3>#${t.id} ${escapeHtml(t.title)}</h3>
      <span class="badge">${t.priority}</span>
    </div>
    ${t.description ? `<p>${escapeHtml(t.description)}</p>` : ''}
    <div class="meta">
      ${t.requester ? `From ${escapeHtml(t.requester)} · ` : ''}Opened ${new Date(t.createdAt).toLocaleString()}
    </div>
    <div class="ticket-actions">
      <select aria-label="Status for ticket ${t.id}">
        ${Object.entries(STATUS_LABELS)
          .map(([value, label]) => `<option value="${value}" ${value === t.status ? 'selected' : ''}>${label}</option>`)
          .join('')}
      </select>
      <button class="link" type="button">Delete</button>
    </div>
  `;

  li.querySelector('select').addEventListener('change', async (e) => {
    await api(`/${t.id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) });
    loadTickets();
  });

  li.querySelector('button').addEventListener('click', async () => {
    await api(`/${t.id}`, { method: 'DELETE' });
    loadTickets();
  });

  return li;
}

async function loadTickets() {
  const status = filter.value;
  const [tickets, all] = await Promise.all([
    api(status ? `?status=${status}` : ''),
    api(''),
  ]);

  list.innerHTML = '';
  tickets.forEach((t) => list.appendChild(renderTicket(t)));
  empty.hidden = tickets.length > 0;

  const open = all.filter((t) => t.status === 'open').length;
  const inProgress = all.filter((t) => t.status === 'in-progress').length;
  counts.textContent = `${all.length} total · ${open} open · ${inProgress} in progress`;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;
  const body = Object.fromEntries(new FormData(form));
  try {
    await api('', { method: 'POST', body: JSON.stringify(body) });
    form.reset();
    loadTickets();
  } catch (err) {
    formError.textContent = err.message;
    formError.hidden = false;
  }
});

filter.addEventListener('change', loadTickets);

loadTickets();

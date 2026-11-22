// In-memory ticket store for the MVP.
// Data resets when the server restarts; a real database is planned for Sprint 2.

const PRIORITIES = ['low', 'medium', 'high'];
const STATUSES = ['open', 'in-progress', 'closed'];

let tickets = [];
let nextId = 1;

function now() {
  return new Date().toISOString();
}

function list({ status } = {}) {
  const result = status ? tickets.filter((t) => t.status === status) : tickets;
  // newest first
  return [...result].sort((a, b) => b.id - a.id);
}

function get(id) {
  return tickets.find((t) => t.id === Number(id)) || null;
}

function create({ title, description = '', priority = 'medium', requester = '' }) {
  const ticket = {
    id: nextId++,
    title: title.trim(),
    description: description.trim(),
    priority,
    status: 'open',
    requester: requester.trim(),
    createdAt: now(),
    updatedAt: now(),
  };
  tickets.push(ticket);
  return ticket;
}

function update(id, changes) {
  const ticket = get(id);
  if (!ticket) return null;
  const allowed = ['title', 'description', 'priority', 'status', 'requester'];
  for (const key of allowed) {
    if (changes[key] !== undefined) {
      ticket[key] = typeof changes[key] === 'string' ? changes[key].trim() : changes[key];
    }
  }
  ticket.updatedAt = now();
  return ticket;
}

function remove(id) {
  const index = tickets.findIndex((t) => t.id === Number(id));
  if (index === -1) return false;
  tickets.splice(index, 1);
  return true;
}

function reset() {
  tickets = [];
  nextId = 1;
}

function seed() {
  create({ title: 'Cannot connect to VPN', description: 'GlobalProtect hangs on "connecting" since this morning.', priority: 'high', requester: 'jsmith' });
  create({ title: 'Password reset request', description: 'Locked out after too many attempts.', priority: 'medium', requester: 'mlee' });
  create({ title: 'Need second monitor', description: 'Requesting a second monitor for my desk.', priority: 'low', requester: 'tgarcia' });
}

module.exports = { PRIORITIES, STATUSES, list, get, create, update, remove, reset, seed };

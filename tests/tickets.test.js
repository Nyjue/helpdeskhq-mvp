const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const store = require('../src/store');

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => server.close());

beforeEach(() => store.reset());

async function request(path, options = {}) {
  const res = await fetch(baseUrl + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

test('GET /api/health returns ok', async () => {
  const res = await request('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('POST /api/tickets creates an open ticket', async () => {
  const res = await request('/tickets', {
    method: 'POST',
    body: JSON.stringify({ title: 'Printer jammed', priority: 'high', requester: 'nbennett' }),
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.id, 1);
  assert.equal(res.body.status, 'open');
  assert.equal(res.body.priority, 'high');
});

test('POST /api/tickets rejects a missing title', async () => {
  const res = await request('/tickets', { method: 'POST', body: JSON.stringify({}) });
  assert.equal(res.status, 400);
  assert.ok(res.body.errors.includes('title is required'));
});

test('POST /api/tickets rejects an invalid priority', async () => {
  const res = await request('/tickets', {
    method: 'POST',
    body: JSON.stringify({ title: 'Test', priority: 'urgent' }),
  });
  assert.equal(res.status, 400);
});

test('GET /api/tickets lists newest first and filters by status', async () => {
  store.create({ title: 'First' });
  store.create({ title: 'Second' });
  store.update(1, { status: 'closed' });

  const all = await request('/tickets');
  assert.deepEqual(all.body.map((t) => t.title), ['Second', 'First']);

  const closed = await request('/tickets?status=closed');
  assert.equal(closed.body.length, 1);
  assert.equal(closed.body[0].title, 'First');
});

test('PATCH /api/tickets/:id updates status', async () => {
  store.create({ title: 'VPN down' });
  const res = await request('/tickets/1', { method: 'PATCH', body: JSON.stringify({ status: 'in-progress' }) });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'in-progress');
});

test('PATCH /api/tickets/:id rejects an invalid status', async () => {
  store.create({ title: 'VPN down' });
  const res = await request('/tickets/1', { method: 'PATCH', body: JSON.stringify({ status: 'done' }) });
  assert.equal(res.status, 400);
});

test('DELETE /api/tickets/:id removes the ticket', async () => {
  store.create({ title: 'Delete me' });
  const del = await request('/tickets/1', { method: 'DELETE' });
  assert.equal(del.status, 204);
  const get = await request('/tickets/1');
  assert.equal(get.status, 404);
});

test('unknown ticket returns 404', async () => {
  const res = await request('/tickets/999');
  assert.equal(res.status, 404);
});

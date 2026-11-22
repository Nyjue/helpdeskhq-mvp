const express = require('express');
const store = require('../store');

const router = express.Router();

function validate(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim() === '') {
      errors.push('title is required');
    } else if (body.title.length > 120) {
      errors.push('title must be 120 characters or less');
    }
  }
  if (body.priority !== undefined && !store.PRIORITIES.includes(body.priority)) {
    errors.push(`priority must be one of: ${store.PRIORITIES.join(', ')}`);
  }
  if (body.status !== undefined && !store.STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${store.STATUSES.join(', ')}`);
  }
  for (const field of ['description', 'requester']) {
    if (body[field] !== undefined && typeof body[field] !== 'string') {
      errors.push(`${field} must be a string`);
    }
  }
  return errors;
}

// GET /api/tickets?status=open
router.get('/', (req, res) => {
  const { status } = req.query;
  if (status && !store.STATUSES.includes(status)) {
    return res.status(400).json({ errors: [`status must be one of: ${store.STATUSES.join(', ')}`] });
  }
  res.json(store.list({ status }));
});

// GET /api/tickets/:id
router.get('/:id', (req, res) => {
  const ticket = store.get(req.params.id);
  if (!ticket) return res.status(404).json({ errors: ['ticket not found'] });
  res.json(ticket);
});

// POST /api/tickets
router.post('/', (req, res) => {
  const errors = validate(req.body || {});
  if (errors.length) return res.status(400).json({ errors });
  res.status(201).json(store.create(req.body));
});

// PATCH /api/tickets/:id
router.patch('/:id', (req, res) => {
  if (!store.get(req.params.id)) return res.status(404).json({ errors: ['ticket not found'] });
  const errors = validate(req.body || {}, { partial: true });
  if (errors.length) return res.status(400).json({ errors });
  res.json(store.update(req.params.id, req.body));
});

// DELETE /api/tickets/:id
router.delete('/:id', (req, res) => {
  if (!store.remove(req.params.id)) return res.status(404).json({ errors: ['ticket not found'] });
  res.status(204).end();
});

module.exports = router;

const app = require('./app');
const store = require('./store');

// Load a few sample tickets so the demo isn't empty
if (process.env.SEED_DATA !== 'false') store.seed();

// Cloud Run injects PORT (defaults to 8080)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`HelpDeskHQ running on port ${PORT}`);
});

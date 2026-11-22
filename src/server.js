const app = require('./app');

// Cloud Run injects PORT (defaults to 8080)
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`HelpDeskHQ running on port ${PORT}`);
});

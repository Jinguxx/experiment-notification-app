const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NTFY_TOPIC = process.env.NTFY_TOPIC || '';

app.use(express.json({ limit: '8kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/remind', async (req, res) => {
  const rawMessage = typeof req.body?.message === 'string' ? req.body.message : '';
  const message = rawMessage.trim().slice(0, 200);

  const base = 'Someone tapped your reminder button: remember to post and keep up with your goals.';
  const body = message ? `${base}\n\nExtra anonymous note: ${message}` : base;

  if (!NTFY_TOPIC) {
    return res.status(500).json({
      ok: false,
      error: 'Server is missing NTFY_TOPIC. Add it as an environment variable.'
    });
  }

  try {
    const response = await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Title: 'Goal Reminder',
        Priority: 'default',
        Tags: 'bell,rocket'
      },
      body
    });

    if (!response.ok) {
      const details = await response.text();
      return res.status(502).json({
        ok: false,
        error: `Failed to push notification: ${details || response.statusText}`
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: 'Could not reach ntfy.sh service.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NTFY_TOPIC = process.env.NTFY_TOPIC || '';

// Constants
const MAX_MESSAGE_LENGTH = 200;
const FETCH_TIMEOUT_MS = 5000;
const BASE_REMINDER_MESSAGE = 'Someone tapped your reminder button: remember to post and keep up with your goals.';
const NOTIFICATION_TITLE = 'Goal Reminder';
const NOTIFICATION_TAGS = 'bell,rocket';

app.use(express.json({ limit: '8kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    status: 'healthy',
    ntfyConfigured: !!NTFY_TOPIC
  });
});

app.post('/api/remind', async (req, res) => {
  // Improved input validation
  let message = '';
  if (typeof req.body?.message === 'string') {
    message = req.body.message
      .trim()
      .slice(0, MAX_MESSAGE_LENGTH)
      .replace(/[^\w\s\-.,!?]/g, '');
    
    if (message.length === 0 && req.body.message.trim().length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'Message contains invalid characters.'
      });
    }
  }

  const body = message ? `${BASE_REMINDER_MESSAGE}\n\nExtra anonymous note: ${message}` : BASE_REMINDER_MESSAGE;

  if (!NTFY_TOPIC) {
    return res.status(500).json({
      ok: false,
      error: 'Server is missing NTFY_TOPIC. Add it as an environment variable.'
    });
  }

  try {
    // Add timeout protection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(`https://ntfy.sh/${encodeURIComponent(NTFY_TOPIC)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Title: NOTIFICATION_TITLE,
        Priority: 'default',
        Tags: NOTIFICATION_TAGS
      },
      body,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const details = await response.text();
      return res.status(502).json({
        ok: false,
        error: `Failed to push notification: ${details || response.statusText}`
      });
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Notification fetch error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    return res.status(502).json({
      ok: false,
      error: 'Could not reach ntfy.sh service.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

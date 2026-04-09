# 🔔 Anonymous Encouragement Reminder

A lightweight web app where anyone can send you anonymous push notifications with optional messages—no login, no tracking.

**Use case:** Receive motivational messages, reminders, or encouragement from friends and colleagues anonymously.

---

## Table of Contents

- [How it works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Phone Setup (Receive Notifications)](#phone-setup-receive-notifications)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Security & Privacy](#security--privacy)
- [Development](#development)

---

## How it works

```
User clicks button → Web form submits → POST /api/remind 
→ Server validates → Message sent to ntfy.sh → Push on your phone
```

**Key features:**
- No authentication required
- No user data collected
- Anonymous sender
- Real-time push notifications

---

## Prerequisites

- **Node.js** 18 or higher (`node --version` to check)
- **npm** (comes with Node.js)
- A smartphone with ntfy app installed (iOS or Android)

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/Jinguxx/experiment-notification-app.git
cd experiment-notification-app
npm install
```

### 2. Generate a secure topic name

Pick a **random, hard-to-guess topic** that others cannot easily discover. Use this format:

```bash
# Generate a random topic (example)
echo "reminders-$(openssl rand -hex 8)" 
# Output: reminders-a3f7c9e2b1d4f6a8
```

Why? Anyone with your topic name can send messages. Treat it like a password.

### 3. Start the server

```bash
NTFY_TOPIC=reminders-a3f7c9e2b1d4f6a8 npm start
```

Expected output:
```
Server running on http://localhost:3000
Listening for notifications on topic: reminders-a3f7c9e2b1d4f6a8
```

### 4. Test locally

- Open http://localhost:3000 in your browser
- Press **Send anonymous reminder**
- Verify the form works (you won't receive push yet)

---

## Phone Setup (Receive Notifications)

### iOS (iPhone/iPad)

1. **Install ntfy app**
   - Open App Store → search "ntfy" → install official ntfy app

2. **Grant permissions**
   - Open ntfy app → tap "Allow" for notification permissions when prompted

3. **Add subscription**
   - Tap the **+** button (bottom right)
   - Enter your topic name exactly: `reminders-a3f7c9e2b1d4f6a8`
   - Tap **Subscribe**

4. **Test the connection**
   - Go back to your laptop/server
   - Run this curl command:
     ```bash
     curl -d "test notification" https://ntfy.sh/reminders-a3f7c9e2b1d4f6a8
     ```
   - Check your iPhone's lock screen → should see the notification

5. **Enable background delivery** (optional but recommended)
   - Settings → Notifications → ntfy → enable "Allow Notifications"

### Android

1. **Install ntfy app**
   - Open Google Play Store → search "ntfy" → install official ntfy app

2. **Grant permissions**
   - Open ntfy app → allow notifications + disable battery optimization when prompted

3. **Add subscription**
   - Tap the **+** button
   - Enter your topic name: `reminders-a3f7c9e2b1d4f6a8`
   - Tap **Subscribe**

4. **Test the connection**
   - Run curl command on your server:
     ```bash
     curl -d "test notification" https://ntfy.sh/reminders-a3f7c9e2b1d4f6a8
     ```
   - Check notification tray → should see the notification

5. **Optimize battery settings**
   - Settings → Battery → Battery saver → disable for ntfy app
   - This ensures background notifications aren't blocked

---

## Deployment

### Option 1: Railway.app

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway init
railway up

# Set environment variable
railway variables add NTFY_TOPIC=your-topic-name
```

### Option 2: Fly.io

```bash
fly launch
fly secrets set NTFY_TOPIC=your-topic-name
fly deploy
```

### Option 3: Self-hosted (VPS)

```bash
# On your server
git clone <repo>
cd experiment-notification-app
npm install

# Use PM2 for persistence
npm i -g pm2
NTFY_TOPIC=your-topic pm2 start server.js
pm2 save
pm2 startup
```

---

## Configuration

Set these environment variables when starting the server:

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `NTFY_TOPIC` | ✅ Yes | N/A | `reminders-a3f7c9e2b1d4f6a8` |
| `PORT` | No | `3000` | `8080` |
| `NODE_ENV` | No | `development` | `production` |

**Example with custom port:**
```bash
NTFY_TOPIC=my-topic PORT=8080 npm start
```

---

## Troubleshooting

### "No push notifications received"

**Check 1: Topic name mismatch**
```bash
# Make sure the topic in your phone app matches exactly (case-sensitive)
echo $NTFY_TOPIC  # Shows your server's topic
```

**Check 2: Test ntfy.sh directly**
```bash
curl -d "test message" https://ntfy.sh/reminders-a3f7c9e2b1d4f6a8
```
If this doesn't work on your phone, the issue is with ntfy.sh or your phone setup, not your server.

**Check 3: Phone app issues**
- **iOS:** Settings → Notifications → ntfy → toggle OFF then ON
- **Android:** Force close ntfy app → reopen → resubscribe to topic

**Check 4: Network issues**
```bash
# Verify your server can reach ntfy.sh
curl -v https://ntfy.sh/
```

### "Server won't start"

```bash
# Error: EADDRINUSE (port already in use)
netstat -tlnp | grep 3000
kill -9 <PID>

# Try a different port
PORT=3001 npm start
```

### "Web form works but no API requests reaching server"

- Check browser console for errors (F12)
- Verify `/api/remind` endpoint exists in `server.js`
- Check server logs for request errors

---

## Security & Privacy

### ⚠️ Important: Your topic is secret

- **Don't share your topic publicly** (not in READMEs, commits, or code repos)
- Your topic acts like a password—anyone with it can send messages
- Use a long, random string (example: `goals-9f3d2c1a` is too simple, use `goals-a3f7c9e2b1d4f6a8f9c2d3e4`)

### How anonymous it works

✅ **Private:**
- No username/email collected
- No user accounts
- No database tracking

⚠️ **Not completely anonymous:**
- Your server sees sender IP addresses in logs
- ntfy.sh sees messages in transit (use HTTPS in production)
- Don't rely on this for truly sensitive communications

### Best practices

1. **Use HTTPS in production** (not HTTP)
   - Use reverse proxy (nginx) with Let's Encrypt SSL
   - Or deploy to Heroku/Railway/Fly which handle SSL

2. **Rotate your topic periodically**
   - Change `NTFY_TOPIC` monthly or if suspected compromise
   - Re-subscribe your phone app to the new topic

3. **Monitor logs**
   - Watch for spam/abuse attempts
   - Consider adding rate limiting

4. **Keep Node.js updated**
   ```bash
   node --version  # Check current
   nvm install --lts  # Update to latest LTS
   ```

---

## Development

### Run with auto-reload

```bash
npm run dev
```

This watches for file changes and restarts the server automatically.

### Testing locally with curl

```bash
# Send test notification
curl -X POST http://localhost:3000/api/remind \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from curl"}'

# List recent notifications
curl https://ntfy.sh/reminders-a3f7c9e2b1d4f6a8/json
```

---

## License

MIT License - See LICENSE file for details

---

## Support

- 📖 [ntfy.sh Documentation](https://docs.ntfy.sh/)
- 🐛 [Report Issues](https://github.com/Jinguxx/experiment-notification-app/issues)
- 💬 [Discussions](https://github.com/Jinguxx/experiment-notification-app/discussions)
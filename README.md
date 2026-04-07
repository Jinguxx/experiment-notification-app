# Anonymous Encouragement Reminder

A tiny site where anyone can press one button (with an optional message) to send you an anonymous push notification.

## How it works

- The site serves a simple web form.
- A POST request goes to `/api/remind`.
- The server forwards the message to [`ntfy.sh`](https://ntfy.sh) so it appears on your phone.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Pick a private-ish topic name and subscribe to it in the ntfy app on your phone.

3. Set your environment variable and start the app:

   ```bash
   NTFY_TOPIC=your-random-topic npm start
   ```

4. Open http://localhost:3000

## Privacy notes

- No login is required.
- The API does not ask for a username.
- This is not bulletproof anonymity (IP addresses still hit your server), but no identity field is collected.

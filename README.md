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

2. Pick a **hard-to-guess topic name** (example: `goals-9f3d2c1a`) and set it when starting the server:

   ```bash
   NTFY_TOPIC=goals-9f3d2c1a npm start
   ```

3. Open http://localhost:3000 and press **Send anonymous reminder**.

## Phone setup (receive notifications)

### iPhone (iOS)

1. Install the **ntfy** app from the App Store.
2. Open the app and allow notification permissions when prompted.
3. Tap **+ Add subscription**.
4. Enter your exact topic (same value as `NTFY_TOPIC`) and subscribe.
5. Send a test message from terminal:

   ```bash
   curl -d "test notification" https://ntfy.sh/goals-9f3d2c1a
   ```

6. Confirm the push appears on your lock screen.

### Android

1. Install the **ntfy** app from Google Play.
2. Open app → allow notifications and disable battery optimization for ntfy if prompted.
3. Tap **+** to add a subscription.
4. Enter your exact topic (same value as `NTFY_TOPIC`) and subscribe.
5. Send a test message:

   ```bash
   curl -d "test notification" https://ntfy.sh/goals-9f3d2c1a
   ```

6. Confirm the push appears in the notification tray.

## Troubleshooting

- No push received: verify the topic in app exactly matches `NTFY_TOPIC` (case-sensitive).
- Still no push: test direct publish with `curl` to confirm topic/app wiring.
- iPhone: check Settings → Notifications → ntfy is enabled.
- Android: ensure battery optimization is disabled for ntfy so background delivery works.

## Privacy notes

- No login is required.
- The API does not ask for a username.
- This is not bulletproof anonymity (IP addresses still hit your server), but no identity field is collected.

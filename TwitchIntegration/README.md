# Twitch Integration Service

Connects to Twitch IRC and API, aggregates chat/mod events, exposes REST and WebSocket APIs for real-time overlays and moderation tools.

## Features
- Real-time chat and whisper aggregation
- REST endpoints for sending whispers, mod actions, and querying messages
- WebSocket API for live event streaming
- Rate-limiting and reconnection logic

## Usage
1. Copy `.env.example` to `.env` and fill in your Twitch credentials.
2. Run `npm install`
3. Start with `npm start`

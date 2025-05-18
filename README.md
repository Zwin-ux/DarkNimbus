# Nimbus8: Unified Mod & Community Toolkit

Nimbus8 provides a seamless platform for Twitch streamers and Discord community managers to moderate, communicate, and overlay events across both platforms.

## Project Structure

- `DiscordSocialSDKWrapper/` — C++ microservice wrapping Discord Game SDK
- `TwitchIntegration/` — Node.js service for Twitch chat/mod/whisper integration
- `ApiGateway/` — Node.js API Gateway for unified OAuth, REST, and WebSocket endpoints
- `OverlayFrontend/` — React app for mod dashboard and real-time overlays

## Getting Started

1. Clone the repo and copy each `.env.example` to `.env` in all services.
2. Install dependencies (`npm install` or build as needed in each subproject).
3. Start services individually (`npm start` or your build/run command).

## Contributing

- Use feature branches and submit PRs.
- Keep code readable, modular, and well-documented.
- See each subproject's README for more details.

## License
MIT

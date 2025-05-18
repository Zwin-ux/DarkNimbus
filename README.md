# Nimbus8: Unified Mod & Community Toolkit

Nimbus8 provides a seamless platform for Twitch streamers and Discord community managers to moderate, communicate, and overlay events across both platforms.

##  Features/Goals

- **Unified Chat**: Merge Twitch and Discord chats into a single, real-time feed
- **Cross-Platform Moderation**: Moderate both Twitch and Discord from one dashboard
- **Role Sync**: Automatically sync Twitch subscriber status with Discord roles
- **Real-time Alerts**: Get notified of events across platforms in real-time
- **Customizable Overlays**: Add interactive overlays to your stream

## 🛠 Tech Stack

- **Frontend**: React, Material-UI, WebSocket
- **Backend**: Node.js, Express
- **Twitch Integration**: tmi.js
- **Discord Integration**: discord.js
- **Real-time**: WebSockets for live updates
- **Database**: SQLite (for user data and settings)

## 📦 Project Structure

- `DiscordSocialSDKWrapper/` — C++ microservice wrapping Discord Game SDK
- `TwitchIntegration/` — Node.js service for Twitch chat/mod/whisper integration
- `ApiGateway/` — Node.js API Gateway for unified OAuth, REST, and WebSocket endpoints
- `OverlayFrontend/` — React app for mod dashboard and real-time overlays

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- Twitch Developer Account
- Discord Bot Token

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/Nimbus8.git
   cd Nimbus8
   ```

2. **Set up environment variables**
   - Copy `.env.example` to `.env` in each service directory
   - Update the environment variables with your Twitch and Discord credentials

3. **Install dependencies**
   ```bash
   # Install dependencies for each service
   cd ApiGateway && npm install && cd ..
   cd TwitchIntegration && npm install && cd ..
   cd OverlayFrontend && npm install && cd ..
   ```

4. **Start the services**
   - In separate terminals, start each service:
     ```bash
     # Terminal 1: API Gateway
     cd ApiGateway && npm start
     
     # Terminal 2: Twitch Integration
     cd TwitchIntegration && npm start
     
     # Terminal 3: Frontend
     cd OverlayFrontend && npm start
     ```

5. **Access the dashboard**
   - Open your browser to `http://localhost:3000`

## 🔌 Unified Chat Setup

The unified chat feature allows you to merge Twitch and Discord messages into a single feed. Here's how to set it up:

1. **Configure Twitch Integration**
   - In `TwitchIntegration/.env`, ensure these variables are set:
     ```
     TWITCH_USERNAME=your_twitch_username
     TWITCH_OAUTH=oauth:your_oauth_token
     TWITCH_CHANNELS=channel1,channel2
     API_GATEWAY_URL=http://localhost:5000
     ```

2. **Configure API Gateway**
   - In `ApiGateway/.env`, set:
     ```
     PORT=5000
     FRONTEND_URL=http://localhost:3000
     ```

3. **Start the services**
   - Start the API Gateway and Twitch Integration services
   - The frontend will automatically connect to the WebSocket server

4. **Test the chat**
   - Use the test message panel in the dashboard to send test messages
   - Messages from Twitch and Discord will appear in the unified chat feed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Twitch](https://dev.twitch.tv/) for their API
- [Discord](https://discord.com/developers/docs/intro) for their API
- [Material-UI](https://mui.com/) for the awesome React components
- See each subproject's README for more details.

## License
MIT

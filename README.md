# Nimbus8: Unified Gaming & Community Platform

Nimbus8 provides seamless integration between gaming platforms and social/streaming services, starting with Discord, Twitch, and now Minecraft Bedrock Edition. Our platform enables players to connect, communicate, and collaborate across platforms with enhanced social features.

## Features/Goals

### Core Features
- **Unified Chat**: Merge Twitch and Discord chats into a single, real-time feed
- **Cross-Platform Moderation**: Moderate both Twitch and Discord from one dashboard
- **Role Sync**: Automatically sync Twitch subscriber status with Discord roles
- **Real-time Alerts**: Get notified of events across platforms in real-time
- **Customizable Overlays**: Add interactive overlays to your stream

### Minecraft Bedrock Integration (New!)
- **Account Linking**: Connect your Minecraft and Discord accounts with secure OAuth2 flow
- **Rich Presence**: Show your Minecraft activity on Discord (game mode, server, etc.)
- **Cross-Platform Invites**: Invite Discord friends to your Minecraft game with one click
- **Voice & Text Chat**: Seamless communication between Minecraft and Discord (Coming in V2)
- **Friend List Integration**: See your Discord friends who are playing Minecraft (Coming in V2)

## 🛠 Tech Stack

- **Frontend**: React, Material-UI, WebSocket
- **Backend**: Node.js, Express
- **Twitch Integration**: tmi.js
- **Discord Integration**: discord.js, Discord Game SDK
- **Minecraft Integration**: Bedrock Addon API, External Bridge Server
- **Real-time**: WebSockets, Discord RPC
- **Database**: SQLite (for user data and settings)
- **Security**: OAuth2, Encrypted Token Storage

## 📦 Project Structure

- `DiscordSocialSDKWrapper/` — C++ microservice wrapping Discord Game SDK
- `TwitchIntegration/` — Node.js service for Twitch chat/mod/whisper integration
- `MinecraftBridge/` — Service connecting Minecraft Bedrock to Discord (New!)
- `ApiGateway/` — Node.js API Gateway for unified OAuth, REST, and WebSocket endpoints
- `OverlayFrontend/` — React app for mod dashboard and real-time overlays
- `BedrockAddon/` — Minecraft Bedrock addon for in-game integration (New!)

## 🎮 Minecraft Bedrock Integration

### Key Features

1. **Account Linking**
   - Secure OAuth2 flow for connecting Minecraft and Discord accounts
   - Optional automatic account creation for seamless onboarding

2. **Rich Presence**
   - Shows current game activity in Discord
   - Customizable server information display
   - Real-time status updates

3. **Cross-Platform Invites**
   - One-click join links from Discord to Minecraft
   - Deep linking support for direct server joining
   - Server availability indicators

4. **Voice & Text Chat (Coming in V2)**
   - In-game Discord voice channels
   - Proximity-based voice chat
   - Cross-platform text messaging

### Setup Instructions

1. **Enable Developer Mode in Minecraft Bedrock**
   - Go to Settings > Profile
   - Enable "Developer Mode" and "Allow Server Textures"

2. **Configure Minecraft Bridge**
   - Navigate to `MinecraftBridge` directory
   - Copy `.env.example` to `.env`
   - Add your Discord bot token and OAuth2 credentials

3. **Install the Bedrock Addon**
   - Locate your Minecraft behavior packs folder
   - Copy the contents of `BedrockAddon` to a new folder in the behavior packs directory
   - Enable the pack in your Minecraft world settings

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Twitch Developer Account
- Discord Bot Token
- Minecraft Bedrock Edition (for testing)
- Discord Developer Application (for OAuth2)

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

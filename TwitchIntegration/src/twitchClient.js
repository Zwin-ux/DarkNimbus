import tmi from 'tmi.js';
import EventEmitter from 'events';

class TwitchClient extends EventEmitter {
  constructor(options) {
    super();
    this.client = new tmi.Client(options);
    this.client.on('message', (channel, userstate, message, self) => {
      this.emit('chat', { channel, userstate, message, self });
    });
    this.client.on('whisper', (from, userstate, message, self) => {
      this.emit('whisper', { from, userstate, message, self });
    });
    // Listen for ban events
    this.client.on('ban', (channel, username, reason) => {
      this.emit('ban', { channel, username, reason });
    });
    // Add more event listeners for subs, mods, etc.
  }
  connect() { this.client.connect(); }
  sendWhisper(to, message) { return this.client.whisper(to, message); }
  banUser(channel, username, reason = '') {
    return this.client.ban(channel, username, reason);
  }
  // Add more methods for mod actions, etc.
}

export default TwitchClient;

#include "server.h"
#include <discord.h>
#include <spdlog/spdlog.h>

IDiscordCore* g_core = nullptr;

void init_discord_sdk() {
    DiscordCreateParams params{};
    DiscordCreateParamsSetDefault(&params);
    params.client_id = /* TODO: your Discord app client ID as uint64_t */ 0;
    params.flags = DiscordCreateFlags_Default;
    DiscordResult result = DiscordCreate(DISCORD_VERSION, &params, &g_core);
    if (result != DiscordResult_Ok) {
        spdlog::error("Failed to initialize Discord SDK: {}", static_cast<int>(result));
        exit(1);
    }
    spdlog::info("Discord SDK initialized.");
}

void shutdown_discord_sdk() {
    if (g_core) {
        delete g_core;
        g_core = nullptr;
        spdlog::info("Discord SDK shutdown.");
    }
}

int main() {
    init_discord_sdk();
    Server server;
    server.start(8080);
    shutdown_discord_sdk();
    return 0;
}

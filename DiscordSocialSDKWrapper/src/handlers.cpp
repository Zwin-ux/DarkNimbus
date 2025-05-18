#include "handlers.h"
#include <queue>
#include <mutex>
#include <spdlog/spdlog.h>

// --- EventBus Implementation ---
void EventBus::subscribe(Plugin* plugin) {
    plugins.push_back(plugin);
}
void EventBus::publish(const Event& event) {
    for (auto* plugin : plugins) {
        plugin->on_event(event);
    }
}

// --- Async Event Queue ---
namespace {
    std::queue<Event> event_queue;
    std::mutex queue_mutex;
    EventBus global_event_bus;
}

void emit_event(const Event& event) {
    std::lock_guard<std::mutex> lock(queue_mutex);
    event_queue.push(event);
    global_event_bus.publish(event); // Also notify plugins
}

// --- Handler Stubs ---
#include <cstdlib>
#include <discord.h>
extern IDiscordCore* g_core;

std::string handle_link_account(const nlohmann::json& body, std::function<void(Event)> emit_event) {
    std::string request_id = "req_" + std::to_string(rand());
    spdlog::info("[link_account] Received request_id: {}", request_id);
    if (!g_core) {
        emit_error(request_id, "Discord SDK not initialized");
        return request_id;
    }
    
    // Fetch current user info as a demonstration of linking
    g_core->get_user_manager()->get_current_user(
        [request_id, emit_event](DiscordUser* user) {
            if (user) {
                Event ev{EventType::AccountLinked, request_id, {
                    {"status", "linked"},
                    {"user_id", std::to_string(user->id)},
                    {"username", user->username}
                }};
                emit_event(ev);
            } else {
                emit_error(request_id, "Failed to fetch user info");
            }
        }
    );
    return request_id;
}

std::string handle_send_dm(const nlohmann::json& body, std::function<void(Event)> emit_event) {
    std::string request_id = "req_" + std::to_string(rand());
    spdlog::info("[send_dm] DM to: {} | request_id: {}", body.value("to", "<none>"), request_id);
    // Simulate async DM send
    Event ev{EventType::DMResult, request_id, { {"status", "sent"}, {"to", body.value("to", "")} }};
    emit_event(ev);
    return request_id;
}

std::string handle_create_lobby(const nlohmann::json& body, std::function<void(Event)> emit_event) {
    std::string request_id = "req_" + std::to_string(rand());
    spdlog::info("[create_lobby] request_id: {}", request_id);
    // Simulate async lobby creation
    Event ev{EventType::LobbyCreated, request_id, { {"status", "created"}, {"lobby_id", "lobby123"} }};
    emit_event(ev);
    return request_id;
}

nlohmann::json handle_get_friends(const nlohmann::json& body) {
    // Simulate friends list
    return nlohmann::json::array({{"id", "user1"}, {"id", "user2"}});
}

std::string handle_kick_user(const nlohmann::json& body, std::function<void(Event)> emit_event) {
    std::string request_id = "req_" + std::to_string(rand());
    spdlog::info("[kick_user] Kick user: {} | request_id: {}", body.value("user_id", "<none>"), request_id);
    // Simulate async kick
    Event ev{EventType::PluginEvent, request_id, { {"status", "kicked"}, {"user_id", body.value("user_id", "")} }};
    emit_event(ev);
    return request_id;
}

std::string handle_timeout_user(const nlohmann::json& body, std::function<void(Event)> emit_event) {
    std::string request_id = "req_" + std::to_string(rand());
    spdlog::info("[timeout_user] Timeout user: {} | duration: {} | request_id: {}", body.value("user_id", "<none>"), body.value("duration", 0), request_id);
    // Simulate async timeout
    Event ev{EventType::PluginEvent, request_id, { {"status", "timed_out"}, {"user_id", body.value("user_id", "")}, {"duration", body.value("duration", 0)} }};
    emit_event(ev);
    return request_id;
}

std::string handle_assign_role(const nlohmann::json& body, std::function<void(Event)> emit_event) {
    std::string request_id = "req_" + std::to_string(rand());
    spdlog::info("[assign_role] Assign role: {} to user: {} | request_id: {}", body.value("role", "<none>"), body.value("user_id", "<none>"), request_id);
    // Simulate async role assignment
    Event ev{EventType::PluginEvent, request_id, { {"status", "role_assigned"}, {"user_id", body.value("user_id", "")}, {"role", body.value("role", "")} }};
    emit_event(ev);
    return request_id;
}

// --- Error Handling Example ---
void emit_error(const std::string& request_id, const std::string& message) {
    Event ev{EventType::Error, request_id, { {"error", message} }};
    emit_event(ev);
    spdlog::error("[error] {}: {}", request_id, message);
}

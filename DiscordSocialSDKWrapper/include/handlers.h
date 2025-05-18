#pragma once
#include <string>
#include <functional>
#include <nlohmann/json.hpp>

// Event types for async event queue
enum class EventType {
    AccountLinked,
    DMResult,
    LobbyCreated,
    FriendsList,
    PresenceUpdated,
    ChannelLinked,
    Error,
    PluginEvent
};

struct Event {
    EventType type;
    std::string request_id;
    nlohmann::json payload;
};

// Plugin interface
class Plugin {
public:
    virtual ~Plugin() = default;
    virtual void on_event(const Event& event) = 0;
};

// EventBus for plugin/event extensibility
class EventBus {
public:
    void subscribe(Plugin* plugin);
    void publish(const Event& event);
private:
    std::vector<Plugin*> plugins;
};

// Handler signatures
std::string handle_link_account(const nlohmann::json& body, std::function<void(Event)> emit_event);
std::string handle_send_dm(const nlohmann::json& body, std::function<void(Event)> emit_event);
std::string handle_create_lobby(const nlohmann::json& body, std::function<void(Event)> emit_event);
nlohmann::json handle_get_friends(const nlohmann::json& body);
std::string handle_kick_user(const nlohmann::json& body, std::function<void(Event)> emit_event);
std::string handle_timeout_user(const nlohmann::json& body, std::function<void(Event)> emit_event);
std::string handle_assign_role(const nlohmann::json& body, std::function<void(Event)> emit_event);
// ... Add more as needed

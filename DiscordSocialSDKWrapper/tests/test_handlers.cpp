#define CATCH_CONFIG_MAIN
#include <catch2/catch.hpp>
#include "../include/handlers.h"
#include <nlohmann/json.hpp>

TEST_CASE("Account linking emits event and returns request_id") {
    bool event_emitted = false;
    Event last_event;
    auto emit = [&](const Event& ev) {
        event_emitted = true;
        last_event = ev;
    };
    nlohmann::json body = { {"user", "testuser"} };
    std::string req_id = handle_link_account(body, emit);
    REQUIRE(!req_id.empty());
    REQUIRE(event_emitted);
    REQUIRE(last_event.type == EventType::AccountLinked);
}

TEST_CASE("Sending DM emits event and returns request_id") {
    bool event_emitted = false;
    Event last_event;
    auto emit = [&](const Event& ev) {
        event_emitted = true;
        last_event = ev;
    };
    nlohmann::json body = { {"to", "user123"}, {"message", "Hello!"} };
    std::string req_id = handle_send_dm(body, emit);
    REQUIRE(!req_id.empty());
    REQUIRE(event_emitted);
    REQUIRE(last_event.type == EventType::DMResult);
    REQUIRE(last_event.payload["to"] == "user123");
}

TEST_CASE("Creating lobby emits event and returns request_id") {
    bool event_emitted = false;
    Event last_event;
    auto emit = [&](const Event& ev) {
        event_emitted = true;
        last_event = ev;
    };
    nlohmann::json body = { {"name", "Lobby1"} };
    std::string req_id = handle_create_lobby(body, emit);
    REQUIRE(!req_id.empty());
    REQUIRE(event_emitted);
    REQUIRE(last_event.type == EventType::LobbyCreated);
    REQUIRE(last_event.payload["status"] == "created");
}

TEST_CASE("Getting friends returns array") {
    nlohmann::json body = {};
    auto friends = handle_get_friends(body);
    REQUIRE(friends.is_array());
    REQUIRE(friends.size() > 0);
}

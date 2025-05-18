#include "server.h"
#include "handlers.h"
#include <crow.h>
#include <memory>
#include <spdlog/spdlog.h>
#include <nlohmann/json.hpp>
#include <queue>
#include <mutex>

// WS event queue for all clients
namespace {
    std::queue<Event> ws_event_queue;
    std::mutex ws_queue_mutex;
}

void Server::start(int port) {
    crow::SimpleApp app;

    // Health endpoint
    CROW_ROUTE(app, "/health").methods(crow::HTTPMethod::GET)([](){
        return crow::response(200, R"({\"status\":\"ok\",\"sdk\":\"connected\"})");
    });

    // Link account endpoint
    CROW_ROUTE(app, "/link_account").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string request_id = handle_link_account(body, emit_event);
            return crow::response(202, nlohmann::json{{"request_id", request_id}, {"status", "pending"}}.dump());
        } catch (const std::exception& e) {
            spdlog::error("/link_account error: {}", e.what());
            return crow::response(400, nlohmann::json{{"error", e.what()}}.dump());
        }
    });

    // Send DM endpoint
    CROW_ROUTE(app, "/send_dm").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string request_id = handle_send_dm(body, emit_event);
            return crow::response(202, nlohmann::json{{"request_id", request_id}, {"status", "pending"}}.dump());
        } catch (const std::exception& e) {
            spdlog::error("/send_dm error: {}", e.what());
            return crow::response(400, nlohmann::json{{"error", e.what()}}.dump());
        }
    });

    // Kick user endpoint
    CROW_ROUTE(app, "/kick_user").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string request_id = handle_kick_user(body, emit_event);
            return crow::response(202, nlohmann::json{{"request_id", request_id}, {"status", "pending"}}.dump());
        } catch (const std::exception& e) {
            spdlog::error("/kick_user error: {}", e.what());
            return crow::response(400, nlohmann::json{{"error", e.what()}}.dump());
        }
    });

    // Timeout user endpoint
    CROW_ROUTE(app, "/timeout_user").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string request_id = handle_timeout_user(body, emit_event);
            return crow::response(202, nlohmann::json{{"request_id", request_id}, {"status", "pending"}}.dump());
        } catch (const std::exception& e) {
            spdlog::error("/timeout_user error: {}", e.what());
            return crow::response(400, nlohmann::json{{"error", e.what()}}.dump());
        }
    });

    // Assign role endpoint
    CROW_ROUTE(app, "/assign_role").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string request_id = handle_assign_role(body, emit_event);
            return crow::response(202, nlohmann::json{{"request_id", request_id}, {"status", "pending"}}.dump());
        } catch (const std::exception& e) {
            spdlog::error("/assign_role error: {}", e.what());
            return crow::response(400, nlohmann::json{{"error", e.what()}}.dump());
        }
    });

    // Create lobby endpoint
    CROW_ROUTE(app, "/create_lobby").methods(crow::HTTPMethod::POST)([](const crow::request& req){
        try {
            auto body = nlohmann::json::parse(req.body);
            std::string request_id = handle_create_lobby(body, emit_event);
            return crow::response(202, nlohmann::json{{"request_id", request_id}, {"status", "pending"}}.dump());
        } catch (const std::exception& e) {
            spdlog::error("/create_lobby error: {}", e.what());
            return crow::response(400, nlohmann::json{{"error", e.what()}}.dump());
        }
    });

    // Get friends endpoint
    CROW_ROUTE(app, "/get_friends").methods(crow::HTTPMethod::GET)([](const crow::request& req){
        try {
            auto friends = handle_get_friends({});
            return crow::response(200, friends.dump());
        } catch (const std::exception& e) {
            spdlog::error("/get_friends error: {}", e.what());
            return crow::response(400, nlohmann::json{{"error", e.what()}}.dump());
        }
    });

    // WebSocket: subscribe_events
    CROW_ROUTE(app, "/subscribe_events").websocket()
    .onopen([](crow::websocket::connection& conn){
        spdlog::info("WebSocket client connected");
    })
    .onmessage([](crow::websocket::connection& conn, const std::string& data, bool is_binary){
        // No-op: WS is for push events only
    })
    .onclose([](crow::websocket::connection& conn, const std::string& reason){
        spdlog::info("WebSocket client disconnected: {}", reason);
    })
    .onping([](crow::websocket::connection& conn, const std::string& payload){
        conn.pong(payload);
    })
    .onidle([](crow::websocket::connection& conn){
        // Periodically send events from queue
        std::lock_guard<std::mutex> lock(ws_queue_mutex);
        while (!ws_event_queue.empty()) {
            const Event& ev = ws_event_queue.front();
            nlohmann::json j = { {"event", static_cast<int>(ev.type)}, {"request_id", ev.request_id}, {"payload", ev.payload} };
            conn.send_text(j.dump());
            ws_event_queue.pop();
        }
    });

    spdlog::info("Starting server on port {}", port);
    app.port(port).multithreaded().run();
}

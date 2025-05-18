cmake_minimum_required(VERSION 3.15)
project(DiscordSocialSDKWrapper VERSION 0.1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Dependencies
find_package(Threads REQUIRED)
find_package(SQLite3 REQUIRED)

# Include Crow (header-only)
include_directories(third_party/crow/include)
# Include nlohmann_json (header-only)
include_directories(third_party/json/include)
# Include spdlog
include_directories(third_party/spdlog/include)

# Discord Game SDK (in third_party/discord_game_sdk)
include_directories(third_party/discord_game_sdk/include)
link_directories(${CMAKE_SOURCE_DIR}/third_party/discord_game_sdk/lib)

add_executable(discord_sdk_server
    src/main.cpp
    src/server.cpp
    src/handlers.cpp
    src/logger.cpp
)

target_link_libraries(discord_sdk_server PRIVATE Threads::Threads SQLite::SQLite3 discord_game_sdk)

# For future: add tests
# enable_testing()
# add_subdirectory(tests)

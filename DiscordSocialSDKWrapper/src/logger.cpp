#include <spdlog/spdlog.h>

void init_logging() {
    spdlog::set_level(spdlog::level::info);
    spdlog::set_pattern("[%Y-%m-%d %H:%M:%S] [%l] %v");
}

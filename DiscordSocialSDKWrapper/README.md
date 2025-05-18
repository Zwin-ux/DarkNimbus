# DiscordSocialSDKWrapper

A C++ microservice exposing Discord Social SDK features via async HTTP/WebSocket API.

## Structure
- `src/` - Source files
- `include/` - Public headers
- `third_party/` - External dependencies
- `tests/` - Unit/integration tests
- `docs/` - OpenAPI spec, architecture notes

## Build
Uses CMake. See `CMakeLists.txt` for dependencies.

---

## Endpoints (Sample)
- `/health` (GET): Service/SDK status
- `/link_account` (POST): Start OAuth/account linking
- `/subscribe_events` (WebSocket): Subscribe to async events

---

## Next Steps
- Implement endpoint handlers in `src/`
- Extend OpenAPI spec in `docs/openapi.yaml`

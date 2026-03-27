# Station Service Plan

## 1. Purpose of the Station Service

The Station Service is responsible for **station data and station lookup**.

Its core job is to answer questions like:

- What police stations exist?
- What are the details of a specific station?
- Which station is nearest to a given location?
- Which stations are inside a district or area?

This service should **not** own report creation, case creation, or alert creation.

## 2. Most Important Design Decision

When a citizen submits a report, the Station Service should help determine the correct station.

But the Station Service itself should **not send the alert**.

### Correct responsibility split

- **Station Service**
  - finds or validates the nearest station
  - returns station details

- **Report Service**
  - creates the report
  - stores the chosen `station_id`
  - calls Alert/Notification Service after the report is saved

- **Alert/Notification Service**
  - creates the actual alert record for that station

This is the cleanest architecture for your assignment because each service keeps a clear business boundary.

## 3. Recommended End-to-End Flow

### Option A: Frontend resolves station first

1. Citizen sends GPS coordinates to Station Service.
2. Station Service returns the nearest station.
3. Frontend shows the nearest station or uses it automatically.
4. Citizen submits the report to Report Service with the selected `station_id`.
5. Report Service stores the report.
6. Report Service calls Alert/Notification Service with the `station_id` and report data.
7. Alert/Notification Service creates an alert for that station.

### Option B: Report Service resolves station internally

1. Citizen submits report with location coordinates.
2. Report Service calls Station Service internally.
3. Station Service returns the nearest station.
4. Report Service stores the report with that `station_id`.
5. Report Service calls Alert/Notification Service.

### Best option for this assignment

**Option A** is easier to explain and easier to debug.

Why:

- simpler service interaction
- easier Swagger demo
- easier Postman testing
- fewer hidden internal dependencies

## 4. Station Service Responsibilities

Your service should own these responsibilities:

- maintain station master data
- provide list and detail endpoints
- support district filtering
- calculate nearest stations from latitude and longitude
- validate whether a given station ID exists
- expose its own Swagger documentation
- provide a health check endpoint

Your service should not:

- create alerts
- create reports
- create cases
- store user data
- store uploaded evidence

## 5. Recommended Technology Stack

For this repo, the best Station Service stack is:

- `Node.js`
- `Express.js`
- `better-sqlite3`
- `geolib`
- `dotenv`
- `cors`
- `morgan`
- `swagger-jsdoc`
- `swagger-ui-express`

### Why this is the best choice

- it matches the rest of the repo direction
- SQLite is local and stable
- no external DB credentials are needed
- `geolib` is enough for nearest-station calculation
- Swagger integration is straightforward
- easier for assignment demo and screenshots

## 6. Station Service Database Design

Use a local SQLite database file like:

- `station-service/db/stations.db`

### Main table: `stations`

Suggested columns:

- `id` INTEGER PRIMARY KEY AUTOINCREMENT
- `code` TEXT UNIQUE
- `name` TEXT NOT NULL
- `district` TEXT NOT NULL
- `division` TEXT
- `address` TEXT NOT NULL
- `phone` TEXT
- `latitude` REAL NOT NULL
- `longitude` REAL NOT NULL
- `is_active` INTEGER DEFAULT 1
- `created_at` TEXT DEFAULT CURRENT_TIMESTAMP
- `updated_at` TEXT DEFAULT CURRENT_TIMESTAMP

### Why these fields

- `id` is the service-level primary key
- `code` gives a readable station identifier
- `latitude` and `longitude` are required for nearest lookup
- `district` supports filtering and presentation
- `is_active` helps if you need to disable a station without deleting it

## 7. Seed Data Strategy

Seed the database with sample police stations.

Do not claim it is a full national production dataset.

Use 8 to 15 realistic sample stations from different districts, for example:

- Colombo Fort Police Station
- Cinnamon Gardens Police Station
- Negombo Police Station
- Kandy Police Station
- Galle Police Station
- Jaffna Police Station
- Kurunegala Police Station

This is enough for the assignment and for nearby search demos.

## 8. Recommended API Design

All routes should keep the full prefix so the gateway can proxy them cleanly.

Base path:

- `/api/stations`

### 8.1 Health Check

- `GET /api/stations/health`

Purpose:

- confirm the service is running
- useful for demo and debugging

### 8.2 List Stations

- `GET /api/stations`

Optional query parameters:

- `district`
- `division`
- `active`

Example:

- `/api/stations?district=Colombo`

### 8.3 Get Station by ID

- `GET /api/stations/:id`

Purpose:

- return one station record

### 8.4 Find Nearby Stations

- `GET /api/stations/nearby`

Required query parameters:

- `lat`
- `lng`

Optional query parameters:

- `radiusKm`
- `limit`

Example:

- `/api/stations/nearby?lat=6.9271&lng=79.8612&radiusKm=20&limit=3`

Response should include:

- station details
- calculated distance

### 8.5 Validate Station

- `GET /api/stations/:id/validate`

Purpose:

- allow other services or clients to confirm a station exists and is active

This is optional, but useful if Report Service wants a simple validation endpoint.

### 8.6 Create Station

- `POST /api/stations`

Use this only if your team wants admin-like demo behavior.

For the assignment MVP, read-heavy behavior is enough, so this can be optional.

### 8.7 Update Station

- `PUT /api/stations/:id`

Also optional for the MVP.

## 9. Recommended Response Format

Keep response format consistent with the rest of the team.

### Success example

```json
{
  "success": true,
  "message": "Nearby stations retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Colombo Fort Police Station",
      "district": "Colombo",
      "latitude": 6.9344,
      "longitude": 79.8428,
      "distanceKm": 2.14
    }
  ]
}
```

### Error example

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "lat is required",
    "lng is required"
  ]
}
```

## 10. Nearby Station Logic

Use `geolib` for distance calculation.

### Logic

1. Read all active stations from SQLite.
2. Parse request coordinates.
3. Calculate distance from request point to each station.
4. Convert distance to kilometers.
5. Sort by nearest first.
6. Apply optional `radiusKm` filter.
7. Apply optional `limit`.
8. Return the nearest station list.

### Why this is good enough

- simple to implement
- easy to explain
- stable for a small seeded dataset
- appropriate for assignment scope

## 11. How Alerts Should Work with Your Service

This is the key integration question.

### Best architecture

The Station Service should **not directly send alerts**.

Instead:

1. Station Service returns nearest station information.
2. Report Service creates a report using that `station_id`.
3. Report Service calls Alert/Notification Service.
4. Alert/Notification Service stores the alert for that station.

### Why this is the correct approach

- Station Service owns station lookup, not alerts
- Alert Service owns alert records
- Report Service owns the business event "a report was created"
- cleaner microservice responsibility split

### What Station Service should provide to support this

At most, it should provide:

- nearest station endpoint
- station details endpoint
- station validation endpoint

That is enough.

## 12. Integration Contract with Report Service

The cleanest contract is:

### Step 1: frontend calls Station Service

```http
GET /api/stations/nearby?lat=6.9271&lng=79.8612&limit=1
```

### Step 2: Station Service responds

```json
{
  "success": true,
  "message": "Nearby stations retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Colombo Fort Police Station",
      "district": "Colombo",
      "distanceKm": 2.14
    }
  ]
}
```

### Step 3: frontend submits report

```json
{
  "station_id": 1,
  "incident_type": "theft",
  "description": "Suspicious bag snatching",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "media_urls": []
}
```

### Step 4: Report Service triggers alert

Report Service internally calls Notification Service with:

```json
{
  "station_id": 1,
  "report_id": 55,
  "message": "New theft report received near Colombo"
}
```

## 13. Swagger Plan for Your Service

Your service must expose its own Swagger UI.

Recommended native Swagger URL:

- `http://localhost:3004/api/stations/api-docs`

Recommended gateway Swagger URL:

- `http://localhost:3000/api/stations/api-docs`

### What your Swagger should include

- service title and description
- server URLs
- all Station Service endpoints
- query parameters for nearby search
- example success responses
- example error responses

### Suggested servers section

- `http://localhost:3004`
- `http://localhost:3000`

### Minimum documented endpoints

- `GET /api/stations/health`
- `GET /api/stations`
- `GET /api/stations/{id}`
- `GET /api/stations/nearby`

## 14. Folder Structure for Station Service

Recommended structure:

```text
station-service/
  index.js
  package.json
  .env
  db/
    database.js
    init.sql
    seed.js
    stations.db
  routes/
    stationRoutes.js
  controllers/
    stationController.js
  services/
    stationService.js
  repositories/
    stationRepository.js
  validators/
    stationValidator.js
  docs/
    swagger.js
```

### Why this structure is useful

- route handling is separated from business logic
- DB queries are isolated
- Swagger setup is easier to maintain
- looks more like Associate Software Engineer work

## 15. Recommended Implementation Order

### Phase 1: Base Setup

1. Create `package.json`
2. Install dependencies
3. Add `.env`
4. Add Express base app
5. Add CORS, JSON middleware, and Morgan
6. Add health route
7. Add Swagger

### Phase 2: Database Setup

1. Create SQLite DB connection
2. Create `stations` table
3. Add seed script
4. Test seeded data load

### Phase 3: Read APIs

1. Implement `GET /api/stations`
2. Implement `GET /api/stations/:id`
3. Implement `GET /api/stations/nearby`
4. Add validation for lat/lng

### Phase 4: Integration Support

1. Add station validation endpoint if needed
2. Make sure response shape is stable
3. Coordinate with Report Service about `station_id` usage
4. Coordinate with API Gateway owner about proxy path

### Phase 5: Documentation and Testing

1. Finalize Swagger docs
2. Test direct URL
3. Test via gateway
4. Capture screenshots

## 16. Validation Rules

### Nearby endpoint

- `lat` must exist
- `lng` must exist
- both must be numeric
- `radiusKm` must be numeric if provided
- `limit` must be numeric if provided

### Create/update station

- `name` required
- `district` required
- `address` required
- `latitude` required and numeric
- `longitude` required and numeric

## 17. Risks and How to Avoid Them

### Risk 1: Trying to own alerts inside Station Service

Why it is bad:

- mixes responsibilities
- creates tighter coupling
- makes your service harder to explain

Fix:

- keep alert creation in Alert/Notification Service

### Risk 2: Using external DB setup that slows the team

Why it is bad:

- more credentials
- more environment issues
- more demo risk

Fix:

- use SQLite locally for Station Service

### Risk 3: Hardcoding too much logic inside one file

Why it is bad:

- difficult to debug
- difficult to maintain

Fix:

- split routes, controller, service, repository, and docs

### Risk 4: Swagger added too late

Why it is bad:

- routing may work while docs break
- screenshots may be delayed

Fix:

- add Swagger at the beginning

## 18. Final Recommended Architecture for Your Service

The best Station Service design for this assignment is:

- **Language:** Node.js
- **Framework:** Express
- **Database:** SQLite with `better-sqlite3`
- **Geo logic:** `geolib`
- **Docs:** `swagger-jsdoc` + `swagger-ui-express`
- **Main purpose:** station directory and nearest-station resolution
- **Alert behavior:** do not create alerts directly; allow Report Service to use your result and trigger Alert Service

## 19. What You Should Tell the Team

When you explain your service to the team, use this summary:

> Station Service owns station data and nearest-station lookup. It helps the system decide which police station should handle an incident. Once the station is resolved, Report Service stores the report with that station ID, and Alert Service creates the station alert. This keeps service responsibilities clear and makes the architecture easier to scale and explain.

## 20. Immediate Next Step

Your immediate next implementation target should be:

1. build the Station Service with SQLite
2. seed sample station data
3. implement `GET /api/stations`
4. implement `GET /api/stations/nearby`
5. expose Swagger
6. integrate the service into the API Gateway

That is the strongest and safest path.

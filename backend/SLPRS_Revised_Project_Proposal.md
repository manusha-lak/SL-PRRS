# SL-PRRS Revised Project Proposal

## 1. Project Title

**SL-PRRS: Sri Lanka Police Rapid Report System**

An academic MVP backend for citizen incident reporting using a microservices architecture and a single API Gateway.

## 2. Proposal Summary

SL-PRRS is a backend system designed for a public safety reporting scenario in Sri Lanka. The system allows citizens to submit incident reports, attach supporting evidence, select a police station, and track progress using a reference code. Police officers can view alerts and update the case status.

This proposal is intentionally framed as an **academic MVP** for the assignment. The focus is on:

- correct microservice decomposition
- clean service boundaries
- API Gateway usage
- working Swagger documentation
- stable execution with no runtime errors

The goal is not to build a full production police platform. The goal is to demonstrate how a real-world domain can be implemented through multiple independent services behind a single gateway.

## 3. Problem Statement

Citizens often face difficulties when trying to report incidents quickly and safely. In many situations, traditional reporting methods are slow, inconvenient, or unclear. A digital reporting platform can improve accessibility and provide a more structured way to submit reports and follow up on them.

Common pain points in this domain include:

- lack of a direct digital reporting channel
- difficulty attaching supporting evidence
- uncertainty about which police station should handle the report
- limited visibility into report progress after submission

## 4. Proposed MVP Scope

For this assignment, the system will implement a **minimal viable product** with the following capabilities:

- user registration and login
- police station lookup
- incident report submission
- evidence upload for reports
- station alert creation
- case status tracking
- API Gateway routing for all services
- Swagger documentation for each service

## 5. Business Domain and Users

### Business Domain

Public Safety and Incident Reporting

### Target Users

- citizens who submit reports
- police officers who review reports and update case status
- administrators or demo users who manage sample data where needed

## 6. Key Design Principles

The solution is designed around the following principles:

- each microservice owns one business capability
- each service has its own database
- services communicate through APIs, not shared tables
- all client traffic can be routed through one API Gateway
- the solution must be simple enough to implement, test, and demonstrate reliably

## 7. System Architecture

The system follows a microservices architecture pattern. Each service runs independently with its own codebase, database, routes, and Swagger documentation. External requests are routed through a single API Gateway so that clients do not need to know the internal service ports.

### API Gateway Purpose

The API Gateway provides:

- a single entry point for the frontend or test client
- easier routing to the correct service
- simpler API access during demonstration
- a practical example of how multiple internal service ports can be hidden from clients

## 8. Port Allocation and Gateway Routing

| Component | Port | Gateway Route |
|---|---:|---|
| API Gateway | 3000 | Single entry point |
| Auth Service | 3001 | `/api/auth/*` |
| Report Service | 3002 | `/api/reports/*` |
| Evidence Service | 3003 | `/api/evidence/*` |
| Station Service | 3004 | `/api/stations/*` |
| Alert Service | 3005 | `/api/alerts/*` |
| Case Service | 3006 | `/api/cases/*` |

## 9. Microservices Overview

Each group member is responsible for one microservice. The API Gateway is a shared integration responsibility.

| Service | Responsibility | Main Outputs |
|---|---|---|
| Auth Service | User registration, login, JWT handling | authenticated users and tokens |
| Report Service | Create and retrieve incident reports | report records and reference codes |
| Evidence Service | Upload and retrieve report evidence | evidence metadata and file URLs |
| Station Service | Station listing and nearby station search | station data |
| Alert Service | Create station alerts when reports are submitted | unread and read alert records |
| Case Service | Maintain case lifecycle and status history | case timeline and current status |

## 10. Detailed Service Descriptions

### 10.1 Auth Service

**Purpose**

Manage citizen and officer authentication for the MVP.

**Key Endpoints**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/auth/verify`

**Scope Notes**

- supports simple registration and login
- issues JWT tokens
- supports role values such as `citizen` and `officer`
- identity handling is simplified for the assignment and not presented as government-grade verification

### 10.2 Report Service

**Purpose**

Store incident reports submitted by users and generate a tracking reference.

**Key Endpoints**

- `POST /api/reports`
- `GET /api/reports/my`
- `GET /api/reports/station/:stationId`
- `GET /api/reports/track/:referenceCode`

**Scope Notes**

- stores report metadata such as incident type, description, station ID, and location
- generates a reference code for tracking
- supports a privacy-oriented reporting mode for the MVP

### 10.3 Evidence Service

**Purpose**

Handle image uploads related to incident reports.

**Key Endpoints**

- `POST /api/evidence/upload`
- `GET /api/evidence/:filename`
- `GET /api/evidence/report/:reportId`

**Scope Notes**

- image support is the default MVP target
- video support can be added only if the team completes the stable core features first
- uploaded files are stored separately from report records

### 10.4 Station Service

**Purpose**

Maintain a directory of police stations for report routing.

**Key Endpoints**

- `GET /api/stations`
- `GET /api/stations/:id`
- `GET /api/stations/nearby`

**Scope Notes**

- uses seeded sample station data for the assignment
- can filter by district
- can return nearby stations using sample GPS coordinates

### 10.5 Alert Service

**Purpose**

Create and manage station alerts after report submission.

**Key Endpoints**

- `POST /api/alerts`
- `GET /api/alerts/station/:stationId`
- `PUT /api/alerts/:id/read`
- `GET /api/alerts/stats/:stationId`

**Scope Notes**

- creates stored alert records instead of claiming advanced real-time delivery
- helps officers quickly identify new reports assigned to their station

### 10.6 Case Service

**Purpose**

Track the progress of a submitted report and maintain status history.

**Key Endpoints**

- `GET /api/cases/:reportId`
- `GET /api/cases/track/:referenceCode`
- `PUT /api/cases/:reportId/status`
- `GET /api/cases/station/:stationId`

**Scope Notes**

- each report gets an initial case state
- officers can update status through a controlled workflow
- citizens can track progress by reference code

## 11. Core End-to-End Flow

The main MVP flow is as follows:

1. A citizen logs in through the Auth Service.
2. The citizen queries the Station Service to select an appropriate police station.
3. The citizen uploads image evidence through the Evidence Service.
4. The citizen submits the incident report through the Report Service.
5. The Report Service generates a reference code and stores the report.
6. The Report Service calls the Alert Service to create a station alert.
7. The Report Service or integration logic triggers an initial case record in the Case Service.
8. A police officer views alerts and updates the case status.
9. The citizen tracks the report using the generated reference code.

## 12. Data Ownership

Each service owns its own data:

- Auth Service: users, roles, credentials
- Report Service: incident reports and reference codes
- Evidence Service: file metadata and file paths
- Station Service: station records and location data
- Alert Service: station alert records
- Case Service: case status history and current case state

No service directly reads another service database. Communication happens through APIs.

## 13. Technology Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Web Framework | Express.js |
| API Gateway | `http-proxy-middleware` |
| Database | SQLite / `better-sqlite3` |
| Authentication | `jsonwebtoken` |
| Password Hashing | `bcryptjs` |
| File Uploads | `multer` |
| Geo Support | `geolib` |
| Inter-service HTTP | `axios` |
| API Documentation | `swagger-jsdoc`, `swagger-ui-express` |
| Logging | `morgan` |
| CORS | `cors` |

## 14. Suggested Folder Structure

```text
slprs/
  api-gateway/
    src/
    package.json
    .env.example
  auth-service/
    src/
      routes/
      controllers/
      services/
      repositories/
      middleware/
      validators/
      db/
      docs/
    package.json
    .env.example
  report-service/
  evidence-service/
  station-service/
  alert-service/
  case-service/
  README.md
```

This structure is cleaner and easier to maintain than a flat `index.js`-only approach.

## 15. Engineering Quality Requirements

To match Associate Software Engineer expectations, the team should implement the following across all services:

- input validation for request bodies and query parameters
- standard success and error response format
- health check endpoint for each service
- environment variables through `.env`
- request logging for debugging
- startup checks for database initialization
- Swagger documentation for every service
- basic seed data for stations and demo users where needed

## 16. Privacy and Security Positioning

For the MVP, the system supports a privacy-oriented reporting mode through a generated reference code and reduced identity exposure in normal report workflows.

However, this proposal does **not** claim full production-grade anonymity, government identity verification, or hardened evidence security. Those are outside the assignment scope and would require a more advanced production design.

## 17. Out of Scope

The following items are intentionally excluded from the core assignment MVP:

- full NIC or passport verification against external systems
- SMS or email integration
- production-grade media access control
- advanced admin portal features
- push notifications or WebSocket-based live updates
- national-scale deployment concerns

## 18. Assignment Requirement Mapping

| Assignment Requirement | SL-PRRS MVP Response |
|---|---|
| Microservice per each group member | Six services, one primary service per member |
| Explain how multiple ports are avoided | API Gateway routes all client calls through port `3000` |
| Proper folder structure | Root folder contains gateway and independent service folders |
| Native Swagger URL evidence | Each service exposes Swagger on its own port |
| Swagger through gateway | Gateway proxies Swagger access paths |
| Endpoints accessible directly and through gateway | Both direct and gateway routes are supported |
| No build breaks or runtime errors | MVP scope is intentionally reduced for reliable execution |
| Slide deck covering the full scenario | Proposal includes architecture, services, gateway purpose, and demo flow |

## 19. Team Responsibility Model

| Member | Service | Responsibility |
|---|---|---|
| Member 1 | Auth Service | authentication, JWT, user model |
| Member 2 | Report Service | report creation, tracking reference, report queries |
| Member 3 | Evidence Service | file upload, evidence metadata |
| Member 4 | Station Service | station dataset, district and nearby lookup |
| Member 5 | Alert Service | alert creation and officer alert views |
| Member 6 | Case Service | case status lifecycle and history |

Shared work:

- API Gateway routing
- integration testing
- Swagger verification
- slide deck preparation

## 20. Suggested Delivery Plan

### Day 1

- scaffold all services
- configure databases
- configure Swagger in each service
- create API Gateway base routing

### Day 2

- complete Auth Service
- complete Station Service
- complete Report Service basics

### Day 3

- complete Evidence Service
- complete Alert Service
- complete Case Service

### Day 4

- integrate services
- test direct endpoints
- test gateway endpoints
- fix routing and validation issues

### Day 5

- capture Swagger screenshots
- capture endpoint screenshots
- finalize slide deck narrative

## 21. Final Justification

SL-PRRS is a strong assignment choice because it satisfies the technical objectives of the module while remaining grounded in a real-world domain. The revised proposal intentionally reduces feature risk and improves engineering clarity. This makes the project easier to implement, easier to defend in presentation, and more appropriate for an Associate Software Engineer level demonstration.

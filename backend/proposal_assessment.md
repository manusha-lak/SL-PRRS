# SL-PRRS Proposal Assessment

## Overall Verdict

The idea is good and it fits the assignment well. A citizen incident reporting system is a real business domain, it can be split into clear microservices, and it gives your group enough material for the slide deck and Swagger demonstrations.

The main problem is not the idea. The main problem is scope and over-claiming. Right now the proposal reads like a large production platform. For an Associate Software Engineer level assignment, it will look stronger if you present it as a well-scoped MVP with clear boundaries, stable APIs, good validation, clean folder structure, and no runtime issues.

## What Already Matches the Assignment

- Real-world domain is clearly identified.
- One microservice per member is already planned.
- API Gateway is already part of the architecture.
- Native Swagger and gateway Swagger are already considered.
- Folder structure is already mentioned.
- Direct endpoint access and gateway access are both included.
- Individual responsibilities are already split across members.

## Main Risks In The Current Proposal

### 1. The proposal is too wide for the assignment

You currently include:

- NIC/Passport verification
- anonymous reporting
- media uploads
- nearest station lookup
- notification flow
- case tracking
- multiple roles
- privacy guarantees
- real station data

That is a lot for a short group assignment. If the team struggles during implementation, the final result can easily fail the assignment's biggest practical requirement: no build breaks and no runtime errors.

### 2. The privacy claim is too strong

The proposal says anonymous reports cannot be traced back because `user_id` is `NULL`. But the same proposal also says JWT is required for anonymous reporting. If authentication is required, then the system can still potentially connect activity to a user through logs, tokens, or service records. This means the design is closer to pseudonymous reporting than true anonymity.

### 3. Some service boundaries are still unclear

There are a few places where ownership is not fully defined:

- Media is uploaded before report creation, but media metadata is also linked to a report.
- Report Service creates a notification, but the Case Tracker lifecycle is also triggered by the same report.
- Notification Service is described as "real-time", but the design is actually a stored alert queue unless you add sockets or push delivery.

### 4. Some technical choices are hard to defend in a viva/demo

- `bcrypt` for NIC/Passport values is not a clean fit if you need uniqueness checks or lookup.
- "Public media URLs" may raise security questions.
- "Real Sri Lanka Police data" sounds more operational than academic MVP and may cause unnecessary questions.

## Recommended Positioning

Frame the solution like this:

> SL-PRRS is an academic MVP backend for citizen incident reporting. The system demonstrates how a real-world public safety domain can be decomposed into independent microservices behind a single API gateway.

That wording is safer and more mature than presenting it like a near-production police platform.

## Recommended MVP Scope

Keep the same 6-service structure, but reduce the feature ambition.

### Suggested Microservices

1. Auth Service
- Register/login users
- Role support: citizen, officer
- JWT issuance and validation

2. Report Service
- Create incident report
- List reports by citizen
- List reports by station
- Store incident metadata only

3. Evidence Service
- Upload image evidence
- Link uploaded evidence to a report
- Retrieve evidence metadata

4. Station Service
- Provide station directory
- Search stations by district
- Find nearest station from sample GPS dataset

5. Alert Service
- Create alert when a report is submitted
- Officer can view unread alerts
- Officer can mark alerts as read

6. Case Service
- Create default case record for each report
- Update case status
- Track case by report reference
- Maintain status history

## Features To Keep, Simplify, Or Move Out Of Scope

### Keep

- incident reporting
- API gateway
- Swagger
- station lookup
- case status tracking
- separate databases per service

### Simplify

- anonymous reporting: keep reference-code tracking, but describe it as limited identity masking for the MVP
- media upload: support images first; add video only if the team is stable
- station data: use seeded sample station data, not "all real stations"
- notifications: use stored alerts instead of claiming full real-time delivery

### Move Out Of Scope

- full NIC/Passport verification
- strong privacy guarantees
- SMS/email integration
- advanced admin management
- production-grade evidence security

## Changes That Will Make It Look More Associate Engineer Level

### 1. Add non-functional engineering requirements

Add these explicitly to the proposal:

- input validation for every endpoint
- standard error response format
- health check endpoint for every service
- centralized environment variable management
- request logging
- seed scripts for demo data

This shows engineering discipline, not just feature ideas.

### 2. Tighten the folder structure

Instead of only `index.js` and `routes`, show a cleaner service template:

```text
service-name/
  src/
    routes/
    controllers/
    services/
    repositories/
    middleware/
    validators/
    db/
    docs/
  uploads/
  .env.example
  package.json
  README.md
```

At root level:

```text
slprs/
  api-gateway/
  auth-service/
  report-service/
  evidence-service/
  station-service/
  alert-service/
  case-service/
  package.json
  README.md
```

### 3. Be explicit about service ownership

Add one sentence like this:

> Each microservice owns its own database and business capability. Cross-service communication happens only through APIs, not by sharing tables or database files.

### 4. Clarify the core flow

Document this exact MVP flow:

1. Citizen authenticates.
2. Citizen queries nearby stations.
3. Citizen uploads evidence.
4. Citizen submits a report with station ID and evidence IDs.
5. Report Service creates the report and generates a reference code.
6. Alert Service stores a station alert.
7. Case Service creates an initial case state of `PENDING`.
8. Officer updates case status through the Case Service.

That makes the architecture easier to defend.

### 5. Add a demo-safe privacy statement

Replace strong privacy language with:

> For the MVP, the system supports a privacy-oriented reporting mode using a generated reference code. The implementation reduces direct identity exposure in normal workflows, but it is not presented as a full production-grade anonymity guarantee.

## Recommended Edits To The Existing Proposal

### Replace this idea

"NIC / Passport verification ensures accountability without compromising privacy"

### With this

"The MVP supports authenticated reporting and reference-code based tracking. Identity handling is simplified for the assignment and designed for demonstration purposes rather than full government-grade verification."

### Replace this idea

"Real-time notification to the relevant police station"

### With this

"The system creates a station alert record immediately after report submission. This provides a simple and reliable notification mechanism for the MVP."

### Replace this idea

"Even if a police officer queries the database directly, the reporter's identity cannot be recovered"

### With this

"For the MVP, anonymous-style tracking is implemented through a generated reference code and minimized identity exposure in report-facing workflows."

## Slide Deck Improvements

To meet the industry-level expectation in the brief, your slide deck should not only show features. It should show engineering thinking.

Include:

- problem statement
- domain and users
- architecture diagram
- service responsibility table
- API gateway routing diagram
- data ownership per service
- key request flow
- Swagger screenshots for native URLs
- Swagger screenshots through gateway URLs
- team member contributions
- assumptions and out-of-scope items
- demo readiness: no runtime errors, direct + gateway access verified

## Final Recommendation

Do not change the domain. Keep the idea.

Change the way you present it:

- smaller MVP
- clearer service boundaries
- fewer risky claims
- stronger engineering discipline
- stronger demo and documentation plan

If you do that, the proposal will look more like the work of Associate Software Engineers rather than a student group trying to over-promise a production platform.

# SL-PRRS Slide Deck Outline

## Slide 1 - Title Slide

- Project title: **SL-PRRS**
- Subtitle: **Sri Lanka Police Rapid Report System**
- Module: `IT4020 - Modern Topics in IT`
- Group member names
- Submission date

## Slide 2 - Problem Background

- citizens need a faster and more structured way to report incidents
- traditional reporting methods can be slow and inconvenient
- there is limited visibility into the progress of a submitted report
- digital reporting is a suitable real-world microservices scenario

## Slide 3 - Project Goal

- build an academic MVP backend for incident reporting
- demonstrate microservice decomposition in a real domain
- use an API Gateway to simplify access to multiple services
- provide Swagger documentation for direct and gateway-based access

## Slide 4 - Why This Domain

- strong real-world relevance
- clear user roles
- naturally separable business capabilities
- suitable for independent service ownership by team members

## Slide 5 - MVP Scope

- user authentication
- station lookup
- report submission
- evidence upload
- station alerts
- case status tracking

**Presenter note:** mention that the scope is intentionally reduced to ensure a stable final solution with no runtime errors.

## Slide 6 - High-Level Architecture

Include:

- client
- API Gateway
- six microservices
- separate databases for each service

**Presenter note:** explain that all client traffic can go through port `3000`, while each service can still be accessed directly for testing and Swagger.

## Slide 7 - API Gateway Role

- single entry point for clients
- hides multiple internal ports
- simplifies routing
- supports both direct and proxied testing

Add an example:

- direct: `localhost:3002/api/reports`
- via gateway: `localhost:3000/api/reports`

## Slide 8 - Microservice Breakdown

Use a table:

| Service | Purpose | Owner |
|---|---|---|
| Auth Service | register, login, JWT | Member 1 |
| Report Service | create and retrieve reports | Member 2 |
| Evidence Service | upload and serve evidence | Member 3 |
| Station Service | station directory and nearby search | Member 4 |
| Alert Service | station alerts | Member 5 |
| Case Service | case status tracking | Member 6 |

## Slide 9 - Core Request Flow

Show this flow:

1. user logs in
2. user checks stations
3. user uploads evidence
4. user submits report
5. alert is created for the station
6. case record is created
7. officer updates case status
8. citizen tracks progress by reference code

## Slide 10 - Data Ownership and Independence

- each service owns its own database
- services communicate only through APIs
- no direct table sharing
- improves modularity and service independence

## Slide 11 - Technology Stack

- Node.js
- Express.js
- SQLite
- `http-proxy-middleware`
- `swagger-jsdoc`
- `swagger-ui-express`
- `jsonwebtoken`
- `multer`
- `axios`

## Slide 12 - Engineering Practices

- request validation
- standardized error handling
- logging
- health endpoints
- seed data
- `.env` configuration
- stable startup with no build breaks

This slide helps make the project look more like Associate Software Engineer work instead of only a feature demo.

## Slide 13 - Swagger Direct Access

Add screenshots of:

- `localhost:3001/api-docs`
- `localhost:3002/api-docs`
- one or two other services if space allows

## Slide 14 - Swagger Through Gateway

Add screenshots of proxied Swagger URLs through the gateway.

Example paths:

- `localhost:3000/api/auth/api-docs`
- `localhost:3000/api/reports/api-docs`

If your implementation uses a slightly different proxied Swagger path, keep it consistent with the actual gateway routing.

## Slide 15 - Direct Endpoint Demonstration

Include screenshots or request-response examples for:

- one direct Auth endpoint
- one direct Report endpoint
- one direct Case or Alert endpoint

## Slide 16 - Gateway Endpoint Demonstration

Include the same type of calls through the gateway:

- login through gateway
- submit report through gateway
- track case through gateway

## Slide 17 - Folder Structure

Show the project root with:

- API Gateway
- six services
- clear internal `src` structure
- Swagger/docs support

## Slide 18 - Team Contribution Slide

List each team member with:

- name
- assigned service
- specific contribution

This is important because the assignment explicitly expects individual contribution to be visible.

## Slide 19 - Challenges and Decisions

- reduced scope to MVP for reliability
- used sample station data instead of claiming full real-world coverage
- used stored alerts instead of over-claiming live notification delivery
- framed privacy as limited identity masking, not production-grade anonymity

This slide makes the proposal sound technically mature.

## Slide 20 - Conclusion

- SL-PRRS is a realistic academic MVP
- demonstrates microservices and API Gateway usage clearly
- supports direct and gateway-based API access
- aligns with assignment deliverables and evaluation criteria

## Screenshot Checklist

Before finalizing the deck, collect:

- service running screenshots
- native Swagger screenshots
- gateway Swagger screenshots
- direct endpoint request screenshots
- gateway endpoint request screenshots
- folder structure screenshot
- final contribution slide with names

## Presentation Guidance

- avoid claiming production-ready privacy or national deployment
- emphasize clean architecture and stable execution
- explain why the API Gateway matters
- show that each member understands not only their service, but also the complete flow

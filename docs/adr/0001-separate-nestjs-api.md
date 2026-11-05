# Context 
The app has a web UI, but the API will also serve an MCP server and maybe a mobile client. The backend has complex logic (spaced repetition, mistake tracking) and background jobs.

# Decision
Build the API as a separate NestJS service; the UI stays in Next.js.

# Alternatives
Next.js only (Route Handlers). Rejected: logic would be spread across route files, no built-in DI, guards or cron.

# Consequences
+ clean modular backend, reusable by any client. − two services to deploy, need CORS and shared auth.
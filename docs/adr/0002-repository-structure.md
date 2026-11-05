# Context 

UI framework is Next.js, API framework NestJS. UI and API will share data types. Only one dev will work on a project    

# Decision
monorepo due to shared types (DTO) between Next.js and NestJS using pnpm workspaces

# Alternatives
Polyrepo. Rejected: need to maintain two separate repos, build them separately  

# Consequences
+ building monorepo is easier. types are shared without publishing an npm package; one PR can change API and UI together
- workspace set up and ts configs complexity 
- every change causes rebuild of both (change in API causes CI to rebuild also UI)

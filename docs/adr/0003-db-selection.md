# Context 
DB should support read write operations. Almost each user's operation in the app - is write operation in DB (add work, mark as learned, statistic how frequently it was written right or wrong) 

# Decision
PostgresSQL due to it's concurrency, access control system, team ☺︎ is familiar with, free managed hosting (Neon/Supabase), strong Prisma support

# Alternatives
SQLite: rejected: single writer at a time, file can’t be shared between API instances
MySQL: comparable, but less pet-project friendly free trial hosting options  

# Consequences
+ API could be scalable to several copies, DB could have separate users 
- First local setup complexity comparing with SQLite
- more operations - backups, updated, passwords, connections

# Context 
FSRS (Free Spaced Repetition Scheduler) ts-fsrs library, is using to help user with learning by calculating their own learning algorithm, requires to store per card data to work efficiently. There are two possible ways of storing - JSON column with all settings inside or table with columns per value

# Decision
Storing in a UserWord table with column per value

# Alternatives
JSON: rejected. Old data silently stays in old format; no types; can’t index dueAt without duplicating it.

# Consequences
- each new field will require a migration
+ if migrating to a new version requires renaming of the existing field, with migration old data will be preserved. While using a JSON increases risk of old data corruption. due [ts-fsrs v5] → dueAt [ts-fsrs v6]
+ assigning and validate types per value
+ easy to request a statistic per parameter
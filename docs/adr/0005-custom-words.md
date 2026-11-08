# Context 
One of the most important feature - is to allow user to add their own words. How to save this words next to the global words list in the app, how to distunguish global word from the custom 

# Decision
Add ownerId column to the Word table. It doesn't matter of it's a global word or a user's own, it will have same structure, because it's the one essence

# Alternatives
Create a separate table CustomWords. UserWord would have to reference either Word or CustomWord (two nullable FKs), translations duplicated, promoting a word = copy + re-link progress

# Consequences
+ UserWord, FSRS and ReviewLog stay unchanged
+ Easy share the word globally, by just setting ownerId as null
- Uniqueness via two partial indexes: one for global words, and another for words belonging to each owner
- every dictionary query must filter ownerId IS NULL OR ownerId = :userId; the filter lives in one place (words repository) and is covered by a test
// MongoDB init script - runs only on first startup (empty data dir)
// MONGO_INITDB_DATABASE is set to "coin0" so `db` refers to coin0

db.createCollection("users");
db.createCollection("tokens");

db.users.createIndex({ address: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { sparse: true });

db.tokens.createIndex({ txHash: 1 }, { unique: true });
db.tokens.createIndex({ owner: 1 });

print("Database coin0 initialized");

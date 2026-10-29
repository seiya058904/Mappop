CREATE TABLE maps (
  id TEXT PRIMARY KEY NOT NULL CHECK(length(id) = 48),
  title TEXT NOT NULL,
  markdown TEXT NOT NULL,
  node_count INTEGER NOT NULL CHECK(node_count BETWEEN 2 AND 500),
  created_at INTEGER NOT NULL
);

CREATE INDEX maps_created_at_idx ON maps(created_at);

-- ══════════════════════════════════════════
-- SCHEMA v2 — apple-landing D1
-- wrangler d1 execute apple-db --file=schema.sql
-- ══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS waitlist (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT    NOT NULL UNIQUE,
  producto   TEXT    NOT NULL DEFAULT 'MacBook Neo',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- v2: incluye columna email para rastreo
CREATE TABLE IF NOT EXISTS button_clicks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  seccion    TEXT    NOT NULL,
  accion     TEXT    NOT NULL,
  email      TEXT    DEFAULT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacto (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre     TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  mensaje    TEXT    NOT NULL,
  leido      INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT    PRIMARY KEY,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT    NOT NULL
);

-- Si ya tienes button_clicks sin email, corre esto UNA SOLA VEZ en la terminal:
-- wrangler d1 execute apple-db --command "ALTER TABLE button_clicks ADD COLUMN email TEXT DEFAULT NULL;"
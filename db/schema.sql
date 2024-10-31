PRAGMA defer_foreign_keys = on;

-- PasswordRules table
DROP TABLE IF EXISTS PasswordRules;
CREATE TABLE PasswordRules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-incrementing primary key
  min_length INT DEFAULT 8,  -- Minimum length of password
  min_type INT DEFAULT 2,  -- Minimum number of different types of characters
  require_special BOOLEAN DEFAULT FALSE,  -- Require special characters
  require_upper BOOLEAN DEFAULT FALSE,  -- Require uppercase letters
  require_number BOOLEAN DEFAULT TRUE,  -- Require numbers
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update `updated_at` column on PasswordRules
CREATE TRIGGER updatePasswordRulesUpdatedAt
AFTER UPDATE ON PasswordRules
FOR EACH ROW
BEGIN
  UPDATE PasswordRules
  SET updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.id;
END;

-- Default PasswordRules
INSERT INTO PasswordRules (min_length, min_type, require_special, require_upper, require_number)
VALUES (8, 3, FALSE, FALSE, TRUE);

-- UserRoles table
DROP TABLE IF EXISTS UserRoles;
CREATE TABLE UserRoles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role_name TEXT NOT NULL UNIQUE,
  password_rule_id INTEGER NOT NULL DEFAULT 1,  -- Connect to PasswordRules
  FOREIGN KEY (password_rule_id) REFERENCES PasswordRules(id) ON DELETE SET DEFAULT
);

-- Default UserRoles
INSERT INTO UserRoles (role_name, password_rule_id)
VALUES ('user', 1), ('admin', 1);

-- Users table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  user_id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  user_role_id INTEGER NOT NULL DEFAULT 1,  -- Connect to UserRoles
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_role_id) REFERENCES UserRoles(id) ON DELETE SET DEFAULT
);

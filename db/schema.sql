-- Compliance360 (Next.js full-stack) — MySQL schema
-- Run with: npm run db:migrate  (or manually: mysql -u root -p Compliance360 < db/schema.sql)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  company       VARCHAR(160) NULL,
  email         VARCHAR(160) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('Super Admin', 'Consultant', 'Company Admin', 'Employee') NOT NULL DEFAULT 'Company Admin',
  photo_url     VARCHAR(500) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS companies (
  id              CHAR(36)     NOT NULL PRIMARY KEY,
  owner_user_id   CHAR(36)     NOT NULL,
  company_name    VARCHAR(200) NOT NULL,
  gst_number      VARCHAR(20)  NULL,
  industry        VARCHAR(120) NULL,
  state           VARCHAR(80)  NULL,
  employee_count  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_companies_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_companies_owner (owner_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compliance_types (
  id   VARCHAR(40)  NOT NULL PRIMARY KEY,
  name VARCHAR(120) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS compliance_records (
  id                  CHAR(36)     NOT NULL PRIMARY KEY,
  company_id          CHAR(36)     NOT NULL,
  compliance_type_id  VARCHAR(40)  NOT NULL,
  issue_date          DATE NULL,
  expiry_date         DATE NOT NULL,
  notes               TEXT NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_records_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  CONSTRAINT fk_records_type FOREIGN KEY (compliance_type_id) REFERENCES compliance_types(id),
  INDEX idx_records_company (company_id),
  INDEX idx_records_expiry (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS documents (
  id                     CHAR(36)     NOT NULL PRIMARY KEY,
  compliance_record_id   CHAR(36)     NOT NULL,
  file_name              VARCHAR(255) NOT NULL,
  file_path              VARCHAR(500) NOT NULL,
  mime_type              VARCHAR(120) NULL,
  version                INT UNSIGNED NOT NULL DEFAULT 1,
  size_kb                INT UNSIGNED NOT NULL DEFAULT 0,
  uploaded_by_user_id    CHAR(36) NULL,
  uploaded_on            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_record FOREIGN KEY (compliance_record_id) REFERENCES compliance_records(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_user FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_documents_record (compliance_record_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
  id           CHAR(36)     NOT NULL PRIMARY KEY,
  company_id   CHAR(36)     NOT NULL,
  title        VARCHAR(255) NOT NULL,
  assigned_to  VARCHAR(120) NOT NULL DEFAULT 'Consultant',
  due_date     DATE NULL,
  status       ENUM('Open', 'In Progress', 'Completed') NOT NULL DEFAULT 'Open',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_company FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
  INDEX idx_tasks_company (company_id),
  INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;

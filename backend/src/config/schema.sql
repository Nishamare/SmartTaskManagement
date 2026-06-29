CREATE DATABASE IF NOT EXISTS smarttaskmanagement
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smarttaskmanagement;

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  avatar     VARCHAR(255)  DEFAULT NULL,
  role       ENUM('admin','manager','member') NOT NULL DEFAULT 'member',
  bio        TEXT          DEFAULT NULL,
  is_active  TINYINT(1)    NOT NULL DEFAULT 1,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT         DEFAULT NULL,
  status      ENUM('planning','active','on_hold','completed','cancelled') NOT NULL DEFAULT 'planning',
  priority    ENUM('low','medium','high','critical')                      NOT NULL DEFAULT 'medium',
  start_date  DATE         DEFAULT NULL,
  end_date    DATE         DEFAULT NULL,
  owner_id    INT UNSIGNED NOT NULL,
  color       VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_project_owner FOREIGN KEY (owner_id)
    REFERENCES users(id) ON DELETE CASCADE
);

-- PROJECT MEMBERS
CREATE TABLE IF NOT EXISTS project_members (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  project_id INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  role       ENUM('owner','manager','member','viewer') NOT NULL DEFAULT 'member',
  joined_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_project_user (project_id, user_id),
  CONSTRAINT fk_pm_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_pm_user    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE
);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT         DEFAULT NULL,
  status          ENUM('todo','in_progress','in_review','done','cancelled') NOT NULL DEFAULT 'todo',
  priority        ENUM('low','medium','high','critical')                    NOT NULL DEFAULT 'medium',
  due_date        DATE         DEFAULT NULL,
  project_id      INT UNSIGNED NOT NULL,
  assigned_to     INT UNSIGNED DEFAULT NULL,
  created_by      INT UNSIGNED NOT NULL,
  estimated_hours DECIMAL(6,2) DEFAULT NULL,
  actual_hours    DECIMAL(6,2) DEFAULT NULL,
  tags            VARCHAR(500) DEFAULT NULL,
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_project  FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_task_assigned FOREIGN KEY (assigned_to) REFERENCES users(id)    ON DELETE SET NULL,
  CONSTRAINT fk_task_creator  FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE CASCADE
);

-- TASK COMMENTS
CREATE TABLE IF NOT EXISTS task_comments (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  task_id    INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  comment    TEXT         NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id        INT UNSIGNED NOT NULL,
  title          VARCHAR(255) NOT NULL,
  message        TEXT         NOT NULL,
  type           ENUM('task_assigned','task_updated','project_invite','deadline_reminder','comment_added') NOT NULL DEFAULT 'task_updated',
  is_read        TINYINT(1)   NOT NULL DEFAULT 0,
  reference_id   INT UNSIGNED DEFAULT NULL,
  reference_type ENUM('task','project','comment') DEFAULT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX idx_tasks_project   ON tasks(project_id);
CREATE INDEX idx_tasks_assigned  ON tasks(assigned_to);
CREATE INDEX idx_tasks_status    ON tasks(status);
CREATE INDEX idx_tasks_due_date  ON tasks(due_date);
CREATE INDEX idx_projects_owner  ON projects(owner_id);
CREATE INDEX idx_notif_user_read ON notifications(user_id, is_read);

-- DEMO ADMIN USER  (password: Admin@123)
INSERT INTO users (name, email, password, role) VALUES
('Admin User', 'admin@smarttask.com',
'$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

SELECT 'SmartTaskManagement DB created successfully!' AS Status;
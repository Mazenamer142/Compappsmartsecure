-- ─────────────────────────────────────────────
--  database.sql  –  Run this in phpMyAdmin to create all tables
--  Database name: smartsecure
-- ─────────────────────────────────────────────

-- 1. Locations  (created first because lockers reference it)
CREATE TABLE locations (
  location_id  INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  address      TEXT         NOT NULL,
  city         VARCHAR(100),
  country      VARCHAR(100),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Users
CREATE TABLE users (
  user_id    INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(100) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  phone      VARCHAR(20),
  role       VARCHAR(20)  DEFAULT 'customer',  -- 'customer' | 'admin' | 'technician'
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Lockers  (linked to a location)
CREATE TABLE lockers (
  locker_id   INT AUTO_INCREMENT PRIMARY KEY,
  locker_code VARCHAR(20)  NOT NULL UNIQUE,
  size        VARCHAR(20)  NOT NULL,            -- 'small' | 'medium' | 'large'
  status      VARCHAR(20)  DEFAULT 'available', -- 'available' | 'booked' | 'maintenance'
  location_id INT,
  FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 4. Bookings  (user books a locker for a time window)
CREATE TABLE bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  locker_id  INT,
  start_time DATETIME NOT NULL,
  end_time   DATETIME NOT NULL,
  status     VARCHAR(20) DEFAULT 'active',     -- 'active' | 'completed' | 'cancelled'
  FOREIGN KEY (user_id)   REFERENCES users(user_id)     ON DELETE CASCADE,
  FOREIGN KEY (locker_id) REFERENCES lockers(locker_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. AccessLogs  (every open/close/denied event)
CREATE TABLE access_logs (
  log_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  locker_id   INT,
  action      VARCHAR(20) NOT NULL,             -- 'opened' | 'closed' | 'denied'
  accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(user_id)     ON DELETE SET NULL,
  FOREIGN KEY (locker_id) REFERENCES lockers(locker_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Payments  (payment for a booking)
CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT,
  booking_id INT,
  amount     DECIMAL(10, 2) NOT NULL,
  method     VARCHAR(20) DEFAULT 'card',       -- 'card' | 'cash' | 'wallet'
  status     VARCHAR(20) DEFAULT 'pending',    -- 'pending' | 'paid' | 'refunded'
  paid_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)    REFERENCES users(user_id)       ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Maintenance  (repair/inspection tickets)
CREATE TABLE maintenance (
  maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
  locker_id      INT,
  description    TEXT NOT NULL,
  reported_by    INT,
  status         VARCHAR(20) DEFAULT 'open',   -- 'open' | 'in_progress' | 'resolved'
  reported_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at    DATETIME,
  FOREIGN KEY (locker_id)   REFERENCES lockers(locker_id) ON DELETE CASCADE,
  FOREIGN KEY (reported_by) REFERENCES users(user_id)     ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. Notifications  (alerts sent to users)
CREATE TABLE notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  type            VARCHAR(50) NOT NULL,          -- 'booking' | 'access' | 'payment' | 'maintenance'
  message         TEXT NOT NULL,
  is_read         TINYINT(1)  DEFAULT 0,
  sent_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

// Nginx (public-facing) inside the nginx subcontainer.
// This is the port StartOS binds and exposes as the Web UI.
export const uiPort = 8080

// Gunicorn (Django) listens here inside the django subcontainer.
// Nginx proxies to this via 127.0.0.1 (same package → shared loopback).
export const djangoPort = 8000

// MySQL listens here inside the mysql subcontainer.
export const mysqlPort = 3306

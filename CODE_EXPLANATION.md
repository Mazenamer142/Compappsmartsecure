# SmartSecure – Code Explanation

This file explains how the project is structured using one controller and one route as examples.
It is written in plain English so you can discuss and present the code confidently.

---

## What is the overall structure?

The project is a **REST API** built with **Node.js** and **Express**.
It connects to a **MySQL database** and follows an MVC-like pattern:

```
server.js          → starts the app and connects all routes
routes/            → defines the URL endpoints (what address does what)
controllers/       → contains the actual logic (what happens when that address is called)
utils/validate.js  → central validation rules shared by all controllers
config/db.js       → database connection
```

When a request arrives:
1. `server.js` receives it
2. The matching **route** file handles the URL
3. The route calls the matching **controller** method
4. The controller validates the data, queries the database, and sends back a response

---

## Example 1 — Route file: `routes/users.js`

A route file does one simple job: it maps an **HTTP method + URL** to a **controller method**.

```
GET    /api/users        → UsersController.getAll    (get all users)
GET    /api/users/:id    → UsersController.getOne    (get one user by ID)
POST   /api/users        → UsersController.create    (add a new user)
PUT    /api/users/:id    → UsersController.update    (edit an existing user)
DELETE /api/users/:id    → UsersController.remove    (delete a user)
```

The route file itself contains almost no logic — it is just a list of mappings.
This keeps the code clean and separated.

**Key terms:**
- `GET` → read data (safe, does not change anything)
- `POST` → create new data
- `PUT` → update existing data
- `DELETE` → remove data
- `:id` → a dynamic value in the URL, e.g. `/api/users/5` means user with ID 5

---

## Example 2 — Controller method: `UsersController.create`

This is the method that runs when someone sends a `POST /api/users` request.
It creates a new user in the database.

Here is the method broken down step by step:

### Step 1 – Extract the data from the request body
```js
const { name, email, password, phone, role } = req.body;
```
The client sends JSON like `{ "name": "Sara", "email": "sara@gmail.com", ... }`.
We pull out each field from `req.body`.

---

### Step 2 – Validate every field before touching the database
```js
const errors = runValidation([
  { field: 'name',     value: name,     checks: [required, mustBeName] },
  { field: 'email',    value: email,    checks: [required, mustBeEmail] },
  { field: 'password', value: password, checks: [required, mustBeString] },
  { field: 'phone',    value: phone,    checks: [mustBePhone] },
  { field: 'role',     value: role,     checks: [mustBeOneOf(ROLES)] },
]);
if (errors.length)
  return res.status(400).json({ status: 'error', errors });
```

`runValidation` runs every check and collects error messages.
- `required` → the field cannot be empty
- `mustBeName` → letters and spaces only, no numbers
- `mustBeEmail` → must contain `@` and end with `.com`
- `mustBePhone` → must be exactly 11 digits
- `mustBeOneOf(ROLES)` → must be `customer`, `admin`, or `technician`

If ANY check fails, the method **stops immediately** and returns a 400 error.
Nothing is written to the database.

---

### Step 3 – Insert into the database
```js
const [result] = await db.query(
  'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
  [name.trim(), email.trim(), password, phone || null, role || 'customer']
);
```

`db.query` runs a SQL statement.
The `?` placeholders are filled in safely by the library — this prevents SQL injection attacks.
`phone || null` means: if no phone was provided, store NULL in the database.
`role || 'customer'` means: if no role was provided, default to `customer`.

---

### Step 4 – Return the newly created user
```js
const [rows] = await db.query(
  'SELECT user_id, name, email, phone, role, created_at FROM users WHERE user_id = ?',
  [result.insertId]
);
res.status(201).json({ status: 'success', data: rows[0] });
```

After the insert, we immediately read the new row back from the database
and return it to the client as JSON.
`201` is the HTTP status code for "Created".

---

### Step 5 – Handle errors
```js
} catch (err) {
  if (err.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ status: 'error', message: 'Email already exists' });
  res.status(500).json({ status: 'error', message: err.message });
}
```

If anything goes wrong:
- `ER_DUP_ENTRY` means the email is already used by another account → return 409 Conflict
- Any other error → return 500 Internal Server Error

---

## HTTP Status Codes used in this project

| Code | Meaning |
|------|---------|
| 200  | OK – request succeeded |
| 201  | Created – new record was added |
| 400  | Bad Request – validation failed |
| 401  | Unauthorized – wrong email or password |
| 404  | Not Found – the record does not exist |
| 409  | Conflict – duplicate entry (e.g. email already exists) |
| 500  | Server Error – something unexpected went wrong |

---

## Validation rules summary

| Field | Rule |
|-------|------|
| name | Letters and spaces only — no numbers allowed |
| email | Must contain `@` and end with `.com` |
| phone | Exactly 11 digits (optional field) |
| password | Any non-empty string |
| role | Must be: `customer`, `admin`, or `technician` |
| IDs (user_id, locker_id, etc.) | Must be a positive whole number |
| amount | Must be a positive number greater than 0 |
| status | Must match the allowed list for each table |
| datetime fields | Must be a valid date/time string |

---

## Summary

- **Routes** = the addresses (URLs) of the API
- **Controllers** = the logic behind each address
- **Validation** = protection layer that blocks bad data before it reaches the database
- **db.query** = sends SQL to MySQL and returns the result
- **res.status(...).json(...)** = sends the response back to the client

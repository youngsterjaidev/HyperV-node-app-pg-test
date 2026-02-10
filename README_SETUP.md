# Express + PostgreSQL CRUD Application

A simple Node.js application demonstrating Express server with PostgreSQL database integration and complete CRUD operations.

## Features

- **Express Server**: RESTful API endpoints
- **PostgreSQL Integration**: Database connection pooling
- **CRUD Operations**: Create, Read, Update, Delete users
- **Error Handling**: Comprehensive error handling
- **Environment Configuration**: .env file for database credentials

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/youngsterjaidev/HyperV-node-app-pg-test.git
cd HyperV-node-app-pg-test
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Update the `.env` file with your PostgreSQL credentials:
```
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=test_db
PORT=3000
```

4. Create PostgreSQL database:
```bash
createdb test_db
```

5. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Users CRUD Operations

#### Create a User
```http
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 30
}
```

#### Get All Users
```http
GET /users
```

#### Get User by ID
```http
GET /users/:id
```

#### Update User
```http
PUT /users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "age": 28
}
```

#### Delete User
```http
DELETE /users/:id
```

## Example Usage with cURL

Create a user:
```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","age":30}'
```

Get all users:
```bash
curl http://localhost:3000/users
```

Get user by ID:
```bash
curl http://localhost:3000/users/1
```

Update user:
```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane","age":28}'
```

Delete user:
```bash
curl -X DELETE http://localhost:3000/users/1
```

## Database Schema

The application automatically creates a `users` table with the following structure:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  age INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Project Structure

```
├── index.js           # Main application file
├── package.json       # Project dependencies
├── .env               # Environment configuration
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## License

ISC

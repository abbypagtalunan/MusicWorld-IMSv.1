


# MusicWorld Inventory Management System

---

## Installation

### Step 1: Clone the Repository

Clone the repository to your local machine:

```bash
git clone https://github.com/abbypagtalunan/MusicWorld-IMSv.1.git
```

### Step 2: Install Frontend Dependencies

Navigate to the `client` directory and install the required frontend dependencies:

```bash
cd client
npm install react react-dom next
```

### Step 3: Install Backend Dependencies

Navigate to the `server` directory and install the required backend dependencies:

```bash
cd ../server
npm install express mysql2 cors
```

### Step 4: Install Development Dependencies

Install the necessary development dependencies for both the frontend and backend:

```bash
npm install --save-dev nodemon concurrently
```

---

## Project Structure

- **client**: Contains the frontend built with React and Next.js.
- **server**: Contains the backend built with Express, which handles the API and MySQL database connections.

---

## Server Structure

The server follows the **Model-Controller-Route** architecture for better organization and scalability.

- **server/db.js**: Contains the MySQL database connection setup.
- **server/src/models**: Contains the data models used for interacting with the database.
- **server/src/controllers**: Contains the business logic and routes handler.
- **server/src/routes**: Contains the route definitions.
- **server/server.js**: Main entry point for the Express server.


## Running the Application

To run both the backend and frontend concurrently in development mode, use the following command:

```bash
npm run dev
```

This command runs:
- **Backend (Express)** on port `8080` by default.
- **Frontend (React + Next.js)** on port `3000` by default.

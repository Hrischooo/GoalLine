# GoalLine

GoalLine is a football analytics web application for exploring and comparing players across different leagues.

The platform allows users to search for players, view statistical profiles, and compare footballers using real match data.

---

## Technologies Used

* React (Frontend)
* Node.js / Express (Backend)
* PostgreSQL (Database)
* Docker (Containerization)

---

## Project Structure

```
GoalLine
│
├ client/           # React frontend
├ server/           # Backend API
├ database/
│   └ init.sql      # Database initialization file
│
├ docker-compose.yml
├ README.md
└ .gitignore
```

---

## Running the Project

### Requirements

* Docker Desktop installed

### Steps

Clone the repository:

```
git clone https://github.com/YOUR_USERNAME/goaline.git
cd goaline
```

Run the application with Docker:

```
docker compose up --build
```

---

## Access the Application

Frontend:

```
http://localhost:5173
```

Backend API:

```
http://localhost:3001
```

PostgreSQL Database:

```
Host: localhost  
Port: 5432  
Database: goaline  
User: postgres  
Password: postgres
```

---

## Features

* Player search
* Player comparison
* League overview
* Statistical profiles
* Interactive web interface

---

## Purpose of the Project

GoalLine was created as a student project focused on football data analysis and visualization.
The aim is to demonstrate how modern web technologies and databases can be used to analyze sports performance data.

---

## Author

GoalLine Project
Football Analytics Platform

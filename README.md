# flatlink
Welcome to flatlink, my matura project

# Get started


## File structure 
File or Folder | Purpose
---------|----------
`backend/` | main backend processes go here
`frontend/` | main frontend processes go here
`package.json` | configuration for running API and frontend
`readme.md` | this getting started guide

## Routes

###  frontend

Basic route URI | Purpose
-------------|----------
`/` | not logged in (such as login, signup, pw forgotten) & eMail verification and data-privacy
`/user` | anything logged in
`/admin` | admin dashboard

### backend

Basic route URI | Purpose
-------------|----------
`/` | no API
`/accountService` | anything related to accounts - including pictures
`/matchingService` | matching, disliking, liking and getting likes
`/adminService` | admin dashboard data

## Setup Guide

### Prerequisites

- Install [Node.js](https://nodejs.org)
- Install [PostgreSQL](https://postgresql.org)


### Installation

- In the main directory, `backend/` and `frontend/` directories install all the dependecies with `npm install` respectively
- On your computer install nodemon with the commant `npm install -g nodemon` 
- In `backend/` create a `development.env` file and add the following variables

Variable name | Variable
-------------|----------
`dbUserDev` | Username for Dev-Database User
`dbPassDev` | Password for specified user
`dbDev` | Dev-Database name
`dbHostDev` | Host of Dev-DB (if locally installed: `localhost`)
`jwtSecret` | Secret Key for JWT encryption

- In `frontend/` also create a `development.env` file and add the following variables

Variable name | Variable
-------------|----------
`apiUrl` | `http://localhost:4000`
`appUrl` | `http://localhost:3000`
`jwtSecret` | Secret Key for JWT encryption (same as in backend)

- Open a new terminal and run `npm test` in the main directory (with `test` the DB-Tables are created automatically)
    - if testing on windows use `npm run testWindows` 
- The app should be running on http://localhost:3000/ with the API running on http://localhost:4000/


## Learn More

To learn more, contact us at nyv.ch.

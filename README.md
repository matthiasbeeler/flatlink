# flatLink
Welcome to flatlink, my matura project

Get started

File or Folder | Purpose
---------|----------
`backend/` | main backend processes go here
`frontend/` | main frontend processes go here
`package.json` | configuration for running API and frontend
`readme.md` | this getting started guide

## Routes



## Setup Guide

### Prerequisites

- Install [Node.js](https://nodejs.org)


### Installation

- In the main directory, `backend/` and `frontend/` directories install all the dependecies with `npm install` respectively
- In `backend/` create a `development.env` file and add the following variables
`dbUserDev=developemtPostgresUsername
dbPassDev=developemtPostgresPassword
dbDev=developemtPostgresDatabasename
dbHostDev=developemtPostgresHostname
jwtSecret=yourJWTSecret`

- In `frontend/` also create a `development.env` file and add the following variables
`apiUrl=http://localhost:4000
appUrl=http://localhost:3000
jwtSecret=theAboveSpecifiedSecret`

- Open a new terminal and run `npm test` in the main directory
- The app should be running on http://localhost:3000/ with the API running on http://localhost:4000/


## Learn More

To learn more, contact us at nyv.ch.

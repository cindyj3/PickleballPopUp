PickleballPopUp

COMP 4710 Senior Design Project Professor: Dr. Jakita Thomas

Members - Cindy Jiang - Reid Roberts - Reed Parish - Nathan Currier

------------------------------------------------------------------------

Project Description

PickleballPopUp is a web application designed to help users easily
organize and join pickleball games. The platform allows players to
create pickup games, view available games, and join games created by
others.

The goal of this project is to provide a simple coordination tool for
scheduling recreational pickleball matches and encouraging community
participation.

------------------------------------------------------------------------

Features

-   Create new pickleball games
-   View available scheduled games
-   Join existing games
-   Real‑time updates of the game list
-   Simple and intuitive user interface

------------------------------------------------------------------------

Technologies Used

Frontend HTML CSS JavaScript

Backend Node.js Express.js

Database SQLite

Deployment Render (backend API) Render Static Site (frontend)

------------------------------------------------------------------------

Live Application

Frontend: https://pickleballpopup-frontend.onrender.com

Backend API: https://pickleballpopup.onrender.com/api/games

------------------------------------------------------------------------

Setup (Local Development)

1.  Clone the repository

git clone https://github.com/YOUR_REPO_NAME.git cd pickleballpopup

2.  Install dependencies

npm install

3.  Start the backend server

node server.js

The API will run locally at: http://localhost:3000/api/games

4.  Open the frontend

Open index.html in your browser.

------------------------------------------------------------------------

API Endpoints

Get All Games GET /api/games

Example response:

[ { “GID”: 1, “GameTime”: “2 pm”, “Location”: “RO courts”, “Status”:
“scheduled” }]

------------------------------------------------------------------------

Create Game POST /api/games

Example request body:

{ “location”: “RO courts”, “time”: “2 pm”, “username”: “Cindy” }

Creates a new pickleball game.

------------------------------------------------------------------------

Join Game POST /api/games/:id/join

Example request body:

{ “username”: “Alex” }

Adds a player to an existing game.

------------------------------------------------------------------------

Future Improvements

-   User account authentication
-   Player capacity limits per game
-   Game result tracking
-   Score recording functionality
-   Notifications for upcoming games
-   Mobile responsive UI

------------------------------------------------------------------------

Project Status

This project currently supports basic scheduling and joining of
pickleball games. Future iterations may expand functionality to include
full score tracking and user account systems.

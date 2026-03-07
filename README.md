# PickleballPopUp

**COMP 4710 Senior Design Project**  
**Professor:** Dr. Jakita Thomas

---

## Members

- Cindy Jiang  
- Reid Roberts  
- Reed Parish  
- Nathan Currier  

---

## Project Description

PickleballPopUp is a web application designed to help users easily organize and join pickleball games. The platform allows players to create pickup games, view available games, and join games created by others.

The goal of this project is to provide a simple coordination tool for scheduling recreational pickleball matches for our sponsor's pickleball group. 

---

## Features

- Create new pickleball games  
- View available scheduled games  
- Join existing games  
- Real-time updates of the game list  
- Simple and intuitive user interface  

---

## Technologies Used

**Frontend**
- HTML
- CSS
- JavaScript

**Backend**
- Node.js
- Express.js

**Database**
- SQLite

**Deployment**
- Render (Backend API)
- Render Static Site (Frontend)

---

## Live Application

**Frontend**  
https://pickleballpopup-frontend.onrender.com

**Backend API**  
https://pickleballpopup.onrender.com/api/games

---

## Setup (Local Development)

### Clone the repository
git clone https://github.com/cindyj3/PickleballPopUp.git

cd PickleballPopUp

### Install dependencies
npm install

### Start the backend server
node server.js

The API will run locally at:
http://localhost:3000/api/games


### Open the frontend

Open `index.html` in your browser.

---

## API Endpoints

### Get All Games
GET /api/games


Example response:
[
{
"GID": 1,
"GameTime": "2 pm",
"Location": "RO courts",
"Status": "scheduled"
}
]


---

### Create Game
POST /api/games


Example body:
{
"location": "RO courts",
"time": "2 pm",
"username": "Cindy"
}


Creates a new pickleball game.

---

### Join Game
POST /api/games/:id/join


Example body:
{
"username": "Alex"
}

Adds a player to an existing game.

---

## Future Improvements

- User account authentication  
- Player capacity limits per game  
- Game result tracking  
- Score recording functionality  
- Notifications for upcoming games  
- Mobile responsive UI  


# HarmonyExplorer

HarmonyExplorer is a full-stack web application that allows users to explore chord data using interactive visualizations. It uses data stored in a MongoDB database and fetches track metadata from the Jamendo API.


# Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14 or higher recommended)
- npm (comes with Node.js)


# Installation Instructions

After unzipping the project folder, run the following command in the root directory to install all dependencies:

```bash
npm install
```

This will install both frontend and backend dependencies, including:

- express  
- mongodb  
- cors  
- compression  
- axios  
- node-cache    
- react  
- react-dom  
- react-router-dom   
- recharts  
- chart.js  
- react-chartjs-2  


# Running the Application

# Start the Backend

In the root folder, run:

```bash
node server.js
```

The backend server will start on:  
[http://localhost:5000](http://localhost:5000)

Leave this running in one terminal.


# Start the Frontend

In another terminal, also from the root folder, run:

```bash
npm start
```

This will start the React app on:  
[http://localhost:3000](http://localhost:3000)



# Features

- Search tracks and filter by genre  
- View interactive chord visualizations and similarity score between tracks  
- Compare up to 3 tracks for similarity  
- View artist information and track list  
- Random track generator (up to three tracks)


# Notes

- Chord data is fetched from a MongoDB server (read-only)  
- Metadata and audio are fetched live from the Jamendo API  

# Developed by

Lisa Deshishku — BSc Computer Science  
Supervised by Dr. Johan Pauwels, Queen Mary University of London

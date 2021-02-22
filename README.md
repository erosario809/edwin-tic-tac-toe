Welcome to Edwin's Tic-Tac-Toe project

A simple Tic-Tac-Toe game built using React and Node.js
You will play against an AI (api located at): https://d9u7x85vp9.execute-api.us-east-2.amazonaws.com/production/api-docs/#/ 

To Run...

npm install

npm start

Using an MVC (Model, View, Controller) for the main architecture of the game.

Since we are playing against an AI, there are various async function chains that are handling the creating, sending and recieving data of structures. I've leveraged a function i wrote in the past that contains a small algorithm to dertmine if there is a winner. This function contained an multidimensional array which is different from the api's returned data structure. In this case i had to write 2 quick functions that converted the data structure in order to pass to and recieve from the api (reconstructArr() to pass to api | parseObj() when i recieve from the api).
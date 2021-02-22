import React from 'react';
import Board from './Board';
var aiSquare;
var reconst;

function calculateWinner(squares) {
  //lines = multidimensional array of all possible wining combinations
  const lines = [
    [0, 1, 2],//top row across
    [3, 4, 5],//middle row across
    [6, 7, 8],//bottom row across
    [0, 3, 6],//left column down
    [1, 4, 7],//center column down
    [2, 5, 8],//right colum down
    [0, 4, 8],//diagonal top-left to down-right
    [2, 4, 6],//diagonal top-right to down-left
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }    
  }
  return null;
}

function checkIfDraw(squares){
  var i;
  var newArr = [];
  for(i = 0; i < squares.length; i++){
    if(squares[i] == ""){
      newArr.push(squares[i]);
    }
  }

  if(newArr.length <= 0){
    return true;
  }else{
    return false;
  }
}

//api array reconstruction
async function reconstructArr(arr){
  //reconstruct array for api
  var i;
  var newArr1 = [];
  var newArr2 = [];
  var newArr3 = [];
  var gameObj = {
    "board": []
  };
  //0,1,2
  for(i = 0; i < 3; i++){
    newArr1.push(arr[i]);
  }
  //3,4,5
  for(i = 3; i < 6; i++){
    newArr2.push(arr[i]);
  }
  //6,7,8
  for(i = 6; i < 9; i++){
    newArr3.push(arr[i]);
  }
  gameObj.board.push(newArr1);
  gameObj.board.push(newArr2);
  gameObj.board.push(newArr3);
  console.log(gameObj);
  return gameObj;
  
}

//parse obj from api
async function parseObj(obj){
  var i;
  var j;
  var orginalArr = [];
  for(i = 0; i < obj['board'].length; i++){
    for(j = 0; j < obj['board'][i].length; j++){
      orginalArr.push(obj['board'][i][j]);
    }
  }
  console.log('orignal array: '+orginalArr);
  return orginalArr;
}

//get move from api
async function getAIMove(game){
  reconst = await reconstructArr(game);
  var sendIt;
  var apiToken;
  //get auth
  let authURI = 'https://d9u7x85vp9.execute-api.us-east-2.amazonaws.com/production/auth/';
  await fetch(authURI, {
    method: 'post',
    headers: new Headers({
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    }),
    body: JSON.stringify({"email" : "erosario@nyit.edu"})
  })
  .then(response => response.json())
  .then(function(res){
    console.log(res); 
    apiToken = res.token; 
    //succesfull 200 ok  
  })
  .catch(function(err){
    console.log("error on authentication to api: "+err);
  });

  //now we have auth lets get AI move https://d9u7x85vp9.execute-api.us-east-2.amazonaws.com/production/engine/
  let engineURI = 'https://d9u7x85vp9.execute-api.us-east-2.amazonaws.com/production/engine/';
  await fetch(engineURI, {
    method: 'post',
    headers: new Headers({
      'Accept' : 'application/json',
      'Content-Type' : 'application/json',
      'Authorization': 'Bearer ' + apiToken
    }),
    body: JSON.stringify(reconst)
  })
  .then(result => result.json())
  .then(async function(result){
    console.log("result from swagger api "+JSON.stringify(result));
    sendIt = await parseObj(result);
    console.log(sendIt);
  })
  .catch(function(err){
    console.log("error on geting AI play from api: "+err);
  });

  return sendIt;
}



class Game extends React.Component {

  constructor(){
    super();
    this.state = {
      history: [{
        squares: Array(9).fill("")
      }],
      xIsNext: true,
      stepNumber: 0,
      AIMove: null,
    };
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) ? false : true,
    });
  }

  

 async handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber+1)
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const sendArr = squares;
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    //if X is next, human plays, else AI plays        
    if(this.state.xIsNext){
      squares[i] = 'X';
      this.setState({
        history: history.concat([{
          squares: squares
        }]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length,
      });

      //now get AI to play
      aiSquare = await getAIMove(sendArr);
      // aiSquare = ["X","","","","O","","","",""];
      console.log('got AI Play');
      //after X(human) plays, AI automatically plays 
      this.setState({
        history: history.concat([{
          squares: aiSquare
        }]),
        xIsNext: !this.state.xIsNext,
        stepNumber: history.length,
      });

    }else{
      //wait for AI to play
      console.log("wait for ai to play");
      return;
    }    
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);
    const isDraw = checkIfDraw(current.squares);
    let status;
    if(winner){
      status = 'Winner: ' + winner;
    }else if(isDraw){
      status = 'Its a draw';
    }else{
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O (Wait for AI)');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares} onClick={(i)=>this.handleClick(i)}/>
        </div>
        <div className="game-info">
          <div>{ status }</div>
          <a href="#" onClick={() => this.jumpTo(0)}>New Game</a>
        </div>
      </div>
    );
  }
}
export default Game;
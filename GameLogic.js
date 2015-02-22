angular.module('myApp', []).factory('gameLogic', function() {
/*
 * Grid representation:
 *
 *     0 1 2 3 4 5 6 7 8 9 0 1 2 3 4
 *   0 x x x x x x x x 
 *   1 x x x x x x x x x
 *   2 x x x x x x x x x x
 *   3 x x x x x x x x x x x
 *   4 x x x x x x x x x x x x
 *   5 x x x x x x x x x x x x x
 *   6 x x x x x x x x x x x x x x
 *   7 x x x x x x x x x x x x x x x
 *   8   x x x x x x x x x x x x x x
 *   9     x x x x x x x x x x x x x
 *  10       x x x x x x x x x x x x   
 *  11         x x x x x x x x x x x     
 *  12           x x x x x x x x x x     
 *  13             x x x x x x x x x     
 *  14               x x x x x x x x 
 */


//the boundary of horizontal direction
var horIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13],[0,14],[0,15],
  [1,15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15]];
//the boundary of vertical direction
var verIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12],[0,13],[0,14],[0,15],
  [1, 15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15],[8,15]];
//the boundary of diagonal direction
// starting point from NW side, end at row==10 or col==9
var tilIndex = [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0],
  [2, 0], [3, 0], [4, 0], [5, 0]];


'use strict';
function isEqual(object1, object2) {
  return JSON.stringify(object1) === JSON.stringify(object2);
}

function copyObject(object) {
  return JSON.parse(JSON.stringify(object));
}


  /** Returns true if the game ended in a tie because there are no empty cells. */
  function isTie(board) {
    var i,j;
    for(i=0; i<15; ++i) {
      for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
        if(board[i][j] === ''){
          return false;
        }
      }
    }
    return true;
  }//Done
  
  /** 
   * Returns the move that should be performed when player 
   * with index turnIndexBeforeMove makes a move in cell row X col. 
   */
  function createMove(board, row, col, turnIndexBeforeMove) {
    if(board === undefined) board = setBoard();
    if (board[row][col] !== '') {
        throw new Error("One can only make a move in an empty position!");
      }
    var boardAfterMove = copyObject(board);
    // first one should be Red
    boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'B';
   
    var winner = getWinner(boardAfterMove);
    var firstOperation;
    if (winner !== '' || isTie(boardAfterMove)) {
      // Game over.
      firstOperation = {endMatch: {endMatchScores: 
        (winner === 'R' ? [1, 0] : (winner === 'B' ? [0, 1] : [0, 0]))}};
    } else {
      // Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
      firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
console.log(firstOperation);
    }
    return [firstOperation,
         {set: {key: 'board', value: boardAfterMove}},
         {set: {key: 'delta', value: {row: row, col: col}}}];
  }//done
  
  function setBoard(){
      var i, j;
      var board = new Array(14);
      for(i=0; i<15; ++i){
        board[i] = new Array(14);
        for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
   //     	console.log(i,j);
          board[i][j] = '';
        }
      }
      return board;
    }
  
  function isMoveOk(params) {
	    var move = params.move;
	    var turnIndexBeforeMove = params.turnIndexBeforeMove;
	    var stateBeforeMove = params.stateBeforeMove;
	      try {
	      var deltaValue = move[2].set.value;
	      var row = deltaValue.row;
	      var col = deltaValue.col;
	      var board = stateBeforeMove.board;
	      var expectedMove = createMove(board, row, col, turnIndexBeforeMove);
	    
	        if(row<0 || row > 15) return false;
	        if(horIndex[row][0] > col || horIndex[row][1] <= col){
	        //	  console.log("something");
	          return false;
	        } 
	        if (!isEqual(move, expectedMove)) {
		    	 // console.log(expectedMove, "move not equal to exp move");
		          return false;
		        }
	      } catch (e) {
	        // if there are any exceptions then the move is illegal
	    	//  console.log("exception");
	        return false;
	      }
	      //console.log(expectedMove);
	      return true;
	    }
	    
  /**still need to implement**/
  function getWinner(board) { 
  	return '';
  }//Done
  
  /**
   * Returns all the possible moves for the given board and turnIndexBeforeMove.
   * Returns an empty array if the game is over.
   */
  function getPossibleMoves(board, turnIndexBeforeMove) {
    var possibleMoves = [];
    var i, j;
      for(i=0; i<15; ++i){
    	for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
        try {
          possibleMoves.push(createMove(board, i, j, turnIndexBeforeMove));
        } catch (e) {
          // The cell in that position was full.
        }
      }
    }
    return possibleMoves;
  }
  
 
  
  return {
      
      getPossibleMoves: getPossibleMoves,
      setBoard: setBoard,
      createMove: createMove,
      isMoveOk: isMoveOk,
      copyObject: copyObject,
      isEqual: isEqual,
      isTie : isTie
  };
 
});
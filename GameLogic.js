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


//	the boundary of horizontal direction
	var horIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13],[0,14],[0,15],
	                [1,15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15]];
//	the boundary of vertical direction
	/*var verIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12],[0,13],[0,14],[0,15],
  [1, 15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15]];*/
//	the boundary of diagonal direction
//	starting point from NW side, end at row==10 or col==9
	/*var tilIndex = [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0],
  [2, 0], [3, 0], [4, 0], [5, 0]];*/
	var edgeCells = [["0", "1"], ["0", "2"], ["0", "3"], ["0", "4"], ["0", "5"], ["0", "6"],
	                 ["1", "8"], ["2", "9"],["3", "10"], ["4","11"], ["5","12"], ["6","13"],
	                 ["8", "14"], ["9", "14"],["10", "14"], ["11","14"], ["12","14"], ["13","14"],
	                 ["14", "8"], ["14", "9"],["14", "10"], ["14","11"], ["14","12"], ["14","13"],
	                 ["8", "1"], ["9", "2"],["10", "3"], ["11","4"], ["12","5"], ["13","6"],
	                 ["1", "14"], ["2", "14"],["3", "14"], ["4","14"], ["5","14"], ["6","14"]];

	var cornerCells=[["0","0"],["0","7"],["7","14"],["14","14"],["14","7"],["7","0"]];
	/*
var nonIndex = [[8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14,15],
                [0, 1], [1, 2], [0, 3], [0, 4],[0,5],[0,6],[0,7]];
	 */
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

		var winner = getWinner(boardAfterMove,row,col,turnIndexBeforeMove);
		var firstOperation;
		if (winner !== '' || isTie(boardAfterMove)) {
			// Game over.
			firstOperation = {endMatch: {endMatchScores: 
				(winner === 'R' ? [1, 0] : (winner === 'B' ? [0, 1] : [0, 0]))}};
			//console.log("game over");
		} else {
			// Game continues. Now it's the opponent's turn (the turn switches from 0 to 1 and 1 to 0).
			firstOperation = {setTurn: {turnIndex: 1 - turnIndexBeforeMove}};
			//console.log(firstOperation);
		}
		return [firstOperation,
		        {set: {key: 'board', value: boardAfterMove}},
		        {set: {key: 'delta', value: {row: row, col: col}}}];
	}//done
	
	function getWinner(board,row,col,turnIndexBeforeMove) {
		
			if (getBridgeWin(board,row,col)==true || getForkWin(board,row,col)==true || getRingWin(board,row,col)==true){
				if(board[row][col]=='B') {
					return 'B';
				}
				else if(board[row][col]=='R') {
					return 'R';
				}
				//console.log("something true");
			}
			
				return '';
			
	}
	
	function setBoard(){
		var i, j;
		var board = new Array(14);
		for(i=0; i<15; ++i){
			board[i] = new Array(14);
			for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
				//	console.log(i,j);
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
			if (!angular.equals(move, expectedMove)) {
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

	/*
	Checks for a win by connecting any two of the six corner cells of the board
	 */
	function getBridgeWin(board,row,col) {
		var path = getConnectedPath(board,row,col);
		var count=0;
//		console.log(path);
		//var path_cell = Object.keys(path);
		for(var index in path){
			//var cell = path[index];
			//   console.log(cell);
			//  console.log(index);
			var row_col = index.split(',');
			//	console.log(row_col);
			for(k=0; k<7; k++){
				if(isEqual(row_col,cornerCells[k])) {
					count ++;

				}
			}
		}
		//console.log(count);
		if(count==2) {
			return true;
		}
		return false;
	}

	/*
Checks for a win by connecting any three edges of the board
	 */
	function getForkWin(board,row,col) {
		var path = getConnectedPath(board,row,col);
		var count=0;
//		console.log(path);
//		var path_cell = Object.keys(path);
//		console.log(path_cell);
		for(var index in path){
			//var cell = path[index];
			//  console.log(cell);
			//  console.log(index);
			var row_col = index.split(',');
			//	console.log(row_col);
			for(k=0; k<36; k++){
				if(isEqual(row_col,edgeCells[k])) {
					count ++;
					//  console.log("cell",row_col);
				}
			}
		}
//		console.log(count);
		if(count==3) {
			return true;
		}
		return false;
	}

	/*
Checks for a win by connecting  a loop around one or more cells
	 */
	function getRingWin(board,row,col) {
		var path = getConnectedPath(board,row,col);
		var neighbors= getNeighborsWithSameColor(board,row,col)

//		console.log(path);
//		console.log(neighbors);
		//var path_cell = Object.keys(path);
		for(var index in path){
			//	var cell = path[index];
			//  console.log(cell);
			//  console.log(index);
			//	var row_col = index.split(',');
			//	console.log(row_col);
			for(nbr_cell in neighbors){

				if(isEqual(path[index],neighbors[nbr_cell])) {
					//  console.log("cell",neighbors[nbr_cell]);
					return true;
				}
			}
		}
		return false;
	}


	function getConnectedPath(board,row,col) { 

		var queue = [];
		queue.push([row,col]);
		var came_from = [];
		came_from[[row,col]]=[[0],[0]];

		//Perform search in the queue for finding a path
		while (queue.length>0) {
			var current = queue.shift();
			//console.log("current",current);
			var cells = getNeighborsWithSameColor(board,current[0],current[1]);
			//console.log("NeighborsWithSameColor",cells);
			for (var next in cells) {
				//console.log(next,cells[next]);
				if(cells[next] in came_from == false)
				{
					queue.push(cells[next]);
					came_from[cells[next]] = cells[next];
					//console.log("came_from",came_from[cells[next]]);
				}

			}
		}

		return came_from;

	}//Done

	/*
	Gets the cells adjacent to a given cell with the same color
	Possible adjacent x for cell y. Here (1,y,6) (2,4) and (3,5) belong to a particular column.
		1 		2

	3 		y 		4

		5 		6
	 */
	function getNeighborsWithSameColor(board,row,col){
		var cells = [];
		if(isInsideBoard(row-1,col) && board[row-1][col]!='' && (board[row-1][col] === board[row][col])) {
			cells.push([row-1,col]);
		}	
		if(isInsideBoard(row-1,col-1) && board[row-1][col-1]!='' && (board[row-1][col-1] === board[row][col])) {
			cells.push([row-1,col-1]);
		}
		if(isInsideBoard(row,col-1) && board[row][col-1]!='' && (board[row][col-1] == board[row][col])) {
			cells.push([row,col-1]);
		}
		if(isInsideBoard(row,col+1) && board[row][col+1]!='' && (board[row][col+1] == board[row][col])) {
			cells.push([row,col+1]);
		}

		if(isInsideBoard(row+1,col+1) && board[row+1][col+1]!='' && (board[row+1][col+1] == board[row][col])) {
			cells.push([row+1,col+1]);
		}
		if(isInsideBoard(row+1,col) && board[row+1][col]!='' && (board[row+1][col] == board[row][col])) {
			cells.push([row+1,col]);
		}
		return cells;
	}



	/*
	Check whether the row or column indexed is valid by checking if it is inside the board
	 */
	function isInsideBoard(row, col){

		if(row>-1 && row<15 && col>-1 && col<15) {
			if(col>(horIndex[row][0]-1) && col< horIndex[row][1]) {
				//console.log(col,(horIndex[row][0]-1));	
				return true;
			}
		}

		return false;
	}

	/**
	 * commented out since we need not test this function for hW3
	 * Returns all the possible moves for the given board and turnIndexBeforeMove.
	 * Returns an empty array if the game is over.
	 
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

*/

	return {

		/*getPossibleMoves: getPossibleMoves,*/
		setBoard: setBoard,
		createMove: createMove,
		isMoveOk: isMoveOk,
		copyObject: copyObject,
		isEqual: isEqual,
		isTie : isTie,
		isInsideBoard : isInsideBoard,
		getConnectedPath : getConnectedPath,
		getNeighborsWithSameColor : getNeighborsWithSameColor,
		getBridgeWin : getBridgeWin,
		getForkWin : getForkWin,
		getRingWin : getRingWin,
		getWinner : getWinner
	};

});
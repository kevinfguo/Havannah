//angular.module('myApp',  ['ngTouch', 'ui.bootstrap']).factory('gameLogic', function() {
// angular.module('myApp', ['gameServices']).factory('gameLogic', function() {

module gameLogic{

  interface IState {
    board?: Board;
    delta?: BoardDelta;
  }

  interface BoardDelta {
    row: number;
    col: number;
    direction : number;
  }

  type Board = string[][];
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
 export function contains (k : any) {
  for(var i=0; i < this.length; i++){
    if(this[i] == k){
      return true;
    }
  }
  return false;
}

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
	var edge1 = [["0", "1"], ["0", "2"], ["0", "3"], ["0", "4"], ["0", "5"], ["0", "6"]];
	var edge2 = [["1", "8"], ["2", "9"],["3", "10"], ["4","11"], ["5","12"], ["6","13"]];
	var edge3 = [["8", "14"], ["9", "14"],["10", "14"], ["11","14"], ["12","14"], ["13","14"]];
	var edge4 = [["14", "8"], ["14", "9"],["14", "10"], ["14","11"], ["14","12"], ["14","13"]];
	var edge5 = [["8", "1"], ["9", "2"],["10", "3"], ["11","4"], ["12","5"], ["13","6"]];
	var edge6 = [["1", "0"], ["2", "0"],["3", "0"], ["4","0"], ["5","0"], ["6","0"]];

	var cornerCells=[["0","0"],["0","7"],["7","14"],["14","14"],["14","7"],["7","0"]];
	/*
var nonIndex = [[8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [14,15],
                [0, 1], [1, 2], [0, 3], [0, 4],[0,5],[0,6],[0,7]];
	 */
	'use strict';
	/*
	function angular.equals(object1, object2) {
		return JSON.stringify(object1) === JSON.stringify(object2);
	}
	function angular.copy(object) {
		return JSON.parse(JSON.stringify(object));
	}
	 */

	/** Returns true if the game ended in a tie because there are no empty cells. */
	export function isTie(board : any) : boolean {
		var i:any,j:any;
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
	export function createMove(board : any, row : any, col : any, turnIndexBeforeMove : any) : any {
		if(board === undefined) board = setBoard();
		if (board[row][col] !== '') {
			throw new Error("One can only make a move in an empty position!");
		}
		var boardAfterMove = angular.copy(board);
		// first one should be Red
		boardAfterMove[row][col] = turnIndexBeforeMove === 0 ? 'R' : 'B';

		var winner = getWinner(boardAfterMove,row,col,turnIndexBeforeMove);
		var firstOperation : any;
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

	export function getWinner(board : Board,row : any,col : any,turnIndexBeforeMove : any) : string {

		if (getBridgeWin(board,row,col)==true || getForkWin(board,row,col)==true || getRingWin2(board,row,col)==true){
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

	export function setBoard() : Board{
		var i : any, j : any;
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

	export function isMoveOk(params : any) : boolean {
		var move = params.move;
		var turnIndexBeforeMove = params.turnIndexBeforeMove;
		var stateBeforeMove = params.stateBeforeMove;
		try {
			var deltaValue = move[2].set.value;
			var row = deltaValue.row;
			var col = deltaValue.col;
			var board = stateBeforeMove.board;
			var expectedMove = createMove(board, row, col, turnIndexBeforeMove);
console.log(expectedMove);
			if(!isInsideBoard(row,col)){ return false;}
			if (!angular.equals(move, expectedMove)) {
				 console.log(expectedMove, "move not equal to exp move");
				return false;
			}
		} catch (e) {
			// if there are any exceptions then the move is illegal
			  console.log("exception");
			return false;
		}
		//console.log(expectedMove);
		return true;
	}

	/*
	Checks for a win by connecting any two of the six corner cells of the board
	 */
	export function getBridgeWin(board:Board,row:any,col:any) : boolean {
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
			for(var k=0; k<7; k++){
				if(angular.equals(row_col,cornerCells[k])) {
					count ++;

				}
			}
		}
		//console.log(count);
		if(count>1) {
			return true;
		}
		return false;
	}

	/*
Checks for a win by connecting any three edges of the board
	 */
	export function getForkWin(board : Board,row : any ,col: any ) : boolean {
		var path = getConnectedPath(board,row,col);
		var count1=0;
		var count2=0;
		var count3=0;
		var count4=0;
		var count5=0;
		var count6=0;
		var total_count=0;
//		console.log(path);
		//var path_cell = Object.keys(path);
		//console.log(path_cell);
		for(var index in path){
			//var cell = path[index];
			//  console.log(cell);
			//  console.log(index);
			var row_col = index.split(',');
			//	console.log(row_col);
			for(var k=0; k<6; k++){
				if(angular.equals(row_col,edge1[k])) {
					count1 =1;
					//  console.log("cell",row_col);
				}

				if(angular.equals(row_col,edge2[k])) {
					count2 =1;
				}

				if(angular.equals(row_col,edge3[k])) {
					count3 =1;
				}

				if(angular.equals(row_col,edge4[k])) {
					count4 =1;
				}

				if(angular.equals(row_col,edge5[k])) {
					count5 =1;
				}

				if(angular.equals(row_col,edge6[k])) {
					count6 =1;
				}
			}
		}
		total_count=count1+count2+count3+count4+count5+count6;
		//console.log(total_count,count1,count2,count3,count4,count5,count6);
		if(total_count==3) {
			return true;
		}
		return false;
	}

	export function getRingWin2(board : Board, row :any,col:any) : boolean{
		console.log(board);
		var color = board[row][col];
		var neighbors =getNeighborsWithSameColor(board,row,col),flag=0;
		if(neighbors.length >1){
			if(neighbors.length ==2){
				for( var i in getNeighborsWithSameColor(board,neighbors[0][0],neighbors[0][1])){
					if(i[0]==neighbors[1][0] && i[1]==neighbors[1][1]){
						flag=1;
						break;
					}
				}
			}
		}

		if(flag == 1 )
			return false;

		neighbors =  getNeighborsWithDiffColorNotZ(board, row,col,color);
		var x=-1,x=-1;

        console.log(neighbors);
		for(var i : any =0 ; i<neighbors.length; i++){

			var board2 =angular.copy(board);
			/*for(var j=0;j<15;j++){
				board2.push([]);
				for(var k=0;k<15;k++ ){
					board2[j].push(board[j][k]);
				}
			}*/

			board2[row][col]="Z";
			var  cell : any;
			flag =0;
			var neighbors2 : any[] = [];
			neighbors2.push(neighbors[i]);
			while(neighbors2.length != 0){
				cell = neighbors2.pop();
				board2[cell[0]][cell[1]] ="Z";


				for( var k=0; k<6; k++){
					if(cell[0] == edge1[k][0] && cell[1] == edge1[k][1]) {

						flag=1;
						break;
					}

					if(cell[0] == edge2[k][0] && cell[1] == edge2[k][1]) {
											flag=1;
											break;
										}

					if(cell[0] == edge3[k][0] && cell[1] == edge3[k][1]) {
											flag=1;
											break;
										}

					if(cell[0] == edge4[k][0] && cell[1] == edge4[k][1]) {
											flag=1;
											break;
										}

					if(cell[0] == edge5[k][0] && cell[1] == edge5[k][1]) {
											flag=1;
											break;
										}

					if(cell[0] == edge6[k][0] && cell[1] == edge6[k][1]) {
											flag=1;
											break;
										}

					if(cell[0] == cornerCells[k][0] && cell[1] == cornerCells[k][1]) {
											flag=1;
											break;
										}
				}

				neighbors2 = neighbors2.concat(getNeighborsWithDiffColorNotZ(board2,cell[0],cell[1],color));
				//console.log(neighbors2);
			}

			if(flag ==0){
				console.log("trueee");
				return true;

			}
		}
		console.log("reached here");
		return false;

	}

	export function notInSet(board : Board,row1 : any,col1 : any,cellSet : any) : boolean{
		for( var i in cellSet){
			if(i[0]== row1 && i[1]== col1){
				return false;
			}
		}
		return true;
	}

	/*
Checks for a win by connecting  a loop around one or more cells
	 */
	export function getRingWin(board : any,row : any,col : any) : boolean {
		var path = getConnectedPathForRing(board,row,col);
		var path2 = getConnectedPath(board,row,col);

		var check : any[]=[]
		var count=0;

//		console.log("PATH=",path);

		//var path_cell = Object.keys(path);

		for(var index in path){
			check[index]=0;
		}
//console.log("check1=",check);
		// if(count>5) {
			for(var index in path){
				var nbr=0;
					var cell = path[index];
					var rowC : any,colC : any;
	//			  console.log("CELL=",cell,"ROW=",cell[0],"COL=",cell[1]);
				//   for(var i in cell){
				//   rowC=cell[i];
				//   console.log(cell[i]);
				//   break;
				// }
				//   for(var i in cell){
				//   colC=cell[i];
				//   }
				//   console.log(colC);
				 // console.log(index);
				//	var row_col = index.split(',');
					//console.log(row_col);
					//for(var i in row_col)
				  //console.log(cell[1],row_col[1]);
				var neighbors= getNeighborsWithSameColor(board,cell[0],cell[1]);//,color);
		//		console.log("NBRS=",neighbors);
				for(var nbr_cell in neighbors){
// console.log("NBR_CELL=",neighbors[nbr_cell]);
					if(neighbors[nbr_cell] in path2 ===true) {

						nbr++;
						if(nbr==2)
						check[index]=1;
						//if(nbr>2)
						//check[index]=0;
							//return true;
					}
				}
			}
		//}
	//	console.log("check2=",check);

	for(var index in check){
			if(check[index]===0) {
				return false;
			}
			if(check[index]===1) {
				var nbrC=0;
				var cell = path[index];
				var neighbors= getNeighborsWithSameColor(board,cell[0],cell[1]);
				for(nbr_cell in neighbors){

						nbrC++;
						if(nbrC==path.length-1){
						return false;
				     }
				}

			}
		}
			var path = getConnectedPath(board,row,col);
		var neighbors= getNeighborsWithSameColor(board,row,col);
		var count=0;
		var nbr=0;
//		console.log(path);
//		console.log(neighbors);
		//var path_cell = Object.keys(path);

		for(var index in path){
			count++;
		}

		if(count>5) {
			for(var index in path){
				//	var cell = path[index];
				//  console.log(cell);
				//  console.log(index);
				//	var row_col = index.split(',');
				//	console.log(row_col);
				var nbrStash : any[]=[];
				var prev : any;
				var xCount=0;
				for(nbr_cell in neighbors){

					if(angular.equals(path[index],neighbors[nbr_cell])) {
					//	  console.log("nbr-cell",neighbors[nbr_cell]);
						var cellN=neighbors[nbr_cell];
						var nbr_nbr= getNeighborsWithSameColor(board,cellN[0],cellN[1]);
					//	console.log("PREV=",prev);
						for (var ind in nbr_nbr) {
				//			console.log(nbr_nbr[ind]);
							if(angular.equals(nbr_nbr[ind],prev)) {
							xCount++;
					//	console.log("XCOUNT=",xCount)	;
						}
//nbrStash[neighbors[nbr_cell]].add(nbr_nbr[ind]);
						}
						prev=neighbors[nbr_cell];
						// nbr++;
						// if(nbr>1)
						// 	return true;
					}
				}
				if(xCount>neighbors.length-2){
					return false;
				}
		//		console.log(nbrStash);
			}
		}
		return true;

	}
		export function getConnectedPathForRing(board : Board,row:any,col:any) {
		var queue : any[] = [];
		queue.push([row,col]);
		var came_from : any[] = [];
    var temp: any = [row,col];
    came_from[temp] =[-1,-1];
		//came_from[[row,col]] =[-1,-1];
		var nbr : any[]=[];
var count=0;
var ret : any[]=[];
ret.push([row,col]);
		//Perform search in the queue for finding a path
		while (queue.length>0) {

			var current = queue.shift();
			//console.log("current",current);
			var cells = getNeighborsWithSameColor(board,current[0],current[1]);
			//console.log("NeighborsWithSameColor",cells);
			for (var next in cells) {

				//console.log(next,cells[next]);
				if(cells[next] in came_from === false)
				{	//count++;
					nbr[cells[next]]=1;
					queue.push(cells[next]);
					came_from[cells[next]] = current;
					ret.push(cells[next]);
				//	console.log("came_from FALLACY",came_from[cells[next]],nbr[cells[next]]);
				}

			}
		}
		//console.log(came_from);
		return ret;
	}


	export function getConnectedPath(board :Board,row:any,col:any) {

		var queue : any[] = [];
		queue.push([row,col]);
		var came_from : any[] = [];
    var temp : any = [row,col];
		came_from[temp]=[[row],[col]];

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
	export function getNeighborsWithSameColor(board:Board,row:any,col:any){
		var cells : any[] = [];
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

	function getNeighborsWithDiffColorNotZ(board:Board,row:any,col:any,color : any){
		var cells : any[] = [];
		if(isInsideBoard(row-1,col) && (board[row-1][col]!="Z") &&(board[row-1][col] != color)) {
			cells.push([row-1,col]);
		}
		if(isInsideBoard(row-1,col-1)&& (board[row-1][col-1]!="Z") && (board[row-1][col-1] != color)) {
			cells.push([row-1,col-1]);
		}
		if(isInsideBoard(row,col-1) && (board[row][col-1]!="Z") && (board[row][col-1] != color)) {
			cells.push([row,col-1]);
		}
		if(isInsideBoard(row,col+1) && (board[row][col+1]!="Z") && (board[row][col+1] != color)) {
			cells.push([row,col+1]);
		}

		if(isInsideBoard(row+1,col+1) && (board[row+1][col+1]!="Z") && (board[row+1][col+1] != color)) {
			cells.push([row+1,col+1]);
		}
		if(isInsideBoard(row+1,col)  && (board[row+1][col]!="Z") && (board[row+1][col] != color)) {
			cells.push([row+1,col]);
		}
		return cells;
	}

	/*
	Check whether the row or column indexed is valid by checking if it is inside the board
	 */
	export function isInsideBoard(row : any, col : any){

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
*/
	export function getPossibleMoves(board :Board, turnIndexBeforeMove :any) {
		var possibleMoves : any =null;
		var i : any, j : any;
			var boardCopy : any ;

		var rowInd = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];

		var shuffleArray = function(array : any) {
			  var m = array.length, t : any, i : any;

			  // While there remain elements to shuffle
			  while (m) {
			    // Pick a remaining element…
			    i = Math.floor(Math.random() * m--);

			    // And swap it with the current element.
			    t = array[m];
			    array[m] = array[i];
			    array[i] = t;
			  }

			  return array;
			}
		rowInd = shuffleArray(rowInd);

		for(i=14; i>-1; --i){

			for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
				try {
					//boardCopy = angular.copy(board);

					var randomCol = Math.floor(Math.random() * (horIndex[i][1] - horIndex[i][0]) + horIndex[i][0]);
					possibleMoves=createMove(board, rowInd[i], randomCol, turnIndexBeforeMove);
					return possibleMoves;
				} catch (e) {
					// The cell in that position was full.
				}
			}
		}
		return possibleMoves;
	}



	// return {
  //
	// 	getPossibleMoves: getPossibleMoves,
	// 	setBoard: setBoard,
	// 	createMove: createMove,
	// 	isMoveOk: isMoveOk,
	// 	isTie : isTie,
	// 	isInsideBoard : isInsideBoard,
	// 	getConnectedPath : getConnectedPath,
	// 	getConnectedPathForRing : getConnectedPathForRing,
	// 	getNeighborsWithSameColor : getNeighborsWithSameColor,
	// 	getBridgeWin : getBridgeWin,
	// 	getForkWin : getForkWin,
	// 	getRingWin : getRingWin,
	// 	getWinner : getWinner
	// };

// });
}

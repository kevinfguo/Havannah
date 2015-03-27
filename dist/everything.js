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
	var edge1 = [["0", "1"], ["0", "2"], ["0", "3"], ["0", "4"], ["0", "5"], ["0", "6"]];
	var edge2 = [["1", "8"], ["2", "9"],["3", "10"], ["4","11"], ["5","12"], ["6","13"]];
	var edge3 = [["8", "14"], ["9", "14"],["10", "14"], ["11","14"], ["12","14"], ["13","14"]];
	var edge4 = [["14", "8"], ["14", "9"],["14", "10"], ["14","11"], ["14","12"], ["14","13"]];
	var edge5 = [["8", "1"], ["9", "2"],["10", "3"], ["11","4"], ["12","5"], ["13","6"]];
	var edge6 = [["1", "14"], ["2", "14"],["3", "14"], ["4","14"], ["5","14"], ["6","14"]];

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
		var boardAfterMove = angular.copy(board);
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

			if(!isInsideBoard(row,col)){ return false;}
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
	function getForkWin(board,row,col) {
		var path = getConnectedPath(board,row,col);
		var count1=0;
		var count2=0;
		var count3=0;
		var count4=0;
		var count5=0;
		var count6=0;
		var total_count=0;
//		console.log(path);
//		var path_cell = Object.keys(path);
//		console.log(path_cell);
		for(var index in path){
			//var cell = path[index];
			//  console.log(cell);
			//  console.log(index);
			var row_col = index.split(',');
			//	console.log(row_col);
			for(k=0; k<6; k++){
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
//		console.log(count);
		if(total_count==3) {
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
				for(nbr_cell in neighbors){

					if(angular.equals(path[index],neighbors[nbr_cell])) {
						//  console.log("cell",neighbors[nbr_cell]);
						nbr++;
						if(nbr==2)
							return true;
					}
				}
			}
		}
		return false;
		
	}
		function getConnectedPathForRing(board,row,col) {	
		var queue = [];
		queue.push([row,col]);
		var came_from = [];
		came_from[[row,col]]=[[-1],[-1]];

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
				else if(came_from[cells[next]]===[[-1],[-1]]){
					queue.push(cells[next]);
came_from[cells[next]] = cells[next];

					}
			}
		}
		return came_from;
	}


	function getConnectedPath(board,row,col) { 

		var queue = [];
		queue.push([row,col]);
		var came_from = [];
		came_from[[row,col]]=[[row],[col]];

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
		isTie : isTie,
		isInsideBoard : isInsideBoard,
		getConnectedPath : getConnectedPath,
		getConnectedPathForRing : getConnectedPathForRing,
		getNeighborsWithSameColor : getNeighborsWithSameColor,
		getBridgeWin : getBridgeWin,
		getForkWin : getForkWin,
		getRingWin : getRingWin,
		getWinner : getWinner
	};

});;angular.module('myApp')
  .controller('Ctrl',
      ['$scope', '$log', '$timeout',
       'gameService', 'stateService', 'gameLogic', 'resizeGameAreaService',
      function ($scope, $log, $timeout,
        gameService, stateService, gameLogic, resizeGameAreaService) {

    'use strict';

    resizeGameAreaService.setWidthToHeight(1);

 	$scope.numbersTo=      function numbersTo(start,end) {
        var res = [];
        for (var i=start; i<end; i++) {
          res[i] = i;
        }
      
        return res;
      }
 	
    function sendComputerMove() {
      var possMoves = gameLogic.getPossibleMoves($scope.board,$scope.turnIndex);
      console.log('Possible Moves=',possMoves);
      var randomNo = Math.floor(Math.random()*possMoves.length);
      console.log('random move=',possMoves[randomNo]);
      gameService.makeMove(possMoves[randomNo]); 
     
      // gameService.makeMove(aiService.createComputerMove($scope.board, $scope.turnIndex,
      //     // at most 1 second for the AI to choose a move (but might be much quicker)
      //     {millisecondsLimit: 1000}));
    }

    function updateUI(params) {
      $scope.board = params.stateAfterMove.board;
      $scope.delta = params.stateAfterMove.delta;
      if ($scope.board === undefined) {
        $scope.board = gameLogic.setBoard();
      }
      $scope.isYourTurn = params.turnIndexAfterMove >= 0 && // game is ongoing
        params.yourPlayerIndex === params.turnIndexAfterMove; // it's my turn
      $scope.turnIndex = params.turnIndexAfterMove;

      // Is it the computer's turn?
      if ($scope.isYourTurn &&
          params.playersInfo[params.yourPlayerIndex].playerId === '') {
        console.log('computer turn');
        $scope.isYourTurn = false; // to make sure the UI won't send another move.
        // Waiting 0.5 seconds to let the move animation finish; if we call aiService
        // then the animation is paused until the javascript finishes.
        $timeout(sendComputerMove, 500);
      }
    }
   // window.e2e_test_stateService = stateService; // to allow us to load any state in our e2e tests.
/*
    var width = 960,
    height = 500,
    radius = 20;

var topology = hexTopology(radius, width, height);

var projection = hexProjection(radius);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "hexagon")
  .selectAll("path")
    .data(topology.objects.hexagons.geometries)
  .enter().append("path")
    .attr("d", function(d) { return path(topojson.feature(topology, d)); })
    .attr("class", function(d) { return d.fill ? "fill" : null; })
    .on("mousedown", mousedown)
    .on("mousemove", mousemove)
    .on("mouseup", mouseup);

svg.append("path")
    .datum(topojson.mesh(topology, topology.objects.hexagons))
    .attr("class", "mesh")
    .attr("d", path);

var border = svg.append("path")
    .attr("class", "border")
    .call(redraw);

var mousing = 0;

function mousedown(d) {
  mousing = d.fill ? -1 : +1;
  mousemove.apply(this, arguments);
}

function mousemove(d) {
  if (mousing) {
    d3.select(this).classed("fill", d.fill = mousing > 0);
    border.call(redraw);
  }
}

function mouseup() {
  mousemove.apply(this, arguments);
  mousing = 0;
}

function redraw(border) {
  border.attr("d", path(topojson.mesh(topology, topology.objects.hexagons, function(a, b) { return a.fill ^ b.fill; })));
}

function hexTopology(radius, width, height) {
  var dx = radius * 2 * Math.sin(Math.PI / 3),
      dy = radius * 1.5,
      m = Math.ceil((height + radius) / dy) + 1,
      n = Math.ceil(width / dx) + 1,
      geometries = [],
      arcs = [];

  for (var j = -1; j <= m; ++j) {
    for (var i = -1; i <= n; ++i) {
      var y = j * 2, x = (i + (j & 1) / 2) * 2;
      arcs.push([[x, y - 1], [1, 1]], [[x + 1, y], [0, 1]], [[x + 1, y + 1], [-1, 1]]);
    }
  }

  for (var j = 0, q = 3; j < m; ++j, q += 6) {
    for (var i = 0; i < n; ++i, q += 3) {
      geometries.push({
        type: "Polygon",
        arcs: [[q, q + 1, q + 2, ~(q + (n + 2 - (j & 1)) * 3), ~(q - 2), ~(q - (n + 2 + (j & 1)) * 3 + 2)]],
        fill: Math.random() > i / n * 2
      });
    }
  }

  return {
    transform: {translate: [0, 0], scale: [1, 1]},
    objects: {hexagons: {type: "GeometryCollection", geometries: geometries}},
    arcs: arcs
  };
}

function hexProjection(radius) {
  var dx = radius * 2 * Math.sin(Math.PI / 3),
      dy = radius * 1.5;
  return {
    stream: function(stream) {
      return {
        point: function(x, y) { stream.point(x * dx / 2, (y - (2 - (y & 1)) / 3) * dy / 2); },
        lineStart: function() { stream.lineStart(); },
        lineEnd: function() { stream.lineEnd(); },
        polygonStart: function() { stream.polygonStart(); },
        polygonEnd: function() { stream.polygonEnd(); }
      };
    }
  };
}
*/
    $scope.cellClicked = function (row, col) {
      $log.info(["Clicked on cell:", row, col]);
      if (window.location.search === '?throwException') { // to test encoding a stack trace with sourcemap
        throw new Error("Throwing the error because URL has '?throwException'");
      }
      if (!$scope.isYourTurn) {
        return;
      }
      try {
        var move = gameLogic.createMove($scope.board, row, col, $scope.turnIndex);
        $scope.isYourTurn = false; // to prevent making another move
        gameService.makeMove(move);
      } catch (e) {
        $log.info(["Cell is already full in position:", row, col,e]);
        return;
      }
    };
    $scope.shouldShowImage = function (row, col) {
      var cell = $scope.board[row][col];
      return cell !== "";
    };
    $scope.isPieceR = function (row, col) {
        return $scope.board[row][col] === 'R';
      };
      $scope.isPieceB = function (row, col) {
        return $scope.board[row][col] === 'B';
      };
    $scope.getImageSrc = function (row, col) {
      var cell = $scope.board[row][col];
      return cell === "R" ? "imgs/redBall.png"
          : cell === "B" ? "imgs/blackball.gif" : "";
    };
    $scope.shouldSlowlyAppear = function (row, col) {
      return $scope.delta !== undefined &&
          $scope.delta.row === row && $scope.delta.col === col;
    };

    gameService.setGame({
      gameDeveloperEmail: "sm5119@nyu.edu",
      minNumberOfPlayers: 2,
      maxNumberOfPlayers: 2,
      isMoveOk: gameLogic.isMoveOk,
      updateUI: updateUI
    });
  }]);;angular.module('myApp').factory('aiService',
    ["alphaBetaService", "gameLogic",
      function(alphaBetaService, gameLogic) {

  'use strict';

  /**
   * Returns the move that the computer player should do for the given board.
   * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
   * and it has either a millisecondsLimit or maxDepth field:
   * millisecondsLimit is a time limit, and maxDepth is a depth limit.
   */
  function createComputerMove(board, playerIndex, alphaBetaLimits) {
    // We use alpha-beta search, where the search states are TicTacToe moves.
    // Recal that a TicTacToe move has 3 operations:
    // 1) endMatch or setTurn
    // 2) {set: {key: 'board', value: ...}}
    // 3) {set: {key: 'delta', value: ...}}]
    return alphaBetaService.alphaBetaDecision(
        [null, {set: {key: 'board', value: board}}],
        playerIndex, getNextStates, getStateScoreForIndex0,
        // If you want to see debugging output in the console, then surf to game.html?debug
        window.location.search === '?debug' ? getDebugStateToString : null,
        alphaBetaLimits);
  }

  function getStateScoreForIndex0(move) { // alphaBetaService also passes playerIndex, in case you need it: getStateScoreForIndex0(move, playerIndex)
    if (move[0].endMatch) {
      var endMatchScores = move[0].endMatch.endMatchScores;
      return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
          : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
          : 0;
    }
    return 0;
  }

  function getNextStates(move, playerIndex) {
    return gameLogic.getPossibleMoves(move[1].set.value, playerIndex);
  }

  function getDebugStateToString(move) {
    return "\n" + move[1].set.value.join("\n") + "\n";
  }

  return {createComputerMove: createComputerMove};
}]);
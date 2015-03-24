

/**Test case added by Yi Wan, a bug found in the method fork win*/
describe("In Havannah", function() {
	var _gameLogic;


	beforeEach(module("myApp"));

	beforeEach(inject(function (gameLogic) {
		_gameLogic = gameLogic;
	}));

	/**
	 * board initialization
	 * @param pawn:a character that represent the initial pawn that 
	 *             will be place at every position('R', 'B', or '')
	 * @return board: a two dimensional array that represent the board  
	 */
	function setBoard(){
		return _gameLogic.setBoard();
	}

	function expectMoveOk(turnIndexBeforeMove, stateBeforeMove, move) {
		expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
			stateBeforeMove: stateBeforeMove,
			move: move})).toBe(true);
	}

	function expectIllegalMove(turnIndexBeforeMove, stateBeforeMove, move) {
		expect(_gameLogic.isMoveOk({turnIndexBeforeMove: turnIndexBeforeMove,
			stateBeforeMove: stateBeforeMove,
			move: move})).toBe(false);
	}
	
	// first move
	it("placing R in 0x3 from initial state is legal", function(){
		var board = _gameLogic.setBoard();
		board[0][3] = 'R';
		expectMoveOk(0,{},[{setTurn: {turnIndex : 1}},
		                   {set: {key: 'board', value: board}},
		                   {set: {key: 'delta', value: {row: 0, col: 3}}}
		                   ])
	});
	// after several turns
	it("placing R in 0x3 from some state is legal", function() {
		var boardBeforeMove = _gameLogic.setBoard();
		boardBeforeMove[0][0] = 'R';
		boardBeforeMove[0][2] = 'W';
		var boardAfterMove = angular.copy(boardBeforeMove);
		boardAfterMove[0][3] = 'R';
		expectMoveOk(0,{board:boardBeforeMove, delta:{row:0,col:2}},[{setTurn: {turnIndex : 1}},
		                   {set: {key: 'board', value: boardAfterMove}},
		                   {set: {key: 'delta', value: {row: 0, col: 3}}}
		                   ])
	});
	
	it("placing R in an occupied position is illegal", function() {
		var boardBeforeMove = _gameLogic.setBoard();
		boardBeforeMove[0][0] = 'R';
		boardBeforeMove[0][2] = 'W';
		var boardAfterMove = angular.copy(boardBeforeMove);
		expectIllegalMove(0,{board:boardBeforeMove, delta:{row:0,col:2}},[{setTurn: {turnIndex : 1}},
		                   {set: {key: 'board', value: boardAfterMove}},
		                   {set: {key: 'delta', value: {row: 0, col: 2}}}
		                   ])
		
	});
	it("R gets a win by forming a ring, this move should be OK", function(){
		var board = _gameLogic.setBoard();
		for (var i = 6; i <= 8; i++) {
			for(var j = 6; j <= 8; j++) {
				board[i][j] = 'R';
			}
		}
		board[7][7] = '';
		expect(_gameLogic.getRingWin(board,7,6)).toBe(true);
		
	});
	
	it("R will not get a win because of it forms a ring win", function(){
		var board = _gameLogic.setBoard();
		for (var i = 6; i <= 7; i++) {
			for(var j = 6; j <= 7; j++) {
				board[i][j] = 'R';
			}
		}
		expect(_gameLogic.getRingWin(board,7,6)).toBe(false);
	});
	
	
	it("B gets a win by forming a bridge, this move should be OK", function(){
		var board=_gameLogic.setBoard();
		for(i=0; i<15; ++i) {
			board[i][i]='B';
		}

		expect(_gameLogic.getWinner(board,14,14)).toBe('B');
	});
	
	it("B doesn't get a win by forming a bridge", function(){
		var board=_gameLogic.setBoard();
		for(i=0; i<9; ++i) {
			board[1][i]='B';
		}

		expect(_gameLogic.getRingWin(board,1,8)).toBe(false);
	});
	/**
	* a bug found: this should be a fork win.
	*
	*
	*/
	it("R gets a win by forming a fork", function(){
		var board=_gameLogic.setBoard();
		for(var i=0; i<=10; i++) {
			board[3][i]='R';
		}
		for(var i=0; i<=2; i++) {
			board[i][4]='R';
		}

		expect(_gameLogic.getForkWin(board,3,4)).toBe(true);
	});
	
})


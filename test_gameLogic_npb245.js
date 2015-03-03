/*
  There is one bug where the developer does not check whether the ring formed for a win has all same colored blocks inside it or not
*/
describe("In Havannah", function() {
	var _gameLogic;


	beforeEach(module("myApp"));

	beforeEach(inject(function (gameLogic) {
		_gameLogic = gameLogic;
	}));

	/**
	 * board initialization
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


	it(" 1:placing R in 0x1 from initial state is legal", function() {
		var board = _gameLogic.setBoard();
		board[0][1] = 'R';
		expectMoveOk(0,{},[{setTurn: {turnIndex : 1}},
		                   {set: {key: 'board', value: board}},
		                   {set: {key: 'delta', value: {row: 0, col: 1}}}
		                   ])
	});

  //FAILS as there is a block of red cells but that does not constitute a ring
	it("If there is a block of a player color it does not count as a Ring", function() {
		var board5=_gameLogic.setBoard();
		for(i=1; i<4; ++i) {
			for(j=1; j<4; ++j) {
				board5[i][j]='R';
			}
		}

		expect(_gameLogic.getRingWin(board5,1,1)).toBe(false);
	});


	it(" placing B in 0x1 from initial state is legal", function() {
		var board = setBoard();
		board[0][0] = 'R';
		var nextBoard = angular.copy(board);
		nextBoard[0][1] = 'B';
		expectMoveOk(1,{board: board, delta: {row: 0, col: 0}}, 
				[{setTurn: {turnIndex : 0}},
				 {set: {key: 'board', value: nextBoard}},
				 {set: {key: 'delta', value: {row: 0, col: 1}}}
				 ])
	});


	it(" R gets a Win by forming a bridge", function() {
		var board3=_gameLogic.setBoard();
		
    for(i=0;i<15;i++){
			board3[i][i]='R';
		}
		expect(_gameLogic.getBridgeWin(board3,14,14)).toBe(true);
	});

	it(" B does not form Fork with border cell", function() {
		var board4=_gameLogic.setBoard();

    
		board4[0][1] = 'B';
		board4[1][0] = 'B';
		for(i=1; i<8; ++i) {
			board4[i][0]='B';
		}
		for(i=1; i<14; ++i) {
			board4[7][i]='B';
		}
		board4[6][13]='B';
		
		expect(_gameLogic.getForkWin(board4,8,14)).toBe(false);
	});

  

	it("B wins by forming a Bridge", function() {
		var board3=_gameLogic.setBoard();
		for(i=0; i<8; ++i) {
			board3[0][i]='B';
		}

		expect(_gameLogic.getWinner(board3,0,7)).toBe('B');
	});
	

	it("Check for tie", function() {

		 var horIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13],[0,14],[0,15],
			                [1,15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15]];
			var board_tie1=_gameLogic.setBoard();
			for(i=0; i<15; ++i){
				for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
					if(board_tie1[i][j]==='')board_tie1[i][j] = 'R';
					if(_gameLogic.isInsideBoard(i,j+1)){
					board_tie1[i][j+1] = 'B';
					}
							}
				board_tie1[7][0]='B';}
			board_tie1[0][0]='';
		
			board_tie1[0][4]='B';

			var board_tie2= angular.copy(board_tie1);
		board_tie2[0][0]='R';
		 expectMoveOk(0,{board:board_tie1, delta: {row: 0, col: 4}},
			      [{endMatch: {endMatchScores: [0, 0]}},
			            {set: {key: 'board', value:board_tie2}},
			            {set: {key: 'delta', value: {row: 0, col: 0}}}
			            ]);
	
			});	

	
	
		it("test move outside board", function() {
		var board=_gameLogic.setBoard();
		board[0][0] = 'R';
		var nextBoard = angular.copy(board);
		nextBoard[8][0] = 'B';
		expectIllegalMove(1,{board: board, delta: {row: 0, col: 0}}, 
				[{setTurn: {turnIndex : 0}},
				 {set: {key: 'board', value: nextBoard}},
				 {set: {key: 'delta', value: {row:1, col: 14}}}
				 ])
	});
		
	
})

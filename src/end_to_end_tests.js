describe('Havannah', function() {

  'use strict';

  beforeEach(function() {
    browser.get('http://localhost:33940/game.html');
  });

  function getDiv(row, col) {
    return element(by.id('e2e_test_div_' + row + 'x' + col));
  }

  function getPiece(row, col, pieceKind) {
    return element(by.id('e2e_test_img_' + row + 'x' + col));
  }

  function expectPiece(row, col, pieceKind) {
    // Careful when using animations and asserting isDisplayed:
    // Originally, my animation started from {opacity: 0;}
    // And then the image wasn't displayed.
    // I changed it to start from {opacity: 0.1;}
    expect(getPiece(row, col, 'R').isDisplayed()).toEqual(pieceKind === "R" ? true : false);
    expect((getPiece(row, col, '').isDisplayed())? true : false);
    expect(getPiece(row, col, 'B').isDisplayed()).toEqual(pieceKind === "B" ? true : false);
  }

  function expectBoard(board) {
	  var horIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13],[0,14],[0,15],
		                [1,15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15]];
		
		for(var i=0; i<15; ++i){
			for(var j=horIndex[i][0]; j<horIndex[i][1]; ++j){
				expectPiece(i, j, board[i][j]);
			}
		}

  }

  function clickDivAndExpectPiece(row, col, pieceKind) {
    getDiv(row, col).click();
    expectPiece(row, col, pieceKind);
  }

  // playMode is either: 'passAndPlay', 'playAgainstTheComputer', 'onlyAIs',
  // or a number representing the playerIndex (-2 for viewer, 0 for white player, 1 for black player, etc)
  function setMatchState(matchState, playMode) {
    browser.executeScript(function(matchStateInJson, playMode) {
      var stateService = window.e2e_test_stateService;
      stateService.setMatchState(angular.fromJson(matchStateInJson));
      stateService.setPlayMode(angular.fromJson(playMode));
      angular.element(document).scope().$apply(); // to tell angular that things changes.
    }, JSON.stringify(matchState), JSON.stringify(playMode));
  }

  it('should have a title', function () {
    expect(browser.getTitle()).toEqual('Havannah');
  });

  function getInitialBoard() {
	  var horIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13],[0,14],[0,15],
		                [1,15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15]];
		

	  var boardT = new Array(14);
		for(var i=0; i<15; ++i){
			boardT[i] = new Array(14);
			for(var j=horIndex[i][0]; j<horIndex[i][1]; ++j){
				//	console.log(i,j);
				boardT[i][j] = '';
			}
		}
		return boardT;
  }
  
  it('should have an empty Havannah board', function () {
var boardT=getInitialBoard();
    expectBoard(
        boardT);
  });

  it('should show R if I click in 0x0', function () {
	  var boardT=getInitialBoard();
	  boardT[0][0]="R";
    clickDivAndExpectPiece(0, 0, "R");
    expectBoard(
            boardT);
  });

  it('should ignore clicking on a non-empty cell', function () {
	  var boardT=getInitialBoard();
	  boardT[0][0]="R";
    clickDivAndExpectPiece(0, 0, "R");
    clickDivAndExpectPiece(0, 0, "B"); // clicking on a non-empty cell doesn't do anything.
   // clickDivAndExpectPiece(1, 1, "B");
    expectBoard(
       boardT);
  });
/*
  it('should end game if X wins', function () {
    for (var col = 0; col < 3; col++) {
      clickDivAndExpectPiece(1, col, "R");
      // After the game ends, player "B" click (in cell 2x2) will be ignored.
      clickDivAndExpectPiece(2, col, col === 2 ? "" : "B");
    }
    expectBoard(
        [['', '', ''],
         ['X', 'X', 'X'],
         ['O', 'O', '']]);
  });

  it('should end the game in tie', function () {
    clickDivAndExpectPiece(0, 0, "R");
    clickDivAndExpectPiece(1, 0, "B");
    clickDivAndExpectPiece(0, 1, "R");
    clickDivAndExpectPiece(1, 1, "B");
    clickDivAndExpectPiece(1, 2, "R");
    clickDivAndExpectPiece(0, 2, "B");
    clickDivAndExpectPiece(2, 0, "R");
    clickDivAndExpectPiece(2, 1, "B");
    clickDivAndExpectPiece(2, 2, "R");
    expectBoard(
        [['X', 'X', 'O'],
         ['O', 'O', 'X'],
         ['X', 'O', 'X']]);
  });

  var delta1 = {row: 1, col: 0};
  var board1 =
      [['X', 'O', ''],
       ['X', '', ''],
       ['', '', '']];
  var delta2 = {row: 1, col: 1};
  var board2 =
      [['X', 'O', ''],
       ['X', 'O', ''],
       ['', '', '']];
  var delta3 = {row: 2, col: 0};
  var board3 =
      [['X', 'O', ''],
       ['X', 'O', ''],
       ['X', '', '']];
  var delta4 = {row: 2, col: 1};
  var board4 =
      [['X', 'O', ''],
       ['X', 'O', ''],
       ['', 'X', '']];

  var matchState2 = {
    turnIndexBeforeMove: 1,
    turnIndex: 0,
    endMatchScores: null,
    lastMove: [{setTurn: {turnIndex: 0}},
          {set: {key: 'board', value: board2}},
          {set: {key: 'delta', value: delta2}}],
    lastState: {board: board1, delta: delta1},
    currentState: {board: board2, delta: delta2},
    lastVisibleTo: {},
    currentVisibleTo: {},
  };
  var matchState3 = {
    turnIndexBeforeMove: 0,
    turnIndex: -2,
    endMatchScores: [1, 0],
    lastMove: [{endMatch: {endMatchScores: [1, 0]}},
         {set: {key: 'board', value: board3}},
         {set: {key: 'delta', value: delta3}}],
    lastState: {board: board2, delta: delta2},
    currentState: {board: board3, delta: delta3},
    lastVisibleTo: {},
    currentVisibleTo: {},
  };
  var matchState4 = {
    turnIndexBeforeMove: 0,
    turnIndex: 1,
    endMatchScores: null,
    lastMove: [{setTurn: {turnIndex: 1}},
         {set: {key: 'board', value: board4}},
         {set: {key: 'delta', value: delta4}}],
    lastState: {board: board2, delta: delta2},
    currentState: {board: board4, delta: delta4},
    lastVisibleTo: {},
    currentVisibleTo: {},
  };

  it('can start from a match that is about to end, and win', function () {
    setMatchState(matchState2, 'passAndPlay');
    expectBoard(board2);
    clickDivAndExpectPiece(2, 0, "R"); // winning click!
    clickDivAndExpectPiece(2, 1, ""); // can't click after game ended
    expectBoard(board3);
  });

  it('cannot play if it is not your turn', function () {
    // Now make sure that if you're playing "B" (your player index is 1) then
    // you can't do the winning click!
    setMatchState(matchState2, 1); // playMode=1 means that yourPlayerIndex=1.
    expectBoard(board2);
    clickDivAndExpectPiece(2, 0, ""); // can't do the winning click!
    expectBoard(board2);
  });

  it('can start from a match that ended', function () {
    setMatchState(matchState3, 'passAndPlay');
    expectBoard(board3);
    clickDivAndExpectPiece(2, 1, ""); // can't click after game ended
  });

  it('should make an AI move after at most 1.5 seconds', function () {
    setMatchState(matchState4, 'playAgainstTheComputer');
    browser.sleep(1500);
    expectBoard(
        [['X', 'O', ''],
         ['X', 'O', ''],
         ['O', 'X', '']]);
    clickDivAndExpectPiece(2, 2, "R"); // Human-player X did a very stupid move!
    browser.sleep(1500); // AI will now make the winning move
    expectBoard(
        [['X', 'O', 'O'],
         ['X', 'O', ''],
         ['O', 'X', 'X']]);
    clickDivAndExpectPiece(1, 2, ""); // Can't make a move after game is over
  });
  */
});
describe("aiService", function() {

  'use strict';

  var _aiService;

  beforeEach(module("myApp"));

  beforeEach(inject(function (aiService) {
    _aiService = aiService;
  }));


  var horIndex = [[0, 8], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13],[0,14],[0,15],
                  [1,15], [2, 15], [3, 15], [4, 15], [5, 15],[6,15],[7,15]];
function setBoard(){
    var i, j;
    var board = new Array(14);
    for(i=0; i<15; ++i){
      board[i] = new Array(14);
      for(j=horIndex[i][0]; j<horIndex[i][1]; ++j){
        //  console.log(i,j);
        board[i][j] = '';
      }
    }
    return board;
  }

  iit("R finds an immediate winning move", function() {
    var board=setBoard();
    for(var i=0; i<7; ++i) {
      board[0][i]='R';
    }
    var boardNext=setBoard();
    for(var i=0; i<8; ++i) {
      boardNext[0][i]='R';
    }
    var move = _aiService.createComputerMove(
       board, 0, {maxDepth: 1});
    var expectedMove =
        [{endMatch: {endMatchScores: [1, 0]}},
          {set: {key: 'board', value:
              boardNext}},
          {set: {key: 'delta', value: {row: 0, col: 7}}}];
    expect(angular.equals(move, expectedMove)).toBe(true);
  });

  it("B finds an immediate winning move", function() {
     var board=setBoard();
    for(var i=0; i<7; ++i) {
      board[0][i]='B';
    }
   
    var move = _aiService.createComputerMove(
        board, 1, {maxDepth: 1});
    expect(angular.equals(move[2].set.value, {row: 0, col: 7})).toBe(true);
  });

  it("R prevents an immediate win", function() {
       var board=setBoard();
    for(var i=0; i<7; ++i) {
      board[0][i]='B';
    }
    var move = _aiService.createComputerMove(
        board, 0, {maxDepth: 2});
    expect(angular.equals(move[2].set.value, {row: 0, col: 7})).toBe(true);
  });

  it("B prevents an immediate win", function() {
       
   var board4=setBoard();
    for(i=0; i<9; ++i) {
      board4[i][1]='R';
    }
    for(i=1; i<14; ++i) {
      board4[8][i]='R';
    }
    var move = _aiService.createComputerMove(
        board4, 1, {maxDepth: 2});
    expect(angular.equals(move[2].set.value, {row: 8, col: 14})).toBe(true);
  });

  it("B prevents another immediate win", function() {
    var board5=setBoard();
    for(i=1; i<4; ++i) {
      for(j=1; j<4; ++j) {
        board5[i][j]='R';
      }
    }
    board5[2][2]='';
    board5[1][1]='';
    var move = _aiService.createComputerMove(
        board5, 1, {maxDepth: 2});
    expect(angular.equals(move[2].set.value, {row: 1, col: 1})).toBe(true);
  });

 /* it("R finds a winning move that will lead to winning in 2 steps", function() {
    var move = _aiService.createComputerMove(
        [['R', '', ''],
         ['B', 'R', ''],
         ['', '', 'B']], 0, {maxDepth: 3});
    expect(angular.equals(move[2].set.value, {row: 0, col: 1})).toBe(true);
  });

  it("B finds a winning move that will lead to winning in 2 steps", function() {
    var move = _aiService.createComputerMove(
        [['', 'R', ''],
         ['R', 'R', 'B'],
         ['', 'B', '']], 1, {maxDepth: 3});
    expect(angular.equals(move[2].set.value, {row: 2, col: 2})).toBe(true);
  });

  it("B finds a cool winning move that will lead to winning in 2 steps", function() {
    var move = _aiService.createComputerMove(
        [['R', 'B', 'R'],
         ['R', '', ''],
         ['B', '', '']], 1, {maxDepth: 3});
    expect(angular.equals(move[2].set.value, {row: 2, col: 1})).toBe(true);
  });
*/
  it("B finds the wrong move due to small depth", function() {
     var board=setBoard();
    
      board[0][0]='R';
    
    var move = _aiService.createComputerMove(
       board, 1, {maxDepth: 3});
    expect(angular.equals(move[2].set.value, {row: 0, col: 1})).toBe(true);
  });

  it("B finds the correct move when depth is big enough", function() {
     var board=setBoard();
    
      board[0][0]='R';
    var move = _aiService.createComputerMove(
        board, 1, {maxDepth: 8});
    expect(angular.equals(move[2].set.value, {row: 1, col: 1})).toBe(true);
  });

  it("R finds a winning move that will lead to winning in 2 steps", function() {
     var board=setBoard();
    for(var i=0; i<6; ++i) {
      board[0][i]='R';
    }
    var move = _aiService.createComputerMove(
        board, 0, {maxDepth: 7});
    expect(angular.equals(move[2].set.value, {row: 0, col: 6})).toBe(true);
  });

});
angular.module('myApp')
  .controller('Ctrl',
      ['$scope', '$log', '$timeout',
       'gameService', 'stateService', 'gameLogic', 'resizeGameAreaService',
      function ($scope, $log, $timeout,
        gameService, stateService, gameLogic, resizeGameAreaService) {

    'use strict';

    resizeGameAreaService.setWidthToHeight(1);

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
        $log.info(["Cell is already full in position:", row, col]);
        return;
      }
    };
    $scope.shouldShowImage = function (row, col) {
      var cell = $scope.board[row][col];
      return cell !== "";
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
  }]);
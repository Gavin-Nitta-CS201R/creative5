angular.module('wackamole', ['ngMaterial'])
  .controller('MainCtrl', [
    '$scope', '$http', '$mdDialog',
    function ($scope, $http, $mdDialog) {

      $scope.highscores = [];
      function init() {
        $http.get('/highscore').success(function (data) {
          angular.copy(data, $scope.highscores);
        });
      }
      init();

      function create(obj) {
        $http.post('/highscore', obj).success(function (data) {
          var canvas = document.getElementById("whackamole");
          var ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, 500, 500);
          $scope.loadGame();
        });
      };

      function checkScore(score) {
        var prompt = score > 5 ? (score > 10 ? (score > 15 ? (score == 20 ? 'IMPOSSIBLE!!!' : 'Great Job!') : 'Not too shabby!') : 'Keep Trying...') : 'Better luck next time';
        var confirm = $mdDialog.prompt()
          .title(prompt)
          .textContent('What is your name?')
          .placeholder('Name')
          .ariaLabel('Name')
          .ok('Continue')
          .cancel('Retry');

        $mdDialog.show(confirm).then(function (name) {
          create({ name: name, score: score });
        }, function () {
          console.log('This is the cancel');
        });
      }

      /* Define Canvas */
      var canvas = '';
      var stage = '';
      /* Background */
      var titleBg = '';
      /* Title View */
      var titleBgImg = new Image();
      var titleBg = '';
      var playBtnImg = new Image();
      var playBtn = '';
      var titleView = new Container();
      /* Game Bg */
      var gameBgImg = new Image();
      var gameBg = '';
      /* Alert */
      var alertBgImg = new Image();
      var alertBg = '';
      /* Score */
      var score = 0;
      /* moles */
      var wormImg = new Image();
      var worm = '';
      var wormsX = [80, 198, 338, 70, 225, 376, 142, 356];
      var wormsY = [11, 51, 34, 110, 136, 96, 211, 186];
      var lastWorm = '';
      /* Variables */
      var centerX = 240;
      var centerY = 160;
      var gfxLoaded = 0;
      var timerSource = '';
      var currentWorms = 0;
      var wormsHit = 0;
      var totalWorms = 20;
      $scope.loadGame = function () {
        canvas = document.getElementById('whackamole');
        stage = new Stage(canvas);
        stage.mouseEventsEnabled = true;

        /* Load GFX */

        titleBgImg.src = 'images/titleBg.png';
        titleBgImg.name = 'titleBg';
        titleBgImg.onload = loadGfx;

        gameBgImg.src = 'images/gameBg.png';
        gameBgImg.name = 'gameBg';
        gameBgImg.onload = loadGfx;

        playBtnImg.src = 'images/playBtn.png';
        playBtnImg.name = 'playBtn';
        playBtnImg.onload = loadGfx;

        alertBgImg.src = 'images/alertBg.png';
        alertBgImg.name = 'alertBg';
        alertBgImg.onload = loadGfx;

        wormImg.src = 'images/worm.png'; //CHANGE IMG
        wormImg.name = 'worm';
        wormImg.onload = loadGfx;

        /* Ticker */

        Ticker.setFPS(30);// = 30;
        Ticker.addListener(stage);
      };

      function loadGfx(e) {
        if (e.target.name = 'titleBg') { titleBg = new Bitmap(titleBgImg); }
        if (e.target.name = 'gameBg') { gameBg = new Bitmap(gameBgImg); }
        if (e.target.name = 'playBtn') { playBtn = new Bitmap(playBtnImg); }
        if (e.target.name = 'alertBg') { alertBg = new Bitmap(alertBgImg); }
        /* --Worms */

        gfxLoaded++;

        if (gfxLoaded == 5) {
          addTitleView();
        }
      }

      function addTitleView() {
        /* Add GameView BG */

        stage.addChild(gameBg);
        /* Title Screen */

        playBtn.x = centerX - 25;
        playBtn.y = centerY + 35;

        titleView.addChild(titleBg, playBtn);

        stage.addChild(titleView);

        startButtonListeners('add');

        stage.update();
      }

      function startButtonListeners(action) {
        if (action == 'add') {
          titleView.getChildAt(1).onPress = showGameView;
        }
        else {
          titleView.getChildAt(1).onPress = null;
        }
      }

      function showGameView() {
        Tween.get(titleView).to({ x: -480 }, 200).call(
          function () {
            startButtonListeners('rmv');
            stage.removeChild(titleView);
            titleView = null;
            showWorm();
          }
        );
        score = new Text('0' + '/' + totalWorms, 'bold 15px Arial', '#EEE');
        score.maxWidth = 1000;    //fix for Chrome 17
        score.x = 58;
        score.y = 21;
        stage.addChild(score);
      }

      function showWorm() {
        if (currentWorms == totalWorms) {
          showAlert();
        }
        else {
          if (lastWorm != null) {
            lastWorm.onPress = null;
            stage.removeChild(lastWorm);
            stage.update();
            lastWorm = null;
          }
          var randomPos = Math.floor(Math.random() * 8);
          var worm = new Bitmap(wormImg);

          worm.x = wormsX[randomPos];
          worm.y = wormsY[randomPos];
          stage.addChild(worm);
          worm.onPress = wormHit;

          lastWorm = worm;
          lastWorm.scaleY = 0.3;
          lastWorm.y += 42;
          stage.update();

          Tween.get(lastWorm).to({ scaleY: 1, y: wormsY[randomPos] }, 200).wait(400).call(function () { currentWorms++; showWorm() });
        }
      }

      function wormHit() {
        wormsHit++;
        score.text = wormsHit + '/' + totalWorms;

        lastWorm.onPress = null;
        stage.removeChild(lastWorm);
        lastWorm = null;
        stage.update();
      }

      function showAlert() {
        alertBg.x = centerX - 120;
        alertBg.y = -80;
        stage.addChild(alertBg);

        Tween.get(alertBg).to({ y: centerY - 80 }, 200).call(function () {
          Ticker.removeAllListeners();
          var score = new Text(wormsHit + '/' + totalWorms, 'bold 20px Arial', '#EEE');
          score.maxWidth = 1000;    //fix for Chrome 17
          score.x = 220;
          score.y = 205;
          stage.addChild(score);

          stage.update();
          checkScore(wormsHit);
        });
      }

    }
  ]);

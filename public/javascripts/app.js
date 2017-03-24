angular.module('wackamole', [])
  .controller('MainCtrl', [
    '$scope', '$http',
    function ($scope, $http) {

      $scope.highscores = [];

      function getscores() {
        return $http.get('/highscore').success(function (data) {
          angular.copy(data, $scope.highscores);
        });
      };

      $scope.create = function (highscore) {
        return $http.post('/highscore', highscore).success(function (data) {
          $scope.highscores.push(data);
        });
      };

      getscores();
    }
  ]);

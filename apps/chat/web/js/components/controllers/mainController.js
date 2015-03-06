var societyProChatControllers = 
angular.module('societyProChatApp.controllers',['ngMaterial', 'societyProChatApp.controller2'])

.controller('mainController',['$scope','$http','$rootScope',function($scope,$http,$rootScope) {
  $scope.token = "12345";
  $rootScope.dropdowns = {
    overflow: {
      shown: false,
      title: "",
      fromElement: null,
      data: [],
    },
    subscribers: {
      shown: false,
      title: "",
      fromElement: null,
      data: [],
    },
  }

  $scope.roles = [
    {
      "id": "abc",
      "name": "Calix",
      "img": "web/images/role-image.png" 
    },
    {
      "id": "xyz",
      "name": "Tomas",
      "img": "web/images/role-image.png" 
    }
  ]

  $scope.channels = [];
  $scope.peers = [];
  $scope.currentRole = {};

  /*$(".dropdown-scrim").on("click", function () {
    //Close open dropdowns
    //Reset 
    $(".dropdown-scrim").style("pointer-events","none");
  });

  function enableScrim () {
    $(".dropdown-scrim").style("pointer-events","auto");
  }*/
  $(document).mouseup(function (e) {
    var container = $(".sopro-channels-overflow");

    if (!container.is(e.target) // if the target of the click isn't the container...
        && container.has(e.target).length === 0) // ... nor a descendant of the container
    {
        $rootScope.$broadcast("closeOverflow");
    }
  });

  $scope.changeRole = function (role) {
      $scope.currentRole = role;

      $http({
        method: 'GET',
        url: '/api/channels',
        headers: {
         'token-auth': $scope.token
        },
        params : {
          role: role.id
        }
      })
        .success(function(data, status, headers, config) {
          // this callback will be called asynchronously
          // when the response is available
          //console.log(data);
          $scope.channels = data.channels;
          $scope.peers = data.peers;
        })
        .error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
          console.log(data);
        });

        $scope.showRoles = false;
  };


  $scope.changeRole($scope.roles[0]);

}]);
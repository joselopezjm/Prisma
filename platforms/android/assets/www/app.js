var app = angular.module("my-social-network", ["ui.router"]);

app.config(["$stateProvider", "$urlRouterProvider",

    function($state, $url) {
        $url.otherwise("/login");
        $url.when("/home", "/home/index");

        $state
            .state("login", {
                "url": "/login",
                "templateUrl": "views/login.html",
                "controller": "LoginCtrl"
            })
            .state("home", {
                "url": "/home",
                "templateUrl": "views/home.html",
                "controller": "HomeCtrl"
            })
            .state("home.index", {
                "url": "/index",
                "templateUrl": "views/index.html",
                "controller": "IndexCtrl"
            })
            .state("home.takePicture", {
                "url": "/take-picture",
                "templateUrl": "views/take-picture.html",
                "controller": "TakePictureCtrl"
            })
            .state("register", {
                "url": "/register",
                "templateUrl": "views/register.html",
                "controller": "RegisterCtrl"
            });

    }
]);

app.controller("RegisterCtrl", ["$scope", "$http", "$state",

    function ($scope, $http, $state) {
        
    }

]);

app.controller("LoginCtrl", ["$scope", "$http", "$state",

    function ($scope, $http, $state) {
//        $state.transitionTo("home");
    }

]);



app.controller("HomeCtrl", ["$scope", "$http",
    function ($scope, $http) {

    }
]);

app.controller("IndexCtrl", ["$scope", "$http",
    function ($scope, $http) {

    }
]);

app.controller("TakePictureCtrl", ["$scope", "$http",
    function ($scope, $http) {
        $scope.myImg = {
            src: ""
        };

        function onSuccess(imageData) {
             $scope.myImg.src = "data:image/jpeg;base64," + imageData;             
             $scope.$apply();
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }

        $scope.takePicture = function () {
            navigator.camera.getPicture(onSuccess, onFail, {
                 quality: 50,
                 destinationType: Camera.DestinationType.DATA_URL
            });
        }
    }
]);
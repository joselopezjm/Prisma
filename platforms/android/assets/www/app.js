var app = angular.module("my-social-network", ["ui.router",'angular-loading-bar']);

app.config(["$stateProvider", "$urlRouterProvider",

    function ($state, $url) {
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
            .state("home.search", {
                "url": "/search",
                "templateUrl": "views/search.html",
                "controller": "SearchCtrl"
            })
            .state("home.takePicture", {
                "url": "/take-picture",
                "templateUrl": "views/take-picture.html",
                "controller": "TakePictureCtrl"
            })
            .state("home.upload", {
                "url": "/upload",
                "templateUrl": "views/upload.html",
                "controller": "UploadCtrl"
            })
            .state("register", {
                "url": "/register",
                "templateUrl": "views/register.html",
                "controller": "RegisterCtrl"
            })
            .state("home.profile", {
                "url": "/profile",
                "templateUrl": "views/profile.html",
                "controller": "ProfileCtrl"
            });

    }
]);

app.config(['cfpLoadingBarProvider', function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeBar = true;
    cfpLoadingBarProvider.includeSpinner = false;
  }])

app.controller("SearchCtrl", ["$scope", "$http", "$state", "$sce",

    function ($scope, $http, $state, $sce) {
        $scope.publish = [];
        $scope.signout = function () {
            window.localStorage.removeItem("token");
            $state.go('login');
        }
    var formData = new FormData();
        $('#inp-search').css("border", "");
        $('#als').html("");
        document.getElementById("register_alert4").style.display="none";
        
        var vacio = "",
            aux8 = false;
        
        $.checkSearch = function () {
            var search = document.getElementById('inp-search').value;

            if (search.trim() == vacio) {
                $('#inp-search').css("border", "1px solid #ff4d4d");
                $('#als').html("You must enter a username...");
                aux8 = true;
            }
        }

        $scope.searchf = function () {
            
            $.checkSearch();
            
            if(aux8==false){
                $('#inp-search').css("border", "");
                $('#als').html("");
                document.getElementById("register_alert4").style.display="none";
                
                for(var f=0; f< $('#content').find('div').length; f++){
                    $("#search").remove();
                }
                console.log($('#content').find('div').length);
                
                
                $http({
                    method: "POST",
                    url: "http://192.168.0.116:8080/Instagram_server/get_publishes",
                    data: "type=" + "2" + "&se=" + document.getElementById("inp-search").value.trim().toLowerCase(),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function (data) {
                    if (data.error) {
                        $('#inp-search').css("border", "");
                        $('#als').html("");
                        document.getElementById("register_alert4").style.display="block";
                        document.getElementById("register_alert4").innerHTML="Sorry, no results found...";
                    } else {
                        document.getElementById("register_alert4").style.display="none";
                        var user_likes;
                        $http({
                            method: "POST",
                            url: "http://192.168.0.116:8080/Instagram_server/likes",
                            data: "func=1&idu=" + window.localStorage.getItem("id"),
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).success(function (data) {
                            if (data.error) {
                                user_likes = null;
                                cont();
                            } else {
                                user_likes = data.likes;
                                cont();
                            }
                            });
                        
                        function cont() {
                            $scope.publish = data.publishes.map(function (el) {
                                $http({
                                    method: "POST",
                                    url: "http://192.168.0.116:8080/Instagram_server/likes",
                                    data: "id=" + el.id_publish + "&func=0",
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }

                                }).success(function (data) {
                                    el.likes = data.likes;

                                });

                                if (user_likes == null) {
                                    el.user_like = false;
                                } else {
                                    for (var x = 0; x < user_likes.length; x++) {
                                        if (user_likes[x].id_publish == el.id_publish) {
                                            el.user_like = true;
                                        }
                                    }
                                    if (!el.user_like) {
                                        el.user_like = false;
                                    }
                                }

                                if (el.media_type_publish === "image") {
                                    el.media_publish = $sce.trustAsResourceUrl("http://192.168.0.116:8080/Instagram_server/get-file?path=" + el.media_publish + "&nm=" + el.title_publishs);
                                } else {
                                    el.media_publish = $sce.trustAsResourceUrl("http://192.168.0.116:8080/Instagram_server/get-video?path=" + el.media_publish);
                                }

                                return el;
                            });
                        
                            console.log($scope.publish);
                        }
                    }
                });
                
              $scope.like = function (publish,id) {
            if(publish.promise==undefined){
            console.log('Liking'); 
            formData.append("publish_id", publish.id_publish);
            formData.append("user_id", window.localStorage.getItem("id"));
            formData.append("func", "2");
            
            publish.promise = $http({
                method: "POST",
                url: "http://192.168.0.116:8080/Instagram_server/likes",
                data: formData,
                headers: {
                    "Content-Type": undefined
                }
            }).success(function (data) {
                if(id==1){
                publish.likes = parseInt(publish.likes) + 1;
                publish.user_like = true;
                console.log(data);
                    publish.promise = undefined;
                }
                if(id==0){
                publish.likes = parseInt(publish.likes) - 1;
                publish.user_like = false;
                    publish.promise = undefined;
                }
               
            });
        }
        }
                
            }else{ 
                aux8 = false;
                document.getElementById("register_alert4").style.display="none";
            }
        }
}]);


app.controller("ProfileCtrl", ["$scope", "$http", "$state", "$sce",
       function ($scope, $http, $state, $sce) {
        $scope.publish = [];
        $scope.signout = function () {
            window.localStorage.removeItem("token");
            $state.go('login');
        }
        $scope.name = window.localStorage.getItem("name");
        $scope.nickname = window.localStorage.getItem("nick").toLowerCase();
        $scope.lastname = window.localStorage.getItem("lastname");
        $scope.email = window.localStorage.getItem("email");

        $http({
            method: "POST",
            url: "http://192.168.0.116:8080/Instagram_server/get_publishes",
            data: "type=" + "3" + "&se=" + localStorage.getItem("id"),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }).success(function (data) {
            console.log(data.publishes);
            if(data.publishes!=undefined){
            $scope.publish = data.publishes.map(function (el) {
                $http({
                    method: "POST",
                    url: "http://192.168.0.116:8080/Instagram_server/likes",
                    data: "id=" + el.id_publish + "&func=0",
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }

                }).success(function (data) {
                    el.likes = data.likes;
                });
                if (el.media_type_publish === "image") {
                    el.media_publish = $sce.trustAsResourceUrl("http://192.168.0.116:8080/Instagram_server/get-file?path=" + el.media_publish + "&nm=" + el.title_publishs);
                } else {
                    el.media_publish = $sce.trustAsResourceUrl("http://192.168.0.116:8080/Instagram_server/get-video?path=" + el.media_publish);
                }
                return el;
            });}
        });


    }
]);


app.controller("RegisterCtrl", ["$scope", "$http", "$state",

    function ($scope, $http, $state) {

        if (window.localStorage.getItem("token")) {
            $state.go('home.index');
        }

        $('#inputn').css("border", "");
        $('#inputln').css("border", "");
        $('#inpute').css("border", "");
        $('#inputnn').css("border", "");
        $('#inputp').css("border", "");
        $('#afn').html("");
        $('#aln').html("");
        $('#ae').html("");
        $('#ann').html("");
        $('#apw').html("");
        document.getElementById("register_alert2").style.display = "none";

        var vacio = "",
            aux1 = false,
            aux2 = false,
            aux3 = false,
            aux4 = false,
            aux5 = false,
            regex = /^\w+@[a-zA-Z_]+?\.\w+$/;

        $.checkRegister = function () {
            var name = document.getElementById('inputn').value,
                lastname = document.getElementById('inputln').value,
                email = document.getElementById('inpute').value,
                nickname = document.getElementById('inputnn').value,
                password = document.getElementById('inputp').value;

            if (name.trim() == vacio) {
                $('#inputn').css("border", "1px solid #ff4d4d");
                $('#afn').html("Enter your name please...");
                aux1 = true;
            }

            if (lastname.trim() == vacio) {
                $('#inputln').css("border", "1px solid  #ff9900");
                $('#aln').html("Enter your lastname please...");
                aux2 = true;
            }

            if ((email.trim() == vacio) || (!regex.test(email.trim()))) {
                $('#inpute').css("border", "1px solid #70db70");
                $('#ae').html("Enter your email address please...");
                aux3 = true;
            }

            if (nickname.trim() == vacio) {
                $('#inputnn').css("border", "1px solid #8080ff");
                $('#ann').html("Enter your username please...");
                aux4 = true;
            }

            if (password.trim() == vacio) {
                $('#inputp').css("border", "1px solid #d279d2");
                $('#apw').html("Enter your password please...");
                aux5 = true;
            }
        }

        $scope.register = function () {

            $.checkRegister();

            if (aux1 == false) {
                if (aux2 == false) {
                    if (aux3 == false) {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                                $('#ae').html("");
                                $('#ann').html("");
                                $('#apw').html("");
                                document.getElementById("register_alert2").style.display = "none";

                                $.ajax({
                                    url: "http://192.168.0.116:8080/Instagram_server/Signup",
                                    type: "POST",
                                    data: {
                                        firstName: document.getElementById('inputn').value.trim(), // input  firt name del modal2
                                        lastName: document.getElementById('inputln').value.trim(), // input last name del modal2
                                        nickname: document.getElementById('inputnn').value.trim().toLowerCase(), // input  birthday del modal2
                                        email: document.getElementById('inpute').value.trim(), // input email del modal2
                                        pass: document.getElementById('inputp').value.trim() // input password del modal2
                                    },
                                    success: function (data) {
                                        console.log(data);
                                        data = JSON.parse(data);
                                        // Si no hay error
                                        if (!data.error) { // si el email no existe
                                            window.localStorage.removeItem("token");
                                            var token = CryptoJS.MD5(document.getElementById('inputnn').value).toString();
                                            window.localStorage.setItem("token", token);
                                            window.localStorage.setItem("id", data.user[0].id_app_user);
                                            window.localStorage.setItem("nick", document.getElementById('inputnn').value.toLowerCase());
                                            window.localStorage.setItem("name", document.getElementById('inputn').value);
                                            window.localStorage.setItem("lastname", document.getElementById('inputln').value);
                                            window.localStorage.setItem("email", document.getElementById('inpute').value);
                                            document.getElementById('inputn').value = "";
                                            document.getElementById('inputln').value = "";
                                            document.getElementById('inputnn').value = "";
                                            document.getElementById('inpute').value = "";
                                            document.getElementById('inputp').value = "";
                                            $state.go('home.index');

                                        } else {
                                            var error = data.error;
                                            document.getElementById("register_alert2").style.display = "block";
                                            document.getElementById("register_alert2").innerHTML = "User information already exists";
                                            document.getElementById('inputn').value = "";
                                            document.getElementById('inputln').value = "";
                                            document.getElementById('inputnn').value = "";
                                            document.getElementById('inpute').value = "";
                                            document.getElementById('inputp').value = "";
                                            console.log(error);
                                        }
                                    },
                                    error: function (err) {
                                        document.getElementById('inputn').value = "";
                                        document.getElementById('inputln').value = "";
                                        document.getElementById('inputnn').value = "";
                                        document.getElementById('inpute').value = "";
                                        document.getElementById('inputp').value = "";
                                        document.getElementById("register_alert2").style.display = "block";
                                        document.getElementById("register_alert2").innerHTML = "User information already exists";

                                    }
                                });
                            } else {
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                                $('#ae').html("");
                                $('#ann').html("");
                            } //if de aux5
                        } else {
                            if (aux5 == false) {
                                aux4 = false;
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                                $('#ae').html("");
                                $('#apw').html("");
                            } else {
                                aux4 = false;
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                                $('#ae').html("");
                            }
                        } // if de aux4
                    } else {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                aux3 = false;
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                                $('#apw').html("");
                                $('#ann').html("");
                            } else {
                                aux3 = false;
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                                $('#ann').html("");
                            }
                        } else {
                            if (aux5 == false) {
                                aux3 = false;
                                aux4 = false;
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                                $('#apw').html("");
                            } else {
                                aux3 = false;
                                aux4 = false;
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#inputln').css("border", "");
                                $('#afn').html("");
                                $('#aln').html("");
                            }
                        }
                    } //if de aux3
                } else {
                    if (aux3 == false) {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                aux2 = false;
                                $('#inputn').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#ae').html("");
                                $('#ann').html("");
                                $('#apw').html("");
                            } else {
                                aux2 = false;
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#afn').html("");
                                $('#ae').html("");
                                $('#ann').html("");

                            }
                        } else {
                            if (aux5 == false) {
                                aux2 = false;
                                aux4 = false;
                                $('#inputn').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#ae').html("");
                                $('#apw').html("");
                            } else {
                                aux2 = false;
                                aux4 = false;
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#inpute').css("border", "");
                                $('#afn').html("");
                                $('#ae').html("");
                            }
                        }
                    } else {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                aux2 = false;
                                aux3 = false;
                                $('#inputn').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#ann').html("");
                                $('#apw').html("");
                            } else {
                                aux2 = false;
                                aux3 = false;
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#afn').html("");
                                $('#ann').html("");
                            }
                        } else {
                            if (aux5 == false) {
                                aux2 = false;
                                aux3 = false;
                                aux4 = false;
                                $('#inputn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#afn').html("");
                                $('#apw').html("");
                            } else {
                                aux2 = false;
                                aux3 = false;
                                aux4 = false;
                                aux5 = false;
                                $('#inputn').css("border", "");
                                $('#afn').html("");
                            }
                        }
                    }
                } //if de aux 2
            } else {
                if (aux2 == false) {
                    if (aux3 == false) {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                aux1 = false;
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#aln').html("");
                                $('#ae').html("");
                                $('#ann').html("");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#aln').html("");
                                $('#ae').html("");
                                $('#ann').html("");
                            } //aux5
                        } else {
                            if (aux5 == false) {
                                aux1 = false;
                                aux4 = false;
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#inputp').css("border", "");
                                $('#aln').html("");
                                $('#ae').html("");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                aux4 = false;
                                $('#inputln').css("border", "");
                                $('#inpute').css("border", "");
                                $('#aln').html("");
                                $('#ae').html("");
                            }
                        } //aux4
                    } else {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                aux1 = false;
                                aux3 = false;
                                $('#inputln').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#aln').html("");
                                $('#ann').html("");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                aux3 = false;
                                $('#inputln').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#aln').html("");
                                $('#ann').html("");
                            } //aux5
                        } else {
                            if (aux5 == false) {
                                aux1 = false;
                                aux4 = false;
                                aux3 = false;
                                $('#inputln').css("border", "");
                                $('#inputp').css("border", "");
                                $('#aln').html("");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                aux4 = false;
                                aux3 = false;
                                $('#inputln').css("border", "");
                                $('#aln').html("");
                            }
                        }
                    } //aux3
                } else {
                    if (aux3 == false) {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                aux1 = false;
                                aux2 = false;
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#ae').html("");
                                $('#ann').html("");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                aux2 = false;
                                $('#inpute').css("border", "");
                                $('#inputnn').css("border", "");
                                $('#ae').html("");
                                $('#ann').html("");
                            } //aux5
                        } else {
                            if (aux5 == false) {
                                aux1 = false;
                                aux4 = false;
                                aux2 = false;
                                $('#inpute').css("border", "");
                                $('#inputp').css("border", "");
                                $('#ae').html("");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                aux4 = false;
                                aux2 = false;
                                $('#inpute').css("border", "");
                                $('#ae').html("");
                            }
                        } //aux4
                    } else {
                        if (aux4 == false) {
                            if (aux5 == false) {
                                aux1 = false;
                                aux3 = false;
                                aux2 = false;
                                $('#inputnn').css("border", "");
                                $('#inputp').css("border", "");
                                $('#ann').html("");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                aux3 = false;
                                aux2 = false;
                                $('#inputnn').css("border", "");
                                $('#ann').html("");
                            } //aux5
                        } else {
                            if (aux5 == false) {
                                aux1 = false;
                                aux4 = false;
                                aux3 = false;
                                aux2 = false;
                                $('#inputp').css("border", "");
                                $('#apw').html("");
                            } else {
                                aux1 = false;
                                aux5 = false;
                                aux4 = false;
                                aux3 = false;
                                aux2 = false;
                            }
                        }
                    } //aux3

                } //aux2
            } //if de aux 1
        }
    }
]);

app.controller("LoginCtrl", ["$scope", "$http", "$state",

    function ($scope, $http, $state) {
        //        $state.go('home.index');
        if (window.localStorage.getItem("token")) {
            $state.go('home.index');
        }

        $('#inputnnlogin').css("border", "");
        $('#inputplogin').css("border", "");
        $('#alnn').html("");
        $('#alpw').html("");
        document.getElementById("register_alert").style.display = "none";

        var vacio = "",
            aux6 = false,
            aux7 = false;

        $.checkLogin = function () {
            var username = document.getElementById('inputnnlogin').value,
                passlog = document.getElementById('inputplogin').value;

            if (username.trim() == vacio) {
                $('#inputnnlogin').css("border", "1px solid #ff4d4d");
                $('#alnn').html("Enter your username please...");
                aux6 = true;
            }

            if (passlog.trim() == vacio) {
                $('#inputplogin').css("border", "1px solid  #ff9900");
                $('#alpw').html("Enter your password please...");
                aux7 = true;
            }
        }

        $scope.login = function () {

            $.checkLogin();

            if (aux6 == false) {
                if (aux7 == false) {
                    $('#inputnnlogin').css("border", "");
                    $('#inputplogin').css("border", "");
                    $('#alnn').html("");
                    $('#alpw').html("");
                    document.getElementById("register_alert").style.display = "none";
                    $.ajax({
                        url: "http://192.168.0.116:8080/Instagram_server/Login",
                        type: "POST",
                        data: {
                            nickname: document.getElementById('inputnnlogin').value, // input  birthday del modal2
                            password: document.getElementById('inputplogin').value // input password del modal2
                        },
                        success: function (data) {
                            console.log(data);
                            data = JSON.parse(data);
                            // Si no hay error
                            if (!data.error) { // si el email no existe
                                window.localStorage.removeItem("token");
                                if (CryptoJS.MD5(document.getElementById('inputnnlogin').value).toString() == data.token) {
                                    window.localStorage.setItem("token", data.token);
                                    window.localStorage.setItem("id", data.id);
                                    window.localStorage.setItem("nick", data.nick.toLowerCase());
                                    window.localStorage.setItem("name", data.name);
                                    console.log(data.name+data.lastname);
                                    window.localStorage.setItem("lastname", data.lastname);
                                    window.localStorage.setItem("email", data.email);
                                    $state.go('home.index');
                                }
                            } else {
                                var error = data.error;
                                document.getElementById("register_alert").style.display = "block";
                                document.getElementById("register_alert").innerHTML = "Invalid username or password";
                                document.getElementById('inputnnlogin').value = "";
                                document.getElementById('inputplogin').value = "";
                                console.log(error);
                            }
                        },
                        error: function (err) {
                            var error = err;
                            document.getElementById("register_alert").style.display = "block";
                            document.getElementById("register_alert").innerHTML = "Invalid username or password";
                            document.getElementById('inputnnlogin').value = "";
                            document.getElementById('inputplogin').value = "";
                            console.log(error);

                        }
                    });
                } else {
                    aux7 = false;
                    $('#inputnnlogin').css("border", "");
                    $('#alnn').html("");
                } //aux6
            } else {
                if (aux7 == false) {
                    aux6 = false;
                    $('#inputplogin').css("border", "");
                    $('#alpw').html("");
                } else {
                    aux6 = false;
                    aux7 = false;
                }
            } //aux7
        }
    }

]);


var fileimg;
app.controller("HomeCtrl", ["$scope", "$http", "$state",
    function ($scope, $http, $state) {
        if (!window.localStorage.getItem("token")) {
            $state.go('login');
        }
        $scope.reset = function(){
              $state.reload('home.upload');
        }

        function onSuccess(imageData) {
            img.src = "data:image/jpeg;base64," + imageData;
            fileimg = "data:image/jpeg;base64," + imageData;
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

app.config(function ($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist([
   // Allow same origin resource loads.
   'self',
   // Allow loading from our assets domain.  Notice the difference between * and **.
   'http://192.168.0.116:8080/Instagram_server/**']);
});

app.controller("IndexCtrl", ["$scope", "$http", "$state", "$sce",
    function ($scope, $http, $state, $sce) {
        if (!window.localStorage.getItem("token")) {
            $state.go('login');
        }

        var formData = new FormData();
        formData.append("type", "1");


        $http({
            method: "POST",
            url: "http://192.168.0.116:8080/Instagram_server/get_publishes",
            data: "type=" + "1",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }

        }).success(function (data) {
            if (data.error) {
                alert("error");
            } else {

                var user_likes;
                $http({
                    method: "POST",
                    url: "http://192.168.0.116:8080/Instagram_server/likes",
                    data: "func=1&idu=" + window.localStorage.getItem("id"),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }

                }).success(function (data) {
                    if (data.error) {
                        user_likes = null;
                        cont();
                    } else {
                        user_likes = data.likes;
                        cont();
                    }
                });

                function cont() {
                    $scope.publish = data.publishes.map(function (el) {
                        $http({
                            method: "POST",
                            url: "http://192.168.0.116:8080/Instagram_server/likes",
                            data: "id=" + el.id_publish + "&func=0",
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }

                        }).success(function (data) {
                            el.likes = data.likes;

                        });
                        if (user_likes == null) {
                            el.user_like = false;
                        } else {
                            for (var x = 0; x < user_likes.length; x++) {
                                if (user_likes[x].id_publish == el.id_publish) {
                                    el.user_like = true;
                                }
                            }
                            if (!el.user_like) {
                                el.user_like = false;
                            }
                        }
                        if (el.media_type_publish === "image") {
                            el.media_publish = $sce.trustAsResourceUrl("http://192.168.0.116:8080/Instagram_server/get-file?path=" + el.media_publish + "&nm=" + el.title_publishs);
                        } else {
                            el.media_publish = $sce.trustAsResourceUrl("http://192.168.0.116:8080/Instagram_server/get-video?path=" + el.media_publish);
                        }

                        return el;
                    });
                    console.log($scope.publish);
                }

            }
        });

        $scope.like = function (publish,id) {
            if(publish.promise==undefined){
            console.log('Liking'); 
            formData.append("publish_id", publish.id_publish);
            formData.append("user_id", window.localStorage.getItem("id"));
            formData.append("func", "2");
            
            publish.promise = $http({
                method: "POST",
                url: "http://192.168.0.116:8080/Instagram_server/likes",
                data: formData,
                headers: {
                    "Content-Type": undefined
                }
            }).success(function (data) {
                if(id==1){
                publish.likes = parseInt(publish.likes) + 1;
                publish.user_like = true;
                console.log(data);
                    publish.promise = undefined;
                }
                if(id==0){
                publish.likes = parseInt(publish.likes) - 1;
                publish.user_like = false;
                    publish.promise = undefined;
                }
               
            });
        }
        }
    }
]);

app.controller("TakePictureCtrl", ["$scope", "$http","$state",
    function ($scope, $http,$state) {
        var img = document.getElementById('img');
        
        $('#desc1').css("border", "");
        $('#alph').html("");
        $('#alta1').html("");
        document.getElementById("register_alert7").style.display = "none";

        var vacio = "",
            aux22 = false,
            aux23 = false;
        
        $.checkTk = function () {
            var arch = document.getElementById('img').value,
                texa = document.getElementById('desc1').value;

            if (arch == vacio) {
                $('#alph').html("Take a photo...");
                aux22 = true;
            }

            if (texa.trim() == vacio) {
                $('#desc1').css("border", "1px solid  #ff9900");
                $('#alta1').html("Enter a description...");
                aux23 = true;
            }
        }

        $scope.upload = function () {
            
            $.checkTk();
            
            if (aux22 == false) {
                if (aux23 == false) {
                    $('#labelup1').removeClass("btn-danger");
                    $('#labelup1').addClass("btn-default");
                    $('#desc1').css("border", "");
                    $('#alph').html("");
                    $('#alta1').html("");
                    document.getElementById("register_alert7").style.display = "none";
                    var options = {
                        enableHighAccuracy: true,
                        maximumAge: 3600000
                    }
                    var locat = "";

                    var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

                    function onSuccess(position) {
                        var geocoder;
                        geocoder = new google.maps.Geocoder();
                        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                        geocoder.geocode({
                                'latLng': latlng
                            },
                            function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[0]) {
                                        var add = results[0].formatted_address;
                                        var value = add.split(",");

                                        count = value.length;
                                        country = value[count - 1];
                                        state = value[count - 2];
                                        city = value[count - 3];
                                        locat = city + "," + state;
                                        send();
                                    } else {
                                        alert("address not found");
                                    }
                                } else {
                                    alert("Geocoder failed due to: " + status);
                                }
                            }
                        );
                    };

                    function onError(error) {
                        alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
                    }

                    function dataUrlToBlob(dataurl) {
                        var arr = dataurl.split(",");
                        var mime = arr[0].match(/:(.*?);/)[1];
                        var bstr = atob(arr[1]);
                        var n = bstr.length;
                        var u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        return new Blob([u8arr], {type: mime});
                    }
                    function send() {
                        console.log(fileimg);
                        var pic = dataUrlToBlob(fileimg);
                        var type = "image";
                        type = type.split('/');
                        type = type[0];
                        var formData = new FormData();
                        formData.append("file", pic);
                        formData.append("nick", window.localStorage.getItem("nick").toLowerCase());
                        formData.append("id", window.localStorage.getItem("id"));
                        formData.append("type", type);
                        formData.append("tags", "");
                        formData.append("desc", document.getElementById("desc1").value);
                        formData.append("locat", locat);
                        $http({
                            method: "POST",
                            url: "http://192.168.0.116:8080/Instagram_server/upload",
                            data: formData,
                            headers: {
                                "Content-Type": undefined
                            }

                        }).success(function (data) {
                            $state.go('home.index');
                        });
                    }                                  
                }else{
                    aux23 = false;
                    $('#labelup1').removeClass("btn-danger");
                    $('#labelup1').addClass("btn-default");
                    $('#alph').html("");
                    document.getElementById("register_alert7").style.display = "none";
                }
            }else{
                if (aux23 == false) {
                    aux22=false;
                    $('#desc1').css("border", "");
                    $('#alta1').html("");
                    document.getElementById("register_alert7").style.display = "none";
                }else{
                    aux22=false;
                    aux23=false;
                }
            }   
    }
}]);

app.controller("UploadCtrl", ["$scope", "$http", "$sce", "$state",
    function ($scope, $http, $sce, $state) {
        
      
        var label = document.getElementById("labelup");
        var vid = document.getElementById("vid");
        var img = document.getElementById('img');
        label.style.display = "block";
        vid.style.display = "none";
        img.style.display = "none";
        var filebtn = document.getElementById("myFile");
        filebtn.addEventListener("change", capturePhoto);
        $scope.name = window.localStorage.getItem("nick").toLowerCase();
        
        $('#labelup').removeClass("btn-danger");
        $('#labelup').addClass("btn-default");
        $('#desc').css("border", "");
        $('#albr').html("");
        $('#alta').html("");
        document.getElementById("register_alert6").style.display = "none";

        var vacio = "",
            aux20 = false,
            aux21 = false;
        
        $.checkUp = function () {
            var arch = document.getElementById('myFile').value,
                texa = document.getElementById('desc').value;

            if (arch.trim() == vacio) {
                $('#labelup').removeClass("btn-default");
                $('#labelup').addClass("btn-danger");
                $('#albr').html("Enter a file...");
                aux20 = true;
            }

            if (texa.trim() == vacio) {
                $('#desc').css("border", "1px solid  #ff9900");
                $('#alta').html("Enter a description...");
                aux21 = true;
            }
        }


        function capturePhoto() {
            readURL(this);
        }

        function readURL(input) {
            if (input.files && input.files[0]) {
                var reader = new FileReader();
                var flag1 = false;
                reader.onload = function (e) {
                    var file = filebtn.files[0].type;
                    file = file.split("/");
                    file = file[0];
                    if (file == "image") {
                        label.style.display = "none";
                        img.style.display = "block";
                        $('#img').attr('src', e.target.result);
                        flag1 = true;
                    }
                    if (file == "audio") {
                        label.style.display = "none";
                        vid.style.display = "block";
                        $('#vid').attr('src', URL.createObjectURL(input.files[0]));
                         flag1 = true;
                    }
                    if (file == "video") {
                        label.style.display = "none";
                        vid.style.display = "block";
                        $('#vid').attr('src', URL.createObjectURL(input.files[0]));
                        flag1 = true;
                    }
                    if(flag1==false){
                        filebtn.value ="";
                    }
                }      
                             reader.readAsDataURL(input.files[0]);
                                   

            }
        }

        $scope.upload = function () {
            
            $.checkUp();
            
            if (aux20 == false) {
                if (aux21 == false) {
                    $('#labelup').removeClass("btn-danger");
                    $('#labelup').addClass("btn-default");
                    $('#desc').css("border", "");
                    $('#albr').html("");
                    $('#alta').html("");
                    document.getElementById("register_alert6").style.display = "none";
                    
                    var options = {
                        enableHighAccuracy: true,
                        maximumAge: 3600000
                    }
                    var locat = "";

                    var watchID = navigator.geolocation.getCurrentPosition(onSuccess, onError, options);

                    function onSuccess(position) {
                        var geocoder;
                        geocoder = new google.maps.Geocoder();
                        var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                        geocoder.geocode({
                                'latLng': latlng
                            },
                            function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    if (results[0]) {
                                        var add = results[0].formatted_address;
                                        var value = add.split(",");

                                        count = value.length;
                                        country = value[count - 1];
                                        state = value[count - 2];
                                        city = value[count - 3];
                                        locat = city + "," + state;
                                        send();
                                    } else {
                                        alert("address not found");
                                    }
                                } else {
                                    alert("Geocoder failed due to: " + status);
                                }
                            }
                        );
                    };

                    function onError(error) {
                        document.getElementById("register_alert6").style.display = "block";
                        document.getElementById("register_alert6").innerHTML = "Invalid file";
                        document.getElementById('myFile').value = "";
                        document.getElementById('desc').value = "";
                    }

                    function dataUrlToBlob(dataurl) {
                        var arr = dataurl.split(",");
                        var mime = arr[0].match(/:(.*?);/)[1];
                        var bstr = atob(arr[1]);
                        var n = bstr.length;
                        var u8arr = new Uint8Array(n);
                        while (n--) {
                            u8arr[n] = bstr.charCodeAt(n);
                        }
                        return new Blob([u8arr], {
                            type: mime
                        });
                    }

                    function send() {
                        var type = filebtn.files[0].type;
                        type = type.split('/');
                        type = type[0];
                        var formData = new FormData();
                        formData.append("file", filebtn.files[0]);
                        formData.append("nick", window.localStorage.getItem("nick").toLowerCase());
                        formData.append("id", window.localStorage.getItem("id"));
                        formData.append("type", type);
                        formData.append("tags", "");
                        formData.append("desc", document.getElementById("desc").value);
                        formData.append("locat", locat);
                        $http({
                            method: "POST",
                            url: "http://192.168.0.116:8080/Instagram_server/upload",
                            data: formData,
                            headers: {
                                "Content-Type": undefined
                            }

                        }).success(function (data) {
                            $state.go('home.index');
                        }).error(function(data){
                            document.getElementById("register_alert").style.display = "block";
                            document.getElementById("register_alert").innerHTML = "Invalid file";
                            document.getElementById('myFile').value = "";
                            document.getElementById('desc').value = "";
                        });
                    }                    
                }else{
                    aux21 = false;
                    $('#labelup').removeClass("btn-danger");
                    $('#labelup').addClass("btn-default");
                    $('#albr').html("");
                    document.getElementById("register_alert6").style.display = "none";
                }
            }else{
                if (aux21 == false) {
                    aux20=false;
                    $('#desc').css("border", "");
                    $('#alta').html("");
                    document.getElementById("register_alert6").style.display = "none";
                }else{
                    aux20=false;
                    aux21=false;
                }
            }   
    }
}]);
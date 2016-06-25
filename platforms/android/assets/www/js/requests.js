document.getElementById('reg_button').addEventListener('click', register);

function register() {

    $.ajax({
        url: "http://localhost:8080/Instagram_server/Signup",
        type: "POST",
        data: {
            firstName: document.getElementById('inputn').value, // input  firt name del modal2
            lastName: document.getElementById('inputln').value, // input last name del modal2
            nickname: document.getElementById('inputnn').value, // input  birthday del modal2
            email: document.getElementById('inpute').value, // input email del modal2
            pass: document.getElementById('inputp').value // input password del modal2
        },
        success: function (data) {
            data = JSON.parse(data);
            // Si no hay error
            if (!data.error) { // si el email no existe
                document.getElementById("register_alert1").style.display = "block";
                document.getElementById('inputn').value = "";
                document.getElementById('inputln').value = "";
                document.getElementById('inputnn').value = "";
                document.getElementById('inpute').value = "";
                document.getElementById('inputp').value = "";
            } else {
                var error = data.error;
                document.getElementById("register_alert2").style.display = "block";
                document.getElementById("register_alert2").innerHTML = error;
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

        }
    });
}
'use strict';
$(function () {
    // const submit = $('submit');
    const loginForm = $('#loginForm');
    loginForm.on( 'submit', function (event) {
        event.preventDefault();
        const ui_username = $('#username').val();
        const ui_password = $('#password').val();
        if(ui_username != "" || ui_username !== undefined || ui_username !== null) {
            const loginDetails = {
                ui_username,
                ui_password
            }
            $.ajax({
                url: '/distributor/login',
                type: 'POST',
                contentType: 'application/json',
                data : JSON.stringify(loginDetails),
                success : function (data, status, request) {
                    alert(data.data.description);
                    const token = 'x-id-token'
                    localStorage[token] = request.getResponseHeader('x-id-token');
                }, 
                error : function (e, ts, et) {
                        console.log("some error" + ts + et);
                        console.log(e);
                }
            });
        } else {
            alert("Missing Credentials");
        }
    });
});
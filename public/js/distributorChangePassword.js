$(function () {
    $('#ui_change_password').on('click', function (event) {
        event.preventDefault();
        const ui_current_password = $('#ui_current_password').val();
        const ui_new_password = $('#ui_new_password').val();
        const ui_re_new_password = $('#ui_re_new_password').val();
        if (ui_new_password !== ui_re_new_password) {
            ui_new_password.val('');
            ui_re_new_password.val('');
            return alert('Entered new passwords does not match');
        }

        const data = {
            ui_current_password: ui_current_password,
            ui_new_password: ui_new_password
        };

        $.ajax({
            type: "PUT",
            url: "/distributor/change/password",
            data: data,
            dataType: "json",
            success: function (response) {
                alert(response.data.description);
                window.location.replace('/');
            },
            error: function (error) {
                alert(error.responseJSON.message);
                if (error.status === 422) {
                    e.responseJSON.errors.forEach(function (err) {
                        console.log(err);
                        alert(err.message);
                        $('#' + err.field).val('');
                    });
                }
            }
        });

    })
});
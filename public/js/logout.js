$(function () {
    $('#logout').click(function (e) {
        e.preventDefault();
        $.ajax({
            type: "POST",
            url: "/logout",
            success: function (response) {
                console.log('hi');

                alert(response.data.description);
                window.location = '/';
            },
            error: function (e, ts, ed) {
                console.log(e, ts, ed);
            }
        });
    });
});
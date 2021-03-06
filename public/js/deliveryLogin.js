
$(function() {
    // const submit = $('submit');
    console.log('object');
    const loginForm = $('#loginForm');
    loginForm.on('submit', function(event) {
      event.preventDefault();
      const ui_username = $('#ui_username').val();
      const ui_password = $('#ui_password').val();
      if (
        ui_username != ''
        || ui_username !== undefined
        || ui_username !== null
        || ui_password != ''
        || ui_password !== undefined
        || ui_password !== null
      ) {
        const loginDetails = {
          ui_username : ui_username,
          ui_password : ui_password,
        };
        $.ajax({
          url: '/delivery/login',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(loginDetails),
          success: function(data, status, request) {
            if (typeof data === 'string') {
              window.location.replace('/');
            } else {
              // alert(data.data.description);
              const token = 'x-id-token';
              localStorage[token] = request.getResponseHeader('x-id-token');
              request.setRequestHeader(token, localStorage[token]);
              window.location.replace('/');
            }
          },
          error: function(e, ts, et) {
            alert(e.responseJSON.message);
            if (e.status === 422) {
              e.responseJSON.errors.forEach( function (err) {
                alert(err.message);
              });
            }
          },
        });
      } else {
        alert('Please enter a valid username and password');
      }
    });
  });
  
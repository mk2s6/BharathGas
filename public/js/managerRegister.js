$(function() {
  $('#register_so').on('click', (e) => {
    e.preventDefault();
    const ui_name = $('#ui_name').val();
    const ui_primary_mobile = $('#ui_primary_mobile').val();
    const ui_email = $('#ui_email').val();
    const ui_address = $('#ui_address').val();
    const ui_city = $('#ui_city').val();
    const ui_state = $('#ui_state').val();
    const ui_country = $('#ui_country').val();
    const ui_pincode = $('#ui_pincode').val();
    const ui_secondary_mobile = $('#ui_secondary_mobile').val();
    const data = {
      ui_name : ui_name,
      ui_primary_mobile : ui_primary_mobile,
      ui_email : ui_email,
      ui_address : ui_address,
      ui_city : ui_city,
      ui_state : ui_state,
      ui_country : ui_country,
      ui_pincode : ui_pincode,
      ui_secondary_mobile : ui_secondary_mobile,
    };
    console.log(data);
    $.ajax({
      type: 'POST',
      url: '/manager/add/new',
      data,
      dataType: 'json',
      success: function(response) {
        alert(response.data.description);
        window.location.replace('/');
      },
      error: function(e) {
        alert(e.responseJSON.message);
        if (e.status === 422) {
          e.responseJSON.errors.forEach((err) => {
            console.log(err);
            alert(err.message);
            $('#'+err.field).val('');
          });
        }
      },
    });
  });
});

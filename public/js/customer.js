$(() => {
  $('#registerCustomer').on('click', (e) => {
    e.preventDefault();
    const ui_business_name = $('#ui_business_name').val();
    const ui_proprietor_name = $('#ui_proprietor_name').val();
    const ui_mobile = $('#ui_mobile').val();
    const ui_email = $('#ui_email').val();
    const ui_omc = $('#ui_omc').val();
    const ui_address = $('#ui_address').val();
    const ui_city = $('#ui_city').val();
    const ui_state = $('#ui_state').val();
    const ui_country = $('#ui_country').val();
    const ui_feedback = $('#ui_feedback').val();
    const ui_pincode = $('#ui_pincode').val();
    const ui_secondary_mobile = $('#ui_secondary_mobile').val();

    // if (ui_business_name === '' || ui_business_name === undefined || ui_business_name === null) {
    //   alert('Business Name can not be null');
    // }
    // if (ui_business_name === '' || ui_business_name === undefined || ui_business_name === null) {
    //     alert('Business Name can not be null');
    //   }
    //   if (ui_business_name === '' || ui_business_name === undefined || ui_business_name === null) {
    //     alert('Business Name can not be null');
    //   }
    //   if (ui_business_name === '' || ui_business_name === undefined || ui_business_name === null) {
    //     alert('Business Name can not be null');
    //   }
    //   if (ui_business_name === '' || ui_business_name === undefined || ui_business_name === null) {
    //     alert('Business Name can not be null');
    //   }
    //   if (ui_business_name === '' || ui_business_name === undefined || ui_business_name === null) {
    //     alert('Business Name can not be null');
    //   }

    const data = {
      ui_business_name,
      ui_proprietor_name,
      ui_mobile,
      ui_email,
      ui_omc,
      ui_address,
      ui_city,
      ui_state,
      ui_country,
      ui_feedback,
      ui_pincode,
      ui_secondary_mobile,
    };
console.log(data);
    $.ajax({
      type: 'POST',
      url: '/customer/add/new',
      data,
      dataType: 'json',
      success(response) {
        alert(response.data.description);
        window.location = '/';
      },
      error(e) {
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
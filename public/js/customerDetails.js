$(() => {
  let custId;
  // console.log(window.location.search.substring(1));
  const queryParams = window.location.search.substring(1).split('&');
  $.each(queryParams, (i, param) => {
    const [paramName, value] = param.split('=');
    if (paramName === 'cust_id') {
      custId = value;
    }
  });

  function displayCustomer(customer) {
    //   const businessName = 
    $('#ui_business_name').html(customer.businessName);
    $('#ui_proprietor_name').html(customer.proprietorName);
    $('#ui_primary_mobile').html(customer.primaryMobile);
    $('#ui_email').html(customer.email);
    $('#ui_omc').html(customer.omc);
    $('#ui_address').html(customer.address);
    $('#ui_city').html(customer.city);
    $('#ui_state').html(customer.state);
    $('#ui_country').html(customer.country);
    $('#ui_feedback').html(customer.feedback);
    $('#ui_pincode').html(customer.pincode);
    $('#ui_secondary_mobile').html(customer.secondaryMobile);
    $('#ui_sales_officer').html(salesOfficer || null)
  }

  $(window).on('load', (e) => {
    e.preventDefault();
    $.ajax({
      type: 'GET',
      url: `/customer/details/${custId}`,
      success(response) {
        alert(response.data.description);
        displayCustomer(response.data.items[0]);
      },
      error(e) {
        alert(e.responseJSON.message);
        if (e.status === 422) {
          e.responseJSON.errors.forEach((err) => {
            console.log(err);
            alert(err.message);
            $(`#${err.field}`).val('');
          });
        }
      },
    });
  });
});

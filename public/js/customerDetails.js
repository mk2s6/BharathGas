$(function () {
  let custId;
  // console.log(window.location.search.substring(1));
  const queryParams = window.location.search.substring(1).split('&');
  $.each(queryParams, function (i, param)  {
    const params = param.split('=');
    // console.log(params);
    if (params[i] === 'cust_id') {
      custId = params[i+1];
    }
  });

  function displayCustomer(customer) {
    //   const businessName =
    // console.log(customer);
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
    $('#ui_added_by').html(customer.addedBy);
    $('#ui_demand').html(customer.demand);
    $('#ui_package').html(customer.package);
    $('#ui_discount').html(customer.discount);
    let mapLoc = "<iframe width='100%' height='600'  frameborder='0'\
    src='https://maps.google.com/maps?width=100%&amp;height=600&amp;hl=en&amp;q="+customer.latitude+","+customer.longitude+"&amp;ie=UTF8&amp;t=&amp;z=19&amp;iwloc=B&amp;output=embed'\
    scrolling='no' marginheight='0' marginwidth='0'><a\
      href='https://www.maps.ie/map-my-route/'>Map a route</a></iframe>\
    ";
    // console.log(mapLoc);
    $('#custLocation').html(mapLoc);
  }

  $(window).ready(function (e)  {
    $.ajax({
      type: 'GET',
      contentType: 'application/json',
      url: '/customer/details/'+custId,
      success: function(response) {
        if (response.data.items.length === 0) {
          alert('Customer does not exist.!');
          window.history.back();
        } else {
          alert(response.data.description);
          displayCustomer(response.data.items[0]);
        }
      },
      error: function(e) {
        alert(e.responseJSON.message);
        if (e.status === 422) {
          window.history.back();
          // e.responseJSON.errors.forEach( function (err)  {
          //   console.log(err);
          //   alert(err.message);
          //   $(`#${err.field}`).val('');
          // });
        }
      },
    });
  });
});

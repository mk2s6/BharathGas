$(() => {
  const customerTemplate = `
    <tr>
    <td>{{sNo}}</td>
    <td>{{businessName}}</td>
    <td>{{proprietorName}}</td>
    <td>{{omc}}</td>
    <td>
        <a class="ubtn-link ult-adjust-bottom-margin ubtn-left ubtn-normal" rel="" href="/customer/details?cust_id={{sNo}}">
            <center>
                <button type="button" id="ubtn-5241" class="ubtn ult-adjust-bottom-margin ult-responsive ubtn-normal ubtn-left-bg  none  ubtn-left   tooltip-5b7e3f547613a" data-hover="#ffffff" data-border-color="" data-bg="#22a6d6" data-hover-bg="#545454" data-border-hover="" data-shadow-hover="" data-shadow-click="none" data-shadow="" data-shd-shadow="" data-ultimate-target="#ubtn-5241" data-responsive-json-new="{" font-size':'','line-height':''}'="" style="padding:5px;font-weight:normal;border:none;background: #22a6d6;color: #ffffff;">
                    <span class="ubtn-hover" style="background-color:#545454"></span>
                    <span class="ubtn-data ubtn-text ">View profile</span>
                </button>
            </center>
        </a>
    </td>
</tr>
                        `;
  function display(customerList) {
    const customerContent = $('#customer_tbody');
    customerContent.html('');
    console.log(customerList);
    $.each(customerList, (i, customer) => {
    //   customer.i = i;
    // console.log(customerContent);
      customerContent.append(Mustache.render(customerTemplate, customer));
    });
    if (customerList.length === 0 && count >= 0) {
      alert('no previous customer registered');
    //   prev.click();
    }
    // if (customerList.length < 5) next.attr('disabled', 'true');
    // if (customerList.length >= 5) next.removeAttr('disabled', 'true');
  }

  $(window).on('load', () => {
    $.ajax({
      type: 'GET',
      async: false,
      url: '/customer/list/all',
      success(response) {
          console.log(response);
          if (response.data.items.length === 0) {
            alert('Customer does not exist please provide valid details');
            window.history.back();
          } else{
            alert(response.data.description);
            display(response.data.items);
          }
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

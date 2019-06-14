/**
 * This files has the function which are needed for notification system to work.
 */

// ===========================================================================
//  PRIVATE FUNCTIONS FOR ADDING NOTIFICATION
// ===========================================================================

async function addEmployeeNotification(conn, companyID, notiType, notiStatus, notiMessage, notiEmpID, notiLinkID) {
  const [rows] = await conn.query(
    `INSERT INTO employee_notification (noti_comp_id, noti_type, noti_status, noti_message, noti_emp_id,
        noti_link_id) 
    VALUES (?,?,?,?,?,?)`,
      [companyID, notiType, notiStatus, notiMessage, notiEmpID, notiLinkID],
  );
  return rows;
}

module.exports.addEmployeeNotification = addEmployeeNotification;

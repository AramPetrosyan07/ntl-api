export function checkRegisterSubOptions(body, userId, hash) {
  let info = {
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    userType:
      body.currentUserType === "customer"
        ? "subCustomer"
        : body.currentUserType === "carrier"
        ? "subCarrier"
        : "",
    parent: userId,
    passwordHash: hash,
  };

  if (body.phoneNumber) {
    info.phoneNumber = body.phoneNumber;
  }
  return info;
}

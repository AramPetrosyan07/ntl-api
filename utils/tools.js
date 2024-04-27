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
    currentUserType: body.currentUserType,
  };

  if (body.phoneNumber) {
    info.phoneNumber = body.phoneNumber;
  }
  return info;
}

export const perMonthDate = () => {
  // Get the current date
  let debtorDate = new Date();

  // Helper function to format date as "YYYY.MM.DD"
  function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
    let day = date.getDate().toString().padStart(2, "0");

    return `${year}.${month}.${day}`;
  }

  // Calculate dates and format them
  let dates = [
    formatDate(debtorDate), // Current date
    formatDate(new Date(debtorDate.getTime() - 10 * 24 * 60 * 60 * 1000)), // 10 days ago
    formatDate(new Date(debtorDate.getTime() - 20 * 24 * 60 * 60 * 1000)), // 20 days ago
    formatDate(new Date(debtorDate.getTime() - 30 * 24 * 60 * 60 * 1000)), // 30 days ago
  ];

  // Output dates to console
  return dates.reverse();
};

export const checkCountUsersByDate = (data, key) => {
  //   const data = [
  //     {
  //         "_id": "6627f3878dcf6915aabe36c2",
  //         "createdAt": "2024-04-26T17:44:39.748Z"
  //     },
  //     {
  //         "_id": "6628043868c396519a1751e8",
  //         "createdAt": "2024-04-23T18:55:52.428Z"
  //     }
  // ];
  const output = [];

  for (let date of perMonthDate()) {
    const targetDate = new Date(date);

    const count = data?.reduce((acc, entry) => {
      const createdAt = new Date(entry.createdAt);
      if (createdAt < targetDate) {
        acc++;
      }
      return acc;
    }, 0);
    output.push({ [key]: count });
  }

  return output;
};

export const loadPriceByDate = (data, key) => {
  const output = [];
  let dateArray = perMonthDate();
  for (let date of dateArray) {
    const targetDate = new Date(date);

    const count = data.reduce((acc, entry) => {
      const createdAt = new Date(entry.createdAt);
      if (createdAt < targetDate && createdAt > new Date(dateArray[0])) {
        acc += entry.rate;
      }
      return acc;
    }, 0);
    output.push({ [key]: count });
  }
  return output;
};

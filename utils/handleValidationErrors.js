import { validationResult } from "express-validator";

export default (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(404).json(errors.array());
  }
  next();
};

export function isValidPassword(password) {
  // Regular expression to match password requirements
  const regex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
  return regex.test(password);
}

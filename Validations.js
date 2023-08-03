import { body } from "express-validator";

export const loginValidation = [
  body("email", "Неверная форма почты").isEmail(),
  body("password", "Пароль должна быть минимум 5 слогов").isLength({ min: 8 }),
];

export const registerValidation = [
  body("email", "Неверная форма почты").isEmail(),
  body(
    "password",
    "Password must be at least 8 characters long, contain at least 1 uppercase letter"
  ).custom((value) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;
    return passwordRegex.test(value);
  }),
  body("firstName", "Укажите имя").isLength({ min: 3 }),
  body("lastName", "Укажите familya").isLength({ min: 3 }),
  body("userType", "yntreq type @").custom((value) => {
    return value === "customer" || value === "driver";
  }),
  body("companyName", "Укажите companyName").notEmpty(),
];

export const postCreateValidation = [
  body("title", "Виведите заголовок стстьи").isLength({ min: 3 }).isString(),
  body("text", "Виведите текст статьи").isLength({ min: 3 }).isString(),
  body("tags", "Неверный формат тегов").isLength({ min: 3 }),
  body("avatarUrl", "").optional().isString(),
];

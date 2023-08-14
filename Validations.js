import { body } from "express-validator";

export const loginValidation = [
  body("email", "Неверная форма почты").isEmail(),
  body(
    "password",
    "Пароль должна быть минимум 8 слогов, !@#$%^&*. символи и миимум 1 болшая буква"
  ).custom((value) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*.])(?=.{8,})/;
    return passwordRegex.test(value);
  }),
];

export const changePassValidation = [
  body("email", "Неверная форма почты").isEmail(),
  body(
    "password",
    "Пароль должна быть минимум 8 слогов, !@#$%^&*. символи и миимум 1 болшая буква"
  ).custom((value) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*.])(?=.{8,})/;
    return passwordRegex.test(value);
  }),
  body(
    "newPasswordOne",
    "Пароль должна быть минимум 8 слогов, !@#$%^&*. символи и миимум 1 болшая буква"
  ).custom((value) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*.])(?=.{8,})/;
    return passwordRegex.test(value);
  }),
  body(
    "newPasswordTwo",
    "Пароль должна быть минимум 8 слогов, !@#$%^&*. символи и миимум 1 болшая буква"
  ).custom((value) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*.])(?=.{8,})/;
    return passwordRegex.test(value);
  }),
];

export const registerValidation = [
  body("email", "Неверная форма почты").isEmail(),
  body(
    "password",
    "Пароль должна быть минимум 8 слогов, !@#$%^&*. символи и миимум 1 болшая буква"
  ).custom((value) => {
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*.])(?=.{8,})/;
    return passwordRegex.test(value);
  }),
  body("firstName", "Укажите имя").isLength({ min: 3 }),
  body("lastName", "Укажите familya").isLength({ min: 3 }),
  body("userType", "yntreq type @").custom((value) => {
    return value === "customer" || value === "carrier";
  }),
  body("companyName", "Укажите companyName").notEmpty(),
];

export const postCreateValidation = [
  body("title", "Виведите заголовок стстьи").isLength({ min: 3 }).isString(),
  body("text", "Виведите текст статьи").isLength({ min: 3 }).isString(),
  body("tags", "Неверный формат тегов").isLength({ min: 3 }),
  body("avatarUrl", "").optional().isString(),
];

export const sendValidation = [body("email", "Неверная форма почты").isEmail()];

import bcrypt from "bcrypt";

const password = "1234"; // la contraseña que quieres para el admin
const hash = bcrypt.hashSync(password, 10);

console.log("Hash generado:", hash);

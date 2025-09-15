import bcrypt from "bcrypt";

const password = "1234";
const hash = bcrypt.hashSync(password, 10);

console.log("Hash generado:", hash);

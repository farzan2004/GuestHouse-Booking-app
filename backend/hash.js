import bcrypt from "bcrypt";

const hashPassword = async () => {
  const plainPassword = "admin1234";
  const hashed = await bcrypt.hash(plainPassword, 10);
  console.log("Hashed password:", hashed);
};

hashPassword();
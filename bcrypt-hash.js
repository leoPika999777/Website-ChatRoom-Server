import bcrypt from "bcryptjs";


const hash = await bcrypt.hash(pw, 8);

console.log(hash);

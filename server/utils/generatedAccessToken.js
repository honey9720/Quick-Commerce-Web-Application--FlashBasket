import jwt from "jsonwebtoken";

const generatedAccessToken = async (userId) => {
  return jwt.sign(
    { id: userId }, // keep id consistent
    process.env.SECRET_KEY_ACCESS_TOKEN,
    { expiresIn: "5h" }
  );
};

export default generatedAccessToken;

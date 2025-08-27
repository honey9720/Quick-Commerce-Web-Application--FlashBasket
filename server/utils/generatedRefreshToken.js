import jwt from "jsonwebtoken";

const generatedRefreshToken = async (userId) => {
  return jwt.sign(
    { id: userId }, // keep id consistent with access token
    process.env.SECRET_KEY_REFRESH_TOKEN,
    { expiresIn: "7d" }
  );
};

export default generatedRefreshToken;

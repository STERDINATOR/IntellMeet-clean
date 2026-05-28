// middleware/auth.js - Example authentication middleware
// Implement your JWT verification logic here

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  // Verify token logic here
  next();
};

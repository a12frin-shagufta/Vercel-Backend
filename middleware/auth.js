import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
  // Check for token in Authorization header (Bearer token)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // Fallback to checking the token header directly
    const fallbackToken = req.headers.token;
    if (!fallbackToken) {
      return res.status(401).json({ 
        success: false, 
        message: "Authorization token required" 
      });
    }
    req.token = fallbackToken;
  } else {
    req.token = token;
  }

  try {
    const decoded = jwt.verify(req.token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    console.log('Authenticated user ID:', req.userId); // Debug log
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: "Session expired. Please login again." 
      });
    }
    return res.status(403).json({ 
      success: false, 
      message: "Invalid token. Please login again." 
    });
  }
};

export default authUser;


// import jwt from 'jsonwebtoken';

// const authUser = async (req, res, next) => {
//   const { token } = req.headers;

//   if (!token) {
//     return res.status(401).json({ success: false, message: "Not authorized. Please login again." });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.userId = decoded.id;
//     next();
//   } catch (error) {
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ success: false, message: "Session expired. Please login again." });
//     }
//     return res.status(403).json({ success: false, message: "Invalid token." });
//   }
// };

// export default authUser;


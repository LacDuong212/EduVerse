import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    }

    try {

        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!tokenDecoded) {
            return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
        }
        req.userId = tokenDecoded.id;
        next();

    } catch (error) {
        return res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
    }
}

export default userAuth;
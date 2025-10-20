import jwt from 'jsonwebtoken';

const userAuth = (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        return res.json({ success: false, message: "Unauthorized: No token provided" });
    }

    try {

        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
        
        if (tokenDecode.id) {
            req.userId = tokenDecode.id
        } else {
            return res.json({ success: false, message: "Unauthorized: Invalid token" });
        }

        next();

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export default userAuth;
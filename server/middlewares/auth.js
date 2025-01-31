import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    const {token} = req.headers;
    if(!token) {
        return res.status(401).json({success : false, message : "Unauthorized access"});
    }

    try {
        const tokeDecode = jwt.verify(token, process.env.JWT_SECRET);
        if(tokeDecode.id) {
            req.body.userId = tokeDecode.id;
        }
        else {
            return res.status(401).json({success : false, message : "Unauthorized access"});
        }
        next();
    } catch (error) {
        console.error("Error in verifying token", error);
        res.status(500).json({success : false, message : error.message});
    }
}

export default userAuth;
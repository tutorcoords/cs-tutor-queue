import { Router, Request, Response, NextFunction } from 'express';
import JWT, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { Tutor } from './database';
import { internalServerError, invalidCredentialsError, unauthorizedError } from './utils/errors';

dotenv.config();
const JWTKey = process.env.JWT_KEY || "secret";

const router = Router();

//reset password email config
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD
    }
});

//middleware
export const checkNotAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const header = req.get('Authorization');
    if (!header) {
        return next();
    }
    const token = header.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = JWT.verify(token, JWTKey) as JwtPayload;
    } catch (err) {
        return res.status(500).json(internalServerError);
    }
    if (!decodedToken) {
        return next();
    }
    return res.status(500).json({ msg: 'already logged in' });
}

export const checkAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const header = req.get('Authorization');
    if (!header) {
        return res.status(401).json(unauthorizedError);
    }
    const token = header.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = JWT.verify(token, JWTKey) as JwtPayload;
    } catch (err) {
        return res.status(500).json(internalServerError);
    }
    if (!decodedToken) {
        return res.status(401).json(unauthorizedError);
    }
    req.body.email = decodedToken.email;
    next();
}

//login route
router.post('/login', checkNotAuthenticated, (req, res) => {
    const { email, password } = req.body;
    Tutor.findOne({ email: { $eq: email } }).then((tutor) => {
        if (!tutor) {
            return res.status(400).json(invalidCredentialsError);
        }
        bcrypt.compare(password, tutor.hash as string, (err, result) => {
            if (err) {
                return res.status(500).json(internalServerError);
            }
            if (result) {
                const token = JWT.sign({
                    email
                }, JWTKey, { expiresIn: '30d' });
                return res.status(200).json({
                    name: tutor.name,
                    token
                });
            }
            return res.status(400).json(invalidCredentialsError);
        });
    }).catch((err) => {
        return res.status(500).json(internalServerError);
    });
});

//register route
router.post('/register', checkNotAuthenticated, (req, res) => {
    const { name, email, password } = req.body;
    Tutor.findOne({ email: { $eq: email } }).then((tutor) => {
        if (tutor) {
            return res.status(400).json({ msg: 'email already in use' });
        }
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json(internalServerError);
            }
            const newTutor = new Tutor({
                name,
                email,
                hash,
            });
            newTutor.save().then(() => {
                return res.status(200).json({ msg: 'successfully registered' });
            }).catch((err) => {
                return res.status(500).json(internalServerError);
            });
        });
    }).catch((err) => {
        return res.status(500).json(internalServerError);
    });
});

//create a reset password request route
router.post('/resetPassword', checkNotAuthenticated, async (req, res) => {
    const { email } = req.body;
    Tutor.findOne({ email: { $eq: email } }).then((tutor) => {
        if (!tutor) {
            return res.status(200).json({ msg: 'reset request placed successfully' });
        }
        const secret = JWTKey + tutor.id;
        const token = JWT.sign({
            email
        }, secret, { expiresIn: '20m' });
        const url = `${process.env.SERVER_URL}/resetPassword/${tutor.id}/${token}`;
        const mailOptions = {
            from: process.env.GMAIL_EMAIL,
            to: email,
            subject: 'Reset Tutor Queue Password',
            text: 'Click the following link to reset your password. This link will be valid for 20 minutes:\n\n' + url
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
        });
        return res.status(200).json({ msg: 'reset request placed successfully' });
    }
    ).catch((err) => {
        return res.status(500).json(internalServerError);
    });
});

//change password route
router.post('/resetPassword/:id/:token', checkNotAuthenticated, async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    Tutor.findById(id).then((tutor) => {
        if (!tutor) {
            return res.status(400).json(invalidCredentialsError);
        }
        const secret = JWTKey + tutor.id;
        try {
            JWT.verify(token, secret);
        } catch (err) {
            return res.status(400).json(invalidCredentialsError);
        }
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                return res.status(500).json(internalServerError);
            }
            tutor.hash = hash;
            tutor.save().then(() => {
                return res.status(200).json({ msg: 'password reset successfully' });
            }).catch((err) => {
                return res.status(500).json(internalServerError);
            });
        });
    }).catch((err) => {
        return res.status(500).json(internalServerError);
    });
}
);

//isAuthenticated route
router.get('/isAuthenticated', checkAuthenticated, (req, res) => {
    res.json({ email: req.body.email });
});

export default router;
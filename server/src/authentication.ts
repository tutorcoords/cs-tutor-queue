import { Router, Request, Response, NextFunction } from 'express';
import JWT, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { Tutor, Tutor_Request } from './database';
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

//middleware, works as named
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

export const checkCoordinator = (req: Request, res: Response, next: NextFunction) => {
    const token = req.get('Authorization')?.split(' ')[1];
    if (!token) {
        return res.status(401).json(unauthorizedError);
    }
    try {
        const decodedToken = JWT.verify(token, process.env.JWT_KEY || "secret") as JwtPayload;
        const email = decodedToken.email;
        Tutor.findOne({ email }).then((tutor) => {
            if (!tutor) {
                return res.status(500).json(internalServerError);
            }
            if (tutor.coordinator) {
                req.body.email = email;
                next();
            } else {
                return res.status(401).json(unauthorizedError);
            }
        }).catch((err) => {
            return res.status(500).json(internalServerError);
        });
    } catch (err) {
        return res.status(500).json(internalServerError);
    }
};

//login route
router.post('/login', checkNotAuthenticated, (req, res) => {
    const { email, password } = req.body;
    Tutor.findOne({ email: { $eq: email } }).then((tutor) => {
        if (!tutor) {
            return res.status(400).json(invalidCredentialsError);
        }

        if (!tutor.active) {
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
router.post('/register', (req, res) => {
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
                active: true,
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

        if (!tutor.active) {
            return res.status(400).json(invalidCredentialsError);
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
        if (!tutor.active) {
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

//set inactive route
router.post('/setInactive', checkAuthenticated, checkCoordinator, (req, res) => {
    Tutor.findOne({ email: { $eq: req.body.email } }).then((tutor) => {
        if (!tutor) {
            return res.status(500).json(internalServerError);
        }
        if (tutor._currentRequest) {
            Tutor_Request.findOne({ _id: { $eq: tutor._currentRequest } }).then((request) => {
                if (!request) {
                    return res.status(500).json(internalServerError);
                }
                if (request.status === 'IN PROGRESS' || request.status === 'COMMENTING') {
                    request.status = 'COMPLETED';
                    if (request.status === 'IN PROGRESS') {
                        request.completed = new Date();
                    }
                    request.category = 'OTHER';
                    request.comment = 'N/A';
                    request.save().then(() => {
                        tutor.active = false;
                        tutor._currentRequest = null;
                        tutor.save().then(() => {
                            return res.status(200).json({ msg: 'successfully set inactive' });
                        }).catch((err) => {
                            return res.status(500).json(internalServerError);
                        });
                    }).catch((err) => {
                        return res.status(500).json(internalServerError);
                    });
                }
                else {
                    tutor.active = false;
                    tutor._currentRequest = null;
                    tutor.save().then(() => {
                        return res.status(200).json({ msg: 'successfully set inactive' });
                    }).catch((err) => {
                        return res.status(500).json(internalServerError);
                    });
                }
            }).catch((err) => {
                return res.status(500).json(internalServerError);
            });
        } else {
            tutor.active = false;
            tutor.save().then(() => {
                return res.status(200).json({ msg: 'successfully set inactive' });
            }).catch((err) => {
                return res.status(500).json(internalServerError);
            });
        }
    }).catch((err) => {
        return res.status(500).json(internalServerError);
    });
});

//set active route
router.post('/setActive', checkAuthenticated, checkCoordinator, (req, res) => {
    Tutor.findOne({ email: { $eq: req.body.email } }).then((tutor) => {
        if (!tutor) {
            return res.status(500).json(internalServerError);
        }
        tutor.active = true;
        tutor.save().then(() => {
            return res.status(200).json({ msg: 'successfully set active' });
        }).catch((err) => {
            return res.status(500).json(internalServerError);
        });
    }).catch((err) => {
        return res.status(500).json(internalServerError);
    });
});

//set coordinator route
router.post('/setCoordinator', checkAuthenticated, checkCoordinator, (req, res) => {
    const { email } = req.body;
    Tutor.findOne({ email: { $eq: email } }).then((tutor) => {
        if (!tutor) {
            return res.status(400).json(invalidCredentialsError);
        }
        tutor.coordinator = true;
        tutor.save().then(() => {
            return res.status(200).json({ msg: 'successfully set coordinator' });
        }).catch((err) => {
            return res.status(500).json(internalServerError);
        });
    }).catch((err) => {
        return res.status(500).json(internalServerError);
    });
});

//unset coordinator route
router.post('/unsetCoordinator', checkAuthenticated, checkCoordinator, (req, res) => {
    const { email } = req.body;
    Tutor.findOne({ email: { $eq: email } }).then((tutor) => {
        if (!tutor) {
            return res.status(400).json(invalidCredentialsError);
        }
        tutor.coordinator = false;
        tutor.save().then(() => {
            return res.status(200).json({ msg: 'successfully unset coordinator' });
        }).catch((err) => {
            return res.status(500).json(internalServerError);
        });
    }).catch((err) => {
        return res.status(500).json(internalServerError);
    });
});

//isAuthenticated route
router.get('/isAuthenticated', checkAuthenticated, (req, res) => {
    res.json({ email: req.body.email });
});

//isCoordinator route
router.get('/isCoordinator', checkAuthenticated, checkCoordinator, (req, res) => {
    res.json({ email: req.body.email });
});

export default router;
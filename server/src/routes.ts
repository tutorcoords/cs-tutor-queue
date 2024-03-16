import { Router, Request, Response } from 'express';
import { Tutor, Course, Tutor_Request } from './database';
import { checkAuthenticated } from './authentication';
import { internalServerError } from './utils/errors';

const router = Router();

//returns courses for request page
router.get('/courses', (req: Request, res: Response) => {
    Course.find({})
        .sort({ code: 1 })
        .then((courses) => {
            res.status(200).send(courses);
        })
        .catch((err) => {
            res.status(500).send(internalServerError);
        });
});

//returns recent requests for queue page
router.get('/requests', checkAuthenticated, (req: Request, res: Response) => {
    Tutor_Request.find({})
        .sort({ submitted: -1 })
        .limit(10)
        .then((requests) => {
            res.status(200).send(requests);
        })
        .catch((err) => {
            res.status(500).send(internalServerError);
        });
});

//returns queue for queue page
router.get('/queue', checkAuthenticated, (req: Request, res: Response) => {
    Tutor_Request.find({ status: 'WAITING' })
        .sort({ submitted: 1 })
        .then((requests) => {
            res.status(200).send(requests);
        })
        .catch((err) => {
            res.status(500).send(internalServerError);
        });
});

//returns a tutors current request
router.get('/helping', checkAuthenticated, (req: Request, res: Response) => {
    Tutor.findOne({ email: req.body.email })
        .populate('_currentRequest')
        .then((tutor) => {
            if (!tutor) {
                return res.status(500).send(internalServerError);
            }
            if (!tutor._currentRequest) {
                return res.status(200).send({ msg: 'not helping anyone' });
            }
            return res.status(200).send(tutor._currentRequest);
        })
        .catch((err) => {
            return res.status(500).send(internalServerError);
        });
});

//creates a new request
router.post('/request', async (req: Request, res: Response) => {
    const { name, email, course, professor, description } = req.body;
    const [code] = course.split(' - ');

    Course.findOne({ code })
        .then((course) => {
            const request = new Tutor_Request({
                submitted: new Date(),
                acquired: null,
                completed: null,
                name: name,
                email: email,
                _course: course,
                professor: professor,
                description: description,
                status: 'WAITING',
                _tutor: null,
            });
            request.save()
                .then(() => {
                    return res.status(200).send({ msg: 'request received' });
                })
                .catch((err) => {
                    return res.status(500).send(internalServerError);
                });
        })
        .catch((err) => {
            return res.status(500).send(internalServerError);
        });
});

//lets a tutor help a request
router.post('/help', checkAuthenticated, (req: Request, res: Response) => {
    Tutor.findOne({ email: req.body.email })
        .then((tutor) => {
            if (!tutor) {
                return res.status(500).send(internalServerError);
            }
            if (tutor._currentRequest) {
                return res.status(400).send({ msg: 'already helping someone' });
            }
            Tutor_Request.findOne({ _id: req.body.requestId })
                .then((request) => {
                    if (!request) {
                        return res.status(500).send(internalServerError);
                    }
                    if (request.status === 'WAITING' && request._tutor === null) {
                        request.status = 'IN PROGRESS';
                        request._tutor = tutor;
                        request.acquired = new Date();
                        tutor._currentRequest = request._id;
                        request.save()
                            .then(() => {
                                tutor.save()
                                    .then(() => {
                                        return res.status(200).send({ msg: 'request has successfully been picked up' });
                                    })
                                    .catch((err) => {
                                        return res.status(500).send(internalServerError);
                                    });
                            })
                            .catch((err) => {
                                return res.status(500).send(internalServerError);
                            });
                    }
                    else {
                        return res.status(500).send(internalServerError);
                    }
                })
                .catch((err) => {
                    return res.status(500).send(internalServerError);
                });
        });
});

//lets a tutor complete a request
router.post('/complete', checkAuthenticated, (req: Request, res: Response) => {
    Tutor.findOne({ email: req.body.email })
        .then((tutor) => {
            if (!tutor) {
                return res.status(500).send(internalServerError);
            }
            if (!tutor._currentRequest) {
                return res.status(500).send(internalServerError);
            }
            Tutor_Request.findOne({ _id: req.body.requestId })
                .then((request) => {
                    if (!request) {
                        return res.status(400).send(internalServerError);
                    }
                    if (request.status === 'IN PROGRESS') {
                        request.status = 'COMMENTING';
                        request.completed = new Date();
                        request.save()
                            .then(() => {
                                tutor.save()
                                    .then(() => {
                                        return res.status(200).send({ msg: 'request is ready for commenting' });
                                    })
                                    .catch((err) => {
                                        return res.status(500).send(internalServerError);
                                    });
                            })
                            .catch((err) => {
                                return res.status(500).send(internalServerError);
                            });
                    }
                    else {
                        return res.status(500).send(internalServerError);
                    }
                })
                .catch((err) => {
                    return res.status(500).send(internalServerError);
                });
        });
});

//lets tutor comment on a request
router.post('/comment', checkAuthenticated, (req: Request, res: Response) => {
    Tutor.findOne({ email: req.body.email })
        .then((tutor) => {
            if (!tutor) {
                return res.status(500).send(internalServerError);
            }
            if (!tutor._currentRequest) {
                return res.status(500).send(internalServerError);
            }
            Tutor_Request.findOne({ _id: req.body.requestId })
                .then((request) => {
                    if (!request) {
                        return res.status(400).send(internalServerError);
                    }
                    if (request.status === 'COMMENTING') {
                        request.status = 'COMPLETED';
                        request.comment = req.body.comment;
                        request.category = req.body.category;
                        request.save()
                            .then(() => {
                                tutor._currentRequest = null;
                                tutor.save()
                                    .then(() => {
                                        return res.status(200).send({ msg: 'request has successfully been completed' });
                                    })
                                    .catch((err) => {
                                        return res.status(500).send(internalServerError);
                                    });
                            })
                            .catch((err) => {
                                return res.status(500).send(internalServerError);
                            });
                    }
                    else {
                        return res.status(500).send(internalServerError);
                    }
                })
                .catch((err) => {
                    return res.status(500).send(internalServerError);
                });
        });
});

export default router;
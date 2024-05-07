import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const dbUrl = process.env.DATABASE_URL || "";
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
    name: String, // tutor's name
    email: String, // tutor's email
    hash: String,  // tutor's hashed password
    active: { type: Boolean, default: true }, // tutor's active status. true if current tutor. login only possible if true
    coordinator: { type: Boolean, default: false }, // tutor's coordinator status. true if tutor is coordinator
    _currentRequest: { type: Schema.Types.ObjectId, ref: 'Tutor_Request' }, // current request being worked on by tutor
});

const Tutor = mongoose.model("Tutor", tutorSchema);

const courseSchema = new Schema({
    name: String, // course name
    professor: String, // professor's name
    code: String, // course code
    active: { type: Boolean, default: true }, // course's active status. true if current course
});

const Course = mongoose.model("Course", courseSchema);

const tutorRequestSchema = new Schema({
    submitted: Date, // date request was submitted
    acquired: Date, // date request was acquired by tutor
    completed: Date, // date request was completed
    name: String, // student's name
    email: String, // student's email
    _course: courseSchema, // course
    description: String, // description of request
    status: String, // status of request. WAITING, IN PROGRESS, COMMENTING, or COMPLETED
    _tutor: { type: tutorSchema, default: null }, // tutor working on request
    comment: String, // tutor's comment on request
    category: String, // category of request
});

const Tutor_Request = mongoose.model("Tutor_Request", tutorRequestSchema);

mongoose.connect(dbUrl, { dbName: 'tutor_queue' })
    .then(() => console.log("connected to MongoDB"))
    .catch((err) => console.error('failed to connect to MongoDB', err));

export { Tutor, Course, Tutor_Request };
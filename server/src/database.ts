import mongoose from 'mongoose';

const dbUrl = process.env.DATABASE_URL || "";
const Schema = mongoose.Schema;

const tutorSchema = new Schema({
    name: String,
    email: String,
    hash: String,
    _currentRequest: { type: Schema.Types.ObjectId, ref: 'Tutor_Request' },
});

const Tutor = mongoose.model("Tutor", tutorSchema);

const courseSchema = new Schema({
    name: String,
    code: String,
});

const Course = mongoose.model("Course", courseSchema);

const tutorRequestSchema = new Schema({
    submitted: Date,
    acquired: Date,
    completed: Date,
    name: String,
    email: String,
    _course: courseSchema,
    description: String,
    status: String,
    _tutor: { type: tutorSchema, default: null },
    comment: String,
    category: String,
});

const Tutor_Request = mongoose.model("Tutor_Request", tutorRequestSchema);

mongoose.connect(dbUrl, { dbName: 'tutor_queue' })
    .then(() => console.log("connected to MongoDB"))
    .catch((err) => console.error('failed to connect to MongoDB', err));

export { Tutor, Course, Tutor_Request };
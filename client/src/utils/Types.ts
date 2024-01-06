//type definitions for the data that is returned from the API calls
export type Course = {
    _id: string;
    code: string;
    name: string;
}

export type Tutor = {
    _id: string;
    name: string;
}

export type Request = {
    _id: string;
    submitted: Date;
    acquired: Date;
    completed: Date;
    name: string;
    email: string;
    _course: Course;
    description: string;
    status: string;
    _tutor: Tutor;
}
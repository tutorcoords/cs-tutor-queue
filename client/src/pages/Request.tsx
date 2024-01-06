import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { Course } from '../utils/Types';

export default function Request() {
    //creates states for the form data, courses, page loading, submitting, form validation, and alerts
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        course: '',
        description: '',
    });
    const [courses, setCourses] = useState<string[]>([]);
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [formValid, setFormValid] = useState<boolean>(true);
    const [successAlert, setSuccessAlert] = useState<boolean>(false);
    const [errorAlert, setErrorAlert] = useState<boolean>(false);

    //sets the page title
    useEffect(() => {
        document.title = "Request Help | Tutor Center"
    }, []);

    //populates courses dropdown from api call on page load
    useEffect(() => {
        const getCourses = async () => {
            try {
                const res = await api.get<Course[]>('/courses');
                const formattedCourses = res.data.map(course => `${course.code} - ${course.name}`);
                setCourses(formattedCourses);
                setPageLoading(false);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        getCourses();
    }, []);

    //handles form data change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    //handles form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;

        // Remove any existing alerts
        setSuccessAlert(false);
        setErrorAlert(false);

        //checks if form is valid
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setFormValid(false);
        } else {
            setFormValid(true);
            setSubmitting(true);

            //api request to submit request
            try {
                await api.post('/request', formData);
                setSuccessAlert(true);
                setFormData({
                    name: '',
                    email: '',
                    course: '',
                    description: '',
                });
                setTimeout(() => {
                    setSuccessAlert(false);
                }, 5000);
            } catch (error) {
                console.error('Error submitting request:', error);
                setErrorAlert(true);
            } finally {
                setSubmitting(false);
            }
            form.classList.remove('was-validated');
        }
    };

    return (
        <>
            {pageLoading ? (
                <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
                    <h3 style={{ marginTop: 0 }}>Loading...</h3>
                    <div className="d-flex justify-content-center">
                        <div className="spinner-border" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
                    {/*success alert*/}
                    {successAlert && (
                        <div className="alert alert-success alert-dismissible fade show" role="alert">
                            <strong>Success</strong> Your request has been successfully added to the queue.
                            <button
                                type="button"
                                className="close"
                                data-dismiss="alert"
                                aria-label="Close"
                                onClick={() => setSuccessAlert(false)}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}
                    {/*error alert*/}
                    {errorAlert && (
                        <div className="alert alert-danger alert-dismissible fade show" role="alert">
                            <strong>Error</strong> There was an error submitting your request. Please try again later.
                            <button
                                type="button"
                                className="close"
                                data-dismiss="alert"
                                aria-label="Close"
                                onClick={() => setErrorAlert(false)}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                    )}
                    <h3 style={{ marginTop: 0 }}>Request Help</h3>
                    <h4 style={{ marginTop: 0 }}>
                        Please enter your information, and then take a seat, someone will help you momentarily.
                    </h4>
                    <form className={`needs-validation ${formValid === false ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
                        <div className="form-group">
                            <label htmlFor="inputName">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                id="inputName"
                                name="name"
                                placeholder="Enter Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                autoComplete='name'
                            />
                            <div className="invalid-feedback">Please provide a valid name.</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="inputEmail">Email address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="inputEmail"
                                name="email"
                                aria-describedby="emailsub"
                                placeholder="Enter Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                autoComplete='email'
                            />
                            <small id="emailsub" className="form-text text-muted">Your email will only be used for tutoring purposes. </small>
                            <div className="invalid-feedback">Please provide a valid email.</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="selectCourse">What course do you want tutoring for?</label>
                            <select
                                className="form-control"
                                id="selectCourse"
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                            >
                                <option value="" disabled>
                                    Choose a course
                                </option>
                                {courses.map(course => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                            <div className="invalid-feedback">Please choose a course.</div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="inputDescription">Description</label>
                            <textarea
                                className="form-control"
                                id="inputDescription"
                                name="description"
                                placeholder="Enter Description"
                                rows={3}
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                            <div className="invalid-feedback">Please provide a valid description.</div>
                        </div>
                        {submitting ? (<button className="btn btn-blue" type="button" style={{ marginBottom: 25 }} disabled>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            &nbsp;&nbsp;Loading...
                        </button>) : <button type="submit" className="btn btn-blue" style={{ marginBottom: 25 }}>
                            Submit
                        </button>}
                    </form>
                </div>
            )}
        </>
    );
}
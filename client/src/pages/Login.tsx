import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import api from '../api/api';

export default function Login() {
    const navigate = useNavigate();

    //creates states for the form data, form validation, and submitting
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [formValid, setFormValid] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errorAlert, setErrorAlert] = useState<boolean>(false);
    const [invalidAlert, setInvalidAlert] = useState<boolean>(false);

    //sets the page title
    useEffect(() => {
        document.title = "Login | Tutor Center"
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

        //remove any existing alerts
        setErrorAlert(false);
        setInvalidAlert(false);

        //checks if form is valid
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setFormValid(false);
        } else {
            setFormValid(true);
            setSubmitting(true);

            formData.email = formData.email.trim();
            formData.password = formData.password.trim();

            //api request to login and set cookies
            try {
                const response = await api.post('/login', formData);
                const { token, name } = response.data;
                Cookies.set('token', token, { expires: 30, secure: true, sameSite: 'None' });
                Cookies.set('name', name, { expires: 30, secure: true, sameSite: 'None' });
                navigate('/dashboard');
            } catch (error) {
                if (axios.isAxiosError(error) && error.response && error.response.status === 400) {
                    setInvalidAlert(true);
                }
                else {
                    console.error('Error submitting request:', error);
                    setErrorAlert(true);
                }
            } finally {
                setSubmitting(false);
            }
        }
        form.classList.add('was-validated');
    };

    return (
        <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
            {/*invalid alert*/}
            {invalidAlert && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Invalid Credentials</strong> The email and/or password you entered is incorrect.
                    <button
                        type="button"
                        className="close"
                        data-dismiss="alert"
                        aria-label="Close"
                        onClick={() => setInvalidAlert(false)}
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            )}
            {/*error alert*/}
            {errorAlert && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <strong>Error</strong> There was an error submitting your login request. Please try again later.
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
            <h3 style={{ marginTop: 0 }}>Login</h3>
            <form className={`needs-validation ${formValid === false ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="inputEmail">Email address</label>
                    <input
                        type="email"
                        className="form-control"
                        id="inputEmail"
                        name="email"
                        placeholder="Enter Email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />
                    <div className="invalid-feedback">Please provide a valid email.</div>
                </div>
                <div className="form-group">
                    <label htmlFor="inputPassword">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="inputPassword"
                        name="password"
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />
                    <div className="invalid-feedback">Please provide a valid password.</div>
                </div>
                {submitting ? (<button className="btn btn-blue" type="button" style={{ marginBottom: 16 }} disabled>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    &nbsp;&nbsp;Loading...
                </button>) : <button type="submit" className="btn btn-blue" style={{ marginBottom: 16 }}>
                    Login
                </button>}
                <Link to="/resetpassword" style={{ display: "block", marginBottom: 25 }}>Reset password</Link>
            </form>
        </div>
    );
}
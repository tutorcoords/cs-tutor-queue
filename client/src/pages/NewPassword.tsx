import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/api';

export default function NewPassword() {
    //gets the token and id from the url
    const { token, id } = useParams();

    //creates states for the form data, form validation, and submitting
    const [formData, setFormData] = useState({
        password: '',
    });
    const [formValid, setFormValid] = useState<boolean>(true);
    const [errorAlert, setErrorAlert] = useState<boolean>(false);
    const [successAlert, setSuccessAlert] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);

    //sets the page title
    useEffect(() => {
        document.title = "Reset Password | Tutor Center"
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
        setSuccessAlert(false);

        //checks if form is valid
        if (form.checkValidity() === false) {
            event.stopPropagation();
            setFormValid(false);
        } else {
            setFormValid(true);
            setSubmitting(true);

            //api request to reset password
            try {
                await api.post(`/resetPassword/${id}/${token}`, formData);
                setSuccessAlert(true);
                setFormData({
                    password: '',
                });
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
        <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
            {/*success alert*/}
            {successAlert && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Success</strong> Your password has been reset. You may now log in with your new password.
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
                    <strong>Error</strong> There was an error submitting your reset request. Please try again later.
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
            <h3 style={{ margin: "0 0 10px 0" }}>Reset Password</h3>
            <form className={`needs-validation ${formValid === false ? 'was-validated' : ''}`} onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                    <label htmlFor="inputEmail">New Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="inputPassword"
                        name="password"
                        placeholder="Enter New Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete='new-password'
                        required
                    />
                </div>
                {submitting ? (<button className="btn btn-blue" type="button" style={{ marginBottom: 16 }} disabled>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    &nbsp;&nbsp;Loading...
                </button>) : <button type="submit" className="btn btn-blue" style={{ marginBottom: 16 }}>
                    Submit
                </button>}
            </form>
        </div>
    );
}
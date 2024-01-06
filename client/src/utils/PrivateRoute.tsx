import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/api';

//type definition for the props
type ProtectedRouteProps = {
    children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    //creates state for the authentication status
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    //checks if the user is authenticated
    useEffect(() => {
        const checkAuthStatus = async () => {
            //api request to check if the user is authenticated
            try {
                api.get('/isAuthenticated')
                    .then(() => {
                        setIsAuthenticated(true);
                    })
                    .catch((err) => {
                        console.error('Error checking auth status:', err);
                        setIsAuthenticated(false);
                    });
            } catch (err) {
                console.error('Error checking auth status:', err);
                setIsAuthenticated(false);
            }
        };
        checkAuthStatus();
    }, []);

    //if authentication status is null (loading), show loading screen
    if (isAuthenticated === null) {
        return <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
            <h3 style={{ marginTop: 0 }}>Loading...</h3>
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        </div>;
    }

    //if the user is not authenticated, redirect to the login page
    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    //if the user is authenticated, show the page
    return children;
};

export default ProtectedRoute;

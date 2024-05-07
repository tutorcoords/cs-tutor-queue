import React, { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/api';

//type definition for the props
type CoordinatorRouteProps = {
    children: ReactNode;
}

export const CoordinatorRoute: React.FC<CoordinatorRouteProps> = ({ children }) => {
    //creates state for the coordinator status
    const [isCoordinator, setIsCoordinator] = useState<boolean | null>(null);

    //checks if the user is coordinator
    useEffect(() => {
        const checkAuthStatus = async () => {
            //api request to check if the user is coordinator
            try {
                api.get('/isCoordinator')
                    .then(() => {
                        setIsCoordinator(true);
                    })
                    .catch((err) => {
                        console.error('Error checking coordinator status:', err);
                        setIsCoordinator(false);
                    });
            } catch (err) {
                console.error('Error checking coordinator status:', err);
                setIsCoordinator(false);
            }
        };
        checkAuthStatus();
    }, []);

    //if authentication status is null (loading), show loading screen
    if (isCoordinator === null) {
        return <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
            <h3 style={{ marginTop: 0 }}>Loading...</h3>
            <div className="d-flex justify-content-center">
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        </div>;
    }

    //if the user is not coordinator, redirect to the profile
    if (!isCoordinator) {
        return <Navigate to="/profile" />;
    }

    //if the user is authenticated, show the page
    return children;
};

export default CoordinatorRoute;

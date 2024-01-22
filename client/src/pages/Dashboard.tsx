import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import api from '../api/api';
import { Request } from '../utils/Types';

export default function Dashboard() {
    const navigate = useNavigate();

    //creates states for the requests, queue, and helping components
    const [requests, setRequests] = useState<Request[]>([]);
    const [queue, setQueue] = useState<Request[]>([]);
    const [helping, setHelping] = useState<Request>();
    const [commenting, setCommenting] = useState<Request>();
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [queueLoading, setQueueLoading] = useState(false);
    const [formData, setFormData] = useState({
        category: '',
        comment: ''
    });

    //handles comment form data change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    //sets the page title
    useEffect(() => {
        if (queue.length > 0) {
            document.title = `(${queue.length}) in Queue`
        } else {
            document.title = "Dashboard | Tutor Center"
        }
    }, [queue])

    //api request to get the helping data
    const getHelping = async () => {
        try {
            const res = await api.get('/helping');
            if (res.data.msg != 'not helping anyone') {
                if (res.data.status === 'IN PROGRESS') {
                    setCommenting(undefined);
                    setHelping(res.data);
                } else if (res.data.status === 'COMMENTING') {
                    setHelping(undefined);
                    setCommenting(res.data);
                }
            } else {
                setHelping(undefined);
                setCommenting(undefined);
            }
        } catch (error) {
            console.error('Error fetching helping:', error);
        }
    };

    //api request to get the requests data
    const getRequests = async () => {
        setRequestsLoading(true);
        try {
            const res = await api.get('/requests');
            setRequests(res.data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setRequestsLoading(false);
        }
    };

    //api request to get the queue data
    const getQueue = async () => {
        setQueueLoading(true);
        try {
            const res = await api.get('/queue');
            setQueue(res.data);
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setQueueLoading(false);
        }
    }

    //checks the data every 10 seconds
    useEffect(() => {
        getRequests();
        getQueue();
        getHelping();
        const queueInterval = setInterval(getQueue, 10000);
        const requestsInterval = setInterval(getRequests, 10000);
        const helpingInterval = setInterval(getHelping, 10000);
        return () => {
            clearInterval(queueInterval);
            clearInterval(requestsInterval);
            clearInterval(helpingInterval);
        }
    }, []);

    //helps a request
    const helpRequest = async (requestId: string) => {
        const payload = {
            requestId: requestId
        }
        try {
            await api.post('/help', payload);
            getQueue();
            getRequests();
            getHelping();
        } catch (error) {
            console.error('Error helping request:', error);
        }
    }

    //completes a request
    const completeRequest = async (requestId: string) => {
        const payload = {
            requestId: requestId
        }
        try {
            await api.post('/complete', payload);
            getHelping();
        } catch (error) {
            console.error('Error completing request:', error);
        }
    }

    const commentRequest = async (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;

        //checks if form is valid
        if (form.checkValidity() === false) {
            event.stopPropagation();
        } else {
            const payload = {
                requestId: commenting?._id,
                category: formData.category,
                comment: formData.comment
            }
            //api request to comment on a request
            try {
                await api.post('/comment', payload);
                getHelping();
                getRequests();
            } catch (error) {
                console.error('Error commenting request:', error);
            }
        }
    }

    //converts date to string for display
    const convertDateToString = (date: Date) => {
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const year = date.getFullYear();
        const fullHour = date.getHours();
        const hour = fullHour > 12 ? fullHour - 12 : fullHour;
        const minute = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
        const ampm = fullHour > 12 ? "pm" : "am";
        return `${month}-${day}-${year} ${hour}:${minute}${ampm}`;
    };

    return (<div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
        {/*displays if currently commenting*/}
        {
            commenting ? (
                <>
                    <h3 style={{ margin: "0 0 10px 0" }}>Current Request</h3>
                    <div className="d-flex justify-content-center">
                        <div className="card col-lg-6 col-12 p-2" style={{ borderRadius: "10px", margin: "15px 0 25px 0" }}>
                            <div className="card-body">
                                <form onSubmit={commentRequest}>
                                    <div className="form-group">
                                        <label htmlFor="selectCategory">Category</label>
                                        <select
                                            className="form-control"
                                            id="selectCategory"
                                            name="category"
                                            required
                                            onChange={handleChange}
                                            value={formData.category}
                                        >
                                            <option value="Conceptual Help">
                                                Conceptual Help
                                            </option>
                                            <option value="Debugging">
                                                Debugging
                                            </option>
                                            <option value="Homework Help">
                                                Homework Help
                                            </option>
                                            <option value="Review/Practice">
                                                Review/Practice
                                            </option>
                                            <option value="Other">
                                                Other
                                            </option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="comment">Comment</label>
                                        <textarea className="form-control" id="comment" name="comment" rows={3} onChange={handleChange} value={formData.comment} required></textarea>
                                    </div>
                                    <button className="btn btn-primary" type="submit">Submit</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </>) : ""}
        {/*displays if currently helping someone*/}
        {
            helping ? (
                <>
                    <h3 style={{ margin: "0 0 10px 0" }}>Current Request</h3>
                    <div className="d-flex justify-content-center">
                        <div className="card col-lg-6 col-12 p-2" style={{ borderRadius: "10px", margin: "15px 0 25px 0" }}>
                            <div className="card-body">
                                <h5 className="card-title">{helping ? helping.name : "No Current Request"}</h5>
                                <h6 className="card-subtitle mb-2 text-muted">{helping ? helping._course.code : ""}</h6>
                                <p className="card-text">{helping ? helping.description : ""}</p>
                                <button className="btn btn-primary" onClick={() => completeRequest(helping._id)}>Complete</button>
                            </div>
                        </div>
                    </div>
                </>) : ""
        }
        {/*displays queue*/}
        <h3 style={{ margin: "0 0 10px 0" }}>Queue</h3>
        <p>This queue shows all students currently waiting to be met with.</p>
        <table className="table table-striped table-responsive">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th className="w-100">Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {queueLoading ? (
                    <tr>
                        <td colSpan={7}>
                            <div className="d-flex justify-content-center align-items-center">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                ) : queue.length === 0 ? (
                    <tr>
                        <td colSpan={7}>
                            <div className="d-flex justify-content-center align-items-center">
                                <p style={{ marginBottom: 0 }}>No Students in Queue</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    queue.map((request) => (
                        <tr key={request._id}>
                            <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>{convertDateToString(new Date(request.submitted))}</td>
                            <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>{request.email}</td>
                            <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>{request.name}</td>
                            <td className="text-nowrap" style={{ verticalAlign: 'middle' }}>{request._course.code}</td>
                            <td style={{ verticalAlign: 'middle' }}>{request.description}</td>
                            <td className="text-nowrap"><button type="button" className="btn btn-red" onClick={() => helpRequest(request._id)}>Help</button></td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
        {/*displays requests*/}
        <h3 style={{ margin: "0 0 10px 0" }}>Recent Requests</h3>
        <p>This queue shows all students that have been recently met with.</p>
        <table className="table table-striped table-responsive">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Tutor</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Course</th>
                    <th className="w-100">Description</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {requestsLoading ? (
                    <tr>
                        <td colSpan={7}>
                            <div className="d-flex justify-content-center align-items-center">
                                <div className="spinner-border" role="status">
                                    <span className="sr-only">Loading...</span>
                                </div>
                            </div>
                        </td>
                    </tr>
                ) : requests.length === 0 ? (
                    <tr>
                        <td colSpan={7}>
                            <div className="d-flex justify-content-center align-items-center">
                                <p style={{ marginBottom: 0 }}>No Recent Requests</p>
                            </div>
                        </td>
                    </tr>
                ) : (
                    requests.map((request) => (
                        <tr key={request._id}>
                            <td className="text-nowrap">{convertDateToString(new Date(request.submitted))}</td>
                            <td className="text-nowrap">{request._tutor ? request._tutor.name : ""}</td>
                            <td className="text-nowrap">{request.email}</td>
                            <td className="text-nowrap">{request.name}</td>
                            <td className="text-nowrap">{request._course.code}</td>
                            <td>{request.description}</td>
                            <td className="text-nowrap">{request.status}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table></div >);
}
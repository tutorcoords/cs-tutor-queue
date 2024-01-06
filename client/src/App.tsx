import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Request from "./pages/Request";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";
import NewPassword from "./pages/NewPassword";
import cslogo from "./assets/cs-logo.png";
import avatar from "./assets/avatar.jpeg";
import PrivateRoute from "./utils/PrivateRoute";

export default function App() {
  const navigate = useNavigate();

  //logout function
  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('name');
    navigate('/login');
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      {/*arizona header*/}
      <header className="bg-red arizona-header">
        <div className="container">
          <div className="row">
            <a className="arizona-logo" href="http://www.arizona.edu" title="The University of Arizona homepage">
              <img className="arizona-line-logo" alt="The University of Arizona Wordmark Line Logo White"
                src="https://cdn.digital.arizona.edu/logos/v1.0.0/ua_wordmark_line_logo_white_rgb.min.svg" />
            </a>
          </div>
        </div>
      </header>

      {/*navbar*/}
      <nav className="nav d-flex justify-content-between align-items-center container py-4" style={{ paddingRight: 0 }}>
        <Link to="/"><img src={cslogo} alt="CS Logo" height="50px" className="ml-4 ml-md-0" /></Link>
        {Cookies.get('token') ? (<div className="d-flex align-items-center mr-4 mr-md-0">
          <span className="d-none d-md-inline" style={{ marginRight: "5px" }}>{Cookies.get('name')}</span>
          <a
            className="nav-link dropdown-toggle d-flex align-items-center h-500"
            href="#"
            id="dropdownMenuButton"
            role="button"
            data-toggle="dropdown"
            aria-expanded="false"
            style={{ padding: "3px" }}
          >
            <img src={avatar} className="rounded-circle" height="35" alt="Avatar" loading="lazy" />
          </a>
          <div
            className="dropdown-menu dropdown-menu-right dropdown-menu-sm-left"
            aria-labelledby="dropdownMenuButton"
            data-placement="bottom-center"
          >
            <Link className="dropdown-item" to="/profile">Profile</Link>
            <Link className="dropdown-item" to="/dashboard">Tutor Dashboard</Link>
            <Link className="dropdown-item" to="/request">Request Form</Link>
            <button className="dropdown-item" onClick={logout}>Logout</button>
          </div>
        </div>) : (<div className="mr-4 mr-md-0">
          <Link to="/login"><button type="button" className="btn btn-red">Login</button></Link>
        </div>)}
      </nav >

      {/*main content and routes*/}
      <main className="flex-fill container" style={{ padding: 0 }}>
        <Routes>
          <Route path="/" element={<Request />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/request" element={<Request />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/resetpassword/:id/:token" element={<NewPassword />} />
          <Route path="*" element={<Request />} />
        </Routes>
      </main>

      {/*footer*/}
      <footer className="footer mt-auto bg-warm-gray text-center ">
        <div className="container py-4">
          <div className="row">
            <div className="col-12">
              <hr />
              <small className="text-black">The University of Arizona Computer Science Department</small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
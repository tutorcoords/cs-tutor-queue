import Cookies from "js-cookie";
import { useEffect } from "react";

export default function CoordinatorProfile() {
    //sets the page title
    useEffect(() => {
        document.title = "Profile | Tutor Center"
    }, []);

    return (
        <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
            <h3 style={{ margin: "0 0 10px 0" }}>Profile</h3>
            <p>Hello Coordinator {Cookies.get('name')}!</p>

            <h3 style={{ margin: "0 0 10px 0" }}>Edit Tutors</h3>

            <h3 style={{ margin: "0 0 10px 0" }}>Edit Courses</h3>



        </div>
    );
}
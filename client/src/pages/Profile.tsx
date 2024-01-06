import Cookies from "js-cookie";
import { useEffect } from "react";

export default function Profile() {
    //sets the page title
    useEffect(() => {
        document.title = "Profile | Tutor Center"
    }, []);

    return (
        <div className="ml-4 ml-md-0 mr-4 mr-md-0 ">
            <h3 style={{ margin: "0 0 10px 0" }}>Profile</h3>
            <p>Hello {Cookies.get('name')}!</p>
        </div>
    );
}
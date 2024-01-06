# CS Tutor Queue
This is the repo for the Tutor Queue used by the CS Tutor Center at the University of Arizona. It is maintained by the tutor center coordinators. This is based heavily off this [project](https://github.com/connorbrett/tutor-queue) created by Connor Brett, Aramis Sennyey, and Hung Le Ba.

### Enviroment Variables
To be able to run this project, a .env file needs to be added to the server directory with credentials. The following is the environment variables the project expects:
<br>
<br>
`PORT` = The desired port for the application to be run on. (Optional, Default: 3000)
<br>
`DATABASE_URL` = Connection URL to the MongoDB database.
<br>
`JWT_KEY` = A key for your JWT encryption (can be anything).
<br>
`GMAIL_EMAIL` = The email for reset password links to be sent from.
<br>
`GMAIL_PASSWORD` = The password to that email.
<br>
`SERVER_URL` = The url where the site will be hosted (used for the url in reset password email).

### Running the Project
The recommended method to running the project is through Docker. Be sure to install docker on your system before continuing.

To get the most current image, be sure to run:

`sudo docker pull tutorcoords/cs-tutor-queue:main` 

Once the updated image is pulled and all other docker containers being ran on port 3000 are killed, run:

`sudo docker run -p 3000:3000 -d --env-file <PATH TO ENV FILE>  tutorcoords/cs-tutor-queue:main`

This will host the project on port 3000. Change the ports if necessary.

NOTE: The docker hub image (where you are getting the projects docker image from) is automatically updated through github actions whenever something is pushed to the main branch. This ensures it is always up to date. The docker image can also be built manually (`docker build -t <DESIRED IMAGE NAME> .` within the main directory) and ran with the same command (the `tutorcoords/cs-tutor-queue:main` would need to be replaced with whatever you named your local image).
# README for Client
Created with React, Typescript, and Bootstrap.


### Run in development
- First install the necessary pacakges by running `npm install` within the client directory
- Run `npm run dev` and visit http://localhost:5173 to view the frontend.

NOTE: The server must be running for any real frontend functionality.

### Prepare for production
NOTE: The docker image will do this for you automatically. Only do these steps if you would like to build it manually or if you are also running the server locally.
- To convert the react/typescript code to JS, run `npm run build` within the client directory.
- This will populate the `/dist` folder within the client directory. These files need to be copied to the `/client-dist folder` in the server directory. If the `/client-dist` folder does not exist, create it.
# README for Server
Created with Node, Typescript, Express, and MongoDB/Mongoose.


### Run in development
- First install the necessary pacakges by running `npm install` within the server directory.
- Add and fill a .env file for the server. The required contents can be found in the main readme.
- Run `npm run serve`. This creates a server on port 3000 (http://localhost:3000).

NOTE: The frontend will only work if the `/client-dist` folder is populated from the "prepare for production" steps in the client readme. Once this is done, the front end can be found at http://localhost:3000 when you run the server with the steps above.

### Prepare for production
NOTE: The docker image will do this for you automatically. Only do these steps if you would like to build it manually.
- Confirm that the `/client-dist` is full (can be done through the "prepare for production" steps in the client readme).
- Run `npm run build` within the server directory. This will convert the typescript into JS and add the code to the `/dist` directory.
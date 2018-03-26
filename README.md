# retsly-heatmap
Dockerized Express.js server with HTML, CSS, JavaScript and Google Maps API to show a heat map of real estate listings in San Francisco from Bridge API's data.

To run backend server, do one of the following:
1. `docker build -t <tag name> server/` and `docker run -d -p 8080:8080 <tag name>`
2. `npm start`
3. `node server.js`

To use the frontend, simply open `client/index.html` in browser.

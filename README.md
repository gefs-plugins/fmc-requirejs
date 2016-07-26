### fmc-requirejs
This is the RequireJS implementation of the Flight Management Computer for GEFS Online


----
#### Testing
This feature allows you to run a server for GEFS from your local plugin files.

Before running, you'll need to install [Node.js](http://nodejs.org).

After installation, open a terminal/command prompt in this directory, then:
```
npm install
npm start
```
Then you will be able to access the game at <http://127.0.0.1:3000/gefs.php>

----
#### Quick Optimization
First, make sure that you have run `npm install`.

If so, open a terminal/command prompt in this directory, then do
```
node node_modules/requirejs/bin/r.js -o build-config.js
```
Then you will be able to see the optimized file in *build* as **fmc.min.js**

### fmc-requirejs
This is the RequireJS implementation of the Flight Management Computer for GeoFS

----
#### Testing
This feature allows you to run a server for GeoFS from your locally for plugin testing.

Before running, you'll need to install [Node.js](http://nodejs.org).

After installation, open a terminal/command prompt in this directory, then:
```
npm install
npm start
```
Then you will be able to access the game at <http://127.0.0.1:3000/geofs.php>

**Quick Update** Due to a jQuery code in-game, please type in `require(['ui/main']);` in the console after game loads.

----
#### Quick Optimization
First, make sure that you have run `npm install`.

If so, open a terminal/command prompt in this directory, then do
```
node node_modules/requirejs/bin/r.js -o build-config.js
```
Then you will be able to see the optimized file in *build* as **fmc.min.js**

----
> Copyright (c) 2016-2017 Harry Xue and other contributors

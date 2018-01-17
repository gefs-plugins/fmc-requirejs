## fmc-requirejs
This is the RequireJS implementation of the Flight Management Computer for GeoFS

----
#### Testing
This feature allows you to run a server for GeoFS from your local files for plugin testing.

Before running, you'll need to install [Node.js](http://nodejs.org).

After installation, open a terminal/command prompt in this directory, then:
```
npm install
npm start
```
Then you will be able to access the game at <http://127.0.0.1:3000/geofs.php>

----
#### Quick Optimization
First, make sure that you have run `npm install`.

If so, open a terminal/command prompt in this directory, then do
```
node node_modules/requirejs/bin/r.js -o build.json
```
Then you will be able to see the optimized file in *build* as **fmc.min.js**

----
#### License
```
Copyright (C) 2016-2018 Harry Xue, (C) 2016-2017 Ethan Shields

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
```

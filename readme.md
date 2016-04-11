GLESjs project for Android Studio
=================================

This is an Android Studio project that uses the GLES.JS project
by Boris van Schooten.

Setting up an Android Studio project with GLES.JS was not very intuitive and
requires gradle editing and other steps etc. So I wanted to consolidate provide
a working example to anyone interested in working with GLES.JS.

I've set up the project file through trial and error so if you have any 
it works, but it might contain incorrect settings or redundant files.
Any suggestions or improvements, please let me know (see end of file).

![preview screenshot](https://raw.githubusercontent.com/BdR76/GLES.JS-Android-Studio-project/master/screenshot/gles_test1.png)

GLESjs
------
[GLES.JS on github](https://github.com/borisvanschooten/glesjs)

GLES.JS by Boris van Schooten (tmtg.net / boris@13thmonkey.org) is provides
Android WebGL bindings for the Javascript V8 engine (ARMv7 architecture).

The purpose of GLES.JS is to wrap a HTML5/JavaScript game and compile it into a
native Android app. GLESjs translates the WebGL calls directly to OpenGL ES,
giving the game a much increased performance when compared to wrapping it with
Cordova/PhoneGap or CocoonJS.

Put simply, glesjs "binds" the JavaScript canvas element directly to the GPU of
a Android device, making it possible to package JavaScript 2D action games that
need to run at 60 frames per second (fps). The downside is that the
compatibility with DOM objects is limited.

HTML5/JavaScript game frameworks that render inside a canvas element can
probably benefit from GLESjs, but frameworks that focus more on HTML, CSS and
DOM manipulations will probably not benefit, so:

| Possible benefit  | Probably NO benefit |
| ----------------- | ------------------- |
| Phaser            | jQuery              |
| Pixi              | Angular             |
| Panda             | React               |
| etc.              | etc.                |

Android Studio project
----------------------

How to install this project Android Studio
1. Open Android Studio and select Import Project
2. select the folder "Android Studio project"
3. Build app and run


Difference with browser
-----------------------

GLES.JS has some limitations over browser
* limited HTML handling and DOM manipulation
* limited handling of XML structures (so Phaser.js fonts don't work)

There are some minor differences between running your HTML5/Jaascript game with
GLES.js when compared to running them in a browser like Chrome or Firefox:

* glesjs requires the html5.js file provided with glesjs
* not glesjs related, but when you try to run a Phaser game in Chrome from your
local harddisk (istead of a internet fileserver) by default Chrome won't load
images and sounds from your local harddisk. You can fix this by starting Chrome
with the parameter:

	chrome.exe --allow-file-access-from-files

History
-------
2016-apr-10 Android Studio projetc released on github

Send any questions, comments to Bas de Reuver - bdr1976@gmail.com

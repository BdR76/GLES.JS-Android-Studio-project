// gles.js (c) by Boris van Schooten boris@13thmonkey.org
// HTML5 function and object emulation

// Image

function Image() { }

Image.prototype = {
	set src (val) {
		this._src = val;
		var dim = _gl._getImageDimensions(val);
		this.width = dim[0];
		this.height = dim[1];
		this.complete = true;
		if (this.onload) this.onload();
	},
	get src() {
		return this._src;
	}
};

_gl.texImage2D = function(target,level,p3,p4,p5,p6,p7,p8,p9) {
	if (p8) {
		// long version
		this._texImage2D(target,level,p3,p4,p5,p6,p7,p8,p9);
	} else {
		if (!p6.src) throw "Image.src not defined or not an Image";
		// short version:
		//_gl.texImage2D = function(target,level,format,internalformat,type, image);
		this._texImage2D(target,level,p3,p4,p5,p6.src);
	}
}


// Audio

_audio.nextid = 0;
_audio.LOAD  = 0;
_audio.PLAY  = 1;
_audio.PAUSE = 2;

function Audio(assetname) {
	this.assetname = assetname;
	this.loop = false;
	this.id = _audio.nextid;
	_audio.nextid++;
	// preload asset
	if (assetname) this.load();
}


Audio.prototype.canPlayType = function(mimetype) {
	return true;
}

Audio.prototype.load = function() {
	_audio.handle(_audio.LOAD,this.assetname,this.loop,this.id);

}

Audio.prototype.play = function() {
	_audio.handle(_audio.PLAY,this.assetname,this.loop,this.id);
}

Audio.prototype.pause = function() {
	_audio.handle(_audio.PAUSE,this.assetname,this.loop,this.id);
}

// src getter - setter?


// the html window object

window = (function() {return this;}()); // window = GLOBAL in HTML

//function window() {}

window.addEventListener = function(eventtype,func,bool) {
	_canvas.addEventListener(eventtype,func,bool);
}

window.removeEventListener = function(eventtype,func,bool) {
	_canvas.removeEventListener(eventtype,func,bool);
}

window.requestAnimationFrame = function(callback) {
	this._animationFrameCallback = callback;
}

window.requestAnimFrame = function(callback) {
	window.requestAnimationFrame(callback);
}

window.setTimeout = function(callback, millisec) {
	// XXX millisec is ignored
	this._animationFrameCallback = callback;
}

window.navigator = {};

window.navigator.appName = "Netscape";
window.navigator.appCodeName = "Netscape";
window.navigator.appVersion = "5.0";
window.navigator.product = "Gecko";
window.navigator.platform = "Android";
window.navigator.userAgent = "GlesJS (Android)";
window.navigator.language = "en-US";
window.navigator.javaEnabled = false;
window.navigator.cookieEnabled = false;

window.WebGLRenderingContext = _gl;


window.XMLHttpRequest = function() { }

window.XMLHttpRequest.prototype.open = function(type,url,async) {
	this._url = url;
}

window.XMLHttpRequest.prototype.send = function(post) {
	this.responseText = _utils.loadStringAsset(this._url);
	if (this.onload) {
		this.onload();
	}
}


function _GLDrawFrame() {
	if (window._animationFrameCallback) {
		window._animationFrameCallback();
	}
}


// DOM
// http://www.w3schools.com/jsref/dom_obj_all.asp
// http://www.permadi.com/tutorial/domTree/

// element node

function _node(nodeName,nodeType) {
	this.nodeType = nodeType;
	this.nodeName = nodeName;
	this.style = {};
	this.parentNode = null;
	this.childNodes = [];
	this.firstChild = null;
	this.lastChild = null;
	this.nextSibling = null;
	this.prevSibling = null;
	this.id = null;
	this._attributes = {}; // String -> String
	//attributes not implemented
}

_node.prototype.getAttribute = function(name) {
	return this._attributes[name];
}

_node.prototype._getElementIndex = function(elem) {
	if (elem==null) return -1;
	for (var i=0; i<this.childNodes.length; i++) {
		if (this.childNodes[i] == elem) {
			return i;
		}
	}
	return -1;
}

_node.prototype.removeChild = function(child) {
	var idx = this._getElementIndex(child);
	if (idx<0) return;
	this.childNodes.splice(idx,1);
	var length = this.childNodes.length;
	if (idx==0) { // first element was removed
		if (length==0) { // last element was removed
			this.lastChild = null;
			this.firstChild = null;
		} else { // there are elements after removed element
			this.firstChild = this.childNodes[0];
			this.childNodes[0].prevSibling = null;
			if (length==1) {
				this.lastChild = this.childNodes[0];
			}
		}
	} else { // there are elements before removed element
		if (idx == length) { // last element was removed
			this.lastChild = this.childNodes[length-1];
			this.childNodes[length-1].nextSibling = null;
		} else { // there are elements after removed element
			this.childNodes[idx-1].nextSibling = this.childNodes[idx];
			this.childNodes[idx].prevSibling = this.childNodes[idx-1];
		}
	}
}

_node.prototype.insertBefore = function(child,refchild) {
	var idx = this._getElementIndex(refchild);
	if (idx<0) { // insert as last element
		idx = this.childNodes.length;
		this.childNodes.push(child);
		this.lastChild = child;
		if (idx > 0) {
			this.childNodes[idx-1].nextSibling = child;
		}
	} else {
		this.childNodes.splice(idx,0,child);
	}
	if (idx==0) { // inserted as first element
		this.firstChild = child;
	} else {
		this.childNodes[idx-1].nextSibling = child;
		child.prevSibling = this.childNodes[idx-1];
	}
	child.parentNode = this;
}

_node.prototype.appendChild = function(child,idx) {
	this.insertBefore(child,null);
}

_node.prototype.replaceChild = function(child,oldchild) {
	this.insertBefore(child,oldchild);
	this.removeChild(oldchild);
}

_node.prototype.hasChildNodes = function(child) {
	return childNodes.length>0;
}



/* HTML5 parser
 * Based on: HTML5 Parser By Sam Blowes
 * https://github.com/blowsie/Pure-JavaScript-HTML5-Parser/
 * Original code by John Resig (ejohn.org)
 * http://ejohn.org/blog/pure-javascript-html-parser/
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js */

function HTMLParser() {}

HTMLParser.makeMap = function (str) {
	var obj = {}, items = str.split(",");
	for (var i = 0; i < items.length; i++)
		obj[items[i]] = true;
	return obj;
}


// Regular Expressions for parsing tags and attributes
HTMLParser.startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
HTMLParser.endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/;
	HTMLParser.attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

// Empty Elements - HTML 5
HTMLParser.empty = HTMLParser.makeMap("area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed");

// Block Elements - HTML 5
HTMLParser.block = HTMLParser.makeMap("address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

// Inline Elements - HTML 5
HTMLParser.inline = HTMLParser.makeMap("a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

// Elements that you can, intentionally, leave open
// (and which close themselves)
HTMLParser.closeSelf = HTMLParser.makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Attributes that have their values filled in disabled="disabled"
HTMLParser.fillAttrs = HTMLParser.makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

// Special Elements (can contain anything)
HTMLParser.special = HTMLParser.makeMap("script,style");


HTMLParser.parse = function (html, handler) {
	var index, chars, match, stack = [], last = html;
	stack.last = function () {
		return this[this.length - 1];
	};

	while (html) {
		chars = true;

		// Make sure we're not in a script or style element
		if (!stack.last() || !HTMLParser.special[stack.last()]) {

			// doctype header (ignore)
			if (html.indexOf("<!DOCTYPE") == 0) {
				index = html.indexOf(">");

				if (index >= 0) {
					html = html.substring(index + 1);
					chars = false;
				}

				// end tag
			} else if (html.indexOf("<!--") == 0) {
				index = html.indexOf("-->");

				if (index >= 0) {
					if (handler.comment)
						handler.comment(html.substring(4, index));
					html = html.substring(index + 3);
					chars = false;
				}

				// end tag
			} else if (html.indexOf("</") == 0) {
				match = html.match(HTMLParser.endTag);

				if (match) {
					html = html.substring(match[0].length);
					match[0].replace(HTMLParser.endTag, parseEndTag);
					chars = false;
				}

				// start tag
			} else if (html.indexOf("<") == 0) {
				match = html.match(HTMLParser.startTag);

				if (match) {
					html = html.substring(match[0].length);
					match[0].replace(HTMLParser.startTag, parseStartTag);
					chars = false;
				}
			}

			if (chars) {
				index = html.indexOf("<");

				var text = index < 0 ? html : html.substring(0, index);
				html = index < 0 ? "" : html.substring(index);

				if (handler.chars)
					handler.chars(text);
			}

		} else {
			html = html.replace(new RegExp("([\\s\\S]*?)<\/" + stack.last() + "[^>]*>"), function (all, text) {
				text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, "$1$2");
				if (handler.chars)
					handler.chars(text);

				return "";
			});

			parseEndTag("", stack.last());
		}

		if (html == last)
			throw "Parse Error: " + html;
		last = html;
	}

	// Clean up any remaining tags
	parseEndTag();

	function parseStartTag(tag, tagName, rest, unary) {
		tagName = tagName.toLowerCase();

		if (HTMLParser.block[tagName]) {
			while (stack.last() && HTMLParser.inline[stack.last()]) {
				parseEndTag("", stack.last());
			}
		}

		if (HTMLParser.closeSelf[tagName] && stack.last() == tagName) {
			parseEndTag("", tagName);
		}

		unary = HTMLParser.empty[tagName] || !!unary;

		if (!unary)
			stack.push(tagName);

		if (handler.start) {
			var attrs = [];

			rest.replace(HTMLParser.attr, function (match, name) {
				var value = arguments[2] ? arguments[2] :
					arguments[3] ? arguments[3] :
					arguments[4] ? arguments[4] :
					HTMLParser.fillAttrs[name] ? name : "";

				attrs.push({
					name: name,
					value: value,
					escaped: value.replace(/(^|[^\\])"/g, '$1\\\"') //"
				});
			});

			if (handler.start)
				handler.start(tagName, attrs, unary);
		}
	}

	function parseEndTag(tag, tagName) {
		// If no tag name is provided, clean shop
		if (!tagName)
			var pos = 0;

			// Find the closest opened tag of the same type
		else
			for (var pos = stack.length - 1; pos >= 0; pos--)
				if (stack[pos] == tagName)
					break;

		if (pos >= 0) {
			// Close all the open elements, up the stack
			for (var i = stack.length - 1; i >= pos; i--)
				if (handler.end)
					handler.end(stack[i]);

			// Remove the open elements from the stack
			stack.length = pos;
		}
	}
};

HTMLParser.htmlToDomTree = function (html, elemMap) {
	var root = null;
	var stack = [];

	HTMLParser.parse(html, {
		start: function (tag, attrs, unary) {
			tag = tag.toUpperCase();
			var node = new _node(tag,1);
			stack.push(node);
			// first node encountered is root
			if (root==null) root=node;
			if (stack.length > 1)
				stack[stack.length-2].appendChild(node);
			for (var i = 0; i < attrs.length; i++) {
				var name = attrs[i].name.toLowerCase();
				var value = attrs[i].value;
				node._attributes[name] = value;
				if (name=="id") {
					node.id = value;
					if (elemMap) elemMap[value] = node;
				} else if (name=="name") {
					node.name = value;
				} else if (name=="type") {
					node.type = value;
				} else if (name=="title") {
					node.title = value;
				} else if (name=="src") {
					node.src = value;
				}
			}
		},
		end: function (tag) {
			stack.pop();
		},
		chars: function (text) {
			var node = new _node("text",3);
			node.textContent = text;
			if (stack.length >= 1)
				stack[stack.length-1].appendChild(node);
		},
		comment: function (text) {
			// ignore
		}
	});

	return root;
};

/** END html5 parser **/




function document() {}

document.addEventListener = function(eventtype,func,bool) {
	_canvas.addEventListener(eventtype,func,bool);
}

document.removeEventListener = function(eventtype,func,bool) {
	_canvas.removeEventListener(eventtype,func,bool);
}


document.getElementById = function(id) {
	var elem = document._elementsById[id];
	if (!elem) return null;
	if (elem.nodeName == "CANVAS") return _canvas;
	return elem;
}

// is used to look up elements
document._elementsById = {};


document.documentElement = HTMLParser.htmlToDomTree(_utils.loadStringAsset("index.html"),
	document._elementsById);

document.head = _findNodeName(document.documentElement,"HEAD");
document.body = _findNodeName(document.documentElement,"BODY");


document.createElement = function(nodeName) {
	if (nodeName.toUpperCase()=="CANVAS") return _canvas;
	return new _node(nodeName,1);
}



// _canvas is the game canvas

_canvasnode.prototype = new _node("CANVAS",1);

function _canvasnode() {
	_node.apply(this,["CANVAS",1]);
	// relative mouse emulation
}

_canvas = new _canvasnode();

_canvas._mousesens = 2.0;
_canvas._mousedown = false;
_canvas._prevmousex = 0;
_canvas._prevmousey = 0;
_canvas._virtmousex = 100;
_canvas._virtmousey = 100;
/// XXX todo support multiple callbacks
_canvas._mouseMoveCallbacks = [];
_canvas._mouseUpCallbacks = [];
_canvas._mouseDownCallbacks = [];
_canvas._mouseOutCallbacks = [];
_canvas._onLoadCallbacks = [];

_canvas.addEventListener = function(eventtype,func,bool) {
	eventtype = eventtype.toLowerCase();
	if (eventtype=='mousemove') {
		this._mouseMoveCallback = func;
		console.log("Added mousemove handler");
	} else if (eventtype=='mousedown') {
		this._mouseDownCallback = func;
		console.log("Added mousedown handler");
	} else if (eventtype=='mouseup') {
		this._mouseUpCallback = func;
		console.log("Added mouseup handler");
	} else if (eventtype=='mouseout') {
		this._mouseOutCallback = func;
		console.log("Added mouseout handler");
	} else if (eventtype=='domcontentloaded') {
		// XXX may overwrite onload already there
		this._onloadhandler = func;
		console.log("Added domcontentloaded handler");
	}
}

_canvas.removeEventListener = function(eventtype,func,bool) { }


_canvas.getContext = function(type) {
	if (type.toLowerCase().trim()=="2d") {
		return new _2dcontext();
	} else {
		return _gl;
	}
}


_canvas.getBoundingClientRect = function() {
	return new _Rectangle(0,0,_canvas.width,_canvas.height);
}


// dummy context to make sure apps don't crash

function _2dcontext() { }

_2dcontext.prototype.fillRect = function(x,y,w,h) { }

_2dcontext.prototype.createImageData = function(width,height) {
	return { data: [] };
}

_2dcontext.prototype.getImageData = function(x,y,w,h) {
	// return array of the right size filled with zeroes
	ret = [];
	for (var i=0; i<w*h*4; i++) ret.push(0);
	return { data: ret };
}



// _gl should have _canvas as attribute
_gl.canvas = _canvas;

// handling input callbacks from embedder

function _MouseEvent(x,y,dx,dy) {
	this.clientX = x;
	this.clientY = y;
	this.pageX = x;
	this.pageY = y;
	this.screenX = x;
	this.screenY = y;
	this.movementX = dx;
	this.movementY = dy;
	this.button = 0;
}

_MouseEvent.prototype.preventDefault = function() { }

function _MouseButtonEvent(button) {
	this.button = button;
}

_MouseButtonEvent.prototype.preventDefault = function() { }

function _Rectangle(top,left,width,height) {
	this.top = top;
	this.left = left;
	// check name of fields!
	this.width = width;
	this.height = height;
}


// callbacks from engine

function _mouseMoveCallback(x,y) {
	if (_canvas._mousedown) {
		// continue movement
		var dx = x - _canvas._prevmousex;
		var dy = y - _canvas._prevmousey;
		_canvas._virtmousex += _canvas._mousesens*dx;
		_canvas._virtmousey += _canvas._mousesens*dy;
		if (_canvas._virtmousex < 0) _canvas._virtmousex = 0;
		if (_canvas._virtmousey < 0) _canvas._virtmousey = 0;
		if (_canvas._virtmousex > window.innerWidth)
			_canvas._virtmousex = window.innerWidth;
		if (_canvas._virtmousey > window.innerHeight)
			_canvas._virtmousey = window.innerHeight;
		//console.log("@@@@@ "+_canvas._virtmousex+" "+_canvas._virtmousey);
	}
	_canvas._mousedown = true;
	if (_canvas._mouseMoveCallback) {
		// you can choose between relative or absolute mouse position
		// absolute
		//_canvas._prevMouseEvent = new _MouseEvent(x, y,
		//		x - _canvas._prevmousex, y - _canvas._prevmousey);
		// relative
		_canvas._prevMouseEvent = new _MouseEvent(
			_canvas._virtmousex, _canvas._virtmousey,
			_canvas._virtmousex - _canvas.prevvirtmousex,
			_canvas._virtmousey - _canvas.prevvirtmousey);
		_canvas._mouseMoveCallback(_canvas._prevMouseEvent);
	}
	_canvas._prevmousex = x;
	_canvas._prevmousey = y;
	_canvas._prevvirtmousex = _canvas.virtmousex;
	_canvas._prevvirtmousey = _canvas.virtmousey;
}

function _mouseUpCallback() {
	_canvas._mousedown = false;
	if (_canvas._mouseUpCallback) {
		_canvas._mouseUpCallback(_canvas._prevMouseEvent);
		//_canvas._mouseUpCallback(new _MouseButtonEvent(0));
	}
	// for touch, mouseup = mouseout
	if (_canvas._mouseOutCallback) {
		_canvas._mouseOutCallback(_canvas._prevMouseEvent);
		//_canvas._mouseOutCallback(new _MouseButtonEvent(0));
	}
}

function _mouseDownCallback() {
	if (_canvas._mouseDownCallback) {
		_canvas._mouseDownCallback(_canvas._prevMouseEvent);
		//_canvas._mouseDownCallback(new _MouseButtonEvent(0));
	}
}

function _documentLoaded() {
	_execOnLoad(document.documentElement);
	if (_canvas._onloadhandler) _canvas._onloadhandler();
	console.log("Document loaded.");
}


// find and call all onload="..." code
function _execOnLoad(elem) {
	if (elem.nodeType!=1) return;
	var onload = elem.getAttribute("onload");
	if (onload) {
		_utils.execScript(onload);
	}
	for (var i=0; i<elem.childNodes.length; i++) {
		_execOnLoad(elem.childNodes[i]);
	}
}



// find and execute all JS in given DOM
function _loadJS(elem) {
	if (elem.nodeType==1 && elem.nodeName=="SCRIPT" 
	&& (!elem.type || elem.type=="text/javascript")) {
		if (elem.src) {
			_utils.execScript(_utils.loadStringAsset(elem.src));
		} else {
			var src = "";
			for (var i=0; i<elem.childNodes.length; i++) {
				if (elem.childNodes[i].nodeType==3) {
					src += elem.childNodes[i].textContent;
				}
			}
			_utils.execScript(src);
		}
	} else if (elem.nodeType==1) {
		for (var i=0; i<elem.childNodes.length; i++) {
			_loadJS(elem.childNodes[i]);
		}
	}
}

// find element with given nodeName
function _findNodeName(elem,nodeName) {
	if (elem.nodeName==nodeName) return elem;
	for (var i=0; i<elem.childNodes.length; i++) {
		var ret = _findNodeName(elem.childNodes[i],nodeName);
		if (ret!=null) return ret;
	}
	return null;
}

function _updateScreenSize() {
	var width = _gl._getWindowWidth();
	var height = _gl._getWindowHeight();
	console.log("Screen size: "+width+"x"+height);
	// XXX this will overwrite global width/height. We don't set it for now.
	//window.width = width;
	//window.height = height;
	window.innerWidth = width;
	window.innerHeight = height;
	_canvas.width = width;
	_canvas.height = height;
	_canvas.style = {};
	_canvas.style.width = width;
	_canvas.style.height = height;
}

// MAIN

_updateScreenSize();

_loadJS(document.documentElement);


"HTML5 loaded";

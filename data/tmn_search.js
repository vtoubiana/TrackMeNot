/*******************************************************************************    
 This file is part of TrackMeNot (Chrome version).
 
 TrackMeNot is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation,  version 2 of the License.
 
 TrackMeNot is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public License
 along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
 ********************************************************************************/

if (!TRACKMENOT)
    var TRACKMENOT = {};


TRACKMENOT.TMNInjected = function() {
    var debug_script = true;

    var tmn = null;
    var tmn_id = 0;
    var tmnCurrentURL = '';
    var engine = '';
    
	
	var getButton_google = function(  ) {var button = getElementsByAttrValue(document,'button', 'name', 'btnG' );		if ( !button ) button = getElementsByAttrValue(document,'button', 'name', 'btnK' );return button;}       
	var getButton_yahoo=  function(  ) {return getElementsByAttrValue(document,'input', 'class', 'sbb' ); }         
	var  getButton_bing=  function(  ) {return document.getElementById('sb_form_go');}     
	var getButton_aol = function (  ) {return document.getElementById('csbbtn1');   }
	var getButton_baidu = function (  ){ return getElementsByAttrValue(document,'input', 'value', '????' ); }



    var SearchBox_google = function( ) { return getElementsByAttrValue(document,'input', 'name', 'q' ); } ;
    var SearchBox_yahoo =  function(  ) { return document.getElementById('yschsp');};
    var SearchBox_bing =  function(  ) {return document.getElementById('sb_form_q'); };
    var SearchBox_aol = function(  ) {return document.getElementById('csbquery1');};
    var SearchBox_baidu =  function(  ) {return document.getElementById('kw');};


    var suggest_google = ['gsr', 'td', function(elt) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'gac_c')
        }]

    var suggest_yahoo = ['atgl', 'a', function(elt) {
            return elt.hasAttribute('gossiptext')
        }]

    var suggest_bing = ['sa_drw', 'li', function(elt) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'sa_sg')
        }]

    var suggest_baidu = ['st', 'tr', function(elt) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'ml')
        }]

    var suggest_aol = ['ACC', 'a', function(elt) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'acs')
        }]

	
	var js_from_engines = {
        'google':{ "testad": function(ac,al,apc,as) {return ( apc && as && al && (ac=='l'  || ac=='l vst' || apc== 'r' ) && as.indexOf('return rwt') ==0 && al.indexOf('http')==0 && al.indexOf('https')!=0);}, 'box': SearchBox_google, 'button': getButton_google},
        'yahoo':{ "testad":  function(ac,al) {return ( ac=='\"yschttl spt\"' || ac=='yschttl spt');}, 'box': SearchBox_yahoo, 'button': getButton_yahoo},
        'bing':{ "testad":  function(ac,al) {return ( al&& al.indexOf('http')==0&& al.indexOf('https')!=0 && al.indexOf('msn')<0 && al.indexOf('live')<0  && al.indexOf('bing')<0&& al.indexOf('microsoft')<0 && al.indexOf('WindowsLiveTranslator')<0 )    }, 'box': SearchBox_bing, 'button': getButton_bing},
        'baidu':{ "testad":  function(ac,al) {return ( al&& al.indexOf('baidu')<0 && al.indexOf('https')!=0  );}, 'box': SearchBox_baidu, 'button': getButton_baidu},
        'aol':{ "testad":  function(ac,al){return(ac=='\"find\"'||ac=='find'&& al.indexOf('https')!=0 && al.indexOf('aol')<0 );}, 'box': SearchBox_aol, 'button': getButton_aol}
    }


    function roll(min, max) {
        return Math.floor(Math.random() * (max + 1)) + min;
    }

    function cout(msg) {
        console.log(msg);
    }
    function debug(msg) {
        if (debug_script)
            console.log("Debug: " + msg);
    }

    function stripTags(htmlStr) {
        return htmlStr.replace(/(<([^>]+)>)/ig, "");
    }




    function pressEnter(elt) {
        var timers = getTimingArray();
        var evtDown = document.createEvent("KeyboardEvent");
        evtDown.initKeyEvent("keydown", true, true, null, false, false, false, false, 13, 0);
        window.setTimeout(function() {
            elt.dispatchEvent(evtDown);
        }, timers[0]);
        var evtPress = document.createEvent("KeyboardEvent");
        evtPress.initKeyEvent("keypress", true, true, null, false, false, false, false, 13, 0);
        window.setTimeout(function() {
            elt.dispatchEvent(evtPress);
        }, timers[1]);
        var evtUp = document.createEvent("KeyboardEvent");
        evtUp.initKeyEvent("keyup", true, true, null, false, false, false, false, 13, 0);
        window.setTimeout(function() {
            elt.dispatchEvent(evtUp);
        }, timers[2]);
        window.setTimeout(function() {
            sendPageLoaded();
        }, timers[3]);
    }




    function downKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtDown = document.createEvent("KeyboardEvent");
        evtDown.initKeyEvent("keydown", true, true, null, false, false, false, false, 0, charCode);
        searchBox.dispatchEvent(evtDown);
    }

    function pressKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtPress = document.createEvent("KeyboardEvent");
        evtPress.initKeyEvent("keypress", true, true, null, false, false, false, false, 0, charCode);
        searchBox.dispatchEvent(evtPress);
    }

    function inputChar(chara, searchBox) {
        var ev = document.createEvent("Event");
        ev.initEvent("input", true, false);
        searchBox.dispatchEvent(ev);
    }

    function releaseKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtUp = document.createEvent("KeyboardEvent");
        evtUp.initKeyEvent("keyup", true, true, null, false, false, false, false, 0, charCode);
        searchBox.dispatchEvent(evtUp);
    }

    function simulateClick(engine) {

        var clickIndex = roll(0, 9);
        if (!document || document === "undefined")
            return;
        var pageLinks = document.getElementsByTagName("a");

        cout('There are ' + pageLinks.length + ' on the result page');

        var j = 0;
        for (var i = 0; i < pageLinks.length; i++) {
            if (pageLinks[i].hasAttribute("orighref"))
                anchorLink = pageLinks[i].getAttribute("orighref");
            else
                anchorLink = pageLinks[i].getAttribute("href");
            anchorClass = pageLinks[i].getAttribute("class");
			anchorScript = pageLinks[i].getAttribute("onmousedown");
			debug("Script:"+ anchorScript)  
			anchorParentClass = pageLinks[i].parentNode.getAttribute("class");
			debug("Parent Class:"+ anchorParentClass)  
            var link = stripTags(pageLinks[i].innerHTML);
			debug("Loading testad "+ js_from_engines[engine.id].testad + " for engine "+ engine.id );
			if(js_from_engines[engine.id] && js_from_engines[engine.id].testad)
            var testad = js_from_engines[engine.id].testad
			if (testad !== "undefined")	debug("Test ad function loaded");
            if (testad !== "undefined" && testad(anchorClass, anchorLink, anchorParentClass,anchorScript)) {
                j++;
				debug("Number of link founded so far :"+j);
                if (j === clickIndex) {
                    var logEntry = JSON.stringify({
                        'type': 'click',
                        "engine": engine.id,
                        'query': link,
                        'id': tmn_id
                    });
                    _log(logEntry);
                    try {
                        clickElt(pageLinks[i]);
                        cout("link clicked");
                    } catch (e) {
                        cout("error opening click-through request for " + e);
                    }
                    return;
                }
            }
        }
    }



    function clickButton() {
        if(js_from_engines[engine.id] && js_from_engines[engine.id].button)
        var button = js_from_engines[engine.id].button(document);
        clickElt(button);
        debug("send page loaded");
        sendPageLoaded();
    }



    function clickElt(elt) {
        var win = null;
        if (!elt)
            return;
        var timers = getTimingArray();
        var evtDown = document.createEvent("MouseEvents");
        evtDown.initMouseEvent("mousedown", true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        window.setTimeout(function() {
            elt.dispatchEvent(evtDown);
        }, timers[0]);
        var evtUp = document.createEvent("MouseEvents");
        evtUp.initMouseEvent("mouseup", true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        window.setTimeout(function() {
            elt.dispatchEvent(evtUp);
        }, timers[1]);
        var evtCl = document.createEvent("MouseEvents");
        evtCl.initMouseEvent("click", true, true, win, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        window.setTimeout(function() {
            elt.dispatchEvent(evtCl);
        }, timers[2]);

    }



    function getElementsByAttrValue(dom, nodeType, attrName, nodeValue) {
        var outlines = dom.getElementsByTagName(nodeType);
        for (var i = 0; i < outlines.length; i++) {
            if (outlines[i].hasAttribute(attrName) && outlines[i].getAttribute(attrName) === nodeValue)
                return outlines[i];
        }
        return null;
    }




    function getElement(doc, aID) {
        return (doc.getElementById) ? doc.getElementById(aID) : doc.all[aID];
    }



    function getQuerySuggestion() {
        var suggestFilter = suggest_filters[engine];
        var searchTable = getElement(document, suggestFilter[0]);
        if (!searchTable)
            return [];
        var sublines = searchTable.getElementsByTagName(suggestFilter[1]);
        var suggestElts = [];
        for (var i = 0; i < sublines.length; i++) {
            var line = sublines[i];
            if (suggestFilter[2](line))
                suggestElts.push(line);
        }
        var suggestions = suggestElts.map(function(x) {
            return stripTags(x.innerHTML);
        });
        debug('TMN: ' + suggestions);
        return suggestElts.slice();
    }


    function getCommonWords(searchValue, nextQuery) {
        var searched = searchValue.split(' ');
        var tosearch = nextQuery.split(' ');
        var result = [];
        result = result.concat(searched.filter(function(x) {
            return (tosearch.indexOf(x) >= 0);
        }));
        return result;
    }

    function getTimingArray() {
        var timers = [];
        for (var i = 0; i < 5; i++) {
            timers.push(Math.floor(Math.random() * 30));
        }
        return timers.sort();
    }



    function typeQuery(queryToSend, currIndex, searchBox, chara, isIncr) {
        var nextPress;
        tmnCurrentQuery = queryToSend;
        debug("typing query");
        clickElt(searchBox);
        searchBox.focus();
        if (currIndex < queryToSend.length) {
            // var suggestElt = getQuerySuggestion(doc);	
            if (false && Math.random() < 0.02 && suggestElt.length > 0) {
                var index_ = roll(0, suggestElt.length - 1);
                selectElt(suggestElt[index_], searchBox);
                clickElt(suggestElt[index_]);
                blurElt(searchBox);
                updateStatus(searchBox.value);
                return;
            } else {
                var newWord = queryToSend.substring(currIndex).split(" ")[0];
                if (newWord.length > 1 && (currIndex === 0 || queryToSend[currIndex - 1] === " ")) {
                    debug("Checking if " + newWord + " appears in " + searchBox.value);
                    if (!(searchBox.value.indexOf(newWord + " ") < 0)) {
                        debug("It\s in");
                        if (searchBox.value.indexOf(newWord, currIndex) >= 0) {
                            debug("We\re movine of " + newWord.length + 1);
                            searchBox.selectionEnd += newWord.length + 1;
                            searchBox.selectionStart = searchBox.selectionEnd;
                        }
                        currIndex += newWord.length;
                        updateStatus(searchBox.value);
                        nextPress = roll(50, 250);
                        window.setTimeout(function() {
                            typeQuery(queryToSend, currIndex, searchBox, chara.slice(), false);
                        }, nextPress);
                        return;
                    }
                }
                chara.push(queryToSend[currIndex]);
                var timers = getTimingArray();
                var textvalue = queryToSend[currIndex];
                window.setTimeout(function() {
                    return downKey(chara, searchBox);
                }, timers[0]);
                window.setTimeout(function() {
                    return pressKey(chara, searchBox);
                }, timers[1]);
                window.setTimeout(function() {
                    return inputChar(chara, searchBox);
                }, timers[2]);
                window.setTimeout(function() {
                    searchBox.value += textvalue;
                }, timers[3]);
                window.setTimeout(function() {
                    return releaseKey(chara, searchBox);
                }, timers[4]);
                updateStatus(searchBox.value);
                currIndex++;
                nextPress = roll(50, 250);
                window.setTimeout(function() {
                    typeQuery(queryToSend, currIndex, searchBox, chara.slice(), false);
                }, nextPress);
            }
        } else {
            updateStatus(searchBox.value);
            nextPress = roll(10, 30);
            if (Math.random() < 0.5)
                window.setTimeout(function() {
                    clickButton();
                }, nextPress);
            else
                window.setTimeout(function() {
                    pressEnter(searchBox);
                }, nextPress);
            // window.setTimeout( sendCurrentURL, nextpress+1)
        }
    }

    function sendCurrentURL() {
        debug("The current url is: " + window.location.href);
        var response = {
            url: window.location.href
        };
        self.port.emit("TMNUpdateURL", response);
    }

    function queryToURL(url, query) {
        if (Math.random() < 0.9)
            query = query.toLowerCase();
        var urlQuery = url.replace('|', query);
        urlQuery = urlQuery.replace(/ /g, '+');
        var encodedUrl = encodeURI(urlQuery);
        encodedUrl = encodedUrl.replace(/%253/g, "%3");

        return encodedUrl;
    }


    function sendQuery(queryToSend, tmn_mode, url) {
        var host;
        try {
            host = window.location.host;
        } catch (ex) {
            host = "";
        }
        var reg = new RegExp(engine.host, 'g');
        var encodedUrl = queryToURL(url, queryToSend);
        var logEntry = JSON.stringify({
            'type': 'query',
            "engine": engine.id,
            'mode': tmn_mode,
            'query': queryToSend,
            'id': tmn_id
        });
        _log(logEntry);
        updateStatus(queryToSend);
        if (host === "" || !host.match(reg)) {
            try {
                window.location.href = encodedUrl;
                return encodedUrl;
            } catch (ex) {
                cout("Caught exception: " + ex);
                self.port.emit("TMNSetTabUrl", {
                    "url": encodedUrl
                });
                return null;
            }

        } else {
			var searchButton= null;
			var searchBox = null; 
			if ( js_from_engines[engine.id] && js_from_engines[engine.id].button)
             searchButton = js_from_engines[engine.id].button();
            if (js_from_engines[engine.id] && js_from_engines[engine.id].box)
             searchBox =js_from_engines[engine.id].box();
            if (searchBox && searchButton && engine.id !== 'aol') {
                debug("The searchbox has been found " + searchBox);
                searchBox.value = getCommonWords(searchBox.value, queryToSend).join(' ');
                searchBox.selectionStart = 0;
                searchBox.selectionEnd = 0;
                var chara = new Array();
                typeQuery(queryToSend, 0, searchBox, chara, false);
                return null;
            } else {
                tmnCurrentURL = encodedUrl;
                debug("The searchbox can not be found ");
                try {
                    window.location.href = encodedUrl;
                    return encodedUrl;
                } catch (ex) {
                    cout("Caught exception: " + ex);
                    self.port.emit("TMNSetTabUrl", {
                        "url": encodedUrl
                    });
                    return null;
                }

            }
        }
    }





    function sendPageLoaded() {
        var req = {
            tmn: "pageLoaded",
            html: window.document.body.innerHTML
        };
        self.port.emit("TMNRequest", req);
    }


    function _log(msg) {
        var req = {
            tmnLog: msg
        };
        self.port.emit("TMNRequest", req);
    }

    function updateStatus(msg) {
        var req = {
            updateStatus: msg
        };
        self.port.emit("TMNRequest", req);
    }


    function setTMNCurrentURL(url) {
        tmnCurrentURL = url;
        debug("Current TMN loc: " + tmnCurrentURL);
        var message = {
            url: tmnCurrentURL
        };
        self.port.emit("TMNUpdateURL", message);
        sendPageLoaded();
    }


    return {
        clickResult: function(request) {
            cout("Clicking on engine : " + request.tmn_engine.id);
            simulateClick(request.tmn_engine); },
        handleRequest: function(request) {
            debug("Received: " + request.tmnQuery + " on engine: " + request.tmnEngine + " mode: " + request.tmnMode);
            if (request.tmnQuery) {
                var tmn_query = request.tmnQuery;
                engine = request.tmnEngine;
                all_engines = request.allEngines;
                var tmn_mode = request.tmnMode;
                tmn_id = request.tmnID;
                var tmn_URLmap = request.tmnUrlMap;
                var encodedurl = sendQuery(tmn_query, tmn_mode, tmn_URLmap);
                if (encodedurl !== null) {
                    debug("scheduling next set url");
                    setTMNCurrentURL(encodedurl);
                }
            }
            return; // snub them.
        }
    };
}();



self.port.on("TMNTabRequest", TRACKMENOT.TMNInjected.handleRequest);
self.port.on("TMNClickResult", TRACKMENOT.TMNInjected.clickResult);

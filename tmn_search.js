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

var api;
if (chrome === undefined) {
    api = browser;
} else {
    api = chrome;
}

if (!TRACKMENOT)
    var TRACKMENOT = {};


TRACKMENOT.TMNInjected = function() {
    var debug_script = false;

    var tmn = null;
    var tmn_id = 0;
    var tmnCurrentURL = '';
    var engine = '';
    //    var allEvents = ['blur','change','click','dblclick','DOMMouseScroll','focus','keydown','keypress','keyup','load','mousedown','mousemove','mouseout','mouseover','mouseup','select'];





    var testAd_google = function(anchorClass, anchorlink) {
        return (anchorlink
                && (anchorClass === 'l' || anchorClass == 'l vst')
                && anchorlink.indexOf('http') == 0
                && anchorlink.indexOf('https') != 0);
    }

    var testAd_yahoo = function(anchorClass, anchorlink) {
        return (anchorClass == '\"yschttl spt\"' || anchorClass == 'yschttl spt');
    }

    var testAd_aol = function(anchorClass, anchorlink) {
        return (anchorClass == '\"find\"' || anchorClass == 'find'
                && anchorlink.indexOf('https') != 0 && anchorlink.indexOf('aol') < 0);
    }

    var testAd_bing = function(anchorClass, anchorlink) {
        return (anchorlink
                && anchorlink.indexOf('http') == 0
                && anchorlink.indexOf('https') != 0
                && anchorlink.indexOf('msn') < 0
                && anchorlink.indexOf('live') < 0
                && anchorlink.indexOf('bing') < 0
                && anchorlink.indexOf('microsoft') < 0
                && anchorlink.indexOf('WindowsLiveTranslator') < 0)
    }

    var testAd_baidu = function(anchorClass, anchorlink) {
        return (anchorlink
                && anchorlink.indexOf('baidu') < 0
                && anchorlink.indexOf('https') != 0);
    }

    var getButton_google = function(  ) {
        var button = getElementsByAttrValue(document, 'button', 'name', 'btnG');
        if (!button)
            button = getElementsByAttrValue(document, 'button', 'name', 'btnK');
        return button;
    }
    var getButton_yahoo = function(  ) {
        return getElementsByAttrValue(document, 'input', 'class', 'sbb');
    };
    var getButton_bing = function(  ) {
        return document.getElementById('sb_form_go');
    };
    var getButton_aol = function(  ) {
        return document.getElementById('csbbtn1');
    };
    var getButton_baidu = function(  ) {
        return getElementsByAttrValue(document, 'input', 'value', '????');
    };



    var SearchBox_google = function( ) {
        return getElementsByAttrValue(document, 'input', 'name', 'q');
    };
    var SearchBox_yahoo = function(  ) {
        return document.getElementById('yschsp');
    };
    var SearchBox_bing = function(  ) {
        return document.getElementById('sb_form_q');
    };
    var SearchBox_aol = function(  ) {
        return document.getElementById('csbquery1');
    };
    var SearchBox_baidu = function(  ) {
        return document.getElementById('kw');
    };

    var get_box = function(engine_id) {
        switch (engine_id) {
            case 'google':
                return SearchBox_google();
                break;
            case 'yahoo':
                return SearchBox_yahoo();
                break;
            case 'bing':
                return SearchBox_bing();
                break;
            case 'baidu':
                return SearchBox_baidu();
                break;
            case 'aol':
                return SearchBox_aol();
                break;
            default:
                return null;
        }
    };

    var get_button = function(engine_id) {
        switch (engine_id) {
            case 'google':
                return getButton_google();
                break;
            case 'yahoo':
                return getButton_yahoo();
                break;
            case 'bing':
                return getButton_bing();
                break;
            case 'baidu':
                return getButton_baidu();
                break;
            case 'aol':
                return getButton_aol();
                break;
            default:
                return null;
        }
    };


    var engines_regex = [
        {
            'id': 'google',
            'name': 'Google Searchs',
            "host": "(www\.google\.(co\.|com\.)?[a-z]{2,3})$",
            'regexmap': "^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$"
        },
        {
            'id': 'yahoo',
            'name': 'Yahoo! Search',
            "host": "([a-z.]*?search\.yahoo\.com)$",
            'regexmap': "^(https?:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$"
        },
        {
            'id': 'bing',
            'name': 'Bing Search',
            "host": "(www\.bing\.com)$",
            'regexmap': "^(https?:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$"

        },
        {
            'id': 'baidu',
            'name': 'Baidu Search',
            "host": "(www\.baidu\.com)$",
            'regexmap': "^(https?:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$"

        },
        {
            'id': 'aol',
            'name': 'Aol Search',
            "host": "([a-z0-9.]*?search\.aol\.com)$",
            'regexmap': "^(https?:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$"
        }
    ];
    function roll(min, max) {
        return Math.floor(Math.random() * (max + 1)) + min;
    }
    function trim(s) {
        return s.replace(/\n/g, '');
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
        var evtDown = new KeyboardEvent("keydown", {"keyCode": 13});
        window.setTimeout(function() {
            elt.dispatchEvent(evtDown);
        }, timers[0]);
        var evtPress = new KeyboardEvent("keypress", {"keyCode": 13});
        window.setTimeout(function() {
            elt.dispatchEvent(evtPress);
        }, timers[1]);
        var evtUp = new KeyboardEvent("keyup", {"keyCode": 13});
        window.setTimeout(function() {
            elt.dispatchEvent(evtUp);
        }, timers[2]);
        window.setTimeout(sendPageLoaded, timers[3])
    }
    ;




    function downKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtDown = new KeyboardEvent("keydown", {"charCode": charCode});
        searchBox.dispatchEvent(evtDown);
    }

    function pressKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtPress = new KeyboardEvent("keypress", {"charCode": charCode});
        searchBox.dispatchEvent(evtPress);
    }

    function inputChar(chara, searchBox) {
        var ev = document.createEvent("Event");
        ev.initEvent("input", true, false);
        searchBox.dispatchEvent(ev);
    }

    function releaseKey(chara, searchBox) {
        var charCode = chara[chara.length - 1].charCodeAt(0);
        var evtUp = new KeyboardEvent("keyup", {"charCode": charCode});
        searchBox.dispatchEvent(evtUp);
    }

    function simulateClick(engine) {
        var clickIndex = roll(0, 9);
        if (!document || document == "undefined")
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
            var link = stripTags(pageLinks[i].innerHTML);
            if (engine.testad(id, anchorClass, anchorLink)) {
                j++;
                if (j === clickIndex) {
                    var logEntry = JSON.stringify({
                        'type': 'click',
                        "engine": engine.id,
                        'query': link,
                        'id': tmn_id
                    });
                    log(logEntry);
                    try {
                        clickElt(pageLinks[i]);
                        debug("link clicked");
                    } catch (e) {
                        alert("error opening click-through request for " + e);
                    }
                    return;
                }
            }
        }
    }



    function clickButton() {
        var button = get_button(engine.id, document);
        clickElt(button);
        debug("send page loaded");
        sendPageLoaded();
    }



    function clickElt(elt) {
        if (!elt)
            return;
        var timers = getTimingArray();
        var evtDown = new MouseEvent("mousedown");
        window.setTimeout(function() {
            elt.dispatchEvent(evtDown);
        }, timers[0]);
        var evtUp = new MouseEvent("mouseup");
        window.setTimeout(function() {
            elt.dispatchEvent(evtUp);
        }, timers[1]);
        var evtCl = new MouseEvent("click");
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
                    cout("Checking if " + newWord + " appears in " + searchBox.value);
                    if (!(searchBox.value.indexOf(newWord + " ") < 0)) {
                        cout("It\s in");
                        if (searchBox.value.indexOf(newWord, currIndex) >= 0) {
                            cout("We\re movine of " + newWord.length + 1);
                            searchBox.selectionEnd += newWord.length + 1;
                            searchBox.selectionStart = searchBox.selectionEnd;
                        }
                        currIndex += newWord.length;
                        updateStatus(searchBox.value);
                        nextPress = roll(50, 250);
                        window.setTimeout(typeQuery, nextPress, queryToSend, currIndex, searchBox, chara.slice(), false);
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
                window.setTimeout(typeQuery, nextPress, queryToSend, currIndex, searchBox, chara.slice(), false);
            }
        } else {
            updateStatus(searchBox.value);
            nextPress = roll(10, 30);
            if (Math.random() < 0.5)
                window.setTimeout(clickButton, nextPress);
            else
                window.setTimeout(pressEnter, nextPress, searchBox);
            // window.setTimeout( sendCurrentURL, nextpress+1)
        }
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


    function sendQuery(engine, queryToSend, tmn_mode, url) {
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
        log(logEntry);
        updateStatus(queryToSend);
        if (host === "" || !host.match(reg)) {
            try {
                window.location.href = encodedUrl;
                return encodedUrl;
            } catch (ex) {
                cout("Caught exception: " + ex);
                api.runtime.sendMessage({
                    "url": encodedUrl
                });
                return null;
            }

        } else {
            var searchBox = get_box(engine.id);
            var searchButton = get_button(engine.id);
            if (searchBox && searchButton && engine !== 'aol') {
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
                    api.runtime.sendMessage({
                        "url": encodedUrl
                    });
                    return null;
                }

            }
        }
    }

    function updateURLRegexp(eng, url) {
        var regex = regexMap[eng];
        cout("  regex: " + regex + "  ->\n                   " + url);
        result = url.match(regex);

        if (!result) {
            cout("Can't find a regexp matching searched url");
            return false;
        }

        cout("updateURLRegexp");

        if (result.length !== 4) {
            if (result.length === 6 && eng === "google") {
                result.splice(2, 2);
                result.push(eng);
            }
            cout("REGEX_ERROR: " + url);
            for (var i in result)
                cout(" **** " + i + ")" + result[i]);
        }

        // -- EXTRACT DATA FROM THE URL
        var pre = result[1];
        var post = result[3];
        var asearch = pre + '|' + post;


        if (eng == "google" && !url.match("^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z^\/]{2,3}\/(search){1}\?.*?[&\?]{1}q=)([^&]*)(.*)$") || url.indexOf("sclient=psy-ab") > 0 || url.indexOf("#") > 0)
            return true;
        // -- NEW SEARCH URL: ADD TO USER_MAP
        if (asearch) {
            setCurrentURLMap(eng, asearch);
        }

        return true;
    }



    function isSafeHost(host) {
        for (var i = 0; i < engines_regex.length; i++) {
            var eng = engines_regex[i];
            var regex = eng.hostMap;
            cout("regex :" + regex);
            if (host.match(regex)) {
                return true;
            }
        }
        return false;
    }



    function sendPageLoaded() {
        var req = {
            "tmn": "pageLoaded",
            "html": document.defaultView.document.body.innerHTML
        };
        api.runtime.sendMessage(req);
    }


    function log(msg) {
        api.runtime.sendMessage({tmnLog: msg});
    }

    function updateStatus(msg) {
        var req = {
            "updateStatus": msg
        };
        api.runtime.sendMessage(req);
    }

    function setCurrentURLMap(eng, url) {
        var Eng_URL = eng + "--" + url;
        var req = {
            setURLMap: Eng_URL
        };
        api.runtime.sendMessage(req);
    }

    function getTMNCurrentURL() {
        api.runtime.sendMessage({
            tmn: "currentURL"
        },
        function(response) {
            setTMNCurrentURL(response.url);
        });
    }

    function setTMNCurrentURL(url) {
        tmnCurrentURL = url;
        debug("Current TMN loc: " + tmnCurrentURL);
        var message = {
            "url": tmnCurrentURL
        };
        api.runtime.sendMessage(message);
        sendPageLoaded();
    }


    return {
        handleRequest: function(request, sender, sendResponse) {

            if (request.tmnQuery) {
                if (tmn_id >= request.tmnID) {
                    debug("Duplicate queries ignored");
                    return;
                }
                debug("Received: " + request.tmnQuery + " on engine: " + request.tmnEngine.id + " mode: " + request.tmnMode + " tmn id " + request.tmnID);
                var tmn_query = request.tmnQuery;
                var engine = request.tmnEngine;
                all_engines = request.allEngines;
                var tmn_mode = request.tmnMode;
                tmn_id = request.tmnID;
                var tmn_URLmap = request.tmnUrlMap;
                var encodedurl = sendQuery(engine, tmn_query, tmn_mode, tmn_URLmap);
                if (encodedurl !== null) {
                    debug("scheduling next set url");
                    setTMNCurrentURL(encodedurl);
                }
            }
            if (request.click_eng) {
                cout("Clicking on engine : " + request.click_eng);
                simulateClick(request.click_eng);
            }
            return; // snub them.
        },
        checkIsActiveTab: function() {
            api.runtime.sendMessage({
                tmn: "isActiveTab"
            }, function(response) {
                if ( response && response.isActive) {
                    cout('Message sent from active tab');
                    TRACKMENOT.TMNInjected.hasLoaded();
                }
            });
       },
        hasLoaded: function() {
            var host = window.location.host;
            if (!isSafeHost(host)) {
                cout("Host " + host + " is unsafe");
                window.stop();
                //history.go(-1);
            }
            //  sendPageLoaded();
            getTMNCurrentURL();
        }
    };
}();
TRACKMENOT.TMNInjected.checkIsActiveTab();
api.runtime.onMessage.addListener(TRACKMENOT.TMNInjected.handleRequest);



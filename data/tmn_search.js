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

if(!TRACKMENOT) var TRACKMENOT = {};
  

TRACKMENOT.TMNInjected = function() { 
    var debug_script = true;

    var tmn =null;
    var tmn_id = 0;
    var tmnCurrentURL = '';
    var engine = '';
    //    var allEvents = ['blur','change','click','dblclick','DOMMouseScroll','focus','keydown','keypress','keyup','load','mousedown','mousemove','mouseout','mouseover','mouseup','select'];

    function roll(min,max){
        return Math.floor(Math.random()*(max+1))+min;
    }
    function trim(s)  {
        return s.replace(/\n/g,'');
    }
    function cout (msg) {
        console.log(msg);
    }  
    function debug (msg) {
        if (debug_script)
            console.log("Debug: "+msg);
    }

  	function getEngineById( id) {
		return engines.filter(function(a) {return a.id ==id})[0] 
	}

    function stripPhrases(htmlStr)  {
        var reg = /(<b>(.+)<\/b>)/mig;
        var strip = reg.exec(htmlStr);
        return strip[0];
    }
    
    function stripTags(htmlStr) {
        return htmlStr.replace(/(<([^>]+)>)/ig,"");
    }


	
	
    function pressEnter(elt) {
        var timers =  getTimingArray(); 
        var evtDown = document.createEvent("KeyboardEvent");
        evtDown.initKeyEvent( "keydown", true, true, unsafeWindow, false, false, false, false, 13, 0 );  
        window.setTimeout(function(){
            elt.dispatchEvent(evtDown);
        },timers[0])  
        var evtPress= document.createEvent("KeyboardEvent"); 
        evtPress.initKeyEvent( "keypress", true, true, unsafeWindow, false, false, false, false, 13, 0 ); 
        window.setTimeout(function(){
            elt.dispatchEvent(evtPress);
        },timers[1])  
        var evtUp = document.createEvent("KeyboardEvent");  
        evtUp.initKeyEvent( "keyup", true, true, unsafeWindow, false, false, false, false, 13, 0 );        
        window.setTimeout(function(){
            elt.dispatchEvent(evtUp);
        },timers[2])    
        window.setTimeout(sendPageLoaded,timers[3])    	
    }
   
   

   
    function downKey(chara, searchBox) {
        var charCode = chara[chara.length-1].charCodeAt(0)
        var evtDown = document.createEvent("KeyboardEvent");
        evtDown.initKeyEvent( "keydown", true, true, unsafeWindow, false, false, false, false, 0, charCode );   
        searchBox.dispatchEvent(evtDown)	
    }
    
    function pressKey(chara, searchBox) {
        var charCode = chara[chara.length-1].charCodeAt(0)
        var evtPress = document.createEvent("KeyboardEvent");
        evtPress.initKeyEvent( "keypress", true, true, unsafeWindow, false, false, false, false, 0, charCode );   
        searchBox.dispatchEvent(evtPress)	
    }
    
    function inputChar(chara, searchBox) {
        var ev = document.createEvent("Event");
        ev.initEvent("input", true, false);
        searchBox.dispatchEvent(ev);
    }
    
    function releaseKey(chara, searchBox) { 
        var charCode = chara[chara.length-1].charCodeAt(0)
        var evtUp = document.createEvent("KeyboardEvent");
        evtUp.initKeyEvent( "keyup", true, true, unsafeWindow, false, false, false, false, 0, charCode ); 
        searchBox.dispatchEvent(evtUp)	
    }

    function simulateClick( engine ) {
     
        var clickIndex = roll(0,9);   
        if ( !document || document == "undefined" ) return;
        var pageLinks = document.getElementsByTagName("a");
      
        cout( 'There are ' + pageLinks.length + ' on the result page'  );
      
        var j = 0;
        for ( var i = 0; i < pageLinks.length; i++) {
            if (pageLinks[i].hasAttribute("orighref")) 
                anchorLink = pageLinks[i].getAttribute("orighref");
            else 
                anchorLink = pageLinks[i].getAttribute("href");
            anchorClass = pageLinks[i].getAttribute("class");
            var link = stripTags(pageLinks[i].innerHTML);
			eval (engine.testad)
            if ( testad && testad(anchorClass,anchorLink) ) {  
                j++
                if ( j == clickIndex ) {
                    var logEntry = JSON.stringify({
                        'type' : 'click', 
                        "engine" : engine,  
                        'query' : link, 
                        'id':tmn_id
                    });
                    _log(logEntry)	        
                    try {     
                        clickElt(pageLinks[i])
                        debug("link clicked")                               
                    } catch (e) {
                        alert("error opening click-through request for " + e);
                    }
                    return;
                }
            } 
        }   
    }   
    
	 
 
    function clickButton() {  
		eval(engine.button) 
        var button = getButton(document)
        clickElt(button);	
        debug("send page loaded")
        sendPageLoaded();
    }
  

  
    function clickElt(elt) {
        var win = unsafeWindow;
        if ( !elt) return;
        var timers =  getTimingArray(); 
        var evtDown = document.createEvent("MouseEvents");
        evtDown.initMouseEvent("mousedown",true,true,win,0, 0, 0, 0, 0, false, false, false, false, 0, null);     
        window.setTimeout(function(){
            elt.dispatchEvent(evtDown);
        },timers[0]) 
        var evtUp = document.createEvent("MouseEvents");
        evtUp.initMouseEvent("mouseup",true, true,win,0,0,0,0,0, false, false, false, false, 0, null);        
        window.setTimeout(function(){
            elt.dispatchEvent(evtUp);
        },timers[1])     
        var evtCl = document.createEvent("MouseEvents");
        evtCl.initMouseEvent("click",true, true,win,0,0,0,0, 0, false, false, false, false, 0, null);     
        window.setTimeout(function(){
            elt.dispatchEvent(evtCl);
        },timers[2])        
                              
    }
 
 

    function getElementsByAttrValue(dom,nodeType,attrName,nodeValue) {
        var outlines = dom.getElementsByTagName(nodeType);
        for (var i = 0; i<outlines.length;i++) {
            if (outlines[i].hasAttribute(attrName) && outlines[i].getAttribute(attrName) == nodeValue )  
                return outlines[i];
        }
        return null;
    }


  	        
  	        
    function getElement(doc,aID){ 
        return (doc.getElementById) ? doc.getElementById(aID): doc.all[aID];
    } 


	
    function getQuerySuggestion() {
        var suggestFilter =  suggest_filters[engine];
        var searchTable = getElement(document,suggestFilter[0]);
        if ( !searchTable) return [];
        var sublines = searchTable.getElementsByTagName(suggestFilter[1]);
        var suggestElts = [];
        for ( var i=0; i< sublines.length; i++) {
            var line =  sublines[i];
            if( suggestFilter[2](line) ) 
                suggestElts.push(line);
        }
        var suggestions = suggestElts.map(function(x) {
            return stripTags(x.innerHTML)
        });
        debug( 'TMN: ' +suggestions)
        return suggestElts.slice();
    }
  
  
    function getCommonWords(searchValue, nextQuery) {
        var searched = searchValue.split(' ');
        var tosearch = nextQuery.split(' ');
        var result =  [];
        result = result.concat(searched.filter(function(x) {
            return (tosearch.indexOf(x)>=0)
        }));
        return result;
    }
    
    function getTimingArray() {
        var timers = [];
        for (var i=0; i<5; i++) {
            timers.push(Math.floor(Math.random()*30))
        }
        return timers.sort();
    }
  
  
  
    function typeQuery( queryToSend, currIndex, searchBox, chara,isIncr ) { 
        var nextPress ;
        tmnCurrentQuery = queryToSend;
        
        clickElt(searchBox);
        searchBox.focus();
        if (currIndex < queryToSend.length  ) {
            // var suggestElt = getQuerySuggestion(doc);	
            if ( false && Math.random() < 0.02 && suggestElt.length >0 ) {
                var index_ =  roll(0,suggestElt.length-1);
                selectElt(suggestElt[index_],searchBox);
                clickElt(suggestElt[index_]);
                blurElt(searchBox);
                updateStatus(searchBox.value);
                return;
            } else {   
                var newWord = queryToSend.substring(currIndex).split(" ")[0];
                if ( newWord.length>1 && ( currIndex == 0 || queryToSend[currIndex-1]==" ") ) {
                    cout("Checking if "+newWord + " appears in "+searchBox.value)
                    if (! (searchBox.value.indexOf(newWord+" ")<0) ) {
                    cout("It\s in")
                      if( searchBox.value.indexOf(newWord, currIndex)>=0 ) { 
                           cout("We\re movine of "+ newWord.length+1 )                       
                          searchBox.selectionEnd+= newWord.length+1;
                          searchBox.selectionStart =searchBox.selectionEnd;
                      } 
                      currIndex+= newWord.length;
                      updateStatus(searchBox.value);
                      nextPress = roll(50,250);
                      window.setTimeout(typeQuery, nextPress, queryToSend,currIndex,searchBox,chara.slice() ,false  )  
                      return;
                    }
                }   
                chara.push(queryToSend[currIndex])
                var timers =  getTimingArray();
                var textvalue = queryToSend[currIndex];
                window.setTimeout( function(){
                    return downKey(chara, searchBox)
                    }, timers[0]);
                window.setTimeout( function(){
                    return pressKey(chara, searchBox)
                    }, timers[1]); 
                window.setTimeout( function(){
                    return inputChar(chara, searchBox)
                    }, timers[2]);   
                window.setTimeout( function(){
                    searchBox.value += textvalue
                    }, timers[3]);   
                window.setTimeout( function(){
                    return releaseKey( chara, searchBox)
                    }, timers[4]);   
                updateStatus(searchBox.value);
                currIndex++
                nextPress = roll(50,250);             
                window.setTimeout(typeQuery, nextPress, queryToSend,currIndex,searchBox,chara.slice(),false  )
            }
        } else {
            updateStatus(searchBox.value);
            nextPress = roll(10,30);
            if (Math.random() <0.5) window.setTimeout( clickButton, nextPress); 
            else window.setTimeout(pressEnter, nextPress, searchBox)
        // window.setTimeout( sendCurrentURL, nextpress+1)
        }
    }
    
    function sendCurrentURL() {
        debug("The current url is: " +window.location.href)
        var response = {
            url: window.location.href
        }; 
        self.port.emit("TMNUpdateURL",response);      
    }
    
    function queryToURL ( url, query) {
        if (Math.random() < 0.9)
            query = query.toLowerCase();
        var urlQuery = url.replace('|',query);
        urlQuery = urlQuery.replace(/ /g,'+');
        var encodedUrl = encodeURI(urlQuery);
        encodedUrl = encodedUrl.replace(/%253/g,"%3"); 
        
        return encodedUrl;
    }

  
    function sendQuery(queryToSend, tmn_mode, url)  {
        var host;
        try {
            host = window.location.host;
        } catch (ex) {
            host = "";
        } 
        var reg = new RegExp(engine.host,'g')  
        var encodedUrl = queryToURL(url, queryToSend)
        var logEntry = JSON.stringify({
            'type' : 'query', 
            "engine" : engine.id, 
            'mode' : tmn_mode, 
            'query' : queryToSend, 
            'id' : tmn_id
        });
        _log(logEntry)
        updateStatus(queryToSend);
        if ( host =="" || !host.match(reg) ) {
            try { 
                window.location.href = encodedUrl;     
                return encodedUrl;	
            } catch (ex) {
                cout("Caught exception: "+ ex);
                self.port.emit("TMNSetTabUrl", {
                    "url": encodedUrl
                });
                return null;
            }
			
        } else {
			if (engine.button) eval(engine.button) 
			if (engine.box) eval(engine.box) 
            var searchBox = engine.box ? searchbox() : null;
            var searchButton = engine.button ? getButton() : null;
            if ( searchBox && searchButton && engine!='aol' ) {
                debug("The searchbox has been found "+searchBox ) 
                searchBox.value = getCommonWords(searchBox.value,queryToSend).join(' '); 
                searchBox.selectionStart = 0;    
                searchBox.selectionEnd = 0;         
                var chara = new Array();
                typeQuery( queryToSend, 0, searchBox, chara,false );
                return null;
            } else {                  
                tmnCurrentURL =  encodedUrl;
                debug("The searchbox can not be found " )
                try {
                    window.location.href = encodedUrl;
                    return encodedUrl;					
                } catch (ex) {
                    cout("Caught exception: "+ ex);
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
            html: unsafeWindow.document.body.innerHTML
        }
        self.port.emit("TMNRequest",req); 
    } 
    
     
    function _log(msg) {
        var req = {
            tmnLog: msg
        }
        self.port.emit("TMNRequest",req); 
    }
     
    function updateStatus(msg) {
        var req = {
            updateStatus: msg
        } 
        self.port.emit("TMNRequest",req); 
    }     

    function setCurrentURLMap( eng, url ) {
        var Eng_URL = eng + "--" + url; 
        var req = {
            setURLMap: Eng_URL
        } 
        self.port.emit("TMNRequest",req); 
    }
     
     
	
    function setTMNCurrentURL(url) {
        tmnCurrentURL=  url;     
        debug("Current TMN loc: "+ tmnCurrentURL )
        var message = {
            url: tmnCurrentURL
        };
        self.port.emit("TMNUpdateURL", message);
        sendPageLoaded();
    }

  	  	
    return {
  

        clickResult : function(request) {
            cout("Clicking on engine : "+request.tmn_engine )
            simulateClick(request.tmn_engine);
        },
        
  
        handleRequest : function(request) {
            debug("Received: "+ request.tmnQuery + " on engine: "+ request.tmnEngine + " mode: " +request.tmnMode)
            if (request.tmnQuery) {       
                var tmn_query = request.tmnQuery; 
                engine = request.tmnEngine;
				all_engines = request.allEngines;
                var tmn_mode = request.tmnMode;
                tmn_id = request.tmnID;
                var tmn_URLmap = request.tmnUrlMap;
                var encodedurl = sendQuery ( tmn_query, tmn_mode, tmn_URLmap ); 
                if (encodedurl != null) {
                    debug("scheduling next set url");				
                    setTMNCurrentURL(encodedurl);
                }
            }
            return; // snub them.
        } ,
        

    }
}();



self.port.on("TMNTabRequest",  TRACKMENOT.TMNInjected.handleRequest  );      
self.port.on("TMNClickResult",  TRACKMENOT.TMNInjected.clickResult  );

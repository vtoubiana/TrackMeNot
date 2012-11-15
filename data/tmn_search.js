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
    var useTab = false;
    var searchScheduled = false;
    var tmnCurrentQuery = '';
    var tmn =null;
    var tmn_id = 0;
    var tmnCurrentURL = '';
    var engine = '';
    //    var allEvents = ['blur','change','click','dblclick','DOMMouseScroll','focus','keydown','keypress','keyup','load','mousedown','mousemove','mouseout','mouseover','mouseup','select'];
    //    var tmn_timer = null; 
    var hostMap = {
        google : "(www\.google\.(co\.|com\.)?[a-z]{2,3})$",      
        yahoo :  "([a-z.]*?search\.yahoo\.com)$",
        bing : "(www\.bing\.com)$",
        baidu : "(www\.baidu\.com)$",
        aol : "([a-z0-9.]*?search\.aol\.com)$"
    }
    
    var  regexMap = {
        google : "^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$",      
        yahoo :  "^(http:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$",
        bing : "^(http:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$",
        aol : "^(http:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$",
        baidu : "^(http:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$",
        ask : "^(http:\/\/www\.ask\.com\/web\?.*?q=)([^&]*)(.*)$"
    }
      	
  

    
    	
    var getButtonMap = {
        google : function( doc ) { 
            var button = getElementsByAttrValue(doc,'button', 'name', "btnG" );
            if ( !button ) button = getElementsByAttrValue(doc,'button', 'name', "btnK" );
            return button;
        },         
        yahoo:   function( doc ) {   
            return getElementsByAttrValue(doc,'input', 'class', "sbb" );        
        },          
        bing:    function( doc ) {
            return doc.getElementById('sb_form_go');             
        },        
        aol:  function( doc ) {
            return doc.getElementById('csbbtn1');           
        },
        baidu:  function( doc ) {      
            return getElementsByAttrValue(doc,'input', 'value', "????" );           
        }           
    }
  
  
    var suggest_filters = {
        google :  ['gsr' , 'td', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'gac_c' )
        }],
        yahoo : ['atgl' , 'a', function ( elt ) {
            return elt.hasAttribute('gossiptext')
        }],
        bing : ['sa_drw' , 'li', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'sa_sg' )
        }],
        baidu : ['st' , 'tr', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'ml' )
        }],
        aol : ['ACC' , 'a', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'acs')
        }]
    }
  	        
    var  getSearchBoxMap = {
        google : function( doc ) { 
            //alert(doc.body.innerHTML)
            return getElementsByAttrValue(doc,'input', 'name', "q" );        
        },         
        yahoo:   function( doc ) {   
            return doc.getElementById('yschsp');       
        },          
        bing:    function( doc ) {
            return doc.getElementById('sb_form_q');       
        },        
        aol:  function( doc ) {
            return doc.getElementById('csbquery1');            
        },
        baidu:  function( doc ) {
            return doc.getElementById('kw');            
        }         
    }
    

     
    function updateURLRegexp( eng, url) {
        var regex = regexMap[eng];
        _cout("  regex: "+regex+"  ->\n                   "+url);
        result = url.match(regex);
        _cout("updateURLRegexp") 
        if (!result) {
            _cout("Can't find a regexp matching searched url")
            return false;
        }
        
        if (result.length !=4 ){
            if (result.length ==6 && eng == "google" ) {
                result.splice(2,2);
                result.push(eng);
            }
            _cout("REGEX_ERROR: "+url);
            for (var i in result)
                _cout(" **** "+i+")"+result[i])
        }

        // -- EXTRACT DATA FROM THE URL
        var pre   = result[1];
        var post  = result[3];
        var asearch  = pre+'|'+post; 
 
 
        if(eng=="google" && !url.match("^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z^\/]{2,3}\/(search){1}\?.*?[&\?]{1}q=)([^&]*)(.*)$") || url.indexOf("sclient=psy-ab")>0 || url.indexOf("#")>0 )
            return true;
        // -- NEW SEARCH URL: ADD TO USER_MAP
        if (asearch ){
            setCurrentURLMap(eng, asearch);
        } 
        
        return true;
    }
 


    function roll(min,max){
        return Math.floor(Math.random()*(max+1))+min;
    }
    function trim(s)  {
        return s.replace(/\n/g,'');
    }
    function _cout (msg) {
        console.log(msg);
    }
    function charOk(ch)  {
        var bad = new Array(9,10,13,32);
        for (var i = 0;i < bad.length; i++)
            if (ch==bad[i]) return false;
        return true;
    }
  

    function stripPhrases(htmlStr)  {
        var reg = /(<b>(.+)<\/b>)/mig;
        var strip = reg.exec(htmlStr);
        return strip[0];
    }

 
    function isSafeHost( host ) {
        for  (var eng in hostMap) {
            var reg = new RegExp(hostMap[eng],'g')
            if ( host.match(reg) ) 
                return eng;
        }
        return false;
    }
	 
 
    function clickButton(docFrame) {     
        var button = getButtonMap[engine](docFrame)
        clickThroughIfUsingTab();
        clickElt(button);	
        sendPageLoaded();
    }
  

  
    function clickElt(elt) {
        var win = window;
        if ( !elt) return;
        var evtDown = document.createEvent("MouseEvents");
        evtDown.initMouseEvent("mousedown",true,true,win,0, 0, 0, 0, 0, false, false, false, false, 0, null);     
        elt.dispatchEvent(evtDown); 
        var evtUp = document.createEvent("MouseEvents");
        evtUp.initMouseEvent("mouseup",true, true,win,0,0,0,0,0, false, false, false, false, 0, null);     
        elt.dispatchEvent(evtUp);    
        var evtCl = document.createEvent("MouseEvents");
        evtCl.initMouseEvent("click",true, true,win,0,0,0,0, 0, false, false, false, false, 0, null);     
        elt.dispatchEvent(evtCl)                             
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

	
    function dectevnt (evt) {
        tmn._cout('TMN' + evt.target.name+ ':' + evt.type);
        setTimeout(dectTableEvnt,3000,engine, tmn);
    }    
	
    function getQuerySuggestion(doc) {
        var suggestFilter =  suggest_filters[engine];
        var searchTable = getElement(doc,suggestFilter[0]);
        if ( !searchTable) return [];
        var sublines = searchTable.getElementsByTagName(suggestFilter[1]);
        var suggestElts = [];
        for ( var i=0; i< sublines.length; i++) {
            var line =  sublines[i];
            if( suggestFilter[2](line) ) 
                suggestElts.push(line);
        }
        var suggestions = suggestElts.map(function(x) {
            return tmn._stripTags(x.innerHTML)
        });
        //_cout( 'TMN ' +suggestions)
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
  
  
  
    function typeQuery( queryToSend, currIndex, searchBox, chara,doc,isIncr ) {
        var win = window;  
        var nextPress ;
        tmnCurrentQuery = queryToSend;
        console.log("The tab will type: "+queryToSend )
        clickElt(searchBox);
        if (currIndex < queryToSend.length  ) {
            // var suggestElt = getQuerySuggestion(doc);	
            if ( false && Math.random() < 0.02 && suggestElt.length >0 ) {
                var index_ =  roll(0,suggestElt.length-1);
                selectElt(suggestElt[index_],searchBox);
                clickElt(suggestElt[index_]);
                blurElt(searchBox);
                updateStatus( engine, isIncr, tmn._stripTags(suggestElt[index_].innerHTML) );
                return;
            } else {  
          
                if (  currIndex == 0 || queryToSend[currIndex-1]==" " ) {
                    var newWord = queryToSend.substring(currIndex).split(" ")[0];
                    if( searchBox.value.indexOf(newWord)>=0 ) {
                        currIndex+= newWord.length;
                        searchBox.selectionEnd+= newWord.length+1;
                        searchBox.selectionStart =searchBox.selectionEnd;
                        updateStatus(searchBox.value);
                        nextPress = roll(50,250);
                        window.setTimeout(typeQuery, nextPress, queryToSend,currIndex,searchBox,chara.slice(),doc ,false  )
                        return;
                    }
                }     
                searchBox.value += queryToSend[currIndex++];
                nextPress = roll(50,250);
                win.setTimeout(typeQuery, nextPress, queryToSend,currIndex,searchBox,chara.slice(),doc ,false  )
            }
        } else {
            updateStatus(queryToSend);
            nextPress = roll(50,250);
            window.setTimeout( clickButton, nextPress, doc); 
        }
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
        
   
        var host = window.location.host;
        var reg = new RegExp(hostMap[engine],'g')  
        var encodedUrl = queryToURL(url, queryToSend)
        _cout('Set the query UR query: ' +encodedUrl);  
        //chrome.tabs.update(tmn_tab_id, { 'url' : encodedUrl});
        if ( !host.match(reg) || engine!='google') { //for other engine we should fix the URL stuff
            window.location.href = encodedUrl;
            clickThroughIfUsingTab();
        } else {
                var docFrame =  document;
                var searchBox = getSearchBoxMap[engine](docFrame);
                var searchButton = getButtonMap[engine](docFrame);
                // tmn_timer = setTimeout(function() { return tmn._rescheduleOnError();},3*tmn._timeout);
                if ( searchBox && searchButton && engine!='aol' ) {
                    _cout("The searchbox has been found "+searchBox )
                    searchBox.value = getCommonWords(searchBox.value,queryToSend).join(' '); 
                    searchBox.selectionStart = 0;    
                    searchBox.selectionEnd = 0;         
                    var chara = new Array();
                    typeQuery( queryToSend, 0, searchBox, chara,docFrame,false )
                } else {       
                    
                    tmnCurrentURL =  encodedUrl;
                    _cout("The searchbox can not be found " )
                    window.location.href = encodedUrl;
                    clickThroughIfUsingTab();
                }  
        }
        var logEntry = JSON.stringify({
            'type' : 'query', 
            "engine" : engine, 
            'mode' : tmn_mode, 
            'query' : queryToSend, 
            'id' : tmn_id
        });
        _log(logEntry)
        return encodedUrl;	
    } 
    
    function getTMNCurrentURLRes(response) { 
            TRACKMENOT.TMNInjected.setTMNCurrentURL(response.url);
    }
    
    function getTMNCurrentURL() {
        request = {tmn: "currentURL"}
        self.port.emit("TMNREQUEST",request); 
 
    }     
     
    function sendPageLoaded() {
        request = { tmn: "pageLoaded"} 
        self.port.emit("TMNREQUEST",request); 
    } 
    
     
    function _log(msg) {
        request = { tmnLog: msg}
        self.port.emit("TMNREQUEST",request); 
    }
     
    function updateStatus(msg) {
        request = { updateStatus: msg } 
        self.port.emit("TMNREQUEST",request); 
    }     

    function setCurrentURLMap( eng, url ) {
        var Eng_URL = eng + "--" + url; 
        request = {setURLMap: Eng_URL } 
        self.port.emit("TMNREQUEST",request); 
    }
     
     
    function clickThroughIfUsingTabRes(response) {
         if  (response.tmnUseTab && Math.random() < 0.2 )   {
                var timer = 1000 + Math.random()*3000;
                setTimeout( TRACKMENOT.TMNClick.simulateClick, timer, engine, tmn_id ); 
         }
    } 
     
    function clickThroughIfUsingTab() {
        request = {tmn: "useTab" } 
        self.port.emit("TMNREQUEST",request); 
    }
     
    function notifyUserSearch(eng, url) {
        // Here we update the regecxpfpor the queried engine
        updateURLRegexp(eng, url);
        request = {userSearch: eng } 
        self.port.emit("TMNREQUEST",request); 
    }
  	  	
    return {
  
        setTMNCurrentURL : function(url) {
            tmnCurrentURL=  url;
            var loc = document.location.href;               
            _cout("Current TMN loc: "+ tmnCurrentURL + " Current doc loc: " + loc)
            if ( loc == tmnCurrentURL )  {
                sendPageLoaded();
            }
        },
        
        
  
        handleRequest : function(request) {
            if (request.tmnQuery) {       
                var tmn_query = request.tmnQuery; 
                old_engine = engine;
                engine = request.tmnEngine;
                var tmn_mode = request.tmnMode;
                tmn_id = request.tmnID;
                var tmn_URLmap = request.tmnUrlMap;
                var encodedurl = sendQuery ( tmn_query, tmn_mode, tmn_URLmap ); 
                var response = {url: encodedurl }; 
                self.port.emit("TMNUpdateURL",response); 
            }
            return; // snub them.
        } ,
        
        checkIsActiveTabRes: function(response) {
                    if (response.isActive){
                        _cout('Message sent from active tab');
                        TRACKMENOT.TMNInjected.hasLoaded(); 
                    } else {
                        var host = window.location.host; 
                        var eng = isSafeHost(host);
                        if ( eng ) {
                            _cout('User search detected!!');
                            notifyUserSearch(eng, window.location.href);
                        }
                    }
          }, 

  
        checkIsActiveTab : function() { 
            request = {tmn: "isActiveTab" } 
            self.port.emit("TMNREQUEST",request);          
        } , 
  
        hasLoaded :function(){
            var host = window.location.host; 
            if (!isSafeHost(host) ) {
                window.stop();  
                //history.go(-1);
            }
            //  sendPageLoaded();
            getTMNCurrentURL();
        }
    }
}();

self.port.on("useTabRes",TRACKMENOT.TMNInjected.clickThroughIfUsingTabRes);
self.port.on("isActiveRes",TRACKMENOT.TMNInjected.checkIsActiveTabRes );
self.port.on("TMNTabRequest",  TRACKMENOT.TMNInjected.handleRequest  );
self.port.on("TMNCurrentURLRes",TRACKMENOT.TMNInjected.getTMNCurrentURLRes);
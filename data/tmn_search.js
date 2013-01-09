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
      	
  
    var finalUrls = new Array();  
    var testAdMap = {
        google : function(anchorClass,anchorlink) {
            return ( anchorlink
                && anchorClass=='l' 
                && anchorlink.indexOf("http")==0 
                && anchorlink.indexOf('https')!=0);
        },
        yahoo : function(anchorClass,anchorlink) {
            return ( anchorClass=='"yschttl spt"' || anchorClass=='yschttl spt');
        },
        aol : function(anchorClass,anchorlink) {
            return (anchorClass=='"find"' || anchorClass=='find'
                && anchorlink.indexOf('https')!=0 && anchorlink.indexOf('aol')<0 );
        },
        bing : function(anchorClass,anchorlink) {
            return ( anchorlink
                && anchorlink.indexOf('http')==0 
                && anchorlink.indexOf('https')!=0 
                && anchorlink.indexOf('msn')<0 
                && anchorlink.indexOf('live')<0 
                && anchorlink.indexOf('bing')<0 
                && anchorlink.indexOf('microsoft')<0
                && anchorlink.indexOf('WindowsLiveTranslator')<0 );
        },
        baidu : function(anchorClass,anchorlink) {
            return ( anchorlink
                && anchorlink.indexOf('baidu')<0 
                && anchorlink.indexOf('https')!=0  );
        }
    }
  	
  	


    
    	
    var getButtonMap = {
        google : function(  ) { 
            var button = getElementsByAttrValue(document,'button', 'name', "btnG" );
            if ( !button ) button = getElementsByAttrValue(document,'button', 'name', "btnK" );
            return button;
        },         
        yahoo:   function(  ) {   
            return getElementsByAttrValue(document,'input', 'class', "sbb" );        
        },          
        bing:    function(  ) {
            return document.getElementById('sb_form_go');             
        },        
        aol:  function( doc ) {
            return document.getElementById('csbbtn1');           
        },
        baidu:  function(  ) {      
            return getElementsByAttrValue(document,'input', 'value', "????" );           
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
        google : function( ) { 
            //alert(doc.body.innerHTML)
            return getElementsByAttrValue(document,'input', 'name', "q" );        
        },         
        yahoo:   function(  ) {   
            return document.getElementById('yschsp');       
        },          
        bing:    function(  ) {
            return document.getElementById('sb_form_q');       
        },        
        aol:  function(  ) {
            return document.getElementById('csbquery1');            
        },
        baidu:  function(  ) {
            return document.getElementById('kw');            
        }         
    }
    

     
    function updateURLRegexp( eng, url) {
        var regex = regexMap[eng];
        cout("  regex: "+regex+"  ->\n                   "+url);
        result = url.match(regex);
        cout("updateURLRegexp") 
        if (!result) {
            cout("Can't find a regexp matching searched url")
            return false;
        }
        
        if (result.length !=4 ){
            if (result.length ==6 && eng == "google" ) {
                result.splice(2,2);
                result.push(eng);
            }
            cout("REGEX_ERROR: "+url);
            for (var i in result)
                cout(" **** "+i+")"+result[i])
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
    function cout (msg) {
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
    
    function stripTags(htmlStr) {
        return htmlStr.replace(/(<([^>]+)>)/ig,"");
    }

 
    function isSafeHost( host ) {
        for  (var eng in hostMap) {
            var reg = new RegExp(hostMap[eng],'g')
            if ( host.match(reg) ) 
                return eng;
        }
        return false;
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
            if (testAdMap[engine](anchorClass,anchorLink) ) {  
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
                        cout("link clicked")
                    } catch (e) {
                        alert("error opening click-through request for " + e);
                    }
                    return;
                }
            } 
        }   
    }   
    
	 
 
    function clickButton(document) {  
        var button = getButtonMap[engine](document)
        clickElt(button);	
        cout("button clicked")
        window.setTimeout(clickThrough,100);
        cout("send page loaded")
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
        tmn.cout('TMN' + evt.target.name+ ':' + evt.type);
        setTimeout(dectTableEvnt,3000,engine, tmn);
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
        //cout( 'TMN ' +suggestions)
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
        var nextPress ;
        tmnCurrentQuery = queryToSend;

        //clickElt(searchBox);
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
                updateStatus(searchBox.value);
                nextPress = roll(50,250);
                window.setTimeout(typeQuery, nextPress, queryToSend,currIndex,searchBox,chara.slice(),doc ,false  )
            }
        } else {
            updateStatus(searchBox.value);
            nextPress = roll(50,250);
            window.setTimeout( clickButton, nextPress, doc); 
        // window.setTimeout( sendCurrentURL, nextpress+1)
        }
    }
    
    function sendCurrentURL() {
        cout("The current url is: " +window.location.href)
        var response = {url: window.location.href}; 
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
     	var host = window.location.host;
        var reg = new RegExp(hostMap[engine],'g')  
        var encodedUrl = queryToURL(url, queryToSend)
        cout('Set the query URL: ' +encodedUrl + ", host: "+ host);   
        var logEntry = JSON.stringify({
            'type' : 'query', 
            "engine" : engine, 
            'mode' : tmn_mode, 
            'query' : queryToSend, 
            'id' : tmn_id
        });
        _log(logEntry)
        if ( !host.match(reg) ) { //Window.location is not up to date -_-
            window.location.href = encodedUrl;
            updateStatus(queryToSend);
            window.setTimeout(clickThrough,10);
            return encodedUrl;	
        } else {
            var searchBox = getSearchBoxMap[engine]();
            var searchButton = getButtonMap[engine]();
            // tmn_timer = setTimeout(function() { return tmn._rescheduleOnError();},3*tmn._timeout);
            if ( searchBox && searchButton && engine!='aol' ) {
                cout("The searchbox has been found "+searchBox )
                searchBox.value = getCommonWords(searchBox.value,queryToSend).join(' '); 
                searchBox.selectionStart = 0;    
                searchBox.selectionEnd = 0;         
                var chara = new Array();
                typeQuery( queryToSend, 0, searchBox, chara,false );
                return null;
            } else {                  
                tmnCurrentURL =  encodedUrl;
                cout("The searchbox can not be found " )
                window.location.href = encodedUrl;
                window.setTimeout(clickThrough,10);
                return encodedUrl;	
            }  
        }
       
    } 
    

    
    function getTMNCurrentURL() {
        request = {
            tmn: "currentURL"
        }
        self.port.emit("TMNRequest",request); 
 
    }     
     
    function sendPageLoaded() {
        request = {
            tmn: "pageLoaded"
        } 
        self.port.emit("TMNRequest",request); 
    } 
    
     
    function _log(msg) {
        request = {
            tmnLog: msg
        }
        self.port.emit("TMNRequest",request); 
    }
     
    function updateStatus(msg) {
        request = {
            updateStatus: msg
        } 
        self.port.emit("TMNRequest",request); 
    }     

    function setCurrentURLMap( eng, url ) {
        var Eng_URL = eng + "--" + url; 
        request = {
            setURLMap: Eng_URL
        } 
        self.port.emit("TMNRequest",request); 
    }
     
     
    function clickThrough() {
        if  (Math.random() < 20.2 )   {
            var timer = 100 + Math.random()*300;
            setTimeout( function() {
                simulateClick(engine)
                }, timer  ); 
        }
    } 
	
    function setTMNCurrentURL(url) {
        tmnCurrentURL=  url;     
        cout("Current TMN loc: "+ tmnCurrentURL )
        var message = {
            url: tmnCurrentURL
        };
        self.port.emit("TMNUpdateURL", message);
        sendPageLoaded();
    }

  	  	
    return {
  

        
        
  
        handleRequest : function(request) {
            cout("Received: "+ request.tmnQuery + " on engine: "+ request.tmnEngine + " mode: " +request.tmnMode)
            if (request.tmnQuery) {       
                var tmn_query = request.tmnQuery; 
                old_engine = engine;
                engine = request.tmnEngine;
                var tmn_mode = request.tmnMode;
                tmn_id = request.tmnID;
                var tmn_URLmap = request.tmnUrlMap;
                var encodedurl = sendQuery ( tmn_query, tmn_mode, tmn_URLmap ); 
                if (encodedurl != null) {
                    cout("scheduling next set url");				
                    setTMNCurrentURL(encodedurl);
                }

            }
            return; // snub them.
        } ,
        

    }
}();



self.port.on("TMNTabRequest",  TRACKMENOT.TMNInjected.handleRequest  );
self.port.on("TMNCurrentURLRes",TRACKMENOT.TMNInjected.getTMNCurrentURLRes);
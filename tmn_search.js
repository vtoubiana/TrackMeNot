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
if (chrome == undefined) {
		api = browser;
	} else {
		api = chrome;
	}

if(!TRACKMENOT) var TRACKMENOT = {};
  

TRACKMENOT.TMNInjected = function() { 
    var debug_script = true;

    var tmn =null;
    var tmn_id = 0;
    var tmnCurrentURL = '';
    var engine = '';
    //    var allEvents = ['blur','change','click','dblclick','DOMMouseScroll','focus','keydown','keypress','keyup','load','mousedown','mousemove','mouseout','mouseover','mouseup','select'];

    function getYahooId() {
        var id = "A0geu";
        while (id.length < 24) {
            var lower = Math.random() < .5;
            var num = parseInt(Math.random() * 38);
            if (num === 37) {
                id += '_';
                continue;
            }
            if (num === 36) {
                id += '.';
                continue;
            }
            if (num < 10) {
                id += String.fromCharCode(num + 48);
                continue;
            }
            num += lower ? 87 : 55;
            id += String.fromCharCode(num);
        }
        //cout("GENERATED ID="+id);
        return id;
    }
	var testAd_google = function(anchorClass,anchorlink) {
            return ( anchorlink
                && (anchorClass=='l'  || anchorClass=='l vst')
                && anchorlink.indexOf('http')==0 
                && anchorlink.indexOf('https')!=0);
    }
	
	var testAd_yahoo= function(anchorClass,anchorlink) {
           return ( anchorClass=='\"yschttl spt\"' || anchorClass=='yschttl spt');
    }

	var  testAd_aol = function(anchorClass,anchorlink) {
           return (anchorClass=='\"find\"' || anchorClass=='find'
                && anchorlink.indexOf('https')!=0 && anchorlink.indexOf('aol')<0 );
    }
	
	var testAd_bing = function(anchorClass,anchorlink) {
           return ( anchorlink
                && anchorlink.indexOf('http')==0 
                && anchorlink.indexOf('https')!=0 
                && anchorlink.indexOf('msn')<0 
                && anchorlink.indexOf('live')<0 
                && anchorlink.indexOf('bing')<0 
                && anchorlink.indexOf('microsoft')<0
                && anchorlink.indexOf('WindowsLiveTranslator')<0 )    }
	
	var  testAd_baidu = function(anchorClass,anchorlink) {
                       return ( anchorlink
                && anchorlink.indexOf('baidu')<0 
                && anchorlink.indexOf('https')!=0  );
    }
      	
		
	var getButton_google =" var getButton = function(  ) {var button = getElementsByAttrValue(document,'button', 'name', 'btnG' );		if ( !button ) button = getElementsByAttrValue(document,'button', 'name', 'btnK' );return button;}"        
	var getButton_yahoo= " var getButton = function(  ) {return getElementsByAttrValue(document,'input', 'class', 'sbb' ); } "         
	var getButton_bing= " var getButton = function(  ) {return document.getElementById('sb_form_go');}  "     
	var getButton_aol = " var getButton = function (  ) {return document.getElementById('csbbtn1');   }"
	var getButton_baidu = " var getButton = function (  ){ return getElementsByAttrValue(document,'input', 'value', '????' ); }"  


  
  	SearchBox_google = "var searchbox = function( ) { return getElementsByAttrValue(document,'input', 'name', 'q' ); } "       
	 SearchBox_yahoo = "var searchbox = function(  ) { return document.getElementById('yschsp');}"        
	 SearchBox_bing= "var searchbox = function(  ) {return document.getElementById('sb_form_q'); } "      
	 SearchBox_aol= "var searchbox = function(  ) {return document.getElementById('csbquery1');  }"
	 SearchBox_baidu= "var searchbox = function(  ) {return document.getElementById('kw');}"         
    

    var  suggest_google =  ['gsr' , 'td', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'gac_c' )
        }]
        
	var suggest_yahoo = ['atgl' , 'a', function ( elt ) {
            return elt.hasAttribute('gossiptext')
        }]
		
    var suggest_bing = ['sa_drw' , 'li', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'sa_sg' )
        }]
        
	var suggest_baidu = ['st' , 'tr', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'ml' )
        }]
		
	var suggest_aol = ['ACC' , 'a', function ( elt ) {
            return (elt.hasAttribute('class') && elt.getAttribute('class') == 'acs')
        }]

	var engines = [
		{'id':'google','name':'Google Search', 'urlmap':"https://www.google.com/search?hl=en&q=|", 'regexmap':"^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$", "host":"(www\.google\.(co\.|com\.)?[a-z]{2,3})$","testad":"var testad = function(ac,al) {return ( al&& (ac=='l'  || ac=='l vst')&& al.indexOf('http')==0 && al.indexOf('https')!=0);}",'box':SearchBox_google,'button':getButton_google} ,
		{'id':'yahoo','name':'Yahoo! Search', 'urlmap':"http://search.yahoo.com/search;_ylt=" +getYahooId()+"?ei=UTF-8&fr=sfp&fr2=sfp&p=|&fspl=1", 'regexmap':"^(https?:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$", "host":"([a-z.]*?search\.yahoo\.com)$","testad":"var testad = function(ac,al) {return ( ac=='\"yschttl spt\"' || ac=='yschttl spt');}",'box':SearchBox_yahoo,'button':getButton_yahoo},
		{'id':'bing','name':'Bing Search', 'urlmap':"http://www.bing.com/search?q=|", 'regexmap':"^(https?:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$", "host":"(www\.bing\.com)$","testad":"var testad = function(ac,al) {return ( al&& al.indexOf('http')==0&& al.indexOf('https')!=0 && al.indexOf('msn')<0 && al.indexOf('live')<0  && al.indexOf('bing')<0&& al.indexOf('microsoft')<0 && al.indexOf('WindowsLiveTranslator')<0 )    }",'box':SearchBox_bing,'button':getButton_bing},
		{'id':'baidu','name':'Baidu Search', 'urlmap':"http://www.baidu.com/s?wd=|", 'regexmap':"^(https?:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$", "host":"(www\.baidu\.com)$","testad":"var testad = function(ac,al) {return ( al&& al.indexOf('baidu')<0 && al.indexOf('https')!=0  );}",'box':SearchBox_baidu,'button':getButton_baidu},
		{'id':'aol','name':'Aol Search', 'urlmap':"http://search.aol.com/aol/search?q=|", 'regexmap':"^(https?:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$", "host":"([a-z0-9.]*?search\.aol\.com)$","testad":"var testad = function(ac,al){return(ac=='\"find\"'||ac=='find'&& al.indexOf('https')!=0 && al.indexOf('aol')<0 );}",'box':SearchBox_aol,'button':getButton_aol}
	]
	
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
        var evtDown = new KeyboardEvent( "keydown",  {"keyCode":13});  
        window.setTimeout(function(){
            elt.dispatchEvent(evtDown);
        },timers[0])  
        var evtPress= new KeyboardEvent( "keypress",  {"keyCode":13}); 
        window.setTimeout(function(){
            elt.dispatchEvent(evtPress);
        },timers[1])  
        var evtUp = new KeyboardEvent( "keyup", {"keyCode":13});        
        window.setTimeout(function(){
            elt.dispatchEvent(evtUp);
        },timers[2])    
        window.setTimeout(sendPageLoaded,timers[3])    	
    }
   
   

   
    function downKey(chara, searchBox) {
        var charCode = chara[chara.length-1].charCodeAt(0)
        var evtDown = new KeyboardEvent("keydown", {"charCode":charCode} );   
        searchBox.dispatchEvent(evtDown)	
    }
    
    function pressKey(chara, searchBox) {
        var charCode = chara[chara.length-1].charCodeAt(0)
        var evtPress = new KeyboardEvent("keypress", {"charCode":charCode});   
        searchBox.dispatchEvent(evtPress)	
    }
    
    function inputChar(chara, searchBox) {
        var ev = document.createEvent("Event");
        ev.initEvent("input", true, false);
        searchBox.dispatchEvent(ev);
    }
    
    function releaseKey(chara, searchBox) { 
        var charCode = chara[chara.length-1].charCodeAt(0)
        var evtUp = new KeyboardEvent( "keyup", {"charCode":charCode}); 
        searchBox.dispatchEvent(evtUp)	
    }

    function simulateClick( engine ) {
		cout("Simulate Click")
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
            if ( testad!= undefined && testad(anchorClass,anchorLink) ) {  
                j++
                if ( j == clickIndex ) {
                    var logEntry = JSON.stringify({
                        'type' : 'click', 
                        "engine" : engine.id,  
                        'query' : link, 
                        'id':tmn_id
                    });
                    log(logEntry)	        
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
        var win = document.defaultView;
        if ( !elt) return;
        var timers =  getTimingArray(); 
        var evtDown = new MouseEvent ("mousedown");     
        window.setTimeout(function(){
            elt.dispatchEvent(evtDown);
        },timers[0]) 
        var evtUp = new MouseEvent ("mouseup");        
        window.setTimeout(function(){
            elt.dispatchEvent(evtUp);
        },timers[1])     
        var evtCl = new MouseEvent ("click");     
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
        api.runtime.sendMessage(response);      
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
        log(logEntry)
        updateStatus(queryToSend);
        if ( host =="" || !host.match(reg) ) {
            try { 
                window.location.href = encodedUrl;     
                return encodedUrl;	
            } catch (ex) {
                cout("Caught exception: "+ ex);
                api.runtime.sendMessage({
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
                    api.runtime.sendMessage( {
                        "url": encodedUrl
                    });
                    return null;
                }

            }  
        }   
    } 
    
  function updateURLRegexp( eng, url) {
		var regex = regexMap[eng];
        cout("  regex: "+regex+"  ->\n                   "+url);
        result = url.match(regex);
		
		if (!result) {
            cout("Can't find a regexp matching searched url")
            return false;
        }

        
        cout("updateURLRegexp") 
 
        
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
 
 
     function checkForSearchUrl(url) {
        var result = null;
        for (var i=0;i< engines.length; i++){
			var eng = engines[i]
            var regex = eng.regexmap;
            debug("  regex: "+regex+"  ->\n                   "+url);
            result = url.match(regex);
			
            if (result)  {
                cout(regex + " MATCHED! on "+eng.id );
                break; 
            }
        }
        if (!result)return null;
        
        if (result.length !=4 ){
            if (result.length ==6 && eng.id == "google"  ) {
                result.splice(2,2);
                result.push(eng.id);
                return result;
            }
            cout("REGEX_ERROR: "+url);
            /* for (var i in result)
    	        cout(" **** "+i+")"+result[i])*/
        }
        result.push(eng.id);    
        return result;
    }
     
    function isSafeHost( host ) {
		for (var i=0;i< engines.length; i++){
			var eng = engines[i]
            var regex = eng.hostMap;	
            cout("regex :" +regex)
            if (host.match(regex))  {
                return eng; 
            }
        }
        return false;
    }
	 

     
    function sendPageLoaded() {
        var req = {
            "tmn": "pageLoaded",
            "html": document.defaultView.document.body.innerHTML
        }
       api.runtime.sendMessage(req); 
    } 
    
     
    function log(msg) {
        api.runtime.sendMessage({tmnLog:msg} )
    }
     
    function updateStatus(msg) {
        var req = {
            "updateStatus": msg
        } 
        api.runtime.sendMessage(req); 
    }     

    function setCurrentURLMap( eng, url ) {
        var Eng_URL = eng + "--" + url; 
        var req = {
            setURLMap: Eng_URL
        } 
        api.runtime.sendMessage(req); 
    }
     
    function notifyUserSearch(eng, url) {
        // Here we update the regecxpfpor the queried engine
        updateURLRegexp(eng, url);
        api.runtime.sendMessage({
            "userSearch": eng
        } );
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
        tmnCurrentURL=  url;     
        debug("Current TMN loc: "+ tmnCurrentURL )
        var message = {
            "url": tmnCurrentURL
        };
        api.runtime.sendMessage( message);
        sendPageLoaded();
    }

  	  	
    return {
  
        
  
        handleRequest : function(request, sender, sendResponse) {
            
            if (request.tmnQuery) { 
				if (tmn_id >= request.tmnID) {
					debug("Duplicate queries ignored");
					return;
				}				
				debug("Received: "+ request.tmnQuery + " on engine: "+ request.tmnEngine.id + " mode: " +request.tmnMode + " tmn id "+request.tmnID)			
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
			if (request.click_eng) {
				cout("Clicking on engine : "+request.click_eng )
				simulateClick(request.click_eng);
			}
            return; // snub them.
        } ,
        
        
        checkIsActiveTab : function() {     
            api.runtime.sendMessage({
                tmn: "isActiveTab"
            }, function(response) {
                if (response.isActive){
                    cout('Message sent from active tab');
                    TRACKMENOT.TMNInjected.hasLoaded(); 
                }/* else {
                    var host = window.location.host; 
                    var eng = isSafeHost(host);
                    if ( eng ) {
                        notifyUserSearch(eng, window.location.href);
                    }
                }*/
            } )
        } , 
        
        hasLoaded :function(){
            var host = window.location.host; 
            if (!isSafeHost(host) ) {
				cout ("Host "+ host+ " is unsafe")
                window.stop();  
                //history.go(-1);
            }
            //  sendPageLoaded();
            getTMNCurrentURL();
        },
        

    }
}();
TRACKMENOT.TMNInjected.checkIsActiveTab();
api.runtime.onMessage.addListener( TRACKMENOT.TMNInjected.handleRequest  );

/*self.port.on("TMNTabRequest",  TRACKMENOT.TMNInjected.handleRequest  );      
self.port.on("TMNClickResult",  TRACKMENOT.TMNInjected.clickResult  );*/

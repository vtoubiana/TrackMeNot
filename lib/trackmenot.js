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
var Request = require("request").Request;
var tabs = require('tabs');
var URL = require("url").URL;
const data = require("self").data;
var ss = require("simple-storage");
const widgets = require("widget");
const workers = require("content/worker");
var panels = require("panel");
var {Cc, Ci} = require("chrome");





if(!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.TMNSearch = function() {
    var tmn_tab_id = -1;
	var tmn_tab = null;
    var useTab = false;
    var enabled = true;
    var debug = true;
    var useIncrementals = true;
    var incQueries = [];
    var searchEngines = "google";
    var engine = 'google';
    var genQueries = '';
    var feedList = 'http://www.techmeme.com/index.xml|http://rss.slashdot.org/Slashdot/slashdot|http://feeds.nytimes.com/nyt/rss/HomePage';
    var tmnLogs = [];
    var tmn_timeout = '60000';
    var burstEngine = '';
    var burstTimeout = 3000;
    var burstEnabled = false;
    var tmn_searchTimer =null;
    var burstCount = 0;
    var tmn_id = 0;
    var tmn_logged_id = 0;
    var tmn_mode = 'timed';
    var tmn_errTimeout = null;
    var tmn_scheduledSearch = false;
    var querynb = 0;
    var tmn_query='';
    var currentTMNURL = '';
    var tmn = TRACKMENOT.TMNSearch; 
    var tmn_option_tab = null;
    var search_script = data.url("tmn_search.js");
    var workers = require("content/worker");
    var worker;
    var timer = require("timer");
    
    var  currentUrlMap = {
        google:"https://www.google.com/search?hl=en&q=|",
        yahoo:"http://search.yahoo.com/search;_ylt="
        +getYahooId()+"?ei=UTF-8&fr=sfp&fr2=sfp&p=|&fspl=1",
        bing:"http://www.bing.com/search?q=|",
        baidu:"http://www.baidu.com/s?wd=|",
        aol:"http://search.aol.com/aol/search?s_it=topsearchbox.nrf&q=|"
    }
    
    var tmn_panel = panels.Panel({
            width:215,
            height:160,
            contentURL: data.url("tmn_menu.html"),
            contentScriptFile: [data.url("jquery.js"),data.url("menu-script.js")],
            onShow: sendOptionParameters
     });
     
     
     	       
    var widget = widgets.Widget({
        id: "tmn_widget",
        label: "TMN",
        width: 100,
        contentURL: data.url("tmn_widget.html"),
        contentScriptFile: [data.url("jquery.js"),data.url("widget-script.js")],
        /*onClick: function() {
            var isEnabled = toggleTMN();
            console.log("test")
                    if (isEnabled) {           
                        widget.label  = 'On'
                        widget.tooltip =  'TMN is ON'   
                         widget.port.emit("UpdateText", 'TMN is ON')
      
                        createTab(); 
                        scheduleNextSearch(4000);
                } else {
                        widget.label  = 'Off'
                        widget.tooltip =  'TMN is Off' 
                    }  
        },*/
        panel: tmn_panel
    });
    
    function sendOptionParameters() {
       cout("Sending perameters")
       var panel_inputs = {"options":getOptions(), "query" : tmn_query, "engine":engine }
       tmn_panel.port.emit("TMNSendOption",panel_inputs) 
       tmn_panel.port.on("TMNOpenOption",openOptionWindow)
       tmn_panel.port.on("TMNSaveOptions",saveOptionFromTab)
    }
    
    function openOptionWindow() {
       tabs.open({
           url: data.url("options.html"),
           onReady:  runScript
       });
    }
    
    function runScript(tab) {
      worker = tab.attach({
        contentScriptFile: [data.url("jquery.js"),data.url("option-script.js")]
      });
      sendOptionToTab(worker);
      worker.port.on("TMNSaveOptions",saveOptionFromTab)
    }
    
    function saveOptionFromTab(options) {
        if( enabled != options.enabled){
            if(options.enabled) TRACKMENOT.TMNSearch.restartTMN();
            else  TRACKMENOT.TMNSearch.stopTMN();
        }
        cout("useTab: " + options.useTab)
        tmn_timeout = options.timeout;
        searchEngines = options.searchEngines;
        burstEnabled = options.burstMode;
        console.log(searchEngines)
        changeTabStatus(options.useTab); 
        saveOptions();
    }
    
    
      function changeTabStatus(useT) {
            if ( useT == useTab) return;
            useTab  = useT;
            if ( useT ) {
                createTab();
            } else {
                deleteTab();
            }         
        } 

    
    function sendOptionToTab(worker) {
       var tab_inputs = {"options":getOptions()}
       worker.port.emit("TMNSetOptionsMenu",tab_inputs)
    }
  	 
    function getYahooId() {
        var id = "A0geu";
        while (id.length < 24) {
            var lower = Math.random()< .5;
            var num = parseInt(Math.random()* 38);
            if (num == 37){
                id += '_';
                continue;
            }
            if (num == 36){
                id += '.';
                continue;
            }
            if (num < 10){
                id += String.fromCharCode(num + 48);
                continue;
            }
            num += lower ?  87 : 55;
            id += String.fromCharCode(num);
        }
        //cout("GENERATED ID="+id);
        return id;
    }
      

	
    function cerr(msg, e){
        var txt = "[ERROR] "+msg;
        if (e){
            txt += "\n" + e;
            if (e.message)txt+=" | "+e.message;
        } else txt += " / No Exception";
        console.log(txt);
    }
	    
    function  cout (msg) {
        console.log(msg);
    }  
    
    function roll(min,max){
        return Math.floor(Math.random()*(max+1))+min;
    }
	
	
	
    function iniTab(tab) {
        worker = tab.attach({contentScriptFile: search_script});
        worker.port.on("TMNRequest",handleRequest);
        worker.port.on("TMNUpdateURL",updateCurrentURL);
        worker.port.on("close", preserveTMNTab); 
        tmn_win_id = tab.windowId;
		tmn_tab = tab;
        ss.storage.tmn_tab_id = tmn_tab_id;
    }
  
  
    function updateTab(tab) {
   
        worker = tab.attach({
            contentScriptFile: search_script           
        })  
        cout ("Update tab at url:"+tab.url + " expected url: "+ currentTMNURL )
        if ( tab.url == currentTMNURL ) {
            timer.clearTimeout(tmn_errTimeout);
            reschedule();  
        }    
        worker.port.on("TMNRequest",handleRequest);
        worker.port.on("TMNUpdateURL",updateCurrentURL);
    }
    
    function getTMNTab() {
		if (tmn_tab !=null) return tmn_tab;
		/*console.log("searching existing tabs")
		tabs = require("tabs");
        for each (var tab in tabs) {
			console.log(tab.title)
            if (tab.title == "tmn_tab") {
				console.log("Found tab")
				return tab;	
			}
              
        }*/
        return null;                
    }
    
    function deleteTab() {
        if (!useTab) return;
		tmn_tab.close();
		tmn_tab = null;
		/*
           for each (var tab in tabs)
                    if (tab.title == "tmn_tab") {
                        tab.close();
                        return;
                    } */
    }
	
    function createTab() {
        if (!useTab || getTMNTab()!= null) return null;
        if(debug) cout('Creating tab for TrackMeNot')
        try {
            tabs.open({
                url: 'https://www.google.com',
                title: 'tmn_tab',
                inBackground: true,
                onOpen: iniTab,
                onReady : updateTab,
                onClose: preserveTMNTab
           });
            return 1;
        } catch (ex) {
            cerr('Can no create TMN tab:' , ex);
            return null;
        }			
    }
	
    function roll(min,max){
        return Math.floor(Math.random()*(max+1))+min;
    }
    function trim(s)  {
        return s.replace(/\n/g,'');
    }
    function isBursting(){
        return burstEnabled && burstCount>0;
    }
    function chooseEngine( engines)  {
        return engines[Math.floor(Math.random()*engines.length)]
    }
 

  
    function randomQuery()  {
        var queries = genQueries.split(',');
        queries = queries.concat(Array("facebook","youtube","myspace","craigslist","ebay","yahoo","walmart","netflix","amazon","home depot","best buy","Kentucky Derby","NCIS","Offshore Drilling","Halle Berry","iPad Cases","Dorothy Provine","Emeril","Conan O'Brien","Blackberry","Free Comic Book Day"," American Idol","Palm","Montreal Canadiens","George Clooney","Crib Recall","Auto Financing","Katie Holmes","Madea's Big Happy Family","Old Navy Coupon","Sandra Bullock","Dancing With the Stars","M.I.A.","Matt Damon","Santa Clara County","Joey Lawrence","Southwest Airlines","Malcolm X","Milwaukee Bucks","Goldman Sachs","Hugh Hefner","Tito Ortiz","David McLaughlin","Box Jellyfish","Amtrak","Molly Ringwald","Einstein Horse","Oil Spill"," Bret Michaels","Mississippi Tornado","Stephen Hawking","Kelley Blue Book","Hertz","Mariah Carey","Taiwan Earthquake","Justin Bieber","Public Bike Rental","BlackBerry Pearl","NFL Draft","Jillian Michaels","Face Transplant","Dell","Jack in the Box","Rebbie Jackson","Xbox","Pampers","William Shatner","Earth Day","American Idol","Heather Locklear","McAfee Anti-Virus","PETA","Rihanna","South Park","Tiger Woods","Kate Gosselin","Unemployment","Dukan Diet","Oil Rig Explosion","Crystal Bowersox","New 100 Dollar Bill","Beastie Boys","Melanie Griffith","Borders","Tara Reid","7-Eleven","Dorothy Height","Volcanic Ash","Space Shuttle Discovery","Gang Starr","Star Trek","Michael Douglas","NASCAR","Isla Fisher","Beef Recall","Rolling Stone Magazine","ACM Awards","NASA Space Shuttle","Boston Marathon","Iraq","Jennifer Aniston"));
        var queryIdx = Math.floor(Math.random()*queries.length);
        var term = trim(queries[queryIdx]);
        if (!term || term.length<1)
            throw new Error("queryIdx="+queryIdx+" getQuery.term='"+term+"'");
        return term;
    }
	
    // returns # of keywords added
    function filterKeyWords(rssTitles, feedUrl) {
        var addStr = ""; //tmp-debugging
        var forbiddenChar = new RegExp("[ @#<>\"\\\/,;'Õ{}:?%|\^~`=]+", "g");
        var splitRegExp = new RegExp('[\\[\\]\\(\\)\\"\']+', "g");          
        var wordArray = rssTitles.split(forbiddenChar);

        for (var i=0; i < wordArray.length; i++)  {
            if ( !wordArray[i].match('-----') ) { 
                var word = wordArray[i].split(splitRegExp)[0];
                if (word && word.length>2) {
                    W: while (i < (wordArray.length)  && wordArray[i+1] && !(wordArray[i+1].match('-----')
                        || wordArray[i+1].match(splitRegExp)))   {
                        var nextWord = wordArray[i+1];   // added new check here -dch
                        if ( nextWord != nextWord.toLowerCase())  {
                            nextWord=trim(nextWord.toLowerCase().replace(/\s/g,'').replace(/[(<>"'Õ&]/g,''));
                            if (nextWord.length>1)  {
                                word += ' '+nextWord;
                            }
                        }
                        i++;
                    } 
                word = word.replace(/-----/g,'')
                    addStr += word+", "; //tmp
                }
            }
        }	  
        return addStr;
    }
	        
			
    // returns # of keywords added
    function addRssTitles(xmlData, feedUrl) {
        var rssTitles = ""; 
 
        if (!xmlData) return 0;  // only for asynchs? -dch

        var feedTitles = xmlData.getElementsByTagName("title");
        if (!feedTitles|| feedTitles.length<2)  {
            cerr("no items("+feedTitles+") for rss-feed: "+feedUrl);
            return 0;
        }
        cout('ADD RSS title : '+ feedTitles[0].firstChild.nodeValue);
        for (var i=1; i<feedTitles.length; i++){    
            if ( feedTitles[i].firstChild ) {
                rssTitles += feedTitles[i].firstChild.nodeValue;
                rssTitles += " ----- "; 
            }
        }     
        genQueries += filterKeyWords(rssTitles,  feedUrl);
        return 1;
    }
  
  
    function doRssFetch(feedUrl){		
        var req = Request({
           url: feedUrl,
           onComplete: function (response) {  
                if (response.status == 200) {
                  cout(response.text);   
                  var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
                  var doc=parser.parseFromString(response.text,'text/xml');
                  addRssTitles(doc, feedUrl);
                }  
          }
        });
        req.get();
    }
			
    function getSubQuery(queryWords) {
        var incQuery = "";
        var randomArray = new Array();
        for (var k = 0; k < queryWords.length ; k++) {
            randomIndex = Math.floor(Math.random()*queryWords.length);
            if ( randomArray.indexOf(randomIndex) < 0)
                randomArray.push(randomIndex);
        }
        randomArray.sort()	
        for ( k = 0; k < randomArray.length-1 && k < 5; k++) {
            incQuery += queryWords[randomArray[k]]+' ';
        }	
        incQuery += queryWords[randomArray[k]];
        if (incQueries)
            incQueries.push(trim(incQuery));
    }
					
			
    function getQuery() {		
        var term = randomQuery();		
        if (term.indexOf('\n') > 0) { // yuck, replace w' chomp(); 
            while (true) {
                for (var i = 0;i < term.length; i++) {
                    if (term.charAt(i)=='\n') {
                        term = term.substring(0,i)+' '+term.substring(i+1,term.length);
                        continue;
                    }
                }
                break;
            }
        }
        return term;
    }
	
     function updateIcon (url)    {
         var Uri = new URL(url);
         cout(Uri.host)
          var iconURL = "http://" + Uri.host +"/favicon.ico";
          widget.port.emit("UpdateIcon", iconURL)
      }	
      
    
    function updateOnErr() {

        widget.label  = 'Error'
        widget.tooltip =  'TMN Error'
        
        widget.port.emit("UpdateText", 'TMN Error')
    }
    	
    function updateOnSend ( queryToSend ) {
        cout("Query to send: "+queryToSend)
        tmn_query = queryToSend;

        widget.label  = queryToSend
        widget.tooltip =  engine+': '+queryToSend
        
        widget.port.emit("UpdateText", "TMN: "+queryToSend)
       /* chrome.browserAction.setBadgeBackgroundColor({
            'color':[113,113,198,255]
        })     */
    }           
  
    function doSearch(){   

               
        var newquery = getQuery();	  	  
        try { 
            if (incQueries && incQueries.length > 0)
                sendQuery(null);
            else {
                newquery = getQuery();     
                queryWords = newquery.split(' ');
                if (queryWords.length > 3 )   {
                    getSubQuery(queryWords);
                    if (useIncrementals)   {
                        var unsatisfiedNumber = roll(1,4);
                        for (var n = 0; n < unsatisfiedNumber-1; n++)
                            getSubQuery(queryWords);
                    }	
                    // not sure what is going on here? -dch
                    if (incQueries && incQueries.length > 0)
                        newquery = incQueries.pop();
                }
                sendQuery(newquery);
            }
        } catch (e) {
            cerr("error in doSearch",e);
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

    function updateCurrentURL(taburl) {
          currentTMNURL = taburl.url;       
    }

    function sendQuery(queryToSend)  { 
        tmn_scheduledSearch = false;
        var url =  currentUrlMap[engine];
        var isIncr = (queryToSend == null);
        if (queryToSend == null){ 
            if (incQueries && incQueries.length > 0) 
                queryToSend = incQueries.pop();
            else  {
                if (!queryToSend) cout('sendQuery error! queryToSendis null')
                return;
            }
        }
        if (Math.random() < 0.9) queryToSend = queryToSend.toLowerCase();
        if (queryToSend[0]==' ' ) queryToSend = queryToSend.substr(1); //remove the first space 
        updateOnSend(queryToSend);
        updateIcon(url)
        if ( useTab ) {  
	     if (  getTMNTab() == null ) createTab();   
             var TMNReq = {
                tmnQuery: queryToSend, 
                tmnEngine: engine, 
                tmnUrlMap: url,
                tmnMode: tmn_mode, 
                tmnID : tmn_id++
            }
            worker.port.emit("TMNTabRequest", TMNReq)	 
            cout('Message sent to the tab'); 
        } else { 

            var queryURL = queryToURL(url ,queryToSend);
            cout("The encoded URL is " + queryURL)
            
            
           var req = Request({
                url: queryURL,
                onComplete: function (response) { 
                        timer.clearTimeout(tmn_errTimeout);
                        if (response.status >= 200 && response.status<400) {
                            timer.clearTimeout(tmn_errTimeout);
                            reschedule();
                        } else {
                            rescheduleOnError(); 
                            var logEntry = JSON.stringify({
                                'type' : 'query', 
                                "engine" : engine, 
                                'mode' : tmn_mode, 
                                'query' : queryToSend, 
                                'id' : tmn_id++
                            });
                            TRACKMENOT.TMNSearch._log(logEntry);
                        }
            }
            });
            
             req.get();
             cout("Querry sent to :"+queryURL)
            currentTMNURL = queryURL;
        }
        querynb++;
    }
	
    function	rescheduleOnError () {
        // long pause (at least 3 min)
        var pauseAfterError = Math.max(2*tmn_timeout, 60000*3);
        tmn_mode = 'recovery';
        // clear bursts
        burstCount=0;
	        
        // log and tell the user
        cout("[INFO] Trying again in "+(pauseAfterError/1000)+ "s")
        TRACKMENOT.TMNSearch._log({
            'type' : 'ERROR' , 
            'message': 'next search in '+(pauseAfterError/1000)+ "s", 
            'engine':engine
        });
        updateOnErr();
	        
        // reschedule after long pause
        if (enabled )
            scheduleNextSearch(pauseAfterError);            
        return false;
    }
	       
    function reschedule() {
        var delay =  tmn_timeout;	  
         
        if(tmn_scheduledSearch) return; 
        else tmn_scheduledSearch = true;
                        
        if (isBursting())  { // schedule for burs 
            delay = Math.min(delay,burstTimeout);
            scheduleNextSearch(delay);
            tmn_mode = 'burst';
            burstCount--;
        } else  { // Not bursting, schedule per usual
            tmn_mode = 'timed';
            scheduleNextSearch(delay);
        }
    }
	
    function scheduleNextSearch(delay) {  
        if (!enabled) return; 
        prev_engine = engine;     
        if (delay > 0) {
            if (!isBursting()) { // randomize to approach target frequency
                var offset = delay*(Math.random()/2);
                delay = parseInt(delay) + offset;
            } else  { // just simple randomize during a burst           
                delay += delay*(Math.random()-.5);
            }
        }
        if (isBursting())   engine = burstEngine;
        else engine = chooseEngine(searchEngines.split(',')); 		     
        cout('NextSearchScheduled');
        tmn_errTimeout = timer.setTimeout(rescheduleOnError, delay*3);
        tmn_searchTimer = timer.setTimeout(doSearch, delay);

    }
	  
    function enterBurst ( burst_engine ) {
        if (!burstEnabled) return;
        var logMessage = {
            'type':'info', 
            'message':'User made a search, start burst', 
            'engine':burst_engine
        } ;
        TRACKMENOT.TMNSearch._log(logMessage);
        burstEngine = burst_engine;
        burstCount = roll(3,10);   
    }
	  
    function deleteTabWithUrl(tabURL) {
        for each (var tab in tabs)
            if (tab.url == tabURL) {
                tab.close();
                return;
          }
    }
    
    
    	 function saveOptions() {
            ss.storage.feed_list = feedList;
            var options = getOptions();	
            ss.storage.options_tmn = JSON.stringify(options);	
            ss.storage.tmn_id = tmn_id;
        }
	
	

        
        
        
      function getOptions() {
            var options = {};
            options.enabled = enabled;
            options.timeout = tmn_timeout;
            options.searchEngines = searchEngines;	
            options.useTab = useTab;
            options.burstMode = burstEnabled;
            options.feedList = getFeedList();
            return options;
      }
      
      function getFeedList() {
            return feedList;		
      }
        
    function initOptions() {
        enabled = true;
        timeout = 6000;
        burstMode = true;
        searchEngines = "google,yahoo,bing";
        useTab = false;
        feedList = "http://www.techmeme.com/feed.xml" ;   
    }
	  
    function restoreOptions () {
        if (!ss.storage.options_tmn) {
             initOptions();
			 console.log("Init: "+ enabled)
             return;
        }
  
        try {
            var options = JSON.parse(ss.storage.options_tmn);
            enabled = options.enabled;
			console.log("Restore: "+ enabled)
            tmn_timeout = options.timeout;
            burstEnabled = options.burstMode;
            searchEngines = options.searchEngines;
            useTab  = options.useTab;
            feedList = ss.storage.feed_list;
            if (ss.storage.tmn_id) tmn_id = ss.storage.tmn_id;
            if (ss.storage.logs_tmn) tmnLogs =  JSON.parse( ss.storage.logs_tmn );
            if (ss.storage.url_map_tmn) currentUrlMap = JSON.parse( ss.storage.url_map_tmn);
            if (ss.storage.last_tmn_url && ss.storage.last_tmn_url != '' ) deleteTabWithUrl( ss.storage.last_tmn_url);
        } catch (ex) {
            cout('No option recorded: '+ex)	
        }
    }
	  
    function formatNum ( val) {
        if (val < 10) return '0'+val;
        return val   
    }
    
    function toggleTMN() {
        enabled = !enabled
        return enabled;                       
     }
     
            function handleRequest(request, sender, sendResponse) {

            if (request.tmnLog) {
                cout("Background logging : " + request.tmnLog);
                var logtext = JSON.parse(request.tmnLog);
                TRACKMENOT.TMNSearch._log(logtext);
                return;   
            } 
            if (request.updateStatus) {
                cout(request.updateStatus)
                updateOnSend(request.updateStatus);
                return;
            } 
            if (request.userSearch) {
                enterBurst(request.userSearch); 
                return;
            }           
            if ( request.setURLMap) {
                cout("Background handling : " + request.setURLMap);
                var vars = request.setURLMap.split('--');
                var eng = vars[0];
                var asearch = vars[1];
                currentUrlMap[eng] = asearch;
                ss.storage.url_map_tmn = JSON.stringify(currentUrlMap) ;
                var logEntry = {
                    'type' : 'URLmap', 
                    "engine" : eng, 
                    'newUrl' : asearch
                };
                TRACKMENOT.TMNSearch._log(logEntry);
                return;
            }
            //cout("Background page received message: " + request.tmn);   
            switch (request.tmn) {
                case "currentURL":
                    var response = {url: currentTMNURL}; 
                    worker.port.emit("TMNCurrentURLRes",response)
                    break;
                case "useTab" :
                    var response = {tmnUseTab: useTab}; 
                    worker.port.emit("useTabRes",response)              
                    break;
                case "pageLoaded": //Remove timer and then reschedule;       
                    timer.clearTimeout(tmn_errTimeout);
                    reschedule();
                    break;
                case "tmnError": //Remove timer and then reschedule;       
                    timer.clearTimeout(tmn_errTimeout);
                    rescheduleOnError();
                    break;
                case "isActiveTab":
                    var active = (!sender.tab || sender.tab.id==tmn_tab_id);
                    cout("active: "+ active)
                    worker.port.emit("isActiveRes", {
                        isActive: active
                    });       
                    break;
                default:
                    // snub them.
            }
        } 
        
        function preserveTMNTab() {
            if ( useTab ) {
                cout('TMN tab has been deleted by the user, reload it');
                createTab();
                return;  
            }
  
        }



	
    return {
	
        _log : function (entry) {
            try  {
                if (entry != null)  {
                    if (entry.type== 'query') {
                        if( entry.id && entry.id==tmn_logged_id) return;
                        tmn_logged_id = entry.id;
                    }
                    var now = new Date();
                    entry.date = formatNum(now.getHours())+":"+ formatNum(now.getMinutes())+":"+ formatNum(now.getSeconds())+
                    '   '+(now.getMonth()+1) + '/' + now.getDate()+ '/' + now.getFullYear() ;
                }
            }
            catch(ex){
                cout("[ERROR] "+ ex +" / "+ ex.message +  "\nlogging msg");
            }
            tmnLogs.unshift(entry);
            ss.storage.logs_tmn = JSON.stringify(tmnLogs);
        },
        

	
        clearLog : function() {
            tmnLogs = [];
            ss.storage.logs_tmn = JSON.stringify(tmnLogs);
        },
  
        getEngine: function() {
            return engine;
        },
  
        getQuery: function() {
            return tmn_query;
        },     
	
	

	
        getCurrentURL: function () {
            return currentTMNURL;
        },

	

	 
	 

   
        stopTMN : function () {    
            enabled = false;  
            saveOptions();
  		
            if ( useTab ) deleteTab(); 
            widget.label  = 'Off'
            widget.tooltip =  'TMN is Off' 
    
            timer.clearTimeout(tmn_searchTimer);
            timer.clearTimeout(tmn_errTimeout);
        },
  
        restartTMN :function() {
            createTab(); 
            enabled = true;          
            widget.label  = 'On'
            widget.tooltip =  'TMN is ON' 
            scheduleNextSearch(4000);
        },          
  
  
        startTMN : function () {    
            restoreOptions();
            var feeds = feedList.split('|');
            for (var i=0;i<feeds.length;i++)
            doRssFetch(feeds[i]);
            var engines = searchEngines.split(',');           
            engine = chooseEngine(engines);

	  
            if (enabled) {           
                widget.label  = 'On'
                widget.tooltip =  'TMN is ON';
                widget.port.emit("UpdateText", 'TMN is ON')
      
                createTab(); 
                scheduleNextSearch(4000);
            } else {
                widget.label  = 'Off'
                widget.tooltip =  'TMN is Off' 
                widget.port.emit("UpdateText", 'TMN is OFF')
      
            }
	  
        },
        

  
        updateFeed :function (newFeeds) {
            genQueries = '';
            feedList= newFeeds;
            var feeds = feedList.split('|');
            for (var i=0;i<feeds.length;i++)
                doRssFetch(feeds[i]);	
            saveOptions();
        },
  

    
        deleteTab : function() {
                deleteTabe();
        }
  
  
   
 
  
    }
  
}();

TRACKMENOT.TMNSearch.startTMN()

//chrome.tabs.onSelectionChanged.addListener(TRACKMENOT.TMNSearch._hideTMNTab);
//window.addEventListener("unload", TRACKMENOT.TMNSearch._preserveTMNTab); 
//window.addEventListener("unload",TRACKMENOT.TMNSearch._deleteTab); 

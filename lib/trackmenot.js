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
var data = require("self").data;
var ss = require("simple-storage");
var widgets = require("widget");
var panels = require("panel");
var pageMod = require("page-mod");
var tabs = require("tabs");
var timer = require("timer"); 
var {Cc, Ci} = require("chrome");
var windows = require("windows").browserWindows;
var notifications = require("notifications");
var _ = require("l10n").get;





if(!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.TMNSearch = function() {
    var tmn_tab_id = -1;
    var tmn_tab = null;
    var useTab = false;
    var enabled = true;
    var debug_ = true;
    var load_full_pages = true;
    var stop_when = "start"
    var useIncrementals = true;
    var incQueries = [];
    var searchEngines = "google";
    var engine = 'google';
    var TMNQueries = {};
    var feedList = 'http://www.techmeme.com/index.xml|http://rss.slashdot.org/Slashdot/slashdot|http://feeds.nytimes.com/nyt/rss/HomePage';
    var tmnLogs = [];
    var disableLogs = false;
    var saveLogs =  true;
    var kwBlackList = [];
    var useBlackList = true;
    var useDHSList = false;
    var typeoffeeds = [];
    var zeitgeist = ["facebook","youtube","myspace","craigslist","ebay","yahoo","walmart","netflix","amazon","home depot","best buy","Kentucky Derby","NCIS","Offshore Drilling","Halle Berry","iPad Cases","Dorothy Provine","Emeril","Conan O'Brien","Blackberry","Free Comic Book Day"," American Idol","Palm","Montreal Canadiens","George Clooney","Crib Recall","Auto Financing","Katie Holmes","Madea's Big Happy Family","Old Navy Coupon","Sandra Bullock","Dancing With the Stars","M.I.A.","Matt Damon","Santa Clara County","Joey Lawrence","Southwest Airlines","Malcolm X","Milwaukee Bucks","Goldman Sachs","Hugh Hefner","Tito Ortiz","David McLaughlin","Box Jellyfish","Amtrak","Molly Ringwald","Einstein Horse","Oil Spill"," Bret Michaels","Mississippi Tornado","Stephen Hawking","Kelley Blue Book","Hertz","Mariah Carey","Taiwan Earthquake","Justin Bieber","Public Bike Rental","BlackBerry Pearl","NFL Draft","Jillian Michaels","Face Transplant","Dell","Jack in the Box","Rebbie Jackson","Xbox","Pampers","William Shatner","Earth Day","American Idol","Heather Locklear","McAfee Anti-Virus","PETA","Rihanna","South Park","Tiger Woods","Kate Gosselin","Unemployment","Dukan Diet","Oil Rig Explosion","Crystal Bowersox","New 100 Dollar Bill","Beastie Boys","Melanie Griffith","Borders","Tara Reid","7-Eleven","Dorothy Height","Volcanic Ash","Space Shuttle Discovery","Gang Starr","Star Trek","Michael Douglas","NASCAR","Isla Fisher","Beef Recall","Rolling Stone Magazine","ACM Awards","NASA Space Shuttle","Boston Marathon","Iraq","Jennifer Aniston"]
    var tmn_timeout = 6000;
    var prev_engine = "None"
    var burstEngine = '';
    var burstTimeout = 6000;
    var burstEnabled = false;
    var tmn_searchTimer =null;
    var burstCount = 0;
    var tmn_id = 0;
    var tmn_logged_id = 0;
    var tmn_mode = 'timed';
    var tmn_errTimeout = null;
    var tmn_scheduledSearch = false;
    var tmn_query='No query sent yet';
    var currentTMNURL = '';
    var tmn_option_tab = null;
    var worker_tab, worker_opt;
    var search_script = data.url("tmn_search.js");
    
    var skipex =new Array(   
                /calendar/i,/advanced/i,/click /i,/terms/i,/Groups/i,
                /Images/,/Maps/,/search/i,/cache/i,/similar/i,/&#169;/,
                /sign in/i,/help[^Ss]/i,/download/i,/print/i,/Books/i,/rss/i,
                /google/i,/bing/i,/yahoo/i,/aol/i,/html/i,/ask/i,/xRank/,
                /permalink/i,/aggregator/i,/trackback/,/comment/i,/More/,
                /business solutions/i,/result/i,/ view /i,/Legal/,/See all/,
                /links/i,/submit/i,/Sites/i,/ click/i,/Blogs/,/See your mess/,
                /feedback/i,/sponsored/i,/preferences/i,/privacy/i,/News/,
                /Finance/,/Reader/,/Documents/,/windows live/i,/tell us/i,
                /shopping/i,/Photos/,/Video/,/Scholar/,/AOL/,/advertis/i,
                /Webmasters/,/MapQuest/,/Movies/,/Music/,/Yellow Pages/,
                /jobs/i,/answers/i,/options/i,/customize/i,/settings/i,
                /Developers/,/cashback/,/Health/,/Products/,/QnABeta/,
                /<more>/,/Travel/,/Personals/,/Local/,/Trademarks/,
                /cache/i,/similar/i,/login/i,/mail/i,/feed/i
                )
    
    var  currentUrlMap = {
        google:"https://www.google.com/search?hl=en&q=|",
        yahoo:"http://search.yahoo.com/search;_ylt="
            +getYahooId()+"?ei=UTF-8&fr=sfp&fr2=sfp&p=|&fspl=1",
        bing:"http://www.bing.com/search?q=|",
        baidu:"http://www.baidu.com/s?wd=|",
        aol:"http://search.aol.com/aol/search?s_it=topsearchbox.nrf&q=|"
    }
    
    var  regexMap = {
        google : "^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$",      
        yahoo :  "^(http:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$",
        bing : "^(http:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$",
        aol : "^(http:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$",
        baidu : "^(http:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$",
        ask : "^(http:\/\/www\.ask\.com\/web\?.*?q=)([^&]*)(.*)$"
    }
      	
    
    var tmn_panel = panels.Panel({
        width:115,
        height:125,
        contentURL: data.url("tmn_menu.html"),
        contentScriptFile: [data.url("jquery.js"),data.url("menu-script.js")],
        onShow: sendOptionParameters
    });
     
    function sendLogToOption() {
        worker_opt.port.emit("TMNSendLogs",{logs:tmnLogs})
    }
    
    function sendQueriesToOption() {
        var allqueries = "";
        for each( var arr in TMNQueries) {
            if (arr && arr.length) {
                for each (var elt in arr)
                if ( elt.words) allqueries+= elt.words.join(',');
                else allqueries+= elt+",";   
            }
        }
        worker_opt.port.emit("TMNSendQueries",{queries:allqueries})
    }
     
     	       
    var widget = widgets.Widget({
        id: "tmn_widget",
        label: "TMN",
        width: 150,
        contentURL: data.url("tmn_widget.html"),
        contentScriptFile: [data.url("jquery.js"),data.url("widget-script.js")],
        panel: tmn_panel
    });
    
    function sendOptionParameters() {
        debug("Sending perameters")
        var panel_inputs = {"options":getOptions(), "query" : tmn_query, "engine":prev_engine }
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
        worker_opt = tab.attach({
            contentScriptFile: [data.url("jquery.js"),data.url("option-script.js")]
        });
        sendOptionToTab();
        worker_opt.port.on("TMNSaveOptions",saveOptionFromTab)
        worker_opt.port.on("TMNOptionsShowLog", sendLogToOption)
        worker_opt.port.on("TMNOptionsShowQueries", sendQueriesToOption)
        worker_opt.port.on("TMNOptionsClearLog", clearLog)
        worker_opt.port.on("TMNValideFeeds", validateFeeds)
    }
    
    function validateFeeds(param) {
        TMNQueries.rss = [];
        feedList= param.feeds;
        var feeds = feedList.split('|');
        for (var i=0;i<feeds.length;i++)
            doRssFetch(feeds[i]);	
        saveOptions();
    }
	

    function sendOptionToTab() {
        var tab_inputs = {"options":getOptions()}
        worker_opt.port.emit("TMNSetOptionsMenu",tab_inputs)
    }
    function clearLog() {
        tmnLogs = [];
        sendLogToOption();
    }
    
    function saveOptionFromTab(options) {
        if( enabled != options.enabled){
            if (options.enabled) restartTMN();
            else stopTMN();
        }
        debug("useTab: " + options.useTab)
        tmn_timeout = options.timeout;
        searchEngines = options.searchEngines;
        burstEnabled = options.burstMode;
        disableLogs = options.disableLogs;
        saveLogs = options.saveLogs;
        useBlackList = options.use_black_list;
        if ( useDHSList!= options.use_dhs_list) {
            if ( options.use_dhs_list ) {
                readDHSList();
                typeoffeeds.push('dhs');
            } else {
                typeoffeeds.splice(typeoffeeds.indexOf('dhs'),1)
                TMNQueries.dhs = null;
            }
            useDHSList = options.use_dhs_list;
        }
        
        kwBlackList = options.kw_black_list.split(',');
        debug("Searched engines: "+ searchEngines)
        changeTabStatus(options.useTab); 
        saveOptions();
    }
    
    
    function changeTabStatus(useT) {
        if ( useT == useTab) return;
        if ( useT ) {
            useTab  = useT;   
            createTab() ;
        } else {
            deleteTab();
            useTab  = useT;   
        }    
        
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
      
    function trim(s)  {
        return s.replace(/\n/g,'');
    }
	
    function cerr(msg, e){
        var txt = "[ERROR] "+msg;
        if (e){
            txt += "\n" + e;
            if (e.message)txt+=" | "+e.message;
        } else txt += " / No Exception";
        cout(txt);
    }
	    
    function  cout (msg) {
        console.log(msg);
    } 
    
    function  debug (msg) {
        if (debug_)
            console.log("DEBUG: " +msg);
    }   
    
    function roll(min,max){
        return Math.floor(Math.random()*(max+1))+min;
    }
    
    function randomElt(array) {
        var index = roll(0,array.length-1);
        return array[index]
    }
	
    function monitorBurst() {
        pageMod.PageMod({
            //include: /.[a-z]+\.(google|yahoo|bing|baidu)\.(co\\.|com\\.)?[a-z]{2,3}.*/,
            include: ["*"],
            contentScriptFile: data.url("stoping-script.js"),
            contentScriptWhen : stop_when,
            onAttach: function onAttach(worker) {
                if (!worker.tab) return
                var url = worker.tab.url;  
                var result = checkForSearchUrl(url);
                if (!result) {
                    if ( tmn_tab && worker.tab.index == tmn_tab.index) {
                        cout("TMN tab tryign to visit: "+ url)
                        worker.port.emit("TMNStopLoading");	
                    }			
                    return;
                }

                //
                // -- EXTRACT DATA FROM THE URL
                var pre   = result[1];
                var query = result[2];
                var post  = result[3];
                var eng   = result[4];
                var asearch  = pre+'|'+post;
                if (!tmn_tab || worker.tab.index != tmn_tab.index ) {
                    debug("Worker find a match for url: "+ url)
                    if (burstEnabled)  enterBurst ( eng )
                    if ( currentUrlMap[eng]!= asearch ) {
                        currentUrlMap[eng] = asearch;          
                        ss.storage.url_map_tmn = JSON.stringify(currentUrlMap) ;
                        var logEntry = createLog('URLmap', eng, null,null,null, asearch)
                        log(logEntry);
                        cout("Updated url fr search engine "+ eng + ", new url is "+asearch);
                    }
                } 
            }
        }); 
        
    }
    
    function checkForSearchUrl(url) {
        var result = null;
        for (var en in regexMap){
            var regex = regexMap[en];
            //cout("  regex: "+regex+"  ->\n                   "+url);
            result = url.match(regex);
            if (result)  {
                var eng = en;
                //cout(regex + " MATCHED! on "+eng );
                break; 
            }
        }
        if (!result)return null;
        
        if (result.length !=4 ){
            if (result.length ==6 && eng == "google"  ) {
                result.splice(2,2);
                result.push(eng);
                return result;
            }
            cout("REGEX_ERROR: "+url);
            /* for (var i in result)
    	        cout(" **** "+i+")"+result[i])*/
        }
        result.push(eng);    
        return result;
    }
	
	
    function iniTab(tab) {
        worker_tab = tab.attach({contentScriptFile: search_script});
        tab.on("activate",function() {  
            notifications.notify({
                text: "This tab is used by TrackMeNot to generate fake searches",
                iconURL: data.url("images/skin/tmn_lg.png")
            });
        } )
        worker_tab.port.on("TMNRequest",handleRequest);
        worker_tab.port.on("TMNUpdateURL",updateCurrentURL);
        worker_tab.port.on("close", preserveTMNTab); 
		worker_tab.port.on("TMNSetTabUrl", setTabURL)
        tmn_win_id = tab.windowId;
        tmn_tab = tab;
        ss.storage.tmn_tab_id = tmn_tab_id;
    }
  
  	function setTabURL(param) {
		cout("Set tmn tab url to: "+ param.url)
		tmn_tab.url = param.url;
	}
  
    function updateTab(tab) {
        worker_tab = tab.attach({
            contentScriptFile: search_script           
        }) 
        tmn_tab = tab;
        worker_tab.port.on("TMNRequest",handleRequest);
        worker_tab.port.on("TMNUpdateURL",updateCurrentURL);
    }
    
    function getTMNTab() {
        debug("Trying to access to the tab: "+tmn_tab)
        if (tmn_tab !=null) return tmn_tab;
        return null;                
    }
    
    function deleteTab() {
        if (!useTab) return;
        tmn_tab.close();
        tmn_tab = null;
    }
	
    function createTab() {
		if (!useTab) return null;
        if (getTMNTab()!= null) return getTMNTab();
        debug('Creating tab for TrackMeNot')
        try {
            tabs.open({
                url: 'about:blank',
                title: 'tmn_tab',
                inBackground: true,
                onOpen: iniTab,
                onReady : updateTab,
                onClose: preserveTMNTab
            });
        } catch (ex) {
            cerr('Can no create TMN tab:' , ex);
            return null;
        }
        return 1;
    }
	
 

    function isBursting(){
        return burstEnabled && burstCount>0;
    }
    function chooseEngine( engines)  {
        return engines[Math.floor(Math.random()*engines.length)]
    }
 

  
    function randomQuery()  {
        var qtype = randomElt(typeoffeeds)
        cout(qtype)
        var queries = [];
        if ( qtype != 'zeitgeist' && qtype!='extracted') {
            var queryset = TMNQueries[qtype];
            queries = randomElt(queryset).words;
        } else queries = TMNQueries[qtype];
        var term = trim( randomElt(queries) );
        if (!term || term.length<1)
            throw new Error("queryIdx="+queryIdx+" getQuery.term='"+term+"'");
        return term;
    }
    
    function extractQueries(html)    {
        var forbiddenChar = new RegExp("^[ @#<>\"\\\/,;'’{}:?%|\^~`=]", "g");
        var splitRegExp = new RegExp('^[\\[\\]\\(\\)\\"\']', "g");
      
        if (!html) { 
            cout("NO HTML!"); 
            return;
        }
  
        var phrases = new Array();

        // Parse the HTML into phrases
        var l = html.split(/((<\?tr>)|(<br>)|(<\/?p>))/i);
        for (var i = 0;i < l.length; i++) {
            if( !l[i] || l[i] == "undefined") continue;
            l[i] = l[i].replace(/(<([^>]+)>)/ig," ");	       
            //if (/([a-z]+ [a-z]+)/i.test(l[i])) {
            //var reg = /([a-z]{4,} [a-z]{4,} [a-z]{4,} ([a-z]{4,} ?) {0,3})/i;
            var matches = l[i].split(" ");//reg.exec(l[i]);
            if (!matches || matches.length<2) continue;
            var newQuery = trim(matches[1]);
            // if ( phrases.length >0 ) newQuery.unshift(" ");
            if( newQuery && phrases.indexOf(newQuery)<0 )
                phrases.push(newQuery);
            //_addQuery(newQuery, phrases, -1, true);  // changed -dch
            // }
        }
        var queryToAdd = phrases.join(" ");
        TMNQueries.extracted = [].concat(TMNQueries.extracted);
        while (TMNQueries.extracted.length > 200 ) {
            var rand = roll(0,TMNQueries.extracted.length-1);
            TMNQueries.extracted.splice(rand , 1);
        }
        cout(TMNQueries.extracted) 
        addQuery(queryToAdd,TMNQueries.extracted);
    }
      
    function isBlackList( term ) {
        if ( !useBlackList ) return false;
        var words = term.split(/\W/g);
        // alert(words + "BL: " +gtmn.dataTMN._kwBlackList ) 
        for ( var i=0; i< words.length; i++) {
            if ( kwBlackList.indexOf(words[i].toLowerCase()) >= 0)
                return true;
        }
        return false;
    }
    
    function queryOk(a)    {  
        for ( i = 0;i < skipex.length; i++) {
            if (skipex[i].test(a))
                return false
        }
        return true;
    }
      
    function addQuery(term, queryList) {
        var noniso = new RegExp("[^a-zA-Z0-9_.\ \\u00C0-\\u00FF+]+","g");
           
        term = term.replace(noniso,'') 
        term = trim(term);
           
        if ( isBlackList(term) )
            return false;
           
        if (!term || (term.length<3) || (queryList.indexOf(term) >0) ) 
            return false;
    
        if (term.indexOf("\"\"")>-1 || term.indexOf("--")>-1)
            return false;
    
        // test for negation of a single term (eg '-prison') 
        if (term.indexOf("-")==0 && term.indexOf(" ")<0)
            return false;
    
        if (!queryOk(term)) 
          return false;
    
        queryList.push(term);
        //gtmn._cout("adding("+gtmn._queries.length+"): "+term);
    
        return true;
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
        var feedObject = {};
        feedObject.name = feedTitles[0].firstChild.nodeValue;
        feedObject.words = [];
        cout('ADD RSS title : '+ feedTitles[0].firstChild.nodeValue);
        for (var i=1; i<feedTitles.length; i++){    
            if ( feedTitles[i].firstChild ) {
                rssTitles = feedTitles[i].firstChild.nodeValue;
                rssTitles += " ----- "; 
            }        
            var queryToAdd = filterKeyWords(rssTitles,  feedUrl);
            addQuery(queryToAdd,feedObject.words); 
        } 
        cout(feedObject.name + " : " + feedObject.words)
        TMNQueries.rss.push(feedObject);

        return 1;
    }
  
  
    function  readDHSList() {
        TMNQueries.dhs = [];
        var i = 0;
        var req = Request({
            url: data.url("dhs_keywords.json"),
            onComplete: function (response) { 
                if (response.status ==200 ) {
                    var keywords = response.json.keywords;
                    for each(var cat in keywords)   {
                        TMNQueries.dhs[i] = {};
                        TMNQueries.dhs[i].category_name = cat.category_name;
                        TMNQueries.dhs[i].words = [];
                        for each (var word in cat.category_words)
                        TMNQueries.dhs[i].words.push(word.name)
                        i++;
                    }
                    return;
                } else {
                    var logEntry = createLog('error', "Can not load DHS list");
                    log(logEntry);
                }
            }
        });
        req.get();
    }
  
    function doRssFetch(feedUrl){		
        if (!feedUrl)  return;
        
        var req = Request({
            url: feedUrl,
            onComplete: function (response) {  
                if (response.status == 200) {
                    cout(response.text);   
                    var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
                    var doc = parser.parseFromString(response.text,'text/xml');
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
            randomIndex = roll(0,queryWords.length-1);
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
        var iconURL = "http://" + Uri.host +"/favicon.ico";
        widget.port.emit("UpdateIcon", iconURL)
    }	
	
    function createLog(type,engine,mode,query,id,asearch) {
        var logEntry = {  'type' : type, 
            "engine" : engine 
        };
        if (mode) logEntry.mode =tmn_mode
        if ( query)  logEntry.query = query
        if ( id)  logEntry.id = id
        if (asearch) logEntry.newUrl =  asearch
		 
		 
        return logEntry;
    }
      
    
    function updateOnErr() {
        widget.label  = 'Error'
        widget.tooltip =  'TMN Error'       
        widget.port.emit("UpdateText", 'TMN Error')
    }
    	
    function updateOnSend ( queryToSend ) {
        tmn_query = queryToSend;
        widget.label  = queryToSend
        widget.tooltip =  engine+" '"+queryToSend+"'"  
        if (!burstEnabled || burstCount == 0)    
            widget.port.emit("UpdateText", " TMN: '"+queryToSend+"'") 
        else 
            widget.port.emit("UpdateText", " TMN (" + burstCount +"): '"+queryToSend+"'")   
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
        if (queryToSend[0]==' ' ) queryToSend = queryToSend.substr(1); //remove the first space ;
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
            debug('Sending messaget to the tab '); 
            try {
                worker_tab.port.emit("TMNTabRequest", TMNReq)	;
                debug('Message sent to the tab'); 
            } catch(ex) {
                cout("Error : "+ex)
                cout("Creating a new tab")
                deleteTab();
                timer.setTimeout(function() {worker_tab.port.emit("TMNTabRequest", TMNReq)},1000)	;
            }
 
        } else { 

            var queryURL = queryToURL(url ,queryToSend);
            debug("The encoded URL is " + queryURL)
			
            updateOnSend(queryToSend)                  
            var req = Request({
                url: queryURL,
                onComplete: function (response) { 
                    timer.clearTimeout(tmn_errTimeout);
                    if (response.status >= 200 && response.status<400) {
                        timer.clearTimeout(tmn_errTimeout);
                        reschedule();
                        var logEntry = createLog('query', engine, tmn_mode,  queryToSend, tmn_id++);
                        extractQueries(response.text);
                    } else {
                        var logEntry = createLog('error', engine, tmn_mode,  queryToSend, tmn_id);
                        rescheduleOnError(); 
                    }
                    log(logEntry);
                }
            });
            
            req.get();
            debug("Querry sent to :"+queryURL)
            currentTMNURL = queryURL;
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
        debug("currentTMNURL is :"+currentTMNURL)     
    }


	
    function rescheduleOnError () {
        var pauseAfterError = Math.max(2*tmn_timeout, 60000);
        tmn_mode = 'recovery';
        burstCount=0;
        cout("[INFO] Trying again in "+(pauseAfterError/1000)+ "s")
        log({
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
        debug('NextSearchScheduled');
        tmn_errTimeout = timer.setTimeout(rescheduleOnError, delay*3);
        tmn_searchTimer = timer.setTimeout(doSearch, delay);
    }
	  
    function enterBurst ( burst_engine ) {
        if (!burstEnabled) return;
        cout("Entering burst mode for engine: "+burst_engine)
        var logMessage = {
            'type':'info', 
            'message':'User made a search, start burst', 
            'engine':burst_engine
        } ;
        log(logMessage);
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
        //ss.storage.kw_black_list = kwBlackList.join(",");
        var options = getOptions();	
        ss.storage.options_tmn = JSON.stringify(options);	
        ss.storage.tmn_id = tmn_id;
        ss.storage.gen_queries = JSON.stringify(TMNQueries);
        
    }
	
	

        
    function getOptions() {
        var options = {};
        options.enabled = enabled;
        options.timeout = tmn_timeout;
        options.searchEngines = searchEngines;	
        options.useTab = useTab;
        options.burstMode = burstEnabled;
        options.feedList = feedList;
        options.use_black_list = useBlackList;
        options.use_dhs_list = useDHSList;
        options.kw_black_list = kwBlackList.join(",");
        options.saveLogs= saveLogs;
        options.disableLogs = disableLogs;
        return options;
    }
      

    function initOptions() {
        enabled = true;
        timeout = 6000;
        burstMode = true;
        searchEngines = "google,yahoo,bing";
        useTab = false;
        feedList = "http://www.techmeme.com/feed.xml" ;  
        useBlackList = true;
        useDHSList = false;
        kwBlackList= ['bomb', 'porn', 'pornographie']; 
        saveLogs =  true;
        disableLogs  = false;
    }
	  
    function restoreOptions () {
        if (!ss.storage.options_tmn) {
            initOptions();
            cout("Init: "+ enabled)
            return;
        }
  
        try {
            var options = JSON.parse(ss.storage.options_tmn);
            enabled = options.enabled;
            debug("Restore: "+ enabled)
            useBlackList = options.use_black_list;
            useDHSList = options.use_dhs_list;
            tmn_timeout = options.timeout;
            burstEnabled = options.burstMode;
            searchEngines = options.searchEngines;
            disableLogs = options.disableLogs;
            saveLogs =  options.saveLogs;
            useTab  = options.useTab;
            if (ss.storage.gen_queries) TMNQueries = JSON.parse(ss.storage.gen_queries);
            feedList = options.feedList;
            if (ss.storage.tmn_id) tmn_id = ss.storage.tmn_id;
            if (ss.storage.logs_tmn) tmnLogs =  JSON.parse( ss.storage.logs_tmn );
            if (ss.storage.url_map_tmn) currentUrlMap = JSON.parse( ss.storage.url_map_tmn);
            if (ss.storage.last_tmn_url && ss.storage.last_tmn_url != '' ) deleteTabWithUrl( ss.storage.last_tmn_url);
            if (options.kw_black_list && opions.kw_black_list.length > 0)  kwBlackList = options.kw_black_list.split(",");   
        } catch (ex) {
            cout('No option recorded: '+ex)	
        }
    }
	  

    function toggleTMN() {
        enabled = !enabled
        return enabled;                       
    }
    
    function restartTMN() {
        createTab(); 
        enabled = true;          
        widget.label  = 'On'
        widget.tooltip =  'On' 
        widget.port.emit("UpdateText", 'TMN : On')  
        scheduleNextSearch(4000);
    }
    
        
    function stopTMN () {    
        enabled = false;  
        saveOptions();
  		
        if ( useTab ) deleteTab(); 
        widget.label  = 'Off'
        widget.tooltip =  'Off' 
        widget.port.emit("UpdateText", 'TMN : Off')  
        timer.clearTimeout(tmn_searchTimer);
        timer.clearTimeout(tmn_errTimeout);
    }
 
    function preserveTMNTab() {
        if ( useTab && enabled) {
            tmn_tab = null;
            cout('TMN tab has been deleted by the user, reload it');
            createTab();
            return;  
        }
    }
    function formatNum ( val) {
        if (val < 10) return '0'+val;
        return val   
    }
    		
    function log (entry) {
        if (disableLogs) return;
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
    }

    function sendClickEvent() {
        try {
            worker_tab.port.emit("TMNClickResult",{"tmn_engine":prev_engine});
        }catch(ex){
            cout(ex)
        }
    }
      
    function handleRequest(request, sender, sendResponse) {
        if (request.tmnLog) {
            debug("Background logging : " + request.tmnLog);
            var logtext = JSON.parse(request.tmnLog);
            log(logtext);
            return;   
        } 
        if (request.updateStatus) {
            updateOnSend(request.updateStatus);
            return;
        }
        

    
        debug( "Recieved message: "+ request.tmn)
        //cout("Background page received message: " + request.tmn);   
        switch (request.tmn) {
            case "pageLoaded": //Remove timer and then reschedule;  
                prev_engine = engine;       
                timer.clearTimeout(tmn_errTimeout);
                if (Math.random() < 0.3) {
					var time = roll(1000, 5000)              
                    timer.setTimeout(sendClickEvent , time);
                }
                reschedule();
                var html = request.html;
                extractQueries(html);
                break;
            default:
            // snub them.
    }
} 
       
	
return {

  
    startTMN : function () {    
        restoreOptions();
        
        typeoffeeds.push('zeitgeist');
        TMNQueries.zeitgeist = zeitgeist;
        
        if (TMNQueries.extracted && TMNQueries.extracted.length >0) {
            typeoffeeds.push('extracted');       
        }
        
        if (!load_full_pages) stop_when = "start"
        else stop_when = "end"

        
        typeoffeeds.push('rss');
        TMNQueries.rss = [];  
        var feeds = feedList.split('|');
        for (var i=0;i<feeds.length;i++)
            doRssFetch(feeds[i]);

        if ( useDHSList ) {
            readDHSList();
            typeoffeeds.push('dhs');
        }
        
        var engines = searchEngines.split(',');           
        engine = chooseEngine(engines);
        monitorBurst();

	  
        if (enabled) {           
            widget.label  = 'On'
            widget.tooltip =  'On';
            widget.port.emit("UpdateText", 'TMN : On')    
            createTab(); 
            scheduleNextSearch(4000);
        } else {
            widget.label  = 'Off'
            widget.tooltip =  'Off' 
            widget.port.emit("UpdateText", 'TMN : Off')     
        }
        
        windows.on('close',function() {
            deleteTab();
            if (!saveLogs) 
                ss.storage.logs_tmn = "";
        });
	  
    },

   
 
  
}
  
}();

TRACKMENOT.TMNSearch.startTMN()


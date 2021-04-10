/*******************************************************************************
    This file is part of TrackMeNot).

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
"use strict";

var api;
if (chrome == undefined) {
    api = browser;
} else {
    api = chrome;
}

var _ = api.i18n.getMessage;

if (!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.TMNSearch = function() {
    var tmn_tab_id = -1;

    var debug_ = false;
    var useIncrementals = true;
    var incQueries = [];
    var engine = 'google';
    var tmn_engines= {};
    var TMNQueries = {};
    var zeit_queries = ["facebook", "youtube", "myspace", "craigslist", "ebay", "yahoo", "walmart", "netflix", "amazon", "home depot", "best buy", "Kentucky Derby", "NCIS", "Offshore Drilling", "Halle Berry", "iPad Cases", "Dorothy Provine", "Emeril", "Conan O'Brien", "Blackberry", "Free Comic Book Day", " American Idol", "Palm", "Montreal Canadiens", "George Clooney", "Crib Recall", "Auto Financing", "Katie Holmes", "Madea's Big Happy Family", "Old Navy Coupon", "Sandra Bullock", "Dancing With the Stars", "M.I.A.", "Matt Damon", "Santa Clara County", "Joey Lawrence", "Southwest Airlines", "Malcolm X", "Milwaukee Bucks", "Goldman Sachs", "Hugh Hefner", "Tito Ortiz", "David McLaughlin", "Box Jellyfish", "Amtrak", "Molly Ringwald", "Einstein Horse", "Oil Spill", " Bret Michaels", "Mississippi Tornado", "Stephen Hawking", "Kelley Blue Book", "Hertz", "Mariah Carey", "Taiwan Earthquake", "Justin Bieber", "Public Bike Rental", "BlackBerry Pearl", "NFL Draft", "Jillian Michaels", "Face Transplant", "Dell", "Jack in the Box", "Rebbie Jackson", "Xbox", "Pampers", "William Shatner", "Earth Day", "American Idol", "Heather Locklear", "McAfee Anti-Virus", "PETA", "Rihanna", "South Park", "Tiger Woods", "Kate Gosselin", "Unemployment", "Dukan Diet", "Oil Rig Explosion", "Crystal Bowersox", "New 100 Dollar Bill", "Beastie Boys", "Melanie Griffith", "Borders", "Tara Reid", "7-Eleven", "Dorothy Height", "Volcanic Ash", "Space Shuttle Discovery", "Gang Starr", "Star Trek", "Michael Douglas", "NASCAR", "Isla Fisher", "Beef Recall", "Rolling Stone Magazine", "ACM Awards", "NASA Space Shuttle", "Boston Marathon", "Iraq", "Jennifer Aniston"];
    var tmnLogs = [];
    //var typeoffeeds = ['zeitgeist','rss'];
    var prev_engine = null;  
    var burstEngine = '';
    var burstTimeout = 6000;
    var burstCount = 0;
    
    var tmn_options = {};
    var TMNReq = {};
    var currentUrlMap;
    var tmn_searchTimer = null;
    var tmn_logged_id = 0;
    var tmn_mode = 'timed';
    var tmn_errTimeout = null;
    var tmn_scheduledSearch = false;
    var tmn_hasloaded = false;
    var currentTMNURL = '';
    
    var tmn_options= {};



    var skipex = new Array(
        /calendar/i, /advanced/i, /click /i, /terms/i, /Groups/i,
        /Images/, /Maps/, /search/i, /cache/i, /similar/i, /&#169;/,
        /sign in/i, /help[^Ss]/i, /download/i, /print/i, /Books/i, /rss/i,
        /google/i, /bing/i, /yahoo/i, /aol/i, /html/i, /ask/i, /xRank/,
        /permalink/i, /aggregator/i, /trackback/, /comment/i, /More/,
        /business solutions/i, /result/i, / view /i, /Legal/, /See all/,
        /links/i, /submit/i, /Sites/i, / click/i, /Blogs/, /See your mess/,
        /feedback/i, /sponsored/i, /preferences/i, /privacy/i, /News/,
        /Finance/, /Reader/, /Documents/, /windows live/i, /tell us/i,
        /shopping/i, /Photos/, /Video/, /Scholar/, /AOL/, /advertis/i,
        /Webmasters/, /MapQuest/, /Movies/, /Music/, /Yellow Pages/,
        /jobs/i, /answers/i, /options/i, /customize/i, /settings/i,
        /Developers/, /cashback/, /Health/, /Products/, /QnABeta/,
        /<more>/, /Travel/, /Personals/, /Local/, /Trademarks/,
        /cache/i, /similar/i, /login/i, /mail/i, /feed/i
    );
    
     function trim(s) {
        return s.replace(/\n/g, '');
    }

    function cerr(msg, e) {
        var txt = "[ERROR] " + msg;
        if (e) {
            txt += "\n" + e;
            if (e.message) txt += " | " + e.message;
        } else txt += " / No Exception";
        cout(txt);
    }

    function cout(msg) {
	console.log(msg);
    }

    function debug(msg) {
        if (debug_)
            console.log("DEBUG: " + msg);
    }

    function roll(min, max) {
        return Math.floor(Math.random() * (max + 1)) + min;
    }

    function randomElt(array) {
        debug("Array length: " + array.length);
		var index = Math.floor(Math.random() * array.length)
        return array[index];
    }


// Engine functions

    function getElementsByAttrValue(dom, nodeType, attrName, nodeValue) {
        var outlines = dom.getElementsByTagName(nodeType);
        for (var i = 0; i < outlines.length; i++) {
            if (outlines[i].hasAttribute(attrName) && outlines[i].getAttribute(attrName) === nodeValue)
                return outlines[i];
        }
        return null;
    }





    var default_engines = {"list":[
        {
			id: 'google',
			name: 'Google Search',
			urlmap: "https://www.google.com/search?hl=en&q=|",
			enabled: true,
			regexmap: "^(https?:\/\/[a-z]+\.google\.(co\\.|com\\.)?[a-z]{2,3}\/(search){1}[\?]?.*?[&\?]{1}q=)([^&]*)(.*)$"
		},
        {
            id: 'yahoo',
            name: 'Yahoo! Search',
            urlmap: "http://search.yahoo.com/search;_ylt=" + getYahooId() + "?ei=UTF-8&fr=sfp&fr2=sfp&p=|&fspl=1",
            enabled: true,
            regexmap: "^(https?:\/\/[a-z.]*?search\.yahoo\.com\/search.*?p=)([^&]*)(.*)$",
            host: "([a-z.]*?search\.yahoo\.com)$"
        },
        {
            id: 'bing',
            name: 'Bing Search',
            urlmap: "http://www.bing.com/search?q=|",
            enabled: true,
            regexmap: "^(https?:\/\/www\.bing\.com\/search\?[^&]*q=)([^&]*)(.*)$",
            host: "(www\.bing\.com)$"
        },
        {
            id: 'baidu',
            name: 'Baidu Search',
            urlmap: "http://www.baidu.com/s?wd=|",
            enabled: false,
            regexmap: "^(https?:\/\/www\.baidu\.com\/s\?.*?wd=)([^&]*)(.*)$",
            host: "(www\.baidu\.com)$"
        },
        {
            id: 'aol',
            name: 'Aol Search',
            urlmap: "http://search.aol.com/aol/search?q=|",
            enabled: false,
            regexmap: "^(https?:\/\/[a-z0-9.]*?search\.aol\.com\/aol\/search\?.*?q=)([^&]*)(.*)$",
            host: "([a-z0-9.]*?search\.aol\.com)$"
        }
    ]}



    function getEngineById(id) {
        return tmn_engines.list.filter(function(a) {
            return a.id === id;
        })[0];
    }


   

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
    
    function chooseElt(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }




// Tab functions


    function changeTabStatus(useT) {
        if (useT === tmn_options.useTab) return;
        tmn_options.useTab= useT;
        if (useT) {
            createTab();
        } else {
            deleteTab();
        }
    }									
						  
															
						  
	 

						  
									  
  
												
								 
				   
						
				
						
		 
	 

    function getTMNTab() {
        debug("Trying to access to the tab: " + tmn_tab_id);
        return tmn_tab_id;
    }

    function deleteTab() {
        if (tmn_tab_id === -1) return;
		else {
			api.storage.local.set({"tab_id":-1});
			api.tabs.remove(tmn_tab_id, function() {
				if (api.runtime.lastError) {
					cout("Can't kill tab due to error : "  + api.runtime.lastError.message);
				}
			});
		}
	}
  

    function createTab( pendingRequest) {
        if ( tmn_tab_id !== -1) return;
														
													   
        try {
            api.tabs.create({
                'active': false,
				'url': 'http://www.google.com',
				'pinned' : false
            }, function (e) {initTab(e,pendingRequest)});
        } catch (ex) {
            cerr('Can no create TMN tab:', ex);
        }
    }

    function initTab(tab,pendingRequest) {
        tmn_tab_id = tab.id;
		api.storage.local.set({"tab_id":tmn_tab_id});
        cout( "pending request: " + JSON.stringify(pendingRequest));
        if (pendingRequest!== null) {
            console.log(JSON.stringify(pendingRequest));
            api.tabs.sendMessage( tmn_tab_id, pendingRequest);
            cout('Message sent to the tab: ' + tmn_tab_id + ' : ' + pendingRequest);
        }
    }


  

   



    function monitorBurst() {
        api.webNavigation.onCommitted.addListener(function(e) {
            var url = e.url;
            var tab_id = e.tabId;
            var result = checkForSearchUrl(url);
            if (!result) {
                if (tab_id === tmn_tab_id) {
                    debug("TMN tab trying to visit: " + url);
                }
                return;
            }

            //
            // -- EXTRACT DATA FROM THE URL
            var pre = result[1];
            var query = result[2];
            var post = result[3];
            var eng = result[4];
            var asearch = pre + '|' + post;
            if (tmn_tab_id === -1 || tab_id !== tmn_tab_id) {
                debug("Worker find a match for url: " + url + " on engine " + eng + "!");
                if (tmn_options.burstMode) enterBurst(eng);
                var engine = getEngineById(eng);
                if (engine && engine.urlmap !== asearch) {
                    engine.urlmap = asearch;
                    api.storage.local.set({'engines_tmn':tmn_engines});
                    var logEntry = createLog('URLmap', eng, null, null, null, asearch)
                    log(logEntry);
                    debug("Updated url fr search engine " + eng + ", new url is " + asearch);
                }
            }
        });

    }

    function checkForSearchUrl(url) {
        var result = null;
		var eng;
        for (var i = 0; i < tmn_engines.list.length; i++) {
            eng = tmn_engines.list[i];
            var regex = eng.regexmap;
            //debug("  regex: " + regex + "  ->\n                   " + url);
            result = url.match(regex);
            if (result) {
                cout(regex + " MATCHED! on " + eng.id);
                break;
            }
        }
        if (!result) return null;

        if (result.length !== 4) {
            if (result.length === 6 && eng.id === "google") {
                result.splice(2, 2);
                result.push(eng.id);
                return result;
            }
            cerr("REGEX_ERROR: " + url);
        }
        result.push(eng.id);
        return result;
    }




    function isBursting() {
        return (tmn_options.burstMode && (burstCount > 0));
    }





    function randomQuery() {
		var typeoffeeds = Object.keys(TMNQueries);
        var qtype = randomElt(typeoffeeds);
        var queries = [];
        if (qtype !== 'zeitgeist' && qtype !== 'extracted') {
            var queryset = TMNQueries[qtype];
            queries = randomElt(queryset).words;
        } else queries = TMNQueries[qtype];
        var term = trim(randomElt(queries));
        if (!term || term.length < 1)
            throw new Error(" getQuery.term='" + term + "'");
        return term;
    }

    function validateFeeds(param) {
        TMNQueries.rss = [];
        tmn_options.feedList = param.feeds;
        var feeds = tmn_options.feedList;
        for (var i = 0; i < feeds.length; i++)
            doRssFetch(feeds[i]);
        saveOptions();
    }


    function extractQueries(html) {
        var forbiddenChar = new RegExp("^[ @#<>\"\\\/,;'?{}:?%|\^~`=]", "g");
        var splitRegExp = new RegExp('^[\\[\\]\\(\\)\\"\']', "g");

        if (!html) {
            cout("NO HTML!");
            return;
        }

        var phrases = new Array();
        // Parse the HTML into phrases
        var l = html.split(/((<\?tr>)|(<br>)|(<\/?p>))/i);
        for (var i = 0; i < l.length; i++) {
            if (!l[i] || l[i] == "undefined") continue;
            l[i] = l[i].replace(/(<([^>]+)>)/ig, " ");
            if (/([a-z]+ [a-z]+)/i.test(l[i])) {
				var reg = /([a-z]{4,} [a-z]{4,} [a-z]{4,} ([a-z]{4,} ?) {0,3})/i;
				var matches = reg.exec(l[i]);
				if (!matches || matches.length < 2) continue;
				var newQuery = trim(matches[1]);
				// if ( phrases.length >0 ) newQuery.unshift(" ");
				if (newQuery && phrases.indexOf(newQuery.toLowerCase()) < 0) {
					phrases.push(newQuery.toLowerCase());
					if (!TMNQueries.extracted) TMNQueries.extracted  = [];
					addQuery(newQuery, TMNQueries.extracted);
				}
			}
        }
		
		
		
        //cout(TMNQueries.extracted)
		//if (typeoffeeds.indexOf('extracted') == -1)
		//	typeoffeeds.push('extracted');
       
    }

    function isBlackList(term) {
        if (!tmn_options.use_black_list) return false;
        var words = term.split(/\W/g);
        for (var i = 0; i < words.length; i++) {
            if (tmn_options.kwBlackList.indexOf(words[i].toLowerCase()) >= 0)
                return true;
        }
        return false;
    }

    function queryOk(a) {
        for (let i = 0; i < skipex.length; i++) {
            if (skipex[i].test(a))
                return false;
        }
        return true;
    }

    function addQuery(term, queryList) {
        var noniso = new RegExp("[^a-zA-Z0-9_.\ \\u00C0-\\u00FF+]+", "g");

        term = term.replace(noniso, '');
        term = trim(term);

        if (isBlackList(term))
            return false;

        if (!term || (term.length < 3) || (queryList.indexOf(term) > 0))
            return false;

        if (term.indexOf("\"\"") > -1 || term.indexOf("--") > -1)
            return false;

        // test for negation of a single term (eg '-prison')
        if (term.indexOf("-") === 0 && term.indexOf(" ") < 0)
            return false;

        if (!queryOk(term))
            return false;

        queryList.push(term);
        //gtmn.cout("adding("+gtmn._queries.length+"): "+term);

        return true;
    }


    // returns # of keywords added
    function filterKeyWords(rssTitles) {
        var addStr = ""; //tmp-debugging
        var forbiddenChar = new RegExp("[ @#<>\"\\\/,;'Õ{}:?%|\^~`=]+", "g");
        var splitRegExp = new RegExp('[\\[\\]\\(\\)\\"\']+', "g");
        var wordArray = rssTitles.split(forbiddenChar);

        for (var i = 0; i < wordArray.length; i++) {
            if (!wordArray[i].match('-----')) {
                var word = wordArray[i].split(splitRegExp)[0];
                if (word && word.length > 2) {
                    W: while (i < (wordArray.length) && wordArray[i + 1] && !(wordArray[i + 1].match('-----') ||
                            wordArray[i + 1].match(splitRegExp))) {
                        var nextWord = wordArray[i + 1]; // added new check here -dch
                        if (nextWord !== nextWord.toLowerCase()) {
                            nextWord = trim(nextWord.toLowerCase().replace(/\s/g, '').replace(/[(<>"'Õ&]/g, ''));
                            if (nextWord.length > 1) {
                                word += ' ' + nextWord;
                            }
                        }
                        i++;
                    }
                    addStr += word.replace(/-----/g, '');
                }
            }
        }
        return addStr;
    }

    // returns # of keywords added
    function addRssTitles(xmlData, feedUrl) {
        var rssTitles = "";

        if (!xmlData) return 0; // only for asynchs? -dch

        var feedTitles = xmlData.getElementsByTagName("title");
        if (!feedTitles || feedTitles.length < 2) {
            cerr("no items(" + feedTitles + ") for rss-feed: " + feedUrl);
            return 0;
        }
        var feedObject = {};
        feedObject.name = feedTitles[0].firstChild.nodeValue;
        feedObject.words = [];
        cout('ADD RSS title : ' + feedTitles[0].firstChild.nodeValue);
        for (var i = 1; i < feedTitles.length; i++) {
            if (feedTitles[i].firstChild) {
                rssTitles = feedTitles[i].firstChild.nodeValue;
                rssTitles += " ----- ";
            }
            var queryToAdd = filterKeyWords(rssTitles);
            addQuery(queryToAdd, feedObject.words);
        }
        cout(feedObject.name + " : " + feedObject.words);
        TMNQueries.rss.push(feedObject);

        return 1;
    }


    function readDHSList() {
        TMNQueries.dhs = [];
        var i = 0;
        var req = new XMLHttpRequest();
        try {
            req.open('GET', "dhs_keywords.json", true);
            req.onreadystatechange = function() {
				  
											
				if (req.readyState === 4) {
					var keywords = JSON.parse(req.responseText).keywords;           
					for (var cat of keywords) {
						TMNQueries.dhs[i] = {};
						TMNQueries.dhs[i].category_name = cat.category_name;
						TMNQueries.dhs[i].words = [];
						for (var word of cat.category_words)
							TMNQueries.dhs[i].words.push(word.name);
						i++;
					}
					return;
				} 
												 
										   
											  
																			   
								  
				 
            }
					   
		   
			req.send();
		  } catch (ex) {
			cout("[WARN]  Can not load DHS list: " + ex.message);
			return
		 }
	}


    function doRssFetch(feedUrl) {
        if (!feedUrl) return;
        cout("Feed Url: " + feedUrl);
        var req = new XMLHttpRequest();
        try {
            req.open('GET', feedUrl, true);
            req.onreadystatechange = function() {
                if (req.readyState === 4) {
                    var doc = req.responseXML;
                    debug(doc);
                    addRssTitles(doc, feedUrl);
                }
            };
            req.send();
        } catch (ex) {
            cout("[WARN]  doRssFetch(" + feedUrl + ")\n" +
                "  " + ex.message + " | Using defaults...");
            return; // no adds here...
        }

    }

    function getSubQuery(queryWords) {
        var incQuery = "";
        var randomArray = new Array();
        for (var k = 0; k < queryWords.length; k++) {
            let randomIndex = roll(0, queryWords.length - 1);
            if (randomArray.indexOf(randomIndex) < 0)
                randomArray.push(randomIndex);
        }
        randomArray.sort();
        for (k = 0; k < randomArray.length - 1 && k < 5; k++) {
            incQuery += queryWords[randomArray[k]] + ' ';
        }
        incQuery += queryWords[randomArray[k]];
        if (incQueries)
            incQueries.push(trim(incQuery));
    }


    function getQuery() {
        var term = randomQuery();
        if (term.indexOf('\n') > 0) { // yuck, replace w' chomp();
            while (true) {
                for (var i = 0; i < term.length; i++) {
                    if (term.charAt(i) === '\n') {
                        term = term.substring(0, i) + ' ' + term.substring(i + 1, term.length);
                        continue;
                    }
                }
                break;
            }
        }
        return term;
    }



    function updateOnErr() {
		try {
			api.browserAction.setBadgeBackgroundColor({'color': [255, 0, 0, 255]});
			api.browserAction.setBadgeText({'text': 'Error'});
			api.browserAction.setTitle({'title': 'TMN Error'});
		} catch (ex){
			debug("browserAction are not supported on mobile")
		}
    }

    function updateOnSend(queryToSend) {
		try{
			api.browserAction.setBadgeBackgroundColor({'color': [113, 113, 198, 255]})
			api.browserAction.setBadgeText({'text': queryToSend});
			api.browserAction.setTitle({'title': engine + ': ' + queryToSend});
		} catch (ex){
			debug("browserAction are not supported on mobile")
		}
    }

    function createLog(type, engine, mode, query, id, asearch) {
        var logEntry = {};
        logEntry.type = type;
        logEntry.engine = engine;
        if (mode) logEntry.mode = tmn_mode;
        if (query) logEntry.query = query;
        if (id) logEntry.id = id;
        if (asearch) logEntry.newUrl = asearch;
        return logEntry;
    }




    function doSearch() {
        var newquery = getQuery();

			   
		if (incQueries && incQueries.length > 0)
			sendQuery(null);
		else {
			newquery = getQuery();
			let queryWords = newquery.split(' ');
			if (queryWords.length > 3) {
				getSubQuery(queryWords);
				if (useIncrementals) {
					var unsatisfiedNumber = roll(1, 4);
					for (var n = 0; n < unsatisfiedNumber - 1; n++)
						getSubQuery(queryWords);
				}
				// not sure what is going on here? -dch
				if (incQueries && incQueries.length > 0)
					newquery = incQueries.pop();
			}
			sendQuery(newquery);
		}
								   
									  
												  
					   
										 
		   
    }


    function sendQuery(queryToSend) {
        tmn_scheduledSearch = false;
        var url_map = getEngineById(engine).urlmap;
        if (queryToSend === null) {
            if (incQueries && incQueries.length > 0)
                queryToSend = incQueries.pop();
            else {
                if (!queryToSend) cout('sendQuery error! queryToSendis null');
                return;
            }
        }
        if (Math.random() < 0.9) queryToSend = queryToSend.toLowerCase();
        if (queryToSend[0] === ' ') queryToSend = queryToSend.substr(1); //remove the first space ;
        tmn_hasloaded = false;
		if (tmn_options.useTab) {
			TMNReq = {};
			TMNReq.tmnQuery = queryToSend;
			TMNReq.tmnEngine = JSON.stringify(getEngineById(engine));
			TMNReq.tmnUrlMap = url_map;
			TMNReq.tmnMode = tmn_mode;
			TMNReq.tmnID = (tmn_options.tmn_id++);
			
			console.log(JSON.stringify(TMNReq));
			if (tmn_tab_id === -1) {
				createTab(TMNReq);
			} else {		
				api.tabs.get(tmn_tab_id, function( tab) {
					if (api.runtime.lastError) {
						console.log(api.runtime.lastError.message);
						tmn_tab_id = -1;
						createTab(TMNReq);
					} else {
						api.tabs.sendMessage(tab.id, TMNReq);
					}
				});
				cout('Message sent to the tab: ' + tmn_tab_id + ' : ' + TMNReq);
			}
		}
		else {
            var queryURL = queryToURL(url_map, queryToSend);
			api.cookies.getAll({'url': queryURL}, function(cookies) {sendBackgroundQuery( cookies, queryURL,queryToSend)} );
        }
    }
	
	
	function sendBackgroundQuery( cookies, queryURL,queryToSend) {
		var cookies_string = cookies.map(function (x) {return x.name + "="+ x.value;}).join("; ");
		cout("The encoded URL is " + queryURL)
		fetch(queryURL, {
				headers: {
					"cookie": cookies_string
				}
				}
			).then(function(response) {
			if (response.ok){
				clearTimeout(tmn_errTimeout);
				 var logEntry = {
						'type': 'query',
						"engine": engine,
						'mode': tmn_mode,
						'query': queryToSend,
						'id': tmn_options.tmn_id++
				 };
				 log(logEntry);
				 tmn_hasloaded = true;
				 reschedule();
			}
		})
		updateOnSend(queryToSend);
		currentTMNURL = queryURL;
	}


    function queryToURL(url, query) {
        query = query.toLowerCase();
        var urlQuery = url.replace('|', query);
        urlQuery = urlQuery.replace(/ /g, '+');
        var encodedUrl = encodeURI(urlQuery);
        encodedUrl = encodedUrl.replace(/%253/g, "%3");

        return encodedUrl;
    }




    function rescheduleOnError() {
        var pauseAfterError = Math.max(2 * tmn_options.timeout, 60000);
        tmn_mode = 'recovery';
        burstCount = 0;
        cout("[INFO] Trying again in " + (pauseAfterError / 1000) + "s");
        log({
            'type': 'ERROR',
            'message': 'next search in ' + (pauseAfterError / 1000) + "s",
            'engine': engine
        });
        updateOnErr();

        // reschedule after long pause
        if (tmn_options.enabled)
            scheduleNextSearch(pauseAfterError);
    }

    function reschedule() {
        var delay = tmn_options.timeout;

        if (tmn_scheduledSearch) return; 
        tmn_scheduledSearch = true;

        if (isBursting()) { // schedule for burs
            delay = Math.min(delay, burstTimeout);
            scheduleNextSearch(delay);
            tmn_mode = 'burst';
            burstCount--;
        } else { // Not bursting, schedule per usual
            tmn_mode = 'timed';
            scheduleNextSearch(delay);
        }
    }


//Cleaning stop here
    function scheduleNextSearch(delay) {
        if (!tmn_options.enabled) return;
        if (delay > 0) {
            if (!isBursting()) { // randomize to approach target frequency
                var offset = delay * (Math.random() / 2);
                delay = parseInt(delay) + offset;
            } else { // just simple randomize during a burst
                delay += delay * (Math.random() - .5);
            }
        }
        prev_engine = engine;
        if (isBursting()) engine = burstEngine;
        else engine = chooseElt(tmn_engines.list.filter(function (x) {return x.enabled})).id;
        debug('NextSearchScheduled on: ' + engine);
        window.clearTimeout(tmn_errTimeout);
        tmn_errTimeout = window.setTimeout(rescheduleOnError, delay * 3);
        window.clearTimeout(tmn_searchTimer);
        tmn_searchTimer = window.setTimeout(doSearch, delay);
    }

    function enterBurst(burst_engine) {
        if (!tmn_options.burstMode) return;
        cout("Entering burst mode for engine: " + burst_engine);
        var logMessage = {
            'type': 'info',
            'message': 'User made a search, start burst',
            'engine': burst_engine
        };
        log(logMessage);
        burstEngine = burst_engine;
        burstCount = roll(3, 10);
    }

    function saveOptions() {
        cout("Save option: " + JSON.stringify(tmn_options));

        api.storage.local.set({"options_tmn":tmn_options});
        api.storage.local.set({"engines_tmn":tmn_engines});
        api.storage.local.set({"gen_queries":TMNQueries});
    }


    function stopTMN() {
        tmn_options.enabled= false;
        deleteTab();
		try {
			api.browserAction.setBadgeBackgroundColor({'color': [255, 0, 0, 255]});
			api.browserAction.setBadgeText({'text': 'Off'});
			api.browserAction.setTitle({'title': 'Off'});
		} catch (ex) {
			debug("browserAction are not supported on mobile")
		}
        window.clearTimeout(tmn_searchTimer);
        window.clearTimeout(tmn_errTimeout);
    }

    function formatNum(val) {
        if (val < 10) return '0' + val;
        return val;
    }

    function log(entry) {
        if (tmn_options.disableLogs) return;
        try {
            if (entry !== null) {
                if (entry.type === 'query') {
                    if (entry.id && entry.id === tmn_logged_id) return;
                    tmn_logged_id = entry.id;
                }
                var now = new Date();
                entry.date = formatNum(now.getHours()) + ":" + formatNum(now.getMinutes()) + ":" + formatNum(now.getSeconds()) +
                             '   ' + (now.getMonth() + 1) + '/' + now.getDate() + '/' + now.getFullYear();
            }
        } catch (ex) {
            cout("[ERROR] " + ex + " / " + ex.message + "\nlogging msg");
        }
        tmnLogs.unshift(entry);
        api.storage.local.set({"logs_tmn":tmnLogs});
    }

    function sendClickEvent() {
        if (!prev_engine) return;
        cout("Will send click event on: " + prev_engine);
        try {
            api.tabs.sendMessage(tmn_tab_id, {
                "click_eng": getEngineById(prev_engine)
            });
        } catch (ex) {
            cout(ex);
        }
    }
    
     function startTMN() {
            scheduleNextSearch(4000);
            monitorBurst();
            api.windows.onRemoved.addListener(function() {
                if (!tmn_options.saveLogs)
                    api.storage.local.set({"logs_tmn":""});
            });

    }
	function getTMNHTML() {
			var  req = {}
			req.getTMNHTML ="gethtml";
			api.tabs.sendMessage(tmn_tab_id, req);
			//cout('Message sent to the tab: ' + tmn_tab_id + ' : ' + JSON.stringify(req));
	}



    function handleRequest(request, sender, sendResponse) {
        if (request.tmnLog) {
            cout("Background logging : " + request.tmnLog);
            var logtext = JSON.parse(request.tmnLog);
            log(logtext);
            sendResponse({});
            return;
        }
        if (request.updateStatus) {
            updateOnSend(request.updateStatus);
            sendResponse({});
            return;
        }
        if (request.getURLMap) {
            var engine = request.getURLMap;
            var urlMap = currentUrlMap[engine];
            sendResponse({"url": urlMap});
            return;
        }
        if (request.setURLMap) {
            cout("Background handling : " + request.setURLMap);
            var vars = request.setURLMap.split('--');
            var eng = vars[0];
            var asearch = vars[1];
            currentUrlMap[eng] = asearch;
            api.storage.local.set({"url_map_tmn":currentUrlMap});
            var logEntry = {};
            logEntry.type = 'URLmap';
            logEntry.engine = eng;
            logEntry.newUrl = asearch;
            TRACKMENOT.TMNSearch.log(logEntry);
            sendResponse({});
            return;
        }

        switch (request.tmn) {			   
            case "pageLoaded": 
                if (!tmn_hasloaded) {
                    tmn_hasloaded = true;
                    clearTimeout(tmn_errTimeout);
                    reschedule();
                    if (tmn_options.sim_clicks && (Math.random() < 0.3) ) {
                        var time = roll(10, 1000);
                        window.setTimeout(sendClickEvent, time);
                    } else {
						window.setTimeout(getTMNHTML, 1000);
					}					
                }
				sendResponse({});
                break;
            case "setHTML":
				//cout("The content of the page is:" + request.html);
				extractQueries(request.html);
				brek;
			case "tmnError": //Remove timer and then reschedule;
                clearTimeout(tmn_errTimeout);
                rescheduleOnError();
                sendResponse({});
                break;
            case "TMNValideFeeds":
                validateFeeds(request.param);
                break;
            default:
                sendResponse({}); 
            sendResponse({});
            return;
        }

    }
    
    function setDefaultOptions() {
        tmn_options.enabled= true;
        tmn_options.timeout = 6000;
        tmn_options.burstMode = true;
        tmn_options.useTab= false;
        tmn_options.use_black_list = true;
		tmn_options.sim_clicks = false;
        tmn_options.use_dhs_list = false;
        tmn_options.kwBlackList = ['bomb', 'porn', 'pornographie'];
        tmn_options.saveLogs= true;
        tmn_options.feedList = ['http://www.techmeme.com/index.xml','http://rss.slashdot.org/Slashdot/slashdot','http://feeds.nytimes.com/nyt/rss/HomePage'];
        tmn_options.disableLogs= false;
        tmn_options.tmn_id = 0;     
    }
    
    function initQueries() {    
        TMNQueries = {};
        TMNQueries.zeitgeist = zeit_queries;
        
        
        TMNQueries.rss = [];
        let feeds = tmn_options.feedList;
        feeds.forEach(doRssFetch); 
           
        if (tmn_options.use_dhs_list ) {
            readDHSList();
         } 
    }

    function onError(error) {
      console.log(`Error: ${error}`);
    }

	function getStorage(keys,callback) {
		try {
			let gettingItem = api.storage.local.get(keys);
			gettingItem.then(callback, onError);
		} catch (ex) {
			chrome.storage.local.get(keys,callback); 
		}   
	}

    function setDefaultEngines() {
        tmn_engines = default_engines;
    }
    
    
    function restoreOptions (items) {
		for (var key in items) {
			tmn_options[key] = items[key];
		}
        debug("Restore: " + tmn_options.enabled);
       
        if (tmn_options.feedList) {
            initQueries();  
        }
		changeTabStatus(tmn_options.useTab);   
				
													 
   


												 
		try{
			if (tmn_options.enabled) {
				api.browserAction.setBadgeText({'text': 'ON'});
				api.browserAction.setTitle({'title': 'TMN is ON'});
			} else {
				api.browserAction.setBadgeText({'text': 'OFF'});
				api.browserAction.setTitle({'title': 'TMN is OFF'});
			}
		} catch (ex) {
			debug("browserAction are not supported on mobile")
		}
        
    }
    
    function updateOptions (item) {
        
        if ( tmn_options.feedList !== item.feedList  ){
            tmn_options.feedList = item.feedList ;
            if (tmn_options.feedList) {
                initQueries();  
            }
        }

        if ( tmn_options.enabled !== item.enabled  ){
            tmn_options.enabled = item.enabled;
            if (tmn_options.enabled)  startTMN();
            else stopTMN();
        }


		changeTabStatus(item.useTab); 							  
		try {
			if (item.enabled) {
				api.browserAction.setBadgeText({'text': 'ON'});
				api.browserAction.setTitle({'title': 'TMN is ON'});
			} else {
				api.browserAction.setBadgeText({'text': 'OFF'});
				api.browserAction.setTitle({'title': 'TMN is OFF'});
			}
		} catch (ex) {
			debug("browserAction are not supported on mobile")
		}
		tmn_options = item;
		
    }
    
    

    
    function setEngines(item) {
        if(item) {
            tmn_engines = item;
        } else {
            tmn_engines = default_engines;
            api.storage.local.set({"engines_tmn":tmn_engines});
        }
    }
	
	function restoreQueries(item) {
		if (item) {
			TMNQueries = item;
		}
	}
	
	




    return {

        _handleRequest: function(request, sender, sendResponse) {
            handleRequest(request, sender, sendResponse);
        },

        _logStorageChange: function (items) {
            if ('options_tmn' in items) 
                updateOptions(items.options_tmn.newValue);
            if ('engines_tmn' in items)
                setEngines(items.engines_tmn.newValue);        
        },
        
        _restoreTMN: function (items) {
            if (!items["engines_tmn"]) {			
               setDefaultEngines(); 
            } else {       
			   restoreQueries(items["gen_queries"]);
               setEngines(items["engines_tmn"]); 
            }
            
			setDefaultOptions();
            if (!items["options_tmn"]) {         
											   
									
                cout("Init: " + tmn_options.enabled);
            } else {
                restoreOptions(items["options_tmn"]);
            }
            initQueries();
			
			if (!items["tab_url"]) {
				tmn_tab_id = -1; 
			} else {
				api.tabs.query({'pinned':false, 'url': items["tab_url"]}, function(tabs) {
					if (tabs.length !==0 ) {
						cout("Restoring tab "+ tabs[0].id)
						tmn_tab_id = tabs[0].id;
					} else {
						cout("creating new tab");
					}
				}) 
			}
	
			
            		
            try {
                tmnLogs = items(["logs_tmn"]);
            } catch (ex) {
                tmnLogs = [];
                cout("can not restore logs")
            }
            saveOptions();
            startTMN();

        },
        

        _getEngine: function() {
            return engine;
        },


       
        _getQueries: function() {
	  
   
            return TMNQueries; 
        },
        
         _getStorage: function(keys,callback) {
            getStorage(keys,callback);
         },
		 

        _resetSettings: function () {			
            setDefaultEngines(); 
            setDefaultOptions();
            initQueries();
        
            try {
                tmnLogs = items(["logs_tmn"]);
            } catch (ex) {
                tmnLogs = [];
                cout("can not restore logs")
            }
            saveOptions();

        },
		
		 _preserveTMNTab: function(tab_id) {
            if (tmn_tab_id===tab_id) {
                tmn_tab_id = -1;
				api.storage.local.set({"tab_id":tmn_tab_id});
                cout('TMN tab has been deleted by the user, reload it');
                return;
            }
        },


		_onUpdatedTab : function ( tabId) {
			if ( tabId=== tmn_tab_id){
				 if (!tmn_hasloaded) {
                    tmn_hasloaded = true;
                    clearTimeout(tmn_errTimeout);
                    reschedule();
					api.tabs.get(tabId, function(tab) {
						 api.storage.local.set({"tab_url":tab.url});
					});					
                    if (tmn_options.sim_clicks && (Math.random() < 0.3) ) {
                        var time = roll(10, 1000);
                        window.setTimeout(sendClickEvent, time);
                    } else {
						window.setTimeout(getTMNHTML, 1000);
					}	
                }
			}
		},
		
		_deleteOpenedTab : function (tab) {
			if ( tab.openerTabId === tmn_tab_id)
				api.tabs.remove(tmn_tab_id, function() {
							if (api.runtime.lastError) {
								cout("Can't kill tab due to error : "  + api.runtime.lastError.message);
							}
				});
		},
		
		_deleteTMNTab : function() {
			api.tabs.remove(tmn_tab_id);
		}
		

    }

}();

																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																							
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																							
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																							
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																							
																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																																							
	 
																   
			 
										 
 


api.runtime.onMessage.addListener(TRACKMENOT.TMNSearch._handleRequest);
// Used to prevent Yahoo! from opening new tabs, but block all tab opened from tmn tab
api.tabs.onCreated.addListener(function(created_tab) {          
		TRACKMENOT.TMNSearch._deleteOpenedTab(created_tab);   
});

api.tabs.onUpdated.addListener(function(updated_tab_id) {          
		TRACKMENOT.TMNSearch._onUpdatedTab(updated_tab_id);   
});

api.windows.onRemoved.addListener(TRACKMENOT.TMNSearch._deleteTMNTab);

api.tabs.onRemoved.addListener(TRACKMENOT.TMNSearch._preserveTMNTab);
TRACKMENOT.TMNSearch._getStorage(["options_tmn","gen_queries","engines_tmn","logs_tmn","tab_id","tab_url"],TRACKMENOT.TMNSearch._restoreTMN);
api.storage.onChanged.addListener(TRACKMENOT.TMNSearch._logStorageChange);
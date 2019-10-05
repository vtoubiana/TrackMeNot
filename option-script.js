"use strict";

var api;
if (chrome == undefined) {
    api = browser;
} else {
    api = chrome;
}


var tmn_options = {};
var tmn_engines ={};
var tmn = api.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
var options = {};




function loadHandlers() {
    $("#apply-options").unbind().click(function() {
         saveOptions();
         updateEngineList();
    });
	
	
	$("#clear-options").unbind().click(function() {
         clearOptions();
         updateEngineList();
    });

    $("#trackmenot-opt-help").unbind().click(function() {
        api.tabs.create({
            url: "http://cs.nyu.edu/trackmenot/faq.html#options"
        });
    });

    $("#trackmenot-opt-site").unbind().click(function() {
        api.tabs.create({
            url: "https://cs.nyu.edu/trackmenot"
        });

    });

    $("#show-add").unbind().click(function() {
        $("#add-engine-table").show();
    });
    $("#show-log").unbind().click(function() {
        api.storage.local.get(["logs_tmn"],TMNShowLog);
    });

    $("#trackmenot-opt-showqueries").click(function() {
        var tmn = api.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
        var queries = tmn._getQueries();
        TMNShowQueries(queries);
    });
	
	$("#overlay_logs").unbind().click(TMNHideLog);
	
	$("#overlay_queries").unbind().click(TMNHideQueries);

    $("#validate-feed").unbind().click(function() {
        var feeds = $("#trackmenot-seed").val();
        var param = {
            "feeds": feeds
        };
        api.runtime.sendMessage({
            'tmn': "TMNValideFeeds",
            'param': param
        });
    });

    $("#clear-log").unbind().click(function() {
        api.storage.local.set({"logs_tmn":""});
    });


    $("#search-engine-list").on('click', 'button.smallbutton', function(event) {
        var del_engine = event.target.id.split("_").pop();
        delEngine(del_engine);
    });

    $("#trackmenot-opt-timeout").change(function() {
        var timeout = $("#trackmenot-opt-timeout").val();
        setFrequencyMenu(timeout);
    });



    $("#add-engine").unbind().click(function() {
        var engine = {};
        engine.name = $("#newengine-name").val();
        engine.urlmap = $("#newengine-map").val();
        if (engine.urlmap.indexOf('trackmenot') < 0) {
            alert("To add a new search engine url, search 'trackmenot' (without the quotes) on your desired search engine. Then, copy and paste the search url in the URL text box below.");
            return;
        }
        addEngine(engine);
    });
}

    function getEngIndexById(id) {
        for (var i = 0; i < tmn_engines.list.length; i++) {
            if (tmn_engines.list[i].id === id) return i;
        }
        return -1;
    }

     function updateEngineList() {
        tmn_engines.list.forEach(function (x) {return x.enabled = false;});
        $("#search-engine-list :checked").each(function() {
            console.log(($(this).val()));
            tmn_engines.list[getEngIndexById($(this).val())].enabled = true ;
        });
        api.storage.local.set({'engines_tmn':tmn_engines});
									
    }
    
    function clearOptions() {
		var tmn = api.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
		api.storage.local.clear();
		tmn._resetSettings();
		getStorage(["engines_tmn","options_tmn"],TMNLoadOptionWindow );
	}

      function addEngine(param) {

        var new_engine = {};
        new_engine.name = param.name;
        new_engine.id = new_engine.name.toLowerCase();
        new_engine.urlmap = param.urlmap.replace('trackmenot', '|');
        var query_params = new_engine.urlmap.split('|');
        var kw_param = query_params[0].split('?')[1].split('&').pop();
        new_engine.regexmap = '^(' + new_engine.urlmap.replace(/\//g, "\\/").replace(/\./g, "\\.").split('?')[0] + "\\?.*?[&\\?]{1}" + kw_param + ")([^&]*)(.*)$";
        new_engine.enabled = true;
        tmn_engines.list.push(new_engine);
        //cout("Added engine : " + new_engine.name + " url map is " + new_engine.urlmap);
		TMNShowEngines(tmn_engines) 
        updateEngineList();
    }



    function delEngine(del_engine) {
        tmn_engines.list = tmn_engines.list.filter(function(x) {return x.id !== del_engine;});
		TMNShowEngines(tmn_engines) 
        updateEngineList();
    }
    
    
function TMNSetOptionsMenu(item) {
    options =item; 
    var feedList = options.feedList.join('|');
    
    var kw_black_list = options.kwBlackList;
    //console.log("Enabled: " +options.enabled)
    $("#add-engine-table").hide();
    $("#trackmenot-opt-enabled").prop('checked', options.enabled);
	$("#trackmenot-opt-useTab").prop('checked', options.useTab);
																
    $("#trackmenot-opt-burstMode").prop('checked', options.burstMode);
	$("#trackmenot-opt-sim-clicks").prop('checked', options.sim_clicks);
    $("#trackmenot-opt-save-logs").prop('checked', options.saveLogs);
    $("#trackmenot-opt-disable-logs").prop('checked', options.disableLogs);

    $("#trackmenot-seed").val(feedList);
    $("#trackmenot-blacklist").val(kw_black_list);
    $("#trackmenot-use-blacklist").prop('checked', options.use_black_list);
    $("#trackmenot-use-dhslist").prop('checked', options.use_dhs_list);

    setFrequencyMenu(options.timeout);
}




function setFrequencyMenu(timeout) {
    $('#trackmenot-opt-timeout option[value=' + timeout + ']').prop('selected', true);
}


function TMNHideLog() {
	$('#overlay_logs').css("display","none");
}

function TMNHideQueries() {
	$('#overlay_queries').css("display","none");
}

function TMNShowLog(items) {
    var logs = items.logs_tmn;
    var htmlStr = '<table cellspacing=3 id="overlaytext" width="800px" position="relative">';
    htmlStr += '<thead><tr align=left>';
    htmlStr += '<th>Engine</th>';
    htmlStr += '<th>Mode</th>';
    htmlStr += '<th>URL</th>';
    htmlStr += '<th>Query/Message</th>';
    htmlStr += '<th>Date</th>';
    htmlStr += '</tr></thead>';
    for (var i = 0; i < 3000 && i < logs.length; i++) {
        htmlStr += '<tr ';
        if (logs[i].type === 'ERROR') htmlStr += 'style="color:Red">';
        if (logs[i].type === 'query') htmlStr += 'style="color:Black">';
        if (logs[i].type === 'URLmap') htmlStr += 'style="color:Brown">';
        if (logs[i].type === 'click') htmlStr += 'style="color:Blue">';
        if (logs[i].type === 'info') htmlStr += 'style="color:Green">';
        htmlStr += logs[i].engine ? '<td><b>' + logs[i].engine + '</b></td>' : '<td></td>';
        htmlStr += logs[i].mode ? '<td>' + logs[i].mode + '</td>' : '<td></td>';
        htmlStr += logs[i].newUrl ? '<td>' + logs[i].newUrl.substring(0, 50) + '</td>' : '<td></td>';
        htmlStr += logs[i].query ? '<td>' + logs[i].query + '</td>' : '<td></td>';
        htmlStr += logs[i].date ? '<td>' + logs[i].date + '</td>' : '<td></td>';

        htmlStr += '</font></tr>';
    }
    htmlStr += '</table>';
    $('#tmn_logs_container').html(htmlStr);
	$('#overlay_logs').css("display","block");
	//window.setTimeout(TMNShowLog, 1000,items);
}


function TMNShowEngines(item) {
    tmn_engines= item;
    var htmlStr = "<table>";
    for (var i = 0; i < tmn_engines.list.length; i++) {
        var engine = tmn_engines.list[i];
        let is_checked = engine.enabled? " checked " : "";
        htmlStr += '<div id="overlay"><tr >';
        htmlStr += '<td > <label><input valign="top" type="checkbox"  id="' + engine.id + '" value="' + engine.id + '" ' + is_checked +'">' + engine.name + '</label></td><td><button class="smallbutton" id="del_engine_' + engine.id + '" > &nbsp;&nbsp;- &nbsp;&nbsp;</button> </td>';
        htmlStr += '</tr></div>';
    }
    htmlStr += '</table>';
    $('#search-engine-list').html(htmlStr);
    
    loadHandlers();
}

function TMNShowQueries(tmn_queries) {

var htmlStr =  '<div id="quarryarray" style="height:1000px;overflow:auto;"><table witdh=500 cellspacing=3 bgcolor=white  frame=border>';
    if ( tmn_queries.dhs ) {
		htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
		htmlStr += '<td > DHS Monitored <td>';
		htmlStr += '<a name="dhs"></a>';
		htmlStr += '</tr>';
		for (var i=0;  i<tmn_queries.dhs.length ; i++) {
			htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
			htmlStr += '<td>' +tmn_queries.dhs[i].category_name+ '<td>';
			htmlStr += '</tr>';
			for (var j=0;  j< tmn_queries.dhs[i].words.length ; j++) {
				htmlStr += '<tr style="color:Black">';
				htmlStr += '<td>' +tmn_queries.dhs[i].words[j]+ '<td>';
				htmlStr += '</tr>';
			}
		}
    }
	if ( tmn_queries.rss ) {
		htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
		htmlStr += '<td > RSS <td>';
		htmlStr += '<a name="rss"></a>';
		htmlStr += '</tr>';
		for (var i=0;  i<tmn_queries.rss.length ; i++) {
			htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
			htmlStr += '<td>' +tmn_queries.rss[i].name+ '<td>';
			htmlStr += '</tr>';
			for (var j=0;  j< tmn_queries.rss[i].words.length ; j++) {
				htmlStr += '<tr style="color:Black">';
				htmlStr += '<td>' +tmn_queries.rss[i].words[j]+ '<td>';
				htmlStr += '</tr>';
			}
		}
    }
	if ( tmn_queries.zeitgeist ) {
		htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
		htmlStr += '<td > Popular <td>';
		htmlStr += '<a name="popular"></a>';
		htmlStr += '</tr>';
		for (var i=0;  i< tmn_queries.zeitgeist.length ; i++) {
			htmlStr += '<tr style="color:Black">';
			htmlStr += '<td>' +tmn_queries.zeitgeist[i]+ '<td>';
			htmlStr += '</tr>';
		}
    }
	if ( tmn_queries.extracted ) {	
		htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
		htmlStr += '<td > Extracted <td>';
		htmlStr += '<a name="extracted"></a>';
		htmlStr += '</tr>';
		for (var i=0; i<tmn_queries.extracted.length ; i++) {
			htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
			htmlStr += '<td>' +tmn_queries.extracted[i]+ '<td>';
			htmlStr += '</tr>';
		}
	}
    htmlStr += '</table></div>';
    $('#tmn_queries_container').html(htmlStr);
	$('#overlay_queries').css("display","block");
	
}


function saveOptions() {
    var options = {};
    options.enabled = $("#trackmenot-opt-enabled").is(':checked');

    console.log("Saved Enabled: " + options.enabled);
	$("#trackmenot-opt-useTab").prop('checked', options.useTab);
																
    options.burstMode = $("#trackmenot-opt-burstMode").is(':checked');
	options.sim_clicks = $("#trackmenot-opt-sim-clicks").is(':checked');
    options.disableLogs = $("#trackmenot-opt-disable-logs").is(':checked');
    options.saveLogs = $("#trackmenot-opt-save-logs").is(':checked');
    options.timeout = $("#trackmenot-opt-timeout").val();

	updateEngineList();
    options.feedList = $("#trackmenot-seed").val().split('|');
    options.use_black_list = $("#trackmenot-use-blacklist").is(':checked');
    options.use_dhs_list = $("#trackmenot-use-dhslist").is(':checked');
    options.kwBlackList = $("#trackmenot-blacklist").val().split(",");
    api.storage.local.set({"options_tmn":options});
	
	
}

function handleRequest(request, sender, sendResponse) {
    if (!request.options) return;
    switch (request.options) {
        case "TMNSendQueries":
            TMNShowQueries(request.param);
            sendResponse({});
            break;
        default:
            sendResponse({}); // snub them.
    }


}

function onError(){
	console.log("Error");
}

function getStorage(keys,callback) {
    try {
        let gettingItem = api.storage.local.get(keys);
        gettingItem.then(callback, onError);
    } catch (ex) {
        api.storage.local.get(keys,callback); 
    }   
}


function TMNLoadOptionWindow(items) {
    if (items["options_tmn"]) {
        TMNSetOptionsMenu(items["options_tmn"]);
    }
    if (items["engines_tmn"]) {
        TMNShowEngines(items["engines_tmn"]);
    }
    
}

window.addEventListener('load', function() {
    getStorage(["engines_tmn","options_tmn"],TMNLoadOptionWindow );
});




api.runtime.onMessage.addListener(handleRequest);

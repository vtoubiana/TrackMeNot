var api;
if (chrome === undefined) {
    api = browser;
} else {
    api = chrome;
}

var tmn_options = {};
var tmn_engines;
var tmn = api.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
var options = {};



function loadHandlers() {
    $("#apply-options").click(function() {
         saveOptions();
         updateEngineList();
    });

    $("#trackmenot-opt-help").click(function() {
        api.tabs.create({
            url: "http://cs.nyu.edu/trackmenot/faq.html#options"
        });
    });

    $("#trackmenot-opt-site").click(function() {
        api.tabs.create({
            url: "https://cs.nyu.edu/trackmenot"
        });

    });

    $("#show-add").click(function() {
        $("#add-engine-table").show();
    });
    $("#show-log").click(function() { //event
        api.storage.local.get(["logs_tmn"], TMNShowLog); 
    });

    $("#download-log").click(function() {
        api.storage.local.get(["logs_tmn"], TMNDownload); 
    });

    $("#trackmenot-opt-showqueries").click(function() {
        var tmn = api.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
        var queries = tmn._getQueries();
        TMNShowQueries(queries)
    });

    $("#validate-feed").click(function() {
        var feeds = $("#trackmenot-seed").val();
        var param = {
            "feeds": feeds
        };
        api.runtime.sendMessage({
            'tmn': "TMNValideFeeds",
            'param': param
        });
    });

    $("#clear-log").click(function() {
        api.storage.local.set({"logs_tmn":""});
    });


    $("#search-engine-list").on('click', 'button.smallbutton', function(event) {
        var del_engine = event.target.id.split("_").pop();
        delEngine(del_engine);
    });

    $("#trackmenot-opt-timeout").change(function() {
        timeout = $("#trackmenot-opt-timeout").val();
        setFrequencyMenu(timeout);
    });



    $("#add-engine").click(function() {
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


    var $idown;  // Keep it outside of the function, so it's initialized once.
    function downloadURL (url) {
          if ($idown) {
            $idown.attr('src',url);
          } else {
            $idown = $('<iframe>', { id:'idown', src:url }).hide().appendTo('body');
          }
    }


    function getEngIndexById(id) {
        for (var i = 0; i < tmn_engines.length; i++) {
            if (tmn_engines[i].id == id) return i
        }
        return -1
    }

     function updateEngineList() {
        tmn_engines.forEach(function (x) {return x.enabled = false;});
        $("#search-engine-list :checked").each(function() {
            console.log(($(this).val()));
            tmn_engines[getEngIndexById($(this).val())].enabled = true ;
        });
        api.storage.local.set({'engines':tmn_engines});
        TMNShowEngines({'engines':tmn_engines});
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
        tmn_engines.push(new_engine);
        //cout("Added engine : " + new_engine.name + " url map is " + new_engine.urlmap);
        updateEngineList();
    }



    function delEngine(del_engine) {
        tmn_engines = tmn_engines.filter(function(x) {return x.id !== del_engine;});
        updateEngineList();
    }
    
    
function TMNSetOptionsMenu(items) {
    var options =items.options_tmn; 
    var feedList = options.feedList.join('|');
    
    var kw_black_list = options.kwBlackList;
    //console.log("Enabled: " +options.enabled)
    $("#add-engine-table").hide();
    $("#trackmenot-opt-enabled").prop('checked', options.enabled);
    $("#trackmenot-opt-useTab").prop('checked', options.useTab);
    $("#trackmenot-opt-burstMode").prop('checked', options.burstMode);
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


// Returns a csv from an array of objects with
// values separated by tabs and rows separated by newlines
function TMNDownload(items) {
    
    var logs = items.logs_tmn;
    var rows = []
    var header = ["date", "engine", "id", "mode", "query","type"];
    rows.push(header);
    for (i =0; i<logs.length; i++){
       var column = [];
       var keys = Object.keys(logs[i])
       if (keys.includes("date")){
            column.push(logs[i].date)
       }else{
            column.push(" ");
       }
       if (keys.includes("engine")){
            column.push(logs[i].engine)
       }else{
            column.push(" ");
       }
       if (keys.includes("id")){
            column.push(logs[i].id)
       }else{
            column.push(" ");
       }
       if (keys.includes("mode")){
            column.push(logs[i].mode)
       }else{
            column.push(" ");
       }
        if (keys.includes("query")){
            column.push(logs[i].query)
       }else{
            column.push(" ");
       }
        if (keys.includes("type")){
            column.push(logs[i].type)
       }else{
            column.push(" ");
       }
       rows.push(column)
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    rows.forEach(function(rowArray){
       let row = rowArray.join(",");
       csvContent += row + "\r\n";
    }); 
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
    
}



function TMNShowLog(items) {
    var logs = items.logs_tmn;
    var htmlStr = '<table cellspacing=3>';
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
    $('#tmn_logs_container').css("visibility","visible");
}


function TMNShowEngines(items) {
    tmn_engines= items.engines;
    var htmlStr = "<table>";
    for (var i = 0; i < tmn_engines.length; i++) {
        var engine = tmn_engines[i];
        let is_checked = engine.enabled? " checked " : "";
        htmlStr += '<tr >';
        htmlStr += '<td><input type="checkbox"  id="' + engine.id + '" value="' + engine.id + '" ' + is_checked +'">' + engine.name + '</td><td><button class="smallbutton" id="del_engine_' + engine.id + '" > - </button> </td>';
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    $('#search-engine-list').html(htmlStr);
    
    loadHandlers();
}

function TMNShowQueries(tmn_queries) {
var htmlStr =  '<a href="#dhs">DHS</a> | <a href="#rss"> RSS </a> | <a href="#popular"> Popular </a>|<a href="#extracted"> Extracted</a>'
	htmlStr += '<div style="height:1000px;overflow:auto;"><table witdh=500 cellspacing=3 bgcolor=white  frame=border>';
    if ( tmn_queries.dhs ) {
		htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
		htmlStr += '<td > DHS Monitored <td>';
		htmlStr += '<a name="dhs"></a>';
		htmlStr += '</tr>';
		for (var i=0;  i<tmn_queries.dhs.length ; i++) {
			htmlStr += '<tr style="color:Black"  bgcolor=#F0F0F0 align=center>';
			htmlStr += '<td>' +tmn_queries.dhs[i].category_name+ '<td>'
			htmlStr += '</tr>';
			for (var j=0;  j< tmn_queries.dhs[i].words.length ; j++) {
				htmlStr += '<tr style="color:Black">';
				htmlStr += '<td>' +tmn_queries.dhs[i].words[j]+ '<td>'
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
			htmlStr += '<td>' +tmn_queries.rss[i].name+ '<td>'
			htmlStr += '</tr>';
			for (var j=0;  j< tmn_queries.rss[i].words.length ; j++) {
				htmlStr += '<tr style="color:Black">';
				htmlStr += '<td>' +tmn_queries.rss[i].words[j]+ '<td>'
				htmlStr += '</tr>';
			}
		}
    }
	if ( tmn_queries.zeitgeist ) {
		htmlStr += '<tr style="color:Black"  bgcolor=#D6E0E0 align=center>';
		htmlStr += '<td > Popular <td>'
		htmlStr += '<a name="popular"></a>';
		htmlStr += '</tr>';
		for (var i=0;  i< tmn_queries.zeitgeist.length ; i++) {
			htmlStr += '<tr style="color:Black">';
			htmlStr += '<td>' +tmn_queries.zeitgeist[i]+ '<td>'
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
			htmlStr += '<td>' +tmn_queries.extracted[i]+ '<td>'
			htmlStr += '</tr>';
		}
	}
    htmlStr += '</table></div>';
    $('#tmn_logs_container').html(htmlStr);
    $('#tmn_logs_container').css("visibility","visible");
}


function saveOptions() {
    options = {};
    options.enabled = $("#trackmenot-opt-enabled").is(':checked');

    console.log("Saved Enabled: " + options.enabled);
    options.useTab = $("#trackmenot-opt-useTab").is(':checked');
    options.burstMode = $("#trackmenot-opt-burstMode").is(':checked');
    options.disableLogs = $("#trackmenot-opt-disable-logs").is(':checked');
    options.saveLogs = $("#trackmenot-opt-save-logs").is(':checked');
    options.timeout = $("#trackmenot-opt-timeout").val();
    //setFrequencyMenu(options.timeout);

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

function getStorage(keys,callback) {
    try {
        api.storage.local.get(keys,callback);
    } catch(ex) {
        let gettingItem = api.storage.local.get(keys);
        gettingItem.then(callback, onError);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    api.storage.local.get(["options_tmn"],TMNSetOptionsMenu)
    api.storage.local.get(["engines"],TMNShowEngines);
});




api.runtime.onMessage.addListener(handleRequest);

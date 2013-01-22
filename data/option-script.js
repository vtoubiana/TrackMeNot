
var tmn_options ={};


$("#apply-options").click( function() {	
    tmn_options = {"options":saveOptions()};	 	  			 
    TMNSetOptionsMenu(tmn_options);
    alert("Configuration saved");
    self.port.emit("TMNSaveOptions",tmn_options.options);
    }
);

$("#show-log").click( function() {	
    self.port.emit("TMNOptionsShowLog");
    }
);

$("#trackmenot-opt-showqueries").click( function() {	
    self.port.emit("TMNOptionsShowQueries");
    }
);

$("#validate-feed").click( function() {	
    var feeds = $("#trackmenot-seed").val();
    var param = {"feeds": feeds}
    self.port.emit("TMNValideFeeds",param);
    }
);

$("#clear-log").click( function() {	
    self.port.emit("TMNOptionsClearLog");
    }
);
	


function TMNSetOptionsMenu( tab_inputs) {
    var options = tab_inputs.options;
    var feedList = options.feedList;
    var kw_black_list = options.kw_black_list;
    console.log("Enabled: " +options.enabled)

  	$("#trackmenot-opt-enabled").prop('checked', options.enabled);
  	$("#trackmenot-opt-useTab").prop('checked',options.useTab);
  	$("#trackmenot-opt-burstMode").prop('checked',options.burstMode);
  	$("#trackmenot-opt-burstEnabled").prop('checked',options.burstMode);

	
    $("#trackmenot-seed").val(feedList);
	  $("#trackmenot-blacklist").val(kw_black_list);
	  $("#trackmenot-use-blacklist").prop('checked', options.use_black_list);
	
    var engines = options.searchEngines.split(',');
    for( var i=0; i< engines.length;i++) 
        $("#"+engines[i]).prop('checked',true);

    setFrequencyMenu(options.timeout);
}





function setFrequencyMenu(timeout){
    var menu = $("#trackmenot-opt-timeout");
    $('#trackmenot-opt-timeout option[value=' +timeout+ ']').prop('selected', true);
}

	

	
  
function TMNShowLog(tmnlogs) {
	var logs = tmnlogs.logs
    var htmlStr = '<table witdh=500 cellspacing=3 bgcolor=white  frame=border>';
    htmlStr += '<thead><tr align=left>';        
    htmlStr += '<th>Engine</th>';
    htmlStr += '<th>Mode</th>';
    htmlStr += '<th>URL</th>';
    htmlStr += '<th>Query/Message</th>';
    htmlStr += '<th>Date</th>';
    htmlStr += '</tr></thead>';
    for (var i=0; i< 3000 && i<logs.length ; i++) {
        htmlStr += '<tr ';
        if (logs[i].type == 'ERROR') htmlStr += 'style="color:Red">';
        if (logs[i].type == 'query') htmlStr += 'style="color:Black">';
        if (logs[i].type == 'URLmap') htmlStr += 'style="color:Brown">';
        if (logs[i].type == 'click') htmlStr += 'style="color:Blue">';
        if (logs[i].type == 'info') htmlStr += 'style="color:Green">';
        htmlStr += logs[i].engine ? '<td><b>' + logs[i].engine+ '</b></td>'  : '<td></td>';
        htmlStr += logs[i].mode ? '<td>' + logs[i].mode+ '</td>'  : '<td></td>';
        htmlStr += logs[i].newUrl ? '<td>' + logs[i].newUrl.substring(0,50) + '</td>'  : '<td></td>';
        htmlStr += logs[i].query ? '<td>' + logs[i].query+ '</td>'  : '<td></td>';
        htmlStr += logs[i].date ? '<td>' + logs[i].date+ '</td>'  : '<td></td>';

        htmlStr += '</font></tr>';
    }
    htmlStr += '</table>';
    $('#tmn_logs_container').html(htmlStr);
}


function TMNShowQueries(param) {
	  var queries = param.queries.split(',');
    var htmlStr = '<table witdh=500 cellspacing=3 bgcolor=white  frame=border>';
    for (var i=0; i< 3000 && i<queries.length ; i++) {
        htmlStr += '<tr style="color:Black">';
        htmlStr += '<td>' +queries[i]+ '<td>'
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    $('#tmn_logs_container').html(htmlStr);
}
  







function saveOptions() {
    var options = {};
    options.enabled =  $("#trackmenot-opt-enabled").is(':checked');
	
	console.log("Saved Enabled: "+options.enabled )
    options.useTab = $("#trackmenot-opt-useTab").is(':checked');
    options.burstMode = $("#trackmenot-opt-burstMode").is(':checked'); 
    options.timeout = $("#trackmenot-opt-timeout").val();
    setFrequencyMenu(options.timeout);

    var engines = '';
    var list = $("#search-engine-list:checked");
    $("#search-engine-list :checked").each(function(){engines+=($(this).val())+","})
    if (engines.length>0)
        engines=engines.substring(0,engines.length-1);
	 
    options.searchEngines = engines;
    options.feedList = $("#trackmenot-seed").val();
    options.use_black_list =  $("#trackmenot-use-blacklist").is(':checked');
    options.kw_black_list =  $("#trackmenot-blacklist").val();
    return options;
}
        
self.port.on("TMNSetOptionsMenu",TMNSetOptionsMenu)
self.port.on("TMNSendLogs",TMNShowLog)
self.port.on("TMNSendQueries",TMNShowQueries)
   
  


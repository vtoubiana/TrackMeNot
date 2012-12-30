
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

$("#clear-log").click( function() {	
    self.port.emit("TMNOptionsClearLog");
    }
);
	


function TMNSetOptionsMenu( tab_inputs) {
    var options = tab_inputs.options;
    var feedList = options.feedList;
    console.log("Enabled: " +options.enabled)

	$("#trackmenot-opt-enabled").prop('checked', options.enabled);
	$("#trackmenot-opt-useTab").prop('checked',options.useTab);
	$("#trackmenot-opt-burstMode").prop('checked',options.burstMode);
	$("#trackmenot-opt-burstEnabled").prop('checked',options.burstMode);

	
    $("#trackmenot-seed").val(feedList);
	
	
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
        htmlStr += logs[i].query ? '<td>' + logs[i].query+ '</td>'  : '<td>'+logs[i].message+'</td>';
        htmlStr += logs[i].date ? '<td>' + logs[i].date+ '</td>'  : '<td></td>';

        htmlStr += '</font></tr>';
    }
    htmlStr += '</table>';
    $('#tmn_logs_container').html(htmlStr);
}
  


function validFeed() {
    var newFeed= getElement(document,"trackmenot-seed").value;
    tmn.updateFeed(newFeed);
    alert(newFeed)
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
    return options;
}
        
self.port.on("TMNSetOptionsMenu",TMNSetOptionsMenu)
self.port.on("TMNSendLogs",TMNShowLog)
   
  


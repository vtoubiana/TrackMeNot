
var tmn_options = {};
var log_shown = false;

function escapeHTML(str) str.replace(/[&"<>]/g, function (m) escapeHTML.replacements[m]);
escapeHTML.replacements = { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };

$("#apply-options").click(function() {
    tmn_options = {"options": saveOptions()};
    TMNSetOptionsMenu(tmn_options);
    alert("Configuration saved");
    self.port.emit("TMNSaveOptions", tmn_options.options);
}
);

$("#reset-options").click(function() {
    alert("Settings reset");
    self.port.emit("TMNResetOptions", "");
}
);

$("#show-add").click(function() {
    $("#add-engine-table").show();
}
);
$("#show-log").click(function() {
    if (!log_shown) {
        self.port.emit("TMNOptionsShowLog");
        $("#show-log").text('Close Log');
        log_shown = true;
    } else {
        $('#tmn_logs_container').html("");
        $("#show-log").text('Show Log');
        log_shown = false;
    }
}
);

$("#trackmenot-opt-showqueries").click(function() {
    self.port.emit("TMNOptionsShowQueries");
}
);

$("#validate-feed").click(function() {
    var feeds = $("#trackmenot-seed").val();
    var param = {"feeds": feeds};
    self.port.emit("TMNValideFeeds", param);
}
);

$("#clear-log").click(function() {
    self.port.emit("TMNOptionsClearLog");
}
);


$("#search-engine-list").on('click', 'button.smallbutton', function(event) {
    var del_engine = event.target.id.split("_").pop();
    self.port.emit("TMNDelEngine", {'engine': del_engine});
});



$("#add-engine").click(function() {
    var engine = {};
    engine.name = $("#newengine-name").val();
    engine.urlmap = $("#newengine-map").val();
    if (engine.urlmap.indexOf('trackmenot') < 0) {
        alert("Did not find 'trackmenot' in the URL");
        return;
    }
    self.port.emit("TMNAddEngine", engine);
}
);


function TMNSetOptionsMenu(tab_inputs) {
    var options = tab_inputs.options;
    var feedList = options.feedList;
    var kw_black_list = options.kw_black_list;
    console.log("Enabled: " + options.enabled);
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

    var engines = options.searchEngines.split(',');
    for (var i = 0; i < engines.length; i++)
        $("#" + engines[i]).prop('checked', true);

    setFrequencyMenu(options.timeout);
}





function setFrequencyMenu(timeout) {
    var menu = $("#trackmenot-opt-timeout");
    $('#trackmenot-opt-timeout option[value=' + timeout + ']').prop('selected', true);
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
    for (var i = 0; i < 3000 && i < logs.length; i++) {
        htmlStr += '<tr ';
        if (logs[i].type == 'ERROR')
            htmlStr += 'style="color:Red">';
        if (logs[i].type == 'query')
            htmlStr += 'style="color:Black">';
        if (logs[i].type == 'URLmap')
            htmlStr += 'style="color:Brown">';
        if (logs[i].type == 'click')
            htmlStr += 'style="color:Blue">';
        if (logs[i].type == 'info')
            htmlStr += 'style="color:Green">';
        htmlStr += logs[i].engine ? '<td>' + escapeHTML(logs[i].engine) + '</td>' : '<td></td>';
        htmlStr += logs[i].mode ? '<td>' + escapeHTML(logs[i].mode) + '</td>' : '<td></td>';
        htmlStr += logs[i].newUrl ? '<td>' + escapeHTML(logs[i].newUrl.substring(0, 50)) + '</td>' : '<td></td>';
        htmlStr += logs[i].query ? '<td>' + escapeHTML(logs[i].query) + '</td>' : '<td></td>';
        htmlStr += logs[i].date ? '<td>' + escapeHTML(logs[i].date) + '</td>' : '<td></td>';

        htmlStr += '</font></tr>';
    }
    htmlStr += '</table>';
    $('#tmn_logs_container').html(htmlStr);
}


function TMNShowEngines(engines) {
    var htmlStr = "<table>";
    for (var i = 0; i < engines.length; i++) {
        var engine = engines[i];
        htmlStr += '<tr >';
        htmlStr += '<td><input type="checkbox"  id="' + escapeHTML(engine.id) + '" value="' + escapeHTML(engine.id) + '">' + escapeHTML(engine.name) + '</td><td><button class="smallbutton" id="del_engine_' + escapeHTML(engine.id) + '" > - </button> </td>';
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    $('#search-engine-list').html(htmlStr);
}

function TMNShowQueries(param) {
    var queries = param.queries.split(',');
    var htmlStr = '<table witdh=500 cellspacing=3 bgcolor=white  frame=border>';
    for (var i = 0; i < 3000 && i < queries.length; i++) {
        htmlStr += '<tr style="color:Black">';
        htmlStr += '<td>' + escapeHTML(queries[i]) + '<td>'
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    $('#tmn_logs_container').html(htmlStr);
}


function saveOptions() {
    var options = {};
    options.enabled = $("#trackmenot-opt-enabled").is(':checked');

    console.log("Saved Enabled: " + options.enabled)
    options.useTab = $("#trackmenot-opt-useTab").is(':checked');
    options.burstMode = $("#trackmenot-opt-burstMode").is(':checked');
    options.disableLogs = $("#trackmenot-opt-disable-logs").is(':checked');
    options.saveLogs = $("#trackmenot-opt-save-logs").is(':checked');
    options.timeout = $("#trackmenot-opt-timeout").val();
    setFrequencyMenu(options.timeout);

    var engines = '';
    var list = $("#search-engine-list:checked");
    $("#search-engine-list :checked").each(function() {
        engines += ($(this).val()) + ","
    })
    if (engines.length > 0)
        engines = engines.substring(0, engines.length - 1);

    options.searchEngines = engines;
    options.feedList = $("#trackmenot-seed").val();
    options.use_black_list = $("#trackmenot-use-blacklist").is(':checked');
    options.use_dhs_list = $("#trackmenot-use-dhslist").is(':checked');
    options.kw_black_list = $("#trackmenot-blacklist").val();
    return options;
}



self.port.on("TMNSetOptionsMenu", TMNSetOptionsMenu)
self.port.on("TMNSendLogs", TMNShowLog)
self.port.on("TMNSendQueries", TMNShowQueries)
self.port.on("TMNSendEngines", TMNShowEngines)




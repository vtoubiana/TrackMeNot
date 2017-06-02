var api;
if (chrome === undefined) {
    api = browser;
} else {
    api = chrome;
}

var tmn_options = {};
var tmn = api.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
var options = null;

function loadHandlers() {
    $("#apply-options").click(function() {
        tmn_options = {
            "options": saveOptions()
        };
        api.runtime.sendMessage({
            'tmn': "TMNSaveOptions",
            'options': tmn_options.options
        });
        //TMNSetOptionsMenu(tmn_options);	
    });

    $("#trackmenot-opt-help").click(function() {
        api.runtime.sendMessage({
            'tmn': "TMNOptionsOpenHelp"
        });
    });

    $("#trackmenot-opt-site").click(function() {
        api.runtime.sendMessage({
            'tmn': "TMNOptionsOpenSite"
        });

    });

    $("#show-add").click(function() {
        $("#add-engine-table").show();
    });
    $("#show-log").click(function() {
        api.runtime.sendMessage({
            'tmn': "TMNOptionsShowLog"
        });
    });

    $("#trackmenot-opt-showqueries").click(function() {
        api.runtime.sendMessage({
            'tmn': "TMNOptionsShowQueries"
        });
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
        api.runtime.sendMessage({
            'tmn': "TMNOptionsClearLog"
        });
    });


    $("#search-engine-list").on('click', 'button.smallbutton', function(event) {
        var del_engine = event.target.id.split("_").pop();
        api.runtime.sendMessage({
            'tmn': "TMNDelEngine",
            'engine': del_engine
        });
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
            alert("Did not find 'trackmenot' in the URL");
            return;
        }
        api.runtime.sendMessage({
            'tmn': "TMNAddEngine",
            'engine': engine
        });
    });
}


function TMNSetOptionsMenu() {
    var options = tmn._getOptions();
    var feedList = options.feedList;
    var kw_black_list = options.kw_black_list;
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
    var logs = tmnlogs.logs;
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


function TMNShowEngines(engines) {
    var htmlStr = "<table>";
    for (var i = 0; i < engines.length; i++) {
        var engine = engines[i];
        htmlStr += '<tr >';
        htmlStr += '<td><input type="checkbox"  id="' + engine.id + '" value="' + engine.id + '">' + engine.name + '</td><td><button class="smallbutton" id="del_engine_' + engine.id + '" > - </button> </td>';
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    $('#search-engine-list').html(htmlStr);
}

function TMNShowQueries(param) {
    var queries = param.queries.split(',');
    var htmlStr = '<table id="queries" cellspacing=3>';
    for (var i = 0; i < 3000 && i < queries.length; i++) {
        htmlStr += '<tr style="color:Black">';
        htmlStr += '<td>' + queries[i] + '<td>';
        htmlStr += '</tr>';
    }
    htmlStr += '</table>';
    $('#tmn_logs_container').html(htmlStr);
    $('#tmn_logs_container').css("visibility","visible");
}


function saveOptions() {
    var options = {};
    options.enabled = $("#trackmenot-opt-enabled").is(':checked');

    console.log("Saved Enabled: " + options.enabled);
    options.useTab = $("#trackmenot-opt-useTab").is(':checked');
    options.burstMode = $("#trackmenot-opt-burstMode").is(':checked');
    options.disableLogs = $("#trackmenot-opt-disable-logs").is(':checked');
    options.saveLogs = $("#trackmenot-opt-save-logs").is(':checked');
    options.timeout = $("#trackmenot-opt-timeout").val();
    //setFrequencyMenu(options.timeout);

    var engines = '';
    $("#search-engine-list :checked").each(function() {
        engines += ($(this).val()) + ",";
    });
    if (engines.length > 0)
        engines = engines.substring(0, engines.length - 1);

    options.searchEngines = engines;
    options.feedList = $("#trackmenot-seed").val();
    options.use_black_list = $("#trackmenot-use-blacklist").is(':checked');
    options.use_dhs_list = $("#trackmenot-use-dhslist").is(':checked');
    options.kw_black_list = $("#trackmenot-blacklist").val();
    return options;
}

function handleRequest(request, sender, sendResponse) {
    if (!request.options) return;
    switch (request.options) {
        case "TMNSetOptionsMenu":
            TMNSetOptionsMenu(request.param);
            sendResponse({});
            break;
        case "TMNSendLogs":
            TMNShowLog(request.param);
            sendResponse({});
            break;
        case "TMNSendQueries":
            TMNShowQueries(request.param);
            sendResponse({});
            break;
        case "TMNSendEngines":
            TMNShowEngines(request.param);
            sendResponse({});
            break;
        default:
            sendResponse({}); // snub them.
    }


}

document.addEventListener('DOMContentLoaded', function() {
    TMNShowEngines(tmn._getTargetEngines());
    loadHandlers();
    TMNSetOptionsMenu();
});




api.runtime.onMessage.addListener(handleRequest);
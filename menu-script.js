var api;
if (chrome == undefined) {
		api = browser;
	} else {
		api = chrome;
	}

if(!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.Menus = function() {
  var options = null;
  


    
  
  function  _cout (msg) { console.log(msg);  }
  


  return { 
	  
   showHelp: function() {
    window.open("http://www.cs.nyu.edu/trackmenot/faq.html")
  },
  
   toggleOnOff: function() {   
	options.enabled = !options.enabled      

         api.storage.local.set({"options_tmn":options});
          TRACKMENOT.Menus.onLoadMenu({"options_tmn":options});
   },
      
   toggleTabFrame: function() {
        options.useTab = !options.useTab
        api.storage.local.set({"options_tmn":options});
        TRACKMENOT.Menus.onLoadMenu({"options_tmn":options});  
      },
      

     onLoadMenu: function( items ) {
         options = items["options_tmn"];
      
		if ( options.enabled) {
			 $("#trackmenot-enabled").html('Disable');
			 $("#trackmenot-img-enabled").attr("src", "images/skin/off_icon.png");
		}  else {
			 $("#trackmenot-enabled").html('Enable');
			 $("#trackmenot-img-enabled").attr("src", "images/skin/on_icon.png");
		}
			
		if (options.useTab)  $("#trackmenot-menu-useTab").html('<img  width="16" height="16" src="images/skin/stealth_icon.png" /> Stealth');
		else $("#trackmenot-menu-useTab").html('<img  width="16" height="16" src="images/skin/tab_icon.png" /> Tab')
      }
  }
}(); 

document.addEventListener('DOMContentLoaded', function () {
  $("#trackmenot-menu-useTab").click(TRACKMENOT.Menus.toggleTabFrame);
  $("#trackmenot-enabled").click(TRACKMENOT.Menus.toggleOnOff);
  $("#trackmenot-menu-win").click(function() { window.open(api.extension.getURL('options.html'));});
  $("#trackmenot-menu-help").click(TRACKMENOT.Menus.showHelp)
  api.storage.local.get(["options_tmn"],TRACKMENOT.Menus.onLoadMenu)
});

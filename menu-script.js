var api;
if (chrome == undefined) {
		api = browser;
	} else {
		api = chrome;
	}

if(!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.Menus = function() {
 var tmn = null;  
  var tmn_option_query = '';
  var tmn_option_engine = '';
  var options = null;
  


    
  
  function  _cout (msg) { console.log(msg);  }
  


  return { 
	  
   showHelp: function() {
    window.open("http://www.cs.nyu.edu/trackmenot/faq.html")
  },
  
   toggleOnOff: function() {   
	      options.enabled = !options.enabled      
          if( !options.enabled) tmn._stopTMN();
          else  tmn._restartTMN();
          
          tmn._saveOptions();
          TRACKMENOT.Menus.onLoadMenu();
   },
      
   toggleTabFrame: function() {
        options.useTab = !options.useTab
        tmn._changeTabStatus(options.useTab);
        tmn._saveOptions();
        TRACKMENOT.Menus.onLoadMenu();  
      },
      

     onLoadMenu: function( ) {
        tmn = api.extension.getBackgroundPage().TRACKMENOT.TMNSearch;
        options = tmn._getOptions(); ;  
        tmn_option_query = tmn._getQuery();
        tmn_option_engine =  tmn._getEngine();

         $("#trackmenot-label").html(tmn_option_engine + " '"+ tmn_option_query+"'"); 

      
		if ( options.enabled) {
			 $("#trackmenot-enabled").html('Disable');
			 $("#trackmenot-img-enabled").attr("src", "images/skin/off_icon.png");
		}  else {
			 $("#trackmenot-enabled").html('Enable');
			 $("#trackmenot-img-enabled").attr("src", "images/skin/on_icon.png");
		}
			
		if (options.useTab)  $("#trackmenot-menu-useTab").html('Stealth');
		else $("#trackmenot-menu-useTab").html('Tab')
      }
  }
}(); 

document.addEventListener('DOMContentLoaded', function () {
  $("#trackmenot-menu-useTab").click(TRACKMENOT.Menus.toggleTabFrame);
  $("#trackmenot-enabled").click(TRACKMENOT.Menus.toggleOnOff);
  $("#trackmenot-menu-win").click(function() { window.open(api.extension.getURL('options.html'));});
  $("#trackmenot-menu-help").click(TRACKMENOT.Menus.showHelp)
  TRACKMENOT.Menus.onLoadMenu()
});

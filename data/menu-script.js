  var tmn = null;  
  var tmn_option_query = '';
  var tmn_option_engine = '';
  var options = null;
  

  
  $("#trackmenot-menu-useTab").click(toggleTabFrame);
  $("#trackmenot-enabled").click(toggleOnOff);
  $("#trackmenot-menu-help").click(showHelp);
  
  function  _cout (msg) { console.log(msg);  }
  
  function showHelp() {
    window.open("http://www.cs.nyu.edu/trackmenot/faq.html");
  }

    
  function toggleOnOff() {         
        options.enabled = !options.enabled;
        tmn_options = {"options":options};	 	  			 
        self.port.emit("TMNSaveOptions",tmn_options.options); 
        loadMenu(tmn_options)  ;
   }
      
     function toggleTabFrame() {
        options.useTab = !options.useTab;
        tmn_options = {"options":options};	 	  			 
        self.port.emit("TMNSaveOptions",tmn_options.options); 
        loadMenu(tmn_options);
      }
      
      $("#trackmenot-menu-win").click(function() {
          self.port.emit("TMNOpenOption");
      });
    
      function loadMenu( panel_inputs) {

        options = panel_inputs.options;  
        if ( panel_inputs.query && panel_inputs.engine )
            $("#trackmenot-label").text(panel_inputs.engine + " '"+ panel_inputs.query+"'"); 

      
	if ( options.enabled) {
         $("#trackmenot-enabled").text(' Disable');
         $("#trackmenot-img-enabled").attr("src", "images/skin/off_icon.png");
        }  else {
         $("#trackmenot-enabled").text(' Enable');
         $("#trackmenot-img-enabled").attr("src", "images/skin/on_icon.png");
        }
    	
    	  if (options.useTab) {
			$("#trackmenot-menu-useTab").text(' Stealth');
			$("#trackmenot-img-tab").attr("src", "images/skin/stealth_icon.png");
		  }   else {		  
			$("#trackmenot-menu-useTab").text(' Tab');
			$("#trackmenot-img-tab").attr("src", "images/skin/tab_icon.png");
		  }
      
      }

self.port.on("TMNSendOption",loadMenu );
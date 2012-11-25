  var tmn = null;  
  var tmn_option_query = '';
  var tmn_option_engine = '';
  var options = null;
  

  
  $("#trackmenot-menu-useTab").click(toggleTabFrame);
  
  function  _cout (msg) { console.log(msg);  }

    
  function toggleOnOff() {         
          if( options.enabled) tmn.stopTMN();
          else  tmn.restartTMN();
          
          tmn.saveOptions();
          TRACKMENOT.Menus.onLoadMenu();
          
   }
      
     function toggleTabFrame() {
        options.useTab = !options.useTab
        tmn_options = {"options":options};	 	  			 
        self.port.emit("TMNSaveOptions",tmn_options.options); 
        loadMenu(tmn_options)
      }
      
      $("#trackmenot-menu-win").click(function() {
          self.port.emit("TMNOpenOption")
      })
    
      function loadMenu( panel_inputs) {

        options = panel_inputs.options;  
        if ( panel_inputs.query && panel_inputs.engine )
            $("#trackmenot-label").html(panel_inputs.query+': '+ panel_inputs.engine); 

      
	if ( options.enabled) {
         $("#trackmenot-menu-enabled").html('Disable TMN');
         $("#trackmenot-img-enabled").attr("src", "images/skin/off_icon.png");
        }  else {
         $("#trackmenot-menu-enabled").html('Enable TMN');
         $("#trackmenot-img-enabled").attr("src", "images/skin/on_icon.png");
        }
    	
    	  if (options.useTab)  $("#trackmenot-menu-useTab").html('Switch to Frame Mode');
    	  else $("#trackmenot-menu-useTab").html('Switch to Tab Mode')
      
      }

self.port.on("TMNSendOption",loadMenu )
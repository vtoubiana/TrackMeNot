  var tmn = null;  
  var tmn_option_query = '';
  var tmn_option_engine = '';
  var options = null;
  
  onclick="toggleTabFrame();"
  
  $("#trackmenot-menu-useTab").click(toggleTabFrame);
  
  function  _cout (msg) { console.log(msg);  }
  function getElement(doc,aID){ return (doc.getElementById) ? doc.getElementById(aID): doc.all[aID];} 	
    
  function toggleOnOff() {         
          if( options.enabled) tmn.stopTMN();
          else  tmn.restartTMN();
          
          tmn.saveOptions();
          TRACKMENOT.Menus.onLoadMenu();
          
   }
      
     function toggleTabFrame() {
        tmn.changeTabStatus(!options.useTab);
        
        tmn.saveOptions();
        TRACKMENOT.Menus.onLoadMenu();      
      }
      
      $("#trackmenot-menu-win").click(function() {
          self.port.emit("TMNOpenOption")
      })
    
      function loadMenu( panel_inputs) {

        options = panel_inputs.options;        
        tmn_option_query = panel_inputs.query;
        tmn_option_engine =  panel_inputs.engine;
        $("#trackmenot-label").html(tmn_option_engine+': '+ tmn_option_query); 

      
        var enbTxt = getElement(document,"trackmenot-menu-enabled");	
        var enbImg = getElement(document,"trackmenot-img-enabled");	
	      if ( options.enabled) {
         enbTxt.innerHTML = 'Disable TMN';
         enbImg.src = "images/skin/off_icon.png";
        }  else {
         enbTxt.innerHTML = 'Enable TMN';
         enbImg.src = "images/skin/on_icon.png";
        }
    	
    	  var tabTxt = getElement(document,"trackmenot-menu-useTab");	
    	  if (options.useTab)  tabTxt.innerHTML = 'Switch to Frame Mode';
    	  else tabTxt.innerHTML = 'Switch to Tab Mode'
      
      }

self.port.on("TMNSendOption",loadMenu )
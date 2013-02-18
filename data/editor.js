


if(!TRACKMENOT) var TRACKMENOT = {};

TRACKMENOT.editor = function () {

  var rss_file = null;
  var rss_seed = null;
  var rss_obj = null;  
  var tree_state = '';
  var tree_item = '';
  var new_feed_uri = '';

 	function appendCellToTree(tr,label) {
		    var treeCellName = document.createElement("treecell");
	        treeCellName.setAttribute("label",label.toString());  
	        tr.appendChild(treeCellName);
	}

  function getRunningWindow() {
      		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
        							getService(Components.interfaces.nsIWindowMediator);
        		var en = wm.getEnumerator("navigator:browser");
        		 while (en.hasMoreElements()) { 
        	      var win = en.getNext(); 
        	      if (win.TRACKMENOT && win.TRACKMENOT.gTrackMeNot) 
        	      	return win;
        	    }
    	    return null		
  }
      
  function cout(msg) {
        var win = getRunningWindow();
      	win.TRACKMENOT.utils.cout(msg);
  	}
    
  function appendCatToTree( cat, tr) {
    		if(cat.id) 	  
      	 appendCellToTree(tr,cat.id);
        if(cat.type) 	  
      	 appendCellToTree(tr,cat.type);                        
  }

  
  
    function createCellElement(fatherElement, elt, id, _window,  isRoot, type ) {
		try {
			var ti = _window.document.createElement("treeitem");
			if (elt.children && elt.children.length > 0) 
				ti.setAttribute("container", true);
			if (!isRoot && type && elt.type != type) 
				ti.setAttribute("hidden", true);
			//ti.setAttribute("id", id++);
			var tr = _window.document.createElement("treerow");
			appendCatToTree(elt, tr)
			ti.setAttribute("open", isRoot);
			ti.appendChild(tr);
			if (elt.children) {
				var pch = _window.document.createElement("treechildren");
				for (var k = 0; k < elt.children.length; k++) {
					createCellElement(pch, elt.children[k], id, _window, false, type)
				}
				ti.appendChild(pch);
			}
			fatherElement.appendChild(ti);
		} catch (ex) {
			cout("Can't create cell element: " + ex)
			return;
		} 
    }

  function	resetTree (id,_window) {
		var tree = _window.document.getElementById(id);
	  	var removeList = _window.document.getElementsByTagName("treechildren");
	  	while(  removeList.length!= 0) {
	  		removeList = _window.document.getElementsByTagName("treechildren"); 	
	  		for (var i=0; i< removeList.length; i++)
				  tree.removeChild(removeList[i]);
		} 
	} 


	
	  function treeLoad (treeName,_window,type) {
	  	var win =  getRunningWindow();
	  	var tree = _window.document.getElementById(treeName);
	  	if ( !tree ) {
        cout('Can not find tree');
        return;
       }
      resetTree(treeName,_window);
	  	var root = _window.document.createElement("treechildren");
	  	createCellElement(root, rss_obj, 0, _window,  true,type );
  		tree.appendChild(root);
	}
	
    function getRSSFile() {
        if  (rss_file!= null) return rss_file;
        rss_file = TRACKMENOT.utils.getProfileDir().clone();
	      rss_file.append("TRACKMENOT");
	      if( !rss_file.exists() || !rss_file.isDirectory() ) 
	   	     rss_file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	   	  rss_file.append('TMNRss');
	   	  return rss_file; 
    } 
	
	function getRSSJsonString() {
      try {
          var file = getRSSFile();
          var data = "";  
          var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                                  .createInstance(Components.interfaces.nsIFileInputStream);
          var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                  .createInstance(Components.interfaces.nsIScriptableInputStream);
          fstream.init(file, -1, 0, 0);
          sstream.init(fstream); 
          
          var str = sstream.read(4096);
          while (str.length > 0) {
            data += str;
            str = sstream.read(4096);
          }
          
          sstream.close();
          fstream.close();
        } catch (ex) {
          data = '{"id":"TMN RSS","type":"root","children":[{"id":"Sport","type":"category","children":[{"id":"http://sports-ak.espn.go.com/espn/rss/news","type":"RSS"}]},{"id":"News","type":"category","children":[{"id":"http://rss.cnn.com/rss/cnn_latest.rss","type":"RSS"}]},{"id":"IT","type":"category","children":[{"id":"http://rss.slashdot.org/Slashdot/slashdot","type":"RSS"}]},{"id":"Entertainment","type":"category","children":[{"id":"http://rss.imdb.com/news/","type":"RSS"}]}]}';
        }
		if ( data.length < 10 || data =='null' )
			data = '{"id":"TMN RSS","type":"root","children":[{"id":"Sport","type":"category","children":[{"id":"http://sports-ak.espn.go.com/espn/rss/news","type":"RSS"}]},{"id":"News","type":"category","children":[{"id":"http://rss.cnn.com/rss/cnn_latest.rss","type":"RSS"}]},{"id":"IT","type":"category","children":[{"id":"http://rss.slashdot.org/Slashdot/slashdot","type":"RSS"}]},{"id":"Entertainment","type":"category","children":[{"id":"http://rss.imdb.com/news/","type":"RSS"}]}]}';
        return data; 
  }


  	function setIntPreference(prefName,prefValue) {
  		if (  document.getElementById(prefValue) && document.getElementById(prefValue).value!= "" )
  			this.prefs.setIntPref(prefName,document.getElementById(prefValue).value);
		}
		
		function getObjectByID( id, father ) {
      var result = null;
      for each(var elt in father.children ) {
          if (elt.id == id) result = elt;
          else result = getObjectByID( id,elt);
          if( result != null) return result;
      }
      return result;
    }
    
    function getFatherByID( id, father ) {
      var result = null;
      for each(var elt in father.children ) {
          if (elt.id == id) result = father;
          else result = getFatherByID( id,elt);
          if( result != null) return result;
      }
      return result;
    }
		
		function newCategory ( val, type) {
       var entr = {};
       entr.id = val;
       entr.type = type;
       entr.children = new Array();
       return entr; 
    }
    
    function newRSS(url,parent) {
       var entr = {};
       entr.id = url;
       entr.type = "RSS";
       return entr; 
    }
    
    function getFeedURL()	{
			var searched = document.location.search.substr(1);
			var uriArray = searched.split("tmn_feed=");
			  return decodeURIComponent(uriArray[1]);
		}
    
    
	return { 
	    _loadTree : function(reload) {  
	        if (!rss_obj || reload) TRACKMENOT.editor._loadRSS();
	        treeLoad('tree-rss',window);
	     },
	     
	  	_loadCategoryTree : function(reload) {  
	        if (!rss_obj || reload) TRACKMENOT.editor._loadRSS();
	        treeLoad('tree-rss',window,'category');
	     },
	
     _loadRSS : function () {
      var rss = getRSSJsonString();
  		rss_obj = JSON.parse(rss);   
    },
   
   
     _addRSS : function () {
      var rss = getRSSJsonString();
  		rss_obj = JSON.parse(rss);   
    },
    
     _addCategory : function () {
      var rss = getRSSJsonString();
  		var rss_obj = JSON.parse(rss);   
    },
    
     _deleteRSS : function () {
      var rss = getObjectByID(tree_item,rss_obj);
  		rss_obj.delete(rss);   
    },
    
    _deleteItem: function () {
      var tree = document.getElementById('tree-rss');
		  var entry = tree.view.getCellText(tree.currentIndex,tree.columns.getColumnAt(0));
      var cat = getObjectByID(entry,rss_obj);
      var father = getFatherByID(entry,rss_obj);
      var catIndex =   father.children.indexOf(cat);
  		father.children.splice(catIndex,1);   
  		TRACKMENOT.editor._saveRSS();
  		TRACKMENOT.editor._loadTree();
    },
    
    _getRSS : function () {
      var rss = getRSSJsonString();
  		rss_obj = JSON.parse(rss);   
    },
    
    _addEntry : function () {
      var entry  =  document.getElementById('text-entry').value;
      switch (tree_state)  {
          case 'root' :
            rss_obj.children.push(newCategory(entry,'category'));
            break;
          case 'category':
            var cat = getObjectByID(tree_item,rss_obj);
            cat.children.push(newRSS(entry))
            break;
          case 'rss':
            var cat = getObjectByID(tree_item,rss_obj);
            cat.children.push(newRSS(entry))
            break;
          default :
            rss_obj.children.push(newCategory(entry,'category'));
            break;
      }
      TRACKMENOT.editor._saveRSS();
      TRACKMENOT.editor._loadTree(); 
    },
    
    _getObjByType: function( obj, type, result) {
      for each(var elt in obj.children ) {
          if (elt.type == type) result.push(elt);
          TRACKMENOT.editor._getObjByType( elt, type, result);
      }
      return result;    
    },
    
    _getRSSObj: function () {
        if (!rss_obj) TRACKMENOT.editor._loadRSS();
        return rss_obj;   
    },
    
    _setRSSObj: function (str) {
        rss_obj = str ;   
        TRACKMENOT.editor._saveRSS();
    } ,
    
    _edit : function() {
          var tree = document.getElementById('tree-rss');
		      var id = tree.view.getCellText(tree.currentIndex,tree.columns.getColumnAt(0));
          window.openDialog("chrome://trackmenot/content/editeentry.xul", "trackmenotEditeEntry", "chrome,dialog,centerscreen,alwaysRaised",id);
    },
        
    _loadEntryWindow : function(id) {
        window.document.getElementById('entry-text').value = id; 
        rss_obj = window.opener.TRACKMENOT.editor._getRSSObj(); 
    },
    
    _saveEntryChange: function(old_id) {
        var obj = getObjectByID(old_id,rss_obj);
        obj.id = window.document.getElementById('entry-text').value;
        window.opener.TRACKMENOT.editor._setRSSObj(rss_obj)
        window.opener.TRACKMENOT.editor._loadTree();
        return;
    },
    
    _updateTextLabel : function () {
       var win =  getRunningWindow();
       if (!win ) return;
       var tree = document.getElementById('tree-rss');
       var sel = tree.view.selection.currentIndex; //returns -1 if the tree is not focused
       var treeItem = tree.view.getItemAtIndex(sel);
       var eltType = treeItem.childNodes[0].childNodes[1].getAttribute('label');
       tree_state = eltType; 
       tree_item = treeItem.childNodes[0].childNodes[0].getAttribute('label')  ;
       switch (eltType)  {
          case 'root' :
            document.getElementById('entry-label').value = 'Category';
            document.getElementById("add-entry").label = 'Add Category';
            break;
          case 'category':
            document.getElementById('entry-label').value = 'RSS';
            document.getElementById("add-entry").label = 'Add RSS';
            break;
          case 'rss':
            document.getElementById('entry-label').value = 'RSS';
            document.getElementById("add-entry").label = 'Add RSS';
            break;
       }
    },
      
   	
		_onFeedPageLoad :function()	{
			new_feed_uri = getFeedURL();
			if (new_feed_uri != "") {
			  cout("Adding new feed: "+ new_feed_uri);
				openDialog("chrome://trackmenot/content/selectcat.xul", "TrackMeNot RSS Handler","chrome,centerscreen,resizable=yes,width=230,height=250",new_feed_uri)
      }
      return;	
		},
	
		_onSelectTopicLoad: function(e) {
			TRACKMENOT.editor._loadCategoryTree();
			var attributes = new Array ('text')
			if("arguments" in window && window.arguments.length > 0) { 
	      			new_feed_uri = window.arguments[0]; 
	      			cout("Selecting a topic for feed: "+ new_feed_uri);
      }   
			return;
		},
		
		_addFlowToTopic: function() {
			var win = getRunningWindow();
			var tree = document.getElementById("tree-rss");
			var sel = tree.view.selection.currentIndex; //returns -1 if the tree is not focused
      var treeItem = tree.view.getItemAtIndex(sel);
      var cat_text = treeItem.childNodes[0].childNodes[0].getAttribute('label')  ;
			cout("Feed " + new_feed_uri + "\n is going to be added to category: "+cat_text);
			if (!rss_obj) TRACKMENOT.editor._loadRSS();
      var cat = getObjectByID(cat_text,rss_obj);
      cat.children.push(newRSS(new_feed_uri));
      TRACKMENOT.editor._saveRSS();
		},
		
    _saveRSS : function () {
      var file = getRSSFile();
  		var foStream = TRACKMENOT.utils.getFoStream();
  		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);	
  	 	var jsonString = JSON.stringify(rss_obj);
  	 	cout(jsonString)
  		foStream.write(jsonString, jsonString.length,'','iso-8859-1');
  		foStream.close();	   
    },
    

	};

}();

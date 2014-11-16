function escapeHTML(str) str.replace(/[&"<>]/g, function (m) escapeHTML.replacements[m]);
escapeHTML.replacements = { "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" };

function updateText(text) {
      document.getElementById("tmn-text").innerHTML = escapeHTML(text);
      console.log("Updating text on widget with: "+ text);
}
  
function UpdateIcon(url) {
      document.getElementById("tmn-widget-icon").setAttribute("src",url) ;
  }  
self.port.on("UpdateText", updateText);
self.port.on("UpdateIcon", UpdateIcon);
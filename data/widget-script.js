
function updateText(text) {
      document.getElementById("tmn-text").innerHTML = text
}
  
function UpdateIcon(url) {
      document.getElementById("tmn-widget-icon").setAttribute("src",url) 
  }  
self.port.on("UpdateText", updateText)
self.port.on("UpdateIcon", UpdateIcon)
console.log('/*------------------------');
console.log("EditCSVonline is a 100% free web app powered by %cDataGridXL","color: #0078ff");
console.log('The no-nonsense fast Excel-like Vanilla Javascript data table library.');
console.log('https://datagridxl.com');
console.log('------------------------*/');

var document_title    = localStorage.getItem('title') || 'untitled';
var document_suffix   = '.csv';

var document_data     = JSON.parse(localStorage.getItem('data')) || DataGridXL.createEmptyData(100,10);

document.getElementById('app-file-name').textContent = document_title + document_suffix;

window.onbeforeunload = function(){

  // save document_title in localStorage
  localStorage.setItem('title', document_title);
  localStorage.setItem('data', JSON.stringify(grid.getData()));

};

/*--------------------------------------------

  " innerHTML += " gets SUPER SLOW
  USE APPENDCHILD instead!

--------------------------------------------*/

    // document.getElementById("windowLocation").textContent = window.location;

		// ------------------- create DGXL

		// add grid to window, for ES6...

		window.grid = new DataGridXL("grid", {
		  data: document_data,
      instantActivate: true
		});

    document.getElementById("file").onchange = function(e){
      readSingleFile(e);
    }

    // ----------------------------

    window.settingsPane = document.getElementById("settings");
    window.overlayNode  = document.getElementById("overlay");

    function openSettings(){

      settingsPane.classList.add("open");
      overlayNode.style.display = "block";

    }

    function closeSettings(){

      settingsPane.classList.remove("open");
      overlayNode.style.display = "none";

    }

    function turnOffScroll(){
      // unfortunately, iOS seems to take its time setting this prop...
      // perhaps because of BUTTON?
      grid._domNodes.scrollAreaNode.style.pointerEvents = 'none';
    }

    function stringifyJSON(obj){

      // var str = "";

      // for(var key in obj){
      //   str += key + ": " + obj[key] + "\n";
      // }

      // return str;
      var str = JSON.stringify(obj);

      // var result = str.match(/".*?"/g);
      // console.log("RE SU LT", result);

      if(str.length > 50){
        return str.substring(0, 200) + " ...";
      } else {
        return str;
      }

    }

    // --------

    var alignLeft = function(str, space){

      // this was used for tree branch indentation
      var padding = 0;

      var newStr = "";

      // add padding up front
      for(var i = 0; i < padding; i++){
        newStr += " ";
      }

      if(str == null){

        for(var i = 0; i < (space - padding); i++){
          newStr += " ";
        }

      } else if(str.length > space - padding){

        newStr += str.slice(str.length - space - padding);

      } else {

        // leftPad

        newStr += str;

        for(var i = str.length; i < (space - padding); i++){
          newStr += " ";
        }

      }

      return newStr;

    }

    window.app = {

      undo: function(){
        grid.undo();
      },
      redo: function(){
        grid.redo();
      },
      downloadDataAsCSV: function(){

        //grid.downloadDataAsCSV();

        var csvStr = "";

        // loop over _rowList, then _colList

        for(var y = 0; y < grid._rowList.length; y++){
          for(var x = 0; x < grid._colList.length; x++){
            csvStr += grid._cellStore[grid._rowList[y]-1][grid._colList[x]-1].value || "";
            if(x < grid._colList.length - 1){
              csvStr += ",";
            }
          }
          csvStr += "\n";
        }

        // Create a blob of the data
        var fileToSave = new Blob([csvStr], {
            type: 'text/csv',
            name: document_title + document_suffix
        });

        if(isIE()){

          navigator.msSaveBlob(fileToSave, document_title + document_suffix);

        } else {

          var link = document.createElement('a');
          link.className = 'downloadLink';
          link.href = URL.createObjectURL(fileToSave);
          link.setAttribute('download', document_title + document_suffix);

          // required for FF (todo: test)
          link.textContent = 'Click here to download';
          document.body.appendChild(link);
          
          // auto-download
          link.click();

          // remove link
          document.body.removeChild(link);

        }

      },
      setCellColors: function(cellColor){
        grid.setCellStyles(grid.getCellSelection(), {
          backgroundColor: cellColor
        });
      },
      closeConsole: function(){

        document.getElementById("grid").style.right = "0";
        document.getElementById("app-header").style.right = "0";        
        document.getElementById("console").style.transform = "translateX(600px)";

        document.getElementById("console-handle").getElementsByTagName("img")[0].setAttribute("src", "img/triangle-left.svg");
      
        document.getElementById("console-handle").setAttribute("title", 'Open Sidebar');
        document.getElementById("console-handle").setAttribute("onclick", "app.openConsole();");

      },
      openConsole: function(){

        document.getElementById("grid").style.right = "600px";
        document.getElementById("app-header").style.right = "600px";    
        document.getElementById("console").style.transform = "translateX(0)";

        document.getElementById("console-handle").getElementsByTagName("img")[0].setAttribute("src", "img/triangle-right.svg");

        document.getElementById("console-handle").setAttribute("title", 'Close Sidebar');
        document.getElementById("console-handle").setAttribute("onclick", "app.closeConsole();");

      },
      createNew: function(){

        document_data = DataGridXL.createEmptyData(100,10);
        document_title = 'untitled';

        grid.setData(document_data);
        grid.selectCells({x:0,y:0});
        document.getElementById('app-file-name').textContent = document_title + document_suffix;

      }

    };


function readSingleFile(e) {
  var file = e.target.files[0];
  if (!file) {
    return;
  }
  var reader = new FileReader();
  reader.fileName = file.name;
  reader.file = file;
  reader.onload = function(e) {
    var contents = e.target;
    displayContents(contents);
  };
  reader.readAsText(file);
}

function displayContents(contents) {
  //var element = document.getElementById('file-content');
  //element.textContent = contents;

  document_title = contents.fileName.split('.')[0];
  document_data = Papa.parse(contents.result).data;

  document.getElementById("app-file-name").textContent = document_title + document_suffix;
  grid.setData(document_data);
  grid.selectCells({x:0,y:0});
  //console.log('JSON', Papa.parse(contents.contents));
}

function showMenu(menuNode){

  menuNode.style.display = "block";
  menuNode.previousElementSibling.setAttribute("onclick", 'hideMenu(this.nextElementSibling);');

  // add click-outside listener

  menuNode._clickOutsideToCloseMenu = listeners.clickOutsideToCloseMenu.bind(menuNode);
  menuNode._pressEscToCloseMenu     = listeners.pressEscToCloseMenu.bind(menuNode);



  // add escape listener
  document.addEventListener("keydown", menuNode._pressEscToCloseMenu);

  // add click-outside listener
  setTimeout(function(){
    document.body.addEventListener("mousedown", menuNode._clickOutsideToCloseMenu);
  }, 0);

}

function hideMenu(menuNode){

  menuNode.style.display = "none";

  document.body.removeEventListener("mousedown", menuNode._clickOutsideToCloseMenu);
  document.removeEventListener("keydown", menuNode._pressEscToCloseMenu);


  menuNode.previousElementSibling.setAttribute("onclick", 'showMenu(this.nextElementSibling);');


}

function openDialog(type){

  var dialogNode = document.getElementById("dialog");
  var overlayNode = document.getElementById("overlay");

  // hide all menus

  var menus = document.getElementsByClassName('extra-options');
  for(var i = 0; i < menus.length; i++){
     hideMenu(menus[i]);
  }

  // show overlay

  overlayNode.style.display = "block";
  dialogNode.style.display = "block";

  // hide all children except...

  var currentDialog;

  var children = dialogNode.children;

  for(var i = 0; i < children.length; i++){

    if(children[i].id == "dialog-" + type){
      currentDialog = children[i];
      children[i].style.display = "block";
    } else {
      children[i].style.display = "none";
    }

  }

  if(type == "url"){
    currentDialog.getElementsByTagName("input")[0].focus();
  } else if(type == "string"){

  }

  // click outside to close dialog
  dialogNode._clickOutsideToCloseDialog = listeners.clickOutsideToCloseDialog.bind(dialogNode);
  document.body.addEventListener('mousedown', dialogNode._clickOutsideToCloseDialog);

  // add esc to close listener
  document.addEventListener("keydown", listeners.pressEscToCloseDialog);

}

function closeDialog(){

  var dialogNode = document.getElementById("dialog");
  var overlayNode = document.getElementById("overlay");

  dialogNode.style.display = "none";
  overlayNode.style.display = "none";

  // remove click-outside listener
  document.body.removeEventListener('mousedown', dialogNode._clickOutsideToCloseDialog);

  // remove esc to close listener
  document.removeEventListener("keydown", listeners.pressEscToCloseDialog);

}

var listeners = {

  // button sub menu

  clickOutsideToCloseMenu: function(e){

    if (!this.contains(e.target) && !this.previousElementSibling.contains(e.target)){
      hideMenu(this);
    }
    
  },

  pressEscToCloseMenu: function(e){
    e = e || window.event;
    if (e.keyCode == 27) {
        hideMenu(this);
    }
  },

  // dialog

  clickOutsideToCloseDialog: function(e){
    if (!this.contains(e.target)){
      closeDialog();
    }
  },

  pressEscToCloseDialog: function(e){
    e = e || window.event;
    if (e.keyCode == 27) {
        closeDialog();
    }
  },

  // filename editor

  pressEnterToSaveFilename: function(e){
    e = e || window.event;
    if (e.keyCode == 13) {
        closeFilenameEditor();
    }
  },

  clickOutsideToSaveFilename: function(e){
    if (!this.contains(e.target)){
      closeFilenameEditor();
    }
  },

  pressEscToDiscardFilename: function(e){
    e = e || window.event;
    if (e.keyCode == 27) {
        closeFilenameEditor(false);
    }
  }

};

function isValidUrl(string) {
  try {
    new URL(string);
  } catch (_) {
    return false;  
  }

  return true;
}

function loadRemoteFile(url){

  if(!isValidUrl(url)){

    document.getElementById('url-input').classList.add('input-error');

  } else {

    Papa.parse(url, {
      download: true,
      complete: function(e){
        //console.log('COMPLETE!!!',e);
      },
      error: function(){
        document.getElementById('url-input').classList.add('input-error');
      }
      // rest of config ...
    });

  }

}

function openFilenameEditor(){

  //console.log('open filename editor');

  var filenameNode = document.getElementById("app-file-name");

  filenameNode.classList.add('editing');

  filenameNode.innerHTML = '<input type="text" value="'+document_title+'" style="font-size:1em;"><div>'+document_suffix+'</div>';

  filenameNode.firstChild.value = document_title;
  filenameNode.firstChild.select();

  filenameNode.removeAttribute('onclick');

  // add enter listener (to SAVE)
  document.addEventListener("keydown", listeners.pressEnterToSaveFilename);

  // add click outside listener (to SAVE)
  filenameNode._clickOutsideToSaveFilename = listeners.clickOutsideToSaveFilename.bind(filenameNode.firstChild);
  setTimeout(function(){
    document.body.addEventListener("mousedown", filenameNode._clickOutsideToSaveFilename);
  }, 0);

  // add esc listener (to CANCEL)
  document.addEventListener("keydown", listeners.pressEscToDiscardFilename);

}

function closeFilenameEditor(saveFilename){

  //console.log('close filename editor');

  if(typeof saveFilename === 'undefined'){
    saveFilename = true;
  }

  var filenameNode = document.getElementById("app-file-name");
  
  filenameNode.classList.remove('editing');
  filenameNode.firstChild.blur();

  if(saveFilename){
    document_title = filenameNode.firstChild.value.trim() || 'untitled';
  }
  

  filenameNode.innerHTML = document_title + document_suffix;

  // re-add onclick listener
  filenameNode.setAttribute('onclick', 'openFilenameEditor();');

  // remove enter listener
  document.removeEventListener("keydown", listeners.pressEnterToSaveFilename);

  // remove click-outside listener
  document.body.removeEventListener("mousedown", filenameNode._clickOutsideToSaveFilename);

  // remove esc listener (to CANCEL)
  document.removeEventListener("keydown", listeners.pressEscToDiscardFilename);

}

function parseCSVString(str){

  var parsed_object = Papa.parse(str);

  if(parsed_object.errors.length || parsed_object.aborted){

    document.getElementById('csv-textarea').classList.add('textarea-error');
    // ERROR!
  
  } else {

    document_data = parsed_object.data;
    grid.setData(document_data);
    closeDialog();
    grid.selectCells({x:0,y:0});

  }

}

function makeAjaxRequest(path, saveObj, callback){

  // Set up our HTTP request
  var xhr = new XMLHttpRequest();

  // Setup our listener to process completed requests
  xhr.onload = function () {

    // Process our return data
    if (xhr.status >= 200 && xhr.status < 300) {
      // What do when the request is successful
      callback(xhr.response);
    } else {
      // What do when the request fails
      console.log('The request failed!');
    }

  };

  // Create and send a GET request
  // The first argument is the post type (GET, POST, PUT, DELETE, etc.)
  // The second argument is the endpoint URL

  if(path.indexOf("?") > -1){
    xhr.open('POST', path + '&ajax=1&nocache=' + Date.now(), true);
  } else {
    xhr.open('POST', path + '?ajax=1&nocache=' + Date.now(), true);
  }

  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

  var params = '';
  var objSize = Object.keys(saveObj).length;
  var i = 0;

  for(var key in saveObj){
    params += key + "=" + saveObj[key];
    if(i < objSize - 1){
      params += "&";
    }
    i++;
  }

  //console.log('params',params);

  xhr.send(params);

}

function isIE(){

/**
 * detect IE
 * returns version of IE
 * or false; if browser is not Internet Explorer

 * returns false for Edge Chromium
 */

  var ua = window.navigator.userAgent;

  // Test values; Uncomment to check result …

  // IE 10
  // ua = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
  
  // IE 11
  // ua = 'Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko';
  
  // Edge 12 (Spartan)
  // ua = 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36 Edge/12.0';
  
  // Edge 13
  // ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2486.0 Safari/537.36 Edge/13.10586';

  var msie = ua.indexOf('MSIE ');
  if (msie > 0) {
    // IE 10 or older => return version number
    return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
  }

  var trident = ua.indexOf('Trident/');
  if (trident > 0) {
    // IE 11 => return version number
    var rv = ua.indexOf('rv:');
    return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
  }

  // other browser
  return false;

}

grid.events.on('cellcursorpositionchange', function(e){

  if(e.cellCursorPosition == null){
    document.getElementById("cell-coord").textContent = "";
    document.getElementById("cell-value").value = "";
    return;
  }

  var letter = this._headerLabelSeriesPresets["letters"].headerTextFunction(e.cellCursorPosition.x, this._headerLabelSeriesPresets["letters"]);
  var number = this._headerLabelSeriesPresets["numbers"].headerTextFunction(e.cellCursorPosition.y, this._headerLabelSeriesPresets["numbers"]);

  document.getElementById("cell-coord").textContent = letter + number;

  document.getElementById("cell-value").value = this.getCellValues(e.cellCursorPosition);

});

document.getElementById("cell-value").onfocus = function(e){

  // todo: create DGXL method (deactivateKeys)

  grid.keys.suspend();

}

document.getElementById("cell-value").onkeydown = function(e){

  e = e || window.event;

  if (e.keyCode == 13) {

    // when enter is pressed (touch screen), simulate enter in DGXL.
    grid.moveCellCursorInside({x: +0, y: +1});

    // re-focus textarea

    setTimeout(function(){
      e.target.focus();
    }, 0);

    e.preventDefault();

  }

}
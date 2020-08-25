
const electron = require('electron');
const ipc=electron.ipcRenderer;
const { clipboard} = require('electron');
const PerfectScrollbar = require('perfect-scrollbar');
const moment = require('moment');
const checkInternetConnected = require('check-internet-connected');

jQuery.fn.reverse = [].reverse;


const nativeImage=electron.nativeImage;

var userSettings={};
var toggleclip="Not Checked";
var fnameglobal = "Main";
var timeglobal = "0";
var lastclip = " ";
var lastclipImage;
var isGroup= "0";
var imagesArr;
var imagesOriginalSize;
var init=0;
var connected =true;
var toBeDeleted;
var canUpdateDate=false;


// Usage: For redirecting to different pages
const page = {
	LOGIN: "login",
	SETTINGS: "settings",
	MAIN: "main"
};

// Usage: For dynamically inserting Folder contents in main.html
let data = [];

let images=[];
let fdata= [];
let shortenedClips={};



/**
 * For redirecting to a page. Uses `page` object
 * @param {string} page
 */
function redirect(page) {
	window.location.href = `${page}.html`;
}

/**
 * Initializes dropdown menu in main.html
 * Dropdown for bulk actions and folder contents' `more` (three dots) icon
 * @param {string} element
 */
function initializeMetisMenu(element) {
	const mm = new MetisMenu(element).on("shown.metisMenu", function(event) {
		window.addEventListener("click", function mmClick(e) {
			if (!event.target.contains(e.target)) {
				mm.hide(event.detail.shownElement);
				window.removeEventListener("click", mmClick);
			}
		});
	});
}


const activeImageSrc = "resources/assets/icons/folder-white.svg";
const inactiveImageSrc = "resources/assets/icons/folder-gray.svg";
const container = $(".main-content .contents");
const foldersList = $(".main-content .folders");


    // Main
function initializeMain() {
  //const container = $(".main-content .contents");

	// Initialize scrollbar
	new PerfectScrollbar("#list-scrollbar", { wheelPropagation: false });
  new PerfectScrollbar("#folder-list", { wheelPropagation: false });


    //finish load asks for the folders 
    ipc.send("finishload");
    ipc.send("changeMenu");
    timeglobal=0;
    getTable();
     
    //need to get user settings
     ipc.send("getSettings","");
    

    //Event listener for checkbox
    $('#kleeptoggle').click(function(){
        if($(this).is(":checked")){
            toggleclip="Checked";
           
        }
        else if($(this).is(":not(:checked)")){
            toggleclip="Not checked";
        }

        
    });

    $('#btnToday').click(function(){
     
     
      ipc.send("setDisconnect","");

     $("#datepicker-trigger").datepicker("setDate", new Date());
     //$("#pickMonth").text(moment.format("MMMM"))
     // $("#pickDay").text(moment.format("Do"))
     // $("#pickYear").text(moment.format("YYYY"))

     
      
    })
    
  

	// Folder click listener
	const activeImageSrc = "resources/assets/icons/folder-white.svg";
	const inactiveImageSrc = "resources/assets/icons/folder-gray.svg";
	$(".folders .list .item .title").click(function() {
		// Set all to inactive
		$(".folders .list .item")
			.removeClass("active")
			.find("img")
			.attr("src", inactiveImageSrc);

		// Set clicked to active
		$(this)
			.parents(".item")
			.addClass("active")
			.find("img")
            .attr("src", activeImageSrc);
            
        
	});

   

    
	

    // Initialize folder content on first load of page
    $(".folder-Main").attr("class","item active"); 
    
    getTable();
    generateData();
    generateFolders();
   
	// Initialize dropdown menu for Bulk Actions
	initializeMetisMenu("#folder-bulk-actions");
	initializeMetisMenu("#content-bulk-actions");

	// Event listener for Copy button
	$(document).on("click", ".btn-copy", function() {
		// Log data
       
        if(fnameglobal=="Images")
        {
            copyItem= $(this).parent().parent();
            imageKey=copyItem.find(".title").attr("id");
            var imgCopy;
            for(let i in images)
            {
                
                if(images[i].key==imageKey)
                {
                    imgCopy=images[i].originalImage;
                    var newImage= nativeImage.createFromDataURL(imgCopy);
                    clipboard.writeImage(newImage);
                }
            }



        }
        else{
            copyItem= $(this).parent().parent();
           copytext= copyItem.find(".details .CircularCheckbox .query-name").text();
           var fullclip=shortenedClips[copytext];
            clipboard.writeText(fullclip)
        }
       
		// Get snackbar element
		const snackbar = $("#snackbar");

		// Get snackbar element
		snackbar.text("Copied!");

		// Add show class
		snackbar.addClass("show");

		// Hide the snackbar element by removing the show class after 3000ms (3 seconds)
		setTimeout(function() {
			snackbar.removeClass("show");
		}, 3000);
	});

    $(document).on("click", ".btn-remove", function() {
        // Log data
        toBeDeleted= $(this).parent().parent();

        
	});

   

    $("#bulk-copy").click(function(){
        elements = $(".contents .list > .item").has('.CircularCheckbox [type="checkbox"]:checked');
                if(fnameglobal=="Images")
                {
                   console.log("IMAGES CANT BE BULK COPIED");
                    
                }
                else
                {
                    var clip=elements.find(".details .CircularCheckbox .query-name")
                  
                    var finalclip="";
                    
                    clip.reverse().each(function(){
                       
                         var fullclip=shortenedClips[$(this).text()];
                        finalclip=finalclip+"\n"+fullclip
                        

                    })   
               
                clipboard.writeText(finalclip);

                // Get snackbar element
		const snackbar = $("#snackbar");

		// Get snackbar element
		snackbar.text("Copied!");

		// Add show class
		snackbar.addClass("show");

		// Hide the snackbar element by removing the show class after 3000ms (3 seconds)
		setTimeout(function() {
			snackbar.removeClass("show");
		}, 3000);
                }

                
    });

	// Event Listener for Create Folder button
	$(".btn-create").click(function() {
        // Log data

        var newFolder=$("#folderNameInput").val();
        // Get cloneable row
        const item = $(".folderclone .cloneable");
      
        const foldersList = $(".main-content .folders");
        
			// Filter: Include content if there is supplied query text
			// and supplied text is substring of content description
		
 
			// Generate id for dropdown and checkbox
			const checkboxId = 'folder-id-'+newFolder;

			// Clone the cloneable row
			const newItem = item.clone();

			// Remove cloneable class to so item will be shown
			newItem.removeClass("cloneable");

            newItem.find(".title").html('<img src="resources/assets/icons/folder-gray.svg" width="25" height="25">'+newFolder)
            newItem.find(".CircularCheckbox input").attr("id", checkboxId);
            newItem.find(".CircularCheckbox label").attr("for", checkboxId);
            ipc.send("filecreate",newFolder,"no",""); 
       
			// Append / Add the item in list
			foldersList.find(".list").append(newItem);

			
        
            setFolderListener();
         
    



    $("#folderNameInput").val('')

   
  	});

	// Event listener for Search Input
	$("#search").on("keyup", function() {
		// Get search input data
		const value = $(this)
			.val()
			.trim();

		// Display the folder contents
		generateData(value);
	});

	// Initialize datepicker
	const datepicker = $('[data-toggle="datepicker"]')
		.datepicker({ autoHide: true, trigger: "#datepicker-trigger" })
		.on("pick.datepicker", function(e) {
      // Get date
			const day = e.date.getDate();
			const month = $(this).datepicker("getMonthName");
      const year = e.date.getFullYear();
      const monthnum = e.date.getMonth();
      const date=new Date(year,monthnum,day,23,59,59,0)
     
      timeglobal=date.valueOf();
      getTable();
			// Set date
      //(this).text(`${month} ${day} ${year}`);
      $(this)
				.find(".day")
				.text(day);
			$(this)
				.find(".month")
				.text(month);
			$(this)
				.find(".year")
				.text(year);
			e.preventDefault();
    });
    

    
    $('[data-toggle="datepicker"]').datepicker({
      date: new Date(2014, 1, 14) // Or '02/14/2014'
    });
  

  $('[data-toggle="datepicker"]').datepicker("pick");
 

	// Initialize listeners for Colors Selection Modal
    colorsSelectionModal();
    deleteModal();
    moveModal();
    
        
}


////////////////////////////////////////////////
///////////////////////UI///////////////////////
////////////////////////////////////////////////




$(document).on("dblclick","#list-scrollbar .item .details .CircularCheckbox .query-name", function(){
  var fullclip=shortenedClips[$(this).text()];
  if(isValidUrl(fullclip))
  {
   
    electron.shell.openExternal(fullclip);
    
  }
})


// Add dynamic items in Folder Contents in main.html
const generateData = function(query = "") {
    // Initial date number
    canUpdateDate=false;
    const startDate = 10;

    // Get cloneable row
    const item = $(".Main .cloneable");
   

    // Remove items in Folder Contents list
    container.find("#list-scrollbar").empty();

    // If query is supplied, filter the list
    data.forEach(({ day,month, description,color }, index) => {
        // Filter: Include content if there is supplied query text
        // and supplied text is substring of content description
        if (query.length > 0 && !description.includes(query)) {
            return;
        }

        // Generate id for dropdown and checkbox
        const dropdownId = `more-actions-${day}-${month}-${index}`;
        const checkboxId = `checkbox-${day}-${day}-${index}`;

        // Clone the cloneable row
        const newItem = item.clone();
        var x=color;
        var w ="w"
        if(color=="color-yellow"||color=="color-red"||color=="color-blue"||color=="color-red"||color=="color-green")
        {
            newItem.removeClass().addClass("item " + color);
            
        }
        

        // Remove cloneable class to so item will be shown
        newItem.removeClass("cloneable");

        // Update date data
        
        newItem.find(".date .day").text(month);
        newItem.find(".date .day-number").text(day);


        var cutDescription=description;
        //limit the size of the kleep that is shown
        if(description.length>30)
        {
            cutDescription=description.substring(0,30)
            cutDescription=cutDescription+"..."
        }
        shortenedClips[cutDescription]=description;
        // Update name / description data

        newItem.find(".details .query-name").text(cutDescription);
        if(isValidUrl(description))
        {
          newItem.find(".details .query-name").css('color','blue');
          newItem.find(".details .query-name").css({"font-style": "italic","text-decoration": "underline"});
        }
        

        // Change dropdown id
        newItem.find(".dropdown-menu").attr("id", dropdownId);
        newItem.find(".CircularCheckbox input").attr("id", checkboxId);
        newItem.find(".CircularCheckbox label").attr("for", checkboxId);

        // Append / Add the item in list
        container.find(".list").append(newItem);

        // Initialize the dropdown menu (important)
        initializeMetisMenu(`#${dropdownId}`);
    });
};

const generateFolders = function(query = "") {
   

    // Get cloneable row
    const item = $(".folderclone .cloneable");
    
    var currActive=foldersList.find(".item active").attr("id");
    
    

    
    // Remove items in Folder Contents list
    foldersList.find(".list").empty();

    // If query is supplied, filter the list
    fdata.forEach(({ name }, index) => {
        // Filter: Include content if there is supplied query text
        // and supplied text is substring of content description
        if (query.length > 0 && !description.includes(query)) {
            return;
        }

        // Generate id for dropdown and checkbox
        const checkboxId = 'folder-id-'+name;

        // Clone the cloneable row
        const newItem = item.clone();

        // Remove cloneable class to so item will be shown
        newItem.removeClass("cloneable");

        newItem.attr("id","folder-"+name);
        if(name=="Main"&& init==0)
        {
            newItem.attr("class","item active");
         
         init=1;
        }

        if(name==fnameglobal)
        {
          newItem.attr("class","item active");
        }

        newItem.find(".title").html('<img src="resources/assets/icons/folder-gray.svg" width="25" height="25">'+name)
        newItem.find(".CircularCheckbox input").attr("id", checkboxId);
        newItem.find(".CircularCheckbox label").attr("for", checkboxId);
        // Append / Add the item in list
        foldersList.find(".list").append(newItem);
        
       
    });
    setFolderListener()
   
    
};

// Add dynamic items in Folder Contents in main.html
const generateImages = function(query = "") {

  
    // Initial date number
    const startDate = 10;

    // Get cloneable row
    const item = $(".imageclone .cloneable");
  

    // Remove items in Folder Contents list
    container.find(".list").empty();

    // If query is supplied, filter the list
    images.forEach(({ day, month,image,key }, index) => {
        // Filter: Include content if there is supplied query text
        // and supplied text is substring of content description
        if (query.length > 0 && !description.includes(query)) {
            return;
        }

        // Generate id for dropdown and checkbox
        const dropdownId = `more-actions-${key}`;
        const checkboxId = `checkbox-${key}`;

        // Clone the cloneable row
        const newItem = item.clone();

        // Remove cloneable class to so item will be shown
        newItem.removeClass("cloneable");

        // Update date data
        newItem.find(".date .day").text(month);
        newItem.find(".date .day-number").text(day);
        newItem.find(".title .image").attr("src",image);
        newItem.find(".title").attr("id",key);
        // Update name / description data
        //newItem.find(".details .query-name").text(description);

        // Change dropdown id
       // newItem.find(".dropdown-menu").attr("id", dropdownId);
        newItem.find(".CircularCheckbox input").attr("id", checkboxId);
        newItem.find(".CircularCheckbox label").attr("for", checkboxId);

        // Append / Add the item in list
        container.find(".list").append(newItem);

        // Initialize the dropdown menu (important)
       // initializeMetisMenu(`#${dropdownId}`);
    });
};

function moveModal(){
    const modal = $("#modal-move-folder");
    let selector = null;

    $(document).on("click", '[href="#modal-move-folder"]', function() {
		modal.attr("type", $(this).attr("value"));
        selector = $(this);
        $("#copyselect").empty()
        for(var i in fdata)
        {
            if(fdata[i].name!=="Images"){
            var option = $('<option></option>').attr("value", "option value").text(fdata[i].name);
            $("#copyselect").append(option);
            }
        }
        
    });
    
    // Event for apply
	modal.find(".btn-move").click(function() {
        const selectedValue = modal.find(".selected").attr("value");
        var folderMove =$("#copyselect").children("option:selected").text();
        
        
		if (folderMove!=fnameglobal) {
            const type = modal.attr("type");
           
			let elements;

			if (type === "move-content-single") {
				elements = selector.parents(".item");
            } 
            else if (type === "move-content-bulk") {
				elements = $(".contents .list > .item").has(
					'.CircularCheckbox [type="checkbox"]:checked'
				);
			} 
            
           
            var clip=elements.find(".details .CircularCheckbox .query-name")
            
            
           
            //elements.removeClass().addClass("item " + selectedColor);
            clip.each(function(){
                
                 var fullclip=shortenedClips[$(this).text()];
                  args=[folderMove,fullclip,"white","create",isGroup];
                ipc.send("newclip",args); 
            })
           
            
		// Get snackbar element
		const snackbar = $("#snackbar");

		// Get snackbar element
		snackbar.text("Moved!");

		// Add show class
		snackbar.addClass("show");

		// Hide the snackbar element by removing the show class after 3000ms (3 seconds)
		setTimeout(function() {
			snackbar.removeClass("show");
		}, 3000);
			$.modal.close();
        }
        
	});

}

function deleteModal() {
    
	const modal = $("#modal-delete-confirmation");
    let selector = null;
    
    // Event listeners for color code
	$(document).on("click", '[href="#modal-delete-confirmation"]', function() {
		modal.attr("type", $(this).attr("value"));
		selector = $(this);
	});

	// Event for apply
	modal.find(".btn-delete").click(function() {
        
    const snackbar = $("#snackbar");
		
			const type = modal.attr("type");
			let elements;
            
            if (type === "delete-button")
             {
                
            
                if(fnameglobal=="Images")
                {
                    imageRemoved=toBeDeleted.find(".title").attr("id");
                
                    ipc.send("deleteImage",imageRemoved);
                   
                }
                else
                {
                    clipRemoved=toBeDeleted.find(".details .CircularCheckbox .query-name").text();
                   
                args=[fnameglobal,shortenedClips[clipRemoved],isGroup];
                ipc.send("deleteClip",args);
                
                }
                
                
                        
            } 
            else if (type === "delete-content-bulk") 
            {
                elements = $(".contents .list > .item").has('.CircularCheckbox [type="checkbox"]:checked');
                if(fnameglobal=="Images")
                {
                    var imagesTBD=elements.find(".title");
                    //imageRemoved=toBeDeleted.find(".title").attr("id");
                    imagesTBD.each(function(){
                        ipc.send("deleteImage",$(this).attr("id"));
                      
                   })   

                    
                }
                else
                {
                    var clip=elements.find(".details .CircularCheckbox .query-name")
                  
                    clip.each(function(){
                       
                          args=[fnameglobal,shortenedClips[$(this).text()],isGroup];
                        ipc.send("deleteClip",args); 
                    })   
                
                }
                
               
            } 
            else if (type === "delete-single") 
            {
                elements = $(".contents .list > .item").has('.CircularCheckbox [type="checkbox"]:checked');
                if(fnameglobal=="Images")
                {
                    var imagesTBD=elements.find(".title");
                    //imageRemoved=toBeDeleted.find(".title").attr("id");
                    imagesTBD.each(function(){
                        ipc.send("deleteImage",$(this).attr("id"));
                       
                   })   

                    
                }
                else
                {
                    var clip=elements.find(".details .CircularCheckbox .query-name")
                  
                    clip.each(function(){
                      
                          args=[fnameglobal,shortenedClips[$(this).text()],isGroup];
                        ipc.send("deleteClip",args); 
                    })   
                
                }
                

            }

            else if (type === "folder-bulk") 
            {
        
              elements = $(".folders .list > .item").has(
                '.CircularCheckbox [type="checkbox"]:checked'
              );
              
              var folderNames = elements.find(".title")
              folderNames.each(function(){
                var name =$(this).text();
              
                if(name=="Main")
                {
                  snackbar.text("Can't remove Main");

                  // Add show class
                  snackbar.addClass("show");
       
                  // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
                  setTimeout(function() {
                      snackbar.removeClass("show");
                  }, 3000);
                }

                else if(name=="Images")
                {

                  snackbar.text("Can't remove Images");

                  // Add show class
                  snackbar.addClass("show");
       
                  // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
                  setTimeout(function() {
                      snackbar.removeClass("show");
                  }, 3000);
                }
                else
                {
                    if(fnameglobal==name)
                    {
                      $("#folder-Main").attr("class","item active");
                     
                      fnameglobal="Main";
                      getTable();
                      
                    }

                    ipc.send("deleteFolder",name);
                }
              })
             
            }
            
           
           // Get snackbar element
          
           /*
           snackbar.text("Removed");

           // Add show class
           snackbar.addClass("show");

           // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
           setTimeout(function() {
               snackbar.removeClass("show");
           }, 3000);

           */
           
			$.modal.close();
		
	});
}

function colorsSelectionModal() {
	const modal = $("#modal-color-selection");
	let selector = null;

	// Event listener for colors selection
	modal.find(".colors > div").click(function() {
		modal.find(".colors > div").removeClass("selected");
		$(this).addClass("selected");
		modal.find(".btn-apply").removeAttr("disabled");
	});

	// Event listener for modal selection before close
	modal.on($.modal.BEFORE_OPEN, function() {
		$(".colors > div").removeClass("selected");
		modal.removeAttr("type");
		modal.find(".btn-apply").attr("disabled", true);
		selector = null;
	});

	// Event listeners for color code
	$(document).on("click", '[href="#modal-color-selection"]', function() {
		modal.attr("type", $(this).attr("value"));
		selector = $(this);
	});

	// Event for apply
	modal.find(".btn-apply").click(function() {
		const selectedColor = modal.find(".selected").attr("value");
        
		if (selectedColor.length) {
            const type = modal.attr("type");
         
			let elements;

			if (type === "folder-content") {
				elements = selector.parents(".item");
			} else if (type === "folder-content-bulk") {
				elements = $(".contents .list > .item").has(
					'.CircularCheckbox [type="checkbox"]:checked'
				);
			} else if (type === "folder-bulk") {
        
        elements = $(".folders .list > .item").has(
					'.CircularCheckbox [type="checkbox"]:checked'
        );
        
      }
            
            
            var clip=elements.find(".details .CircularCheckbox .query-name")
           
            
          
            elements.removeClass().addClass("item " + selectedColor);
            clip.each(function(){
               
                 var fullclip=shortenedClips[$(this).text()];
                  args=[fnameglobal,fullclip,selectedColor,"colorChange",isGroup];
                ipc.send("newclip",args); 
            })
           
            
			$.modal.close();
		}
	});
}

function setFolderListener()
{
    $(".folders .list .item .title").off();
    // Folder click listener
const activeImageSrc = "resources/assets/icons/folder-white.svg";
const inactiveImageSrc = "resources/assets/icons/folder-gray.svg";
$(".folders .list .item .title").click(function() {
// Set all to inactive
$(".folders .list .item")
    .removeClass("active")
    .find("img")
    .attr("src", inactiveImageSrc);

// Set clicked to active
$(this)
    .parents(".item")
    .addClass("active")
    .find("img")
    .attr("src", activeImageSrc);
    fnameglobal=$(this).text();
    
    getTable();

    if($(this).text()=="Images")
    {
    const snackbar = $("#snackbar");

		// Get snackbar element
		snackbar.text("Loading Images");

		// Add show class
		snackbar.addClass("show");

		// Hide the snackbar element by removing the show class after 3000ms (3 seconds)
		setTimeout(function() {
			snackbar.removeClass("show");
		}, 3000);

    }
});
}


/////////////////////////////////////////////////////////
///FUNC////////////////////
/////////////////////////////////////////////////////////

function getTable()
{

  canUpdateDate=false;
  console.log("test")
  
  if(connected)
  {
    
    console.log(fnameglobal)
   
    //let filename = document.getElementById("fname").textContent;
    //filename = document.getElementById("fname").textContent;
    if(fnameglobal=="Images"){
      $("#list-scrollbar").addClass("images");
     
        ipc.send("getImages","x");
    }
    else
    {
      $("#list-scrollbar").removeClass("images");
      ipc.send('gettable',fnameglobal,timeglobal,isGroup);
   
    }
  }
 
}



//var connected =false;
const config = {
  timeout: 5000, //timeout connecting to each server, each try
  retries: 5,//number of retries to do before failing
  domain: 'https://apple.com',//the domain to check DNS record of
}

setInterval(function(){

  checkInternetConnected()
  .then((result) => {
    
    connected=true;//successfully connected to a server
  })
  .catch((ex) => {
    connected=false; // cannot connect to a server or error occurred.
  });
},1000);


setInterval(function(){

  if (canUpdateDate==true)
  {
  $('#btnToday').trigger("click");
  console.log("TODAY")
  }
  canUpdateDate=true;
  
},36000000)

//constantly send a new clipboard to check if it is in the db
setInterval(function(){
  
    console.log(connected)
    var clip = clipboard.readImage();
   
    //if(clip.isEmpty())
    if(Object.values(clipboard.availableFormats()).includes("text/rtf"))
    {
      //console.log(clipboard.readRTF());
    }


   
    if(Object.values(clipboard.availableFormats()).includes("text/plain"))
    {
      
      
      clip =clipboard.readText();
      
      if(toggleclip=="Checked" && connected)
      {
      //let filename = document.getElementById("fname").textContent;
     
      
      
      
      
      //if (document.getElementById("temp").textContent!==clip)
      if(lastclip!==clip&& clip.length>0)
      {
        console.log("Found a new clip that is different from last clip: "+ lastclip);
        if(fnameglobal!=="Images")
        {
          args=[fnameglobal,clip,"white","create", isGroup];
          ipc.send('newclip',args);
          console.log("sending newclip");
        }
        if(userSettings['sound']=="Yes")
        {
            new Audio('resources/assets/audio/click.mpeg').play(); 
        }
        if(userSettings['copyToMain']=="Yes"&&fnameglobal!=="Main")
        {
          args=["Main",clip,"white","create", isGroup];
          
          ipc.send('newclip',args);
          console.log("sending newclip to main");
        }
  
        let d = new Date()
        localStorage.setItem(d.getTime().toString(),clip);
      
        localStorage.clear()
        
       
      }
      
      
    }
    lastclip=clip;
    }
    else{
  
      if(toggleclip=="Checked" && connected )
      {
        if(typeof lastclipImage !== 'undefined')
        {
  
        
          if(lastclipImage.toDataURL()!==clip.toDataURL())
          {
            console.log("Found new clip that is an image");
            ipc.send("picture",'1');
            console.log("Sending picture");
       
            //$('#imagesList').append('<li><img src="' + clip + '" /></li>'); 
            lastclipImage=clip;
          
          
          }
        }
  
        else{
            
          console.log("Clipboard is FIRST image!");
          ipc.send("picture",'1');
          console.log("Sending picture");
       
          //$('#imagesList').append('<li><img src="' + clip + '" /></li>'); 
          lastclipImage=clip;
        
        }
      }
    }
    
    
  //set temp to new clip
    //compares against this to see if needs to copy again
    //need to change it to a global variable
    //document.getElementById("temp").innerHTML=clip;


    var midnight = "00:00:00";
var now = null;


now = moment().format("H:mm:ss");


    if (now === midnight) {
      $('#btnToday').trigger("click");
    }
   
        
  },1000);
  



  function GetFormattedDate(d,format) {
 
    var month = (d .getMonth() + 1);
    var day = (d .getDate());
    var year = (d .getFullYear());
    var hour = (d.getHours());
    var minutes = (d.getMinutes());
    monthsArr=["January","February","March","April","May","June","July","August","September","October","November","December"]
    if(format=="MM/DD/YYYY")
    {
      //return month + "/" + day + "/" + year+ "\n" + hour + ":" +minutes;
      return [monthsArr[month-1],day]
    }
    else
    { 
        
        return [day,monthsArr[month-1]]
     // return day + "/" + month + "/" + year+ "\n" + hour + ":" +minutes;
    }
  }
  
// Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.
function resizedataURL(datas, wantedWidth, wantedHeight){
    return new Promise(async function(resolve,reject){
  
        // We create an image to receive the Data URI
        var img = document.createElement('img');
  
        // When the event "onload" is triggered we can resize the image.
        img.onload = function()
        {        
            // We create a canvas and get its context.
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
  
            // We set the dimensions at the wanted size.
            canvas.width = wantedWidth;
            canvas.height = wantedHeight;
  
            // We resize the image with the canvas method drawImage();
            ctx.drawImage(this, 0, 0, wantedWidth, wantedHeight);
  
            var dataURI = canvas.toDataURL();
  
            // This is the return of the Promise
            resolve(dataURI);
        };
  
        // We put the Data URI in the image's src attribute
        img.src = datas;
  
    })
  }// Use it like : var newDataURI = await resizedataURL('yourDataURIHere', 50, 50);
  



  function getImageDimensions(file) {
    return new Promise (function (resolved, rejected) {
      var i = new Image()
      i.onload = function(){
        resolved({w: i.width, h: i.height})
      };
      i.src = file
    })
  }
  

  function isValidUrl(string) {
    try {
      new URL(string);
    } catch (_) {
      return false;  
    }
  
    if (string.includes("http") || string.includes("ftp"))
    {
    return true;
    }

    else{
      return false;
    }
  }



  $(".btn-settings").click(function(){
   
    ipc.send("createWindow","settings");
  })

  $(".user").click(function(){
   
    ipc.send("createWindow","user");
    
  })

///////////////////////////
///////////////////////////
///////IPC LISTENERS///////
///////////////////////////
///////////////////////////





//get the table from firebase
ipc.on("table",function(event,arg){
   
    
    var entries = Object.values(arg);

    //start from bottom

   data=[];
    for(var i=entries.length-1;i>-1;i--)
    {
        var d = new Date(entries[i].timestamp);
        fdate=GetFormattedDate(d,userSettings['dateFormat']);
    data.push({"day":fdate[0],"month":fdate[1],"description":entries[i].kleep,"color":entries[i].color});
   
              
    }
  
   
    generateData();
  });

//Gets the files
ipc.on("newfile",function(event,arg){
    var fnames=Object.keys(arg);
    
  
   fdata=[];
    for(var i=0;i<fnames.length;i++)
    {
      fdata.push({"name":fnames[i]})
   
  
    }

    generateFolders();
   
  });



//gets the settings
  ipc.on("returnSettings",function(event,arg){
    getTable();
    userSettings=arg;
   
  
    //LANGUAGE STUFF, NOT USED RIGHT NOW
    /*
    let rawlang;
    let language;
    if(userSettings["language"]=="English")
    {
      let settings = {
        "languageFile": 'en.json'
      };
      const readf = path.join(__dirname,'/en.json')
      const writef =path.join(__dirname, "/userSettings.json");
       rawlang = fs.readFileSync(readf);
       language = JSON.parse(rawlang);
       fs.writeFileSync(writef,JSON.stringify(settings));
  
    }
    else{
      let settings = {
        "languageFile": 'es.json'
      };
      const readf = path.join(__dirname,'/es.json')
      const writef =path.join(__dirname, "/userSettings.json");
       rawlang = fs.readFileSync(readf);
       language = JSON.parse(rawlang);
       fs.writeFileSync(writef,JSON.stringify(settings));
    }

    */
  
    
  })



//get the images  

ipc.on("recieveImages",function(event,arg){

    processArray(arg);
    async function processArray(arg){
    imagesArr={};
    imagesOriginalSize={};
    images=[]

    
      var sortedArg = arg.sort(function(a, b) {
        return b[2] - a[2];
      });
  
    
    //start from bottom
   
    for(const item of sortedArg)
    {
     
  
     
      var newDataURI= item[0];
      var dimensions = await getImageDimensions(newDataURI);
      
      var ratio = dimensions.w/200;
    
      var newHeight= dimensions.h/ratio;
      var newImage = await resizedataURL(newDataURI, 200, newHeight);
     
     
     var d = new Date(item[2]);
      var fdate=GetFormattedDate(d,userSettings['dateFormat']);
    
      images.push({"day":fdate[0],"month":fdate[1],"fulldate":item[2],"key":item[1],"image":newImage,"originalImage":item[0]});
     imagesArr[item[2]]=item[1];
      imagesOriginalSize[d]=item[0];
    
  
  
    }
    console.log(images)
    generateImages();
  
   
  }
  })


  //print ipc
ipc.on("print",function(event,arg)
{
  //console.log("PRINT TROUBLESHOOT:");
  //console.log(arg);
});


ipc.on("logout",function(event,arg){
    console.log("LOGGING OUT")
    redirect(page.LOGIN);
});


ipc.on("update-available",function(event,arg){
  console.log("UPDATE AVL")
  
});

ipc.on("update-downloaded",function(event,arg){
  console.log("UPDATE DOWNL")
  
});
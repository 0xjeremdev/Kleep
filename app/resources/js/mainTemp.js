const electron = require("electron");
const ipc = electron.ipcRenderer;
const { clipboard } = require("electron");
const { dialog } = require("electron").remote;
const PerfectScrollbar = require("perfect-scrollbar");
const moment = require("moment");
const checkInternetConnected = require("check-internet-connected");
var loadingSpinner = require("loading-spinner");

const sizeOf = require("image-size");

jQuery.fn.reverse = [].reverse;
const nativeImage = electron.nativeImage;

var userSettings = {};
var toggleclip = "Not Checked";
var fnameglobal = "Main";
var timeglobal = "0";
var lastclip = " ";
var lastclipImage;
var isGroup = "0";
var imagesArr;
var imagesOriginalSize;
var amountOfImages = 0;
var init = 0;
var connected = true;
var toBeDeleted;
var toBeDeletedFolder;
var canUpdateDate = false;

// Usage: For redirecting to different pages
const page = {
	LOGIN: "login",
	SETTINGS: "settings",
	MAIN: "main"
};

// Usage: For dynamically inserting Folder contents in main.html
let data = [];
let images = [];
let fdata = [];
let shortenedClips = {};
let annotations = {};
let syncData= [];

let {remote} = require('electron');
let path = require('path');

let appPath = remote.app.getAppPath();
const DashboardActions = require(path.resolve(appPath, 'app/resources/js/dashboard.js'));
const FoldersActions = require(path.resolve(appPath, 'app/resources/js/folders.js'));
const ModalActions = require(path.resolve(appPath, 'app/resources/js/modals.js'));
const ImagesActions = require(path.resolve(appPath, 'app/resources/js/images.js'));
const KleepActions = require(path.resolve(appPath, 'app/resources/js/kleeps.js'));
const HelperActions = require(path.resolve(appPath, 'app/resources/js/helper.js'));


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


$(document).ready()
{

  
	// Initialize scrollbar
	new PerfectScrollbar("#list-scrollbar", { wheelPropagation: false });
	new PerfectScrollbar("#folder-list", { wheelPropagation: false });

	//finish load asks for the folders
	ipc.send("finishload");
  ipc.send("changeMenu");
  ipc.send("getSettings", "");
	timeglobal = 0;

	//need to get user settings


  DashboardActions.initializeCheckbox();
  DashboardActions.initializeTodayBtn();

	FoldersActions.initializeMainAsActive();

	// Initialize folder content on first load of page
	//$(".folder-Main").attr("class","item active");

	

	// Initialize dropdown menu for Bulk Actions
	initializeMetisMenu("#folder-bulk-actions");
	initializeMetisMenu("#content-bulk-actions");

  // Event listener for Copy button
  DashboardActions.initializeCopyBtn();
	

	FoldersActions.initializeFolderDeleteBtn();

 DashboardActions.initializeRemoveBtn();

 DashboardActions.initializeBulkCopyBtn();


 FoldersActions.initializeFolderCreateBtn();
 
 

  DashboardActions.initializeSearchBar()
  DashboardActions.initializeDatepicker()


  ModalActions.ColorSelectionModal();
	ModalActions.DeleteModal();
  ModalActions.MoveModal();
  KleepActions.openAnnotationListener();
  KleepActions.annotateKleepListener();
  
}

// Main
function initializeMain() {
  getTable();
	generateData();
  generateFolders();
  HelperActions.initializeCheckConnection()
  DashboardActions.initializeOtherWindowsBtns();

}

////////////////////////////////////////////////
//////////////////GENERATORS////////////////////
////////////////////////////////////////////////




// Add dynamic items in Folder Contents in main.html
const generateData = function(query = "") {
	// Initial date number
	canUpdateDate = false;
	const startDate = 10;

	// Get cloneable row
	const item = $(".Main .cloneable");

	// Remove items in Folder Contents list
	container.find("#list-scrollbar").empty();

	// If query is supplied, filter the list
	data.forEach(({ day, month, description, color }, index) => {
		// Filter: Include content if there is supplied query text
		// and supplied text is substring of content description
		if (query.length > 0 && !description.toLowerCase().includes(query.toLowerCase())) {
			return;
		}

		// Generate id for dropdown and checkbox
		const dropdownId = `more-actions-${day}-${month}-${index}`;
		const checkboxId = `checkbox-${day}-${day}-${index}`;

		// Clone the cloneable row
		const newItem = item.clone();
    
		
		if (
			color == "color-yellow" ||
			color == "color-red" ||
			color == "color-blue" ||
			color == "color-red" ||
			color == "color-green"
		) {
			newItem.removeClass().addClass("item " + color);
		}

		// Remove cloneable class to so item will be shown
		newItem.removeClass("cloneable");

		// Update date data

		newItem.find(".date .day").text(month);
		newItem.find(".date .day-number").text(day);

		var cutDescription = description;
		//limit the size of the kleep that is shown
		if (description.length > 30) {
			cutDescription = description.substring(0, 30);
			cutDescription = cutDescription + "...";
		}
		shortenedClips[cutDescription] = description;
		// Update name / description data

		newItem.find(".details .query-name").text(cutDescription);
		if (isValidUrl(description)) {
			newItem.find(".details .query-name").css("color", "blue");
			newItem
				.find(".details .query-name")
				.css({ "font-style": "italic", "text-decoration": "underline" });
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

	var currActive = foldersList.find(".item active").attr("id");

	// Remove items in Folder Contents list
	foldersList.find(".list").empty();

	
	fdata.forEach(({ name }, index) => {
		// Generate id for dropdown and checkbox
		const checkboxId = "folder-id-" + name;

		// Clone the cloneable row
		const newItem = item.clone();

		// Remove cloneable class to so item will be shown
		newItem.removeClass("cloneable");

		newItem.attr("id", "folder-" + name);
		if (name == "Main" && init == 0) {
			newItem.attr("class", "item active");

			init = 1;
		}

		if (name == fnameglobal) {
			newItem.attr("class", "item active");
		}

		newItem
			.find(".title")
			.html(
				'<img src="resources/assets/icons/folder-gray.svg" width="25" height="25">' +
					name
			);
		
		// Append / Add the item in list
		foldersList.find(".list").append(newItem);
  });
  
	FoldersActions.setFolderListener();
};

var lock = 0;
var count = 0;
// Add dynamic items in Folder Contents in main.html
const generateImages = function(query = "") {
	// Initial date number
	const startDate = 10;

	// Get cloneable row
	const item = $(".imageclone .cloneable");

	var finishloop = new Promise((resolve, reject) => {
		// Remove items in Folder Contents list

		container.find("#list-scrollbar").empty();
		// If query is supplied, filter the list
		images.forEach(({ day, month, image, key, fulldate }, index) => {
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
			newItem.find(".title .image").attr("src", image);
			newItem.find(".title").attr("id", key);
			// Update name / description data
			//newItem.find(".details .query-name").text(description);

			// Change dropdown id
			// newItem.find(".dropdown-menu").attr("id", dropdownId);
			newItem.find(".CircularCheckbox input").attr("id", checkboxId);
			newItem.find(".CircularCheckbox label").attr("for", checkboxId);

			// Append / Add the item in list
			if (fulldate < timeglobal) {
				container.find(".list").append(newItem);
			}

			if (index === images.length - 1) resolve();
			// Initialize the dropdown menu (important)
			// initializeMetisMenu(`#${dropdownId}`);
		});
	});
};



/////////////////////////////////////////////////////////
///FUNC////////////////////
/////////////////////////////////////////////////////////

function getTable() {
	canUpdateDate = false;

	if (connected) {
		console.log(images.length);
		if (images.length == 0) {
			ipc.send("getImages", "x");
		}

		//let filename = document.getElementById("fname").textContent;
		//filename = document.getElementById("fname").textContent;
		if (fnameglobal == "Images") {
			console.log("aaaaaaaaaaaaa");

			$("#list-scrollbar")
				.empty()
				.addClass("images");
			$("#list-scrollbar").append("<div class='loader'></div>");
			//console.log(images.length)
			if (images.length == 0) {
				ipc.send("getImages", "x");
			} else {
				generateImages();
				ipc.send("getImages", "x");
			}
		} else {
			$("#list-scrollbar").removeClass("images");
			ipc.send("gettable", fnameglobal, timeglobal, isGroup);
		}
	}
}

setInterval(function() {
	//here we sync
	getTable()
}, 10000);



setInterval(function() {
	if (canUpdateDate == true) {
		$("#btnToday").trigger("click");
	}
	canUpdateDate = true;
}, 36000000);

//constantly send a new clipboard to check if it is in the db
setInterval(function() {
	//console.log(connected)
	var clip = clipboard.readImage();

	if (Object.values(clipboard.availableFormats()).includes("text/rtf")) {
		//console.log(clipboard.readRTF());
	}

	if (Object.values(clipboard.availableFormats()).includes("text/plain")) {
		clip = clipboard.readText();

		if (toggleclip == "Checked" && connected) {
			if (lastclip !== clip && clip.length > 0) {
				//console.log("Found a new clip that is different from last clip: "+ lastclip);
				if (fnameglobal !== "Images") {
					args = [fnameglobal, clip, "white", "create", isGroup];
					ipc.send("newclip", args);
					
					syncData.push({
						folder: fnameglobal,
						value: clip,
						action: "create",
						color: "white",
						group: isGroup
					});
					// console.log("sending newclip");
				}
				if (userSettings["sound"] == "Yes") {
					new Audio("resources/assets/audio/click.mpeg").play();
				}
				if (userSettings["copyToMain"] == "Yes" && fnameglobal !== "Main") {
					args = ["Main", clip, "white", "create", isGroup];

					ipc.send("newclip", args);
					syncData.push({
						folder: "Main",
						value: clip,
						action: "create",
						color: "white",
						group: isGroup
					});
					//console.log("sending newclip to main");
				}

				let d = new Date();
				localStorage.setItem(d.getTime().toString(), clip);

				localStorage.clear();
			}
		}
		lastclip = clip;
	} else {
		if (toggleclip == "Checked" && connected) {
			if (typeof lastclipImage !== "undefined") {
				if (lastclipImage.toDataURL() !== clip.toDataURL()) {
					//console.log("Found new clip that is an image");

					var dimensions = sizeOf(clip.toPNG());
					console.log(dimensions);
					ipc.send("picture", "1");

					lastclipImage = clip;
				}
			} else {
				//console.log("Clipboard is FIRST image!");

				ipc.send("picture", "1");
				//console.log("Sending picture");

				//$('#imagesList').append('<li><img src="' + clip + '" /></li>');
				lastclipImage = clip;
			}
		}
	}

	
	var midnight = "00:00:00";
	var now = null;

	now = moment().format("H:mm:ss");

	if (now === midnight) {
		$("#btnToday").trigger("click");
	}
}, 1000);





///////////////////////////
///////////////////////////
///////IPC LISTENERS///////
///////////////////////////
///////////////////////////


function syncToFirebase(syncData, entries)
{
	for(var i=0; i< syncData.length; i++)
	{
		var found = false;
		for (var j=0; j< entries.length;j++)
		{
			if(syncData[i].value == entries[j].kleep)
			{
				console.log(syncData[i].value + " already synced");
				found = true
			}

		}

		if(found)
		{
			syncData.splice(i,1)
			console.log("deleting...")
		}
		else
		{
			console.log("need to add "+ syncData[i].value)
		}
	}

}
//get the table from firebase
ipc.on("table", function(event, arg) {
	var entries = Object.values(arg);

	console.log(syncData);
	syncToFirebase(syncData, entries);
	//console.log(entries);
	//start from bottom

	data = [];
	for (var i = entries.length - 1; i > -1; i--) {
		var d = new Date(entries[i].timestamp);
		fdate = GetFormattedDate(d, userSettings["dateFormat"]);
		if ("annotation" in entries[i]) {
			data.push({
				day: fdate[0],
				month: fdate[1],
				description: entries[i].kleep,
				color: entries[i].color,
				annotation: entries[i].annotation
			});
			annotations[entries[i].kleep] = entries[i].annotation;
		} else {
			data.push({
				day: fdate[0],
				month: fdate[1],
				description: entries[i].kleep,
				color: entries[i].color
			});
		}
	}
	//console.log(data)
	generateData();
});

//Gets the files
ipc.on("newfile", function(event, arg) {
	var fnames = Object.keys(arg);

	fdata = [];
	for (var i = 0; i < fnames.length; i++) {
		fdata.push({ name: fnames[i] });
	}

	generateFolders();
});

//gets the settings
ipc.on("returnSettings", function(event, arg) {
	getTable();
	userSettings = arg;

	
});

//get the images

ipc.on("recieveImages", function(event, arg) {
	processArray(arg);
	async function processArray(arg) {
		imagesArr = {};
		imagesOriginalSize = {};
		images = [];

		var sortedArg = arg.sort(function(a, b) {
			return b[2] - a[2];
		});

		//start from bottom

		for (const item of sortedArg) {
			var newDataURI = item[0];

			if (item[4] == 0) {
				var dimensions = await ImagesActions.getImageDimensions(newDataURI);
				//ipc.send("storeImageDimensions",dimensions.w, dimensions.h, item[1]);
			} else {
				var dimensions = { w: item[3], h: item[4] };
			}

			if (dimensions.w != 0 && newDataURI.length > 100) {
				var ratio = dimensions.w / 200;

				var newHeight = dimensions.h / ratio;
				var newImage = await ImagesActions.resizeDataUrl(newDataURI, 200, newHeight);

				var d = new Date(item[2]);
				var fdate = GetFormattedDate(d, userSettings["dateFormat"]);

				images.push({
					day: fdate[0],
					month: fdate[1],
					fulldate: item[2],
					key: item[1],
					image: newImage,
					originalImage: item[0]
				});
				imagesArr[item[2]] = item[1];
				imagesOriginalSize[d] = item[0];
			}
		}
		$(".loader").remove();
		console.log(images);
		generateImages();
	}
});

//print ipc
ipc.on("print", function(event, arg) {
	//console.log("PRINT TROUBLESHOOT:");
	//console.log(arg);
});

ipc.on("printerror", function(event, arg) {
	console.log("PRINT ERROR:");
	console.log(arg);
});

ipc.on("logout", function(event, arg) {
	console.log("LOGGING OUT");
	redirect(page.LOGIN);
});

ipc.on("update-available", function(event, arg) {
	let options = {
		buttons: ["Yes", "No", "Cancel"],
		message: "update-available"
	};
	let response = dialog.showMessageBox(options);
});

ipc.on("update-available", function(event, arg) {
	let options = {
		buttons: ["Yes", "No", "Cancel"],
		message: "update-Down"
	};
	let response = dialog.showMessageBox(options);
});

//AKIA5643XVMRBWDJAHRA
//oN/wIFQRwH/8M1VKn+OcAf5TFsOOV/bje5lgRL9u

////////////////////////////////////////
////////////////////////////////////////
////////////////////////////////////////
//HELPER///////////////////////////////
////////////////////////////////////
///////////////////////////////////////////



function GetFormattedDate(d, format) {
	var month = d.getMonth() + 1;
	var day = d.getDate();
	var year = d.getFullYear();
	var hour = d.getHours();
	var minutes = d.getMinutes();
	monthsArr = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	if (format == "MM/DD/YYYY") {
		//return month + "/" + day + "/" + year+ "\n" + hour + ":" +minutes;
		return [monthsArr[month - 1], day];
	} else {
		return [day, monthsArr[month - 1]];
		// return day + "/" + month + "/" + year+ "\n" + hour + ":" +minutes;
	}
}




function isValidUrl(string) {
	try {
		new URL(string);
	} catch (_) {
		return false;
	}

	if (string.includes("http") || string.includes("ftp")) {
		return true;
	} else {
		return false;
	}
}





/**
 * This file contains the script used to manipulate HTML elements.
 * Initialization of libraries are also present in this file.
 */


const electron = require('electron');
const ipc=electron.ipcRenderer;
// Usage: For keycode conversion to symbol
const keyboardMap = {
	"16": "shift",
	"17": "ctrl",
	"18": "alt",
	"27": "esc",
	"32": "space",
	"35": "end",
	"36": "home",
	"37": "←",
	"38": "↑",
	"39": "→",
	"40": "↓",
	"48": "0",
	"49": "1",
	"50": "2",
	"51": "3",
	"52": "4",
	"53": "5",
	"54": "6",
	"55": "7",
	"56": "8",
	"57": "9",
	"59": ";",
	"61": "=",
	"65": "A",
	"66": "B",
	"67": "C",
	"68": "D",
	"69": "E",
	"70": "F",
	"71": "G",
	"72": "H",
	"73": "I",
	"74": "J",
	"75": "K",
	"76": "L",
	"77": "M",
	"78": "N",
	"79": "O",
	"80": "P",
	"81": "Q",
	"82": "R",
	"83": "S",
	"84": "T",
	"85": "U",
	"86": "V",
	"87": "W",
	"88": "X",
	"89": "Y",
	"90": "Z",
	"91": "⌘",
	"173": "-",
	"186": ";",
	"187": "=",
	"188": ",",
	"189": "-",
	"190": ".",
	"191": "/",
	"192": "`",
	"219": "[",
	"220": "\\",
	"221": "]",
	"222": "'"
};

// Usage: For redirecting to different pages
const page = {
	LOGIN: "login",
	SETTINGS: "settings",
	MAIN: "main"
};



// Usage: Languages data
let copyMainIndex = 0;
const languages = ["English", "Español"];

// Usage: Date format data
let selectedDateFormatIndex = 0;
const dateFormats = [
	"DD/MM/YYYY",
	"MM/DD/YYYY"
	
];

// Usage: Time format data
let selectedLanguageIndex = 0;
const copyMain = ["Yes", "No"];

// Usage: Toggle hotkey input
const SETTINGS_HOTKEY_SCOPE = "settings";
const DEFAULT_HOTKEY_SCOPE = "all";

/**
 * For redirecting to a page. Uses `page` object
 * @param {string} page
 */
function redirect(page) {
	window.location.href = `${page}.html`;
}


var soundUser;
var languageUser;
var dateUser;
var copyMainUser;



// Settings
function hotkeysInitialization(container) {
	hotkeys("*", SETTINGS_HOTKEY_SCOPE, function(event, handler) {
		const keys = hotkeys.getPressedKeyCodes();
		const symbolKeys = keys
			.filter(keyCode => keyboardMap.hasOwnProperty(keyCode))
			.map(keyCode => keyboardMap[keyCode]);

		if (symbolKeys.length) {
			$(container).text(symbolKeys.slice(0, 2).join(" + "));
		} else {
			$(container).text("empty");
		}
	});
}

function initializeSettings() {

	
	
	languageUser = $("#language-input").text();
	// dateUser = $("#date-format-input").text();
	 copyMainUser = $("#copy-main-input").text();
	 soundUser = $("#copy-sounds-input").is(":checked");
    
    
   
    
    
    // Event Listener for Ready Button in settings.html
   
	$("#ready").click(function() {
		// Log information
		console.log("ready clicked");

        ipc.send("updateSettings",languageUser,dateUser,soundUser,copyMainUser);
		// Redirect to Main page
		redirect(page.MAIN);
	});

	/*
	// Initialize Hotkey listener
	hotkeysInitialization("#hotkey-value");
	let snackbarTimeout = null;
	// Event listener for HotKey
	$("#hotkey-value").click(function() {
		clearTimeout(snackbarTimeout);

		// Get snackbar element
		const snackbar = $("#snackbar");

		// Check if can input keys
		if (hotkeys.getScope() === DEFAULT_HOTKEY_SCOPE) {
			hotkeys.setScope(SETTINGS_HOTKEY_SCOPE);
			snackbar.text("Start Pressing...");
			$(".shortcut-on").removeClass("hide");
		} else {
			hotkeys.setScope(DEFAULT_HOTKEY_SCOPE);
			snackbar.text("Shortcut Saved!");
            $(".shortcut-on").addClass("hide");
            console.log($("#hotkey-value").text());
            shortcutUser=$("#hotkey-value").text();
            ipc.send("newShortcut",shortcutUser);
            ipc.send("updateSettings",languageUser,dateUser,soundUser,shortcutUser,copyMainUser);
            console.log("SENT");
            
		}

		// Add show class
		snackbar.addClass("show");

		// Hide the snackbar element by removing the show class after 3000ms (3 seconds)
		snackbarTimeout = setTimeout(function() {
			snackbar.removeClass("show");
		}, 3000);
	});

	*/
	// Event listener for Copy Sounds
	$("#copy-sounds-input").change(function() {
		const copySoundsValue = $(this).is(":checked");
        console.log("Copy Sounds", copySoundsValue);
       if(copySoundsValue==true)
       {
        soundUser="Yes"
       }
        else
        {
            soundUser="No"
        }
        ipc.send("updateSettings",languageUser,dateUser,soundUser,copyMainUser);
        console.log("SENT");
	});

	// Event listener for Landuage
	$("#language-input").click(function() {
		$(this).text(languages[++selectedLanguageIndex % languages.length]);
		console.log(
			"Language",
			languages[selectedLanguageIndex % languages.length]
        );
        languageUser=languages[selectedLanguageIndex % languages.length];
        ipc.send("updateSettings",languageUser,dateUser,soundUser,copyMainUser);
        console.log("SENT")
	});

	// Event listener for Date Format
	/*$("#date-format-input").click(function() {
		$(this).text(dateFormats[++selectedDateFormatIndex % dateFormats.length]);
		console.log(
			"Date Format",
			dateFormats[selectedDateFormatIndex % dateFormats.length]
        );
        
        dateUser=dateFormats[selectedDateFormatIndex % dateFormats.length]
        ipc.send("updateSettings",languageUser,dateUser,soundUser,copyMainUser);
        console.log("SENT")
	});

	*/
	// Event listener for Time Format
	$("#copy-main-input").click(function() {
		$(this).text(copyMain[++copyMainIndex % copyMain.length]);
		console.log(
			"Time Format",
			copyMain[copyMainIndex % copyMain.length]
        );
        copyMainUser=copyMain[copyMainIndex % copyMain.length]
        ipc.send("updateSettings",languageUser,dateUser,soundUser,copyMainUser);
        console.log("SENT")
	});
}




// Popup Settings
function initializePopupSettings() {
	ipc.send("getSettings","");
	initializeSettings();

	// Event listener for Upgrade button
	$("#upgrade").click(function() {
		electron.shell.openExternal('https://kleep.io');
	});

	// Event listener for Support button
	$("#support").click(function() {
		electron.shell.openExternal('https://kleep.io');
	});
}

// Popup User Info
function initializePopupUserInfo() {
	// Event listener for Upgrade button
	$("#upgrade").click(function() {
		console.log("Upgrade Clicked");
	});

	// Event listener for Change buttons
	$(".change-button").click(function() {
		console.log("Change", $(this).val());
	});
}


ipc.on("returnSettings",function(event,args){
	console.log(args)


	 
    $("#language-input").text(args.language);
    //$("#date-format-input").text(args.dateFormat);
	 $("#copy-main-input").text(args.copyToMain);
	if(args.sound=="Yes")
	{
		$("#copy-sounds-input").prop("checked",true);
		
	}
	else{
		$("#copy-sounds-input").prop("checked",false);
	}
	
	
    languageUser = $("#language-input").text();
   // dateUser = $("#date-format-input").text();
    copyMainUser = $("#copy-main-input").text();
    soundUser = $("#copy-sounds-input").is(":checked");


});
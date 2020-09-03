"use strict";
const electron = require("electron");
const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const { autoUpdater } = require('electron-updater');
const { is } = require("electron-util");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const contextMenu = require("electron-context-menu");
const config = require("./config");
const url = require('url');
const appPath = "/app";
const mainPage = "login";
const mainPageLog = "main";
const settingsPage ="popup-settings";
const userPage ="popup-user-info";

unhandled();
debug();
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId("com.company.AppName");



const { clipboard, globalShortcut } = require('electron');




const ipc = electron.ipcMain;
const dialog = electron.dialog;
const Tray = electron.Tray;

// Prevent window from being garbage collected
let mainWindow;
let settingsWindow;
let UserWindow;
const iconPath = path.join(__dirname, 'kleepTray.png')
let tray = null

app.on("ready",function() {
	createMainWindow();
	
	tray = new Tray(iconPath)
	if (process.platform === 'win32') {
	  
	  tray.on('click', tray.popUpContextMenu);
	}
	else{
  
	  tray.on('click',function(){ 
  
		if(mainWindow==null)
		{
			createMainWindow();
		}
  
	  });
	}
  
	let traytemplate = [
	  {
		label: 'Open',
		
		click(){
		  clipboard.writeText("yes");
		  createMainWindow();
		},
		accelerator: process.platform == 'darwin' ? 'Command+K' : 'Ctrl+X'
	  },
	  {
		label: 'Quit',
		
		click(){
		  app.quit();
		},
		accelerator: process.platform == 'darwin' ? 'Command+P' : 'Ctrl+P'
	  }
	]
  
	const contextMenu = Menu.buildFromTemplate(traytemplate)
	tray.setContextMenu(contextMenu)
	tray.setToolTip('KLEEEEEP')
  
	const activationShortcut = globalShortcut.register(
	  'CommandOrControl+K',
	  () => { 
		if(mainWindow==null)
		{
			createMainWindow();
		}
		else
		{
			mainWindow.show();
		}
		 
	  }
	);
  
	
	if (!activationShortcut) {
	  console.error('Global activation shortcut failed to register');
	}

  if (process.platform === 'darwin'){
	const dockMenu = Menu.buildFromTemplate([
	  {
		label: 'Open',
		click () { 
		  if(mainWindow==null)
		{
			createMainWindow();
		}
		 }
	  }, 
	  { label: 'New Command...' }
	])
	
	app.dock.setMenu(dockMenu)
  
  }
});



// Prevent multiple instances of the app
if (!app.requestSingleInstanceLock()) {
	app.quit();
}

app.on("second-instance", () => {
	if (mainWindow) {
		if (mainWindow.isMinimized()) {
			mainWindow.restore();
		}

		mainWindow.show();
	}
});

app.on("activate",()=>{

	if(mainWindow==null)
		{
			createMainWindow();
		}
		else
		{
			mainWindow.show();
		}
})

app.on("window-all-closed", () => {
	if (!is.macos) {
		//app.quit();
	}
});


const nativeImage = require('electron').nativeImage;
    var image = nativeImage.createFromPath(__dirname + '/IconoKleep.png'); 

function createMainWindow() {

	var user = firebase.auth().currentUser;

	
	mainWindow = new BrowserWindow({
		title: app.name,
		show: false,
		width: 930,
		height: 700,
		backgroundColor: "#f4f8ff",
		webPreferences: {
			nodeIntegration: true
		  },
		icon:image
	});

	if(user){
		mainWindow.loadURL(url.format({
			pathname: path.join(path.join(__dirname, `${appPath}/${mainPageLog}.html`)),
			protocol: 'file:',
			slashes: true
		  }));
	}
	else
	{
		mainWindow.loadURL(url.format({
			pathname: path.join(path.join(__dirname, `${appPath}/${mainPage}.html`)),
			protocol: 'file:',
			slashes: true
		  }));
	}
	
	  

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
		autoUpdater.checkForUpdatesAndNotify();
	});

	mainWindow.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = null;
	});

	var locale=app.getLocale();
  console.log(locale);
  if(locale.includes('en'))
  {
  const menu = Menu.buildFromTemplate(logintemplate)
  //Insert Menu
  Menu.setApplicationMenu(menu);
  }

	
};


autoUpdater.on('update-available', () => {
	mainWindow.webContents.send('update_available');
  });
  autoUpdater.on('update-downloaded', () => {
	mainWindow.webContents.send('update_downloaded');
  });

function createSettingsWindow() {
	
	settingsWindow = new BrowserWindow({
		parent: mainWindow,
		//modal: true,
		alwaysOnTop:true,
		width: 500,
		height: 500,
		backgroundColor: "#f4f8ff",
		webPreferences: {
			nodeIntegration: true
		  }
	});

	
		settingsWindow.loadURL(url.format({
			pathname: path.join(path.join(__dirname, `${appPath}/${settingsPage}.html`)),
			protocol: 'file:',
			slashes: true
		  }));

	
	
	  

	settingsWindow.on("ready-to-show", () => {
		settingsWindow.show();
	});

	settingsWindow.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		settingsWindow = null;
	});

	
};




function createUserWindow() {
	
	UserWindow = new BrowserWindow({
		parent: mainWindow,
		//modal: true,	
		alwaysOnTop:true,
		width: 500,
		height: 500,
		backgroundColor: "#f4f8ff",
		webPreferences: {
			nodeIntegration: true
		  }
	});

	
		UserWindow.loadURL(url.format({
			pathname: path.join(path.join(__dirname, `${appPath}/${userPage}.html`)),
			protocol: 'file:',
			slashes: true
		  }));

	
	
	  

	UserWindow.on("ready-to-show", () => {
		UserWindow.show();
	});

	UserWindow.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		UserWindow = null;
	});

	
};



const isMac = process.platform === 'darwin'


const logintemplate =[
	// { role: 'appMenu' }
	...(isMac ? [{
	  label: app.name,
	  submenu: [
		{ role: 'about' },
		{ type: 'separator' },
		{ role: 'services' },
		{ type: 'separator' },
		{ role: 'hide' },
		{ role: 'hideothers' },
		{ role: 'unhide' },
		{ type: 'separator' },
		{ role: 'quit' }
	  ]
	}] : []),
	// { role: 'fileMenu' }
	{
	  label: 'File',
	  submenu: [
		
		
		isMac ? { role: 'close' } : { role: 'quit' }
	  ]
	},
	// { role: 'editMenu' }
	{
	  label: 'Edit',
	  submenu: [
		//{ role: 'undo' },
	   // { role: 'redo' },
		{ type: 'separator' },
		{ role: 'cut' },
		{ role: 'copy' },
		{ role: 'paste' },
		...(isMac ? [
		  { role: 'pasteAndMatchStyle' },
		  { role: 'delete' },
		  { role: 'selectAll' },
		  { type: 'separator' },
		  {
			label: 'Speech',
			submenu: [
			  { role: 'startspeaking' },
			  { role: 'stopspeaking' }
			]
		  }
		] : [
			//{ role: 'delete' },
			{ type: 'separator' },
			//{ role: 'selectAll' }
		  ])
	  ]
	},
	// { role: 'viewMenu' }
	{
	  label: 'View',
	  submenu: [
		{ role: 'reload' },
		{ role: 'forcereload' },
		{ role: 'toggledevtools' },
		{ type: 'separator' },
		{ role: 'resetzoom' },
		{ role: 'zoomin' },
		{ role: 'zoomout' },
		{ type: 'separator' },
		{ role: 'togglefullscreen' }
	  ]
	},
	// { role: 'windowMenu' }
	{
	  label: 'Window',
	  submenu: [
		{ role: 'minimize' },
		{ role: 'zoom' },
		...(isMac ? [
		  { type: 'separator' },
		  { role: 'front' },
		  { type: 'separator' },
		  { role: 'window' }
		] : [
			{ role: 'close' }
		  ])
	  ]
	},
	{
	  role: 'help',
	  submenu: [
		{
		  label: 'Learn More',
		  click: async () => {
			const { shell } = require('electron')
			await shell.openExternal('https://electronjs.org')
		  }
		}
	  ]
	}
  ]

  
  
  
const mainTemplate = [
	// { role: 'appMenu' }
	...(isMac ? [{
	  label: app.name,
	  submenu: [
		{ role: 'about' },
		{ type: 'separator' },
		{ role: 'services' },
		{ type: 'separator' },
		{ role: 'hide' },
		{ role: 'hideothers' },
		{ role: 'unhide' },
		{ type: 'separator' },
		{ role: 'quit' }
	  ]
	}] : []),
	// { role: 'fileMenu' }
	{
	  label: 'File',
	  submenu: [
		
		{
			label: 'Logout',
			click() {
			  Logout();
			}
		
		  },
		
		isMac ? { role: 'close' } : { role: 'quit' }
	  ]
	},
	// { role: 'editMenu' }
	{
	  label: 'Edit',
	  submenu: [
		//{ role: 'undo' },
	   // { role: 'redo' },
		{ type: 'separator' },
		{ role: 'cut' },
		{ role: 'copy' },
		{ role: 'paste' },
		...(isMac ? [
		  { role: 'pasteAndMatchStyle' },
		  { role: 'delete' },
		  { role: 'selectAll' },
		  { type: 'separator' },
		  {
			label: 'Speech',
			submenu: [
			  { role: 'startspeaking' },
			  { role: 'stopspeaking' }
			]
		  }
		] : [
			//{ role: 'delete' },
			{ type: 'separator' },
			//{ role: 'selectAll' }
		  ])
	  ]
	},
	// { role: 'viewMenu' }
	{
	  label: 'View',
	  submenu: [
		{ role: 'reload' },
		{ role: 'forcereload' },
		{ role: 'toggledevtools' },
		{ type: 'separator' },
		{ role: 'resetzoom' },
		{ role: 'zoomin' },
		{ role: 'zoomout' },
		{ type: 'separator' },
		{ role: 'togglefullscreen' }
	  ]
	},
	// { role: 'windowMenu' }
	{
	  label: 'Window',
	  submenu: [
		{ role: 'minimize' },
		{ role: 'zoom' },
		...(isMac ? [
		  { type: 'separator' },
		  { role: 'front' },
		  { type: 'separator' },
		  { role: 'window' }
		] : [
			{ role: 'close' }
		  ])
	  ]
	},
	{
	  role: 'help',
	  submenu: [
		{
		  label: 'Learn More',
		  click: async () => {
			const { shell } = require('electron')
			await shell.openExternal('https://electronjs.org')
		  }
		}
	  ]
	}
  ]
  
  
  //if mac add empty object to menu
  //if (process.platform == 'darwin') {
	//mainTemplate.unshift({});
  //}
  
  
  ipc.on("changeMenu",function(event,arg){
	const menu = Menu.buildFromTemplate(mainTemplate)
	//Insert Menu
	Menu.setApplicationMenu(menu);
  })
  
  


ipc.on("createWindow", function(event,arg){
	event.sender.send("print",arg)
	
	if(arg=="settings")
	{
		createSettingsWindow();
		event.sender.send("print","settingssssssssssssssss")
	}
	else if (arg == "user"){
		createUserWindow();
		event.sender.send("print","userrrrrrrrrrrrrrrr")

	}	
	

})


//
//FIREBASE
//
//const {Firestore} = require('@google-cloud/firestore');
var firebase = require('firebase');
require('firebase/firestore');

var firebaseConfig = {
  apiKey: "AIzaSyC2gjoCBBXFcE8U-Rm3fBbGcQIW6ZMcR9Y",
  authDomain: "kleep-86262.firebaseapp.com",
  databaseURL: "https://kleep-86262.firebaseio.com",
  projectId: "kleep-86262",
  storageBucket: "kleep-86262.appspot.com",
  messagingSenderId: "1004954643955",
  appId: "1:1004954643955:web:a4701d5702593279bbf686",
  measurementId: "G-018C9JYCZL"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const database = firebase.database();



/*
  firebase.firestore().disableNetwork()
    .then(function() {
        // Do offline actions
        // ...
    });




    firebase.firestore().enableNetwork()
    .then(function() {
        // Do online actions
        // ...
    });

  */





/////////////////////////
/////AUTHENTICATION//////
/////////////////////////

//signup
ipc.on("signup", function (event, args) {


  firebase.auth().createUserWithEmailAndPassword(args[0], args[1]).then(function () {
    event.sender.send("signupresult", "success");
    var dbref = database.ref();
    dbref.child(firebase.auth().currentUser.uid).set({
      email: args[0],
      language: "English",
    dateFormat: "American",
    sound: "Sound On",
    copyToMain: "Only copy to main when active"
    });
    dbref.child(firebase.auth().currentUser.uid).child("Folders").set({
      number: 1
    });
    dbref.child(firebase.auth().currentUser.uid).child("Folders").child("Main").set({
      name: "Main",
      private: "yes",
      password: "no"
    });

    dbref.child(firebase.auth().currentUser.uid).child("FolderNames").child("Images").set({
      name: "Images"

    });
    dbref.child(firebase.auth().currentUser.uid).child("FolderNames").child("Main").set({
      name: "Main"

    });

    //dbref.child(firebase.auth().currentUser.uid).set("test");


  }).catch(function (error) {
    if (error !== null) {
      event.sender.send("signupresult", "failure");
      return;
    }
    else {
      event.sender.send("signupresult", "failure");
    }

  });


});


//signing
ipc.on("signin", function (event, args) {

  firebase.auth().signInWithEmailAndPassword(args[0], args[1]).then(function () {
	event.sender.send("loginresult", "success");
	
	checkConnection();

  }).catch(function (error) {
    if (error !== null) {
      event.sender.send("loginresult", error);
      return;
    }
    else {
      event.sender.send("loginresult", "failure");
    }

  });
});

ipc.on("needuser", function (event) {
  event.sender.send("userback", firebase.auth().currentUser);
  //event.sender.send("userback","user");
})


//update the user settings
ipc.on('updateSettings', function (event, lang, date, sound,copy) {
  var dbref = database.ref();
  dbref.child(firebase.auth().currentUser.uid).child("Settings").update({
    language: lang,
    dateFormat: date,
    sound: sound,
	copyToMain: copy
	
	
  });
  var settings={ language: lang,
    dateFormat: date,
    sound: sound,
	copyToMain: copy
	
	};
    mainWindow.webContents.send("returnSettings", settings);

  
  });

//get the settings for when the app starts
ipc.on("initialSettings", function(event,arg){
  var settingref=database.ref();
  settingref.child(firebase.auth().currentUser.uid).child("Settings").once("value").then(function(snapshot){
    event.sender.send("returnSettings", snapshot.val());
  });
});

//return the settings of the user
ipc.on("getSettings",function(event,arg){
  database.ref(firebase.auth().currentUser.uid + "/Settings").once('value').then(function(snapshot) {
    event.sender.send("returnSettings",snapshot.val());
  });

});



//check if connected
firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // User is signed in.
  } else {
    // No user is signed in.
    //need to send to the login page
    //loginWindow.webContents.send("logout", null);
  }
});

//ALSO ADD PERSISTENCE 


function Logout() {
  firebase.auth().signOut().then(function () {
    mainWindow.webContents.send("logout", firebase.auth().currentUser);
    // Sign-out successful.
    const menu = Menu.buildFromTemplate(logintemplate)
  //Insert Menu
  Menu.setApplicationMenu(menu);
  }, function (error) {
    // An error happened.
  });
}

ipc.on("getUser", function(event,arg){
	event.sender.send("returnUser",firebase.auth().currentUser.email);
})


ipc.on("checkConnection", function(event,arg){
		
	event.sender.send('print', "INSIDE CHECKCONNECTION");

		var connectedRef = firebase.database().ref(".info/connected");
		connectedRef.once("value", function(snap) {
		  if (snap.val() === true) {
			event.sender.send('print', "&&&&&&&&&&&&&&&&&&&&&7CONNECTED&&&&&&&&&&&&&&&&7");
		  } else {
			event.sender.send('print', "&&&&&&&&&&&&&&&&&&&&&NOT&&&&&&&&&&&&&&&&");
		  }
		});
		
		


})




////////////////////////
////////DATABASE////////
////////////////////////

//Add a new clip to  the database
//need to fix
ipc.on("newclip", function (event, args) {
  
	let d = new Date();
	//found is used to check if the clip is already in the current folder
	let found = 0;
  
	//get a reference to the user folder's cliphistory, specifically to see if the new clip is in there
	if (args[4] == "0") {
	  var ref = database.ref(firebase.auth().currentUser.uid + "/Folders/" + args[0] + "/cliphistory").orderByChild("kleep").equalTo(args[1]);
	}
	else {
	  var ref = database.ref("Groups/" + args[4] + "/cliphistory").orderByChild("kleep").equalTo(args[1]);
  
	}
  
	ref.once("value").then(function (snapshot) {
  
	  //if it exists then update the timestamp of the clip
	  if (snapshot.exists()) {
		found = found + snapshot.numChildren();
		var clipid = Object.keys(snapshot.val())[0];
		//the Object.keys might not work in other env, need to look how to change that
		//event.sender.send("newklip", clipid);
		if (args[3] == "create") {
		  snapshot.ref.update({
			[clipid + '/timestamp']: d.getTime(),
			//[clipid + '/color']: args[2]
		  });
		}
		if (args[3] == "colorChange") {
		  snapshot.ref.update({
			[clipid + '/color']: args[2]
		  });
		}
	  }
  
  
	}).then(function () {
	  //had to do a the instead of else as a new db ref was needed
	  //here we go ahead and create it if it wasn't there
	  if (found == 0) {
		var dbref = database.ref();
		if (args[4] == "0") {
		  var newclipref = dbref.child(firebase.auth().currentUser.uid).child("Folders").child(args[0]).child("cliphistory").push();
		}
		else {
		  var newclipref = dbref.child("Groups").child(args[4]).child("cliphistory").push();
  
		}
  
  
		newclipref.set({
		  kleep: args[1],
		  timestamp: d.getTime(),
		  color: args[2]
		});
		event.sender.send("print", "NEW CLIP CREATED  with color:" + args[2]);
	  }
	  else {
		event.sender.send("print", "CLIP UPDATED with color:" + args[2]);
	  }
  
	});
   
  
  });

  ipc.on("annotate",function(event, folder, clip, annotation){

	var ref = database.ref(firebase.auth().currentUser.uid + "/Folders/" + folder + "/cliphistory").orderByChild("kleep").equalTo(clip);
	ref.once("value").then(function (snapshot) {
  
		var clipid = Object.keys(snapshot.val())[0];
		snapshot.ref.update({
			[clipid + '/annotation']: annotation,
			
		  });
		
	  });
  });
  
  
  
  //add file to database
  //as of now we are creating them in 2 separate locations: one with only the names and one with the cliphistory
  ipc.on("filecreate", function (event, fname, passwordprotectedIn, passwordIn) {
  
	var dbref = database.ref();
	
  
	dbref.child(firebase.auth().currentUser.uid).child("Folders").child(fname).set({
	  name: fname,
	  private: "yes",
	  passwordprotected: passwordprotectedIn,
	  password: passwordIn
	});
  
  
  
	dbref.child(firebase.auth().currentUser.uid).child("FolderNames").child(fname).set({
	  name: fname
  
	});
	var fnamesref = database.ref(firebase.auth().currentUser.uid + '/FolderNames');
	fnamesref.once('value', function (snap) {
	  //send the folder names to be shown
	  
	  event.sender.send('newfile', snap.val());
	});
  
  
  });
  
  //send the files at the start when the window loads
  ipc.on("finishload", function (event) {
	var fnamesref = database.ref(firebase.auth().currentUser.uid + '/FolderNames');
	fnamesref.on('value', function (snap) {
	  mainWindow.webContents.send('newfile', snap.val());
	});
  
	var groupref = database.ref(firebase.auth().currentUser.uid + '/Groups');
	groupref.on('value', function (snap) {
	  mainWindow.webContents.send('newgroup', snap.val());
	});
  
  });
  
  
  //LISTENER
  //WHEN NEW FILE NEED TO CLOSE IT AND DO NEW QUERY
  //NEEDS TO BE A GLOBAL VARIABLE
  var fileref = database.ref();
  
  //the renderer process is asking for the table
  ipc.on("gettable", function (event, fname, timeselected, isgroup) {
  
	event.sender.send("print", "got this from gettable " + fname + timeselected);
	
	//reset the db ref
	fileref.off();
	if( typeof unsubscribe!== 'undefined')
	{
	unsubscribe();
	}
  
	let d = new Date();
  
	//check if there is a specific time chosen
	//ordered by time in ascending order
	if (timeselected == 0) {
	  mainWindow.webContents.send("print", "NO TIME FILTER" + timeselected);
	  
	  //check if it is a group folder
	  if (isgroup == 0) {
		fileref = database.ref(firebase.auth().currentUser.uid + "/Folders/" + fname + "/cliphistory").orderByChild("timestamp");
  
	  }
	  else {
  
		fileref = database.ref("Groups/" + isgroup + '/cliphistory').orderByChild("timestamp");
	  }
	}
	else {
	  //mainWindow.webContents.send("print", "YES TIME FILTER" + timeselected);
	  if (isgroup == 0) {
		fileref = database.ref(firebase.auth().currentUser.uid + "/Folders/" + fname + "/cliphistory").orderByChild("timestamp").endAt(parseInt(timeselected));
	  }
	  else {
  
		fileref = database.ref("Groups/" + isgroup + '/cliphistory').orderByChild("timestamp").endAt(parseInt(timeselected));
	  }
	}
  
	//LISTENER CHANGES WHEN VALUE CHANGES
	//as we print the value we need to go each by each so it is actually ordered
	fileref.on('value', function (snapshot) {
	  var orderedlist = [];
	  snapshot.forEach(function (child) {
		orderedlist.push(child.val());
	  });
	  
	  event.sender.send("table", orderedlist);
	});
	event.sender.send("print","INSIDEGETTABLE");
  });
  
  
  //send the time to renderer process
  //it comes from the select Time window
  ipc.on("timeselected", function (event,  argend) {
	mainWindow.webContents.send("newtime",  argend);
  
  });
  
  //send all the folders to the renderer window
  ipc.on("printfolder", function (event, fname) {
  
	var folderref = database.ref(firebase.auth().currentUser.uid + "/Folders/" + fname + "/cliphistory").orderByChild("timestamp").once('value').then(function (snapshot) {
	  var orderedlist = [];
	  snapshot.forEach(function (child) {
		orderedlist.push(child.val());
	  });
	  createShowFolderWindow().then(folderWindow.webContents.send("cliplist", orderedlist));
	  //event.sender.send("print", orderedlist);
	});
  
  });
  
  
  //check if a folder has password
  ipc.on("checkForPassword", function (event, fname) {
  
	var folderref = database.ref(firebase.auth().currentUser.uid + "/Folders/" + fname).once('value').then(function (snapshot) {
	  event.sender.send("passwordNeeded", snapshot.val().passwordprotected, snapshot.val().password);
	});
  
  })
  
  //delete a clip
  ipc.on("deleteClip", function (event, args) {
	var key;
  
	//args[2] is to check if it is in a group
	if (args[2] == "0") {
	  var ref = database.ref(firebase.auth().currentUser.uid + "/Folders/" + args[0] + "/cliphistory").orderByChild("kleep").equalTo(args[1]).once('value').then(function (snapshot) {
  
		key = Object.keys(snapshot.val())[0];
		//snapshot.getRef().remove();
	  }).then(function () {
  
  
		event.sender.send("print", key);
		var refToDelete = database.ref(firebase.auth().currentUser.uid + "/Folders/" + args[0] + "/cliphistory/" + key);
		refToDelete.remove();
	  });
	}
	else {
	  var ref = database.ref("Groups/" + args[2] + "/cliphistory").orderByChild("kleep").equalTo(args[1]).once('value').then(function (snapshot) {
  
		key = Object.keys(snapshot.val())[0];
		//snapshot.getRef().remove();
	  }).then(function () {
  
  
		event.sender.send("print", key);
		var refToDelete = database.ref("Groups/" + args[2] + "/cliphistory/" + key);
		refToDelete.remove();
	  });
  
	}
  
  });
  
  
ipc.on("deleteFolder",function(event,arg){
	var name=arg;
	var key;
	event.sender.send("print", name);
	var ref = database.ref(firebase.auth().currentUser.uid + "/Folders/").orderByChild("name").equalTo(name).once('value').then(function (snapshot) {
  
		key = Object.keys(snapshot.val())[0];
		//snapshot.getRef().remove();
	  }).then(function () {
  
  
		event.sender.send("print", name);
		var refToDelete = database.ref(firebase.auth().currentUser.uid + "/Folders/" +  key);
		refToDelete.remove();
	  });

	  var ref2 = database.ref(firebase.auth().currentUser.uid + "/FolderNames/").orderByChild("name").equalTo(name).once('value').then(function (snapshot) {
  
		key = Object.keys(snapshot.val())[0];
		//snapshot.getRef().remove();
	  }).then(function () {
  
  
		event.sender.send("print", name);
		var refToDelete2 = database.ref(firebase.auth().currentUser.uid + "/FolderNames/" +  key);
		refToDelete2.remove();
	  });

});

  //create a group folder. currently the password is set, might need to change it for a numerical code
  ipc.on("createGroup", function (event, name, password) {
  
	var dbref = database.ref("Groups");
	var newGroup = dbref.push();
	newGroup.set({
	  'name': name,
	  'password': password
	});
  
  
	event.sender.send("print", newGroup.path.pieces_[1]);
  
	var dbrefUser = database.ref(firebase.auth().currentUser.uid + "/Groups");
	var groupKey = newGroup.path.pieces_[1];
	dbrefUser.update({
	  [groupKey]: name
	});
  });
  
  
  
  //join a group, currently the password is set, might need to change it for a numerical code
  ipc.on("joinGroup", function (event, name, password) {
	var dbref = database.ref("Groups").orderByChild("name").equalTo(name);
  
	dbref.once("value").then(function (snapshot) {
	  var x = snapshot.val();
	  var groupVal = x[Object.keys(x)[0]];
  
	  if (groupVal["password"] == password) {
		event.sender.send("print", groupVal["name"]);
		var dbrefUser = database.ref(firebase.auth().currentUser.uid + "/Groups");
		var groupKey = Object.keys(x)[0];
		dbrefUser.update({
		  [groupKey]: name
		});
	  }
	  else {
		event.sender.send("print", "WRONG PASSWORD");
	  }
  
  
	});
  
  
  });
  
  
  
  //gets the key of the group folder, that is the way to look for the group folder in firebase
  ipc.on("getGroupKey", function (event, arg) {
	var dbref = database.ref("Groups").orderByChild("name").equalTo(arg);
	dbref.once("value").then(function (snapshot) {
	  var x = snapshot.val();
	  var groupKey = Object.keys(x)[0];
	  event.sender.send("groupKey", groupKey);
	});
  
  })
  
  
  //store a image
  ipc.on("picture", function (event, arg) {
  
	let d = new Date();
	var clip = clipboard.readImage();
	firestore.collection(firebase.auth().currentUser.uid).add(
	  {
		image: clip.toDataURL(),
		timestamp: d.getTime(),
		width: 0,
		height: 0
	  }
	).then(function (docRef) {
	  event.sender.send("print", docRef.id);
  
	})
	  .catch(function (error) {
		event.sender.send("print", error);
  
  
	  });
  });
  
  
  
  var unsubscribe;
  //return the images
  ipc.on("getImages", function (event, arg) {
	fileref.off();
	var images = [];
	if( typeof unsubscribe!== 'undefined')
	{
	unsubscribe();
	}
	event.sender.send("print",unsubscribe);
	//listener that checks for changes
	unsubscribe= firestore.collection(firebase.auth().currentUser.uid).onSnapshot(function(querySnapshot){
	  var newImg =[]
	  querySnapshot.forEach(documentSnapshot => {
		newImg.push([documentSnapshot.get('image'), documentSnapshot.id, documentSnapshot.get('timestamp'),documentSnapshot.get('width'),documentSnapshot.get('height')]);
  
	  });
	  event.sender.send("print","I AM INSIDE LISTENER");
	  event.sender.send("recieveImages", newImg);
	});
	  
   /*
	event.sender.send("print", "trying to get images");
	firestore.collection(firebase.auth().currentUser.uid).get().then(querySnapshot => {
	  querySnapshot.forEach(documentSnapshot => {
		images.push([documentSnapshot.get('image'), documentSnapshot.id, documentSnapshot.get('timestamp')]);
  
  
	  });
	}).then(function () {
	  event.sender.send("recieveImages", images);
	});
	*/
  
	
  });
  
  ipc.on("storeImageDimensions",function (event, w, h, image){
	var dimensionRef=firestore.collection(firebase.auth().currentUser.uid).doc(image);


	var setWithMerge = dimensionRef.set({
		width: w,
		height:h
	}, { merge: true });


	event.sender.send("print", "added dimensions")
  })
  

  
  
  //delete a image
  ipc.on("deleteImage", function (event, arg) {
	firestore.collection(firebase.auth().currentUser.uid).doc(arg).delete().then(function () {
	  event.sender.send("print", "document deleted");
  
	}).catch(function (error) {
	  event.sender.send("print", error);
	});
  });
  
  ipc.on("newShortcut",function(event,arg){


  });

  ipc.on("resize-main", (event, arg) => {
	mainWindow.setSize(800, 540);
});


ipc.on("setDisconnect",function(event,arg){
	// Fetch the current user's ID from Firebase Authentication.
	var uid = firebase.auth().currentUser.uid;

	// Create a reference to this user's specific status node.
	// This is where we will store data about being online/offline.
	var userStatusDatabaseRef = firebase.database().ref(uid).child("Status");

	// We'll create two constants which we will write to 
	// the Realtime database when this device is offline
	// or online.
	var isOfflineForDatabase = {
		state: 'offline',
		last_changed: firebase.database.ServerValue.TIMESTAMP,
	};

	var isOnlineForDatabase = {
		state: 'online',
		last_changed: firebase.database.ServerValue.TIMESTAMP,
	};

	userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function(){

		event.sender.send("print","DISCONNECTED");

	});

	event.sender.send("print","on Disconnect set!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

});




function checkConnection(){

// Fetch the current user's ID from Firebase Authentication.
var uid = firebase.auth().currentUser.uid;

// Create a reference to this user's specific status node.
// This is where we will store data about being online/offline.
var userStatusDatabaseRef = firebase.database().ref(uid).child("Status");

// We'll create two constants which we will write to 
// the Realtime database when this device is offline
// or online.
var isOfflineForDatabase = {
    state: 'offline',
    last_changed: firebase.database.ServerValue.TIMESTAMP,
};

var isOnlineForDatabase = {
    state: 'online',
    last_changed: firebase.database.ServerValue.TIMESTAMP,
};

// Create a reference to the special '.info/connected' path in 
// Realtime Database. This path returns `true` when connected
// and `false` when disconnected.
firebase.database().ref('.info/connected').on('value', function(snapshot) {
    // If we're not currently connected, don't do anything.
    if (snapshot.val() == false) {
	
        return;
    }
	else
	{
		mainWindow.webContents.send("print","WE HAVE CONNECTION");
	}

    // If we are currently connected, then use the 'onDisconnect()' 
    // method to add a set which will only trigger once this 
    // client has disconnected by closing the app, 
    // losing internet, or any other means.
    userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
        // The promise returned from .onDisconnect().set() will
        // resolve as soon as the server acknowledges the onDisconnect() 
        // request, NOT once we've actually disconnected:
        // https://firebase.google.com/docs/reference/js/firebase.database.OnDisconnect

		
        // We can now safely set ourselves as 'online' knowing that the
        // server will mark us as offline once we lose connection.
        userStatusDatabaseRef.set(isOnlineForDatabase);
    });
});


}

























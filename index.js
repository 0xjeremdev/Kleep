"use strict";
const electron = require("electron");
const path = require("path");
const { app, BrowserWindow, Menu } = require("electron");
const { autoUpdater } = require("electron-updater");
const { is } = require("electron-util");
const unhandled = require("electron-unhandled");
const debug = require("electron-debug");
const contextMenu = require("electron-context-menu");
const config = require("./config");
const url = require("url");
const appPath = "/app";
const mainPage = "login";
const mainPageLog = "main";
const settingsPage = "popup-settings";
const userPage = "popup-user-info";
const nativeImage = require("electron").nativeImage;



const sizeOf = require("image-size");
unhandled();
debug();
contextMenu();

// Note: Must match `build.appId` in package.json
app.setAppUserModelId("com.company.AppName");

const { clipboard, globalShortcut } = require("electron");

const ipc = electron.ipcMain;
const dialog = electron.dialog;
const Tray = electron.Tray;

// Prevent window from being garbage collected
let mainWindow;
let settingsWindow;
let UserWindow;
const iconPath = path.join(__dirname, "kleepTray.png");
let tray = null;
var image = nativeImage.createFromPath(__dirname + "/IconoKleep.png");

app.on("ready", function() {
	createMainWindow();

	tray = new Tray(iconPath);
	if (process.platform === "win32") {
		tray.on("click", tray.popUpContextMenu);
	} else {
		tray.on("click", function() {
			if (mainWindow == null) {
				createMainWindow();
			}
		});
	}

	let traytemplate = [
		{
			label: "Open",

			click() {
				
				createMainWindow();
			},
			accelerator: process.platform == "darwin" ? "Command+K" : "Ctrl+X"
		},
		{
			label: "Quit",

			click() {
				app.quit();
			},
			accelerator: process.platform == "darwin" ? "Command+P" : "Ctrl+P"
		}
	];

	const contextMenu = Menu.buildFromTemplate(traytemplate);
	tray.setContextMenu(contextMenu);
	tray.setToolTip("Kleep");

	const activationShortcut = globalShortcut.register(
		"CommandOrControl+Shift+K",
		() => {
			if (mainWindow == null) {
				createMainWindow();
			} else {
				mainWindow.show();
			}
		}
	);

	if (!activationShortcut) {
		console.error("Global activation shortcut failed to register");
	}

	if (process.platform === "darwin") {
		const dockMenu = Menu.buildFromTemplate([
			{
				label: "Open",
				click() {
					if (mainWindow == null) {
						createMainWindow();
					}
				}
			},
			{ label: "New Command..." }
		]);

		app.dock.setMenu(dockMenu);
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

app.on("activate", () => {
	if (mainWindow == null) {
		createMainWindow();
	} else {
		mainWindow.show();
	}
});

app.on('window-all-closed', e => e.preventDefault() )



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
		icon: image
	});

	if (user) {
		mainWindow.loadURL(
			url.format({
				pathname: path.join(
					path.join(__dirname, `${appPath}/${mainPageLog}.html`)
				),
				protocol: "file:",
				slashes: true
			})
		);
	} else {
		mainWindow.loadURL(
			url.format({
				pathname: path.join(
					path.join(__dirname, `${appPath}/${mainPage}.html`)
				),
				protocol: "file:",
				slashes: true
			})
		);
	}

	mainWindow.on("ready-to-show", () => {
		mainWindow.show();
		autoUpdater.logger = require("electron-log");
		autoUpdater.logger.transports.file.level = "info";
		autoUpdater.checkForUpdatesAndNotify();
	});

	mainWindow.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		mainWindow = null;
	});


	//bs used for language
	var locale = app.getLocale();
	if (locale.includes("en")) {
		const menu = Menu.buildFromTemplate(logintemplate);
		//Insert Menu
		Menu.setApplicationMenu(menu);
	}
}

autoUpdater.on("update-available", () => {
	mainWindow.webContents.send("update_available");
});
autoUpdater.on("update-downloaded", () => {
	mainWindow.webContents.send("update_downloaded");
});

function createSettingsWindow() {
	settingsWindow = new BrowserWindow({
		parent: mainWindow,
		//modal: true,
		alwaysOnTop: true,
		width: 500,
		height: 500,
		backgroundColor: "#f4f8ff",
		webPreferences: {
			nodeIntegration: true
		}
	});

	settingsWindow.loadURL(
		url.format({
			pathname: path.join(
				path.join(__dirname, `${appPath}/${settingsPage}.html`)
			),
			protocol: "file:",
			slashes: true
		})
	);

	settingsWindow.on("ready-to-show", () => {
		settingsWindow.show();
	});

	settingsWindow.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		settingsWindow = null;
	});
}

function createUserWindow() {
	UserWindow = new BrowserWindow({
		parent: mainWindow,
		//modal: true,
		alwaysOnTop: true,
		width: 500,
		height: 500,
		backgroundColor: "#f4f8ff",
		webPreferences: {
			nodeIntegration: true
		}
	});

	UserWindow.loadURL(
		url.format({
			pathname: path.join(path.join(__dirname, `${appPath}/${userPage}.html`)),
			protocol: "file:",
			slashes: true
		})
	);

	UserWindow.on("ready-to-show", () => {
		UserWindow.show();
	});

	UserWindow.on("closed", () => {
		// Dereference the window
		// For multiple windows store them in an array
		UserWindow = null;
	});
}

const isMac = process.platform === "darwin";

const logintemplate = [
	// { role: 'appMenu' }
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{ role: "about" },
						{ type: "separator" },
						{ role: "services" },
						{ type: "separator" },
						{ role: "hide" },
						{ role: "hideothers" },
						{ role: "unhide" },
						{ type: "separator" },
						{ role: "quit" }
					]
				}
		  ]
		: []),
	// { role: 'fileMenu' }
	{
		label: "File",
		submenu: [isMac ? { role: "close" } : { role: "quit" }]
	},
	// { role: 'editMenu' }
	{
		label: "Edit",
		submenu: [
			//{ role: 'undo' },
			// { role: 'redo' },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			...(isMac
				? [
						{ role: "pasteAndMatchStyle" },
						{ role: "delete" },
						{ role: "selectAll" },
						{ type: "separator" },
						{
							label: "Speech",
							submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
						}
				  ]
				: [
						//{ role: 'delete' },
						{ type: "separator" }
						//{ role: 'selectAll' }
				  ])
		]
	},
	// { role: 'viewMenu' }
	{
		label: "View",
		submenu: [
			{ role: "reload" },
			{ role: "forcereload" },
			{ role: "toggledevtools" },
			{ type: "separator" },
			{ role: "resetzoom" },
			{ role: "zoomin" },
			{ role: "zoomout" },
			{ type: "separator" },
			{ role: "togglefullscreen" }
		]
	},
	// { role: 'windowMenu' }
	{
		label: "Window",
		submenu: [
			{ role: "minimize" },
			{ role: "zoom" },
			...(isMac
				? [
						{ type: "separator" },
						{ role: "front" },
						{ type: "separator" },
						{ role: "window" }
				  ]
				: [{ role: "close" }])
		]
	},
	{
		role: "help",
		submenu: [
			{
				label: "Learn More",
				click(){
					let options  = {
						buttons: ["Yes","No","Cancel"],
						message: app.getVersion()
					   }
					   let response = dialog.showMessageBox(options);
						
				}
			}
		]
	}
];

const mainTemplate = [
	// { role: 'appMenu' }
	...(isMac
		? [
				{
					label: app.name,
					submenu: [
						{ role: "about" },
						{ type: "separator" },
						{ role: "services" },
						{ type: "separator" },
						{ role: "hide" },
						{ role: "hideothers" },
						{ role: "unhide" },
						{ type: "separator" },
						{ role: "quit" }
					]
				}
		  ]
		: []),
	// { role: 'fileMenu' }
	{
		label: "File",
		submenu: [
			{
				label: "Logout",
				click() {
					Logout();
				}
			},

			isMac ? { role: "close" } : { role: "quit" }
		]
	},
	// { role: 'editMenu' }
	{
		label: "Edit",
		submenu: [
			//{ role: 'undo' },
			// { role: 'redo' },
			{ type: "separator" },
			{ role: "cut" },
			{ role: "copy" },
			{ role: "paste" },
			...(isMac
				? [
						{ role: "pasteAndMatchStyle" },
						{ role: "delete" },
						{ role: "selectAll" },
						{ type: "separator" },
						{
							label: "Speech",
							submenu: [{ role: "startspeaking" }, { role: "stopspeaking" }]
						}
				  ]
				: [
						//{ role: 'delete' },
						{ type: "separator" }
						//{ role: 'selectAll' }
				  ])
		]
	},
	// { role: 'viewMenu' }
	{
		label: "View",
		submenu: [
			{ role: "reload" },
			{ role: "forcereload" },
			{ role: "toggledevtools" },
			{ type: "separator" },
			{ role: "resetzoom" },
			{ role: "zoomin" },
			{ role: "zoomout" },
			{ type: "separator" },
			{ role: "togglefullscreen" }
		]
	},
	// { role: 'windowMenu' }
	{
		label: "Window",
		submenu: [
			{ role: "minimize" },
			{ role: "zoom" },
			...(isMac
				? [
						{ type: "separator" },
						{ role: "front" },
						{ type: "separator" },
						{ role: "window" }
				  ]
				: [{ role: "close" }])
		]
	},
	{
		role: "help",
		submenu: [
			{
				label: "Learn More",
				click(){
					let options  = {
						buttons: ["Yes","No","Cancel"],
						message: app.getVersion()
					   }
					   let response = dialog.showMessageBox(options);
						
				}
			}
		]
	}
];



ipc.on("changeMenu", function(event, arg) {
	try{
	const menu = Menu.buildFromTemplate(mainTemplate);
	//Insert Menu
	Menu.setApplicationMenu(menu);
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

ipc.on("createWindow", function(event, arg) {
	
	try{
		if (arg == "settings") {
			createSettingsWindow();
			
		} else if (arg == "user") {
			createUserWindow();
			
		}
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});


//
//FIREBASE
//
var firebase = require("firebase");
require("firebase/firestore");



var firebaseConfig = {
    apiKey: "AIzaSyC98dymacpS0LUoB7BKyUMSwu7eOe6cKL0",
    authDomain: "uihelp-7f36c.firebaseapp.com",
    databaseURL: "https://uihelp-7f36c-default-rtdb.firebaseio.com",
    projectId: "uihelp-7f36c",
    storageBucket: "uihelp-7f36c.appspot.com",
    messagingSenderId: "696335520283",
    appId: "1:696335520283:web:5637fcdc19646954591ebe"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();
const database = firebase.database();



/////////////////////////
/////AUTHENTICATION//////
/////////////////////////

//signup
ipc.on("signup", function(event, args) {
	firebase
		.auth()
		.createUserWithEmailAndPassword(args[0], args[1])
		.then(function() {
			if(mainWindow)
			{
				event.sender.send("signupresult", "success");
			}
			firestore.collection(firebase.auth().currentUser.uid).doc("Profile").set({
				paid: "Yes",
				paidUntil: "30-12-9999",
				email: args[0]
				
			});
			firestore.collection(firebase.auth().currentUser.uid).doc("Settings").set({
				defaultToImages: false,
				language: "English",
				shortcut: "⌘ + K",
				sound: "Yes",
				copyToMain: "Yes",
				timeFormat: "No"
			});
			firestore.collection(firebase.auth().currentUser.uid).doc("FolderNames").set({
				folders:["Main", "Images"]
			});
			firestore.collection(firebase.auth().currentUser.uid).doc("Folders").set({
				count:2
			});
			firestore.collection(firebase.auth().currentUser.uid).doc("Folders").collection("Main").add({kleep:"Welcome to Kleep!"});
			
			firebase.auth().currentUser.sendEmailVerification().then(function() {
				console.log("!!!!!!!!!!!!!!!!SEEEEEEEENT!!!!!!!!!!!!")
			  }).catch(function(error) {
				console.log(error)
			  });
				
		})
		/*
		.catch(function(error) {
			if (error !== null) {
				event.sender.send("signupresult", "failure");
				return;
			} else {
				event.sender.send("signupresult", "failure");
			}
		});
		*/
});

//signing
ipc.on("signin", function(event, args) {
	firebase
		.auth()
		.signInWithEmailAndPassword(args[0], args[1])
		.then(function() {
			//console.log(firebase.auth().currentUser.uid);
			setTimeout(() => { 
				
				firestore.collection(firebase.auth().currentUser.uid).doc("Profile").get().then(function(doc){
					//console.log(doc)
					var data = doc.data();
					//console.log(data)
					var paid = data.paid;
					//console.log(paid)
					if(paid=="Yes")
					{
						if(mainWindow)
						{
							event.sender.send("loginresult", "success");
						}
					}
					else
					{
						if(mainWindow)
						{
							event.sender.send("loginresult", "failure");
						}
					}
				})
				
				
				
				
			}, 500);

			
		})
		.catch(function(error) {
			if (error !== null) {
				if(mainWindow)
				{
					event.sender.send("loginresult", error);
				}
				return;
			} else {
				event.sender.send("loginresult", "failure");
			}
		});
})



ipc.on("needuser", function(event) {
	try{
		if(mainWindow)
		{
			event.sender.send("userback", firebase.auth().currentUser);
		}
	}
	catch(error){
		event.sender.send("printerror",error )
	}

	
	
});

//update the user settings
ipc.on("updateSettings", function(event, lang, date, sound, copy,format) {
	try{
		firestore.collection(firebase.auth().currentUser.uid).doc("Settings").update({
				language: lang,
				dateFormat: date,
				sound: sound,
				copyToMain: copy,
				defaultToImages: format
		})
		
		if(mainWindow)
		{
			mainWindow.webContents.send("returnSettings", settings);
		}
	}
	catch(error){
		event.sender.send("printerror",error )
	}
	
});

//get the settings for when the app starts
ipc.on("initialSettings", function(event, arg) {
	try
	{

		firestore.collection(firebase.auth().currentUser.uid).doc("Settings").get().then(function(doc){
			if(mainWindow)
			{
				event.sender.send("returnSettings", doc.data());
			}
		})
	
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//return the settings of the user
ipc.on("getSettings", function(event, arg) {
	try{
		firestore.collection(firebase.auth().currentUser.uid).doc("Settings").get().then(function(doc){
			if(mainWindow)
			{
				event.sender.send("returnSettings", doc.data());
			}
			
		})
		
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//check if connected
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		// User is signed in.
	} else {
		// No user is signed in.
		//need to send to the login page
		//loginWindow.webContents.send("logout", null);
	}
});



function Logout() {
	firebase
		.auth()
		.signOut()
		.then(
			function() {
				if(mainWindow)
				{
					mainWindow.webContents.send("logout", firebase.auth().currentUser);
				}
					// Sign-out successful.
				const menu = Menu.buildFromTemplate(logintemplate);
				//Insert Menu
				Menu.setApplicationMenu(menu);
			},
			function(error) {
				event.sender.send("printerror",error )
			
			}
		);
}

ipc.on("getUser", function(event, arg) {
	try{
		if(mainWindow)
		{
			event.sender.send("returnUser", firebase.auth().currentUser.email);
		}
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});


ipc.on("passwordRecovery", function(event, email) {
	try
	{
		if(mainWindow)
		{
			event.sender.send("userback", "IN");
		}
		var auth = firebase.auth();

		auth
			.sendPasswordResetEmail(email)
			.then(function() {
				if(mainWindow)
				{
					event.sender.send("userback", "YES");
				}
			})
			.catch(function(error) {
				if(mainWindow)
				{
					event.sender.send("userback", "NO");
				}
			});
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

////////////////////////
////////DATABASE////////
////////////////////////

//Add a new clip to  the database

ipc.on("newclip", function(event, args) {
	try{
		let d = new Date();
		//found is used to check if the clip is already in the current folder
		let found = 0;

		var fref =firestore.collection(firebase.auth().currentUser.uid).doc("Folders").collection(args[0]) 
		//console.log(Buffer.byteLength(args[1], 'utf8') + " bytes")
		if(Buffer.byteLength(args[1], 'utf8')<1500)
		{
			fref.where("kleep","==",args[1]).get().then(function(querySnapshot) {
				if(querySnapshot.empty)
				{
					fref.add({
							kleep: args[1],
							timestamp: d.getTime(),
							color: args[2],
							bytesize: Buffer.byteLength(args[1], 'utf8')
					})

				}
				else{
					querySnapshot.forEach(function(doc) {
						// doc.data() is never undefined for query doc snapshots
						//console.log(doc.id, " => ", doc.data());
						if(args[3]=="create")
					{
						fref.doc(doc.id).update({
							timestamp: d.getTime()
						})
					}
					if(args[3]=="colorChange")
					{
						fref.doc(doc.id).update({
							color: args[2]
						})
					}
					});
				}
				
				
				
				
			})
		}
		else
		{
			var foundkleep = false;
			fref.where("bytesize",">",1499).get().then(function(querySnapshot) {

					//console.log("TRYING THE BIG BOYS")
					querySnapshot.forEach(function(doc) {
						// doc.data() is never undefined for query doc snapshots

						var kleepdata = doc.data()
						
						if(kleepdata.kleep == args[1])
						{
							foundkleep=true
							if(args[3]=="create")
							{
								fref.doc(doc.id).update({
									timestamp: d.getTime()
								})
							}
							if(args[3]=="colorChange")
							{
								fref.doc(doc.id).update({
									color: args[2],
									timestamp: d.getTime()
								})
							}
							
						}
						
						
						});
				
				
				
				
				
			}).then(function(){
				if(foundkleep==false)
				{
						fref.add({
							kleep: args[1],
							timestamp: d.getTime(),
							color: args[2],
							bytesize: Buffer.byteLength(args[1], 'utf8')
					})
				}
			})
		}

		}
		catch(error){
			event.sender.send("printerror",error )
		}
});

ipc.on("annotate", function(event, folder, clip, annot) {
	try
	{
		var fref =firestore.collection(firebase.auth().currentUser.uid).doc("Folders").collection(folder) 
		fref.where("kleep","==",clip).get().then(function(querySnapshot){
			querySnapshot.forEach(function(doc) {
				fref.doc(doc.id).update({
					annotation: annot
				})
			});
		});
	
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//add file to database
//as of now we are creating them in 2 separate locations: one with only the names and one with the cliphistory
ipc.on("filecreate", function(event, fname, passwordprotectedIn, passwordIn) {
	try{

		firestore.collection(firebase.auth().currentUser.uid).doc("Folders").collection(fname).add({kleep:"New Folder!"});
		firestore.collection(firebase.auth().currentUser.uid).doc("FolderNames").update({
			folders:firebase.firestore.FieldValue.arrayUnion(fname)
		});
		firestore.collection(firebase.auth().currentUser.uid).doc("FolderNames").get().then(function(doc){
			if(mainWindow)
			{
				event.sender.send("newfile", doc.data());
			}
		})
		
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//send the files at the start when the window loads
ipc.on("finishload", function(event) {
	try
	{

		firestore.collection(firebase.auth().currentUser.uid).doc("FolderNames").get().then(function(doc){
			if(mainWindow)
			{
				event.sender.send("newfile", doc.data());
			}
		})

		
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//LISTENER
//WHEN NEW FILE NEED TO CLOSE IT AND DO NEW QUERY
//NEEDS TO BE A GLOBAL VARIABLE
var fileref = database.ref();
let unsubscribe;
//the renderer process is asking for the table
ipc.on("gettable", function(event, fname, timeselected, isgroup, sync) {
	//console.log("GETTABLE")
	try
	{
		//reset the db ref
		fileref.off();
		if (typeof unsubscribe !== "undefined") {
			unsubscribe();
		}

		let d = new Date();

		


		//check if there is a specific time chosen
		//ordered by time in ascending order
		if (timeselected == 0) {

			//check if it is a group folder
			if (isgroup == 0) {

				
			} 

				
				
			
		} 
		else {
			//Time filter is on
			if (isgroup == 0) {
				var tempref = firestore.collection(firebase.auth().currentUser.uid).doc("Folders").collection(fname).where("timestamp","<=",parseInt(timeselected)).orderBy("timestamp")

				
			} 
		}

		unsubscribe=tempref.onSnapshot(function(querySnapshot) {
			var orderedlist = [];
			querySnapshot.forEach(documentSnapshot => {
				orderedlist.push(documentSnapshot.data());
			});
			
			if(sync==1)
			{
				if(mainWindow)
				{
					event.sender.send("tablesync", orderedlist);
				}
				sync=0;
			}
			else
			{
				if(mainWindow)
				{
					event.sender.send("table", orderedlist);
				}
				
			}
		});
	
	}
	catch(error){
		console.log(error)
	}
	
});






//send the time to renderer process
//it comes from the select Time window
ipc.on("timeselected", function(event, argend) {
	try{
		if(mainWindow)
		{
			mainWindow.webContents.send("newtime", argend);
		}
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});



//check if a folder has password
//ya no se usa
ipc.on("checkForPassword", function(event, fname) {
	try
	{
	var folderref = database
		.ref(firebase.auth().currentUser.uid + "/Folders/" + fname)
		.once("value")
		.then(function(snapshot) {
			if(mainWindow)
			{
				event.sender.send(
					"passwordNeeded",
					snapshot.val().passwordprotected,
					snapshot.val().password
				);
			}
		});
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//delete a clip
ipc.on("deleteClip", function(event, args) {
	try{
		var key;
		var fref =firestore.collection(firebase.auth().currentUser.uid).doc("Folders").collection(args[0]) 
		
		fref.where("kleep","==",args[1]).get().then(function(querySnapshot) {
			
			
				querySnapshot.forEach(function(doc) {
					// doc.data() is never undefined for query doc snapshots
					//console.log(doc.id, " => ", doc.data());
					
					fref.doc(doc.id).delete()
				
				})
			
			
			
			
			
		})


	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

ipc.on("deleteFolder", function(event, arg) {

		

		
	try{

		var name = arg;

		var fref2 =firestore.collection(firebase.auth().currentUser.uid).doc("FolderNames")
		fref2.update({
			folders: firebase.firestore.FieldValue.arrayRemove(name)
		}).then(
			firestore.collection(firebase.auth().currentUser.uid).doc("FolderNames").get().then(function(doc){
				if(mainWindow)
				{
					event.sender.send("newfile", doc.data());
				}
			})
		)

		
		var key;
		
		
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

/*
//create a group folder. currently the password is set, might need to change it for a numerical code
ipc.on("createGroup", function(event, name, password) {
	try{

		var dbref = database.ref("Groups");
		var newGroup = dbref.push();
		newGroup.set({
			name: name,
			password: password
		});

		event.sender.send("print", newGroup.path.pieces_[1]);

		var dbrefUser = database.ref(firebase.auth().currentUser.uid + "/Groups");
		var groupKey = newGroup.path.pieces_[1];
		dbrefUser.update({
			[groupKey]: name
		});
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//join a group, currently the password is set, might need to change it for a numerical code
ipc.on("joinGroup", function(event, name, password) {
	try{
		var dbref = database
			.ref("Groups")
			.orderByChild("name")
			.equalTo(name);

		dbref.once("value").then(function(snapshot) {
			var x = snapshot.val();
			var groupVal = x[Object.keys(x)[0]];

			if (groupVal["password"] == password) {
				event.sender.send("print", groupVal["name"]);
				var dbrefUser = database.ref(firebase.auth().currentUser.uid + "/Groups");
				var groupKey = Object.keys(x)[0];
				dbrefUser.update({
					[groupKey]: name
				});
			} else {
				event.sender.send("print", "WRONG PASSWORD");
			}
		});
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//gets the key of the group folder, that is the way to look for the group folder in firebase
ipc.on("getGroupKey", function(event, arg) {
	try
	{
		var dbref = database
			.ref("Groups")
			.orderByChild("name")
			.equalTo(arg);
		dbref.once("value").then(function(snapshot) {
			var x = snapshot.val();
			var groupKey = Object.keys(x)[0];
			event.sender.send("groupKey", groupKey);
		});
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});
*/

//store a image
ipc.on("picture", function(event, arg) {
	console.log("PICTURE")
	
	try{
		var dimensions = {};
		dimensions.width = 0;
		dimensions.height = 0;
		let d = new Date();
		try {
			var clip = clipboard.readImage();
			dimensions = sizeOf(clip.toPNG());
		} catch (error) {
			event.sender.send("printerror", error);
		}

		console.log(Buffer.byteLength(clip.toDataURL(), 'utf8'))
		firestore
			.collection(firebase.auth().currentUser.uid).doc("Folders").collection("Images")
			.add({
				image: clip.toDataURL(),
				timestamp: d.getTime(),
				width: dimensions.width,
				height: dimensions.height
			})
			.then(function(docRef) {
				//event.sender.send("print", docRef.id);
			})
			.catch(function(error) {
				//event.sender.send("print", error);
			});
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});


//return the images
ipc.on("getImages", function(event, arg) {
	//try
	//{
		fileref.off();
		var images = [];
		if (typeof unsubscribe !== "undefined") {
			unsubscribe();

			
		}
		//listener that checks for changes

		unsubscribe = firestore
			.collection(firebase.auth().currentUser.uid).doc("Folders").collection("Images")
			.onSnapshot(function(querySnapshot) {
				var newImg = [];
				querySnapshot.forEach(documentSnapshot => {
					newImg.push([
						documentSnapshot.get("image"),
						documentSnapshot.id,
						documentSnapshot.get("timestamp"),
						documentSnapshot.get("width"),
						documentSnapshot.get("height")
					]);
				});
				//event.sender.send("print", "I AM INSIDE LISTENER");
				if(mainWindow)
				{
					event.sender.send("recieveImages", newImg);
				}
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
//	}
	//catch(error){
	//	event.sender.send("printerror",error )
	//}
});

ipc.on("storeImageDimensions", function(event, w, h, image) {
	try{
		var dimensionRef = firestore
			.collection(firebase.auth().currentUser.uid).doc("Folders").collection("Images")
			.doc(image);

		var setWithMerge = dimensionRef.set(
			{
				width: w,
				height: h
			},
			{ merge: true }
		);

		//event.sender.send("print", "added dimensions");
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

//delete a image
ipc.on("deleteImage", function(event, arg) {
	try{
		firestore
			.collection(firebase.auth().currentUser.uid).doc("Folders").collection("Images")
			.doc(arg)
			.delete()
			.then(function() {
				//event.sender.send("print", "document deleted");
			})
			.catch(function(error) {
				event.sender.send("print", error);
			});
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

ipc.on("newShortcut", function(event, arg) {});

ipc.on("resize-main", (event, arg) => {
	mainWindow.setSize(800, 540);
});

ipc.on("setDisconnect", function(event, arg) {
	try{
		// Fetch the current user's ID from Firebase Authentication.
		var uid = firebase.auth().currentUser.uid;

		// Create a reference to this user's specific status node.
		// This is where we will store data about being online/offline.
		var userStatusDatabaseRef = firebase
			.database()
			.ref(uid)
			.child("Status");

		// We'll create two constants which we will write to
		// the Realtime database when this device is offline
		// or online.
		var isOfflineForDatabase = {
			state: "offline",
			last_changed: firebase.database.ServerValue.TIMESTAMP
		};

		var isOnlineForDatabase = {
			state: "online",
			last_changed: firebase.database.ServerValue.TIMESTAMP
		};

		userStatusDatabaseRef
			.onDisconnect()
			.set(isOfflineForDatabase)
			.then(function() {
				//event.sender.send("print", "DISCONNECTED");
			});

		
	}
	catch(error){
		event.sender.send("printerror",error )
	}
});

function checkConnection() {
	// Fetch the current user's ID from Firebase Authentication.
	var uid = firebase.auth().currentUser.uid;

	// Create a reference to this user's specific status node.
	// This is where we will store data about being online/offline.
	var userStatusDatabaseRef = firebase
		.database()
		.ref(uid)
		.child("Status");

	// We'll create two constants which we will write to
	// the Realtime database when this device is offline
	// or online.
	var isOfflineForDatabase = {
		state: "offline",
		last_changed: firebase.database.ServerValue.TIMESTAMP
	};

	var isOnlineForDatabase = {
		state: "online",
		last_changed: firebase.database.ServerValue.TIMESTAMP
	};

	// Create a reference to the special '.info/connected' path in
	// Realtime Database. This path returns `true` when connected
	// and `false` when disconnected.
	firebase
		.database()
		.ref(".info/connected")
		.on("value", function(snapshot) {
			// If we're not currently connected, don't do anything.
			if (snapshot.val() == false) {
				return;
			} else {
				//mainWindow.webContents.send("print", "WE HAVE CONNECTION");
			}

			// If we are currently connected, then use the 'onDisconnect()'
			// method to add a set which will only trigger once this
			// client has disconnected by closing the app,
			// losing internet, or any other means.
			userStatusDatabaseRef
				.onDisconnect()
				.set(isOfflineForDatabase)
				.then(function() {
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


var lastclip;
setInterval(function() {
	console.log(firebase.auth().currentUser.emailVerified)
	//here we sync
	if (firebase.auth().currentUser && mainWindow==null)
	{
		console.log(firebase.auth().currentUser.uid)
		fileref.off()
		var clip = clipboard.readText();
		console.log("lastclip: "+lastclip)
		console.log("clip: "+clip)

		
		if(lastclip !== clip && clip.length > 0)
		{
			try{
				let d = new Date();
				//found is used to check if the clip is already in the current folder
				let found = 0;
		
				

		//get a reference to the user folder's cliphistory, specifically to see if the new clip is in there

				var frefsync =firestore.collection(firebase.auth().currentUser.uid).doc("Folders").collection("Main") 

				if(Buffer.byteLength(clip, 'utf8')<1500)
				{
					frefsync.where("kleep","==",clip).get().then(function(querySnapshot) {
						if(querySnapshot.empty)
						{
							frefsync.add({
									kleep: clip,
									timestamp: d.getTime(),
									color: "white"
							})
			
						}
						else{
							querySnapshot.forEach(function(doc) {
								// doc.data() is never undefined for query doc snapshots
								//console.log(doc.id, " => ", doc.data());
								
							
								frefsync.doc(doc.id).update({
									timestamp: d.getTime()
								})
							
							
							});
						}
						
						
				
					})
				}
				
				else
				{
					var foundkleep = false;
					frefsync.where("bytesize",">",1499).get().then(function(querySnapshot) {

							console.log("TRYING THE BIG BOYS")
							querySnapshot.forEach(function(doc) {
								// doc.data() is never undefined for query doc snapshots

								var kleepdata = doc.data()
								
								if(kleepdata.kleep == clip)
								{
									foundkleep=true
									
									frefsync.doc(doc.id).update({
											timestamp: d.getTime()
										})
									
									
									
								}
								
								
								});
						
						
						
						
						
					}).then(function(){
						if(foundkleep==false)
						{
							frefsync.add({
									kleep: clip,
									timestamp: d.getTime(),
									color: "white",
									bytesize: Buffer.byteLength(clip, 'utf8')
							})
						}
					})
				}





					
			}
			catch(error){
					
			}

				
		}
		lastclip=clip;	
	}
}, 1000);

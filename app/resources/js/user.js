const electron = require('electron');
const ipc=electron.ipcRenderer;


function initializePopupUserInfo()
{
    ipc.send("getUser", "a");
}

ipc.on("returnUser",function(event,args){

    console.log(args)
    $("#emailVal").text(args);
    $("#nameVal").text(args);
})

$("#emailBtn").click(function(){
    electron.shell.openExternal('https://kleep.io');
})

$("#nameBtn").click(function(){
    electron.shell.openExternal('https://kleep.io');
})

$("#passwordBtn").click(function(){
    electron.shell.openExternal('https://kleep.io');
})

$("#photoBtn").click(function(){
    electron.shell.openExternal('https://kleep.io');
})

$("#upgrade").click(function(){
    electron.shell.openExternal('https://kleep.io');
})


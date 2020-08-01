//load jquery
//window.$ = window.jQuery = require('jquery');

const electron = require('electron');
const ipc=electron.ipcRenderer;


const page = {
	LOGIN: "login",
	SETTINGS: "settings",
	MAIN: "main"
};

/**
 * For redirecting to a page. Uses `page` object
 * @param {string} page
 */
function redirect(page) {
	window.location.href = `${page}.html`;
}

var signupbtn = document.getElementById("signup");
var signinbtn = document.getElementById("signin");




$('#login').click(function(){

    //alert("yes");
    var email= $('#email').val();
    var password =$("#password").val();
    var login = [email,password];
    ipc.send("signin",login); 
    //console.log(password);
})



$('#signup').click(function(){

    //alert("yes");
    var email= $('#email').val();
    var password =$("#password").val();
    var login = [email,password];
    ipc.send("signup",login); 
    //console.log(password);
})

/*
signinbtn.addEventListener('click',function(){
    var email= document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var login = [email,password];
    ipc.send("signin",login);  
    console.log("sent");

});
*/



ipc.on("loginresult",function(event,arg){
    console.log(arg);
    console.log("received");
    if(arg=="success")
    {
        ipc.send("changeMenu");
        redirect(page.MAIN);
    }
    else{
        alert(arg['message'])
        location.reload()
    }
});

ipc.on("signupresult",function(event,arg){
    console.log(arg);
    console.log("received");
    if(arg=="success")
    {
        ipc.send("changeMenu");
        redirect(page.SETTINGS);
    }
    else{
        alert(arg['message'])
        location.reload()
    }
});

ipc.on("userback",function(event,arg){
    console.log(arg);
    console.log("received");
});
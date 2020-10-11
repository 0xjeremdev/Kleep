//load jquery
//window.$ = window.jQuery = require('jquery');

const electron = require('electron');
const ipc=electron.ipcRenderer;
const prompt = require('electron-prompt');


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


$(document).ready(function(){
    if (localStorage.getItem("remember")=="true")
    {
        $( "#remember-pass" ).prop( "checked", true );
        $('#email').val(localStorage.getItem("user"));
        $("#password").val(localStorage.getItem("password"));
        console.log("aaaaa")
    }
})



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

$('#remember-pass').click(function(){
    console.log("eeeeeeeeeeeeee");
    if($('#remember-pass').prop("checked") == true){
        console.log("Checkbox is checked.");
        localStorage.setItem("remember","true");
    }
    else{
       
        var x=localStorage.getItem("a");
        console.log(x);
        localStorage.setItem("remember","false");
    }
    
});

$('#forgotPassword').click(function(){
   
    prompt({
        title: 'Prompt example',
        label: 'email:',
        value: '',
        inputAttrs: {
            type: 'text'
        },
        type: 'input'
    })
    .then((r) => {
        if(r === null) {
            console.log(r);
        } else {
            console.log("sent")
            ipc.send("passwordRecovery", r);
        }
    })
    .catch(console.error);
    
})




const password = document.querySelector('#password');
$("#togglePassword").click(function(){
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the eye slash icon
    this.classList.toggle('fa-eye-slash');
})


ipc.on("loginresult",function(event,arg){
    console.log(arg);
    console.log("received");
    if(arg=="success")
    {
        if (localStorage.getItem("remember")=="true")
        {
            localStorage.setItem("user",$('#email').val());
            localStorage.setItem("password",$("#password").val());
            
        }

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
        if (localStorage.getItem("remember")=="true")
        {
            localStorage.setItem("user",$('#email').val());
            localStorage.setItem("password",$("#password").val());
            
        }
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



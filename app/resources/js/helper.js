module.exports = {

    initializeCheckConnection: function(){
        //var connected =false;
const config = {
	timeout: 5000, //timeout connecting to each server, each try
	retries: 5, //number of retries to do before failing
	domain: "https://apple.com" //the domain to check DNS record of
};

setInterval(function() {
	checkInternetConnected()
		.then(result => {
			connected = true; //successfully connected to a server
		})
		.catch(ex => {
			connected = false; // cannot connect to a server or error occurred.
		});
}, 1000);
    }
   

}
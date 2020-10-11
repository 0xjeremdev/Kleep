module.exports = {
     resizeDataUrl: function(datas,wantedWidth, wantedHeight ){
        return new Promise(async function(resolve, reject) {
            // We create an image to receive the Data URI
            var img = document.createElement("img");
      
            // When the event "onload" is triggered we can resize the image.
            img.onload = function() {
                // We create a canvas and get its context.
                var canvas = document.createElement("canvas");
                var ctx = canvas.getContext("2d");
      
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
        });
        // Use it like : var newDataURI = await resizedataURL('yourDataURIHere', 50, 50);
      },
        getImageDimensions: function(file){
        // Takes a data URI and returns the Data URI corresponding to the resized image at the wanted size.
      
        return new Promise(function(resolved, rejected) {
            var i = new Image();
            i.onload = function() {
                resolved({ w: i.width, h: i.height });
            };
            i.onerror = function() {
                resolved({ w: 0, h: 0 });
            };
            i.src = file;
        });
      }



}
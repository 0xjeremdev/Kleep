const { clipboard } = require("electron");
var keychain = require('keychain');
 
 


module.exports = {
     initializeCopyBtn: function(){
        // Event listener for Copy button
      $(document).on("click", ".btn-copy", function() {
      // Log data
      
      if (fnameglobal == "Images") {
      copyItem = $(this)
      .parent()
      .parent();
      imageKey = copyItem.find(".title").attr("id");
      var imgCopy;
      for (let i in images) {
      if (images[i].key == imageKey) {
        imgCopy = images[i].originalImage;
        var newImage = nativeImage.createFromDataURL(imgCopy);
        clipboard.writeImage(newImage);
      }
      }
      } else {
      copyItem = $(this)
      .parent()
      .parent();
      copytext = copyItem.find(".details .CircularCheckbox .query-name").text();
      var fullclip = shortenedClips[copytext];
      clipboard.writeText(fullclip);
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
      },
        initializeCheckbox: function(){
        //Event listener for checkbox
      $("#kleeptoggle").click(function() {
      if ($(this).is(":checked")) {
      toggleclip = "Checked";
      } else if ($(this).is(":not(:checked)")) {
      toggleclip = "Not checked";
      }
      });
      $("#kleeptoggle").click();
      },
        initializeTodayBtn: function(){
      $("#btnToday").click(function() {
          
        var x;
        keychain.getPassword({ account: 'support@kleep.io', service: 'APP_PASSWORD' }, function(err, pass) {
          console.log('Password is', pass);
          // Prints: Password is baz
          x=pass
        });
        
       
        const container = document.querySelector('#list-scrollbar');
        container.scrollTop = 0;
          //ipc.send("setDisconnect","");
        ipc.send("firestoreStore",clipboard.readText());
        
      
          $("#datepicker-trigger").datepicker("setDate", new Date());
          //$("#pickMonth").text(moment.format("MMMM"))
          // $("#pickDay").text(moment.format("Do"))
          // $("#pickYear").text(moment.format("YYYY"))
      });
      },


       initializeRemoveBtn: function()
      {
      $(document).on("click", ".btn-remove", function() {
        // Log data
        toBeDeleted = $(this)
          .parent()
          .parent();
      });
      },
      
       initializeBulkCopyBtn: function()
      {
      
      $("#bulk-copy").click(function() {
        elements = $(".contents .list > .item").has(
          '.CircularCheckbox [type="checkbox"]:checked'
        );
        if (fnameglobal == "Images") {
          console.log("IMAGES CANT BE BULK COPIED");
        } else {
          var clip = elements.find(".details .CircularCheckbox .query-name");
      
          var finalclip = "";
      
          clip.reverse().each(function() {
            var fullclip = shortenedClips[$(this).text()];
            finalclip = finalclip + "\n" + fullclip;
          });
      
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
      
      },

      initializeSearchBar: function(){
            // Event listener for Search Input
        $("#search").on("keyup", function() {
            // Get search input data
            const value = $(this)
                .val()
                .trim();

            // Display the folder contents
            generateData(value);
        });
      },

      initializeDatepicker: function(){
          
	// Initialize datepicker
	const datepicker = $('[data-toggle="datepicker"]')
    .datepicker({ autoHide: true, trigger: "#datepicker-trigger" })
    .on("pick.datepicker", function(e) {
        // Get date
        const day = e.date.getDate();
        const month = $(this).datepicker("getMonthName");
        const year = e.date.getFullYear();
        const monthnum = e.date.getMonth();
        const date = new Date(year, monthnum, day, 23, 59, 59, 0);

        timeglobal = date.valueOf();
        canUpdateDate=false;
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
      },

      initializeOtherWindowsBtns: function()
      {
        $(".btn-settings").click(function() {
            ipc.send("createWindow", "settings");
        });
        
        $(".user").click(function() {
            ipc.send("createWindow", "user");
        });
      }
      
   
  };
  
  
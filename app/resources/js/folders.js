module.exports = {

    initializeMainAsActive:function (){
        $(".folder-Main").attr("class","item active"); 
      
      },
      
        initializeFolderDeleteBtn: function(){
        $(document).on("click", ".modal-delete-folder", function() {
            // Log data
            console.log("YEEEEEES")
            toBeDeletedFolder= $(this).parent().parent().parent().parent().parent().parent();
            
            console.log(toBeDeletedFolder)
            
        });
      },
        initializeFolderCreateBtn: function (){
        $(".btn-create").click(function() {
            // Log data
      
            var newFolder = $("#folderNameInput").val().replace(/\s+/g, '');
            // Get cloneable row
            const item = $(".folderclone .cloneable");
      
            const foldersList = $(".main-content .folders");
      
            // Filter: Include content if there is supplied query text
            // and supplied text is substring of content description
      
            // Generate id for dropdown and checkbox
            const checkboxId = "folder-id-" + newFolder;
      
            // Clone the cloneable row
            const newItem = item.clone();
      
            // Remove cloneable class to so item will be shown
            newItem.removeClass("cloneable");
      
            newItem
                .find(".title")
                .html(
                    '<img src="resources/assets/icons/folder-gray.svg" width="25" height="25">' +
                        newFolder
                );
            newItem.find(".CircularCheckbox input").attr("id", checkboxId);
            newItem.find(".CircularCheckbox label").attr("for", checkboxId);
            ipc.send("filecreate", newFolder, "no", "");
      
            // Append / Add the item in list
            foldersList.find(".list").append(newItem);
      
           module.exports.setFolderListener();
      
            $("#folderNameInput").val("");
        });
      },
        setFolderListener: function (){
        $(".folders .list .item .title").off();
        // Folder click listener
        const activeImageSrc = "resources/assets/icons/folder-white.svg";
        const inactiveImageSrc = "resources/assets/icons/folder-gray.svg";
        $(".folders .list .item .title").click(function() {
            // Set all to inactive
            $(".folders .list .item").removeClass("active");
      
            $(".folders .list .item .title")
                .find("img")
                .attr("src", inactiveImageSrc);
      
            // Set clicked to active
            $(this)
                .parents(".item")
                .addClass("active")
                .find(".title img")
                .attr("src", activeImageSrc);
            fnameglobal = $(this).text();
            canUpdateDate=false
            getTable();
            const container = document.querySelector('#list-scrollbar');
        container.scrollTop = 0;
      
            if ($(this).text() == "Images") {
                const snackbar = $("#snackbar");
      
                // Get snackbar element
                snackbar.text("Loading Images");
      
                // Add show class
                snackbar.addClass("show");
      
                // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
                setTimeout(function() {
                    snackbar.removeClass("show");
                }, 3000);
            }
        });
      
      }




}
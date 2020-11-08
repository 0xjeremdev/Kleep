module.exports = {
     ColorSelectionModal: function() {
        const modal = $("#modal-color-selection");
        let selector = null;
      
        // Event listener for colors selection
        modal.find(".colors > div").click(function() {
          modal.find(".colors > div").removeClass("selected");
          $(this).addClass("selected");
          modal.find(".btn-apply").removeAttr("disabled");
        });
      
        // Event listener for modal selection before close
        modal.on($.modal.BEFORE_OPEN, function() {
          $(".colors > div").removeClass("selected");
          modal.removeAttr("type");
          modal.find(".btn-apply").attr("disabled", true);
          selector = null;
        });
      
        // Event listeners for color code
        $(document).on("click", '[href="#modal-color-selection"]', function() {
          modal.attr("type", $(this).attr("value"));
          selector = $(this);
        });
      
        // Event for apply
        modal.find(".btn-apply").click(function() {
          const selectedColor = modal.find(".selected").attr("value");
      
          if (selectedColor.length) {
            const type = modal.attr("type");
      
            let elements;
      
            if (type === "folder-content") {
              elements = selector.parents(".item");
            } else if (type === "folder-content-bulk") {
              elements = $(".contents .list > .item").has(
                '.CircularCheckbox [type="checkbox"]:checked'
              );
            } else if (type === "folder-bulk") {
              elements = $(".folders .list > .item").has(
                '.CircularCheckbox [type="checkbox"]:checked'
              );
            }
      
            var clip = elements.find(".details .CircularCheckbox .query-name");
      
            elements.removeClass().addClass("item " + selectedColor);
            clip.each(function() {
              var fullclip = shortenedClips[$(this).text()];
              args = [fnameglobal, fullclip, selectedColor, "colorChange", isGroup];
              ipc.send("newclip", args);
            });
      
            $.modal.close();
          }
        });
      },
       DeleteModal: function() {
        const modal = $("#modal-delete-confirmation");
        let selector = null;
      
        // Event listeners for color code
        $(document).on("click", '[href="#modal-delete-confirmation"]', function() {
          modal.attr("type", $(this).attr("value"));
          selector = $(this);
        });
      
        // Event for apply
        modal.find(".btn-delete").click(function() {
          const snackbar = $("#snackbar");
      
          const type = modal.attr("type");
          let elements;
      
          if (type === "delete-button") {
            if (fnameglobal == "Images") {
              imageRemoved = toBeDeleted.find(".title").attr("id");
      
              ipc.send("deleteImage", imageRemoved);
            } else {
              clipRemoved = toBeDeleted
                .find(".details .CircularCheckbox .query-name")
                .text();
      
              args = [fnameglobal, shortenedClips[clipRemoved], isGroup];
              ipc.send("deleteClip", args);
            }
          } else if (type === "delete-content-bulk") {
            elements = $(".contents .list > .item").has(
              '.CircularCheckbox [type="checkbox"]:checked'
            );
            if (fnameglobal == "Images") {
              var imagesTBD = elements.find(".title");
              //imageRemoved=toBeDeleted.find(".title").attr("id");
              imagesTBD.each(function() {
                ipc.send("deleteImage", $(this).attr("id"));
              });
            } else {
              var clip = elements.find(".details .CircularCheckbox .query-name");
      
              clip.each(function() {
                args = [fnameglobal, shortenedClips[$(this).text()], isGroup];
                ipc.send("deleteClip", args);
              });
            }
          } else if (type === "delete-single") {
            elements = $(".contents .list > .item").has(
              '.CircularCheckbox [type="checkbox"]:checked'
            );
            if (fnameglobal == "Images") {
              var imagesTBD = elements.find(".title");
              //imageRemoved=toBeDeleted.find(".title").attr("id");
              imagesTBD.each(function() {
                ipc.send("deleteImage", $(this).attr("id"));
              });
            } else {
              var clip = elements.find(".details .CircularCheckbox .query-name");
      
              clip.each(function() {
                args = [fnameglobal, shortenedClips[$(this).text()], isGroup];
                ipc.send("deleteClip", args);
              });
            }
          } else if (type === "delete-folder") {
            console.log(toBeDeletedFolder.find(".title"));
            var folderName = toBeDeletedFolder.find(".title").text();
      
            if (folderName == "Main") {
              snackbar.text("Can't remove Main");
      
              // Add show class
              snackbar.addClass("show");
      
              // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
              setTimeout(function() {
                snackbar.removeClass("show");
              }, 3000);
            } else if (folderName == "Images") {
              snackbar.text("Can't remove Images");
      
              // Add show class
              snackbar.addClass("show");
      
              // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
              setTimeout(function() {
                snackbar.removeClass("show");
              }, 3000);
            } else {
              if (fnameglobal == folderName) {
                $("#folder-Main").attr("class", "item active");
      
                fnameglobal = "Main";
                canUpdateDate=false;
                getTable();
              }
              console.log(folderName);
              ipc.send("deleteFolder", folderName);
            }
          }
      
          // Get snackbar element
      
          /*
               snackbar.text("Removed");
      
               // Add show class
               snackbar.addClass("show");
      
               // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
               setTimeout(function() {
                   snackbar.removeClass("show");
               }, 3000);
      
               */
      
          $.modal.close();
        });
      },
       MoveModal: function() {
        const modal = $("#modal-move-folder");
        let selector = null;
      
        $(document).on("click", '[href="#modal-move-folder"]', function() {
          modal.attr("type", $(this).attr("value"));
          selector = $(this);
          $("#copyselect").empty();
          for (var i in fdata) {
            if (fdata[i].name !== "Images") {
              var option = $("<option></option>")
                .attr("value", "option value")
                .text(fdata[i].name);
              $("#copyselect").append(option);
            }
          }
        });
      
        // Event for apply
        modal.find(".btn-move").click(function() {
          const selectedValue = modal.find(".selected").attr("value");
          var folderMove = $("#copyselect")
            .children("option:selected")
            .text();
      
          if (folderMove != fnameglobal) {
            const type = modal.attr("type");
      
            let elements;
      
            if (type === "move-content-single") {
              elements = selector.parents(".item");
            } else if (type === "move-content-bulk") {
              elements = $(".contents .list > .item").has(
                '.CircularCheckbox [type="checkbox"]:checked'
              );
            }
      
            var clip = elements.find(".details .CircularCheckbox .query-name");
      
            //elements.removeClass().addClass("item " + selectedColor);
            clip.each(function() {
              var fullclip = shortenedClips[$(this).text()];
              args = [folderMove, fullclip, "white", "create", isGroup];
              ipc.send("newclip", args);
            });
      
            // Get snackbar element
            const snackbar = $("#snackbar");
      
            // Get snackbar element
            snackbar.text("Moved!");
      
            // Add show class
            snackbar.addClass("show");
      
            // Hide the snackbar element by removing the show class after 3000ms (3 seconds)
            setTimeout(function() {
              snackbar.removeClass("show");
            }, 3000);
            $.modal.close();
          }
        });
      }
      

    
}


   
  
  
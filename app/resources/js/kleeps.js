module.exports = {

    openAnnotationListener: function(){

    
    
        $(document).on(
            "dblclick",
            "#list-scrollbar .item .details .CircularCheckbox .query-name",
            function() {
                var fullclip = shortenedClips[$(this).text()];
                var annot;
        
                if (fullclip in annotations) {
                    annot = annotations[fullclip];
                } else {
                    annot = "";
                }
        
                if (isValidUrl(fullclip)) {
                    electron.shell.openExternal(fullclip);
                } else {
                    new PerfectScrollbar("#modal-fullclip .message", { wheelPropagation: false });
                    $("#modal-fullclip .message").text(fullclip);
                    $("#modal-fullclip .actions #annotation").val(annot);
                    $("#modal-fullclip").modal();
                }
            }
        );

        $(document).on("click", ".modal-annotation-button", function() {
            // Log data
            var annotItem= $(this).parent().parent().parent().parent().parent().parent();
           var annotText =annotItem.find(".details .CircularCheckbox .query-name").text()
           var fullclip = shortenedClips[annotText];
           var annot;
   
           if (fullclip in annotations) {
               annot = annotations[fullclip];
           } else {
               annot = "";
           }
   
           
               $("#modal-fullclip .message").text(fullclip);
               $("#modal-fullclip .actions #annotation").val(annot);
               $("#modal-fullclip").modal();
           
            
        });
    },
    annotateKleepListener: function(){
    $(".btn-annotate").click(function() {
        var text = $("#modal-fullclip .message").text();
        var ant = $("#modal-fullclip #annotation").val();
        ipc.send("annotate", fnameglobal, text, ant);
    
        $("#modal-fullclip .message").val("");
        $("#modal-fullclip #annotation").val("");
    });

    $(".btn-copy-annot").click(function() {

        var text = $("#modal-fullclip .message").text();
        clipboard.writeText(text);
        
    });
}
    

};
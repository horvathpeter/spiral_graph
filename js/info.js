$(document).ready(function () {
    $(function () {
        $("#infoBox")
            .css(
            {
                "background": "rgba(255,255,255,0.5)"
            })
            .dialog({
                autoOpen: false,
                position: {my: "center", at: "left top"},
                show: {effect: 'fade', duration: 500},
                hide: {effect: 'fade', duration: 500}
            });
    });

});
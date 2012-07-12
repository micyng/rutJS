
var g_ctrl = null;

$(document).ready(function() {
    g_ctrl = new jsfx.page.examplectrl();
    bindEvents();
});

bindEvents = function() {
    $("#btn_switch_lng").click(function() {
        g_ctrl.switch_language();
    });
};
jsfx.page = new Object();

jsfx.page.examplectrl = function() {
    this._uiprx = new jsfx.core.uiproxy(new jsfx.page.example_virt_ui());
    this._lng = "ch";
};

jsfx.page.examplectrl.prototype.switch_language = function() {
    this._lng = "ch" === this._lng ? "en" : "ch";

    this._uiprx.appendUI('switch_language', this._lng);
    this._uiprx.render();
};

jsfx.page.example_virt_ui = function() {
    this._res = new jsfx.page.res();
};

jsfx.page.example_virt_ui.prototype.switch_language = function(lng) {
    var manifest = new jsfx.core.uiManifest();
    manifest.addSubAttributeNode("btn_switch_lng", "value", this._res.get_res(lng, "switch_lng"));
    manifest.addSubHtmlNode("func_title", this._res.get_res(lng, "func_title"));
    manifest.addSubHtmlNode("exp_title", this._res.get_res(lng, "demo_title"));
    return manifest;
};

jsfx.page.res = function() {
    this._ch_switch_lng = "切换语言";
    this._ch_func_title = "功能面板";
    this._ch_demo_title = "示例面板";

    this._en_switch_lng = "switch language";
    this._en_func_title = "function panel";
    this._en_demo_title = "demos panel";
};

jsfx.page.res.prototype.get_res = function(lng, action) {
    return eval("this._" + lng + "_" + action);
};
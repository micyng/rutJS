jsfx.util.templateProxy = function(rootDivId, templateDivId) {
    if (!rootDivId || !templateDivId)
        throw new Error("invalid root_div_id or template_div_id");

    var newRootId = "__newRoot__";
    this._newTemplateHostId = "__newTH__";

    this._rootDivId = rootDivId;
    this._templateDivId = templateDivId;

    this._newRoot = document.getElementById(rootDivId);
    if (!this._newRoot)
        throw new Error("root node not found: " + rootDivId);
    this._newRoot = this._newRoot.cloneNode(false);
    this._newRoot.id = newRootId;

    document.getElementsByTagName("body")[0].appendChild(this._newRoot);
};

jsfx.util.templateProxy.prototype.append = function(data, templateDef) {
    if (!templateDef)
        throw new Error("invalid templateDef");
    var newTempHost = document.getElementById(this._templateDivId);
    if (!newTempHost)
        throw new Error("template node not found: " + this._templateDivId);
    newTempHost = newTempHost.cloneNode(false);
    newTempHost.id = this._newTemplateHostId;

    this._newRoot.appendChild(newTempHost);
    $("#" + this._newTemplateHostId).html(templateDef);

    var template = new Template(this._newTemplateHostId);
    var result = template.expand(data);

    $("#" + this._templateDivId).append(result.innerHTML);
};
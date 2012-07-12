jsfx.core.templateProxy = function(rootDivId, templateDivId) {
    if (!rootDivId || !templateDivId)
        throw new Error("invalid root_div_id or template_div_id");

    this._newTemplateHostId = "__newTH__";
    this._templateDivId = templateDivId;

    this._newRoot = document.getElementById(rootDivId);
    if (!this._newRoot)
        throw new Error("root node not found: " + rootDivId);
    this._newRoot = this._newRoot.cloneNode(false);
    this._newRoot.id = "__newRoot__" + rootDivId; //in case of existed
    this._newRoot.className = "";
    this._newRoot.style.width = '0px';
    this._newRoot.style.height = '0px';

    document.getElementsByTagName("body")[0].appendChild(this._newRoot);
};

jsfx.core.templateProxy.prototype.append = function(data, templateDef) {
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

jsfx.core.uiproxy = function(virtualUI) {
    this._uiSeqs = [];
    this._isBE = this.is_browser();
    this._render = new jsfx.core.uirender(this._isBE);
    this._virtualUI = virtualUI;
    this._utNodes = {};
};

jsfx.core.uiproxy.prototype.appendUI = function(funcName) {
    if (!funcName || 'string' != typeof(funcName))return;
    if (0 === funcName.length)return;

    var args = [];
    for (var i = 1; i < arguments.length; i++)
        args.push(arguments[i]);

    this._uiSeqs.push({'func': funcName, 'params': args});
};

jsfx.core.uiproxy.prototype.render = function() {
    try {
        if (!this._virtualUI)
            throw new Error("virtual ui can not be null");

        for (var idx = 0; idx < this._uiSeqs.length; idx++) {
            var item = this._uiSeqs[idx];
            if (!(item.func in this._virtualUI))
                throw new Error("function " + item.func + " not implemented in virtual ui");

            var itemFunction = eval("this._virtualUI." + item.func);
            if (itemFunction.length !== item.params.length)
                throw new TypeError('formal & actual params count NOT equal, ' + itemFunction.length + ' is OK for ' + item.func);

            var rt = itemFunction.apply(this._virtualUI, item.params);
            var renderNodes = this._render.resolve(rt);
            if (!this._isBE)
                this._utNodes[item] = renderNodes;
        }
    }
    catch(e) {
        if (this._isBE)
            console.log(e);
        throw e;
    }
    finally {
        if (this._isBE) {
            this._uiSeqs = [];
            this._utNodes = {};
        }
    }
};

jsfx.core.uiproxy.prototype.getUISeqs = function() {
    try {
        return this._uiSeqs;
    }
    finally {
        if (!this._isBE)
            this._uiSeqs = [];
    }
};

jsfx.core.uiproxy.prototype.getUIElement = function(idx) {
    if (!idx || 'number' != typeof(idx))return null;
    if (idx < 0 || idx > this._uiSeqs.length - 1)return null;

    return this._uiSeqs[idx];
};

jsfx.core.uiproxy.prototype.getUINodes = function(uiseq) {
    var nodes = this._utNodes[uiseq];
    if (undefined === nodes)return [];
    return nodes;
};

jsfx.core.uiproxy.prototype.is_browser = function() {
    try {
        return !!document;
    }
    catch(e) {
        return false;
    }
};

jsfx.core.uirender = function(isBE) {
    this._isBE = isBE;
    g_templateMap = {};
    this._renderMap = {};
    this._renderMap['pcss'] = function(jQObj, cssName) {
        if (jQObj.length < 1)return;
        jQObj[0].className += " " + cssName;
    };
    this._renderMap['acss'] = function(jQObj, cssName) {
        if (jQObj.length < 1)return;
        jQObj[0].className = cssName;
    };
    this._renderMap['scss'] = function(jQObj, body) {
        if (jQObj.length < 1)return;
        if (!jsfx.util.fmt.isDictKeysOK(body, ['from', 'to']))return;

        var from = body['from'];
        var to = body['to'];
        if (!to)to = "";

        var domObj = jQObj[0];
        var oldCN = domObj.className;

        var pattern = new RegExp("(^|\\s)" + to + "(\\s|$)");
        if (pattern.test(oldCN))return;

        domObj.className = oldCN.replace(from, to);
    };
    this._renderMap['stext'] = function(jQObj, text) {
        jQObj.val(text);
    };
    this._renderMap['shtml'] = function(jQObj, html) {
        jQObj.html(html);
    };
    this._renderMap['rm'] = function(jQObj) {
        if (jQObj.length < 1)return;
        jQObj.remove();
    };
    this._renderMap['phtml'] = function(jQObj, html) {
        jQObj.append(html);
    };
    this._renderMap['prehtml'] = function(jQObj, html) {
        jQObj.prepend(html);
    };
    this._renderMap['show'] = function(jQObj) {
        jQObj.show();
    };
    this._renderMap['sattr'] = function(jQObj, body) {
        if (jQObj.length < 1)return;
        if (!jsfx.util.fmt.isDictKeysOK(body, ['name' , 'value']))return;
        var name = body['name'];
        var value = body['value'];

        jQObj[0][name] = value;
    };
    this._renderMap['ssty'] = function(jQObj, body) {
        if (jQObj.length < 1)return;
        if (!jsfx.util.fmt.isDictKeysOK(body, ['pairs']))return;

        jQObj.css(body['pairs']);
    };
    this._renderMap['scrol'] = function(jQObj) {
        if (jQObj.length < 1)return;
        jQObj.scrollTop(jQObj[0].scrollHeight);
    };
    this._renderMap['sevt'] = function(jQObj, body) {
        if (jQObj.length < 1)return;
        if (!jsfx.util.fmt.isDictKeysOK(body, ['evt', 'realAction', 'pa']))return;
        /*
         evt->string
         realAction->string
         pa->array
         */

        var evt = body['evt'];
        var realAction = body['realAction'];
        var params = body['pa'];

        if (!jsfx.util.fmt.isStringInLength(evt) || !evt.startswith('on'))return;
        if (!jsfx.util.fmt.isStringInLength(realAction))return;
        if (!jsfx.util.fmt.isArray(params) || 0 === params.length)return;
        if (!(realAction in window))
            throw new TypeError('no function [' + realAction + '] defined in global window');

        realAction = eval(realAction);
        var args = [];

        for (var i = 0; i < params.length; i++) {
            var item = params[i];
            var normalObj = item['NO'];
            var domObj = item['DO'];

            if ((!normalObj && !domObj) || (normalObj && domObj))
                throw new TypeError('invalid event params array' + array);
            if (domObj) {
                domObj = document.getElementById(domObj);
                if (!domObj)
                    throw new Error('no element found: ' + item['DO']);
                args.push(domObj);
            }
            else {
                args.push(normalObj);
            }
        }

        var domObj = jQObj[0];
        domObj[evt] = function() {
            realAction.apply(window, args);
        }
    };
    this._renderMap['urld'] = function(url) {
        if ('string' !== typeof(url))return;
        window.location = url;
    };
    this._renderMap['hide'] = function(jQObj) {
        jQObj.hide();
    };
    this._renderMap['senb'] = function(jQObj, enable) {
        if (jQObj.length < 1)return;
        jQObj[0].disabled = !enable; //get dom object first
    };
    this._renderMap['template'] = function(content) {
        if (!jsfx.util.fmt.isDictKeysOK(content, ['templateid', 'templateDef', 'data', 'parentNodeID']))
            throw new TypeError('template format invalid');

        var templateID = content['templateid'];
        var templateDef = content['templateDef'];
        var data = content['data'];
        var parentNodeID = content['parentNodeID'];

        if (!templateID)
            throw new TypeError("invalid templateID");

        if (!g_templateMap[templateID])
            g_templateMap[templateID] = new jsfx.core.templateProxy(parentNodeID, templateID);
        g_templateMap[templateID].append(data, templateDef);
    };
};

jsfx.core.uirender.prototype.resolve = function(uiManifest) {
    if (!uiManifest)
        throw new Error("uiManifest object can not be null");

    var nodes = uiManifest.getNodes();
    if (!this._isBE)return {'nodes' : nodes};

    for (var i = 0; i < nodes.length; i++) {
        var action = nodes[i]['action'];
        var pack = nodes[i]['target'];
        var notJQlish = nodes[i]['jq'];
        var noEnsureIDExist = nodes[i]['noEnsure'];

        var id = pack['id'];
        var body = pack['body'];

        if (!notJQlish && !id)
            throw new Error("id is null when resolve manifest in " + action);
        var jqObject = notJQlish ? null : $("#" + id);
        if (!noEnsureIDExist && !notJQlish && jqObject.length < 1)
            throw new Error('no element found via ' + id);
        var cb = this._renderMap[action];
        if (!cb)
            throw new TypeError('action not supported: ' + action);
        cb(notJQlish ? pack : jqObject, body);
    }

    return true;
};

jsfx.core.uiManifest = function() {
    this._nodes = [];
};

jsfx.core.uiManifest.prototype.addTemplateNode = function(content) {
    //content format -> {'templateid' : '', 'templateDef' : '', 'data' : [], 'parentNodeID' : ''}
    this._addNode('template', content, true);
};

jsfx.core.uiManifest.prototype.addSubEnableNode = function(target, enable) {
    enable = !!enable;

    this._addNode('senb', {'id' : target, 'body' : enable}, false);
};

jsfx.core.uiManifest.prototype.addSetCssNode = function(target, cssName) {
    if (!jsfx.util.fmt.isCss(cssName))return;
    this._addNode('acss', {'id':target, 'body' : cssName}, false);
};

jsfx.core.uiManifest.prototype.addSubCssNode = function(target, fromCSS, toCSS) {
    if (!jsfx.util.fmt.isCss(fromCSS))return;
    if (!jsfx.util.fmt.isCss(toCSS) && "" !== toCSS)return;

    //"" means remove css
    this._addNode('scss', {'id' : target, 'body' : {'from':fromCSS, 'to': toCSS}}, false);
};

jsfx.core.uiManifest.prototype.addClearContentNode = function(target) {
    this.addSubHtmlNode(target, '');
};

jsfx.core.uiManifest.prototype.addRemoveNode = function(target) {
    this._addNode('rm', {'id' : target}, false, true);
};

jsfx.core.uiManifest.prototype.addAppendCssNode = function(target, cssName) {
    if (!jsfx.util.fmt.isCss(cssName))return;
    this._addNode('pcss', {'id' : target, 'body' : cssName}, false);
};

jsfx.core.uiManifest.prototype.addScrollNode = function(target) {
    this._addNode('scrol', {'id' : target}, false);
};

jsfx.core.uiManifest.prototype.addSubTextNode = function(target, txt) {
    this._addNode('stext', {'id' : target, 'body' : txt}, false);
};

jsfx.core.uiManifest.prototype.addSubHtmlNode = function(target, html) {
    this._addNode('shtml', {'id' : target, 'body' : html}, false);
};

jsfx.core.uiManifest.prototype.addAppendHtmlNode = function(target, html) {
    this._addNode('phtml', {'id' : target, 'body' : html}, false);
};

jsfx.core.uiManifest.prototype.addPrependHtmlNode = function(target, html) {
    this._addNode('prehtml', {'id' : target, 'body' : html}, false);
};

//替换结点样式
jsfx.core.uiManifest.prototype.addSubStyleNode = function(target, stylePairs) {
    this._addNode('ssty', {'id':target, 'body':{'pairs' : stylePairs}}, false);
};

//不支持事件属性，不支持style属性
jsfx.core.uiManifest.prototype.addSubAttributeNode = function(target, attrName, attrValue) {
    this._addNode('sattr', {'id':target, 'body':{'name' : attrName, 'value' : attrValue}}, false);
};

//替换事件回调
/*
 paramArray -> [{'N' : string}, {'D' : dom_id_string}]
 */
jsfx.core.uiManifest.prototype.addSubEventNode = function(target, eventName, realActionName, paramArray) {
    this._addNode('sevt', {'id' : target, 'body' : {'evt':eventName, 'realAction' : realActionName, 'pa' : paramArray}});
};

jsfx.core.uiManifest.prototype.addShowNode = function(target) {
    this._addNode('show', {'id' : target, 'body' : null}, false);
};

jsfx.core.uiManifest.prototype.addURLDirectNode = function(target) {
    this._addNode('urld', target, true);
};

jsfx.core.uiManifest.prototype.addHideNode = function(target) {
    this._addNode('hide', {'id' : target, 'body' : null}, false);
};

jsfx.core.uiManifest.prototype._addNode = function(action, pack, notJQlish, noEnsureIDExist) {
    /*
     action:
     # update css      -> scss
     # update text     -> stext
     # update html     -> shtml
     # append html     -> phtml
     # prepend html    -> prehtml
     # show            -> show
     # hide            -> hide
     # apply templdate -> template
     # send            -> enable
     # scrol           -> scroll down
     # rm              -> remove
     # urld            -> url direction
     # sattr           -> set attribute
     */

    noEnsureIDExist = !!noEnsureIDExist;
    this._nodes.push({'action' : action, 'target' : pack, 'jq' : !!notJQlish, 'noEnsure' : noEnsureIDExist});
};

jsfx.core.uiManifest.prototype.getNodes = function() {
    return this._nodes;
};
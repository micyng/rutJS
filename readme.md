介绍
====

一个可以单元测试的Javascript UI中间件，英文全名为Robust Unit-Testable UI Middleware for Javascript，下文简称为rutJS。

缘由
----

在web项目前端开发中，由于代码架构以及语言的自身限制，Javascript很难通过单元测试的手段改善代码质量，虽然目前也有很多适用于Javascript的开源单元测试套件（如QUnit），但依然无法解决Javascript在UI开发方面的测试问题

原理
-----
rutJS从以下2个方面解决Javascript在web前端开发方面的单元测试难题：

* 强制使用MVC模式解决架构带来的代码耦合问题
* 使用`中间描述对象`表示前端UI的变化，所需要测试的不再是由浏览器解释运行的原始Javascript函数调用，而是该`中间描述对象`

### 使用MVC模式

我们知道MVC模式的引入在很大程度上解决了UI与Model之间的耦合问题；同样，rutJS在引入MVC模式的同时，还引入了`虚拟UI`的概念，方便带入`中间描述对象`这个适合单元测试的概念

### 使用`中间`描述对象

为了避免直接测试Javascript函数调用对UI的操作（本人暂时还不知道如何测试），rutJS引入了`中间描述对象`，即将对UI的操作用某中间结构表示：在需要渲染UI时，可以解析该中间结构；在单元测试环境中，同样可以通过对该中间结构的解析判断测试结果

最佳实践
--------

**rutJS依赖于jQuery**

* 引用如下Javascript文件

        core/external/jquery-1.4.3.min.js
        core/util/templateProxy.js
        core/util/convert.js
        core/util/patroon.js
        core/uiprx.js

* 定义与页面同名的ctrl以及ui Javascript文件（当然，不强制同名）

        script/example.ui.js
        script/example.ctrl.js
        
* example.ctrl.js （此处以example.html为文件名示例）中定义至少如下2个Javascript类定义

        //类1，MVC的Control对象
        jsfx.page.examplectrl = function() {
            //必须定义UI代理对象
            this._uiprx = new jsfx.core.uiproxy(new jsfx.page.example_virt_ui());
        };

        //Control对应的功能函数，示例中为switch_language
        jsfx.page.examplectrl.prototype.switch_language = function() {
            //调用UI代理对象的相关方法
            this._uiprx.appendUI('switch_language', this._lng);
            this._uiprx.render();
        };
        
        //类2，虚拟UI类
        jsfx.page.example_virt_ui = function() {
        };

        //虚拟UI对象的相应渲染方法
        jsfx.page.example_virt_ui.prototype.switch_language = function(lng) {
            var manifest = new jsfx.core.uiManifest();
            manifest.addSubAttributeNode("btn_switch_lng", "value", this._res.get_res(lng, "switch_lng"));
            manifest.addSubHtmlNode("func_title", this._res.get_res(lng, "func_title"));
            manifest.addSubHtmlNode("exp_title", this._res.get_res(lng, "demo_title"));
            return manifest;
        };
        
* example.ui.js

该Javascript文件按照传统开发习惯即可，例如：

        var g_ctrl = null; //必须申明Control对象

        $(document).ready(function() {
            g_ctrl = new jsfx.page.examplectrl();
            bindEvents();
        });

        bindEvents = function() {
            $("#btn_switch_lng").click(function() {
                g_ctrl.switch_language(); //即可调用Control对象相关方法完成UI的渲染
            });
        };


如何测试
--------
/**
 * Main module: rendering, ui logic
 */
/*global window*/
(function($, ClipboardJS, WhatBrowserManager) {
    "use strict";

    function render_property(name, value) {
        var str_value =
            (value && value.toString && value.toString()) || "" + value;
        if (str_value === "undefined" || !str_value) {
            return "";
        }
        return (
            "<tr>" +
            "<th>" +
            name +
            "</th>" +
            "<td>" +
            str_value +
            "</td>" +
            "</tr>"
        );
    }

    function render_info(whatbrowser) {
        var properties = "";
        properties += render_property(
            "Куки",
            whatbrowser.cookies ? "да" : "нет"
        );
        properties += render_property("Язык", whatbrowser.language);
        properties += render_property("Страница", whatbrowser.browser_size);
        properties += render_property("Экран", whatbrowser.screen);
        properties += render_property(
            "Браузер",
            whatbrowser.ua && whatbrowser.ua.browser
        );
        properties += render_property(
            "Движок",
            whatbrowser.ua && whatbrowser.ua.engine
        );
        properties += render_property(
            "ОС",
            whatbrowser.ua && whatbrowser.ua.os
        );
        properties += render_property(
            "Устройство",
            whatbrowser.ua && whatbrowser.ua.device
        );
        properties += render_property("Юзер-агент", whatbrowser.ua);
        return properties;
    }

    function render_header(whatbrowser, own) {
        var header_msg = "";
        if (!own) {
            header_msg =
                "Сохраненный браузер: " +
                '<a href="' +
                whatbrowser.link.full +
                '">' +
                whatbrowser.ua.browser.name +
                " " +
                whatbrowser.ua.browser.major +
                (whatbrowser.ua.os.name
                    ? " на " + whatbrowser.ua.os.name
                    : "") +
                "</a>";
        } else if (whatbrowser.ua.browser.name) {
            header_msg =
                "У вас " +
                whatbrowser.ua.browser.name +
                " " +
                whatbrowser.ua.browser.major;
            header_msg += whatbrowser.ua.os.name
                ? " на " + whatbrowser.ua.os.name
                : "";
        } else {
            header_msg = "У вас неизвестный науке браузер :-[";
        }
        return header_msg;
    }

    function show_links(whatbrowser) {
        $("#copy-value").val(whatbrowser.link.full);
    }

    function show_info(whatbrowser, own) {
        var $details = $("#details-table").children("tbody"),
            header = render_header(whatbrowser, own);
        $details.html(render_info(whatbrowser));
        if (own) {
            $("#header-msg").html(header);
            show_links(whatbrowser);
        } else {
            $("#details-msg").html(header);
            $("#header").hide();
        }
        $("#message").hide();
        $("#result").fadeIn();
    }

    function show(id) {
        var whatbrowser;
        if (id) {
            whatbrowser = WhatBrowserManager.load(id);
            show_info(whatbrowser, false);
        } else {
            whatbrowser = WhatBrowserManager.create();
            show_info(whatbrowser, true);
        }
    }

    function get_origin() {
        return (
            window.location.protocol +
            "//" +
            window.location.hostname +
            (window.location.port ? ":" + window.location.port : "")
        );
    }

    function render() {
        var id = WhatBrowserManager.get_id();
        show(id.value);
    }

    function init_ui() {
        // fix IE origin
        if (!window.location.origin) {
            window.location.origin = get_origin();
        }
        $(window).on("hashchange", render);
        $(".link-text").click(function() {
            if (this.setSelectionRange) {
                this.setSelectionRange(0, 9999);
            } else {
                $(this).select();
            }
        });
        var clipboard = new ClipboardJS("#info-link button");
        clipboard.on("success", function(e) {
            var $status = $("#copy-status");
            $status.text("✓ скопировано");
            window.setTimeout(function() {
                $status.text("");
            }, 500);
        });
    }

    $(function() {
        init_ui();
        render();
    });
})(window.jQuery, window.ClipboardJS, window.WhatBrowserManager);

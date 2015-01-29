/**
 * Main module: rendering, ui logic
 */
/*global window*/
(function($, ZeroClipboard, WhatBrowserManager) {
    'use strict';

    function render_property(name, value) {
        var str_value = value && value.toString && value.toString() || ('' + value);
        if (str_value === 'undefined' || !str_value) {
            return '';
        }
        return '<tr>' +
            '<th>' + name + '</th>' +
            '<td>' + str_value + '</td>' +
            '</tr>';
    }

    function render_info(whatbrowser) {
        var properties = '';
        properties += render_property('Куки', whatbrowser.cookies ? 'да' : 'нет');
        properties += render_property('Флеш', whatbrowser.flash);
        properties += render_property('Джава', whatbrowser.java);
        properties += render_property('Язык', whatbrowser.language);
        properties += render_property('Страница', whatbrowser.browser_size);
        properties += render_property('Экран', whatbrowser.screen);
        properties += render_property('Браузер', whatbrowser.ua && whatbrowser.ua.browser);
        properties += render_property('Движок', whatbrowser.ua && whatbrowser.ua.engine);
        properties += render_property('ОС', whatbrowser.ua && whatbrowser.ua.os);
        properties += render_property('Устройство', whatbrowser.ua && whatbrowser.ua.device);
        properties += render_property('Юзер-агент', whatbrowser.ua);
        properties += render_property('IP-адрес', whatbrowser.geo && whatbrowser.geo.ip);
        properties += render_property('Местоположение', whatbrowser.geo && whatbrowser.geo.address);
        return properties;
    }

    function render_header(whatbrowser, own) {
        var header_msg = '';
        if (!own) {
            header_msg = 'Вы смотрите браузер ' +
                '<a href="' + whatbrowser.link.full + '">' + whatbrowser.id + '</a>';
        }
        else if (whatbrowser.ua.browser.name) {
            header_msg = 'У вас ' + whatbrowser.ua.browser.name + ' ' + whatbrowser.ua.browser.major;
            header_msg += whatbrowser.ua.os.name ? ' на ' + whatbrowser.ua.os.name : '';
        } else {
            header_msg = 'У вас неизвестный науке браузер :-(';
        }
        return header_msg;
    }

    function show_links(whatbrowser) {
        if (whatbrowser.link && ZeroClipboard && whatbrowser.flash && whatbrowser.flash.enabled) {
            // can copy link to clipboard
            $('#copy-value').val(whatbrowser.link.full);
        } else if (whatbrowser.link) {
            // copying disabled, but can send link via email
            $('#info-link-copy').hide();
            $('#mail-value').val(whatbrowser.link.full);
            $('#info-link-mail').find('a').attr('href',
                'mailto:?subject=' +
                encodeURIComponent('Информация о моем браузере') +
                '&body=' +
                encodeURIComponent(whatbrowser.link.full)
            );
            $('#info-link-mail').show();
            if (window.history && window.history.replaceState) {
                window.history.replaceState(whatbrowser.link, '', '#!' + whatbrowser.link.hash);
            }
        } else {
            // we failed miserably, lets just display info
            $('#info-link').hide();
            $('#info-show').show();
        }
    }

    function show_info(whatbrowser, own) {
        var $details = $('#details-table').children('tbody');
        $details.html(render_info(whatbrowser));
        $('#header-msg').html(render_header(whatbrowser, own));
        if (own) {
            show_links(whatbrowser);
        } else {
            $('#info-link').hide();
        }
        $('#message').hide();
        $('#result').fadeIn();
    }

    function init_clipboard($button) {
        var clipboard = new ZeroClipboard($button.get(0));
        clipboard.on('aftercopy', function(e) {
            var $btn = $(e.target),
                $text = $btn.prev(),
                $status = $btn.next();
            $text.focus().select();
            $status.text('Скопировано!');
            window.setTimeout(function() {
                $status.text('');
            }, 500);
        });
    }

    function init_ui() {
        $('.link-text').click(function() {
            if (this.setSelectionRange) {
                this.setSelectionRange(0, 9999);
            } else {
                $(this).select();
            }
        });
        if (ZeroClipboard) {
            ZeroClipboard.config({
                hoverClass: 'zero-hover',
                activeClass: 'zero-active'
            });
            init_clipboard($('#info-link').find('button'));
            init_clipboard($('#info-copy').find('button'));
        }
    }

    function show_external(id) {
        WhatBrowserManager.load(id)
            .done(function(whatbrowser) {
                show_info(whatbrowser, false);
            })
            .fail(function() {
                $('#message').find('h2').text('По этой ссылке ничего нет :-(');
            });
    }

    function show_local(id) {
        if (id) {
            WhatBrowserManager.create(id)
                .done(function(whatbrowser) {
                    show_info(whatbrowser, true);
                    WhatBrowserManager.update(id, whatbrowser);
            });
        } else {
            WhatBrowserManager.create_and_save()
                .done(function(whatbrowser) {
                    show_info(whatbrowser, true);
                })
                .fail(function(whatbrowser) {
                    show_info(whatbrowser, true);
                });
        }
    }

    $(function() {
        init_ui();
        var id = WhatBrowserManager.get_id();
        if (id.local) {
            show_local(id.value);
        } else {
            show_external(id.value);
        }
    });

})(
    window.jQuery,
    window.ZeroClipboard,
    window.WhatBrowserManager
);

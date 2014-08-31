WhatBrowser.ru
===========

Больше не надо созваниваться и разъяснять, где посмотреть версию браузера и ОС. Не нужно обмениваться скриншотами. Не нужно гадать, запрещен ли в браузере флеш.
Просто попросите человека прислать ссылку, которую он увидит на [whatbrowser.ru](http://whatbrowser.ru), и получите исчерпывающую информацию.

Исходный код проекта открыт под лицензией MIT. Как подключить к своему сайту — описано ниже, полный пример в файле [test.html](test.html).

Встраиваем WhatBrowser.ru на свой сайт
----------

Чтобы использовать на своем сайте, минимально достаточно подключить `jQuery` и сам `whatbrowser`:

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="https://rawgit.com/algenon/whatbrowser/master/dist/whatbrowser.min.js"></script> 
```

И получить объект с информацией о браузере:

```js
WhatBrowser.create().done(function(whatbrowser) {
  console.log(whatbrowser);
});
```

В таком варианте собирается следующая информация:

- Размер окна браузера (`browser_size`)
- Включены ли куки (`cookies`)
- Включен ли флеш (`flash.enabled`)
- Включена ли джава (`java.enabled`)
- Языковые настройки (`language`)
- Разрешение экрана (`screen`)
- Юзер-агент одной строкой (`ua.ua`)

Парсим юзер-агента
----------

Чтобы парсить юзер-агента, подключите библиотеку `ua-parser`:

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="https://rawgit.com/faisalman/ua-parser-js/master/src/ua-parser.min.js"></script>
<script src="https://rawgit.com/algenon/whatbrowser/master/dist/whatbrowser.min.js"></script> 
```

Теперь дополнительно собираются:

- Название и версия браузера  (`ua.browser`)
- Название и версия движка браузера  (`ua.engine`)
- Название и версия операционной системы  (`ua.os`)
- Проивзодитель и модель мобильного устройства (`ua.device`)

Получаем точную версию джавы и флеша
----------

Чтобы узнать точные версии флеш-плагина и джавы, подключите библиотеки `swfobject` и `deployJava`:

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="https://rawgit.com/faisalman/ua-parser-js/master/src/ua-parser.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/swfobject/2.2/swfobject.js"></script>
<script src="https://www.java.com/js/deployJava.js"></script>
<script src="https://rawgit.com/algenon/whatbrowser/master/dist/whatbrowser.min.js"></script> 
```

Теперь дополнительно собираются:

- Версия флеш-плагина  (`flash.version`)
- Версия джавы  (`java.version`)

Геолокация
----------

Чтобы получить IP-адрес и географическое местоположение, передайте опцию `geo = true`:

```js
WhatBrowser.create({ geo: true }).done(function(whatbrowser) {
  console.log(whatbrowser.geo);
});
```

Теперь дополнительно собираются:

- IP-адрес (`geo.ip`)
- Координаты (`geo.position`)
- Страна и город (`geo.address`)

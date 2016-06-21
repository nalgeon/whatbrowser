/*
 * 'What is my browser' object.
 * Contains everything known about the browser,
 * plus optional geolocation.
 */
(function init ($, UAParser, swfobject, deployJava) {
  const navigator = window.navigator
  const document = window.document

  function resolutionToStr (width, height) {
    return `${width} × ${height} px`
  }

  function browserSize (source) {
    const value = source && source.browser_size || {
      height: $(window).height(),
      width: $(window).width()
    }
    value.toString =
      () => resolutionToStr(value.width, value.height)
    return value
  }

  function cookies (source) {
    function hasCookies () {
      if (navigator.cookieEnabled) {
        return true
      }
      // create and delete cookie
      document.cookie = 'cookietest=1'
      const ret = document.cookie.indexOf('cookietest=') !== -1
      document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT'
      return ret
    }

    return source && source.cookies || hasCookies()
  }

  function flash (source) {
    function hasFlash () {
      try {
        const fo = window.ActiveXObject &&
          new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash') || null
        if (fo) {
          return true
        }
      } catch (e) {
        if (navigator.mimeTypes &&
          navigator.mimeTypes['application/x-shockwave-flash'] !== undefined &&
          navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
          return true
        }
      }
      return false
    }

    function flashToString (f) {
      let str = ''
      if (f.enabled && f.version) {
        str = `${f.version.major}.${f.version.minor}.${f.version.release}`
      } else if (f.enabled) {
        str = 'да'
      } else {
        str = 'нет'
      }
      return str
    }

    const value = source && source.flash || {
      enabled: hasFlash(),
      version: swfobject && swfobject.getFlashPlayerVersion()
    }
    value.toString = () => flashToString(value)
    return value
  }

  function javafn (source) {
    const value = source && source.java || {
      enabled: navigator.javaEnabled && navigator.javaEnabled(),
      version: deployJava && deployJava.getJREs().shift()
    }
    value.toString = () => {
      return value.enabled ? value.version || 'да' : 'нет'
    }
    return value
  }

  function language (source) {
    return source && source.language ||
      navigator.language || navigator.userLanguage
  }

  function online (source) {
    return source && source.online || navigator.onLine
  }

  function screenfn (source) {
    const value = source && source.screen ||
      window.screen && {
        color_depth: window.screen.colorDepth,
        pixel_ratio: window.devicePixelRatio,
        height: window.screen.height,
        width: window.screen.width
      }
    value.toString = () => {
      let str = ''
      if (value) {
        const resolution = resolutionToStr(value.width, value.height)
        const depth = `${value.color_depth} bit`
        str = `${resolution}, ${depth}`
        if (value.pixel_ratio && value.pixel_ratio > 1) {
          const retinaResolution = resolutionToStr(value.width * value.pixel_ratio,
            value.height * value.pixel_ratio)
          str += ` (retina ${retinaResolution})`
        }
      }
      return str
    }
    return value
  }

  function ua (source) {
    function browserToString (browser) {
      let str = browser.name || ''
      str += browser.major && ` ${browser.major}` || ''
      str += browser.version && ` (${browser.version})` || ''
      return str
    }

    function deviceToString (device) {
      let str = device.vendor || ''
      str += device.model && ` ${device.model}` || ''
      str += device.type && ` (${device.type})` || ''
      return str
    }

    function engineToString (engine) {
      let str = engine.name || ''
      str += engine.version && ` ${engine.version}` || ''
      return str
    }

    function osToString (os) {
      let str = os.name || ''
      str += os.version && ` ${os.version}` || ''
      return str
    }

    let value = {}
    if (UAParser) {
      value = source && source.ua || (new UAParser()).getResult()
      value.toString = () => value.ua
      value.browser.toString = () => browserToString(value.browser)
      value.device.toString = () => deviceToString(value.device)
      value.engine.toString = () => engineToString(value.engine)
      value.os.toString = () => osToString(value.os)
    } else {
      value = {
        ua: navigator.userAgent
      }
    }
    return value
  }

  function geo (source) {
    function positionToString (position) {
      return position.latitude ? `${position.latitude}, ${position.longitude}` : ''
    }

    function addressToString (address) {
      let str = address.country || ''
      str += address.region && `', ${address.region}` || ''
      str += address.city && `', ${address.city}` || ''
      return str
    }

    const value = source
    if (value && value.position) {
      value.position.toString = () => positionToString(value.position)
    }
    if (value && value.address) {
      value.address.toString = () => addressToString(value.address)
    }
    return value
  }

  function WhatBrowser (source) {
    const self = this
    self.browser_size = browserSize(source)
    self.cookies = cookies(source)
    self.flash = flash(source)
    self.javafn = javafn(source)
    self.language = language(source)
    self.online = online(source)
    self.screenfn = screenfn(source)
    self.ua = ua(source)
    self.geo = geo(source && source.geo || undefined)
  }

  WhatBrowser.create = function (options = {}) {
    const whatbrowser = new WhatBrowser()
    const promise = $.Deferred()
    const onGeolocate = (location) => {
      whatbrowser.geo = geo(location)
      promise.resolve(whatbrowser)
    }
    if (options.geo) {
      // geolocate().always(onGeolocate)
      promise.resolve(whatbrowser)
    } else {
      promise.resolve(whatbrowser)
    }
    return promise
  }

  window.WhatBrowser = WhatBrowser
  return WhatBrowser
}(window.jQuery, window.UAParser, window.swfobject, window.deployJava))

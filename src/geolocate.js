(function ($) {
  function geolocate () {
    function formatLocation (data) {
      return {
        ip: data.ip,
        position: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        address: {
          country: data.country_name,
          region: data.region_name,
          city: data.city
        }
      }
    }

    const promise = $.Deferred()
    $.getJSON('//freegeoip.net/json/?callback=?',
      {
        timeout: 500
      })
      .done(
        data => promise.resolve(formatLocation(data))
      )
      .fail(
        () => promise.resolve({})
      )
    return promise
  }

  window.geolocate = geolocate
}(window.jQuery))

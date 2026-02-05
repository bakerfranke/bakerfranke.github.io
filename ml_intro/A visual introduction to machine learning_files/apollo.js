// tag manager
var _mtm = window._mtm = window._mtm || [];
_mtm.push({'mtm.startTime': (new Date().getTime()), 'event': 'mtm.Start'});
(function() {
  var h=window.location.hostname;
  sMap = {
    'archive.org': 'ZUUaFed2',
    'web.archive.org': 'kzRD6OIl',
    fallback: 'x5vxauv0',
  };
  var containerId = sMap[h] || sMap['fallback'];
  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
  g.async=true; g.src=`//apollo.archive.org/js/container_${containerId}.js`; s.parentNode.insertBefore(g,s);
})();

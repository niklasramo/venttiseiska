var
data = [
  // Desktop - IE
  ['Windows 7', 'internet explorer', '9.0'],
  ['Windows 8', 'internet explorer', '10.0'],
  ['Windows 8.1', 'internet explorer', '11.0'],
  ['Windows 10', 'internet explorer', '11.0'],
  // Desktop - Edge
  ['Windows 10', 'microsoftedge', '20.10240'],
  // Desktop - Firefox
  ['Linux', 'firefox', '43.0'],
  ['Windows 7', 'firefox', '43.0'],
  ['Windows 8', 'firefox', '43.0'],
  ['Windows 8.1', 'firefox', '43.0'],
  ['Windows 10', 'firefox', '43.0'],
  ['OS X 10.8', 'firefox', '43.0'],
  ['OS X 10.9', 'firefox', '43.0'],
  ['OS X 10.10', 'firefox', '43.0'],
  ['OS X 10.11', 'firefox', '43.0'],
  // Desktop - Chrome
  ['Linux', 'chrome', '47.0'],
  ['Windows 7', 'chrome', '47.0'],
  ['Windows 8', 'chrome', '47.0'],
  ['Windows 8.1', 'chrome', '47.0'],
  ['Windows 10', 'chrome', '47.0'],
  ['OS X 10.8', 'chrome', '47.0'],
  ['OS X 10.9', 'chrome', '47.0'],
  ['OS X 10.10', 'chrome', '47.0'],
  ['OS X 10.11', 'chrome', '47.0'],
  // Desktop - Safari
  ['OS X 10.8', 'safari', '6.0'],
  ['OS X 10.9', 'safari', '7.0'],
  ['OS X 10.10', 'safari', '8.0'],
  // ['OS X 10.11', 'safari', '9.0'],
  // Mobile - iOS
  ['OS X 10.10', 'iphone', '7.1'],
  ['OS X 10.10', 'iphone', '8.4'],
  //['OS X 10.10', 'iphone', '9.2'],
  // Mobile - Android
  ['Linux', 'android', '4.0'],
  ['Linux', 'android', '4.1'],
  ['Linux', 'android', '4.2'],
  ['Linux', 'android', '4.3'],
  ['Linux', 'android', '4.4'],
  ['Linux', 'android', '5.1']
],
browsers = {};

data.forEach(function (data) {

  var
  browser = {
    base: 'SauceLabs',
    platform: data[0],
    browserName: data[1],
    version: data[2]
  },
  key = browser.platform + ' - ' + browser.browserName + (browser.version ? ' - ' + browser.version : '');

  if (browser.browserName === 'iphone') {
    browser.deviceName = 'iPhone Simulator';
    browser.deviceOrientation = 'portrait';
  }

  if (browser.browserName === 'android') {
    browser.deviceName = 'Android Emulator';
    browser.deviceOrientation = 'portrait';
  }

  browsers[key] = browser;

});

function getLaunchers() {

  return browsers;

}

function getBrowsers(filter) {

  var
  keys = Object.keys(browsers),
  filteredKeys = [];

  if (filter) {
    keys.forEach(function (item) {
      if (item.indexOf(filter) > -1) {
        filteredKeys.push(item);
      }
    });
    return filteredKeys;
  }
  else {
    return keys;
  }

}

module.exports = {
  getLaunchers: getLaunchers,
  getBrowsers: getBrowsers
};
import { browser } from '$app/environment';

export default () => {
  if (!browser) return;
  let userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('windows') != -1) {
    return 'windows';
  } else if (userAgent.indexOf('linux') + userAgent.indexOf('x11') != -2) {
    return 'linux';
  } else if (userAgent.indexOf('mac') != -1) {
    return 'macos';
  } else if (userAgent.indexOf('android') != -1) {
    return 'android';
  } else if (
    userAgent.indexOf('ipad') + userAgent.indexOf('ipod') + userAgent.indexOf('iphone') !=
    -3
  ) {
    return 'ios';
  }
};

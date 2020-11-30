require('dotenv').config();
const { notarize } = require('electron-notarize');
var keychain = require('keychain');
var password;
keychain.getPassword({ account: 'support@kleep.io', service: 'APP_PASSWORD' }, function(err, pass) {
    password=pass;
    // Prints: Password is baz
  });

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;  
  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  
  return await notarize({
    appBundleId: 'com.electron.kleep',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: 'support@kleep.io',
    appleIdPassword: `@keychain:APP_PASSWORD`,
  });
};
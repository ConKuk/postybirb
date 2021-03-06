const {
  remote,
  nativeImage,
  shell,
  clipboard
} = require('electron');
const path = require('path');
const fs = require('fs-extra');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const {
  app,
  session
} = remote;

try {
  // Loads these behaviors into browser (unsure if this is required anymore)
  const _setImmediate = setImmediate;
  const _clearImmediate = clearImmediate;
  const _Buffer = Buffer;
  process.once('loaded', () => {
    global.setImmediate = _setImmediate;
    global.clearImmediate = _clearImmediate;
    global.Buffer = _Buffer;
  });

  window.appVersion = remote.app.getVersion();
  window.closeAfterPost = () => remote.getCurrentWindow().closeAfterPost;
  window.nativeImage = nativeImage;
  window.getFileIcon = app.getFileIcon;
  window.BrowserWindow = remote.BrowserWindow; // Pretty much only used for PaigeeWorld right now

  // Set up profiles DB
  try {
    const adapter = new FileSync(path.join(app.getPath('userData'), 'data', 'profiles.json'));
    const ldb = low(adapter);
    window.profilesDB = ldb;
  } catch (e) {
    fs.writeJSONSync(path.join(app.getPath('userData'), 'data', 'profiles.json'), {});
    const adapter = new FileSync(path.join(app.getPath('userData'), 'data', 'profiles.json'));
    const ldb = low(adapter);
    window.profilesDB = ldb;
  }


  // Set up templates DB
  try {
    const templatesAdaptor = new FileSync(path.join(app.getPath('userData'), 'data', 'templates.json'));
    const tldb = low(templatesAdaptor);
    window.templateDB = tldb;
  } catch (e) {
    fs.writeJSONSync(path.join(app.getPath('userData'), 'data', 'templates.json'), {});
    const templatesAdaptor = new FileSync(path.join(app.getPath('userData'), 'data', 'templates.json'));
    const tldb = low(templatesAdaptor);
    window.templateDB = tldb;
  }


  // Set up description templates DB
  try {
    const descriptionAdapter = new FileSync(path.join(app.getPath('userData'), 'data', 'description-templates.json'));
    const dldb = low(descriptionAdapter);
    window.descriptionTemplateDB = dldb;
  } catch (e) {
    fs.writeJSONSync(path.join(app.getPath('userData'), 'data', 'description-templates.json'), {});
    const descriptionAdapter = new FileSync(path.join(app.getPath('userData'), 'data', 'description-templates.json'));
    const dldb = low(descriptionAdapter);
    window.descriptionTemplateDB = dldb;
  }


  // Set up tag templates DB
  try {
    const tagAdapter = new FileSync(path.join(app.getPath('userData'), 'data', 'tag-templates.json'));
    const tagldb = low(tagAdapter);
    window.tagTemplateDB = tagldb;
  } catch (e) {
    fs.writeJSONSync(path.join(app.getPath('userData'), 'data', 'tag-templates.json'), {});
    const tagAdapter = new FileSync(path.join(app.getPath('userData'), 'data', 'tag-templates.json'));
    const tagldb = low(tagAdapter);
    window.tagTemplateDB = tagldb;
  }


  // Set up settings DB
  try {
    const settingsAdapter = new FileSync(path.join(app.getPath('userData'), 'data', 'settings.json'));
    const sldb = low(settingsAdapter);
    window.settingsDB = sldb;
  } catch (e) {
    fs.writeJSONSync(path.join(app.getPath('userData'), 'data', 'settings.json'), {});
    const settingsAdapter = new FileSync(path.join(app.getPath('userData'), 'data', 'settings.json'));
    const sldb = low(settingsAdapter);
    window.settingsDB = sldb;
  }

  settingsDB.defaults({
    hardwareAcceleration: true,
    startAsTaskbar: false,
    postInterval: 0,
    postRetries: 1,
    clearQueueOnFailure: true,
    advertise: true,
    localErrorLogging: true,
    startOnLogin: false,
  }).write();

  window.got = require('./src/got-request.js');
  window.ehttp = require('./src/http.js');

  window.auth = {
    deviantart: require('./src/deviant-art-auth.js'),
    mastodon: require('./src/mastodon-auth.js'),
    tumblr: require('./src/tumblr-auth.js'),
    twitter: require('./src/twitter-auth.js')
  };

  window.AUTH_URL = require('./src/auth-server.js').auth_server;

  window.iconv = require('iconv-lite');
  window.chardet = require('chardet');
  window.parse5 = require('parse5');
  window.sanitize = require('sanitize-html');
  const Entities = require('html-entities').AllHtmlEntities;
  window.entities = new Entities();

  const {
    FindInPage
  } = require('electron-find');

  window.onload = () => {
    let findInPage = new FindInPage(remote.getCurrentWebContents());
    let hasOpened;

    function searchToggle() {
      // get symbol reference
      if (!hasOpened) {
        hasOpened = Reflect.ownKeys(findInPage).find(s => {
          return String(s) === "Symbol(hasOpened)";
        });
      }

      if (findInPage[hasOpened]) findInPage.closeFindWindow();
      else findInPage.openFindWindow();
    }

    window.addEventListener('keydown', event => {
      if ((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase() === 'f') {
        searchToggle();
      }
    });
  }

  /**
   * Writes object data to a specified JSON file
   * @param  {string} fileName Name of the file to write to
   * @param  {object} data     Data to be written
   */
  window.writeJsonToFile = function writeJsonToFile(fileName, data, options) {
    fs.writeJson(path.join(app.getPath('userData'), 'data', `${fileName}.json`), data, options || {}, (err) => {
      if (err) {
        console.error(err);
      }
    });
  };

  /**
   * Reads a JSON file and returns the data
   * @param  {string} fileName The name of the file
   */
  window.readJsonFile = function readJsonFile(fileName) {
    return new Promise((resolve) => {
      fs.readJson(path.join(app.getPath('userData'), 'data', `${fileName}.json`), (err, data) => {
        resolve(data);
      });
    });
  };

  /**
   * Opens a url in the user's native/default browser
   * @param  {string} url URL being opened
   */
  window.openUrlInBrowser = function openUrl(url) {
    shell.openExternal(url);
  };

  /**
   * Gets cookies for session given a url and persist id
   * @param  {string} persistId
   * @param  {string} url
   * @return {Promise<Cookie[]>}     Cookies
   */
  window.getCookies = function getCookies(persistId, url) {
    const cookies = session.fromPartition(`persist:${persistId}`).cookies;
    return cookies.get({ url });
  };

  /**
   * Gets the API to the cookie container
   * @param  {string} persistId
   */
  window.getCookieAPI = function getCookieAPI(persistId) {
    return session.fromPartition(`persist:${persistId}`).cookies;
  }

  /**
   * Gets the Session for the id
   */
  window.getSession = function(persistId) {
    return session.fromPartition(`persist:${persistId}`);
  }

  window.getClipboardFormats = clipboard.availableFormats;
  window.writeToClipboard = clipboard.write;
  window.readClipboard = function readClipboard() {
    return {
      availableFormats: clipboard.availableFormats(),
      content: clipboard.readImage()
    };
  };

  // Relaunch application (mostly used for toggling hardware acceleration)
  window.relaunch = function relaunch() {
    app.relaunch();
    app.exit();
  };

  window.setStartOnLogin = function setStartOnLogin(value) {
    app.setLoginItemSettings({
      openAtLogin: value,
      path: app.getPath('exe'),
    });
  };
} catch (error) {
  alert(`Unable to initialize application correctly.
    This may affect application performance and behavior.
    Restarting in Administrator mode or reinstalling may solve these issues.

    Please report this as a bug.

    ${error.message}
    ${error.stack}`);
}

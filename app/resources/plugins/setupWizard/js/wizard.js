//----------------------------------------------------------------------------
//-- Setup Wizard plugin — first-run onboarding assistant.
//--
//-- Modern, step-by-step wizard that guides a new user through: toolchain
//-- install, collections folder, board selection, connecting the board and a
//-- test build+upload. It runs in the Icestudio page context (its UI lives in
//-- the shadow DOM `pluginRoot`) and reuses the app's Angular services via the
//-- injector and apio via Node child_process.
//--
//-- It auto-launches once on first run / missing config and never reappears
//-- after it has been opened (profile flag setupWizardDone, set on open). It
//-- can be relaunched anytime from Tools -> Wizard.
//--
//-- UI strings are localized with gettextCatalog.getString() (the plugin js
//-- folder is scanned by `grunt gettext`).
//----------------------------------------------------------------------------
(function () {
  'use strict';

  //========================================================================
  //-- App services (the wizard runs in the same page as the Angular app)
  //========================================================================
  var injector = null;
  try {
    injector = angular.element(document.body).injector();
  } catch (e) {
    injector = null;
  }
  function svc(name) {
    try {
      return injector ? injector.get(name) : null;
    } catch (e) {
      return null;
    }
  }
  var tools = svc('tools');
  var profile = svc('profile');
  var common = svc('common');
  var boardsSvc = svc('boards');
  var collections = svc('collections');
  var $rootScope = svc('$rootScope');
  //-- Localization. Fallback to identity so the wizard still works if the
  //-- service is unavailable. Named `gettextCatalog` so `grunt gettext` finds
  //-- the gettextCatalog.getString() calls below.
  var gettextCatalog = svc('gettextCatalog') || {
    getString: function (s) {
      return s;
    },
  };

  //-- Node modules (available in the nwjs page context)
  var cp = require('child_process');
  var fs = require('fs');
  var nodePath = require('path');
  var os = require('os');

  //-- Shadow DOM root of the plugin UI
  var root = pluginRoot;
  function $id(id) {
    return root.getElementById(id);
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function digest() {
    try {
      if ($rootScope && !$rootScope.$$phase) {
        $rootScope.$applyAsync();
      }
    } catch (e) {
      /* ignore */
    }
  }

  //-- Mark the wizard as "seen" as soon as it opens, so it never auto-launches
  //-- again regardless of how it is dismissed (cancel, finish or window close).
  if (profile) {
    try {
      profile.set('setupWizardDone', true);
    } catch (e) {
      /* ignore */
    }
  }

  //========================================================================
  //-- apio helpers
  //========================================================================
  function apioBase() {
    return common && common.APIO_CMD ? common.APIO_CMD : 'apio';
  }
  //-- Run an apio subcommand string. cb(err, output)
  function execApio(sub, cb) {
    cp.exec(
      apioBase() + ' ' + sub,
      { maxBuffer: 32 * 1024 * 1024 },
      function (err, stdout, stderr) {
        cb(err, (stdout || '') + (stderr || ''));
      }
    );
  }
  function quote(p) {
    return '"' + String(p).replace(/"/g, '\\"') + '"';
  }
  function toolchainInstalled() {
    try {
      return !!(
        iceStudio &&
        iceStudio.toolchain &&
        iceStudio.toolchain.installed
      );
    } catch (e) {
      return false;
    }
  }
  function toolchainVersion() {
    try {
      return (
        (iceStudio && iceStudio.toolchain && iceStudio.toolchain.apio) || ''
      );
    } catch (e) {
      return '';
    }
  }

  //========================================================================
  //-- State
  //========================================================================
  function defaultCollectionsPath() {
    return nodePath.join(os.homedir(), 'Documents', 'Icestudio', 'collections');
  }
  var S = {
    idx: 0,
    language: profile ? profile.get('language') || 'en' : 'en',
    channel: profile ? profile.get('apioChannel') || 'stable' : 'stable',
    collectionsPath:
      (profile && profile.get('externalCollections')) ||
      defaultCollectionsPath(),
    board: null, //-- { name, label }
    busy: false,
  };

  //========================================================================
  //-- Board list (from the boards service)
  //========================================================================
  function boardList() {
    var list = common && common.boards ? common.boards : [];
    return list
      .map(function (b) {
        return { name: b.name, label: (b.info && b.info.label) || b.name };
      })
      .sort(function (a, b) {
        return a.label.localeCompare(b.label);
      });
  }

  //========================================================================
  //-- Language list (locales with a catalog under common.LOCALE_DIR)
  //========================================================================
  //-- Native names (untranslated on purpose, so each is shown in its own
  //-- language). Codes without an entry fall back to the raw locale code.
  var LANG_NAMES = {
    ca_ES: 'Català',
    cs_CZ: 'Čeština',
    de_DE: 'Deutsch',
    el_GR: 'Ελληνικά',
    en: 'English',
    es_ES: 'Español',
    eu_ES: 'Euskara',
    fr_FR: 'Français',
    gl_ES: 'Galego',
    it_IT: 'Italiano',
    ja_JP: '日本語',
    ko_KR: '한국어',
    nl_NL: 'Nederlands',
    pt_BR: 'Português (Brasil)',
    ru_RU: 'Русский',
    tr_TR: 'Türkçe',
    uk_UA: 'Українська',
    zh_CN: '简体中文',
    zh_TW: '繁體中文',
  };
  function languageList() {
    var dir = common && common.LOCALE_DIR;
    var codes = [];
    try {
      fs.readdirSync(dir).forEach(function (e) {
        try {
          if (fs.lstatSync(nodePath.join(dir, e)).isDirectory()) {
            codes.push(e);
          }
        } catch (x) {
          /* ignore */
        }
      });
    } catch (x) {
      /* ignore */
    }
    return codes
      .map(function (c) {
        return { code: c, name: LANG_NAMES[c] || c };
      })
      .sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
  }

  //========================================================================
  //-- Window / navigation
  //========================================================================
  function closeWindow() {
    try {
      if (iceStudio && iceStudio.gui && iceStudio.gui.wm) {
        iceStudio.gui.wm.closeWindow(pluginUUID);
      }
    } catch (e) {
      /* ignore */
    }
  }

  //-- Change the UI language live, reusing the app's own flow: the menu
  //-- controller listens for the 'langChanged' event and runs profile.set +
  //-- gettextCatalog switch + project reload (same as Edit -> Language).
  //-- Falls back to driving the graph service directly.
  function applyLanguage(code) {
    var jq = window.$ || window.jQuery;
    if (jq) {
      try {
        jq(document).trigger('langChanged', code);
        return;
      } catch (e) {
        /* fall through to the direct path */
      }
    }
    try {
      var graph = svc('graph');
      if (graph && profile) {
        profile.set('language', graph.selectLanguage(code));
        digest();
      }
    } catch (e) {
      /* ignore */
    }
  }

  //-- Footer button refs (wired in init)
  var elBack, elNext, elCancel;

  function setBusy(b) {
    S.busy = b;
  }
  function enableNext(on) {
    if (elNext) {
      elNext.disabled = !on;
    }
  }
  function setNextLabel(txt) {
    if (elNext) {
      elNext.textContent = txt;
    }
  }
  function showNext(on) {
    if (elNext) {
      elNext.classList.toggle('wiz-hidden', !on);
    }
  }

  function renderDots() {
    var dots = STEPS.map(function (s, i) {
      var cls = 'wiz-dot';
      if (i === S.idx) {
        cls += ' active';
      } else if (i < S.idx) {
        cls += ' done';
      }
      return '<span class="' + cls + '"></span>';
    }).join('');
    $id('wiz-progress').innerHTML = dots;
  }

  function render() {
    var step = STEPS[S.idx];
    //-- Footer defaults
    elBack.classList.toggle('wiz-hidden', S.idx === 0);
    showNext(true);
    enableNext(true);
    //-- nextLabel may be a function so it is re-translated on every render
    //-- (e.g. after a live language change), not frozen at script load.
    var nextLabel =
      typeof step.nextLabel === 'function' ? step.nextLabel() : step.nextLabel;
    setNextLabel(nextLabel || gettextCatalog.getString('Continue'));
    //-- Body
    $id('wiz-body').innerHTML =
      '<div class="wiz-step">' + step.render() + '</div>';
    renderDots();
    if (typeof step.bind === 'function') {
      step.bind();
    }
  }

  function goTo(i) {
    if (i < 0 || i >= STEPS.length) {
      return;
    }
    S.idx = i;
    setBusy(false);
    render();
  }
  function advance() {
    if (S.idx >= STEPS.length - 1) {
      finishWizard();
    } else {
      goTo(S.idx + 1);
    }
  }
  function onNextClick() {
    if (S.busy) {
      return;
    }
    var step = STEPS[S.idx];
    if (typeof step.onNext === 'function') {
      step.onNext(advance);
    } else {
      advance();
    }
  }
  function onBackClick() {
    if (S.busy) {
      return;
    }
    goTo(S.idx - 1);
  }
  function cancelWizard() {
    closeWindow();
  }
  function finishWizard() {
    closeWindow();
  }

  //========================================================================
  //-- STEP 0 — Language (bilingual title; switches the UI language on pick)
  //========================================================================
  var STEP_LANGUAGE = {
    render: function () {
      //-- Title intentionally bilingual + untranslated, so a new user always
      //-- recognizes it whatever the current language is.
      return (
        '<div class="wiz-icon">🌐</div>' +
        '<h2 class="wiz-title">Select your language<br>' +
        'Selecciona tu idioma</h2>' +
        '<input type="text" class="wiz-search" id="wiz-lang-search" ' +
        'placeholder="' +
        esc(gettextCatalog.getString('Search languages…')) +
        '" autocomplete="off">' +
        '<div class="wiz-list" id="wiz-lang-list"></div>'
      );
    },
    bind: function () {
      var all = languageList();
      var listEl = $id('wiz-lang-list');
      var searchEl = $id('wiz-lang-search');

      function paint(filter) {
        var f = (filter || '').toLowerCase();
        var items = all.filter(function (l) {
          return (
            l.name.toLowerCase().indexOf(f) >= 0 ||
            l.code.toLowerCase().indexOf(f) >= 0
          );
        });
        if (!items.length) {
          listEl.innerHTML =
            '<div class="wiz-empty">' +
            gettextCatalog.getString('No languages match.') +
            '</div>';
          return;
        }
        listEl.innerHTML = items
          .map(function (l) {
            var sel = S.language === l.code ? ' selected' : '';
            return (
              '<div class="wiz-item' +
              sel +
              '" data-code="' +
              esc(l.code) +
              '"><div><div class="wiz-item-label">' +
              esc(l.name) +
              '</div><div class="wiz-item-sub">' +
              esc(l.code) +
              '</div></div></div>'
            );
          })
          .join('');
        Array.prototype.forEach.call(
          listEl.querySelectorAll('.wiz-item'),
          function (it) {
            it.addEventListener('click', function () {
              var code = it.getAttribute('data-code');
              if (code === S.language) {
                return;
              }
              S.language = code;
              Array.prototype.forEach.call(
                listEl.querySelectorAll('.wiz-item'),
                function (o) {
                  o.classList.toggle('selected', o === it);
                }
              );
              enableNext(true);
              //-- Switch the interface language live...
              applyLanguage(code);
              //-- ...then re-render this step once the new catalog has loaded,
              //-- so the wizard chrome (buttons, placeholder) flips too.
              setTimeout(function () {
                if (STEPS[S.idx] !== STEP_LANGUAGE) {
                  return;
                }
                if (elCancel) {
                  elCancel.textContent = gettextCatalog.getString('Cancel');
                }
                if (elBack) {
                  elBack.textContent = gettextCatalog.getString('Back');
                }
                render();
              }, 350);
            });
          }
        );
      }

      paint('');
      enableNext(true);
      if (searchEl) {
        searchEl.addEventListener('input', function () {
          paint(searchEl.value);
        });
        searchEl.focus();
      }
    },
  };

  //========================================================================
  //-- STEP 1 — Welcome
  //========================================================================
  var STEP_WELCOME = {
    render: function () {
      return (
        '<div class="wiz-icon">🚀</div>' +
        '<h2 class="wiz-title">' +
        gettextCatalog.getString('Welcome to Icestudio') +
        '</h2>' +
        '<p class="wiz-text">' +
        gettextCatalog.getString(
          'Icestudio lets you design digital circuits for FPGAs <b>visually</b> — drag blocks, wire them up, and program real hardware, no command line required.'
        ) +
        '</p>' +
        '<p class="wiz-text">' +
        gettextCatalog.getString(
          'This quick assistant will get you ready: install the toolchain, choose where your collections live, pick your board and run a small test on it. It only takes a minute.'
        ) +
        '</p>'
      );
    },
    nextLabel: function () {
      return gettextCatalog.getString("Let's start");
    },
  };

  //========================================================================
  //-- STEP 2 — Toolchain
  //========================================================================
  var STEP_TOOLCHAIN = {
    render: function () {
      if (toolchainInstalled()) {
        var ver = toolchainVersion();
        return (
          '<div class="wiz-icon">🔧</div>' +
          '<h2 class="wiz-title">' +
          gettextCatalog.getString('Toolchain ready') +
          '</h2>' +
          '<p class="wiz-text">' +
          gettextCatalog.getString(
            'The Apio toolchain is already installed{{version}}. You can manage or update it later from <b>Tools → Toolchain</b>.',
            { version: ver ? ' (<b>v' + esc(ver) + '</b>)' : '' }
          ) +
          '</p>'
        );
      }
      return (
        '<div class="wiz-icon">🔧</div>' +
        '<h2 class="wiz-title">' +
        gettextCatalog.getString('Install the toolchain') +
        '</h2>' +
        '<p class="wiz-text">' +
        gettextCatalog.getString(
          'The <b>toolchain</b> (Apio) is the set of open-source tools that turn your design into a bitstream and upload it to the FPGA. Icestudio needs it to build and program boards.'
        ) +
        '</p>' +
        '<p class="wiz-text">' +
        gettextCatalog.getString('Choose a channel:') +
        '</p>' +
        '<div class="wiz-cards">' +
        '<div class="wiz-card' +
        (S.channel === 'stable' ? ' selected' : '') +
        '" data-ch="stable"><span class="wiz-card-radio"></span>' +
        '<h4>' +
        gettextCatalog.getString('Stable') +
        '</h4><p>' +
        gettextCatalog.getString(
          'The latest stable release. Recommended for most users.'
        ) +
        '</p></div>' +
        '<div class="wiz-card' +
        (S.channel === 'ci' ? ' selected' : '') +
        '" data-ch="ci"><span class="wiz-card-radio"></span>' +
        '<h4>' +
        gettextCatalog.getString('CI (nightly)') +
        '</h4><p>' +
        gettextCatalog.getString(
          'The newest build with the latest features. May be less stable.'
        ) +
        '</p></div>' +
        '</div>'
      );
    },
    nextLabel: function () {
      return gettextCatalog.getString('Install');
    },
    bind: function () {
      //-- The label set by render() is 'Install'; when the toolchain is
      //-- already present there is nothing to install, so just continue.
      setNextLabel(
        toolchainInstalled()
          ? gettextCatalog.getString('Continue')
          : gettextCatalog.getString('Install')
      );
      if (toolchainInstalled()) {
        return;
      }
      Array.prototype.forEach.call(
        root.querySelectorAll('.wiz-card'),
        function (card) {
          card.addEventListener('click', function () {
            S.channel = card.getAttribute('data-ch');
            Array.prototype.forEach.call(
              root.querySelectorAll('.wiz-card'),
              function (c) {
                c.classList.toggle('selected', c === card);
              }
            );
          });
        }
      );
    },
    onNext: function (done) {
      if (toolchainInstalled()) {
        done();
        return;
      }
      if (!tools || typeof tools.installToolchainWizard !== 'function') {
        done();
        return;
      }
      setBusy(true);
      setNextLabel(gettextCatalog.getString('Installing…'));
      enableNext(false);
      elBack.classList.add('wiz-hidden');
      tools.installToolchainWizard(S.channel, function (err) {
        setBusy(false);
        if (err || !toolchainInstalled()) {
          //-- The install dialog already shows the error log. Let the user
          //-- retry from the wizard.
          setNextLabel(gettextCatalog.getString('Retry install'));
          enableNext(true);
          elBack.classList.remove('wiz-hidden');
        } else {
          done();
        }
        digest();
      });
    },
  };

  //========================================================================
  //-- STEP 3 — Collections folder
  //========================================================================
  function pickFolder(cb) {
    var input = document.createElement('input');
    input.type = 'file';
    input.setAttribute('nwdirectory', '');
    input.style.display = 'none';
    input.addEventListener('change', function () {
      var p = input.value || (input.files[0] && input.files[0].path);
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
      if (p) {
        cb(p);
      }
    });
    document.body.appendChild(input);
    input.click();
  }

  var STEP_COLLECTIONS = {
    render: function () {
      return (
        '<div class="wiz-icon">📁</div>' +
        '<h2 class="wiz-title">' +
        gettextCatalog.getString('Collections folder') +
        '</h2>' +
        '<p class="wiz-text">' +
        gettextCatalog.getString(
          'Choose where the block <b>collections</b> you install from iceHub will be stored. The default is fine for most users.'
        ) +
        '</p>' +
        '<div class="wiz-folder" id="wiz-folder">' +
        '<span class="wiz-folder-path" id="wiz-folder-path">' +
        esc(S.collectionsPath) +
        '</span>' +
        '<span class="wiz-folder-btn">' +
        gettextCatalog.getString('Change…') +
        '</span>' +
        '</div>'
      );
    },
    bind: function () {
      var f = $id('wiz-folder');
      if (f) {
        f.addEventListener('click', function () {
          pickFolder(function (p) {
            S.collectionsPath = nodePath.join(p, 'Icestudio', 'collections');
            //-- If the user already picked an Icestudio collections folder,
            //-- don't nest it again.
            if (/Icestudio[\\/]+collections$/i.test(p)) {
              S.collectionsPath = p;
            }
            var el = $id('wiz-folder-path');
            if (el) {
              el.textContent = S.collectionsPath;
            }
          });
        });
      }
    },
    onNext: function (done) {
      try {
        fs.mkdirSync(S.collectionsPath, { recursive: true });
      } catch (e) {
        /* keep going; configure even if mkdir failed */
      }
      if (profile) {
        profile.set('externalCollections', S.collectionsPath);
      }
      //-- Reload collections from the new external path
      try {
        if (
          collections &&
          typeof collections.loadAllCollections === 'function'
        ) {
          collections.loadAllCollections();
          if (typeof collections.sort === 'function') {
            collections.sort();
          }
        }
        if (iceStudio && iceStudio.bus && iceStudio.bus.events) {
          iceStudio.bus.events.publish('pluginManager.updateEnv', common);
        }
      } catch (e) {
        /* ignore */
      }
      digest();
      done();
    },
  };

  //========================================================================
  //-- STEP 4 — Board selection
  //========================================================================
  var STEP_BOARD = {
    render: function () {
      return (
        '<div class="wiz-icon">🎛️</div>' +
        '<h2 class="wiz-title">' +
        gettextCatalog.getString('Select your board') +
        '</h2>' +
        '<p class="wiz-text">' +
        gettextCatalog.getString('Pick the FPGA board you will be using.') +
        '</p>' +
        '<input type="text" class="wiz-search" id="wiz-board-search" ' +
        'placeholder="' +
        esc(gettextCatalog.getString('Search boards…')) +
        '" autocomplete="off">' +
        '<div class="wiz-list" id="wiz-board-list"></div>'
      );
    },
    bind: function () {
      var all = boardList();
      var listEl = $id('wiz-board-list');
      var searchEl = $id('wiz-board-search');

      function paint(filter) {
        var f = (filter || '').toLowerCase();
        var items = all.filter(function (b) {
          return (
            b.label.toLowerCase().indexOf(f) >= 0 ||
            b.name.toLowerCase().indexOf(f) >= 0
          );
        });
        if (!items.length) {
          listEl.innerHTML =
            '<div class="wiz-empty">' +
            gettextCatalog.getString('No boards match.') +
            '</div>';
          return;
        }
        listEl.innerHTML = items
          .map(function (b) {
            var sel = S.board && S.board.name === b.name ? ' selected' : '';
            return (
              '<div class="wiz-item' +
              sel +
              '" data-name="' +
              esc(b.name) +
              '"><div><div class="wiz-item-label">' +
              esc(b.label) +
              '</div><div class="wiz-item-sub">' +
              esc(b.name) +
              '</div></div></div>'
            );
          })
          .join('');
        Array.prototype.forEach.call(
          listEl.querySelectorAll('.wiz-item'),
          function (it) {
            it.addEventListener('click', function () {
              var name = it.getAttribute('data-name');
              var b = all.filter(function (x) {
                return x.name === name;
              })[0];
              S.board = b || null;
              Array.prototype.forEach.call(
                listEl.querySelectorAll('.wiz-item'),
                function (o) {
                  o.classList.toggle('selected', o === it);
                }
              );
              enableNext(!!S.board);
            });
          }
        );
      }

      paint('');
      enableNext(!!S.board);
      if (searchEl) {
        searchEl.addEventListener('input', function () {
          paint(searchEl.value);
        });
        searchEl.focus();
      }
    },
    onNext: function (done) {
      if (!S.board) {
        return;
      }
      try {
        if (boardsSvc && typeof boardsSvc.selectBoard === 'function') {
          boardsSvc.selectBoard(S.board.name);
        }
        if (profile) {
          profile.set('board', S.board.name);
        }
        digest();
      } catch (e) {
        /* ignore */
      }
      done();
    },
  };

  //========================================================================
  //-- STEP 5 — Connect the board
  //========================================================================
  var STEP_CONNECT = {
    render: function () {
      var bl = S.board ? S.board.label : gettextCatalog.getString('your board');
      return (
        '<div class="wiz-icon">🔌</div>' +
        '<h2 class="wiz-title">' +
        gettextCatalog.getString('Connect your board') +
        '</h2>' +
        '<p class="wiz-text">' +
        gettextCatalog.getString(
          'Plug <b>{{board}}</b> into a USB port on your computer.',
          { board: esc(bl) }
        ) +
        '</p>' +
        '<div class="wiz-status-list wiz-scan" id="wiz-scan-status">' +
        '<div class="wiz-status-line active">' +
        gettextCatalog.getString('Scanning for devices…') +
        '</div>' +
        '</div>' +
        '<p style="text-align:center;margin-top:20px">' +
        '<button type="button" id="wiz-rescan" ' +
        'class="wiz-btn wiz-btn--scan">' +
        gettextCatalog.getString('Scan again') +
        '</button></p>'
      );
    },
    bind: function () {
      var rescan = $id('wiz-rescan');
      if (rescan) {
        rescan.addEventListener('click', function (e) {
          e.preventDefault();
          doScan();
        });
      }
      doScan();
    },
  };

  function doScan() {
    var box = $id('wiz-scan-status');
    if (!box) {
      return;
    }
    box.innerHTML =
      '<div class="wiz-status-line active">' +
      gettextCatalog.getString('Scanning for devices…') +
      '</div>';
    execApio('devices scan-usb', function (err, out) {
      //-- apio prints a summary line "Found N USB device(s)" (the table
      //-- columns are truncated, so we rely on that count plus a name match).
      var m = (out || '').match(/Found\s+(\d+)\s+(?:USB\s+)?devices?\b/i);
      var n = m ? parseInt(m[1], 10) : 0;
      if (!box.isConnected) {
        return;
      }
      //-- Does a detected device look like the selected board? (match the
      //-- first word of the board label against the scan output product names)
      var key = (S.board && S.board.label ? S.board.label : '').split(/\s+/)[0];
      var matches =
        key &&
        new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(
          out || ''
        );
      if (n > 0 && matches) {
        box.innerHTML =
          '<div class="wiz-status-line ok">' +
          gettextCatalog.getString(
            '{{board}} detected. You are ready to continue.',
            { board: esc(S.board.label) }
          ) +
          '</div>';
      } else if (n > 0) {
        box.innerHTML =
          '<div class="wiz-status-line">' +
          gettextCatalog.getString(
            'A USB device was detected, but it does not look like your board. Continue only if you are sure it is connected.'
          ) +
          '</div>';
      } else {
        box.innerHTML =
          '<div class="wiz-status-line">' +
          gettextCatalog.getString('No board detected yet.') +
          '</div>' +
          '<div class="wiz-status-line">' +
          gettextCatalog.getString(
            'Plug the board in (and power it). You can continue anyway, but the test upload will fail without it.'
          ) +
          '</div>';
      }
    });
  }

  //========================================================================
  //-- STEP 6 — Test build + upload
  //========================================================================
  function parseExamplesForBoard(out, board) {
    var safe = board.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(?:^|[^\\w-])' + safe + '\\/([\\w-]+)', 'g');
    var set = {};
    var m;
    while ((m = re.exec(out)) !== null) {
      set[m[1]] = true;
    }
    return Object.keys(set);
  }
  function pickBasicExample(examples) {
    var prio = [
      'blinky',
      'blink',
      'ledon',
      'led-on',
      'led_on',
      'leds',
      'led-green',
      'led',
    ];
    for (var i = 0; i < prio.length; i++) {
      if (examples.indexOf(prio[i]) >= 0) {
        return prio[i];
      }
    }
    var byBlink = examples.filter(function (e) {
      return /blink/i.test(e);
    });
    if (byBlink.length) {
      return byBlink[0];
    }
    var byLed = examples.filter(function (e) {
      return /led/i.test(e);
    });
    if (byLed.length) {
      return byLed[0];
    }
    return null;
  }
  function findApioProject(dir) {
    try {
      if (fs.existsSync(nodePath.join(dir, 'apio.ini'))) {
        return dir;
      }
      var entries = fs.readdirSync(dir);
      for (var i = 0; i < entries.length; i++) {
        var sub = nodePath.join(dir, entries[i]);
        if (
          fs.statSync(sub).isDirectory() &&
          fs.existsSync(nodePath.join(sub, 'apio.ini'))
        ) {
          return sub;
        }
      }
    } catch (e) {
      /* ignore */
    }
    return null;
  }

  function testStatusUI(lines) {
    return (
      '<div class="wiz-spinner"></div>' +
      '<h2 class="wiz-title">' +
      gettextCatalog.getString('Testing your board') +
      '</h2>' +
      '<div class="wiz-status-list" id="wiz-test-status">' +
      lines +
      '</div>'
    );
  }
  var TEST_STEPS = ['find', 'fetch', 'build', 'upload'];
  function testLabel(key) {
    switch (key) {
      case 'find':
        return gettextCatalog.getString('Looking for a test example');
      case 'fetch':
        return gettextCatalog.getString('Downloading the example');
      case 'build':
        return gettextCatalog.getString('Building the bitstream');
      case 'upload':
        return gettextCatalog.getString('Uploading to the board');
    }
    return key;
  }
  function renderTestStatus(activeKey, doneKeys) {
    return TEST_STEPS.map(function (k) {
      var cls = 'wiz-status-line';
      if (doneKeys.indexOf(k) >= 0) {
        cls += ' ok';
      } else if (k === activeKey) {
        cls += ' active';
      }
      return '<div class="' + cls + '">' + testLabel(k) + '</div>';
    }).join('');
  }

  var STEP_TEST = {
    render: function () {
      return testStatusUI(renderTestStatus('find', []));
    },
    nextLabel: function () {
      return gettextCatalog.getString('Finish');
    },
    bind: function () {
      showNext(false);
      elBack.classList.add('wiz-hidden');
      elCancel.classList.add('wiz-hidden');
      runTest();
    },
  };

  //-- Temp directory of the fetched example (cleaned up when the test ends)
  var currentTempDir = null;
  function cleanupTemp() {
    try {
      if (currentTempDir) {
        fs.rmSync(currentTempDir, { recursive: true, force: true });
      }
    } catch (e) {
      /* ignore */
    }
    currentTempDir = null;
  }

  function setTestStatus(html) {
    var el = $id('wiz-test-status');
    if (el) {
      el.innerHTML = html;
    }
  }
  function testResult(html) {
    $id('wiz-body').innerHTML = '<div class="wiz-step">' + html + '</div>';
    elCancel.classList.remove('wiz-hidden');
  }
  function testFinishButton(label) {
    showNext(true);
    enableNext(true);
    setNextLabel(label || gettextCatalog.getString('Finish'));
  }
  function testRetryUI(message, log) {
    setBusy(false);
    cleanupTemp();
    testResult(
      '<div class="wiz-big-icon err">✕</div>' +
        '<h2 class="wiz-title">' +
        gettextCatalog.getString('Something went wrong') +
        '</h2>' +
        '<p class="wiz-text">' +
        esc(message) +
        '</p>' +
        (log
          ? '<p class="wiz-text" style="font-size:12px;opacity:.8">' +
            esc(String(log).slice(-220)) +
            '</p>'
          : '')
    );
    //-- Offer retry (Back to re-run) and Finish
    elBack.classList.remove('wiz-hidden');
    elBack.textContent = gettextCatalog.getString('Retry');
    testFinishButton(gettextCatalog.getString('Finish'));
  }

  function runTest() {
    setBusy(true);
    if (!S.board) {
      testRetryUI(gettextCatalog.getString('No board selected.'));
      return;
    }
    var board = S.board.name;
    var done = [];
    setTestStatus(renderTestStatus('find', done));

    execApio('examples list', function (err, out) {
      if (err) {
        testRetryUI(
          gettextCatalog.getString('Could not list the available examples.'),
          out
        );
        return;
      }
      var examples = parseExamplesForBoard(out, board);
      if (!examples.length) {
        noExamples();
        return;
      }
      var ex = pickBasicExample(examples);
      if (!ex) {
        noExamples();
        return;
      }
      done.push('find');
      setTestStatus(renderTestStatus('fetch', done));

      var dest = nodePath.join(
        os.tmpdir(),
        'icestudio-wizard-' + board + '-' + Date.now()
      );
      currentTempDir = dest;
      execApio(
        'examples fetch ' + board + '/' + ex + ' -d ' + quote(dest),
        function (err2, out2) {
          if (err2) {
            testRetryUI(
              gettextCatalog.getString('Could not download the test example.'),
              out2
            );
            return;
          }
          var proj = findApioProject(dest);
          if (!proj) {
            testRetryUI(
              gettextCatalog.getString(
                'The downloaded example could not be found.'
              ),
              out2
            );
            return;
          }
          done.push('fetch');
          setTestStatus(renderTestStatus('build', done));

          execApio('build -p ' + quote(proj), function (err3, out3) {
            if (err3) {
              testRetryUI(
                gettextCatalog.getString('The example failed to build.'),
                out3
              );
              return;
            }
            done.push('build');
            setTestStatus(renderTestStatus('upload', done));

            execApio('upload -p ' + quote(proj), function (err4, out4) {
              //-- Require apio's explicit "[SUCCESS]" banner: the exit code
              //-- alone is not reliable. Only a real programming run (board
              //-- actually connected) prints it; a missing/disconnected board
              //-- makes apio exit non-zero (e.g. "No matching serial device")
              //-- without the banner.
              var ok = !err4 && /\[\s*SUCCESS\s*\]/i.test(out4 || '');
              if (!ok) {
                testRetryUI(
                  gettextCatalog.getString(
                    'Could not program the board. Make sure it is connected and powered (and the drivers are installed), then try again.'
                  ),
                  out4
                );
                return;
              }
              //-- Which device did apio actually program? (the upload log has a
              //-- line "DEVICE [vid:pid] [bus] [manufacturer] [product] ...")
              var dm = (out4 || '').match(
                /DEVICE(?:\s+\[[^\]]*\]){3}\s+\[([^\]]+)\]/i
              );
              success(dm ? dm[1].trim() : '');
            });
          });
        }
      );
    });

    function noExamples() {
      setBusy(false);
      cleanupTemp();
      testResult(
        '<div class="wiz-big-icon ok">✓</div>' +
          '<h2 class="wiz-title">' +
          gettextCatalog.getString('All set!') +
          '</h2>' +
          '<p class="wiz-text">' +
          gettextCatalog.getString(
            'The selected board has no built-in test example, so we will stop here. Icestudio is configured and ready to use.'
          ) +
          '</p>'
      );
      testFinishButton(gettextCatalog.getString('Finish'));
    }
    function success(device) {
      setBusy(false);
      cleanupTemp();
      testResult(
        '<div class="wiz-big-icon ok">⚡</div>' +
          '<h2 class="wiz-title">' +
          gettextCatalog.getString('Look at your FPGA!') +
          '</h2>' +
          (device
            ? '<p class="wiz-text">' +
              gettextCatalog.getString(
                'Programmed <b>{{device}}</b> — it should be blinking now. 🎉',
                { device: esc(device) }
              ) +
              '</p>'
            : '<p class="wiz-text">' +
              gettextCatalog.getString(
                'The bitstream was uploaded — your board should be blinking now. 🎉'
              ) +
              '</p>') +
          '<p class="wiz-text">' +
          gettextCatalog.getString(
            'Setup is complete. Enjoy designing with Icestudio!'
          ) +
          '</p>'
      );
      testFinishButton(gettextCatalog.getString('Finish'));
    }
  }

  //========================================================================
  //-- Steps registry + boot
  //========================================================================
  var STEPS = [
    STEP_LANGUAGE,
    STEP_WELCOME,
    STEP_TOOLCHAIN,
    STEP_COLLECTIONS,
    STEP_BOARD,
    STEP_CONNECT,
    STEP_TEST,
  ];

  function init() {
    elBack = $id('wiz-back');
    elNext = $id('wiz-next');
    elCancel = $id('wiz-cancel');
    if (!elNext) {
      return;
    }
    //-- Localize the static footer buttons from wizard.html
    elCancel.textContent = gettextCatalog.getString('Cancel');
    elBack.textContent = gettextCatalog.getString('Back');
    elNext.addEventListener('click', onNextClick);
    elBack.addEventListener('click', function () {
      //-- "Retry" on the test step re-runs the test; otherwise go back.
      if (
        S.idx === STEPS.length - 1 &&
        elBack.textContent === gettextCatalog.getString('Retry')
      ) {
        elBack.textContent = gettextCatalog.getString('Back');
        goTo(S.idx); //-- re-render the test step (re-runs)
        return;
      }
      onBackClick();
    });
    elCancel.addEventListener('click', cancelWizard);
    goTo(0);
  }

  init();
})();

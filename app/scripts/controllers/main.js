"use strict";

angular
  .module("icestudio")
  .controller("MainCtrl", function ($scope, gettextCatalog, tools, utils) {
    alertify.defaults.movable = false;
    alertify.defaults.closable = false;
    alertify.defaults.transition = "fade";
    alertify.defaults.notifier.delay = 3;

    setTimeout(function () {
      var labels = {
        ok: gettextCatalog.getString("OK"),
        cancel: gettextCatalog.getString("Cancel"),
      };
      alertify.set("alert", "labels", labels);
      alertify.set("prompt", "labels", labels);
      alertify.set("confirm", "labels", labels);
    }, 100);

    /* If in package.json appears development:{mode:true}*/
    /* activate development tools */
    tools.ifDevelopmentMode();

    $(document).delegate(
      ".action-open-url-external-browser",
      "click",
      function (e) {
        e.preventDefault();
        utils.openUrlExternalBrowser($(this).prop("href"));
        return false;
      }
    );

  });


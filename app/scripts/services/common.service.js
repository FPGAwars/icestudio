'use strict';

angular.module('icestudio')
    .service('common', ['nodeFs', 'nodeGlob', 'window', 'utils',
      function(nodeFs, nodeGlob, window, utils) {

      this.project = {};
      this.projectName = '';
      this.breadcrumb = [ { id: '', name: '' } ];

      this.newProject = function(name) {
        this.updateProjectName(name);
        this.clearProject();
        
        alertify.success('New project ' + name + ' created');
      }

      this.openProject = function(filepath) {
        $.getJSON(filepath, function(project) {
          var name = utils.basename(filepath);
          this.updateProjectName(name);
          this.project = project;
          //loadGraph(p, true, true);
          alertify.success('Project ' + name + ' loaded');
        });
      }

      this.clearProject = function() {
        this.breadcrumb = [ { id: '', name: this.projectName }];
      }

      this.updateProjectName = function(name) {
        if (name) {
          this.projectName = name
          this.breadcrumb[0].name = name;
          window.title = 'Icestudio - ' + name;
        }
      }

    }]);

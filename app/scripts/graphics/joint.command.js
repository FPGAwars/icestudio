/*
Copyright (c) 2016-2019 FPGAwars
Copyright (c) 2013 client IO
*/

'use strict';

joint.dia.CommandManager = Backbone.Model.extend({

  defaults: {
    cmdBeforeAdd: null,
    cmdNameRegex: /^(?:add|remove|board|info|lang|change:\w+)$/
  },

  // length of prefix 'change:' in the event name
  PREFIX_LENGTH: 7,

  initialize: function (options) {

    _.bindAll(this, 'initBatchCommand', 'storeBatchCommand');

    this.paper = options.paper;
    this.graph = options.graph;

    this.reset();
    this.listen();
  },

  listen: function () {

    this.listenTo(this.graph, 'state', this.updateState, this);

    this.listenTo(this.graph, 'all', this.addCommand, this);

    this.listenTo(this.graph, 'batch:start', this.initBatchCommand, this);
    this.listenTo(this.graph, 'batch:stop', this.storeBatchCommand, this);
  },

  createCommand: function (options) {

    var cmd = {
      action: undefined,
      data: { id: undefined, type: undefined, previous: {}, next: {} },
      batch: options && options.batch
    };

    return cmd;
  },

  updateState: function (state) {
    this.state = state;
  },

  addCommand: function (cmdName, cell, graph, options) {

    if (cmdName === 'change:labels' ||
      cmdName === 'change:z') {
      return;
    }

    if (!this.get('cmdNameRegex').test(cmdName)) {
      return;
    }

    if (typeof this.get('cmdBeforeAdd') === 'function' && !this.get('cmdBeforeAdd').apply(this, arguments)) {
      return;
    }

    var push = _.bind(function (cmd) {

      this.redoStack = [];

      if (!cmd.batch) {
        this.undoStack.push(cmd);
        this.changesStack.push(cmd);
        this.triggerChange();
        this.trigger('add', cmd);
      } else {
        this.lastCmdIndex = Math.max(this.lastCmdIndex, 0);
        // Commands possible thrown away. Someone might be interested.
        this.trigger('batch', cmd);
      }

    }, this);

    var command;

    if (this.batchCommand) {
      // set command as the one used last.
      // in most cases we are working with same object, doing same action
      // etc. translate an object piece by piece
      command = this.batchCommand[Math.max(this.lastCmdIndex, 0)];

      // Check if we are start working with new object or performing different action with it.
      // Note, that command is uninitialized when lastCmdIndex equals -1. (see 'initBatchCommand()')
      // in that case we are done, command we were looking for is already set
      if (this.lastCmdIndex >= 0 && (command.data.id !== cell.id || command.action !== cmdName)) {

        // trying to find command first, which was performing same action with the object
        // as we are doing now with cell
        command = _.find(this.batchCommand, function (cmd, index) {
          this.lastCmdIndex = index;
          return cmd.data.id === cell.id && cmd.action === cmdName;
        }, this);

        if (!command) {
          // command with such an id and action was not found. Let's create new one
          this.lastCmdIndex = this.batchCommand.push(this.createCommand({ batch: true })) - 1;
          command = _.last(this.batchCommand);
        }
      }

    } else {

      // single command
      command = this.createCommand();
      command.batch = false;
    }

    // In a batch: delete an "add-*-remove" sequence if it is applied to the same cell
    if (cmdName === 'remove' && this.batchCommand && this.lastCmdIndex > 0) {
      for (var i = 0; i < this.lastCmdIndex; i++) {
        var prevCommand = this.batchCommand[i];
        if (prevCommand.action === 'add' && prevCommand.data.id === cell.id) {
          delete this.batchCommand;
          delete this.lastCmdIndex;
          delete this.batchLevel;
          return;
        }
      }
    }

    if (cmdName === 'add' || cmdName === 'remove') {

      command.action = cmdName;
      command.data.id = cell.id;
      command.data.type = cell.attributes.type;
      command.data.attributes = _.merge({}, cell.toJSON());
      command.options = options || {};

      return push(command);
    }

    if (cmdName === 'board' || cmdName === 'info' || cmdName === 'lang') {

      command.action = cmdName;
      command.data = cell.data;

      return push(command);
    }

    // `changedAttribute` holds the attribute name corresponding
    // to the change event triggered on the model.
    var changedAttribute = cmdName.substr(this.PREFIX_LENGTH);

    if (!command.batch || !command.action) {
      // Do this only once. Set previous box and action (also serves as a flag so that
      // we don't repeat this branche).
      command.action = cmdName;
      command.data.id = cell.id;
      command.data.type = cell.attributes.type;
      command.data.previous[changedAttribute] = _.clone(cell.previous(changedAttribute));
      command.options = options || {};
    }

    command.data.next[changedAttribute] = _.clone(cell.get(changedAttribute));

    return push(command);
  },

  // Batch commands are those that merge certain commands applied in a row (1) and those that
  // hold multiple commands where one action consists of more than one command (2)
  // (1) This is useful for e.g. when the user is dragging an object in the paper which would
  // normally lead to 1px translation commands. Applying undo() on such commands separately is
  // most likely undesirable.
  // (2) e.g When you are removing an element, you don't want all links connected to that element, which
  // are also being removed to be part of different command

  initBatchCommand: function () {


    if (!this.batchCommand) {

      this.batchCommand = [this.createCommand({ batch: true })];
      this.lastCmdIndex = -1;

      // batch level counts how many times has been initBatchCommand executed.
      // It is useful when we doing an operation recursively.
      this.batchLevel = 0;

    } else {

      // batch command is already active
      this.batchLevel++;
    }
  },

  storeBatchCommand: function () {


    // In order to store batch command it is necesary to run storeBatchCommand as many times as
    // initBatchCommand was executed
    if (this.batchCommand && this.batchLevel <= 0) {

      // checking if there is any valid command in batch
      // for example: calling `initBatchCommand` immediately followed by `storeBatchCommand`
      if (this.lastCmdIndex >= 0) {

        this.redoStack = [];

        this.undoStack.push(this.batchCommand);
        if (this.batchCommand && this.batchCommand[0] && this.batchCommand[0].action !== 'lang') {
          // Do not store lang in changesStack
          this.changesStack.push(this.batchCommand);
          this.triggerChange();
        }
        this.trigger('add', this.batchCommand);
      }

      delete this.batchCommand;
      delete this.lastCmdIndex;
      delete this.batchLevel;

    } else if (this.batchCommand && this.batchLevel > 0) {

      // low down batch command level, but not store it yet
      this.batchLevel--;
    }
  },

  revertCommand: function (command) {

    this.stopListening();

    var batchCommand;

    if (_.isArray(command)) {
      batchCommand = command;
    } else {
      batchCommand = [command];
    }

    for (var i = batchCommand.length - 1; i >= 0; i--) {

      var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);

      switch (cmd.action) {

        case 'add':
          if (cell) {
            cell.remove();
          }
          break;

        case 'remove':
          cmd.data.attributes.state = this.state;
          this.graph.addCell(cmd.data.attributes);
          break;

        case 'board':
          this.triggerBoard(cmd.data.previous);
          break;

        case 'info':
          this.triggerInfo(cmd.data.previous);
          break;

        case 'lang':
          this.triggerLanguage(cmd.data.previous);
          break;

        default:
          var data = null;
          var options = null;
          var attribute = cmd.action.substr(this.PREFIX_LENGTH);
          if (attribute === 'data' && cmd.options.translateBy) {
            // Invert relative movement
            cmd.options.ty *= -1;
            options = cmd.options;
          }
          if (attribute === 'deltas') {
            // Ace editor requires the next deltas to revert
            data = cmd.data.next[attribute];
          }
          else {
            data = cmd.data.previous[attribute];
          }
          if (cell) {
            cell.set(attribute, data, options);
            var cellView = this.paper.findViewByModel(cell);
            if (cellView) {
              cellView.apply({ undo: true, attribute: attribute });
            }
          }
          break;
      }
    }

    this.listen();
  },

  applyCommand: function (command) {

    this.stopListening();

    var batchCommand;

    if (_.isArray(command)) {
      batchCommand = command;
    } else {
      batchCommand = [command];
    }

    for (var i = 0; i < batchCommand.length; i++) {

      var cmd = batchCommand[i], cell = this.graph.getCell(cmd.data.id);

      switch (cmd.action) {

        case 'add':
          cmd.data.attributes.state = this.state;
          this.graph.addCell(cmd.data.attributes);
          break;

        case 'remove':
          cell.remove();
          break;

        case 'board':
          this.triggerBoard(cmd.data.next);
          break;

        case 'info':
          this.triggerInfo(cmd.data.next);
          break;

        case 'lang':
          this.triggerLanguage(cmd.data.next);
          break;

        default:
          var data = null;
          var options = null;
          var attribute = cmd.action.substr(this.PREFIX_LENGTH);
          if (attribute === 'data' && cmd.options.translateBy) {
            cmd.options.ty *= -1;
            options = cmd.options;
          }
          data = cmd.data.next[attribute];
          if (cell) {
            cell.set(attribute, data, options);
            var cellView = this.paper.findViewByModel(cell);
            if (cellView) {
              cellView.apply({ undo: false, attribute: attribute });
            }
          }
          break;
      }
    }

    this.listen();
  },

  undo: function () {

    var command = this.undoStack.pop();
    if (command) {
      this.revertCommand(command);
      this.redoStack.push(command);
      this.changesStack.pop();
      this.triggerChange();
    }
  },


  redo: function () {

    var command = this.redoStack.pop();

    if (command) {
      this.applyCommand(command);
      this.undoStack.push(command);
      if (!(command[0] && command[0].action === 'lang')) {
        // Avoid lang changes
        this.changesStack.push(command);
      }
      this.triggerChange();
    }
  },

  cancel: function () {

    if (this.hasUndo()) {

      this.revertCommand(this.undoStack.pop());
      this.redoStack = [];
    }
  },

  reset: function () {

    this.undoStack = [];
    this.redoStack = [];

    this.changesStack = [];
  },

  hasUndo: function () {

    return this.undoStack.length > 0;
  },

  hasRedo: function () {

    return this.redoStack.length > 0;
  },

  triggerChange: function () {
    var currentUndoStack = _.clone(this.changesStack);
    $(document).trigger('stackChanged', [currentUndoStack]);
  },

  triggerBoard: function (board) {
    $(document).trigger('boardChanged', [board]);
  },

  triggerInfo: function (info) {
    $(document).trigger('infoChanged', [info]);
  },

  triggerLanguage: function (lang) {
    $(document).trigger('langChanged', [lang]);
  }

});

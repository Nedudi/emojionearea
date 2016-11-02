define([
  'jquery'
],
function($) {
  return function(self, editor, event) {
    self.undoStack = [];
    self.redoStack = [];

    self.clearHistory = function() {
      self.undoStack.length = 0;
      self.redoStack.length = 0;
    };

    self.onHistoryChange = function() {
      self.addToUndoStack({
        html: self.editor[0].innerHTML,
        selection: saveSelection(editor[0])
      });
      self.redoStack.length = 0;
      trigger(self, 'realtimechange', [editor]);
    };

    self.addToUndoStack = function(data) {
      self.undoStack.push(data);
    };

    self.addToRedoStack = function(data) {
      self.undoStack.push(data);
    };

    self.undo = function() {
      if (self.undoStack.length) {
        self.redoStack.push(self.undoStack.pop());
        if (self.undoStack.length) {
          var data = self.undoStack[self.undoStack.length - 1];
          self.editor[0].innerHTML = data.html;
          restoreSelection(editor[0], data.selection);
          trigger(self, 'realtimechange', [editor]);
        }
      }
    };

    self.redo = function() {
      if (self.redoStack.length) {
        var data = self.redoStack[self.redoStack.length - 1];
        self.editor[0].innerHTML = data.html;
        restoreSelection(editor[0], data.selection);
        self.undoStack.push(self.redoStack.pop());
        trigger(self, 'realtimechange', [editor]);
      }
    };

    self.clear = function() {
      self.onHistoryChange();
    };

    self.reset = function() {
      self.clearHistory();
    };

    return self;
  }
});


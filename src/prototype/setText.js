define([
    'jquery',
    'function/emojioneReady',
    'function/htmlFromText',
    'function/textFromHtml',
    'function/trigger',
    'function/calcButtonPosition',
    'prototype/var/EmojioneArea',
    'function/linkify'
],
function($, emojioneReady, htmlFromText, trigger, calcButtonPosition, EmojioneArea) {
    EmojioneArea.prototype.setText = function (str) {
        var self = this;
        emojioneReady(function () {
            self.editor.html(htmlFromText(str, self));
            self.content = self.editor.html();
            linkify(self, self.editor, {})
            setTimeout(function(){
              //trigger(self, 'change', [self.editor]);
              trigger(self, 'init', [self.editor]);
            },0)

            calcButtonPosition.apply(self);
        });
        return self;
    }
});
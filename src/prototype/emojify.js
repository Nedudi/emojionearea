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
    EmojioneArea.prototype.emojify = function (str) {
        var self = this;
        //emojioneReady(function () {
            var out = htmlFromText(str, self);
            //self.content = self.editor.html();
            //linkify(self, self.editor, {})

        //});
        return out;
    }
});
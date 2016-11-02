define([
    'jquery',
    'prototype/var/EmojioneArea',
    'prototype/var/EmojioneAreaEmojify',
    'var/getDefaultOptions',
    'prototype/on',
    'prototype/off',
    'prototype/trigger',
    'prototype/setFocus',
    'prototype/setText',
    'prototype/getText',
    'prototype/showPicker',
    'prototype/hidePicker',
    'prototype/emojify'
],
function($, EmojioneArea, getDefaultOptions) {
    $.fn.emojioneArea = function(options) {
        return this.each(function() {
            if (!!this.emojioneArea) return this.emojioneArea;
            $.data(this, 'emojioneArea', this.emojioneArea = new EmojioneArea($(this), options));
            return this.emojioneArea;
        });
    };

    $.fn.emojioneAreaEmojify= function(options) {
        return this.each(function(element) {
            if (!!this.emojioneAreaEmojify) return this.emojioneAreaEmojify;
            $.data(this, 'emojioneAreaEmojify', this.emojioneAreaEmojify = new EmojioneAreaEmojify($(this), options));
            return this.emojioneAreaEmojify;
        });
    };

    $.fn.emojioneArea.defaults = getDefaultOptions();
});
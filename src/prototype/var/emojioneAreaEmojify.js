define([
    'function/emojioneReady',
    'function/htmlFromText',
    'function/linkify'
],
function(emojioneReady, htmlFromText) {
    return function(element, options) {
        var self = this;
        self.emojiTemplate = '<img alt="{alt}" class="emojione' + (self.sprite ? '-{uni}" src="' + blankImg + '"/>' : 'emoji" src="{img}"/>');
        loadEmojione(options);
        emojioneReady(function() {
            element.html(htmlFromText(element.html(), self));
            linkify(false,element);
        });
    };
});
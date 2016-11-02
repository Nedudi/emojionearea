define([
  'jquery'
],
function($) {
  return function(instance, editor, event) {

    var hasUpdatedLinks = false
    var textbox = editor[0];
    var regex = /((((http|https):\/\/))(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?)|(\B#(?:\[[^\]]+\]|\S+))|(\B@(?:\[[^\]]+\]|\S+))/i;
    textbox._previousTextContent = textbox._previousTextContent || '';

    var createLink = function(matchedTextNode){
      var el = document.createElement("a");
      el.href = matchedTextNode.data;
      el.appendChild(matchedTextNode);

      return el;
    };

    var storeContent = function(){
      textbox._previousTextContent = textbox.innerText;
    };

    var isSameAsPreviousContent = function(){
      return textbox._previousTextContent.trim() === textbox.innerText.trim();
    };

    var shouldLinkifyContents = function(el){
      return el.tagName != "A";
    };

    var surroundInElement = function(el, regex, surrounderCreateFunc, shouldSurroundFunc) {

      var child = el.lastChild;
      while (child) {
        if (child.nodeType == 1 && shouldSurroundFunc(el)) {
            surroundInElement(child, regex, createLink, shouldSurroundFunc);
        } else if (child.nodeType == 3 && shouldSurroundFunc(el)) {
            surroundMatchingText(child, regex, surrounderCreateFunc);
        }
        child = child.previousSibling;
      }
    };

    var surroundMatchingText = function(textNode, regex, surrounderCreateFunc) {


      var parent = textNode.parentNode;
      var result, surroundingNode, matchedTextNode, matchLength, matchedText;
      while ( textNode && (result = regex.exec(textNode.data)) ) {
        matchedTextNode = textNode.splitText(result.index);
        matchedText = result[0];
        matchLength = matchedText.length;
        textNode = (matchedTextNode.length > matchLength) ? matchedTextNode.splitText(matchLength) : null;
        surroundingNode = surrounderCreateFunc(matchedTextNode.cloneNode(true));
        parent.insertBefore(surroundingNode, matchedTextNode);
        parent.removeChild(matchedTextNode);
        hasUpdatedLinks = true;
      }
    };

    var clearInvalidLinks = function(textbox, regex){
      var aNodes  = textbox.getElementsByTagName('a');
      var linksToRemove = [];
      for(var a=0; a<aNodes.length;a++){
        var regexResult = regex.exec(aNodes[a].innerText);
        var validLink = !!(regexResult && regexResult[0] && regexResult[0] === aNodes[a].innerText);
          linksToRemove.push(aNodes[a]);
      }

      for(var i=0; i<linksToRemove.length;i++){
        var textNode = document.createTextNode(linksToRemove[i].innerText);
        linksToRemove[i].parentNode.insertBefore(textNode, linksToRemove[i]);
        linksToRemove[i].parentNode.removeChild(linksToRemove[i]);
        hasUpdatedLinks = true;
      }
      textbox.normalize();
    };

    var updateLinks = function() {
      var savedSelection = saveSelection(textbox);
      clearInvalidLinks(textbox, regex);
      surroundInElement(textbox, regex, createLink, shouldLinkifyContents);
      if(hasUpdatedLinks){
        restoreSelection(textbox, savedSelection);
      }
    };

    if(instance && editor){
      if(
        event.keyCode === 13 || //enter
        event.keyCode === 32 || //space
        event.keyCode === 8  || // backspace
        event.keyCode === 46 // del
      ){
        instance.onHistoryChange();
      } else if(isSameAsPreviousContent()){
        storeContent();
      } else {
        storeContent();
        window.clearTimeout(textbox._updateEmojiEditorLinkTimeout);
        textbox._updateEmojiEditorLinkTimeout = setTimeout(function(){
          if(
            !event.ctrlKey &&
            event.keyCode !== 90 &&
            event.keyCode !== 91  &&
            event.keyCode !== 16
          ) {
            instance.onHistoryChange();
          }
          updateLinks();
          storeContent();
        }, 200);
      }
    } else {
      surroundInElement(textbox, regex, createLink, shouldLinkifyContents);
    }
  }
});


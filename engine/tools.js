'use strict';

var VNE = VNE || {};

VNE.Tool = {
  calcSize: function (size) {
    var ratio = VNE.settings.screenRatio;
    var newSize = {
      x: VNE.Tool.calcRelativeSize(size.x, ratio[0]),
      y: VNE.Tool.calcRelativeSize(size.y, ratio[1])
    };
    return newSize;
  },
  calcRelativeSize: function (size, total) {
    return size / total * 100;
  },
  parseText: function(text) {
    var newText = text
    var replaceData = newText.match(/\{(.*?)\}/g);
    if (VNE.settings.useBrackets) {
      replaceData = newText.match(/\[(.*?)\]/g);
    }
    if (replaceData) {
      $.each(replaceData, function (index, value) {
        var dataKey = value.substring(1, value.length -1);
        if (VNE.settings.storage[dataKey] === undefined) {
          throw "Variable [" + dataKey + "] is not defined in settings. Please check for typos in Room " + VNE.currentSection + " action " + VNE.currentDialogue + ".";
        }
        newText = newText.replace(value, VNE.settings.storage[dataKey]);
      });
    }
    return newText;
  },
  save: function(slot) {
    var data = {
      storage: VNE.settings.storage,
      inDialogue: VNE.inDialogue,
      currentRoom: VNE.currentRoom,
      currentSection: VNE.currentSection,
      currentDialogue: VNE.currentDialogue,
      currentVoice: VNE.currentVoice,
      characters: VNE.characters
    };
    // Add Slot here
    localStorage.VNSaves = JSON.stringify(data);
  },
  load: function (slot) {
    var data = JSON.parse(localStorage.VNSaves);
    VNE.settings.storage = data.storage;
    VNE.inDialogue = data.inDialogue;
    VNE.currentRoom = data.currentRoom;
    VNE.currentSection = data.currentSection;
    VNE.currentDialogue = data.currentDialogue;
    VNE.currentVoice = data.currentVoice;
    VNE.characters = data.characters;
  }
};
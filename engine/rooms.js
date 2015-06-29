'use strict';

var VNE = VNE || {};

VNE.Room = {
  
  enter: function (newSection) {
    var room = VNE.sections[newSection];
    VNE.currentSection = newSection;
    VNE.StatusLine.set();
    VNE.Room.clearMenu();
    VNE.currentDialogue = 0;
    if (room.type === 'menu') {
      VNE.Room.renderMenu(room);
    } else if (room.type === 'dia') {
      VNE.Room.renderDialogue(room)
    }
  },
  renderMenu: function (room) {
    VNE.Dialogue.room(['', room.background], true);
    $.each(room.elements, function (index, element) {
      VNE.Element.render[element.type](element);
    });
  },
/*  setBackdrop: function (room, oldRoom) {
    if (oldRoom.background) {
      VNE.backdrop.removeClass(oldRoom.background);
    }
    if (room.background) {
      VNE.backdrop.addClass(room.background);
    }
  },*/
  renderDialogue: function (room) {
    VNE.inDialogue = true;
    VNE.Dialogue[room.dialogue[VNE.currentDialogue][0]](room.dialogue[VNE.currentDialogue]);
  },
  nextDialogue: function () {
    var dialogue = VNE.sections[VNE.currentSection].dialogue;
    if (VNE.currentDialogue < dialogue.length - 1 ) {
      VNE.currentDialogue = VNE.currentDialogue + 1;
      VNE.Dialogue[dialogue[VNE.currentDialogue][0]](dialogue[VNE.currentDialogue]);
    } else {
      //End dialogue... 
    }
  },
  clearMenu: function () {
    VNE.menuLayer.empty();
  },
  showCharacters: function () {
    var charEl;
    var charasize;
    VNE.castContainer.html('');
    VNE.charactersEl = {};
    $.each(VNE.characters, function(name) {
      charEl = $('<div>').addClass('full-body-character').addClass(name);
      VNE.charactersEl[name] = charEl;
      charasize = VNE.Tool.calcSize(VNE.characters[name].info.size);
      charEl.css({
        height: charasize.y + '%',
        width: charasize.x + '%',
        transform: VNE.characters[name].facing === 'flip' ? 'scaleX(-1)' : 'none',
        left: VNE.characters[name].position + '%'
      });
      VNE.castContainer.append(charEl);
    });
  },
  showBackdrop: function () {
    VNE.backdrop.attr('class', 'room-backdrop');
    if (VNE.currentRoom) {
      VNE.backdrop.addClass(VNE.currentRoom);
    }
  }
};
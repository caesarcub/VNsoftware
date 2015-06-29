'use strict';

var VNE = VNE || {};

VNE.Dialogue = {
  /* Show Action
   *
   *  ['show', <characterKey>, <placement>, <flipped>]
   *
   *    <characterKey> = The Key for the character in question.-
   *    <placement> = Defined in system, usually 'left' 'right' and 'center'
   *    <flipped> = To Mirror the image horizontally, use 'flip' here, otherwise leave empty.
   */
  show: function (action, isNotDialogue) {
    var name = action[1];
    var position;
    var chara;
    var charaEl
    var charasize;
    if (!VNE.characters[name]) {
      VNE.characters[name] = {};
      chara = VNE.characters[name];
      chara.info = VNE.cast[name];
      charaEl = $('<div>').addClass('full-body-character').addClass(name);
      VNE.charactersEl[name] = charaEl;

      if (action[2]) {
        position = action[2];
      } else {
        position = VNE.settings.defaultPosition;
      }

      charasize = VNE.Tool.calcSize(VNE.characters[name].info.size);
      charaEl.css({
        height: charasize.y + '%',
        width: charasize.x + '%',
        transform: action[3] === 'flip' ? 'scaleX(-1)' : 'none',
        left: position === 'right' ? 100 + charasize.x + '%' : -charasize.x + '%'
      })
      VNE.castContainer.append(charaEl);
    }
    charasize = VNE.Tool.calcSize(VNE.characters[name].info.size);
    VNE.characters[name].position = VNE.settings.positions[action[2]] - (charasize.x / 2);
    VNE.characters[name].facing = action[3] || null;
    VNE.charactersEl[name].animate({
      left: VNE.settings.positions[action[2]] - (charasize.x / 2) + '%'
    }, 1000, function () {
      if (!isNotDialogue) {
        VNE.Room.nextDialogue();
      }
    });
  },
  /* Hide Action
   *
   *  ['hide', <characterKey>, <direction>]
   *
   *    <characterKey> = The Key for the character in question.-
   *    <direction> = In which direction the character exits the screen.
   */
   hide: function(action) {
    var name = action[1];
    var chara;
    var charaEl;
    var charasize;
    if (VNE.characters[name]) {
      charasize = VNE.Tool.calcSize(VNE.characters[name].info.size);
      charaEl = VNE.charactersEl[name];
      chara = VNE.characters[name];
      charaEl.animate({
        left: action[2] === 'left' ? -charasize.x + '%' : '100%'
      }, 1000, function() {
        VNE.charactersEl[name].remove();
        delete VNE.characters[name];
        delete VNE.charactersEl[name];
        VNE.Room.nextDialogue();
      });
    } else {
      VNE.Room.nextDialogue();
    }
  },
  clearCharacters: function (action) {
    VNE.castContainer.fadeOut(500, function () {
      VNE.castContainer.html('');
      VNE.characters = {};
      VNE.charactersEl = {};
      VNE.castContainer.show();
      VNE.Room.nextDialogue();
    });
  },
  /* Voice Action
   *  
   *  Voice Sets the color and portrait of the character to the one selected.
   *
   *  ['voice', <characterKey>]
   *
   *    <characterKey> = The Key for the character in question.
   */
  voice: function (action) {
    var name = action[1];
    var color = VNE.cast[name].color || '#fff';
    VNE.dialogueTextBox.attr('class', 'dialogue-text-box');
    VNE.dialogueTextBox.addClass(name);
    VNE.dialogueTextBox.css({color: color});
    VNE.Room.nextDialogue();
    VNE.currentVoice = VNE.cast[name];
    if (VNE.portraitBox) {
      VNE.portraitBox.attr('class', 'portrait-container');
      VNE.portraitBox.addClass(name);
    }
    if (VNE.nameText) {
      VNE.nameText.text(VNE.Tool.parseText(VNE.cast[name].name)).css({color: color});
    }
    // Add Portrait code here
  },
  /* Continue
   *
   * Goes to the next dialogue action. Used when options have no consequences.
   *
   * ['continue']
   *
   */
  continue: function (action) {
    VNE.Room.nextDialogue();
  },
  /* Wait Action
   *  
   *  Waits the selected time before continuing with the dialogue.
   *
   *  ['wait', <miliseconds>]
   *
   *    <miliseconds> = The Waiting time.
   */
  wait: function (action) {
    setTimeout(function () {
      VNE.Room.nextDialogue();
    }, action[1]);
  },
  /* Say Action
   *  
   *  ['say', <Text>]
   *
   *    <Text> = The text to be said. Use Voice to define who is saying this text.
   */
  say: function (action) {
    VNE.dialogueTextBox.text('');
    VNE.dialogueBox.show();
    VNE.inDialogue = true;
    var displayText = VNE.Tool.parseText(action[1])
    var lineLength = displayText.length;
    var shownText = 0;
    var writeText = setInterval(function() {
      var text ="";
      if (VNE.settings.useNameInText && VNE.currentVoice) {
        text = VNE.Tool.parseText(VNE.currentVoice.name) + ": "
      }
      text = text + displayText.substr(0, shownText);
      VNE.dialogueTextBox.text(text);
      shownText = shownText + 1;
      if (shownText > lineLength) {
        clearInterval(writeText);
        //VNE.dialogueBox.off('click.speed');
        VNE.dialogueTextShield.show();
      }
    }, VNE.settings.textSpeed || 20);
    // Once text is rendered
  },

  /* Say Action
   *  
   *  ['say', <Extra>, <Text>]
   *
   *    <Extra> = Can have three values, 'start', 'continue', 'finish'
   *       start = creates a new unfinished message;
   *       continue = adds extra text to a message;
   *       finish = ends the message and shows the NEXT button.-
   *    <Text> = The text to be said. Use Voice to define who is saying this text.
   */
  sayPart: function (action) {
    if (action[1] === 'start') {
      VNE.dialogueTextBox.text('');
    }
    VNE.dialogueBox.show();
    VNE.inDialogue = true;
    var displayText = VNE.Tool.parseText(action[2])
    var lineLength = displayText.length;
    var shownText = 0;
    var setFlag = false;
    var oldText = VNE.dialogueTextBox.text();
    var writeText = setInterval(function() {
    var text ="";
      if (action[1] !== 'start') {
        if (!setFlag) {
          setFlag = true;
          shownText = text.length;
        }
        text = oldText;
      } else if (VNE.settings.useNameInText && VNE.currentVoice) {
        text = VNE.Tool.parseText(VNE.currentVoice.name) + ": "
      }
      text = text + displayText.substr(0, shownText);
      VNE.dialogueTextBox.text(text);
      shownText = shownText + 1;
      if (shownText > lineLength) {
        clearInterval(writeText);
        if (action[1] === 'finish') {
          VNE.dialogueTextShield.show();
        } else {
          VNE.Room.nextDialogue();
        }
      }
    }, VNE.settings.textSpeed || 20);
  },

  jump: function (action) {
    VNE.inDialogue = false;
    VNE.Room.enter(action[1]);
  },

  choose: function (action) {
    VNE.Element.render.chooseBox(action);
  },

  set: function (action) {
    var storageName = action[1]
    if (VNE.settings.storage[storageName] !== undefined) {
      VNE.settings.storage[storageName] = action[2];
    } else {
      alert("Error found, check console.");
      throw "Variable [" + action[1] + "] is not defined in settings. Please check for typos in Room " + VNE.currentSection + " action " + VNE.currentDialogue + ".";
    }
    VNE.Room.nextDialogue();
  },
  add: function (action) {
    var storageName = action[1];
    if (VNE.settings.storage[storageName] !== undefined) {
      VNE.settings.storage[storageName] = VNE.settings.storage[storageName] + action[2];
    } else {
      alert("Error found, check console.");
      throw "Variable [" + action[1] + "] is not defined in settings. Please check for typos in Room " + VNE.currentSection + " action " + VNE.currentDialogue + ".";
    }
    VNE.Room.nextDialogue();
  },
  input: function (action) {
    var settings = action[1];
    if (settings.type === 'text') {
      VNE.Element.render.inputText(settings);
    }
  },
  room: function (action, isMenuBackground) {
    var fadRoom;
    var callback = function () {
      VNE.currentRoom = action[1];
      if (!isMenuBackground) {
        VNE.Room.nextDialogue();
      }
    };
    if (VNE.currentRoom) {
      fadRoom = $('<div>').addClass('fade-out-backdrop').addClass(VNE.currentRoom);
      fadRoom.insertAfter(VNE.backdrop);
      VNE.backdrop.removeClass(VNE.currentRoom);
      VNE.backdrop.addClass(action[1]);
      fadRoom.fadeOut(500, function () {
        fadRoom.remove();
        callback();
      });
    } else {
      VNE.backdrop.addClass(action[1]);
      callback();
    }
  },
  check: function (action) {
    var storageName = action[1]
    if (VNE.settings.storage[storageName] !== undefined) {
      if (VNE.settings.storage[storageName] === action[2]) {
        VNE.Dialogue[action[3][0]](action[3]);
      } else {
        VNE.Room.nextDialogue();
      }
    } else {
      alert("Error found, check console.");
      throw "Variable [" + action[1] + "] is not defined in settings. Please check for typos in Room " + VNE.currentSection + " action " + VNE.currentDialogue + ".";
    }
  },
  /*
   * Changes the character clothing.
   *
   * ['dress', <character>, <clothes>];
   *
   *   <clothes> can be null to show default version of the character again.
   */
  dress: function (action) {
    var name = action[1];
    var style;
    var currentClass;
    var newClothes;
    var dressUp = function () {
      style = VNE.charactersEl[name].attr('style');
      currentClass = VNE.charactersEl[name].attr('class');
      newClothes = $('<div>')
        .addClass(currentClass)
        .addClass('dress-fade')
        .attr('style', style);
      VNE.castContainer.append(newClothes);
      VNE.charactersEl[name]
        .attr('class', 'full-body-character')
        .addClass(name)
        .addClass(action[2])
        .hide().fadeIn(500);
      newClothes.fadeOut(500, function () {
        newClothes.remove();
        VNE.Room.nextDialogue();
      });
    };
    if (!VNE.characters[name]) {
      throw "Character " + name + "is not shown in the screen. Please chek for errors in Room " + VNE.currentSection + " action " + VNE.currentDialogue + ".";
     //VNE.Dialogue.show(['', name, 'left'], true);
    }
    dressUp();
  },

  loadGame: function (slot) {
    VNE.Tool.load(slot);
    // check this if there are non-dialogue save points
    VNE.Room.renderDialogue(VNE.sections[VNE.currentSection]);
    VNE.Room.showCharacters();
    VNE.Room.showBackdrop();
  },
  saveGame: function (slot) {
    VNE.Tool.save(slot);
  },

  unlockables: function () {
    VNE.Element.render.unlockables();
  },

  unlock: function (action) {
    VNE.unlockables[action[1]] = true;
    localStorage.unlockables = JSON.stringify(VNE.unlockables);
    VNE.Room.nextDialogue();
  },

  resetUnlock: function (action) {
    VNE.Dialogue.createUnlocks();
    localStorage.unlockables = JSON.stringify(VNE.unlockables);
    VNE.Dialogue.jump(['jump', VNE.settings.startSection]);
  },

  createUnlocks: function () {
    VNE.unlockables = {};
    $.each(VNE.settings.unlockablesList, function(index, value) {
      VNE.unlockables[value] = false;
    });
  },

  showUnlockable: function (action) {
    var unlockableShield = $('<div>').addClass('full-screen-shield').addClass(action[1]).hide();
    VNE.menuLayer.append(unlockableShield);
    unlockableShield.fadeIn(500);
    unlockableShield.on('click', function () {
      unlockableShield.fadeOut(500, function() {
        unlockableShield.remove();
      });
    });
  },
  endGame: function (action) {
    var unlockableShield = $('<div>').addClass('full-screen-shield');
    VNE.menuLayer.append(unlockableShield);
    unlockableShield.on('click', function () {
      unlockableShield.remove();
      VNE.Dialogue.jump(['jump', VNE.settings.startSection]);
    });
  }
};
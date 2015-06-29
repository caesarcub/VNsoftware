'use strict';

var VNE = VNE || {};

VNE.Element = {
  render: {
    button: function (configuration) {
      var newButton = $('<div>');
      var position = VNE.Tool.calcSize(configuration.position);
      var size = VNE.Tool.calcSize(configuration.size);
      newButton.text(configuration.value);
      VNE.menuLayer.append(newButton);
      newButton.addClass(configuration.styles ? configuration.styles : 'default-button');
      newButton.css({
        top: configuration.positionAlignment === 'center' ? position.y - (size.y/2) + '%' : position.y + '%',
        left: configuration.positionAlignment === 'center' ? position.x - (size.x/2) + '%' : position.x + '%',
        height: configuration.autoSize ? 'auto' : size.y + '%',
        width: size.x + '%'
      });
      newButton.on('click', function () {
        VNE.Dialogue[configuration.action[0]](configuration.action);
      });
    }, 
    dialogueBox: function () {
      var dialogueBackdrop = $('<div>').addClass('dialogue-backdrop');
      var nextButton = $('<div>').addClass('dialogue-next-button').text(VNE.settings.nextButton || '▼');
      VNE.dialogueTextShield = $('<div>').addClass('dialogue-text-shield').css({display: 'none'});
      VNE.dialogueTextBox = $('<div>').addClass('dialogue-text-box');
      VNE.dialogueBox = $('<div>').css({'display': 'none'}).addClass('dialogue-box');
      VNE.dialogueBox.append(dialogueBackdrop);
      if (VNE.settings.showNamePortrait) {
        VNE.dialogueBox.append(VNE.Element.render.namePortrait());
      }
      if (VNE.settings.showPortrait) {
        VNE.dialogueBox.append(VNE.Element.render.portrait());
      }
      VNE.dialogueBox.append(VNE.dialogueTextBox);
      VNE.dialogueTextShield.append(nextButton)
      VNE.dialogueBox.append(VNE.dialogueTextShield);
      VNE.view.append(VNE.dialogueBox);
      VNE.dialogueTextShield.on('click', function(e) {
        VNE.dialogueTextShield.hide();
        VNE.dialogueBox.hide();
        VNE.Room.nextDialogue();
      });
    },
    portrait: function () {
      var portraitBackdrop = $('<div>').addClass('portrait-backdrop');
      VNE.portraitBox = $('<div>').addClass('portrait-container');
      VNE.portraitImage = $('<div>').addClass('portrait-picture');
      VNE.portraitBox.append(portraitBackdrop).append(VNE.portraitImage);
      return VNE.portraitBox;
    },
    namePortrait: function () {
      var nameBackdrop = $('<div>').addClass('name-portrait-backdrop');
      VNE.nameBox = $('<div>').addClass('name-portrait-container');
      VNE.nameText = $('<div>').addClass('name-portrait-text');
      VNE.nameBox.append(nameBackdrop).append(VNE.nameText);
      return VNE.nameBox;
    },
    chooseBox: function (settings) {
      var options = settings[1].options;
      var optionElement;
      var choicesContainer = $('<div>').addClass('choices-container');
      var optionTitle = $('<div>').addClass('choice-title').text(VNE.Tool.parseText(settings[1].title));
      VNE.choiceMenuContainer = $('<div>').addClass('choice-menu');
      VNE.choiceMenu = $('<ul>').addClass('choice-list');
      VNE.choiceMenuContainer.append('<div class="choice-backdrop">');
      VNE.choiceMenuContainer.append(choicesContainer);
      choicesContainer.append(optionTitle);
      choicesContainer.append(VNE.choiceMenu);
      VNE.view.append(VNE.choiceMenuContainer);

      $.each(options, function (index, option) {
        optionElement = $('<li>').text(VNE.Tool.parseText(option.label));
        VNE.choiceMenu.append(optionElement);
        optionElement.on('click', function () {
          VNE.choiceMenuContainer.remove();
          VNE.Dialogue[option.action[0]](option.action);
        })
      });

      VNE.choiceMenuContainer.height(choicesContainer.height());
      // Add class AFTER render.-
      choicesContainer.css({
        'max-height': '100%',
        'overflow-y': 'auto'
      })
    },
    inputText: function (settings) {
      var inputBox = $('<div>').addClass('input-box');
      var inputTitle = $('<div>').addClass('input-title').text(VNE.Tool.parseText(settings.label));
      var inputText = $('<input type="text">').addClass('input-box-text').val(VNE.Tool.parseText(settings.default));
      var submitButton = $('<div>').addClass('input-submit-button').text(settings.submit);
      var inputContainer = $('<div>').addClass('input-container')
        .append(inputTitle)
        .append(inputText)
        .append(submitButton);
      if (settings.cssClass) {
        inputBox.addClass(settings.cssClass);
      }
      inputText.attr('maxlength', settings.maxlength || 255);
      var inputBackdrop = $('<div>').addClass('input-backdrop');
      inputBox.append(inputBackdrop).append(inputContainer);
      VNE.view.append(inputBox);
      inputBox.height(inputContainer.height());
      inputText.click().focus();
      submitButton.on('click', function () {
        if (inputText.val().trim().length > 0) {
          VNE.settings.storage[settings.storage] = inputText.val().trim();//.replace(/[\{|\}]/g, '');
          inputBox.remove();
          VNE.Room.nextDialogue();
        }
      })
    },
    unlockables: function () {
      var unlockables = $('<div>').addClass('unlockables');
      var unlock;
      var page = 1;
      var totalPages = Math.ceil(VNE.settings.unlockablesList.length / 6);
      var prevPage = $('<div>').text('<')
        .addClass('unlockable-navigation')
        .addClass('previous')
        .addClass('disabled');
      var nextPage = $('<div>').text('>')
        .addClass('next')
        .addClass('unlockable-navigation');
      if (totalPages < 2) {
        nextPage.addClass('disabled');
      }
      VNE.menuLayer.empty();
      var drawUnlockables = function (start) {
        var startDrawing = (page - 1) * 6;
        var stopDrawing = startDrawing + 6;
        var currentDrawing = 0;
        unlockables.empty();
        $.each(VNE.settings.unlockablesList, function (index, value) {
          if (currentDrawing >= startDrawing && currentDrawing < stopDrawing) {
            unlock = $('<div>').addClass('unlock');
            if (VNE.unlockables[value]) {
              unlock.addClass(value);
              unlock.on('click', function () {
                VNE.Dialogue.showUnlockable(['showUnlockable', value]);
              });
            } else {
              unlock.addClass('locked');
            }
            unlockables.append(unlock);
          }
          currentDrawing = currentDrawing + 1;
        });
      };
      drawUnlockables();
      nextPage.on('click', function () {
        console.log(page, totalPages)
        if (page < totalPages) {
          page = page + 1;
          prevPage.removeClass('disabled');
          drawUnlockables();
        }
        if (page === totalPages) {
          nextPage.addClass('disabled');
        }
      });
      prevPage.on('click', function () {
        if (page > 1) {
          page = page -1;
          nextPage.removeClass('disabled');
          drawUnlockables();
        }
        if (page === 1) {
          prevPage.addClass('disabled');
        }
      });
      VNE.menuLayer.append(unlockables);
      VNE.menuLayer.append(prevPage);
      VNE.menuLayer.append(nextPage);
      VNE.Element.render.button({
        type: 'button',
        value: 'Back',
        action: ['jump', VNE.settings.startSection],
        styles: null,
        position: {x: 1520, y: 900},
        size: {x: 300, y: 50},
        autoSize: true,
        positionAlignment: 'corner'
      });
      VNE.Element.render.button({
        type: 'button',
        value: 'Reset',
        action: ['resetUnlock'],
        styles: null,
        position: {x: 1150, y: 900},
        size: {x: 300, y: 50},
        autoSize: true,
        positionAlignment: 'corner'
      });
    }
  }
};
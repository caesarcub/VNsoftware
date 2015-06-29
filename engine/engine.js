"use strict";

var VNE = VNE || {};

// Data
VNE.settings;
VNE.sections;
VNE.cast;
VNE.roomList;

// unlockables
VNE.unlockables;

// All the data that must be saved.-
VNE.inDialogue; // Boolean - Are we in the middle of a dialogue?
VNE.currentSection; // Room currently in
VNE.currentDialogue; // Position in the Dialogue of the current room
VNE.currentVoice; // Character currently speaking
VNE.characters;
VNE.currentRoom;

// Elements
VNE.container; // Contains the APP
VNE.view; // The Screen
VNE.backdrop; // The Background
VNE.dialogueBox; // Dialogue Box
VNE.dialogueTextBox // Text go here.-
VNE.dialogueTextShield; // Text Shield
VNE.castContainer; // All characters are drawn here.-
VNE.choiceMenuContainer //
VNE.choiceMenu; //
VNE.charactersEl;
VNE.portraitBox;
VNE.portraitImage;
VNE.nameBox;
VNE.nameText;
VNE.menuLayer;

VNE.start = function (container, settings, sections, cast, rooms) {

  var initialize = function () {
    VNE.settings = settings;
    VNE.sections = sections;
    VNE.roomList = rooms;
    VNE.cast = cast;
    VNE.container = container;
    VNE.characters = {};
    VNE.charactersEl = {};
    if (!localStorage.unlockables) {
      VNE.Dialogue.createUnlocks();
      localStorage.unlockables = JSON.stringify(VNE.unlockables);
    }
    VNE.unlockables = JSON.parse(localStorage.unlockables);
  };

  var startScreen = function () { 
    container.css(settings.cropAreaStyle).css({height: '100%', width:'100%'});
    VNE.backdrop = $('<div>').addClass('room-backdrop');
    VNE.menuLayer = $('<div>').addClass('menu-layer');
    VNE.castContainer = $('<div>').addClass('cast-container');
    VNE.view = $('<div>').addClass('app-screen').append(VNE.backdrop).append(VNE.castContainer).append(VNE.menuLayer);
    VNE.container.append(VNE.view);
    VNE.view.css(settings.screenStyle);
    setScreenRatio();
    globalBinds();
    VNE.Element.render.dialogueBox();
    VNE.currentSection = settings.startSection;
    VNE.Room.enter(settings.startSection);
  };

  var setScreenRatio = function () {
    var height = $(window).height();
    var width = $(window).width();
    var newHeight = 100;
    var newWidth = 100;
    var widthRatio = settings.screenRatio[0];
    var heightRatio = settings.screenRatio[1];
    var screenRatio = width / height;
    var viewRatio = widthRatio / heightRatio;

    if (screenRatio > viewRatio) {
      newWidth = height * widthRatio / heightRatio / width * 100;
    } else if (screenRatio < viewRatio) {
      newHeight = width * heightRatio / widthRatio / height * 100;
    }

    VNE.view.css({
      height: newHeight + '%',
      width: newWidth + '%',
      margin: "auto"
    });
  };

  var globalBinds = function () {
    VNE.view.flowtype();
    $(window).on('resize', function () {
      setScreenRatio();
    });
  };

  initialize();
  startScreen();


}
'use strict';

var VNE = VNE || {};

VNE.StatusLine = {

  set: function () {
    var title = VNE.settings.title;
    if (VNE.settings.showRoom & VNE.sections[VNE.currentSection].name) {
      title = title + ' - ' + VNE.sections[VNE.currentSection].name;
    }
    document.title = title;
    
  }

};
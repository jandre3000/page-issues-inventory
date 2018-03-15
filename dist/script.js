var cells = document.querySelectorAll('.template-compact-cell').length;
var compactCells = document.querySelectorAll('.template-compact-cell .hide-when-compact').length
    || document.querySelectorAll('.template-compact-cell .mbox-textsmall-div').length
    || document.querySelectorAll('.template-compact-cell .bandeau-titre ~ p').length;

var compactPercentage = Math.round( ( compactCells / cells ) * 100 );
var outputEl = document.getElementById('js-count');
var outputText = `there are ${cells} templates on this page. ${compactCells} <strong>(${compactPercentage}%)</strong> have hidable elements.`
outputEl.innerHTML = outputText;

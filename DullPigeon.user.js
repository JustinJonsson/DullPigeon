// ==UserScript==
// @name         DullPigeon
// @namespace    http://fidessa.com/
// @version      0.9
// @description  Bring back SharpOwl's column headers so you can easily see the date. Also some other niceties.
// @author       Justin Jonsson
// @match        http*://timesheet*/team/*
// @downloadURL  https://github.com/JustinJonsson/DullPigeon/raw/master/DullPigeon.user.js
// ==/UserScript==

// History
// 0.9 - move total deletion farther down, as it was breaking the rowcount to delete it too soon. Add auto-update from github.
// 0.X - added various... stuff.
// 0.1 - original

window.onload = (function() {
    'use strict';

    // set column headers to dates
    //var workdaysSel = document.getElementsByClassName("working_gridheader");
    var workdaysSel = document.getElementsByClassName("gridheader");
    for (var i = 0; i < workdaysSel.length-1; i++){
        var theDate = workdaysSel[i].getAttribute("title").substring(0,6);
        workdaysSel[i].textContent = theDate;
    }

    // have to use querySelectorAll because first data row is of class gridrow_hilite every time.
    var rowSel = document.querySelectorAll(".gridrow, .gridrow_hilite");
    var clientStr = "";
    var prevClientStr = "";
    var cleanClientStr = "";
    var colSel;
    var aCol = 3;

    // skip the beginning & end which are the header & footer
    // draw lines between unlike clients
    for (i = 1; i < rowSel.length -1; i++){
        clientStr = rowSel[i].firstChild.innerText;
        prevClientStr = rowSel[i-1].firstChild.innerText;
        if (clientStr != prevClientStr) {
            rowSel[i].setAttribute("style", "border-top: 2px lightgrey solid");
        }

        //display client in Activity column for easier scanning, especially when hidden.
        cleanClientStr = clientStr.substr(0, clientStr.indexOf("(")-1);
        colSel = rowSel[i].getElementsByClassName("gridcells_txt");
        colSel[aCol].insertAdjacentHTML("afterbegin", "<b>"+cleanClientStr+" &gt;</b> ");
    }

    function hide(){
        var btn = document.getElementById("hideBtn");
        var toHide = (btn.getAttribute("value") === "Hide");

        // table header
        var headerRowSel = document.getElementById("timeGridHeader_timeGridHeader").getElementsByTagName("tbody")[0].childNodes;
        var colToHide = headerRowSel[0].getElementsByTagName("td");
        for (var i = 0; i < 3; i++) {
            if(toHide) {
                colToHide[i].setAttribute("hidden", true);
            } else {
                colToHide[i].removeAttribute("hidden");
            }
        }
      
        var bodyRowSel = document.getElementById("gridTime_gridTime").getElementsByTagName("tbody")[0].childNodes;
        // main table body
        for (i = 0; i < bodyRowSel.length-1; i++){
            colToHide = bodyRowSel[i].getElementsByTagName("td");
            for (var j = 0; j < 3; j++) {
                if(toHide) {
                    colToHide[j].setAttribute("hidden", true);
                } else {
                    colToHide[j].removeAttribute("hidden");
                }
            }
        }

        // table footer
        var footerRowSel = document.getElementById("timeGridTotals_timeGridTotals").getElementsByTagName("tbody")[0].childNodes;
        colToHide = footerRowSel[0].getElementsByTagName("td");
        var hideWidth = toHide ? "13%" : width;
        colToHide[0].setAttribute("style", "width:"+hideWidth);

        if(toHide) {btn.setAttribute("value", "Unhide");} else {btn.setAttribute("value", "Hide");}
    }

    // button to hide unnecessary columns.
    var menuSel = document.getElementsByClassName("hdrbdr");
    var menuRow = menuSel[2].firstChild.firstChild.firstChild;
    menuRow.insertAdjacentHTML("afterbegin", '<td><input type="button" class="btnNrm" id="hideBtn" onmouseover="this.className=&quot;btnOvr&quot;;" onmouseout="this.className=&quot;btnNrm&quot;;" value="Hide"></td>');
    var btn = document.getElementById("hideBtn");
    btn.addEventListener("click", hide, false);

    //remove the total bar at bottom so we can move it upward.
    var toRemove = document.getElementById("timeGridTotals_timeGridTotals");
    var width = document.getElementsByClassName("gridcelltotallabel")[0].style.width;
    var code = toRemove.outerHTML;
    toRemove.parentNode.removeChild(toRemove);

    // append the "total" row at the end of the table
    var div = document.getElementById("divGrid");
    div.insertAdjacentHTML("beforeend",code);

    //override toolbarShortCuts(e) to disable shortcuts when typing in textarea
    // Fan wrote this. Could it be improved by copying the existing toolbarShortCuts
    // function to toolbarOrigShortCuts and then overriding toolbarShortCuts to call
    // that if targetInput etc.? Might be more future proof.
    unsafeWindow.toolbarShortCuts = function(e){
        var targetInput = $('#txtTextEdit');
        if(!targetInput.is(document.activeElement)) {
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 83){ToolbarClick('SAVE', e);return false;}
            if (!e.ctrlKey && !e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 45){ToolbarClick('PICKER');return false;}
            if (e.ctrlKey && !e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 46){ToolbarClick('DELETE');return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 90){ToolbarClick('UNDO');return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 68){ToolbarClick('DUPLICATE');return false;}
            if (!e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 88){ToolbarClick('TBADDEXPENSE');return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 82){oPSC_pkPickResource.DropDown();oPSC_pkPickResource.oTextbox.focus();return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 77){ToolbarClick('SEARCHRES');return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 37){ToolbarClick('PREVMONTH');return false;}
            if (e.ctrlKey && !e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 37){ToolbarClick('PREVWEEK');return false;}
            if (e.ctrlKey && !e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 39){ToolbarClick('NEXTWEEK');return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 39){ToolbarClick('NEXTMONTH');return false;}
            if (e.ctrlKey && !e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 36){ToolbarClick('TODAY');return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 84){ToolbarClick('PICKDATE');return false;}
            if (e.ctrlKey && e.altKey && (e.keyCode ? e.keyCode : e.charCode) == 80){ToolbarClick('PRINTWEEK');return false;}
            return true;
        }
    };

})();

/**
 * Initiates hiding of closed disclosures and adds the proper event listener.
 */
function initDisclosures() {
   let allDisclosures = document.querySelectorAll("button[aria-expanded][aria-controls]");
   for (let disclosure of allDisclosures) {
      let disclosureDescription = document.getElementById(disclosure.getAttribute("aria-controls"));
      disclosure.addEventListener("click", toggleDisclosure.bind(null, disclosure, disclosureDescription));
      if (disclosure.getAttribute("aria-expanded") === "false") {
         disclosureDescription.toggleAttribute("hidden", true);
      }
   }
}

/**
 * Click listener for disclosure.
 * Changes the value of aria-expanded, then shows or hides content based on the new value.
 * 
 * @param {HTMLButtonElement} button 
 * @param {HTMLElement} description
 */
function toggleDisclosure(button, description) {
   let isShown = button.getAttribute("aria-expanded") === "true";
   button.setAttribute("aria-expanded", !isShown);
   description.toggleAttribute("hidden", isShown);
}

/**
 * Site nav disclosures for submenus (single-layer)
 */

function initNavDisclosure() {
   let navDisclosures = document.querySelectorAll('header nav button[aria-expanded][aria-controls]');
   for (let disclosure of navDisclosures) {
      let wrapper = disclosure.parentElement;
      let submenu = document.getElementById(disclosure.getAttribute("aria-controls"));
      wrapper.addEventListener("focusout", (event) => {
         let focusOutside = !submenu.contains(event.relatedTarget) && disclosure !== event.relatedTarget;
         if (disclosure.getAttribute("aria-expanded") === "true" && focusOutside) {
            toggleDisclosure(disclosure, submenu);
         }
      });
      submenu.addEventListener("keydown", (event) => {
         if (event.key === "Escape") {
            //close dropdown. Focus on disclosure
            toggleDisclosure(disclosure, submenu);
            disclosure.focus();
         }
      });
   }
}


/** Tab stuff */

function initTabs() {
   let tabsContainer = document.getElementsByClassName("tabs");
   for (let tabs of tabsContainer) {
      let tablist = document.createElement("div");
      tablist.classList.add(tabs.dataset.style);
      tablist.setAttribute("aria-orientation", tabs.dataset.orientation);
      tablist.setAttribute("role", "tablist");
      tablist.setAttribute("aria-label", "");
      tabs.prepend(tablist);

      let panels = tabs.querySelectorAll("[data-js='tabpanel']");
      for (let panel of panels) {
         createAriaTab(panel, tablist);
      }
      
      let length = Array.from(panels).length;
      let initFocus = tabs.dataset.start;
      if (typeof initFocus === "undefined") { //data-start not set.
         initFocus = 0;
      } else if (initFocus >= length) { // data-start not a valid index.
         initFocus = initFocus % length;
      }

      let allTabs = Array.from(tablist.querySelectorAll('[role=tab]'));
      selectTab(allTabs[initFocus]);

      tablist.addEventListener("keydown", (event) => {
         let tabFocus = allTabs.findIndex(tab => tab.hasAttribute("aria-selected"));
         let isVertical = tablist.getAttribute("aria-orientation") === "vertical";

         let newFocus = tabsKeyHandler(event.key, tabFocus, length, isVertical);
         changeTab(allTabs[newFocus]);
      })
   }
}

/**
 * Given the panel content and the newly created tablist, 
 * add the needed attributes to the panel and create the respective tab and place it in the tablist.
 * 
 * @param {HTMLElement} panel 
 * @param {HTMLElement} tablist 
 */
function createAriaTab(panel, tablist) {
   let tabid = panel.getAttribute("id") + "-tab";

   let tab = document.createElement("button");
   tab.setAttribute("role", "tab");
   tab.setAttribute("aria-controls", panel.getAttribute("id"));
   tab.setAttribute("id", tabid);
   tab.textContent = panel.dataset.title;
   tab.addEventListener("click", changeTab.bind(null, tab));
   tab.setAttribute('tabindex', -1);
   tablist.append(tab);

   panel.removeAttribute("data-title");
   panel.removeAttribute("data-js");
   panel.setAttribute("role", "tabpanel");
   panel.setAttribute("aria-labelledby", tabid);
   panel.setAttribute('tabindex', 0);
   panel.toggleAttribute('hidden', true);
}


/**
 * Handles a keydown event in a tablist.
 * Returns the new focused tab index given the currently focused tab and the key pressed.
 * Also requires the number of tabs and whether the tablist is horizontal or vertical.
 * 
 * @param {String} key 
 * @param {Number} focus 
 * @param {Number} tabLength 
 * @param {Boolean} isVertical
 */
function tabsKeyHandler(key, focus, tabLength, isVertical) {
   switch (key) {
      case "ArrowDown":
         if (isVertical) {
            focus++;
            return focus % tabLength;
         } else { break; }
      case "ArrowUp":
         if (isVertical) {
            focus--;
            return (tabLength + focus) % tabLength;
         } else { break; }
      case "ArrowRight":
         if (!isVertical) {
            focus++;
            return focus % tabLength;
         } else { break; }
      case "ArrowLeft":
         if (!isVertical) {
            focus--;
            return (tabLength + focus) % tabLength;
         } else { break; }
      case "Home": 
         return 0;
      case "End": 
         return tabLength - 1;
      default: return focus;
   }
   return focus;
}

/**
 * Selects the given tab and removes it from the previously selected tab.
 * Gives focus to the given tab.
 * 
 * @param {HTMLElement} newTab 
 */
function changeTab(newTab) {
   let oldTab = Array.from(newTab.parentElement.querySelectorAll("[role=tab]")).find(tab => tab.hasAttribute("aria-selected"));
   if (newTab === oldTab) {
      return;
   } else {
      deselectTab(oldTab);
      selectTab(newTab);
      newTab.focus();
   }
}

/**
 * Deselects the given tab.
 * 
 * @param {HTMLElement} tab 
 */
function deselectTab(tab) {
   tab.setAttribute("tabindex", -1);
   tab.removeAttribute("aria-selected");
   document.getElementById(tab.getAttribute("aria-controls")).toggleAttribute('hidden', true);
}

/**
 * Selects the given tab.
 * 
 * @param {HTMLElement} tab 
 */
function selectTab(tab) {
   tab.setAttribute('tabindex', 0);
   tab.setAttribute("aria-selected", true);
   document.getElementById(tab.getAttribute("aria-controls")).toggleAttribute('hidden', false);
}
 





/** Initializer */

(function(){
   'use strict';
   window.addEventListener("load", () => {
      initDisclosures(); 
      initNavDisclosure();
      initTabs();
   }, {once:true});
}());
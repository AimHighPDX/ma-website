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


(function(){
   'use strict';
   window.addEventListener("load", () => {initDisclosures(); initNavDisclosure();}, {once:true});
}());
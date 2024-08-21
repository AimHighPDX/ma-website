/**
 * Initiates hiding of closed disclosures and adds the proper event listener.
 */
(function(){
   console.log("foo");
   window.addEventListener("load", initDisclosures, {once:true});
}())

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
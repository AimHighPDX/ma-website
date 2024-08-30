/**
 * Replaces Squarespace inserted elements.
 */


/**
 * Replacing curriculum summary elements.
 */
function replaceCurriculum() {
   let wrappers = document.querySelectorAll("[id$=curriculum-wrapper] .summary-v2-block");

   for (let wrapper of wrappers) {
      let container = document.createElement("ul");
      let summaries = wrapper.getElementsByClassName("summary-item");

      for (let item of summaries) {
         let element = document.createElement("li");
         let link = document.createElement("a");

         link.setAttribute("href", item.getElementsByTagName("a")[0].getAttribute("href"));
         link.textContent = item.textContent.trim();
         link.classList.add("curriculum-item");

         element.append(link);
         element.style.backgroundImage = "url(" + item.getElementsByTagName("img")[0].dataset.src + ")";
         
         container.append(element);
      }
      container.classList.add("curriculum-list");
      wrapper.replaceChildren(container);
   }
}

/**
 * Initializer
 */
(function(){
   'use strict';
   window.addEventListener("load", () => {
      replaceCurriculum();
   }, {once:true});
}());
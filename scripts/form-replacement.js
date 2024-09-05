/**
 * Replaces Squarespace default forms with a customized version.
 * (Why? For the ability to be consistent and do custom validations)
 */
function replaceSqsForms() {
   let sqsForms = document.getElementsByClassName("sqs-block-form");
   for (let sqsForm of sqsForms) {
      let items = Array.from(sqsForm.getElementsByClassName("form-item"));

      for (let item of items) {
         let classes = item.classList;
         let replacement;

         if (classes.contains("fields")) {
            replacement = createFieldset(item);
         } else if (classes.contains("checkbox") || classes.contains("radio")) {
            replacement = createGroup(item);
         } else if (classes.contains("select")) {
            replacement = createSelect(item);
         } else {
            replacement = createField(item);
         }

         item.replaceWith(replacement);
      }
      formInit(sqsForm);
   }
}

/**
 * 
 * @param {HTMLElement} sqsItem 
 * @returns 
 */
function createField(sqsItem) {
   let sqsLabel = sqsItem.querySelector("label");
   let sqsInteractive = document.getElementById(sqsLabel.htmlFor);
   let sqsDescription = sqsItem.querySelector("p.description:not(.required)");
   let id = sqsInteractive.id;

   let field = document.createElement("div");
   field.className = "form-field";

   let label = document.createElement("label");
   label.className = "field-label";
   label.htmlFor = id;
   label.textContent = sqsLabel.textContent;
   label.append(_createRequiredSpan());

   let input;
   switch(sqsInteractive.tagName) {
      case "INPUT": 
         input = _createInput(sqsInteractive);
         break;
      case "TEXTAREA": 
         input = _createTextarea(sqsInteractive, sqsItem.classList.contains("required"));
         break;
      case "SELECT": 
         input = _createSelect(sqsInteractive);
         break;
      default: 
         return sqsItem; //Not sure how to handle? Just send it back.
   }
   input.name = label.textContent;

   let error = _createErrorElement(id);

   let description = "";
   if (sqsDescription) {
      description = document.createElement("p");
      description.className = "small-text";
      description.id = id + "-description";
      description.textContent = sqsDescription.textContent;
      input.setAttribute("aria-describedBy", error.id + " " + description.id)
   } else {
      input.setAttribute("aria-describedBy", error.id);
   }

   field.append(label, description, input, error);
   return field;
}


/**
 * 
 * @param {HTMLElement} sqsFieldset 
 * @returns 
 */
function createSelect(sqsFieldset) {
   let sqsLabel = sqsFieldset.querySelector("legend");
   let sqsInteractive = sqsFieldset.querySelector("select");
   let sqsDescription = sqsFieldset.querySelector("p.description:not(.required)");
   let id = sqsInteractive.id;

   let field = document.createElement("div");
   field.className = "form-field";

   let label = document.createElement("label");
   label.className = "field-label";
   label.htmlFor = id;
   label.textContent = sqsLabel.textContent;
   label.append(_createRequiredSpan());

   let input = _createSelectInput(sqsInteractive);
   input.name = label.textContent;
   let error = _createErrorElement(id);

   let description = "";
   if (sqsDescription) {
      description = document.createElement("p");
      description.className = "small-text";
      description.id = id + "-description";
      description.textContent = sqsDescription.textContent;
      input.setAttribute("aria-describedBy", error.id + " " + description.id)
   } else {
      input.setAttribute("aria-describedBy", error.id);
   }

   field.append(label, description, input, error);
   return field;
}

/**
 * 
 * @param {HTMLInputElement} sqsInput 
 * @returns 
 */
function _createInput(sqsInput) {
   let input = document.createElement("input");
   input.className = "field-input";
   input.id = sqsInput.id;
   input.placeholder = sqsInput.placeholder;
   input.toggleAttribute("pristine", true);
   input.toggleAttribute("required", (sqsInput.required || sqsInput.getAttribute("aria-required")));
   input.type = sqsInput.type;
   return input;
}

/**
 * 
 * @param {HTMLSelectElement} sqsSelect 
 * @returns 
 */
function _createSelectInput(sqsSelect) {
   let select = document.createElement("select");
   select.className = "field-input";
   select.id = sqsSelect.id;
   select.toggleAttribute("pristine", true);
   select.toggleAttribute("required", sqsSelect.required);
   select.replaceChildren(...sqsSelect.childNodes);
   return select;
}

/**
 * 
 * @param {HTMLTextAreaElement} sqsArea 
 * @param {Boolean} isRequired 
 * @returns 
 */
function _createTextarea(sqsArea, isRequired) {
   let textarea = document.createElement("textarea");
   textarea.className = "field-input";
   textarea.id = sqsArea.id;
   textarea.toggleAttribute("pristine", true);
   textarea.toggleAttribute("required", isRequired);
   textarea.placeholder = sqsArea.placeholder;
   textarea.setAttribute("rows", 5);
   return textarea;
}

/**
 * 
 * @returns 
 */
function _createRequiredSpan() {
   let span = document.createElement("span");
   span.classList.add("field-required");
   span.setAttribute("aria-hidden", true);
   span.textContent = "*";
   return span;
}

/**
 * Given the id of the input element, creates the correct error element.
 * @param {String} id 
 */
function _createErrorElement(id) {
   let error = document.createElement("p");
   error.className = "field-error";
   error.id = id + "-error";
   return error;
}


/**
 * 
 * @param {HTMLFieldSetElement} sqsFieldset 
 * @returns 
 */
function createFieldset(sqsFieldset) {
   let id = sqsFieldset.id;

   let fieldset = document.createElement("fieldset");
   let legend = document.createElement("legend");
   legend.textContent = sqsFieldset.querySelector("legend .title span:not(.description.required)").textContent;

   let error = _createErrorElement(id);
   error.className = "fieldset-error";
   
   let sqsDescription = sqsFieldset.querySelector("legend .description:not(.required)");
   let description = "";
   if (sqsDescription) {
      description = document.createElement("p");
      description.className = "small-text";
      description.textContent = sqsDescription.textContent;
      description.id = sqsFieldset.id + "-description";
      fieldset.setAttribute("aria-describedBy", error.id, description.id);
   } else {
      fieldset.setAttribute("aria-describedBy", error.id);
   }

   let fields = [];
   for (let field of sqsFieldset.getElementsByClassName("field")) {
      fields.push(createField(field));
   }

   fieldset.append(legend, description, ...fields, error);
   return fieldset;
}

/**
 * 
 * @param {HTMLFieldSetElement} sqsFieldset 
 * @returns 
 */
function createGroup(sqsFieldset) {
   let id = sqsFieldset.id;

   let fieldset = document.createElement("fieldset");
   let legend = document.createElement("legend");
   legend.textContent = sqsFieldset.querySelector("legend .title span:not(.description.required)").textContent;
   
   let type;
   if (sqsFieldset.classList.contains("checkbox")) {
      type = "checkbox";
      fieldset.classList.add("fieldset-checkbox");

      if (sqsFieldset.querySelector("span.description.required") !== null) {
         fieldset.setAttribute("aria-required", true);
         fieldset.setAttribute("data-min", 1);
         let required = document.createElement("span");
         required.textContent = "required";
         required.className = "visually-hidden";
         legend.append(required);
      }
   } else {
      type="radio";
      fieldset.classList.add("fieldset-radio");
      fieldset.setAttribute("role", "radiogroup");
      fieldset.setAttribute("aria-required", true);
   }

   let error = _createErrorElement(id);
   error.className = "fieldset-error";
   
   let sqsDescription = sqsFieldset.querySelector("legend .description:not(.required)");
   let description = "";
   if (sqsDescription) {
      description = document.createElement("p");
      description.className = "small-text";
      description.textContent = sqsDescription.textContent;
      description.id = sqsFieldset.id + "-description";
      fieldset.setAttribute("aria-describedBy", error.id, description.id);
   } else {
      fieldset.setAttribute("aria-describedBy", error.id);
   }

   let fields = [];
   let count = 1;
   for (let field of sqsFieldset.getElementsByClassName("option")) {
      let container = document.createElement("div");
      container.className = "form-field";

      let input = document.createElement("input");
      input.className = "field-input";
      input.id = id + "-" + count;
      input.value = field.textContent;
      input.name = legend.textContent;
      input.type = type;

      let label = document.createElement("label");
      label.className = "field-label";
      label.htmlFor = input.id;
      label.textContent = input.value;

      label.prepend(input);
      container.append(label);
      fields.push(container);
      count++;
   }

   legend.append(_createRequiredSpan());
   fieldset.append(legend, description, ...fields, error);
   return fieldset;
}






/**
 * This script defines basic functionality of a form.
 *
window.addEventListener("load", (e) => {
   Array.from(document.getElementsByTagName('form')).forEach((f) => {formInit(f)})
});*/

function formInit(form) {
   setFormErrorHandling(form);
   form.setAttribute('onsubmit', "validateForm(this)");
}

 //Dialog box for an misc issue
function badRequest(text = String) {
   let postBody = document.getElementById('bad-dialog');
   document.getElementById('bad-dialog-message').textContent = text;
   postBody.showModal();
}

/** 
 * Generic debounce function maker
 * Returns a function that takes in an event and a Bool whether the function should be cancelled entirely.
 */
function debounce(func, time, args) {
   let timer;
   return (e, cancel) => {
     clearTimeout(timer);
     if (!cancel) {
       timer = setTimeout(func.bind(null, ...args), time, e)
     }
   };
}


/** Error handling functions for a single input/select/etc. **/
function showError(target = HTMLElement) {
   let errmsg = target.validationMessage;
   if (errmsg === "") {
      target.removeAttribute('aria-invalid'); 
   } else {
      /* aria-invalid is essential when dealing with fields that pass html validation. It's also helpful as a fallback. */
      target.setAttribute('aria-invalid', true);
      if (target.validity.patternMismatch) {
         errmsg = target.title;
      }
   }
   document.getElementById(target.getAttribute('aria-describedby').split(' ').find(id => id.includes('error'))).textContent = errmsg;
}


/** Handle an attempted submission of an invalid form. **
function showFormError(form = HTMLFormElement) {
   let errorText = form.querySelector('.form-error');
   if (errorText) {
      let numInvalid = [...form.getElementsByClassName('field-input')].filter(input => !input.checkValidity()).length;
      errorText.textContent = 'There are ' + numInvalid + ' invalid field(s).';
   }
}*/

/**
 * Show error for checkbox Fieldsets.
 * Only verifies min/max values.
 * 
 * @param {HTMLFieldSetElement} fieldset 
 */
function checkboxFieldsetValidation(fieldset) {
   let errmsg = "";
   let isRequired = fieldset.hasAttribute('data-required');
   let numSelected = Array.from(fieldset.getElementsByClassName('field-input')).filter(input => input.checked).length;

   if (isRequired && numSelected < parseInt(fieldset.dataset.min)) {
      fieldset.setAttribute('aria-invalid', true);
      errmsg = "Please select at least " + fieldset.dataset.min + " option(s).";
   } else if (isRequired && numSelected > parseInt(fieldset.dataset.max)) {
      fieldset.setAttribute('aria-invalid', true);
      errmsg = "Please select no more than " + fieldset.dataset.max + " option(s).";
   } else {
      fieldset.removeAttribute('aria-invalid');
   }

   fieldset.querySelector('.fieldset-error').textContent = errmsg;
}

/**
 * Show error for radio Fieldsets.
 * 
 * @param {HTMLFieldSetElement} fieldset 
 */
function radioFieldsetValidation(fieldset) {
   let inputs = Array.from(fieldset.getElementsByClassName('field-input'));
   let errmsg = "";
   if (fieldset.hasAttribute('aria-required') && !inputs.some(input => input.checked)) {
      fieldset.setAttribute('aria-invalid', true);
      errmsg = "Please select one option."
   } else {
      fieldset.removeAttribute('aria-invalid');
   }

   fieldset.querySelector('.fieldset-error').textContent = errmsg;
}

/**
 * Validation for date fieldsets.
 * Only verifies that this is real date.
 * 
 * @param {HTMLFieldSetElement} fieldset 
 */
function dateFieldsetValidation(fieldset) {
   let errmsg = "";
   let day = parseInt(fieldset.querySelector(".field-input[data-value=day]").value);
   let month = parseInt(fieldset.querySelector(".field-input[data-value=month]").value) - 1;
   let year = parseInt(fieldset.querySelector(".field-input[data-value=year]").value);

   if ([day, month, year].some(n => isNaN(n))) {
      //Not finished filling in.
      fieldset.removeAttribute('aria-invalid');
   } else {
      let date = new Date(year, month, day); //Date constructor requires month index
      if (date.getMonth() !== month || date.getFullYear() !== year || date.getDate() !== day) {
         fieldset.setAttribute('aria-invalid', true);
         errmsg = "Not a valid date."
      } else {
         fieldset.removeAttribute('aria-invalid');
      }
   }
   fieldset.querySelector(".fieldset-error").textContent = errmsg;
}






/**
 * Sets error handling for single fields within any HTML element.
 * 
 * @param {HTMLElement} container 
 */
function setFieldErrorHandling(container = HTMLElement) {
   // NOTE: this includes radios, checkboxes, and date fieldsets. These should be handled differently
   let inputs = Array.from(container.getElementsByClassName('field-input')).filter((input) => {
      let type = input.getAttribute('type');
      return type !== "checkbox" && type !== "radio";
   });

   setTextErrorHandling(inputs);
   setDateErrorHandling(Array.from(container.getElementsByClassName('fieldset-date')));
}

/**
 * Sets event listeners for most fields.
 * Helper function for setFieldErrorHandling.
 * 
 * @param {HTMLElement[]} inputs 
 */
function setTextErrorHandling(inputs) {
   for (let input of inputs) {
      let debouncedError = debounce(showError, 600, [input]);
      input.addEventListener('input', debouncedError);
      input.addEventListener('blur', (event) => {event.target.value = event.target.value.trim();})

      if (input.classList.contains('live-validation')) {
         let debouncedValidation = debounce(customValidation, 600, [input])
         input.addEventListener('input', debouncedValidation);
      }

      if (input.hasAttribute('pristine')) {
         /* On first input, create another event listener that on first blur, removes the pristine attribute + shows an error. 
         Why do it this way? Because onblur alone triggers on a tab through and oninput alone triggers before the user is done with the field. */
         input.addEventListener('input', (event) => {
            event.target.addEventListener('blur', (event) => {
              event.target.removeAttribute('pristine'); 
              showError(event.target); 
            }, { once: true });
          }, { once: true });
      }
   }
}

/**
 * Set event listeners for date fieldsets.
 * 
 * @param {HTMLFieldSetElement[]} fieldsets 
 */
function setDateErrorHandling(fieldsets) {
   for (let fieldset of fieldsets) {
      fieldset.addEventListener('change', () => {
         dateFieldsetValidation(fieldset);
      });
   }
}





/**
 * Creates event listeners for error handling purposes.
 * 
 * @param {HTMLFormElement} form 
 */
function setFormErrorHandling(form) {
   setFieldErrorHandling(form);

   // The first time a form is submitted
   form.addEventListener('submit', () => {
      //pristine removal
      form.removeAttribute('pristine');
      form.querySelectorAll('[pristine]').forEach((pristineInput) => {
         pristineInput.removeAttribute('pristine');
         showError(pristineInput);
      });

      //start checkbox and radio validations.
      let radioFieldsets = Array.from(form.getElementsByClassName('fieldset-radio'));
      setRadioErrorHandling(radioFieldsets);
      let checkboxFieldsets = Array.from(form.getElementsByClassName('fieldset-checkbox'));
      setCheckboxErrorHandling(checkboxFieldsets);

      //update form-wide error field
      //form.addEventListener('change', showFormError.bind(null, form));
   }, {once:true});
}

/**
 * Sets validation handlers for radio fieldsets. This will only have an effect after initial submission.
 * Helper function for setFieldErrorHandling.
 * 
 * @param {HTMLFieldSetElement[]} fieldsets 
 */
function setRadioErrorHandling(fieldsets) {
   for (let fieldset of fieldsets) {
      fieldset.addEventListener('change', radioFieldsetValidation.bind(null, fieldset));
      radioFieldsetValidation(fieldset);
   }
}

/**
 * Sets validation handlers for checkbox fieldsets.
 * Helper function for setFieldErrorHandling.
 * 
 * @param {HTMLFieldSetElement[]} fieldsets 
 */
function setCheckboxErrorHandling(fieldsets) {
   for (fieldset of fieldsets) {
      fieldset.addEventListener('change', checkboxFieldsetValidation.bind(null, fieldset));
      checkboxFieldsetValidation(fieldset);
   }
}



/**
 * For fields that require backend validation.
 * Uses a POST request by default as GET transports a field's value transparently.
 * 
 * The backend call will only happen if basic html validation passes.
 * 
 * This will have a different setup if this form is located within Google Apps Script.
 * The Google Apps Script variant is as follows:
   google.script.run.withSuccessHandler((response) => {
       input.setCustomValidity(response);
       // remove error-override styling
     }).withFailureHandler((response) => {
       input.setCustomValidity("");
       // remove error-override styling
     }).withUserObject([PARAMS TO BE PASSED TO SUCCESS/FAILURE HANDLES]).backendFunction([PARAMS TO BE PASSED TO BACKEND FUNCTION]);
 * 
 * 
 * @param {HTMLElement} input 
 */
async function customValidation(input) {
   input.setCustomValidity(""); //valid
   if (input.validity.valid) {
      input.classList.add('error-override'); //error texts shows, unable to submit, but not styled the same.
      input.setCustomValidity("verifying...");
      showError(input); //show the custom error message

      fetch(postUrl, {
         method: "POST",
         body: input.value
      }).catch((error) => {
         input.setCustomValidity(error);
      }).then((response) => {
         input.setCustomValidity("");
      }).finally(() => {
         input.classList.remove('error-override');
         showError(input);
         input.dispatchEvent(new Event('change', {bubbles: true})); //Update the form-wide error count.
      })
   }
}

var submissionBlocked = false;
/**
 * This validates a given form.
 * 
 * @param {HTMLFormElement} form 
 */
function validateForm(form) {
   let button = form.querySelector('button[type=submit]');
   button.setAttribute('aria-disabled', true);
   document.getElementById(button.getAttribute('aria-describedby')).textContent = "Processing...";

   if (submissionBlocked) {
      badRequest("Submission is processing.");
   } else if (!form.checkValidity()) {
      event.preventDefault();
      //showFormError(form);
      form.focus();
      form.scrollIntoView({behavior:'smooth'});
   } else {
      submissionBlocked = true;
      submitOrder(form);
      unblockForm(form);
   }
}

/**
 * Unblocks form from being submitted.
 * 
 * @param {HTMLFormElement} form 
 */
function unblockForm(form) {
   submissionBlocked = false;
   let button = form.querySelector('button[type=submit]');
   button.removeAttribute('aria-disabled');
   document.getElementById(button.getAttribute('aria-describedby')).textContent = "";
}

/**
 * Given JSON for the post data...
 * 
 * This will change depending on where form code is placed.
 * There are currently variants for a pure POST query and one that refers to a google script backend.
 * 
 * Below is a generic HTTP POST request.
 * 
 * The Google Apps Script variant is as follows:
   google.script.run.withSuccessHandler((response) => {
      if (response === "") {
        //insert what happens on success
      } else {
        badRequest(response);
      }
      unblockForm(form);
   }).withFailureHandler((response) => {
      badRequest(JSON.stringify(response));
      unblockForm(form);
   }).withUserObject([PARAMS TO BE PASSED TO SUCCESS/FAILURE HANDLES]).sendSubmission([PARAMS TO BE PASSED TO BACKEND FUNCTION]);
 * 
 * Please note that params passed to the backend must be strings.
 *  
 * @param {*} formdata 
 */
async function submitForm(form) {
   fetch(url, {
      method: "POST",
      body: processForm(form)
   }).catch((error) => {
      badRequest(error);
   }).then((response) => {
      //stuff that happens on successful submit
   }).finally(() => {
      //anything that should happen regardless of success. Typically, unblocking submit.
      unblockForm(form);
   })
}

/**
 * Any processing that should be done directly before a submission.
 * This will likely need to change depending on the actual form content.
 * 
 * @param {HTMLFormElement} form 
 */
function processForm(form) {
   let data = new FormData(form);
   try {
      data.set('full address', getAddressString(form.getElementsByClassName('.addresss-fieldset')[0]));
   } finally {
      return data;
   }
}





(function(){
   'use strict';
   window.addEventListener("load", () => {
      replaceSqsForms();
   }, {once:true});
}());


/**
 * Logic for SQS belt promotion form
 * 
 * @param {String} program
 *
function updateBeltPromotion(program) {
   let form = document.getElementById('belt-promotion-form');
   form.querySelector("input[name=SQF_PROGRAM]").value = program;
   let beltSelect = form.getElementById("select-f5f41697-4c46-4621-887d-450ae1630df2-field");
   let studentEssay = form.getElementById("textarea-yui_3_17_2_1_1725487139185_1326");
   let parentFeedback = form.getElementById("textarea-fdcfa625-046f-4736-ac9f-8de506731462");

   let newOptions = (title, options) => {
      let group = document.createElement("optgroup");
      group.setAttribute("label", title);
      for (let option of options) {
         let opt = document.createElement("option");
         opt.value = option;
         opt.textContent = option;
         group.append(opt);
      }
      container.append(group);
   }
   
   let container = document.createDocumentFragment();
   container.append(
      beltSelect.firstElementChild,
      newOptions("Beginner", formOptions[program].belts["beg"]),
      newOptions("Intermediate & Advanced", formOptions[program].belts["int-adv"]),
   )
   beltSelect.replaceChildren(container);
   
   if (formOptions[program].essay) {
      beltSelect.addEventListener("change", () => {
         
      });
   } else {
      studentEssay.toggleAttribute("hidden", true);
   }

   if (formOptions[program].feedback) {
      parentFeedback.querySelector("p.description:not(.required)").textContent = formOptions[program].feedback;
      parentFeedback.toggleAttribute("hidden", false);
   } else {
      parentFeedback.toggleAttribute("hidden", true);
   }
}*/
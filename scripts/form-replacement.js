/**
 * This script defines basic functionality of a form.
 *
window.addEventListener("load", (e) => {
   Array.from(document.getElementsByTagName('form')).forEach((f) => {formInit(f)})
});*/

function formInit(form) {
   setFormErrorHandling(form);
   form.toggleAttribute("pristine", true);
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
   console.log("yo");
   let button = form.querySelector('button[type=submit]');
   button.setAttribute('aria-disabled', true);
   document.getElementById(button.getAttribute('aria-describedby')).textContent = "Processing...";

   if (submissionBlocked) {
      badRequest("Submission is processing.");
   } else if (!form.checkValidity()) {
      console.log("invalid form");
      event.preventDefault();
      //showFormError(form);
      form.focus();
      form.scrollIntoView({behavior:'smooth'});
   } else {
      console.log("valid form");
      submissionBlocked = true;
      //submitForm(form);
      form.dispatchEvent(event);
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
      data.set('full address', getAddressString(form.getElementsByClassName('.address-fieldset')[0]));
   } finally {
      return data;
   }
}





(function(){
   'use strict';
   window.addEventListener("load", () => {
      for (let form of document.getElementsByTagName("form")) {
         formInit(form);
      }
   }, {once:true});
}());






 /**
    * 
    */
 function customFormInit(form) {
   // Listener on belt select to change description of student essay
   let program = form.querySelector("input[name='" + formFieldNames.program + "']");
   let belts = form.querySelector("select[name='" + formFieldNames.belts + "']");
   let essay = form.querySelector("textarea[name='" + formFieldNames.essay + "']");

   belts.addEventListener("change", (e) => {
      let prompts = formOptions[program.value].essay;
      if (!essay.hasAttribute('hidden')) {
         essay.parentNode.querySelector("p[id$=description]").textContent = prompts[e.target.value];
      }
      belts.className = "field-input";
   })
}

function beltPromotionInit() {
   let tsdForm = document.getElementById("tang-soo-do-form");
   let tsdEssayDescription = tsdForm.querySelector(".form-field:has(*[name='Student Essay']) p[id$=description]");
   let tsdText = {
      'White': "How is Tang Soo Do training different than you expected?",
      'Sr. White': 'As you think about your training in Tang Soo Do, what do you see as your strengths? What do you think your biggest challenges will be as an Orange Belt?',
      'Orange': 'Bowing is an important part of Martial Arts protocol. How does the philosophy of the bow relate to your own training? How do you communicate respect outside of the martial arts?',
      'Sr. Orange':'What is the most important thing you have learned since you were a White Belt? Why is this important?',
      'Green': 'Which of the Tenets of Tang Soo Do are most important to you at this time in your training? Why? How do you (or could you) use them elsewhere in your life?',
      'Sr. Green': 'Select one of the 14 Attitude Requirements and explain how it has been helpful to you in your training. Explain how it is or could be helpful to your daily life. Pick another requirement that you would like to use more often and explain why.',
      'Brown': 'What does Tang Soo Spirit mean to you? How have you applied it in your training & your daily life?',
      'Sr. Brown': 'Explain the Um and Yang concept. How does it apply to your Martial Arts training? What about other areas of your life?',
      'Red': 'What has Hyung practice taught you about your Martial Arts training? What has it taught you about life in general?',
      'Sr. Red': 'What is the most important goal you want to reach before testing for Black Belt? Explain why this goal is important to you.'
    }

   tsdForm.querySelector("*[name=Belt]").addEventListener("change", (e) => {
      tsdEssayDescription.textContent = tsdText[e.target.value];
   })
}

/**
 * Logic for SQS belt promotion form
 * 
 * @param {String} program
 */
function updateBeltPromotion(program) {
   let dialogBody = document.querySelector("#belt-promotion-form .dialog-body");
   dialogBody.setAttribute("data-js", program);
   let form = document.getElementById(program.toLowerCase().replaceAll(" ", "-") + "-form");

   for (let field of form.getElementsByClassName("field-input")) {
      field.value = "";
   }
   form.querySelector("*[name=Program]").value = program;
}
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
   input.toggleAttribute("required", sqsInput.required);
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
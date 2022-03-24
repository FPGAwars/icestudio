//---------------------------------------------------------------------------
//-- Forms managment
//---------------------------------------------------------------------------

'use strict';

angular.module('icestudio')
  .service('forms', 
    function (

    ) 
{

  //-------------------------------------------------------------------------
  //-- Constant for working with HTML FORMS
  //-------------------------------------------------------------------------
  //-- Each input Form has diffefrent Fields:
  //--  * Text : For entering texts (Ex. port names)
  //--  * Checkbox: on/off (Ex. FPGA pin/ virtual pin)
  //--  * Combobox. Multiple selection. (Ex. Address format )
  //--  * Color selection dropmenu
  

  //-- Constants for the Field Parameters
  const PARAM_TEXT = "%TEXT%";
  const PARAM_ID = "%ID%";
  const PARAM_VALUE = "%VALUE%";
  const PARAM_LABEL = "%LABEL%";
  const PARAM_OPTIONS = "%OPTIONS%";
  const PARAM_SELECTED = "%SELECTED%";

  //-------------------------------------------------------------------------
  //--- Input text field
  //-------------------------------------------------------------------------
  /*
         text message
        +-----------------+
        | Input text      |
        +-----------------+  
  */

  //-- HTLM code template
  const FORM_TEXT_TEMPLATE = `
    <p> ${PARAM_TEXT} </p>
    <input class="ajs-input" 
           type="text" 
           id="form${PARAM_ID}" 
           autocomplete="off"/>
    `;

  //-----------------------------------------------------------
  //-- Create the html code for an input Text field
  //-- INPUTS:
  //--   * msg: Text message to shown as a title
  //--   * formID: Form identifier number
  //--
  //-- Returns:
  //--   -A string with the HTML code for that Field
  //-----------------------------------------------------------
  this.htmlInputText = function(msg, formId) {

    //-- Insert the parameters in the html code template
    let html = FORM_TEXT_TEMPLATE.replace(PARAM_TEXT, msg);
    html = html.replace(PARAM_ID, formId);

    return html;
  };
  
 
  //-------------------------------------------------------------------------
  //--- Input checkbox field
  //-------------------------------------------------------------------------
  /*
         [ ] Label
  */

  //-- HTLM code template
  const FORM_CHECKBOX_TEMPLATE = `
    <div class="checkbox">
      <label>
        <input type="checkbox" ${PARAM_VALUE} id="form${PARAM_ID}"/>
        ${PARAM_LABEL}
      </label>
    </div>
  `;

  //-----------------------------------------------------------
  //-- Create the html code for an input checkbox field
  //-- INPUTS:
  //--   * msg: Text message to shown as a title
  //--   * formID: Form identifier number
  //--
  //-- Returns:
  //--   -A string with the HTML code for that Field
  //-----------------------------------------------------------
  this.htmlInputCheckbox = function(label, value, formId) {

    //-- Insert the parameters in the html code template
    let html = FORM_CHECKBOX_TEMPLATE.replace(
                  PARAM_VALUE,
                  (value ? 'checked' : ''));

    html = html.replace(PARAM_ID, formId);
    html = html.replace(PARAM_LABEL, label);

    return html;
  };

  //-------------------------------------------------------------------------
  //--- Input combobox field
  //-------------------------------------------------------------------------
  /*
         ASCII art... TODO
  */

  //-- HTML code template
  //-- Ex. <option value="10" selected>Decimal</option>
  const COMBOBOX_OPTION_TEMPLATE=`
    <option value="${PARAM_VALUE}" ${PARAM_SELECTED}>
      ${PARAM_LABEL}
    </option>
  `;

  //-- HTML template for the combobox input
  const FORM_COMBOBOX_TEMPLATE = `
  <div class="form-group">
    <label style="font-weight:normal">${PARAM_LABEL}</label>
    <select class="form-control" id="form${PARAM_ID}">
      ${PARAM_OPTIONS}
    </select>
  </div>
`;

  //----------------------------------------------------
  //-- create the html code for the option tag
  //-- INPUTS:
  //--   * value: Value for the option
  //--   * selected: If this option is de default
  //--   * label: Text assigned to the option
  //--
  //--  Returns:
  //--    -A string with the HTML code
  //----------------------------------------------------
  this.htmlComboboxOption = function(value, selected, label) {

    //-- Insert the parameters in the html TEMPLATE
    let html = COMBOBOX_OPTION_TEMPLATE.replace(PARAM_VALUE, value);
    html = html.replace(PARAM_SELECTED, selected);
    html = html.replace(PARAM_LABEL, label);

    return html;
  };

  //-------------------------------------------------------------------------
  //-- create the html code for a Combobox input Field
  //-- INPUTS:
  //--   * options: Array of options. Each option have the attributes:
  //--        -value
  //--        -label
  //--   * value: Default Value for the option
  //--   * selected: If this option is the default
  //--   * label: Text assigned to the option
  //--
  //--  Returns:
  //--    -A string with the HTML code
  //-------------------------------------------------------------------------
  this.htmlInputCombobox = function(options, label, value, formId) {

    //-- Array with the html code generated by the options
    let opts = [];

    //-- Apply to every option in the combobox
    options.forEach( (op) => {
  
      //-- Is this option selected by default?
      let selected = (value === op.value) ? 'selected' : '';
  
      //-- Generate the html code for that option
      let html = this.htmlComboboxOption(op.value, selected, op.label);
  
      //-- Store in the array
      opts.push(html);
    });

    //-- Join all the option into a single string
    opts = opts.join('');

    //-- Insert the parameters in the Combox HTML template
    let html = FORM_COMBOBOX_TEMPLATE.replace(PARAM_LABEL, label);
    html = html.replace(PARAM_ID, formId);
    html = html.replace(PARAM_OPTIONS, opts);
    
    return(html);
  };









  this.test = function() {
    console.log("holi...");
  };



});

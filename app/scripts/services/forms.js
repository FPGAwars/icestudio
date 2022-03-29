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
  const PARAM_COLOR = "%COLOR%";
  const PARAM_COLOR_NAME = "%COLOR_NAME%";

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
           value="${PARAM_VALUE}"
           autocomplete="off"/>
    `;

  //-----------------------------------------------------------
  //-- Create the html code for an input Text field
  //-- INPUTS:
  //--   * msg: Text message to shown as a title
  //--   * value: Current value (if any)
  //--   * formID: Form identifier number
  //--
  //-- Returns:
  //--   -A string with the HTML code for that Field
  //-----------------------------------------------------------
  this.htmlInputText = function(msg, value, formId) {

    //-- Insert the parameters in the html code template
    let html = FORM_TEXT_TEMPLATE.replace(PARAM_TEXT, msg);
    html = html.replace(PARAM_VALUE, value);
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
         Label
        +-----------------+
        | Option        v |
        +-----------------+  
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

  //-------------------------------------------------------------------------
  //--- Input color dropdown field
  //-------------------------------------------------------------------------
  /*
        Label
        +-----------------+
        | o Color       v |
        +-----------------+  
  */

  //-- HTML template for the combobox input
  const FORM_COLOR_INPUT_TEMPLATE = `
    <div class="form-group">
       <label style ="font-weight:normal"> ${PARAM_LABEL} </label>
       <div class="lb-color--dropdown">
         <div class="lb-dropdown-title">
  
           <!-- The current color is the one found in spec.color -->
           <span class="lb-selected-color color-${PARAM_COLOR}"
             data-color="${PARAM_COLOR}"
             data-name="${PARAM_COLOR_NAME}"> 
           </span> 
           ${PARAM_COLOR_NAME}
           <span class="lb-dropdown-icon"></span>
         </div>
       
         <div class="lb-dropdown-menu">
  
         <div class="lb-dropdown-option" 
           data-color="indianred" 
           data-name="IndianRed">
             <span class="lb-option-color color-indianred">
             </span>
             IndianRed
         </div>
         
         <div class="lb-dropdown-option" 
           data-color="red" 
           data-name="Red">
             <span class="lb-option-color color-red">
             </span>
             Red
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="deeppink" 
           data-name="DeepPink">
             <span class="lb-option-color color-deeppink">
             </span>
             DeepPink
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="mediumvioletred"
           data-name="MediumVioletRed">
             <span class="lb-option-color color-mediumvioletred">
             </span>
             MediumVioletRed
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="coral"
           data-name="Coral">
             <span class="lb-option-color color-coral"></span>
             Coral
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="orangered"
           data-name="OrangeRed">
             <span class="lb-option-color color-orangered"></span>
             OrangeRed
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="darkorange"
           data-name="DarkOrange">
             <span class="lb-option-color color-darkorange"></span>
             DarkOrange
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="gold"
           data-name="Gold">
             <span class="lb-option-color color-gold"></span>
           Gold
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="yellow"
           data-name="Yellow">
             <span class="lb-option-color color-yellow"></span>
             Yellow
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="fuchsia"
           data-name="Fuchsia">
             <span class="lb-option-color color-fuchsia"></span>
             Fuchsia
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="slateblue"
           data-name="SlateBlue">
             <span class="lb-option-color color-slateblue"></span>
             SlateBlue
         </div>
         <div class="lb-dropdown-option" 
           data-color="greenyellow"
           data-name="GreenYellow">
             <span class="lb-option-color color-greenyellow"></span>
             GreenYellow
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="springgreen"
           data-name="SpringGreen">
             <span class="lb-option-color color-springgreen"></span>
             SpringGreen
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="darkgreen"
           data-name="DarkGreen">
             <span class="lb-option-color color-darkgreen"></span>
             DarkGreen
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="olivedrab"
           data-name="OliveDrab">
             <span class="lb-option-color color-olivedrab">
             </span>
             OliveDrab
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="lightseagreen" 
           data-name="LightSeaGreen">
             <span class="lb-option-color color-lightseagreen"></span>
             LightSeaGreen
         </div> 
  
         <div class="lb-dropdown-option" 
           data-color="turquoise"
           data-name="Turquoise">
             <span class="lb-option-color color-turquoise"></span>
             Turquoise
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="steelblue"
           data-name="SteelBlue">
             <span class="lb-option-color color-steelblue"></span>
             SteelBlue
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="deepskyblue"
           data-name="DeepSkyBlue">
             <span class="lb-option-color color-deepskyblue"></span>
             DeepSkyBlue
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="royalblue"
           data-name="RoyalBlue">
             <span class="lb-option-color color-royalblue"></span>
             RoyalBlue
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="navy"
           data-name="Navy">
             <span class="lb-option-color color-navy"></span>
             Navy
         </div>
  
         <div class="lb-dropdown-option" 
           data-color="lightgray"
           data-name="LightGray">
             <span class="lb-option-color color-lightgray"></span>
            LightGray
         </div>
         
        </div>
      </div>
    </div>
  `;

  //-----------------------------------------------------------
  //-- Create the html code for an input color dropdown field
  //-- INPUTS:
  //--   * label: Text message to shown as a title
  //--   * color: Color value
  //--   * colorName: Color name
  //--
  //-- Returns:
  //--   -A string with the HTML code for that Field
  //-----------------------------------------------------------
  this.htmlInputColor = function(label, color, colorName) {

    //-- Insert the parameters in the html code template
    let html = FORM_COLOR_INPUT_TEMPLATE.replace(
                  PARAM_LABEL,
                  label);

    html = html.replaceAll(PARAM_COLOR, color);
    html = html.replaceAll(PARAM_COLOR_NAME, colorName);

    return html;
  };


  //-----------------------------------------------------------------------
  //-- Display a Form
  //-- Input: specs. Form specifications for rendering
  //--    * form: Form structure. It is an array of fields.They all have 
  //--       the property type: Which kind of information should be 
  //--         displayed. The field available are:
  //--          -Text, checkbox, combobox, color-dropdown
  //-- 
  //--    * callback(evt, values); The callback is executed when 
  //--          the users click on OK
  //-----------------------------------------------------------------------
  this.displayForm = function (form, callback) {

    //-- Variable for storing the html code of all the fields
    let formHtml = [];

    //-- Variable for storing temporal html code
    let html;

    //-- Initial tag for the Form
    formHtml.push('<div>');

    //-- Generate the html code for all the fields in the form
    for (let i in form) {
      var field = form[i];

      //-- Process all the form fields
      switch (field.type) {
        
        //-- Text input field
        case 'text':

          //-- Create the html code
          html = this.htmlInputText(field.title, field.value, i);

          //-- Store the html for this Form
          formHtml.push(html);
          break;

        //-- Checkbox input field
        case 'checkbox':

          //-- Create the html code for an input checkbox field
          html = this.htmlInputCheckbox(
            field.label, 
            field.value,
            i);

          //-- Store the html for this Field
          formHtml.push(html);
          break;

        //-- Combobox input field
        case 'combobox':

          //-- Create the html code for an input Combobox field
          html = this.htmlInputCombobox(
            field.options,
            field.label,
            field.value,
            i);
            
          //-- Store the html for this Field
          formHtml.push(html);
          break;

        //-- Color-Dropdown input Field
        case 'color-dropdown':
          

          //-- Set the default color if not previously defined
          field.color = field.color || "fuchsia";

          //-- Get the color with the first letter as capital
          let colorName = field.color.charAt(0).toUpperCase() + 
                          field.color.slice(1);

          //-- Create the html code for an input Color field
          html = this.htmlInputColor(
            field.label, 
            field.color,
            colorName);

          //-- Store the html for this Field
          formHtml.push(html);
          break;
      }
    }

    //-- Closing tag for the Form
    formHtml.push('</div>');

    //-- Generate a string with the HTML by joining
    //-- all the html of the fields
    formHtml = formHtml.join('');

    //-- Display the Form
    alertify.confirm(formHtml)

        //-- If the user has pressed the OK button...
      .set('onok', function (evt) {

        //-- Initialize the values for calling the
        //-- callback function
        let values = [];

        //-- Temporal variable for storing a field value
        let value;

        //-- If there is a callback function as argument
        if (callback) {

          //-- Read the values from the Form fields
          //-- and insert them into the values array
          for (let i in form) {

            let field = form[i];

            //-- Read the value depending on the field type
            switch (field.type) {

              //-- Input text and input combobox
              case 'text':
              case 'combobox':

                //-- Read the value from the form i
                value = $('#form' + i).val();

                //-- Add the value to the array
                values.push(value);
                break;

              //-- Input checkbox
              case 'checkbox':

                //-- Read the value from the form i
                value = $($('#form' + i).prop('checked'));
                value = value[0];

                //-- Add the value to the array
                values.push(value);
                break;

              //-- Input color dropdown menu
              case 'color-dropdown':

                //-- Read the value
                value = $('.lb-selected-color').data('color');

                //-- Add the value to the array
                values.push(value);
                break;
            }
          }
          //-- Now we can call the callback function passing
          //-- all the values as arguments
          callback(evt, values);
        }
      })

      //-- The button cancel is pressed:
      //--   Do nothing... 
      .set('oncancel', function ( /*evt*/) { });
  };




//---------------------------------------------------------------------------


  this.test = function() {
    console.log("holi...");
  };



});

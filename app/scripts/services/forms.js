//---------------------------------------------------------------------------
//-- Forms managment
//---------------------------------------------------------------------------
'use strict';

//-- Disable the jshint Warning: "xxxx defined but never used"
/* jshint unused:false */

angular.module('icestudio')
  .service('forms', 
    function (
      gettextCatalog,
      common
    ) 
{

  //-- Constant for the Field Clases
  const FIELD_TEXT = 'text';
  const FIELD_CHECKBOX = 'checkbox';
  const FIELD_COLOR = 'color-dropdown';

  //-- Constants for the Field Parameters
  const PARAM_TEXT = "%TEXT%";
  const PARAM_ID = "%ID%";
  const PARAM_VALUE = "%VALUE%";
  const PARAM_LABEL = "%LABEL%";
  const PARAM_OPTIONS = "%OPTIONS%";
  const PARAM_SELECTED = "%SELECTED%";
  const PARAM_COLOR = "%COLOR%";
  const PARAM_COLOR_NAME = "%COLOR_NAME%";

  //------------------------ HTML TEMPLATES for the Fields

  //-- Input text
  const FORM_TEXT_TEMPLATE = `
  <p> ${PARAM_TEXT} </p>
  <input class="ajs-input" 
         type="text" 
         id="form${PARAM_ID}" 
         value="${PARAM_VALUE}"
         autocomplete="off"/>
  `;

   //-- Checkbox
   const FORM_CHECKBOX_TEMPLATE = `
   <div class="checkbox">
     <label>
       <input type="checkbox" ${PARAM_VALUE} id="form${PARAM_ID}"/>
       ${PARAM_LABEL}
     </label>
   </div>
 `;

   //-- HTML template for the color dropdown input
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

  //---------------------------------------------------------
  //-- TEXTFIELD. It represents a Form Input text field
  //---------------------------------------------------------
  //-- This is how it is rendered in the Form
  /*
         text message
        +-----------------+
        | Input text      |
        +-----------------+ 
   
  */
  class TextField {

    //-----------------------------------------------------------------------
    //-- Input parameters:
    //--   * Label: Text place above the input box
    //--   * value: Default value
    //--   * formId: Form identification number
    //-----------------------------------------------------------------------
    constructor(label, value, formId) {

      this.type = FIELD_TEXT;
      this.label = label;
      this.value = value;
      this.formId = formId;
    }

    //---------------------------------------------------------
    //-- Return a string whith the HTML code for this field
    //---------------------------------------------------------
    html() {

      //-- Generate the HTML code

      //-- Insert the parameters in the html code template
      let html = FORM_TEXT_TEMPLATE.replace(PARAM_TEXT, this.label);
      html = html.replace(PARAM_VALUE, this.value);
      html = html.replace(PARAM_ID, this.formId);

      return html;
    }

    //---------------------------------------------
    //-- Read the Field value
    //---------------------------------------------
    read() {

      //-- Read the value from the DOM
      let value = $(`#form${this.formId}`).val();

      return value;
    }

  }

  //-------------------------------------------------------------------------
  //--- CHECKBOX FIELD. Input checkbox field
  //-------------------------------------------------------------------------
    //-- This is how it is rendered in the Form
  /*
         [ ] Label
  */
  class CheckboxField {

    //-----------------------------------------------------------------------
    //-- Input parameters:
    //--   * Label: Text place to the right of the checkbox
    //--   * value: Default value
    //--   * formId: Form identification number
    //-----------------------------------------------------------------------
    constructor(label, value, formId) {

      this.type = FIELD_CHECKBOX;
      this.label = label;
      this.value = value;
      this.formId = formId;
    }

    //---------------------------------------------------------
    //-- Return a string whith the HTML code for this field
    //---------------------------------------------------------
    html() {
      //-- Generate the HTML code

      //-- Insert the parameters in the html code template
      let html = FORM_CHECKBOX_TEMPLATE.replace(
        PARAM_VALUE,
        (this.value ? 'checked' : ''));

      html = html.replace(PARAM_ID, this.formId);
      html = html.replace(PARAM_LABEL, this.label);

      return html;
    }

  }

  //-------------------------------------------------------------------------
  //--- COLOR FIELD. Input color dropdown field
  //-------------------------------------------------------------------------
  /*
        Label
        +-----------------+
        | o Color       v |
        +-----------------+  
  */

  class ColorField {
    //-----------------------------------------------------------------------
    //-- Create the html code for an input color dropdown field
    //-- INPUTS:
    //--   * Label: Text place above the color input box
    //--   * color: Color value (String)
    //--   * colorName: Color name (String)
    //--
    //-- Returns:
    //--   -A string with the HTML code for that Field
    //-----------------------------------------------------------------------
    constructor(label, color, colorName) {
      this.type = FIELD_COLOR;
      this.label = label;
      this.color = color;
      this.colorName = colorName;
    }
    
     //---------------------------------------------------------
    //-- Return a string whith the HTML code for this field
    //---------------------------------------------------------
    html() {
      //-- Generate the HTML code

      //-- Insert the parameters in the html code template
      let html = FORM_COLOR_INPUT_TEMPLATE.replace(
        PARAM_LABEL,
        this.label);

      html = html.replaceAll(PARAM_COLOR, this.color);
      html = html.replaceAll(PARAM_COLOR_NAME, this.colorName);

      return html;
    }

  }



  //-------------------------------------------------------------------------
  //-- Constant for working with HTML FORMS
  //-------------------------------------------------------------------------
  //-- Each input Form has diffefrent Fields:
  //--  * Text : For entering texts (Ex. port names)
  //--  * Checkbox: on/off (Ex. FPGA pin/ virtual pin)
  //--  * Combobox. Multiple selection. (Ex. Address format )
  //--  * Color selection dropmenu

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


  class Form {

    //-- Build a blank form
    constructor() {

      //-- Array of fields
      this.fields = [];
    }

    //------------------------------------------------------
    //-- Parse the block names. The spaces are removed  
    //-- and the individual names obtained (if they are
    //-- separated by comas)
    //--
    //-- INPUT: 
    //--   * value: String introduced by the user
    //-- Returns:
    //--   An array of string with the names of the ports
    //------------------------------------------------------
    //-- Example: If the user enters " a, b, c[1:0]",
    //-- It returns: ["a", "b", "c[1:0]"]
    //------------------------------------------------------
    static parseNames(names) {
  
      //-- First: remove the initial and ending spaces, if any
      let text = names.trim();
  
      //-- Second: Remove the spaces around the commas (,) 
      text = text.replace(/\s*,\s*/g, ',');
  
      //-- Third: Get the Input block names as a list of strings
      let finalNames = text.split(',');
  
      //-- Return an array with the names
      return finalNames;
    }   

    //---------------------------------------------------
    //-- Parse the Port names
    //-- 
    //-- INPUT:
    //--   * name: String (Ex: "a[7:0]")
    //--
    //-- Returns:
    //--   * null: No match (Syntax error)
    //--   * PortInfo structure:
    //--      -name: Port name (Ex. "a")
    //--      -rangstr: Range string (Ex. "[7:0]")
    //--      -size: Port size
    //----------------------------------------------------
    static parsePortName(portName) {

      //-- Pattern for partsin the port names
      let pattern = common.PATTERN_PORT_LABEL;

      //-- Parse the name
      let match = pattern.exec(portName);

      //-- match[0]: global match
      //-- match[1]: Initial word: name
      //-- match[2]: Range (Ex. [7:0])
      //-- match[3]: Most significant byte in the range (Ex. 7)
      //-- match[4]: Less significant byte in the range (Ex. 0)

      if (match) {

        //--There is a full match
        if (match[0] === match.input) {

          //-- Return object
          let portInfo = {};

          //-- Get the name and rangestr
          portInfo.name = match[1] || '';
          portInfo.rangestr = match[2];

          //-- Let's calculate the size

          //-- If it is a bus...
          if (portInfo.rangestr) {

            //-- Get the range left and right numbers
            let left = parseInt(match[3]);
            let right = parseInt(match[4]);

            portInfo.size = Math.abs(left - right) + 1;
          }
          //-- It is an isolated wire
          else {
            portInfo.size = 1;
          }

          //-- No more checkings....
          //-- TODO: Size checking
          return portInfo;
        }

      }
      //-- No match
      return null;

    } 

    //------------------------------------
    //-- Add a field to the form
    //------------------------------------
    addField(field) {
      this.fields.push(field);
    }

    //------------------------------------------------------------------
    //-- Read all the inputs from the fields introduced by the user
    //-- Returns: An array of values
    //------------------------------------------------------------------
    readFields() {

      //-- Array were the values will be stored 
      let values = [];

      //-- Temporal variable for storing a field value
      let value;

      //-- Read the values from the Form fields
      //-- and insert them into the values array
      this.fields.forEach( field => {

        //-- Read the value depending on the field type
        switch (field.type) {

          //-- Input text
          case FIELD_TEXT:

            //-- Read the value from the field
            value = field.read(); 
            break;

          //-- Checkbox
          case FIELD_CHECKBOX:

            //-- Read the value from the form i
            value = $($('#form' + field.formId).prop('checked'));
            value = value[0];
            break;

          //-- Color input
          case FIELD_COLOR:

            //-- Read the value 
            value = $('.lb-selected-color').data('color');            
            break;

        }

        //-- Add the value to the array
        values.push(value);

      });

      //-- Return all the values
      return values;
    }


    //-------------------------------------
    //-- Generate the HTML of the form
    //-------------------------------------
    html() {

      //-- Variable for storing the html code
      let formHtml = [];

      //-- Variable for storing the field HTML code
      let fieldHtml;

      //-- Initial tag for the Form
      formHtml.push('<div>');

      //-- Generate the html for all the fields in the form
      this.fields.forEach( field => {

        //-- Create the html code
        fieldHtml = field.html();

        //-- Store the html for this Field
        formHtml.push(fieldHtml);

      });

      //-- Closing tag for the Form
      formHtml.push('</div>');

      //-- Create the string
      let html = formHtml.join('\n');

      //-- return the HTML code
      return html;

    }

    //-----------------------------------------------------------------
    //-- Display the Form
    //-- INPUT:
    //--   * callback: Function called when the OK button is pressed
    //-----------------------------------------------------------------
    display(callback) {

      //-- Create the HTML
      let html = this.html();

      //-- Display the Form
      alertify.confirm(html)

        //-- Set the callback for the OK button
        .set('onok', callback )

        //-- Set the callback for the Candel button:
        //--   Do nothing... 
        .set('oncancel', function ( /*evt*/) { });

    }

    //-- Evaluate the Form
    evaluate() {
      //-- TODO.....
    }
  }



  class FormBasicInput extends Form {

  //-------------------------------------------------------------------------
  //-- Create the form for the INPUT PORTS
  //-------------------------------------------------------------------------
  //-- Form:
  //----------------------------------------+
  //--    Enter the input blocks            |
  //--    +--------------------------+      |
  //--    | Pin names                |      |
  //--    +--------------------------+      |
  //--                                      |
  //--    [✅️] FPGA pin                     |
  //--    [  ] Show clock                   |
  //----------------------------------------+
    constructor(label = '', virtual=true, clock=false) {

      //-- Create a blank Form (calling the upper Class)
      super();

      //-------- Add the diffent Fields:

      //-- Field 0: Text input
      let field0 = new TextField(
        gettextCatalog.getString('Enter the input blocks'),
        label,   //-- Default value
        0        //-- Field id
      );

      //-- Field 1: Checkbox for selecting if the input block
      //-- is an FPGA pin or an internal port
      let field1 = new CheckboxField(
        gettextCatalog.getString('FPGA pin'),
        virtual,  //-- Default value
        1         //-- Field id
      );
      
      //-- Field 2: Checkbox for configuring the input pin
      //--          as a clock
      let field2 = new CheckboxField(
        gettextCatalog.getString('Show clock'),
        clock,  //-- Default value
        2       //-- Field id
      );

      //-- Add the fields to the form
      super.addField(field0);
      super.addField(field1);
      super.addField(field2);

      //-- Control the notifications generated by 
      //-- the errors when processing the form
      this.resultAlert = null;

      //-- The form has been created by the information
      //-- has not yet been processed
      this.processed = false;
    }

    //------------------------------------------------
    //-- Process the information enter by the user
    //------------------------------------------------
    process(evt) {

      console.log("PROCESS THE FORM!!");

      //-- Read the values from the form
      let values = super.readFields();

      //-- Values[0]: Input pin names
      //-- Parse the input names
      let names = Form.parseNames(values[0]);

      //-- Values[1] indicates if it is a virtual pin or not
      let virtual = !values[1];

      //-- values[2] indicates if this is a clock input
      let clock = values[2];

      //-- If there was a previous notification, dismiss it
      if (this.resultAlert) {
        this.resultAlert.dismiss(false);
      }
      
      //--------- Validate the values

      //-- Variables for storing the port information
      let portInfos = [];
      let portInfo;

      //-- Analyze all the port names...
      for (let name of names) {

        //-- Get the port Info: port name, size...
        portInfo = Form.parsePortName(name);

        //-- No portInfo... The was a syntax error
        if (!portInfo) {
            //-- Do not close the form
            evt.cancel = true;

            //-- Show a warning notification
            this.resultAlert = alertify.warning(
                gettextCatalog.getString('Wrong block name {{name}}', 
                                        { name: name }));
            return;
        }

        //-- TODO: Check sizes

        //-- Check particular errors
        //-- Error: Buses cannot be clocks...
        if (portInfo.rangestr && clock) {
          evt.cancel = true;

          //-- Show a notification with the warning
          this.resultAlert = alertify.warning(
              gettextCatalog.getString('Clock not allowed for data buses'));
          return;
        }
        

        //-- Close the form when finish
        evt.cancel = false;
        portInfos.push(portInfo);

        //-- The processing is done
        //-- Store the results
        this.portInfos = portInfos;
        this.virtual = virtual;
        this.clock = clock;
        this.processed = true;
      }

    }

  }


  //-------------------------------------------------------------------------
  //-- Create the form for the OUTPUT PORTS
  //-- Returns:
  //--   * The object Form for the Output ports
  //-------------------------------------------------------------------------
  //-- Form:
  //----------------------------------------+
  //--    Enter the output blocks           |
  //--    +--------------------------+      |
  //--    | Pin names                |      |
  //--    +--------------------------+      |
  //--                                      |
  //--    [✅️] FPGA pin                     |
  //----------------------------------------+
  function basicOutputForm() {

    //-- Create a blank Form
    let form = new Form();

    //-- Field 0: Text input
    let field0 = new TextField(
      gettextCatalog.getString('Enter the output blocks'),
      '',   //-- Default value
      0     //-- Field id
    );

    //-- Field 1: Checkbox for selecting if the output block
    //-- is an FPGA pin or an internal port
    let field1 = new CheckboxField(
      gettextCatalog.getString('FPGA pin'),
      true,  //-- Default value
      1      //-- Field id
    );

    //-- Add the fields to the form
    form.addField(field0);
    form.addField(field1);

    //-- Return the form
    return form;
  }

  //-------------------------------------------------------------------------
  //-- Create the form for the INPUT Labels
  //-- Returns:
  //--   * The object Form
  //-------------------------------------------------------------------------
  //-- Form:
  //----------------------------------------+
  //--    Enter the input label             |
  //--    +--------------------------+      |
  //--    | Label names              |      |
  //--    +--------------------------+      |
  //--                                      |
  //--    Chose a color                     |
  //--    +--------------------------+      |
  //--    | o Fucshia                |      |
  //--    +--------------------------+      |
  //--                                      |
  //----------------------------------------+
  function basicInputLabelForm() {

    //-- Create a blank Form
    let form = new Form();

    //-- Field 0: Text input
    let field0 = new TextField(
      gettextCatalog.getString('Enter the input label'),
      '',   //-- Default value
      0     //-- Field id
    );

    //-- Field 1: Color dropdown
    let field1 = new ColorField(
      gettextCatalog.getString('Choose a color'),
      "fuchsia",
      "Fuchsia"
    );

    //-- Add the fields to the form
    form.addField(field0);
    form.addField(field1);

    //-- Return the form
    return form;
  
  }

//-------------------------------------------------------------------------
  //-- Create the form for the OUTPUT Labels
  //-- Returns:
  //--   * The object Form
  //-------------------------------------------------------------------------
  //-- Form:
  //----------------------------------------+
  //--    Enter the input label             |
  //--    +--------------------------+      |
  //--    | Label names              |      |
  //--    +--------------------------+      |
  //--                                      |
  //--    Chose a color                     |
  //--    +--------------------------+      |
  //--    | o Fucshia                |      |
  //--    +--------------------------+      |
  //--                                      |
  //----------------------------------------+
  function basicOutputLabelForm() {

    //-- Create a blank Form
    let form = new Form();

    //-- Field 0: Text input
    let field0 = new TextField(
      gettextCatalog.getString('Enter the output label'),
      '',   //-- Default value
      0     //-- Field id
    );

    //-- Field 1: Color dropdown
    let field1 = new ColorField(
      gettextCatalog.getString('Choose a color'),
      "fuchsia",
      "Fuchsia"
    );

    //-- Add the fields to the form
    form.addField(field0);
    form.addField(field1);

    //-- Return the form
    return form;
  
  }

  function basicPairedLabelForm() {

    //-- Create a blank Form
    let form = new Form();

    //-- Field 0: Text input
    let field0 = new TextField(
      gettextCatalog.getString('Enter the paired labels name'),
      '',   //-- Default value
      0     //-- Field id
    );

    //-- Field 1: Color dropdown
    let field1 = new ColorField(
      gettextCatalog.getString('Choose a color'),
      "fuchsia",
      "Fuchsia"
    );

    //-- Add the fields to the form
    form.addField(field0);
    form.addField(field1);

    //-- Return the form
    return form;
  }




  //-- Public classes
  this.Form = Form;
  this.TextField = TextField;
  this.CheckboxField = CheckboxField;
  this.basicOutputForm = basicOutputForm;
  this.basicInputLabelForm = basicInputLabelForm;
  this.basicOutputLabelForm = basicOutputLabelForm;
  this.basicPairedLabelForm = basicPairedLabelForm;

  this.FormBasicInput = FormBasicInput;

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
        case FIELD_TEXT:

          //-- TEMP CODE. REMOVE IT WHEN REFACTORED
          let f = new TextField(field.title, field.value, i);

          //-- Create the html code
          //-- label, value, formId
          html = f.html();
          //html = this.htmlInputText(field.title, field.value, i);

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

/**
 * Parth's Apps Script Utilities
 * Changes
 * 1/Aug/2023
 * - Initial release
 */

String.prototype.toCamelCase = function () {
  return this.toString()
    .toLocaleLowerCase()
    .trim()
    .split(/\s+/)
    .map((v, i) => (i === 0 ? v : v.charAt(0).toUpperCase() + v.substring(1)))
    .join("");
};

String.prototype.toPascalCase = function () {
  return this.toString()
    .toLocaleLowerCase()
    .trim()
    .split(/\s+/)
    .map((v) => v.charAt(0).toUpperCase() + v.substring(1))
    .join("");
};

/**
 * Get the value from an array by index (negative indexing)
 * @param {number} index The index of the item (-1 means the last one)
 * @return {any}
 */
Array.prototype.getValueByIndex = function (index) {
  index = index * 1;
  if (index >= 0) return this[index];
  if (index * -1 > this.length) return undefined;
  return this.slice(index)[0];
};

/***
 * items = [
    { caption: 'Item 1', action: 'menuItem1' },
    { caption: 'Item 2', action: 'menuItem2' },
    null, // Separator
    {
      name: 'Submenu', items: [
        { caption: 'Subitem 1', action: 'subMenuItem1' },
        { caption: 'Subitem 2', action: 'subMenuItem2' },
      ]
    },
  ];
  name is name of the menu

 */
function _createMenu_(name, items, submenu = false) {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu(name);
  items.forEach((item) => {
    if (!item) return menu.addSeparator();
    if (item.name) {
      return menu.addSubMenu(_createMenu_(item.name, item.items, true));
    }
    if (item.caption && item.action) {
      return menu.addItem(item.caption, item.action);
    }
    return menu.addSeparator();
  });
  if (submenu) return menu;
  menu.addToUi();
}

/**
 * Convert a list of headers into keys in camcel case by default
 * @param {string[]} headers A list of headers
 * @param {boolean} useCamelCase Use camelCase if true, else PascalCase is sued
 * @returns {string[]}
 */
function _createKeys_(headers, useCamelCase = true) {
  return headers.map((v) => {
    if (useCamelCase) {
      return v.toCamelCase();
    } else {
      return v.toString().toPascalCase();
    }
  });
}

/**
 * Build an object by mapping the values into keys by the indexes
 * @param {string[]} keys A list of keys
 * @param {any[]} A list of values
 * @returns {object} An item object
 */
function _createItem_(keys, values) {
  const item = {};
  keys.forEach((k, i) => (item[k] = values[i]));
  return item;
}

/**
 * Build an array by mapping the item object with  a list of keys
 * @param {string[]} keys A list of keys
 * @param {object} item A item object
 * @param {any[]} currentValues A list of the original values
 * @returns {any[]} A list of values
 */
function _createRowValues_(keys, item, currentValues = null) {
  return keys.map((k, i) => {
    if (k in item) return item[k];
    if (currentValues) return currentValues[i];
    return null;
  });
}

/**
 * Get a list of item object from a sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet where the data is stored
 * @param {Function} filterFunction A callback function to filter the array of items
 * @returns {object[]}
 */
function _getItemsFromSheet_(sheet, filterFunction = null) {
  const [headers, ...values] = sheet.getDataRange().getValues();
  const keys = _createKeys_(headers);
  const items = [];
  values.forEach((v, i) => {
    const item = _createItem_(keys, v);
    item._rowIndex = i + 2;
    if (!filterFunction) return items.push(item);
    if (filterFunction(item)) return items.push(item);
  });
  return items;
}

/**
 * Get a list of display item object from a sheet
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet The sheet where the data is stored
 * @param {Function} filterFunction A callback function to filter the array of items
 * @returns {object[]}
 */
function _getDisplayItemsFromSheet_(sheet, filterFunction = null) {
  const [headers, ...values] = sheet.getDataRange().getDisplayValues();
  const keys = _createKeys_(headers);
  const items = [];
  values.forEach((v, i) => {
    const item = _createItem_(keys, v);
    item._rowIndex = i + 2;
    if (!filterFunction) return items.push(item);
    if (filterFunction(item)) return items.push(item);
  });
  return items;
}

/**
 * Get the Spreadsheet Ui Object
 * @returns {GoogleAppsScript.Base.Ui}
 */
function _getUi_() {
  return SpreadsheetApp.getUi();
}

/**
 * Send a toast message to the active sheet
 * @param {string} message The toast message
 * @param {string} title The title of the toast
 * @param {number} [10] timeout The timeout in seconds
 */
function _toast_(message, title = "Toast", timeout = 4) {
  SpreadsheetApp.getActive().toast(message, title, timeout);
}

/**
 * Show an alert in the spreadsheet
 * @param {string} message The message to show in the alert
 * @param {string} title The title of the alert
 * @return {GoogleAppsScript.Base.PromptResponse}
 */
function _alert_(message, title = "Alert") {
  const ui = SpreadsheetApp.getUi();
  return ui.alert(title, message, ui.ButtonSet.OK);
}

/**
 * Show a confirm dialog in the spreadsheet
 * @param {string} message The message to show in the alert
 * @param {string} title The title of the alert
 * @return {GoogleAppsScript.Base.PromptResponse}
 */
function _confirm_(message, title = "Confirm") {
  const ui = SpreadsheetApp.getUi();
  return ui.alert(title, message, ui.ButtonSet.YES_NO) == ui.Button.YES;
}

/**
 * Show a prompt in the spreadsheet
 * @param {string} message The message to show in the alert
 * @param {string} title The title of the alert
 * @return {GoogleAppsScript.Base.PromptResponse}
 */
function _prompt_(message, title = "Prompt") {
  const ui = SpreadsheetApp.getUi();
  return ui.prompt(title, message, ui.ButtonSet.OK_CANCEL);
}


/**
 * Save values to a sheet
 * @param {any[][]} values An 2D array
 * @param {string | GoogleAppsScript.Spreadsheet.Sheet} sheet A sheet or a name of the sheet
 * @param {number} headerRowAt The row position of the header (starts from 1)
 * @param {number} headerColumnStart The start position of the header column (starts from 1)
 * @param {boolean} clearContents Clear the current contents (false will append as new data)
 * @param {boolean} clearFormats Clear the current foramts
 */
function _valuesToSheet_(
  values,
  sheet,
  headerRowAt = 1,
  headerColumnStart = 1,
  clearContents = true,
  clearFormats = true
) {
  if (typeof sheet === "string") {
    sheet =
      SpreadsheetApp.getActive().getSheetByName(sheet) ||
      SpreadsheetApp.getActive().insertSheet(sheet);
  }
  const [headers, ...items] = values;
  const rangeToBeCleared = sheet.getRange(
    headerRowAt,
    headerColumnStart,
    sheet.getMaxRows() - headerRowAt + 1,
    sheet.getMaxColumns() - headerColumnStart + 1
  );
  if (clearContents) {
    rangeToBeCleared.clearContent();
  }
  if (clearFormats) {
    rangeToBeCleared.clearFormat();
  }
  if (!headers || headers.length === 0) return sheet;
  sheet
    .getRange(headerRowAt, headerColumnStart, 1, headers.length)
    .setValues([headers]);
  if (!items || items.length === 0) return;
  sheet
    .getRange(
      sheet.getLastRow() + 1,
      headerColumnStart,
      items.length,
      items[0].length
    )
    .setValues(items);
  return sheet;
}


/**
 * Get the id from a Google Doc or Google Folder URL
 * @param {string} url A folder URL or file url
 * @return {string} An file id on Google Drive
 */
function _getIdFromUrl_(url) {
  if (/\/d\//.test(url)) {
    return url.split(/\/d\//)[1].split(/[\/|\?]/)[0];
  }
  if (/\/folders\//.test(url)) {
    return url.split(/\/folders\//)[1].split(/[\/|\?]/)[0];
  }
  return url;
}


function _getSheetById_(id) {
  if (typeof id === "number") {
    return SpreadsheetApp.getActive()
      .getSheets()
      .find((v) => v.getSheetId() == id);
  }
  return SpreadsheetApp.getActive().getSheetByName(id);
}


function _daysBetweenTwo_(startDate, endDate) {
  return Math.floor((endDate - startDate) / (24 * 60 * 60 * 1000));
}

function _getErrorMessage_(error) {
  return error.stack
    ? error.stack.split("\n").slice(0, 2).join("\n")
    : error.message;
}

function _tryAction_(functionName, title = "Script") {
  try {
    functionName();
  } catch (error) {
    console.log(error.stack);
    const msg = _getErrorMessage_(error);
    _alert_(msg, title);
  }
}

/**
 * Open an HTML dialog
 * @param {string} html The html content to be displayed in the dialog
 * @param {string} title The title of the dialog
 * @param {number}[450] width The width in px
 * @param {number} [500] height The height in px
 * @returns {void}
 */
function _openDialog_(html, title, width = 540, height = 460) {
  const divStyle = {
    "font-family": "Roboto,RobotoDraft,Helvetica,Arial,sans-serif",
  };
  html = `<div style='${_createStyle_(divStyle)}'>${html}</div>`;
  const dialog = HtmlService.createHtmlOutput(html)
    .setTitle(title)
    .setWidth(width)
    .setHeight(height);
  SpreadsheetApp.getActive().show(dialog);
}

/** */
function _openLink_(link, title = "Open Link") {
  const divStyle = {
    "font-family": "Roboto,RobotoDraft,Helvetica,Arial,sans-serif",
  };
  const buttonStyle = {
    cursor: "pointer",
    "border-radius": "4px",
    "font-weight": 500,
    "font-size": "14px",
    height: "36px",
    "letter-spacing": "0.25px",
    "line-height": "16px",
    padding: "9px 24px 11px 24px",
    border: "1px solid #dadce0",
    color: "#137333",
    background: "#ffffff",
  };
  const html = `<div style='${_createStyle_(divStyle)}'>
			<p>Click below button to open it if the popup window was not opened.</p>
			<div>
			<button
				style='${_createStyle_(buttonStyle)}'
				onclick="window.open('${link}', '_target');google.script.host.close();"
			>Open</button>
			<button
				style='${_createStyle_(buttonStyle)}'
				onclick="google.script.host.close();"
			>Close</button>
			</div>
			</div>
			<script>window.open("${link}", "_blank");</script>
		`;
  const dialog = HtmlService.createHtmlOutput(html)
    .setTitle(title)
    .setHeight(120);
  SpreadsheetApp.getActive().show(dialog);
}

/**
 * Create a inline style from a style object with css properties
 * @param {object} styleObject The style object
 * @returns {string} A inline css style
 */
function _createStyle_(styleObject) {
  return (
    Object.entries(styleObject)
      .map(([k, v]) => `${k}:${v}`)
      .join(";") + ";"
  );
}
function _getCurrentFolder_(id = SpreadsheetApp.getActive().getId()) {
  return (
    DriveApp.getFileById(id).getParents().next() || DriveApp.getRootFolder()
  );
}

function _exportToFile_(data, fileName, options = {}) {
  const {
    fileType = 'txt',
    folder = _getCurrentFolder_(),
    addTimestamp = true,
    append = false,
    mimeType = fileType === 'json' ? MimeType.JSON : MimeType.PLAIN_TEXT
  } = options;

  function createFileName(baseName, extension, addTimestamp = true) {
    const timestamp = addTimestamp ? `_${new Date().toISOString().replace(/[:.]/g, '-')}` : '';
    return `${baseName}${timestamp}.${extension}`;
  }

  const content = fileType === 'json' ? JSON.stringify(data, null, 2) : String(data);
  const fullFileName = createFileName(fileName, fileType, addTimestamp && !append);

  if (append) {
    const files = folder.getFilesByName(fullFileName);
    if (files.hasNext()) {
      const file = files.next();
      const currentContent = file.getBlob().getDataAsString();
      const newContent = fileType === 'json'
        ? _handleJsonAppend_(currentContent, content)
        : `${currentContent}\n${content}`;
      file.setContent(newContent);
      return file;
    }
  }

  return folder.createFile(fullFileName, content, mimeType);
}
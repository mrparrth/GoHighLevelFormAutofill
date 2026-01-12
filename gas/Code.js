/**
 * @OnlyCurrentDoc
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile("index");
  let marketer = e?.parameter?.marketer;
  template.metaData = JSON.stringify({ marketer });

  return template
    .evaluate()
    .setTitle("GHL Form Prefill")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getData(e) {
  let ss = SpreadsheetApp.getActive();
  let shMegan = ss.getSheetByName("Megan");
  let shCarolina = ss.getSheetByName("Carolina");
  let shKrystle = ss.getSheetByName("Krystle");

  let meganAccounts = getDataFromSheet(shMegan);
  let carolineAccounts = getDataFromSheet(shCarolina);
  let krystleAccounts = getDataFromSheet(shKrystle);

  // let file = _exportToFile_(JSON.stringify({ megan: meganAccounts, caroline: carolineAccounts, krystle: krystleAccounts }), 'TestAmr')
  return {
    megan: meganAccounts,
    caroline: carolineAccounts,
    krystle: krystleAccounts,
  };
}

function getDataFromSheet(sh) {
  let cache = CacheService.getDocumentCache().get(sh.getName());
  if (cache) return JSON.parse(cache);

  //if no cache
  let data = _getItemsFromSheet_(sh);
  let mappedData = data.map(({ chiropractorName, practiceName, email }) => {
    let singleEmail = email.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || "";
    return {
      chiropractorName,
      practiceName,
      email: singleEmail || email,
    };
  });

  CacheService.getDocumentCache().put(
    sh.getName(),
    JSON.stringify(mappedData),
    21600
  );

  return mappedData;
}

function getSizeInKB(data) {
  let jsonString = JSON.stringify(data);
  let sizeInBytes = Utilities.newBlob(jsonString).getBytes().length;
  let sizeInKB = sizeInBytes / 1024;
  return sizeInKB.toFixed(2); // Returns KB with 2 decimal places
}

function refreshCache() {
  let shNames = ["Megan", "Carolina", "Krystle"];
  CacheService.getDocumentCache().removeAll(shNames);
  for (let shName of shNames) {
    let sheet = SpreadsheetApp.getActive().getSheetByName(shName);
    getDataFromSheet(sheet); // this puts the cache back
  }
}

function newDoctorSuggestion(inputData) {
  console.log(JSON.stringify(inputData));
  let { marketer, doctorData } = inputData;

  // Helper to convert camelCase to Title Case
  const toTitleCase = (str) => {
    const result = str.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  let htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">New Doctor Suggestion</h2>
      <p style="color: #666;"><strong>${toTitleCase(
        marketer
      )}</strong> has added a new doctor suggestion:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px; background-color: #f9fafb;">
  `;

  const priorityKeys = ["chiropractorName", "practiceName", "email"];
  const allKeys = Object.keys(doctorData);

  const otherKeys = allKeys.filter((k) => !priorityKeys.includes(k));

  otherKeys.sort((a, b) => {
    const valA = doctorData[a] ? 1 : 0;
    const valB = doctorData[b] ? 1 : 0;
    return valB - valA;
  });

  const sortedKeys = [
    ...priorityKeys.filter((k) => allKeys.includes(k)),
    ...otherKeys,
  ];

  sortedKeys.forEach((key) => {
    const label = toTitleCase(key);
    const value = doctorData[key] || "-";

    htmlBody += `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; font-weight: bold; color: #374151; width: 40%;">${label}</td>
        <td style="padding: 12px; color: #111827;">${value}</td>
      </tr>
    `;
  });

  htmlBody += `
      </table>
      <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;"></p>
    </div>
  `; //footer

  GmailApp.sendEmail(
    "iamparrth@gmail.com",
    `New Doctor Suggestion - ${doctorData.chiropractorName || "Unknown"}`,
    "New Doctor Added (HTML content required)",
    {
      htmlBody: htmlBody,
    }
  );
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("⚙️Custom Menu")
    .addItem("🔂 Refresh Cache", "refreshCache")
    .addToUi();
}

const includes = (e) => HtmlService.createHtmlOutputFromFile(e).getContent();

function addDoctor({ marketer, doctorData }) {
  const ss = SpreadsheetApp.getActive();
  let sheetName = "";

  // Map marketer keys to sheet names if they differ, or capitalize
  if (marketer === "megan") sheetName = "Megan";
  else if (marketer === "caroline") sheetName = "Carolina";
  else if (marketer === "krystle") sheetName = "Krystle";
  else sheetName = marketer.charAt(0).toUpperCase() + marketer.slice(1);

  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) throw new Error(`Sheet for marketer ${marketer} not found`);

  const [headers] = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues();
  const headerKeys = _createKeys_(headers); // CamelCase keys from headers

  // Map incoming data to sheet headers
  // We need to ensure the doctorData keys match what _createKeys_ produces
  // backend utils.js _createKeys_ uses toCamelCase().
  // doctorData keys are already camelCase (chiropractorName, practiceName, etc.)

  const newRow = headerKeys.map((key) => {
    return doctorData[key] || "";
  });

  // Append to sheet
  sheet.appendRow(newRow);

  // Invalidate cache so the new data appears on refresh
  CacheService.getDocumentCache().remove(sheetName);

  return { success: true };
}

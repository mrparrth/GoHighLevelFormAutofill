/**
 * @OnlyCurrentDoc
 */
function doGet(e) {
  const template = HtmlService.createTemplateFromFile('index')

  return template
    .evaluate()
    .setTitle('GHL Form Prefill')
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function getData(e) {
  let ss = SpreadsheetApp.getActive()
  let shMegan = ss.getSheetByName('Megan')
  let shCarolina = ss.getSheetByName('Carolina')
  let shKrystle = ss.getSheetByName('Krystle')

  let meganAccounts = getDataFromSheet(shMegan)
  let carolineAccounts = getDataFromSheet(shCarolina)
  let krystleAccounts = getDataFromSheet(shKrystle)

  // let file = _exportToFile_(JSON.stringify({ megan: meganAccounts, caroline: carolineAccounts, krystle: krystleAccounts }), 'TestAmr')
  return { megan: meganAccounts, caroline: carolineAccounts, krystle: krystleAccounts }
}

function getDataFromSheet(sh) {
  let cache = CacheService.getDocumentCache().get(sh.getName())
  if (cache) return JSON.parse(cache)

  //if no cache
  let data = _getItemsFromSheet_(sh)
  let mappedData = data.map(({ chiropractorName, practiceName, email }) => {
    let singleEmail = email.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
    return {
      chiropractorName, practiceName, email: singleEmail || email
    }
  })

  CacheService.getDocumentCache().put(sh.getName(), JSON.stringify(mappedData), 21600)

  return mappedData
}

function getSizeInKB(data) {
  let jsonString = JSON.stringify(data);
  let sizeInBytes = Utilities.newBlob(jsonString).getBytes().length;
  let sizeInKB = sizeInBytes / 1024;
  return sizeInKB.toFixed(2); // Returns KB with 2 decimal places
}

function refreshCache() {
  let shNames = ['Megan', 'Carolina', 'Krystle']
  CacheService.getDocumentCache().removeAll(shNames)
  for (let shName of shNames) {
    let sheet = SpreadsheetApp.getActive().getSheetByName(shName)
    getDataFromSheet(sheet) // this puts the cache back
  }
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚙️Custom Menu').addItem('🔂 Refresh Cache', 'refreshCache').addToUi()
}

const includes = (e) => HtmlService.createHtmlOutputFromFile(e).getContent()

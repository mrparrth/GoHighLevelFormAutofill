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

  let file = _exportToFile_(JSON.stringify({ megan: meganAccounts, caroline: carolineAccounts, krystle: krystleAccounts }), 'TestAmr')
  console.log(file.getUrl())
  return { megan: meganAccounts, caroline: carolineAccounts, krystle: krystleAccounts }
}

function getDataFromSheet(sh) {
  let data = _getItemsFromSheet_(sh)
  return data.map(({ chiropractorName, practiceName, email }) => {
    return {
      chiropractorName, practiceName, email
    }
  })
}

const includes = (e) => HtmlService.createHtmlOutputFromFile(e).getContent()

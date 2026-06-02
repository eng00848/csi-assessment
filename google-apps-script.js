// ─────────────────────────────────────────────────────────────────────────────
// CSI Assessment — Google Apps Script
// Paste this entire file into your Google Apps Script editor.
// Deploy as a Web App: Execute as "Me", Who has access "Anyone".
// ─────────────────────────────────────────────────────────────────────────────

const SHEET_NAME = 'CSI Results'

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents)
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = ss.getSheetByName(SHEET_NAME)

    // Create sheet + header row if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME)
      const headers = [
        'Submitted At', 'Name', 'Email', 'Department', 'Date',
        'Conserver Score', 'Originator Score', 'Difference',
        'Style', 'Sub-Type',
        'Q1A','Q1B','Q2A','Q2B','Q3A','Q3B','Q4A','Q4B','Q5A','Q5B',
        'Q6A','Q6B','Q7A','Q7B','Q8A','Q8B','Q9A','Q9B','Q10A','Q10B',
        'Q11A','Q11B','Q12A','Q12B','Q13A','Q13B','Q14A','Q14B','Q15A','Q15B',
        'Q16A','Q16B','Q17A','Q17B','Q18A','Q18B','Q19A','Q19B','Q20A','Q20B',
      ]
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold')
      sheet.setFrozenRows(1)
    }

    // Build row
    const row = [
      data.submitted_at || new Date().toISOString(),
      data.name || '',
      data.email || '',
      data.department || '',
      data.date || '',
      data.conserver_score || 0,
      data.originator_score || 0,
      data.difference || 0,
      data.style || '',
      data.sub_type || '',
    ]

    for (let i = 1; i <= 20; i++) {
      row.push(data[`q${i}_a`] || '')
      row.push(data[`q${i}_b`] || '')
    }

    sheet.appendRow(row)

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// Test this function manually in Apps Script to verify the sheet is created correctly
function testSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  Logger.log('Connected to: ' + ss.getName())
  const sheet = ss.getSheetByName(SHEET_NAME)
  Logger.log(sheet ? 'Sheet exists: ' + SHEET_NAME : 'Sheet will be created on first submission')
}

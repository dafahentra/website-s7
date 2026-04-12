function doPost(e) {
  const secret = "s7loyalty2026"; // ganti dengan password kamu
  
  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.secret !== secret) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Unauthorized" })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    const ss       = SpreadsheetApp.getActiveSpreadsheet();
    const custSheet = ss.getSheetByName("Customers");
    const histSheet = ss.getSheetByName("History");
    
    if (data.action === "upsert_customer") {
      // Cari customer by phone
      const phones = custSheet.getRange("A:A").getValues().flat();
      const rowIdx = phones.indexOf(data.phone);
      
      if (rowIdx === -1) {
        // Customer baru — append
        custSheet.appendRow([
          data.phone,
          data.name || "",
          data.points,
          new Date().toLocaleString("id-ID"),
          data.totalSpend || 0,
          new Date().toLocaleString("id-ID"),
        ]);
      } else {
        // Update existing
        const row = rowIdx + 1;
        custSheet.getRange(row, 2).setValue(data.name || custSheet.getRange(row, 2).getValue());
        custSheet.getRange(row, 3).setValue(data.points);
        custSheet.getRange(row, 4).setValue(new Date().toLocaleString("id-ID"));
        custSheet.getRange(row, 5).setValue(
          (custSheet.getRange(row, 5).getValue() || 0) + (data.addSpend || 0)
        );
      }
    }
    
    if (data.action === "add_history") {
      histSheet.appendRow([
        new Date().toLocaleString("id-ID"),
        data.phone,
        data.name || "",
        data.type,
        data.points,
        data.amount || 0,
        data.source,
        data.txId || "",
        data.note || "",
      ]);
    }
    
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch(err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
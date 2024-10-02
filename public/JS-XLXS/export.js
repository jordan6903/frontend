// 將一個sheet轉成最終的excel檔案的blob物件，然後利用URL.createObjectURL下載
function sheet2blob(sheet, sheetName) {
    sheetName = sheetName || ["sheet1"];
    //console.log(sheet);

    var workbook = {
        SheetNames: sheetName,
        Sheets: {}
    };

    for (var i = 0; i < sheet.length; i++) {
        workbook.Sheets[sheetName[i]] = sheet[i];
    }

    //console.log(workbook);
    //workbook.Sheets[sheetName] = sheet; // 生成excel的配置項

    var wopts = {
        bookType: 'xlsx', // 要生成的檔案型別
        bookSST: false, // 是否生成Shared String Table，官方解釋是，如果開啟生成速度會下降，但在低版本IOS裝置上有更好的相容性
        type: 'binary'
    };
    var wbout = XLSX.write(workbook, wopts);
    var blob = new Blob([s2ab(wbout)], {
        type: "application/octet-stream"
    }); // 字串轉ArrayBuffer
    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
        return buf;
    }
    return blob;
}

function openDownloadDialog(url, saveName) {
    if (typeof url == 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url); // 建立blob地址
    }
    var aLink = document.createElement('a');
    aLink.href = url;
    aLink.download = saveName || ''; // HTML5新增的屬性，指定儲存檔名，可以不要字尾，注意，file:///模式下不會生效
    var event;
    if (window.MouseEvent) event = new MouseEvent('click');
    else {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    }
    aLink.dispatchEvent(event);
}
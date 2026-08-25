// controller/main.js
// Main controller for the OlyInven WPA

window.onload = function() {
  let wbFile = localStorage.getItem ("OlyInven-File")
  
  if (wbFile) {
    console.log("Loading a previous session")
    
    Products.array = JSON.parse(localStorage.getItem("OlyInven-ProductsArray"))
    document.getElementById("filename").innerText = wbFile
  }
}

document.getElementById("button-select-file").addEventListener("click", function() {
  let wbFile = localStorage.getItem ("OlyInven-File")
  
  if (wbFile !== undefined) {
    if (!window.confirm("¿Desea cancelar el conteo actual y cargar un nuevo archivo?")) {
      return
    }
  }

  let event = new Event("input")
  event.dontSearch = true
  
  document.getElementById("searchList").innerHTML = ""
  
  document.getElementById("barcode").value = ""
  document.getElementById("barcode").dispatchEvent(event)
  document.getElementById("barcode").focus()
  
  document.getElementById("excel-file-selector").click()
})

// Read the Excel file uploaded
document.getElementById("excel-file-selector").addEventListener("change", function(event) {  
  Products.loadFromExcel(document.getElementById("excel-file-selector").files[0])
  document.getElementById("filename").innerText = document.getElementById("excel-file-selector").files[0].name
  
  localStorage.setItem("OlyInven-File", document.getElementById("excel-file-selector").files[0].name)
})

document.getElementById("barcode").addEventListener("input", function(event) {
  let product = Products.findByBarcode(this.value)
  
  if (product) {
    document.getElementById("count-label").innerText = `Conteo (hasta ahora: ${product.count})`
    document.getElementById("count").value = "0"
    document.getElementById("description").innerHTML = product.description
  } else {
    document.getElementById("count-label").innerText = ""
    document.getElementById("count").value = "0"
    document.getElementById("description").innerHTML = `<span style="color:red">No se encontr&oacute; con el c&oacute;digo de barras buscado</span>`
  }
  
  if (this.value.length >= 3 && !event.dontSearch) {
    let searchResult = Products.search(this.value.toLowerCase())
    let htmlResult = ""
    for (let item of searchResult) {
      htmlResult += `
        <li class="mdl-list__item">
          <span class="mdl-list__item-primary-content">
            <a class="oly-link" href="javascript:void(0)" onclick="selectFromSearchList('${item.barcode}')">${item.description}</a>
          </span>
        </li>
      `
    }
    
    document.getElementById("searchList").innerHTML = htmlResult
  }
  
  document.getElementById("count").parentElement.classList.add("is-dirty")
})

function selectFromSearchList(barcode) {
  let event = new Event("input")
  event.dontSearch = true
  
  document.getElementById("barcode").value = barcode
  document.getElementById("barcode").dispatchEvent(event)
  document.getElementById("count").focus()
  
  document.getElementById("searchList").innerHTML = ""
}

document.getElementById("count").addEventListener("change", function() {
  let product = Products.findByBarcode(document.getElementById("barcode").value)
  
  if (product) {
    product.count += parseInt(this.value)
    
    // 1-oct-2022
    // Activar las siguientes lineas si se desea regresar a la funcionalidad anterior,
    // que se quede en memoria el archivo de Excel
    /*
    let row = Products.wb.worksheets[0].getRow(product.rowNumber)
    row.getCell(3).value = product.count
    row.commit()
    */
    
    localStorage.setItem("OlyInven-ProductsArray", JSON.stringify(Products.array))
    document.getElementById("searchList").innerHTML = ""
  }
  
  let event = new Event("input")
  event.dontSearch = true
  
  document.getElementById("barcode").value = ""
  document.getElementById("barcode").dispatchEvent(event)
  document.getElementById("barcode").focus()
})

/*
document.getElementById("count").addEventListener("keypress", function(event) {
  if (event.keyCode == 13) {
    
  }
})
*/

document.getElementById("scan").addEventListener("click", function() {
  hide(document.getElementById("page-1"))
  show(document.getElementById("page-2"))
  capturarBarcode()
  //onBarcode()
})

/*
document.getElementById("clearBarcodeField").addEventListener("click", function() {
  let event = new Event("input")
  event.dontSearch = true
  
  document.getElementById("barcode").value = ""
  document.getElementById("barcode").dispatchEvent(event)
  document.getElementById("barcode").focus()
})
*/

function showAboutDialog() {
  document.getElementById("about-dialog").showModal()
}

function closeAboutDialog() {
  document.getElementById("about-dialog").close()
  document.querySelector(".mdl-layout").MaterialLayout.toggleDrawer()
}

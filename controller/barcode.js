 function barcodeStartScanner() {
  Quagga.init({
    inputStream : {
      name : "Live",
      type : "LiveStream",
      target: document.querySelector('#live-reader'),
    },
    decoder : { 
      readers : ["ean_reader", "code_39_reader", "code_128_reader"], //[{format: "ean_reader", config: {}}],
      debug: {
        drawScanline: true,
      },
    }
    }, function(err) {
    if (err) {
      console.log(err);
      alert("No se pudo iniciar el escaner") 
      return
    }
    console.log("Escaneando codigo de barras")
    
    Quagga.onDetected (function(data) {
      //alert(data.codeResult.code)
      Quagga.stop()
      hide(document.getElementById("page-2"))
      show(document.getElementById("page-1"))
      
      document.getElementById("barcode").value = data.codeResult.code
      document.getElementById("barcode").dispatchEvent(new Event("input"))
    })
    
    Quagga.start();
  })
}

function barcodeCancel() {
  Quagga.stop()
  hide(document.getElementById("page-2"))
  show(document.getElementById("page-1"))
}

function onBarcode() {
  hide(document.getElementById("page-1"))
  show(document.getElementById("page-2"))
  
  navigator.mediaDevices.getUserMedia({
    audio: 0,
    video: {
        facingMode: {
            ideal: "environment"
        },
      width: { ideal: 390 },
      height: { ideal: 219 }
    }
  }).then(stream => {
    const bar = document.getElementById('bar');
    bar.srcObject = stream;
    
    const redline = byId('red-line')
    redline.style.top = "-" + ((bar.offsetHeight/2)-2) + "px";
    redline.style.left = (bar.offsetWidth/4) + "px";
    redline.style.width = ((bar.offsetWidth/4) *2) + "px";
    
    const img = byId("input")
    img.onload = function() {
      console.log("image loaded")
      if ('BarcodeDetector' in window) {
        const detector = new BarcodeDetector(
          {
            formats:["ean_13", "code_39", "code_128", 
              "ean_8", "upc_a", "upc_e", "codabar", "itf"]});
        detector.detect(input).then(detections => {
          if (detections.length == 0) {
            alert("No se pudo leer el codigo")
            return
          }

          detections.forEach(detected => {
            let result = detected.rawValue||detected.rawData
            //alert(result);

            bar.srcObject.getTracks().forEach(function(track) {
              track.stop();
            }); // Camera stop

            hide(document.getElementById("page-2"))
            show(document.getElementById("page-1"))

            document.getElementById("barcode").value = result
            document.getElementById("barcode").dispatchEvent(new Event("input"))
          })
        })
      }
    }
  })
}

function capturarBarcode() {
  console.log("Click en capturar barcode")
  const bar = byId('bar')
  const canvas = byId('canvas1');
  const redline = byId("red-line")
  const input = byId('input');

  const quarter = bar.videoWidth / 4
  
  canvas.width = 390;
  canvas.height = 219;
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(bar, quarter, (bar.videoHeight/2)-100, quarter *2, 200,
               0, 0, quarter*2, 200);
  
  
    
  /*canvas.width = bar.videoWidth;
  canvas.height = bar.videoHeight;
  const ctx = canvas.getContext('2d');
  
  ctx.drawImage(bar, 0, 0);*/
  
  //input.src = canvas.toDataURL();
  input.src = canvas.toBlob();
  // Now, the onload event for the img will be fired
}

function cancelarBarcode() {
  bar.srcObject.getTracks().forEach(track => track.stop());
    
  hide(document.getElementById("page-2"))
  show(document.getElementById("page-1"))
}

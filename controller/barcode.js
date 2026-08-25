let barcodeDetectionTimer = null;
let barcodeDetectionInProgress = false;

function barcodeCancel() {
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
    
    //capturarBarcode()
  })
}

function stopBarcodeCamera() {
  if (barcodeDetectionTimer) {
    clearInterval(barcodeDetectionTimer);
    barcodeDetectionTimer = null;
  }

  barcodeDetectionInProgress = false;

  const video = document.getElementById("bar");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

function preprocessBarcodeFrame(sourceCanvas) {
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = sourceCanvas.width;
  outputCanvas.height = sourceCanvas.height;

  const sourceContext = sourceCanvas.getContext("2d", {
    willReadFrequently: true
  });
  const outputContext = outputCanvas.getContext("2d", {
    willReadFrequently: true
  });

  const image = sourceContext.getImageData(
    0,
    0,
    sourceCanvas.width,
    sourceCanvas.height
  );

  const pixels = image.data;
  const contrast = 1.35;
  const contrastOffset = 128 * (1 - contrast);

  // Grayscale and contrast enhancement
  for (let index = 0; index < pixels.length; index += 4) {
    const gray =
      pixels[index] * 0.299 +
      pixels[index + 1] * 0.587 +
      pixels[index + 2] * 0.114;

    const enhanced = Math.max(
      0,
      Math.min(255, gray * contrast + contrastOffset)
    );

    pixels[index] = enhanced;
    pixels[index + 1] = enhanced;
    pixels[index + 2] = enhanced;
  }

  sourceContext.putImageData(image, 0, 0);

  // Mild sharpening
  outputContext.filter = "contrast(115%)";
  outputContext.drawImage(sourceCanvas, 0, 0);

  return outputCanvas;
}

function capturarBarcode() {
  const video = document.getElementById("bar");
  const canvas = document.getElementById("canvas1");

   if (!video.videoWidth || !video.videoHeight) {
    alert("La camara aun no esta lista");
    return;
  }

  const cropWidth = Math.floor(video.videoWidth / 2);
  const cropHeight = Math.min(240, video.videoHeight);
  const cropX = Math.floor((video.videoWidth - cropWidth) / 2);
  const cropY = Math.floor((video.videoHeight - cropHeight) / 2);

  canvas.width = cropWidth;
  canvas.height = cropHeight;

  const context = canvas.getContext("2d");

  if (!("BarcodeDetector" in window)) {
    alert("Este navegador no soporta BarcodeDetector");
    return;
  }

  const detector = new BarcodeDetector({
    formats: ["ean_13", "code_39", "code_128",
      "ean_8", "upc_a", "upc_e", "codabar", "itf"
    ]
  });

  if (barcodeDetectionTimer) {
    return;
  }

  const detectFrame = () => {
    if (barcodeDetectionInProgress || !video.videoWidth || !video.videoHeight) {
      return;
    }

    barcodeDetectionInProgress = true;

    context.drawImage(
      video,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    const processedFrame = preprocessBarcodeFrame(canvas);

    detector.detect(processedFrame)
      .then(detections => {
        const result = detections.find(detection => {
          const value = detection.rawValue || detection.rawData;
          return typeof value === "string" && value.trim().length > 0;
        });

        if (!result) {
          return;
        }

        const barcode = result.rawValue || result.rawData;
        stopBarcodeCamera();

        const barcodeInput = document.getElementById("barcode");
        barcodeInput.value = barcode;
        barcodeInput.dispatchEvent(new Event("input"));
        hide(document.getElementById("page-2"));
        show(document.getElementById("page-1"));
      })
      .catch(error => {
        console.error("Error detectando codigo:", error);
      })
      .finally(() => {
        barcodeDetectionInProgress = false;
      });
  };

  detectFrame();
  barcodeDetectionTimer = setInterval(detectFrame, 150);
}

function cancelarBarcode() {
  stopBarcodeCamera();
    
  hide(document.getElementById("page-2"))
  show(document.getElementById("page-1"))
}

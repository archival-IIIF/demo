document.addEventListener("DOMContentLoaded", function() {
    new ArchivalIIIFViewer({
        id: 'root',
        language: 'en',
        manifest: window.location.href + 'iiif/collection/demo'
    });
});

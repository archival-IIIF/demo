document.addEventListener("DOMContentLoaded", function() {
    new ArchivalIIIFViewer({
        id: 'root',
        manifest: window.location.href + 'iiif/collection/demo'
    });
});

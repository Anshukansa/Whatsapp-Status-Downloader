document.getElementById('permissionButton').addEventListener('click', requestPermission);

let currentStatusIndex = 0;
let statuses = [];

async function requestPermission() {
    try {
        // Request file access
        const fileHandles = await window.showOpenFilePicker({
            types: [
                {
                    description: 'Images and Videos',
                    accept: {
                        'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
                        'video/*': ['.mp4', '.avi', '.mov']
                    }
                }
            ],
            multiple: true
        });
        
        if (fileHandles.length > 0) {
            console.log('Files selected:', fileHandles);
            loadStatuses(fileHandles);
        } else {
            alert('No files selected.');
        }
    } catch (error) {
        console.error('Error accessing files:', error);
        alert('Failed to access files. Please make sure you are using a supported browser.');
    }
}

async function loadStatuses(fileHandles) {
    const statusContainer = document.getElementById('statusContainer');
    statusContainer.innerHTML = '';
    statuses = [];

    for (const fileHandle of fileHandles) {
        try {
            const file = await fileHandle.getFile();
            const url = URL.createObjectURL(file);
            statuses.push({ url, type: file.type, name: file.name });

            const statusElement = document.createElement('div');
            statusElement.className = 'status-item';

            if (file.type.startsWith('video/')) {
                statusElement.innerHTML = `<video src="${url}" width="100" height="100" controls muted></video>`;
            } else if (file.type.startsWith('image/')) {
                statusElement.innerHTML = `<img src="${url}" width="100" height="100">`;
            }

            statusElement.addEventListener('click', () => openModal(url, file.type, file.name));
            statusContainer.appendChild(statusElement);
        } catch (fileError) {
            console.error('Error accessing file:', fileError);
        }
    }
}

function openModal(url, type, filename) {
    const modal = document.getElementById('previewModal');
    const modalImg = document.getElementById('modalContent');
    const modalVideo = document.getElementById('modalVideoContent');

    if (type.startsWith('video/')) {
        modalVideo.src = url;
        modalVideo.style.display = 'block';
        modalImg.style.display = 'none';
    } else {
        modalImg.src = url;
        modalImg.style.display = 'block';
        modalVideo.style.display = 'none';
    }

    modal.style.display = 'block';
    document.getElementById('downloadButton').onclick = () => downloadStatus(url, filename);

    document.getElementById('prevStatus').onclick = () => navigateStatus(-1);
    document.getElementById('nextStatus').onclick = () => navigateStatus(1);
}

function closeModal() {
    document.getElementById('previewModal').style.display = 'none';
    const modalVideo = document.getElementById('modalVideoContent');
    modalVideo.pause();
    modalVideo.currentTime = 0;
}

function downloadStatus(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
}

function navigateStatus(direction) {
    currentStatusIndex = (currentStatusIndex + direction + statuses.length) % statuses.length;
    const { url, type, name } = statuses[currentStatusIndex];
    openModal(url, type, name);
}

document.getElementById('closeModal').addEventListener('click', closeModal);
window.onclick = function(event) {
    const modal = document.getElementById('previewModal');
    if (event.target === modal) {
        closeModal();
    }
};

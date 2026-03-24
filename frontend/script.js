const API_URL = 'http://localhost:3000/api/v1/notes'; 

const noteTitle = document.getElementById('noteTitle');
const noteDesc = document.getElementById('noteDesc');
const saveBtn = document.getElementById('saveBtn');
const notesContainer = document.getElementById('notesContainer');

// Helper untuk format tanggal agar terlihat rapi seperti di desain
function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// 1. Fungsi Mengambil Data (Read)
async function getNotes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal mengambil data dari server");
        
        const result = await response.json();
        const notes = result.data || []; 
        
        renderNotes(notes);
    } catch (error) {
        console.error("Error:", error);
        notesContainer.innerHTML = '<p style="color:red">Gagal memuat catatan. Pastikan server backend jalan!</p>';
    }
}

// 2. Fungsi Menampilkan Catatan ke HTML
function renderNotes(notes) {
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        notesContainer.innerHTML = '<p style="color: #888;">Belum ada catatan. Tambahkan catatan pertamamu di atas!</p>';
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'card';
        // Note: Field disesuaikan dengan schema backend (judul & isi)
        card.innerHTML = `
            <div>
                <span class="card-tag">NOTES</span>
                <div class="card-content">
                    <h4>${note.judul}</h4>
                    <p>${note.isi}</p>
                </div>
            </div>
            <div class="card-footer">
                <span><i class="far fa-clock"></i> ${formatDate(note.tanggal_dibuat)}</span>
                <div class="card-actions">
                    <i class="fas fa-pencil-alt edit-btn" onclick="editNote(${note.id}, '${note.judul.replace(/'/g, "\\'")}', '${note.isi.replace(/'/g, "\\'")}')" title="Edit"></i>
                    <i class="fas fa-trash delete-btn" onclick="deleteNote(${note.id})" title="Hapus"></i>
                </div>
            </div>
        `;
        notesContainer.appendChild(card);
    });
}

// 3. Fungsi Menambah Catatan (Create)
saveBtn.addEventListener('click', async () => {
    const judul = noteTitle.value.trim();
    const isi = noteDesc.value.trim();

    if (!judul || !isi) {
        alert("Judul dan deskripsi tidak boleh kosong!");
        return;
    }

    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';

        // Mengirim 'judul' dan 'isi' ke backend
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ judul, isi })
        });

        if (response.ok) {
            noteTitle.value = '';
            noteDesc.value = '';
            getNotes(); // Refresh list otomatis setelah menambah
        } else {
            alert("Gagal menyimpan ke database");
        }
    } catch (error) {
        console.error("Error saat menambah:", error);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-plus"></i> Add Note';
    }
});

// 4. Fungsi Menghapus Catatan (Delete)
async function deleteNote(id) {
    if (!confirm("Hapus catatan ini?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE' 
        });

        if (response.ok) {
            getNotes();
        } else {
            alert("Gagal menghapus catatan");
        }
    } catch (error) {
        console.error("Error saat menghapus:", error);
    }
}

// 5. Fungsi Edit (Update)
async function editNote(id, oldJudul, oldIsi) {
    const newJudul = prompt("Edit Judul:", oldJudul);
    const newIsi = prompt("Edit Isi Catatan:", oldIsi);

    if (newJudul === null || newIsi === null) return;
    if (newJudul.trim() === "" || newIsi.trim() === "") {
        alert("Input tidak boleh kosong!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ judul: newJudul, isi: newIsi })
        });

        if (response.ok) {
            getNotes();
        } else {
            alert("Gagal mengupdate catatan");
        }
    } catch (error) {
        console.error("Error saat update:", error);
    }
}

// Jalankan saat halaman pertama kali dirender
getNotes();
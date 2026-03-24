const API_URL = 'http://localhost:3000/api/v1/notes'; 

const noteTitle = document.getElementById('noteTitle');
const noteDesc = document.getElementById('noteDesc');
const saveBtn = document.getElementById('saveBtn');
const notesContainer = document.getElementById('notesContainer');

// 2. Fungsi Mengambil Data (Read)
async function getNotes() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Gagal mengambil data dari server");
        
        const result = await response.json();
        
        // Sequelize biasanya mengembalikan array langsung, 
        // tapi pastikan formatnya sesuai dengan controller kamu
        const notes = Array.isArray(result) ? result : result.data; 
        
        renderNotes(notes || []);
    } catch (error) {
        console.error("Error:", error);
        notesContainer.innerHTML = <p style="color:red">Gagal memuat catatan. Pastikan Backend jalan!</p>;
    }
}

// 3. Fungsi Menampilkan Catatan ke HTML
function renderNotes(notes) {
    notesContainer.innerHTML = '';
    
    if (notes.length === 0) {
        notesContainer.innerHTML = '<p>Belum ada catatan.</p>';
        return;
    }

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div>
                <h3>${note.title}</h3>
                <p>${note.description}</p>
            </div>
            <div class="card-actions">
                <button class="edit-btn" onclick="editNote(${note.id}, '${note.title.replace(/'/g, "\\'")}', '${note.description.replace(/'/g, "\\'")}')">Edit</button>
                <button class="delete-btn" onclick="deleteNote(${note.id})">Hapus</button>
            </div>
        `;
        notesContainer.appendChild(card);
    });
}

// 4. Fungsi Menambah Catatan (Create)
saveBtn.addEventListener('click', async () => {
    const title = noteTitle.value.trim();
    const description = noteDesc.value.trim();

    if (!title || !description) {
        alert("Judul dan Deskripsi tidak boleh kosong!");
        return;
    }

    const data = { title, description };

    try {
        saveBtn.disabled = true; // Cegah double click
        saveBtn.innerText = "Menyimpan...";

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            noteTitle.value = '';
            noteDesc.value = '';
            getNotes(); // Refresh list
        } else {
            alert("Gagal menyimpan ke database");
        }
    } catch (error) {
        console.error("Error saat menambah:", error);
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerText = "Simpan Catatan";
    }
});

// 5. Fungsi Menghapus Catatan (Delete)
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

// 6. Fungsi Edit (Update)
async function editNote(id, oldTitle, oldDesc) {
    const newTitle = prompt("Edit Judul:", oldTitle);
    const newDesc = prompt("Edit Deskripsi:", oldDesc);

    // Validasi jika user menekan 'Cancel' atau mengosongkan input
    if (newTitle === null || newDesc === null) return;
    if (newTitle.trim() === "" || newDesc.trim() === "") {
        alert("Input tidak boleh kosong!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: newTitle, description: newDesc })
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

// Jalankan saat pertama kali buka
getNotes();
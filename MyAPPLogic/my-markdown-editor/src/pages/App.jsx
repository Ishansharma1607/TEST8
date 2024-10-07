import React, { useState, useEffect } from 'react';
import Editor from '../components/Editor.jsx';
import Preview from '../components/Preview.jsx';
import Layout from '../components/Layout.jsx';
import '../styles/markdown.css';
import { initializeCollapse, updatePreview } from '../utils/markdown.jsx';

function App() {
  const [markdown, setMarkdown] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(true);

  useEffect(() => {
    const loadText = async () => {
      try {
        const response = await fetch('/load-text');
        const text = await response.text();
        setMarkdown(text);

        const savedPreviewMode = localStorage.getItem('previewMode');
        if (savedPreviewMode !== null) {
          setIsPreviewMode(savedPreviewMode === 'true');
        } else {
          setIsPreviewMode(true);
        }
      } catch (error) {
        console.error('Error loading text:', error);
      }
    };

    loadText();
  }, []);

  useEffect(() => {
    if (isPreviewMode) {
      updatePreview(markdown);
    }
  }, [markdown, isPreviewMode]);

  const handleTogglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    localStorage.setItem('previewMode', !isPreviewMode);

    if (!isPreviewMode) {
      // Update preview when switching to preview mode
      updatePreview(markdown);
      initializeCollapse(); // Initialize collapse functionality
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/save-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: markdown }),
      });

      if (!response.ok) {
        console.error('Failed to save text');
      }
    } catch (error) {
      console.error('Error saving text:', error);
    }
  };

  const handleUpload = () => {
    document.getElementById('fileInput').click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      fetch('/upload-file', {
        method: 'POST',
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            alert('Upload successful!');
          } else {
            alert('Upload failed!');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Upload failed!');
        });
    }
  };

  const handleDownload = () => {
    fetch('/download-file')
      .then((response) => {
        // Get the filename from the Content-Disposition header
        const disposition = response.headers.get('Content-Disposition');
        let filename = 'downloaded_file'; // fallback filename

        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
            // decode the URI encoded filename
            filename = decodeURIComponent(filename);
          }
        }

        return response.blob().then((blob) => ({ blob, filename }));
      })
      .then(({ blob, filename }) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename; // Use the filename from the server
        document.body.appendChild(a);
        a.click();

        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Download failed!');
      });
  };

  return (
    <Layout>
      <form onSubmit={handleSave} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Markdown Editor</h2>
          <button type="button" id="togglePreview" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" onClick={handleTogglePreview}>
            {isPreviewMode ? 'Show Editor' : 'Show Preview'}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6" id="editorContainer">
          {!isPreviewMode && (
            <div id="editorSection">
              <Editor markdown={markdown} onChange={setMarkdown} />
            </div>
          )}
          {isPreviewMode && (
            <div id="previewSection">
              <Preview markdown={markdown} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-6">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Save
          </button>
          <input type="file" id="fileInput" className="hidden" onChange={handleFileChange} />
          <button id="uploadButton" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={handleUpload}>
            Upload File
          </button>
          <button id="downloadButton" className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onClick={handleDownload}>
            Download File
          </button>
          <a href="/logout" className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Logout
          </a>
        </div>
      </form>
    </Layout>
  );
}

export default App;


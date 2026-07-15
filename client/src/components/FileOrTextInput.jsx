import React, { useState, useRef } from 'react';
import Card from './Card';
import TextArea from './TextArea';
import Spinner from './Spinner';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export default function FileOrTextInput({
  label,
  value,
  onChange,
  onTextExtracted,
  placeholder,
  required = false,
  maxLength = 20000,
  id,
  rows = 8,
}) {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'
  const [isParsing, setIsParsing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { showToast } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    if (!file) return false;
    const allowedExtensions = ['.pdf', '.docx'];
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const fileName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some((ext) => fileName.endsWith(ext));
    const hasValidMime = allowedMimeTypes.includes(file.type);
    return hasValidExt && hasValidMime;
  };

  const uploadAndParseFile = async (file) => {
    if (!validateFile(file)) {
      showToast('Invalid file format. Only .pdf and .docx files are allowed.', 'error');
      return;
    }

    setIsParsing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/analysis/parse-file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && typeof response.data.text === 'string') {
        const fileExt = file.name.split('.').pop().toLowerCase(); // 'pdf' or 'docx'
        onTextExtracted(response.data.text, fileExt);
        setActiveTab('paste');
        showToast('File parsed successfully', 'success');
      } else {
        throw new Error('Invalid parsing response format');
      }
    } catch (error) {
      console.error('File parsing failed:', error);
      const errorMessage =
        error.response?.status === 422
          ? error.response?.data?.message || 'Could not read this file, try pasting the text instead'
          : 'Could not read this file, try pasting the text instead';
      showToast(errorMessage, 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadAndParseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      uploadAndParseFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (!isParsing) {
      fileInputRef.current.click();
    }
  };

  return (
    <Card
      hover
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '420px',
        height: '100%',
      }}
    >
      {/* Tab Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-mist)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', gap: '1.25rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            disabled={isParsing}
            className="label-caps"
            style={{
              paddingBottom: '0.75rem',
              borderBottom: activeTab === 'paste' ? '2px solid var(--color-moss)' : '2px solid transparent',
              color: activeTab === 'paste' ? 'var(--color-moss)' : 'inherit',
              opacity: activeTab === 'paste' ? 1 : 0.6,
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '-1px',
              transition: 'var(--transition-smooth)',
            }}
          >
            Paste Text
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            disabled={isParsing}
            className="label-caps"
            style={{
              paddingBottom: '0.75rem',
              borderBottom: activeTab === 'upload' ? '2px solid var(--color-moss)' : '2px solid transparent',
              color: activeTab === 'upload' ? 'var(--color-moss)' : 'inherit',
              opacity: activeTab === 'upload' ? 1 : 0.6,
              background: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              borderTop: 'none',
              cursor: 'pointer',
              fontWeight: '600',
              marginBottom: '-1px',
              transition: 'var(--transition-smooth)',
            }}
          >
            Upload File
          </button>
        </div>
        <span className="text-data" style={{ fontSize: '0.7rem', opacity: 0.5, marginBottom: '0.75rem' }}>
          [{label ? label.toUpperCase() : 'INPUT'}]
        </span>
      </div>

      {/* Tab Body */}
      {activeTab === 'paste' ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <TextArea
            label={label}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            maxLength={maxLength}
            id={id}
            rows={rows}
            disabled={isParsing}
            style={{ flex: 1, minHeight: '260px' }}
          />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {label && (
            <label className="label-caps" style={{ display: 'block', marginBottom: '0.5rem', opacity: 0.8 }}>
              {label}
              {required && <span style={{ color: 'var(--color-clay)', marginLeft: '0.125rem' }}>*</span>}
            </label>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            id={`file-input-${id || label}`}
          />

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: dragActive ? '2px dashed var(--color-moss)' : '2px dashed var(--color-mist)',
              backgroundColor: dragActive ? 'var(--color-moss-subtle)' : 'transparent',
              borderRadius: '12px',
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: isParsing ? 'not-allowed' : 'pointer',
              transition: 'var(--transition-smooth)',
              minHeight: '260px',
              opacity: isParsing ? 0.7 : 1,
              pointerEvents: isParsing ? 'none' : 'auto',
            }}
          >
            {isParsing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Spinner size="md" />
                <span className="text-data" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                  Extracting text...
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <svg
                  style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-moss)', opacity: 0.8 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <div>
                  <span className="font-body" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                    Drag & drop file here, or{' '}
                  </span>
                  <span
                    className="font-body"
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: 'var(--color-moss)',
                      textDecoration: 'underline',
                    }}
                  >
                    browse
                  </span>
                </div>
                <div className="text-data" style={{ fontSize: '0.7rem', opacity: 0.5 }}>
                  Supports PDF and DOCX (up to 5MB)
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

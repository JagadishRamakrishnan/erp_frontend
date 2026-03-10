import React, { useState } from 'react';
import { Modal, Upload, Button, Progress, Alert, Typography, Divider, Space, message } from 'antd';
import { InboxOutlined, DownloadOutlined, UploadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const BulkUploadModal = ({ 
  open, 
  onClose, 
  onUpload, 
  onDownloadTemplate,
  moduleName,
  templateFields = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [fileList, setFileList] = useState([]);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', fileList[0]);
      
      const result = await onUpload(formData);
      setUploadResult(result);
      
      if (result.success) {
        message.success(`Successfully uploaded ${result.data.successful} out of ${result.data.total} records`);
      } else {
        message.error('Upload failed');
      }
    } catch (error) {
      message.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await onDownloadTemplate();
      message.success('Template downloaded successfully');
    } catch (error) {
      message.error('Failed to download template');
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls,.csv',
    beforeUpload: (file) => {
      const isValidType = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         file.type === 'application/vnd.ms-excel' ||
                         file.type === 'text/csv';
      
      if (!isValidType) {
        message.error('You can only upload Excel (.xlsx, .xls) or CSV files!');
        return false;
      }
      
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('File must be smaller than 5MB!');
        return false;
      }
      
      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
    fileList: fileList.map(file => ({
      uid: file.uid,
      name: file.name,
      status: 'done',
    }))
  };

  const handleClose = () => {
    setFileList([]);
    setUploadResult(null);
    setUploading(false);
    onClose();
  };

  return (
    <Modal
      title={`Bulk Upload ${moduleName}`}
      open={open}
      onCancel={handleClose}
      width={700}
      footer={null}
    >
      <div style={{ padding: '20px 0' }}>
        
        {/* Step 1: Download Template */}
        <div style={{ marginBottom: 30 }}>
          <Title level={4}>Step 1: Download Template</Title>
          <Text type="secondary">
            Download the Excel template with the correct format and required fields.
          </Text>
          <div style={{ marginTop: 15 }}>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
            >
              Download {moduleName} Template
            </Button>
          </div>
          
          {templateFields.length > 0 && (
            <div style={{ marginTop: 15, padding: 15, background: '#f9f9f9', borderRadius: 8 }}>
              <Text strong>Required Fields:</Text>
              <div style={{ marginTop: 8 }}>
                {templateFields.map((field, index) => (
                  <span key={field} style={{ 
                    display: 'inline-block',
                    background: '#e6f7ff',
                    color: '#1890ff',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    marginRight: 8,
                    marginBottom: 4
                  }}>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <Divider />

        {/* Step 2: Upload File */}
        <div style={{ marginBottom: 30 }}>
          <Title level={4}>Step 2: Upload Your File</Title>
          <Text type="secondary">
            Fill the template with your data and upload it here. Supported formats: Excel (.xlsx, .xls) and CSV.
          </Text>
          
          <div style={{ marginTop: 15 }}>
            <Dragger {...uploadProps} style={{ padding: 20 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text">Click or drag file to this area to upload</p>
              <p className="ant-upload-hint">
                Support for Excel (.xlsx, .xls) and CSV files. Maximum file size: 5MB
              </p>
            </Dragger>
          </div>

          {fileList.length > 0 && (
            <div style={{ marginTop: 15 }}>
              <Button 
                type="primary" 
                icon={<UploadOutlined />}
                onClick={handleUpload}
                loading={uploading}
                size="large"
              >
                {uploading ? 'Uploading...' : 'Start Upload'}
              </Button>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div style={{ marginBottom: 20 }}>
            <Progress percent={50} status="active" />
            <Text type="secondary">Processing your file...</Text>
          </div>
        )}

        {/* Upload Results */}
        {uploadResult && (
          <div>
            <Divider />
            <Title level={4}>Upload Results</Title>
            
            {uploadResult.success ? (
              <Alert
                message="Upload Completed"
                description={
                  <div>
                    <p>Total Records: {uploadResult.data.total}</p>
                    <p style={{ color: '#52c41a' }}>✓ Successful: {uploadResult.data.successful}</p>
                    {uploadResult.data.failed > 0 && (
                      <p style={{ color: '#ff4d4f' }}>✗ Failed: {uploadResult.data.failed}</p>
                    )}
                  </div>
                }
                type={uploadResult.data.failed > 0 ? "warning" : "success"}
                showIcon
                style={{ marginBottom: 20 }}
              />
            ) : (
              <Alert
                message="Upload Failed"
                description={uploadResult.message}
                type="error"
                showIcon
                style={{ marginBottom: 20 }}
              />
            )}

            {/* Failed Records */}
            {uploadResult.success && uploadResult.data.failed > 0 && (
              <div style={{ marginTop: 20 }}>
                <Title level={5}>Failed Records:</Title>
                <div style={{ 
                  maxHeight: 200, 
                  overflow: 'auto', 
                  background: '#fff2f0', 
                  padding: 15, 
                  borderRadius: 8,
                  border: '1px solid #ffccc7'
                }}>
                  {uploadResult.data.failedRecords.map((record, index) => (
                    <div key={index} style={{ marginBottom: 10, fontSize: 12 }}>
                      <Text strong>Row {index + 1}:</Text> {record.error}
                      <br />
                      <Text type="secondary">Data: {JSON.stringify(record.data)}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ marginTop: 30, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleClose}>
              Close
            </Button>
            {uploadResult?.success && (
              <Button type="primary" onClick={handleClose}>
                Done
              </Button>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default BulkUploadModal;
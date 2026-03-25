import React from 'react';
import { Table, Card, Tag, Button, Space } from 'antd';
import { useMediaQuery } from 'react-responsive';

const ResponsiveTable = ({ 
  columns, 
  dataSource, 
  loading, 
  pagination,
  rowKey = 'id',
  renderMobileCard,
  ...otherProps 
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  if (isMobile && renderMobileCard) {
    // Mobile Card View
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>Loading...</div>
        ) : dataSource && dataSource.length > 0 ? (
          dataSource.map((record, index) => (
            <Card
              key={record[rowKey] || index}
              style={{
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                border: '1px solid #f0f0f0'
              }}
              styles={{ body: { padding: 16 } }}
            >
              {renderMobileCard(record)}
            </Card>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            No data available
          </div>
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={pagination}
      rowKey={rowKey}
      scroll={{ x: false }}
      {...otherProps}
    />
  );
};

export default ResponsiveTable;
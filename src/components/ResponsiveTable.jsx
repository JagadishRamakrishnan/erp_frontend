import React from 'react';
import { Table, Card, Skeleton, Empty, Pagination } from 'antd';
import { useMediaQuery } from 'react-responsive';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A highly responsive and polished table component that automatically 
 * converts to a mobile card view on smaller screens.
 */
const ResponsiveTable = ({ 
  columns, 
  dataSource, 
  loading, 
  pagination,
  rowKey = 'id',
  renderMobileCard,
  onRow,
  size = "middle",
  ...otherProps 
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Handle Mobile View
  if (isMobile) {
    // Basic pagination logic if it's passed as an object
    const currentData = dataSource || [];
    
    return (
      <div className="responsive-table-mobile-container" style={{ width: '100%' }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <div key="loading" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
              {[1, 2, 3].map(i => (
                <Card key={i} style={{ borderRadius: 16, border: '1px solid #f0f0f0' }}>
                  <Skeleton active avatar paragraph={{ rows: 2 }} />
                </Card>
              ))}
            </div>
          ) : currentData.length > 0 ? (
            <div key="list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {currentData.map((record, index) => (
                <motion.div
                  key={record[rowKey] || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                      border: '1px solid #f0f0f0',
                      overflow: 'hidden'
                    }}
                    styles={{ body: { padding: 0 } }}
                    onClick={() => onRow?.(record)?.onClick?.()}
                  >
                    <div style={{ padding: 16 }}>
                      {renderMobileCard ? renderMobileCard(record) : (
                        <div style={{ fontSize: 14 }}>
                          {columns.slice(0, 3).map(col => (
                            <div key={col.key || col.dataIndex} style={{ marginBottom: 8 }}>
                              <span style={{ color: '#9ca3af', marginRight: 8, fontWeight: 500 }}>{col.title}:</span>
                              <span>{col.render ? col.render(record[col.dataIndex], record) : record[col.dataIndex]}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
              
              {pagination && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12, marginBottom: 20 }}>
                  <Pagination 
                    {...pagination} 
                    size="small" 
                    showSizeChanger={false}
                    style={{ background: '#fff', padding: '8px 12px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div key="empty" style={{ padding: 60, background: '#fff', borderRadius: 16, textAlign: 'center' }}>
              <Empty description="No records found" />
            </div>
          )}
        </AnimatePresence>
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
      size={size}
      scroll={{ x: 'max-content' }}
      onRow={onRow}
      {...otherProps}
      className="custom-ant-table"
    />
  );
};

export default ResponsiveTable;
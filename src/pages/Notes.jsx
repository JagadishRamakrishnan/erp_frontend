import { useState, useEffect } from "react";
import { 
  Card, Input, Button, Modal, Form, Select, message, 
  Popconfirm, Row, Col, Spin, Tag 
} from "antd";
import { 
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { motion } from "framer-motion";
import { Typography } from "antd";
import { noteService, leadService, customerService, dealService } from "../services";
import dayjs from "dayjs";
import ResponsiveTable from "../components/ResponsiveTable";

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [relatedType, setRelatedType] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchNotes();
    fetchLeads();
    fetchCustomers();
    fetchDeals();
  }, []);

  const fetchNotes = async () => {
  setLoading(true);
  try {
    const response = await noteService.getAll();
    if (response.success) {
      const sortedNotes = (response.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setNotes(sortedNotes);
    }
  } catch (error) {
    message.error("Failed to load notes");
  } finally {
    setLoading(false);
  }
};

  const fetchLeads = async () => {
    try {
      const response = await leadService.getAll();
      if (response.success) {
        setLeads(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load leads');
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await customerService.getAll();
      if (response.success) {
        setCustomers(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load customers');
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await dealService.getAll();
      if (response.success) {
        setDeals(response.data || []);
      }
    } catch (error) {
      console.error('Failed to load deals');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const response = editingNote
        ? await noteService.update(editingNote.id, values)
        : await noteService.create(values);
      
      if (response.success) {
        message.success(editingNote ? 'Note updated successfully' : 'Note created successfully');
        fetchNotes();
        setModalOpen(false);
        setEditingNote(null);
        setRelatedType(null);
        form.resetFields();
      }
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setRelatedType(note.related_type);
    form.setFieldsValue({
      related_type: note.related_type,
      related_id: note.related_id,
      note: note.note
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await noteService.delete(id);
      if (response.success) {
        message.success('Note deleted successfully');
        fetchNotes();
      }
    } catch (error) {
      message.error('Delete failed');
    }
  };

  const handleAddNew = () => {
    setEditingNote(null);
    setRelatedType(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleRelatedTypeChange = (value) => {
    setRelatedType(value);
    form.setFieldsValue({ related_id: null });
  };

  const getRelatedOptions = () => {
    switch (relatedType) {
      case 'Lead':
        return leads.map(lead => ({
          value: lead.id,
          label: `${lead.name} (${lead.lead_code})`
        }));
      case 'Customer':
        return customers.map(customer => ({
          value: customer.id,
          label: `${customer.name} - ${customer.email || 'No email'}`
        }));
      case 'Deal':
        return deals.map(deal => ({
          value: deal.id,
          label: `${deal.deal_name} (${deal.stage})`
        }));
      default:
        return [];
    }
  };

  const filteredNotes = notes.filter((note) => {
    const matchSearch = note.note?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === "All" || note.related_type === filterType;
    return matchSearch && matchType;
  });

  const getTypeColor = (type) => {
    const colors = {
      'Lead': 'blue',
      'Customer': 'green',
      'Deal': 'orange'
    };
    return colors[type] || 'default';
  };

  const columns = [
    {
      title: "Note",
      dataIndex: "note",
      render: (text) => (
        <div style={{ maxWidth: 400 }}>
          <span style={{ color: "#111827" }}>{text}</span>
        </div>
      ),
    },
    {
      title: "Related To",
      key: "related",
      render: (_, record) => (
        <div>
          <Tag color={getTypeColor(record.related_type)}>{record.related_type}</Tag>
          <span style={{ color: "#6b7280", marginLeft: 8 }}>
            #{record.related_id}
          </span>
        </div>
      ),
    },
    {
      title: "Created By",
      key: "creator",
      render: (_, record) => (
        <span style={{ color: "#4b5563" }}>
          {record.creator?.name || 'Unknown'}
        </span>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      render: (date) => (
        <span style={{ color: "#4b5563" }}>
          {date ? dayjs(date).format('MMM DD, YYYY HH:mm') : 'N/A'}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete note"
            description="Are you sure you want to delete this note?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const cardAnimation = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
    })
  };

  return (
    <div style={{ padding: "24px", minHeight: "100vh", background: "#f5f6f8" }}>
      {loading && !notes.length ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
            <Col>
              <Title level={2} style={{ margin: 0 }}>Notes</Title>
              <Text type="secondary">Add notes to leads, customers, and deals</Text>
            </Col>
            <Col>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ height: 40, borderRadius: 8 }}
                onClick={handleAddNew}
              >
                Add Note
              </Button>
            </Col>
          </Row>

          {/* STATS */}
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {[
              { title: "Total Notes", count: notes.length, color: "#1677ff", icon: <FileTextOutlined /> },
              { title: "Lead Notes", count: notes.filter(n => n.related_type === 'Lead').length, color: "#3b82f6" },
              { title: "Customer Notes", count: notes.filter(n => n.related_type === 'Customer').length, color: "#10b981" },
              { title: "Deal Notes", count: notes.filter(n => n.related_type === 'Deal').length, color: "#f59e0b" },
            ].map((item, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <motion.div
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  variants={cardAnimation}
                >
                  <Card style={{ borderRadius: 12, borderTop: `4px solid ${item.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8, color: "#111827" }}>
                      {item.count}
                    </div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* FILTERS */}
          <Card style={{ borderRadius: 12, marginBottom: 20 }}>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} sm={12}>
                <Input
                  placeholder="Search notes..."
                  prefix={<SearchOutlined style={{ color: "#9ca3af" }} />}
                  style={{ height: 40, borderRadius: 8 }}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {["All", "Lead", "Customer", "Deal"].map((type) => (
                    <Button
                      key={type}
                      type={filterType === type ? "primary" : "default"}
                      onClick={() => setFilterType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>

          {/* NOTES TABLE */}
          <Card variant="borderless" style={{ borderRadius: 14, boxShadow: "0 6px 18px rgba(15,23,42,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 16, fontWeight: 600, color: "#111827" }}>
                Notes List ({filteredNotes.length})
              </span>
            </div>
            <ResponsiveTable
              columns={columns}
              dataSource={filteredNotes}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              renderMobileCard={(record) => {
                const typeColors = {
                  'Lead': 'blue',
                  'Customer': 'green',
                  'Deal': 'orange'
                };
                
                return (
                  <div>
                    {/* Note Header */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                      <FileTextOutlined style={{ color: "#1677ff", fontSize: 18, marginTop: 2 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, color: "#111827", lineHeight: 1.5 }}>
                          {record.note}
                        </div>
                      </div>
                    </div>

                    {/* Note Details */}
                    <div style={{ marginBottom: 12, paddingLeft: 8 }}>
                      <div style={{ marginBottom: 6 }}>
                        <Tag color={typeColors[record.related_type] || 'default'}>
                          {record.related_type}
                        </Tag>
                        <span style={{ color: "#6b7280", marginLeft: 8 }}>
                          #{record.related_id}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563", marginBottom: 4 }}>
                        <strong>Created By:</strong> {record.creator?.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: 13, color: "#4b5563" }}>
                        <strong>Created:</strong> {record.created_at ? dayjs(record.created_at).format('MMM DD, YYYY HH:mm') : 'N/A'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                      >
                        Edit
                      </Button>
                      <Popconfirm
                        title="Delete note"
                        description="Are you sure?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button type="link" size="small" danger icon={<DeleteOutlined />}>
                          Delete
                        </Button>
                      </Popconfirm>
                    </div>
                  </div>
                );
              }}
            />
          </Card>
        </>
      )}

      {/* ADD/EDIT MODAL */}
      <Modal
        title={editingNote ? "Edit Note" : "Add Note"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingNote(null);
          setRelatedType(null);
          form.resetFields();
        }}
        footer={null}
        centered
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                label="Related To" 
                name="related_type" 
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Select 
                  placeholder="Select type"
                  onChange={handleRelatedTypeChange}
                >
                  <Option value="Lead">Lead</Option>
                  <Option value="Customer">Customer</Option>
                  <Option value="Deal">Deal</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                label="Related Record" 
                name="related_id" 
                rules={[{ required: true, message: 'Please select record' }]}
              >
                <Select 
                  placeholder={relatedType ? `Select ${relatedType}` : "Select type first"}
                  disabled={!relatedType}
                  showSearch
                  optionFilterProp="label"
                  options={getRelatedOptions()}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item 
            label="Note" 
            name="note" 
            rules={[{ required: true, message: 'Please enter note' }]}
          >
            <TextArea rows={6} placeholder="Enter your note here..." />
          </Form.Item>

          <Row gutter={10}>
            <Col span={12}>
              <Button 
                block 
                onClick={() => {
                  setModalOpen(false);
                  setEditingNote(null);
                  setRelatedType(null);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
            </Col>
            <Col span={12}>
              <Button type="primary" block htmlType="submit">
                {editingNote ? 'Update' : 'Create'} Note
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}

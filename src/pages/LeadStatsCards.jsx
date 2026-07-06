import React from "react";
import { Row, Col, Card } from "antd";
import { motion } from "framer-motion";
import {
    Users,
    UserPlus,
    UserCheck,
    Crown,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

export default function LeadStatsCards({ leads }) {
    const cardAnimation = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut",
            },
        }),
    };

    const stats = [
        {
            title: "Total Leads",
            count: leads.length,
            color: "#6366f1",
            icon: <Users size={22} />,
            trend: "+12.5%",
            isUp: true,
        },
        {
            title: "New Leads",
            count: leads.filter((l) => l.status === "New").length,
            color: "#3b82f6",
            icon: <UserPlus size={22} />,
            trend: "+5.2%",
            isUp: true,
        },
        {
            title: "Qualified",
            count: leads.filter((l) => l.status === "Qualified").length,
            color: "#f97316",
            icon: <UserCheck size={22} />,
            trend: "-2.4%",
            isUp: false,
        },
        {
            title: "Deals Won",
            count: leads.filter((l) => l.status === "Won").length,
            color: "#10b981",
            icon: <Crown size={22} />,
            trend: "+8.1%",
            isUp: true,
        },
    ];

    return (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            {stats.map((item, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <motion.div
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        variants={cardAnimation}
                    >
                        <Card
                            variant="borderless"
                            style={{
                                borderRadius: 16,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                                overflow: "hidden",
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 600,
                                            color: "#9ca3af",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                        }}
                                    >
                                        {item.title}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 28,
                                            fontWeight: 700,
                                            marginTop: 4,
                                            color: "#111827",
                                        }}
                                    >
                                        {item.count}
                                    </div>

                                    <div className="flex items-center mt-3 text-[11px] font-medium">
                                        <span
                                            className={`flex items-center gap-0.5 ${item.isUp ? "text-green-500" : "text-red-500"
                                                }`}
                                        >
                                            {item.isUp ? (
                                                <TrendingUp size={12} />
                                            ) : (
                                                <TrendingDown size={12} />
                                            )}
                                            {item.trend}
                                        </span>

                                        <span className="text-gray-400 ml-1.5">
                                            vs last 30 days
                                        </span>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 12,
                                        backgroundColor: `${item.color}15`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: item.color,
                                    }}
                                >
                                    {item.icon}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
            ))}
        </Row>
    );
}
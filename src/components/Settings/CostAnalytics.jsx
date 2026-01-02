import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../services/api';
import './Settings.css';

const CostAnalytics = ({ llmSettings }) => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/analytics/costs');
            setAnalytics(data);
        } catch (err) {
            console.error('Error fetching cost analytics:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCost = (cost) => {
        if (cost === 0) return '$0.00';
        if (cost < 0.01) return '<$0.01';
        return '$' + cost.toFixed(2);
    };

    const formatTokens = (tokens) => {
        if (!tokens) return '0';
        if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + 'M';
        if (tokens >= 1000) return (tokens / 1000).toFixed(1) + 'K';
        return tokens.toString();
    };

    const formatMonth = (monthStr) => {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        const monthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{formatMonth(data.month)}</p>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                        🔵 Token Input: <strong>{formatTokens(data.input_tokens)}</strong>
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                        🟢 Token Output: <strong>{formatTokens(data.output_tokens)}</strong>
                    </p>
                    <p style={{ margin: '4px 0', fontSize: '13px', color: '#666' }}>
                        📊 Totale: <strong>{formatTokens(data.total_tokens)}</strong>
                    </p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#333' }}>
                        💰 Costo: <strong style={{ color: 'var(--success)' }}>{formatCost(data.cost)}</strong>
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="settings-card">
                <p>Caricamento analytics...</p>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="settings-card">
                <p>Errore nel caricamento dei dati analytics</p>
            </div>
        );
    }

    return (
        <div className="cost-analytics">
            {/* Summary Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <div className="analytics-card">
                    <div className="analytics-card-title">📅 Oggi</div>
                    <div className="analytics-card-value">{formatCost(analytics.today.cost)}</div>
                    <div className="analytics-card-subtitle">
                        {formatTokens(analytics.today.total_tokens)} token
                    </div>
                    <div className="analytics-card-detail">
                        In: {formatTokens(analytics.today.input_tokens)} |
                        Out: {formatTokens(analytics.today.output_tokens)}
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">📆 Questo Mese</div>
                    <div className="analytics-card-value">{formatCost(analytics.this_month.cost)}</div>
                    <div className="analytics-card-subtitle">
                        {formatTokens(analytics.this_month.total_tokens)} token
                    </div>
                    <div className="analytics-card-detail">
                        In: {formatTokens(analytics.this_month.input_tokens)} |
                        Out: {formatTokens(analytics.this_month.output_tokens)}
                    </div>
                </div>

                <div className="analytics-card">
                    <div className="analytics-card-title">📊 Totale</div>
                    <div className="analytics-card-value">{formatCost(analytics.total.cost)}</div>
                    <div className="analytics-card-subtitle">
                        {formatTokens(analytics.total.total_tokens)} token
                    </div>
                    <div className="analytics-card-detail">
                        In: {formatTokens(analytics.total.input_tokens)} |
                        Out: {formatTokens(analytics.total.output_tokens)}
                    </div>
                </div>
            </div>

            {/* Monthly Bar Chart */}
            {analytics.monthly_data && analytics.monthly_data.length > 0 && (
                <div className="settings-card" style={{ padding: '24px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '16px' }}>📈 Costi Mensili</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={analytics.monthly_data}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="month"
                                tickFormatter={formatMonth}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                            />
                            <YAxis
                                tickFormatter={(value) => formatCost(value)}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar
                                dataKey="cost"
                                fill="var(--color-gradient-start, #667eea)"
                                name="Costo ($)"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
};

export default CostAnalytics;

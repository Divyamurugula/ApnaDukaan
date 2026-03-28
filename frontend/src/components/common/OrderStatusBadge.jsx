import React from 'react';

const statusConfig = {
  pending:          { label: 'Pending',          color: 'bg-yellow-100 text-yellow-700' },
  confirmed:        { label: 'Confirmed',         color: 'bg-blue-100 text-blue-700' },
  packed:           { label: 'Packed',            color: 'bg-purple-100 text-purple-700' },
  out_for_delivery: { label: 'Out for Delivery',  color: 'bg-orange-100 text-orange-700' },
  delivered:        { label: 'Delivered',         color: 'bg-green-100 text-green-700' },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-100 text-red-700' },
  assigned:         { label: 'Assigned',          color: 'bg-gray-100 text-gray-600' },
  picked_up:        { label: 'Picked Up',         color: 'bg-indigo-100 text-indigo-700' },
  in_transit:       { label: 'In Transit',        color: 'bg-cyan-100 text-cyan-700' },
  failed:           { label: 'Failed',            color: 'bg-red-100 text-red-700' },
};

const OrderStatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`badge text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};

export default OrderStatusBadge;

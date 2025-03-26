import { useLocation } from "react-router-dom";

const OrderDetailPage = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;

  if (!orderId) {
    return <p className="text-red-500">Error: No order selected</p>;
  }

  return <div>OrderDetailPage, order id: {orderId}</div>;
};

export default OrderDetailPage;

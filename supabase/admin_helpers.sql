-- ============================================================
-- WAFFLE WALA - ADMIN DASHBOARD HELPERS
-- ============================================================

-- Function to get the number of repeat customers
-- Defined as customers who have more than 1 paid/confirmed order.
CREATE OR REPLACE FUNCTION get_repeat_customer_count()
RETURNS INTEGER AS $$
DECLARE
  repeat_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO repeat_count
  FROM (
    SELECT customer_phone
    FROM orders
    JOIN payments ON orders.id = payments.order_id
    WHERE payments.status = 'paid'
    GROUP BY customer_phone
    HAVING COUNT(orders.id) > 1
  ) AS repeat_customers;
  
  RETURN repeat_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to service role (and anon/authenticated if needed for internal dashboards)
GRANT EXECUTE ON FUNCTION get_repeat_customer_count() TO service_role;
GRANT EXECUTE ON FUNCTION get_repeat_customer_count() TO anon, authenticated;

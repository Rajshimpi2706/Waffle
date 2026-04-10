import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function diagnose() {
  console.log('--- Diagnosing "1" Phone Issue ---');

  // Check Customers
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .select('id, full_name, phone')
    .eq('phone', '1');

  if (custError) {
    console.error('Error fetching customers:', custError);
  } else {
    console.log(`Found ${customers?.length || 0} customers with phone = "1"`);
    if (customers && customers.length > 0) {
      console.log('Sample IDs:', customers.map(c => c.id));
    }
  }

  // Check Orders (shipping_address field)
  const { data: orders, error: orderError } = await supabase
    .from('orders')
    .select('id, order_number, shipping_address');

  if (orderError) {
     console.error('Error fetching orders:', orderError);
  } else {
    const problematicOrders = orders?.filter(o => 
      o.shipping_address?.phone === '1' || o.shipping_address?.phone === 1
    );
    console.log(`Found ${problematicOrders?.length || 0} orders with phone = "1" in shipping_address`);
    if (problematicOrders && problematicOrders.length > 0) {
      console.log('Sample Numbers:', problematicOrders.map(o => o.order_number));
    }
  }

  console.log('--- Diagnosis Complete ---');
}

diagnose();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== Checking partner_id = 1 data ===\n');

  // 1. Customers
  const customers = await prisma.customers.findMany({
    where: { partner_id: 1 },
    take: 5,
  });
  console.log('Customers:', customers.length);
  customers.forEach(c => {
    console.log(`  - ID: ${c.id}, Name: ${c.customer_name}`);
  });

  if (customers.length === 0) {
    console.log('\nNo customers found for partner_id = 1');
    return;
  }

  // 2. Orders
  const orders = await prisma.orders.findMany({
    where: {
      quotations: {
        diagnosis_requests: {
          customers: {
            partner_id: 1,
          },
        },
      },
    },
    include: {
      quotations: {
        include: {
          diagnosis_requests: {
            include: {
              customers: true,
            },
          },
        },
      },
    },
    take: 5,
  });
  console.log('\nOrders:', orders.length);
  orders.forEach(o => {
    console.log(`  - Order ID: ${o.id}, Customer: ${o.quotations.diagnosis_requests.customers.customer_name}`);
  });

  // 3. Customer Invoices
  const invoices = await prisma.customer_invoices.findMany({
    where: {
      order: {
        quotations: {
          diagnosis_requests: {
            customers: {
              partner_id: 1,
            },
          },
        },
      },
    },
    include: {
      order: {
        include: {
          quotations: {
            include: {
              diagnosis_requests: {
                include: {
                  customers: true,
                },
              },
            },
          },
        },
      },
    },
  });
  console.log('\nCustomer Invoices:', invoices.length);
  invoices.forEach(inv => {
    console.log(`  - Invoice ID: ${inv.id}, Number: ${inv.invoice_number}, Customer: ${inv.order.quotations.diagnosis_requests.customers.customer_name}`);
  });

  if (invoices.length === 0 && orders.length > 0) {
    console.log('\n=== Creating test invoice for first order ===');
    const firstOrder = orders[0];
    
    const newInvoice = await prisma.customer_invoices.create({
      data: {
        invoice_number: `INV-${Date.now()}`,
        order_id: firstOrder.id,
        issue_date: new Date(),
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
        total_amount: 1000000,
        tax_amount: 100000,
        grand_total: 1100000,
        status: 'UNPAID',
        invoice_items: {
          create: [
            {
              description: '外壁塗装工事',
              quantity: 1,
              unit: '式',
              unit_price: 800000,
              amount: 800000,
            },
            {
              description: '足場設置・撤去',
              quantity: 1,
              unit: '式',
              unit_price: 200000,
              amount: 200000,
            },
          ],
        },
      },
    });
    console.log('Created invoice:', newInvoice.id, newInvoice.invoice_number);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());


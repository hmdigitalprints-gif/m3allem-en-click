const fs = require('fs');
const path = require('path');

function replaceFile(file, regex, replacement) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
}

// 1. Remove "Export orders report" from OrdersView.tsx
replaceFile('src/components/admin/views/OrdersView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\('Exporting orders report\.\.\.'\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// Remove "Reviewing high risk alerts" string or button from FraudMonitoringView
replaceFile('src/components/admin/views/FraudMonitoringView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\('Reviewing high risk alerts\.\.\.'\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
replaceFile('src/components/admin/views/FraudMonitoringView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\(`Taking action on alert[^`]+`\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// Remove "Managing settings for city"
replaceFile('src/components/admin/views/CitiesView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\(`Managing settings for \$\{city\.name\}\.\.\.`\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// SubscriptionsView
replaceFile('src/components/admin/views/SubscriptionsView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\(`Editing \$\{plan\.name\} plan\.\.\.`\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
replaceFile('src/components/admin/views/SubscriptionsView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\(`Viewing users for \$\{plan\.name\} plan\.\.\.`\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// OrdersView viewing details
replaceFile('src/components/admin/views/OrdersView.tsx', 
  /<\s*button[^>]*onClick=\{\(e\)\s*=>\s*\{?\s*e\.stopPropagation\(\);\s*onAction\?\.\(`Viewing details for order \$\{order\.id\}\.\.\.`\);\s*\}?\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// DisputesView Reviewing high priority
replaceFile('src/components/admin/views/DisputesView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\('Reviewing high priority disputes\.\.\.'\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// ArtisansView Toggling featured status
replaceFile('src/components/admin/views/ArtisansView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*\{\s*e\.stopPropagation\(\);\s*onAction\?\.\(`Toggling featured status for \$\{artisan\.name\}\.\.\.`\);\s*\}\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// UsersView Managing permissions
replaceFile('src/components/admin/views/UsersView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\(`Managing permissions for \$\{user\.name\}\.\.\.`\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// AnalyticsView Generating analytics report
replaceFile('src/components/admin/views/AnalyticsView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\('Generating analytics report\.\.\.'\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// PaymentsView Generating financial report
replaceFile('src/components/admin/views/PaymentsView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\('Generating financial report\.\.\.'\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');
// AdminManagementView Managing permissions
replaceFile('src/components/admin/views/AdminManagementView.tsx', 
  /<\s*button[^>]*onClick=\{\(\)\s*=>\s*onAction\?\.\(`Managing permissions for \$\{admin\.name\}\.\.\.`\)\}[^>]*>[\s\S]*?<\/button>/, 
  '');

console.log('Fake buttons removed');

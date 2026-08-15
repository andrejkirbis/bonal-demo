<?php
// Copy this file to smtp_config.php on Domenca and fill in your real values.
// smtp_config.php is in .gitignore — credentials are never committed to git.
return [
    'host'     => 'mail.storitve-bonal.com', // SMTP hostname from cPanel → Email Accounts → Connect Devices
    'port'     => 465,                        // 465 = SSL/TLS  |  587 = STARTTLS
    'username' => 'info@storitve-bonal.com',  // Always the full email address
    'password' => 'REPLACE_WITH_EMAIL_PASSWORD', // The password you set for this mailbox in cPanel
    'from'     => 'info@storitve-bonal.com',
    'to'       => 'info@storitve-bonal.com',
];
